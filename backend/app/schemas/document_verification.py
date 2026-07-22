from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ClaimVerification(BaseModel):
    claim: str
    verdict: Literal["supported", "partially_supported", "contradicted", "not_found"]
    evidence: str = ""
    explanation: str = ""


class DocumentVerificationResponse(BaseModel):
    section: str
    filename: str
    model: str
    overall_verdict: Literal["supported", "mixed", "contradicted", "insufficient_evidence"]
    confidence: float = Field(..., ge=0, le=1)
    summary: str
    claims: list[ClaimVerification]
    warnings: list[str] = Field(default_factory=list)
