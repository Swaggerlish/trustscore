from __future__ import annotations

import io
import json
import os
import re
import time
from pathlib import Path
from typing import Any

from docx import Document
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError
from google.genai import types
from openpyxl import load_workbook
from pypdf import PdfReader

from app.schemas.document_verification import DocumentVerificationResponse

MODEL_ID = "gemini-3.8-flash"
MAX_DOCUMENT_CHARS = 24_000
MAX_GEMINI_ATTEMPTS = 3
SYSTEM_PROMPT = """You are ProcureScore's AI Evidence Verification Engine.

Your task is to verify whether vendor-provided documents support specific trustworthiness claims submitted during AI procurement assessment.

Instructions:

1. Compare each submitted sub-metric against the uploaded document.
2. Verify a claim ONLY if the document contains clear, direct, and meaningful evidence that supports the claim.
3. Do NOT verify a claim based solely on keyword matches.
4. The document must contain a description, policy, procedure, process, implementation detail, measurement approach, or supporting statement relevant to the claim.
5. If evidence is unclear, vague, implied, or absent, mark the claim as unverified.
6. Be conservative. Missing evidence should result in "verified": false.
7. Extract the exact supporting text or a concise evidence summary from the document.
8. If the document contains contradictory information, mark the claim as unverified and explain why.
9. Your role is evidence verification, not risk scoring or recommendation generation.

Output JSON only using this schema:

{
    "verification_results": [
        {
            "submetric": "<name>",
            "verified": true,
            "confidence": 0.95,
            "evidence": "<supporting evidence>",
            "reason": "<explanation>"
        }
    ],
    "overall_document_trustworthiness": "trusted|partially_trusted|untrusted"
}

Trustworthiness Rules:

- trusted:
    Most submitted claims are supported by explicit evidence.

- partially_trusted:
    Some claims are supported but important claims lack evidence.

- untrusted:
    Most claims lack evidence or contain contradictory information.

Do not return anything outside the JSON object."""

load_dotenv(Path(__file__).resolve().parents[3] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def verify_document(
    *, filename: str, content: bytes, section: str, vendor_claims: dict[str, Any]
) -> DocumentVerificationResponse:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "replace_with_your_gemini_api_key":
        raise RuntimeError("GEMINI_API_KEY is not configured in the .env file.")

    document_text = extract_document_text(filename, content)
    if not document_text.strip():
        raise ValueError("No readable text was found in the uploaded document.")

    prompt = _build_prompt(section, vendor_claims, document_text[:MAX_DOCUMENT_CHARS])
    client = genai.Client(api_key=api_key)
    for attempt in range(MAX_GEMINI_ATTEMPTS):
        try:
            completion = client.models.generate_content(
                model=MODEL_ID,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.1,
                    max_output_tokens=4096,
                    response_mime_type="application/json",
                ),
            )
            break
        except APIError as exc:
            if exc.code not in {429, 503} or attempt == MAX_GEMINI_ATTEMPTS - 1:
                raise
            time.sleep(2**attempt)
    raw = completion.text or ""
    parsed = _normalize_verification_response(_parse_json_response(raw), vendor_claims)
    parsed.update({"section": section, "filename": filename, "model": MODEL_ID})
    return DocumentVerificationResponse.model_validate(parsed)


