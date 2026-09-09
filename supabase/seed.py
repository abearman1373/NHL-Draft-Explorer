"""Load nhldraft.csv into the normalized Supabase schema (see schema.sql).

Usage:
    uv run --with pandas --with supabase --with python-dotenv python supabase/seed.py

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
(service role is needed to bypass RLS for the bulk insert).
"""

import os

import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

PRIMARY_POSITIONS = {"C", "LW", "RW", "D", "G"}

NUMERIC_COLS = [
    "age", "to_year", "games_played", "goals", "assists", "points", "plus_minus",
    "penalties_minutes", "goalie_games_played", "goalie_wins", "goalie_losses",
    "goalie_ties_overtime", "save_percentage", "goals_against_average", "point_shares",
]


def chunked(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def clean(value):
    """Convert pandas/numpy NaN to None and whole-number floats (e.g. 18.0, from
    a float64 column that only has integers but was coerced due to NaNs
    elsewhere) to plain ints, since Postgres integer columns reject "18.0"."""
    if value is None:
        return None
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        value = value.item()
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def main():
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    client = create_client(url, key)

    df = pd.read_csv("nhldraft.csv")
    for col in NUMERIC_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["primary_position"] = df["position"].fillna("").str.extract(r"([A-Z]+)")[0]
    df["primary_position"] = df["primary_position"].where(df["primary_position"].isin(PRIMARY_POSITIONS), other="Other")
    df["round"] = ((df["overall_pick"] - 1) // 31) + 1

    print(f"Loaded {len(df)} rows from nhldraft.csv")

    teams = sorted(df["team"].dropna().unique())
    team_rows = [{"name": t} for t in teams]
    client.table("teams").upsert(team_rows, on_conflict="name").execute()
    team_ids = {r["name"]: r["id"] for r in client.table("teams").select("id,name").execute().data}
    print(f"Upserted {len(teams)} teams")

    amateur_teams = sorted(df["amateur_team"].dropna().unique())
    at_rows = [{"name": t} for t in amateur_teams]
    for batch in chunked(at_rows, 500):
        client.table("amateur_teams").upsert(batch, on_conflict="name").execute()
    at_ids = {r["name"]: r["id"] for r in client.table("amateur_teams").select("id,name").execute().data}
    print(f"Upserted {len(amateur_teams)} amateur teams")

    player_rows = []
    for _, row in df.iterrows():
        player_rows.append({
            "id": int(row["id"]),
            "name": clean(row["player"]),
            "nationality": clean(row["nationality"]),
            "position_detail": clean(row["position"]),
            "primary_position": clean(row["primary_position"]),
            "amateur_team_id": at_ids.get(row["amateur_team"]),
        })
    for batch in chunked(player_rows, 500):
        client.table("players").upsert(batch).execute()
    print(f"Upserted {len(player_rows)} players")

    pick_rows = []
    stat_rows = []
    skipped_picks = 0
    for _, row in df.iterrows():
        pid = int(row["id"])
        team_id = team_ids.get(row["team"])
        if team_id is None:
            skipped_picks += 1
        else:
            pick_rows.append({
                "id": pid,
                "year": int(row["year"]),
                "overall_pick": int(row["overall_pick"]),
                "round": int(row["round"]),
                "team_id": team_id,
                "player_id": pid,
            })
        stat_rows.append({
            "player_id": pid,
            "age_at_draft": clean(row["age"]),
            "to_year": clean(row["to_year"]),
            "games_played": clean(row["games_played"]),
            "goals": clean(row["goals"]),
            "assists": clean(row["assists"]),
            "points": clean(row["points"]),
            "plus_minus": clean(row["plus_minus"]),
            "penalties_minutes": clean(row["penalties_minutes"]),
            "goalie_games_played": clean(row["goalie_games_played"]),
            "goalie_wins": clean(row["goalie_wins"]),
            "goalie_losses": clean(row["goalie_losses"]),
            "goalie_ties_overtime": clean(row["goalie_ties_overtime"]),
            "save_percentage": clean(row["save_percentage"]),
            "goals_against_average": clean(row["goals_against_average"]),
            "point_shares": clean(row["point_shares"]),
        })

    for batch in chunked(pick_rows, 500):
        client.table("draft_picks").upsert(batch).execute()
    print(f"Upserted {len(pick_rows)} draft picks ({skipped_picks} skipped: no recorded team)")

    for batch in chunked(stat_rows, 500):
        client.table("player_stats").upsert(batch).execute()
    print(f"Upserted {len(stat_rows)} player stat rows")

    print("Done.")


if __name__ == "__main__":
    main()
