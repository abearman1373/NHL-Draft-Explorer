"""Fits the draft-pick equity + similarity pipeline on nhldraft.csv and
dumps a bundle (dict) to pipeline.joblib.

Run from the python/ directory:
    python build_pipeline.py
"""

from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from pipeline_def import PickEquityTransformer

HERE = Path(__file__).parent
CSV_PATH = HERE.parent / "nhldraft.csv"
ARTIFACT_PATH = HERE / "pipeline.joblib"

FEATURE_COLS = ["overall_pick", "age", "year", "point_shares"]
DISPLAY_COLS = [
    "player",
    "team",
    "position",
    "nationality",
    "amateur_team",
    "year",
    "overall_pick",
    "age",
    "to_year",
    "games_played",
    "goals",
    "assists",
    "points",
    "point_shares",
]

N_NEIGHBORS = 10


def build():
    df = pd.read_csv(CSV_PATH)

    fit_df = df[FEATURE_COLS].dropna()
    documents_df = df.loc[fit_df.index, DISPLAY_COLS].reset_index(drop=True)
    fit_df = fit_df.reset_index(drop=True)

    pipeline = Pipeline(
        steps=[
            ("equity", PickEquityTransformer(pick_col="overall_pick", value_col="point_shares")),
            ("scaler", StandardScaler()),
            ("nn", NearestNeighbors(n_neighbors=N_NEIGHBORS, metric="euclidean")),
        ]
    )
    pipeline.fit(fit_df)

    documents = documents_df.where(pd.notna(documents_df), None).to_dict(orient="records")

    metadata = {
        "steps": [name for name, _ in pipeline.steps],
        "built_at": datetime.now(timezone.utc).isoformat(),
        "sklearn_version": sklearn.__version__,
        "n_samples": len(documents),
        "n_neighbors_fitted": N_NEIGHBORS,
        "input_features": ["overall_pick", "age", "year"],
        "learned_feature_columns": ["overall_pick", "age", "year", "expected_equity"],
        "value_col": "point_shares",
        "year_range": [int(fit_df["year"].min()), int(fit_df["year"].max())],
        "overall_pick_range": [int(fit_df["overall_pick"].min()), int(fit_df["overall_pick"].max())],
        "n_equity_buckets": len(pipeline.named_steps["equity"].equity_table_),
    }

    bundle = {
        "pipeline": pipeline,
        "documents": documents,
        "metadata": metadata,
    }

    joblib.dump(bundle, ARTIFACT_PATH)
    print(f"Wrote {ARTIFACT_PATH} ({ARTIFACT_PATH.stat().st_size} bytes)")
    print(metadata)


if __name__ == "__main__":
    build()