def extract_document_text(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return "\n".join(page.extract_text() or "" for page in PdfReader(io.BytesIO(content)).pages)
    if suffix == ".docx":
        document = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    if suffix == ".xlsx":
        workbook = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        lines: list[str] = []
        for sheet in workbook.worksheets:
            lines.append(f"Sheet: {sheet.title}")
            for row in sheet.iter_rows(values_only=True):
                lines.append(" | ".join("" if value is None else str(value) for value in row))
        return "\n".join(lines)
    if suffix in {".txt", ".md", ".csv", ".json"}:
        return content.decode("utf-8", errors="replace")
    raise ValueError("Unsupported file type. Use PDF, DOCX, XLSX, TXT, MD, CSV, or JSON.")


def _build_prompt(section: str, claims: dict[str, Any], evidence: str) -> str:
    return f"""Compare every vendor claim with the uploaded evidence.

Section: {section}
Vendor claims (a true checkbox is an explicit claim):
{json.dumps(claims, ensure_ascii=False, indent=2)}

Uploaded evidence:
<document>
{evidence}
</document>

Return one JSON object with exactly this shape:
{{
  "overall_verdict": "supported|mixed|contradicted|insufficient_evidence",
  "confidence": 0.0,
  "summary": "short factual summary",
  "claims": [
    {{"claim": "claim text", "verdict": "supported|partially_supported|contradicted|not_found", "evidence": "short excerpt or location", "explanation": "state exactly what is present or missing"}}
  ],
  "warnings": ["limitations such as missing detail"]
}}
Do not infer support from silence. Use not_found when the document does not address a claim. Use
partially_supported when only part of a claim is evidenced. Never use mixed as an individual claim verdict."""


def _parse_json_response(raw: str) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise RuntimeError("The verification model returned an invalid response.")
        return json.loads(match.group(0))


def _normalize_verification_response(
    parsed: dict[str, Any], vendor_claims: dict[str, Any]
) -> dict[str, Any]:
    """Make provider output safe and preserve incomplete claims for human review."""
    allowed = {"supported", "partially_supported", "contradicted", "not_found"}
    normalized_claims: list[dict[str, str]] = []
    model_claims = parsed.get("claims", [])
    if not model_claims and isinstance(parsed.get("verification_results"), list):
        model_claims = [
            {
                "claim": item.get("submetric"),
                "verdict": (
                    "supported"
                    if item.get("verified") is True
                    else "contradicted"
                    if "contradict" in str(item.get("reason", "")).lower()
                    else "not_found"
                ),
                "evidence": item.get("evidence"),
                "explanation": item.get("reason"),
            }
            for item in parsed["verification_results"]
            if isinstance(item, dict)
        ]

    for item in model_claims:
        if not isinstance(item, dict):
            continue
        verdict = str(item.get("verdict", "not_found")).strip().lower().replace(" ", "_")
        if verdict == "mixed":
            verdict = "partially_supported"
        if verdict not in allowed:
            verdict = "not_found"
        normalized_claims.append({
            "claim": str(item.get("claim") or "Unidentified vendor claim"),
            "verdict": verdict,
            "evidence": str(item.get("evidence") or ""),
            "explanation": str(item.get("explanation") or "The document does not provide enough information to validate this item."),
        })

    if not normalized_claims:
        for key, value in vendor_claims.get("claims", vendor_claims).items():
            normalized_claims.append({
                "claim": f"{key}: {value}",
                "verdict": "not_found",
                "evidence": "",
                "explanation": "The model did not return evidence for this supplied item.",
            })

    parsed["claims"] = normalized_claims
    if "overall_verdict" not in parsed:
        trustworthiness_map = {
            "trusted": "supported",
            "partially_trusted": "mixed",
            "untrusted": "contradicted",
        }
        parsed["overall_verdict"] = trustworthiness_map.get(
            str(parsed.get("overall_document_trustworthiness", "")).lower(),
            "insufficient_evidence",
        )

    overall = str(parsed.get("overall_verdict", "insufficient_evidence")).lower().replace(" ", "_")
    if overall not in {"supported", "mixed", "contradicted", "insufficient_evidence"}:
        parsed["overall_verdict"] = "insufficient_evidence"
    parsed["confidence"] = max(0.0, min(1.0, float(parsed.get("confidence", 0))))
    parsed["summary"] = str(parsed.get("summary") or "Review the individual claim results below.")
    parsed["warnings"] = [str(item) for item in parsed.get("warnings", []) if item]
    return parsed
