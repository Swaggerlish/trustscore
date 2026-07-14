from __future__ import annotations

from io import BytesIO
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Body, HTTPException, Query, status

from app.schemas.dataset_quality import (
    DatasetQualityEvaluationRequest,
    DatasetQualityEvaluationResponse,
)
from app.services.dataset_quality_service import evaluate_dataset_quality

router = APIRouter(prefix="/dataset-quality", tags=["Dataset Quality"])


@router.post("/evaluate", response_model=DatasetQualityEvaluationResponse)
def evaluate_dataset_quality_endpoint(
    payload: DatasetQualityEvaluationRequest,
) -> DatasetQualityEvaluationResponse:
    return evaluate_dataset_quality(payload)


@router.post("/evaluate-csv", response_model=DatasetQualityEvaluationResponse)
def evaluate_dataset_quality_csv_endpoint(
    csv_file: bytes = Body(
        ...,
        media_type="text/csv",
        description="Raw CSV file contents for the current dataset sample.",
    ),
    documented_sources: Annotated[bool, Query()] = False,
    representative_samples: Annotated[bool, Query()] = False,
    data_lineage_available: Annotated[bool, Query()] = False,
    quality_checks_performed: Annotated[bool, Query()] = False,
    licensing_verified: Annotated[bool, Query()] = False,
) -> DatasetQualityEvaluationResponse:
    records = _csv_bytes_to_records(csv_file)
    payload = DatasetQualityEvaluationRequest(
        documented_sources=documented_sources,
        representative_samples=representative_samples,
        data_lineage_available=data_lineage_available,
        quality_checks_performed=quality_checks_performed,
        licensing_verified=licensing_verified,
        records=records,
    )
    return evaluate_dataset_quality(payload)


def _csv_bytes_to_records(csv_file: bytes) -> list[dict]:
    if not csv_file:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CSV file content is required.",
        )

    try:
        dataframe = pd.read_csv(BytesIO(csv_file))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to parse CSV file. Confirm it is valid comma-separated data.",
        ) from exc

    if dataframe.empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CSV file must contain at least one data row.",
        )

    normalized = dataframe.astype(object).where(pd.notna(dataframe), None)
    return normalized.to_dict(orient="records")
