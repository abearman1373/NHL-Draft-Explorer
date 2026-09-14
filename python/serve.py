"""FastAPI service exposing the fitted draft-pick equity/similarity pipeline.

Local dev:
    uvicorn serve:app --reload
    open http://localhost:8000/docs
"""

from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import pipeline_def  # noqa: F401  (needed so joblib can unpickle PickEquityTransformer)

ARTIFACT_PATH = Path(__file__).parent / "pipeline.joblib"

app = FastAPI(title="NHL Draft Pick Equity & Similarity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_bundle = None
_load_error: Optional[str] = None

try:
    _bundle = joblib.load(ARTIFACT_PATH)
except Exception as exc:  # noqa: BLE001 - want to serve 503 for any load failure
    _load_error = f"{type(exc).__name__}: {exc}"


def get_bundle():
    if _bundle is None:
        raise HTTPException(
            status_code=503,
            detail=f"Pipeline artifact is not loaded: {_load_error}",
        )
    return _bundle


class SimilarPicksRequest(BaseModel):
    overall_pick: int = Field(..., ge=1, le=300, description="Overall draft pick number")
    age: float = Field(..., ge=15.0, le=40.0, description="Player age at draft time")
    year: int = Field(..., ge=1963, le=2035, description="Draft year")
    k: int = Field(5, ge=1, le=25, description="Number of similar historical picks to return")


class SimilarPick(BaseModel):
    player: Optional[str]
    team: Optional[str]
    position: Optional[str]
    nationality: Optional[str]
    amateur_team: Optional[str]
    year: Optional[float]
    overall_pick: Optional[float]
    age: Optional[float]
    to_year: Optional[float]
    games_played: Optional[float]
    goals: Optional[float]
    assists: Optional[float]
    points: Optional[float]
    point_shares: Optional[float]
    distance: float


class SimilarPicksResponse(BaseModel):
    query: SimilarPicksRequest
    results: list[SimilarPick]


@app.get("/health")
def health():
    if _bundle is None:
        raise HTTPException(
            status_code=503,
            detail=f"Pipeline artifact is not loaded: {_load_error}",
        )
    return {"status": "ok", "loaded": True}


@app.get("/pipeline-info")
def pipeline_info():
    bundle = get_bundle()
    return bundle["metadata"]


@app.post("/similar-picks", response_model=SimilarPicksResponse)
def similar_picks(req: SimilarPicksRequest):
    bundle = get_bundle()
    pipeline = bundle["pipeline"]
    documents = bundle["documents"]

    query_df = pd.DataFrame([{"overall_pick": req.overall_pick, "age": req.age, "year": req.year}])

    transformed = pipeline[:-1].transform(query_df)
    nn = pipeline.named_steps["nn"]
    k = min(req.k, nn.n_samples_fit_)
    distances, indices = nn.kneighbors(transformed, n_neighbors=k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        record = dict(documents[int(idx)])
        record["distance"] = float(dist)
        results.append(record)

    return {"query": req, "results": results}
