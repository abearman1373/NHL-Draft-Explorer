# NHL Draft Explorer (web)

A Next.js + shadcn/ui website for exploring the 1963–2022 NHL Entry Draft —
browse every draft class, search all ~12,000 drafted players, and see which
rounds have historically produced the most value. Data lives in Supabase
across a normalized schema (`teams`, `amateur_teams`, `players`,
`draft_picks`, `player_stats`).

This is the fourth iteration of the NHL draft project in this repo:
- `assignment-1` — Streamlit app reading the CSV directly
- `assignment-2` — Streamlit app reading from a flat Supabase table, deployed on Modal
- `assignment-3` — Next.js + shadcn/ui site reading from a normalized Supabase schema, deployed on Vercel
- `Homework-Assignment-4` (this branch) — adds a fitted scikit-learn pipeline served via FastAPI on Modal, wired into a new `/similarity` page on the Vercel site (see [Draft Pick Similarity API](#draft-pick-similarity-api) below)

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [shadcn/ui](https://ui.shadcn.com) components, Tailwind CSS v4
- [Supabase](https://supabase.com) (Postgres) for data
- [Recharts](https://recharts.org) for charts

## Setup

```bash
npm install
```

Create a `.env` file with your Supabase project credentials (never commit this file):

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The `service_role` key is used server-side only (Server Components / Route
Handlers) and is never exposed to the browser.

### Database

1. Run `supabase/schema.sql` in your Supabase project's SQL editor to create
   the tables.
2. Load the dataset:
   ```bash
   uv run --with pandas --with supabase --with python-dotenv python supabase/seed.py
   ```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployed

- Vercel (production): https://nhl-draft-explorer.vercel.app/
- Vercel (this branch's preview): https://nhl-draft-explorer-git-homework-assignment-4-abearman1373.vercel.app/similarity
- GitHub: https://github.com/abearman1373/NHL-Draft-Explorer/tree/Homework-Assignment-4

## Draft Pick Similarity API

`python/` contains a fitted scikit-learn `Pipeline` served through FastAPI
and deployed on Modal, powering the `/similarity` page above. It finds NHL
draft picks with a similar profile to a given pick (e.g. "pick #1, age 18,
2024" surfaces past #1 overall picks like Connor McDavid and Auston
Matthews) — it does not predict labels.

- **Pipeline:** `PickEquityTransformer` (custom, learns each overall pick
  number's historical average career value at fit time) → `StandardScaler`
  → `NearestNeighbors`, fitted on 5,246 draft picks (1963–2022) with
  complete pick/age/year/career-value data.
- **scikit-learn version:** 1.4.2 (pinned in the Modal image to match the
  version recorded in the fitted artifact's metadata).
- **Live API:** https://abearman1373--nhl-draft-similarity-api-fastapi-app.modal.run
- **Docs:** https://abearman1373--nhl-draft-similarity-api-fastapi-app.modal.run/docs

### Files

| File | Purpose |
| --- | --- |
| `python/pipeline_def.py` | Custom `PickEquityTransformer` (BaseEstimator, TransformerMixin) |
| `python/build_pipeline.py` | Fits the pipeline on `nhldraft.csv` and dumps `pipeline.joblib` |
| `python/serve.py` | FastAPI app: `GET /health`, `GET /pipeline-info`, `POST /similar-picks` |
| `python/modal_serve.py` | Modal deployment (`modal deploy modal_serve.py`) |
| `python/postman_collection.json` | Postman collection with assertions against the live Modal URL |

### Rebuilding the artifact

```bash
cd python
pip install -r requirements.txt
python build_pipeline.py   # writes pipeline.joblib
uvicorn serve:app --reload # local dev at http://localhost:8000/docs
```

### Redeploying to Modal

```bash
cd python
modal deploy modal_serve.py
```
