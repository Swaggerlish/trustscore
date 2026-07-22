from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

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
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Document verification failed: {exc}") from exc
