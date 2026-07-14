from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.bias import BiasEvaluationRequest, BiasEvaluationResponse
from app.services.bias_service import evaluate_bias

router = APIRouter(prefix="/bias", tags=["Bias & Fairness"])


@router.post("/evaluate", response_model=BiasEvaluationResponse)
def evaluate_bias_endpoint(payload: BiasEvaluationRequest) -> BiasEvaluationResponse:
    try:
        return evaluate_bias(payload)
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown protected group: {exc.args[0]}",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
