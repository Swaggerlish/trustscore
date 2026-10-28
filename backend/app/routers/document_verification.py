from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from google.genai.errors import APIError

from app.schemas.document_verification import DocumentVerificationResponse
from app.services.document_verification_service import verify_document

router = APIRouter(prefix="/assessment", tags=["Assessment"])
MAX_FILE_SIZE = 15 * 1024 * 1024


@router.post("/verify-document", response_model=DocumentVerificationResponse)
async def verify_uploaded_document(
    file: UploadFile = File(...),
    section: str = Form(...),
    vendor_claims: str = Form(...),
) -> DocumentVerificationResponse:
    content = await file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 15MB.")
    try:
        claims = json.loads(vendor_claims)
        if not isinstance(claims, dict):
            raise ValueError("Vendor claims must be a JSON object.")
        return await asyncio.to_thread(
            verify_document,
            filename=file.filename or "document",
            content=content,
            section=section,
            vendor_claims=claims,
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail="Vendor claims are not valid JSON.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except APIError as exc:
        upstream_status = exc.code if 400 <= exc.code < 600 else 502
        if upstream_status == 429:
            detail = "Gemini API rate limit reached. Please try again later or check the free-tier quota."
        elif upstream_status == 503:
            detail = "Gemini is temporarily unavailable due to capacity. Please retry in a few seconds."
        elif upstream_status in {401, 403}:
            detail = "The Gemini API key is invalid or cannot access this model. Check GEMINI_API_KEY."
        else:
            detail = f"Gemini API request failed with status {upstream_status}."
        raise HTTPException(status_code=upstream_status, detail=detail) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Document verification failed: {exc}") from exc
