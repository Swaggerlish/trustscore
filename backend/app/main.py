from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    accountability,
    assessment,
    bias,
    compliance,
    dataset_quality,
    document_verification,
    environmental_impact,
    model_architecture,
    performance,
    privacy,
    robustness,
    transparency,
)

app = FastAPI(
    title="TrustScore AI Procurement Assessment API",
    description="Deterministic governance scoring for AI vendor procurement.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bias.router)
app.include_router(privacy.router)
app.include_router(compliance.router)
app.include_router(accountability.router)
app.include_router(transparency.router)
app.include_router(dataset_quality.router)
app.include_router(model_architecture.router)
app.include_router(robustness.router)
app.include_router(environmental_impact.router)
app.include_router(performance.router)
app.include_router(assessment.router)
app.include_router(document_verification.router)


@app.get("/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
