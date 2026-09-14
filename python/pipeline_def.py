"""Custom scikit-learn transformer used by the draft-pick equity pipeline.

Must be importable from both serve.py (local/Modal) and build_pipeline.py,
and must be present in the Modal image so joblib.load can unpickle it.
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class PickEquityTransformer(BaseEstimator, TransformerMixin):
    """Appends an ``expected_equity`` column: the historical mean of
    ``value_col`` observed for each distinct ``pick_col`` value at fit time.

    This is a real learned lookup table (``equity_table_``), not a fixed
    formula -- refitting on a different slice of the draft produces a
    different table, so the fitted pipeline cannot be recreated from
    scratch without the training data.
    """

    def __init__(self, pick_col="overall_pick", value_col="point_shares"):
        self.pick_col = pick_col
        self.value_col = value_col

    def fit(self, X, y=None):
        df = pd.DataFrame(X)
        valid = df[[self.pick_col, self.value_col]].dropna()
        self.equity_table_ = valid.groupby(self.pick_col)[self.value_col].mean().to_dict()
        self.global_mean_ = float(valid[self.value_col].mean())
        known_picks = np.array(sorted(self.equity_table_.keys()), dtype=float)
        self.known_picks_ = known_picks
        self.known_values_ = np.array(
            [self.equity_table_[p] for p in sorted(self.equity_table_.keys())],
            dtype=float,
        )
        return self

    def transform(self, X):
        df = pd.DataFrame(X).copy()
        picks = df[self.pick_col].to_numpy(dtype=float)
        expected = np.array([self._lookup(p) for p in picks], dtype=float)
        if self.value_col in df.columns:
            df = df.drop(columns=[self.value_col])
        df["expected_equity"] = expected
        return df.to_numpy(dtype=float)

    def _lookup(self, pick):
        if len(self.known_picks_) == 0:
            return self.global_mean_
        if pick in self.equity_table_:
            return self.equity_table_[pick]
        idx = int(np.abs(self.known_picks_ - pick).argmin())
        return float(self.known_values_[idx])

    def get_feature_names_out(self, input_features=None):
        base = list(input_features) if input_features is not None else [self.pick_col]
        base = [c for c in base if c != self.value_col]
        return np.array(base + ["expected_equity"])
