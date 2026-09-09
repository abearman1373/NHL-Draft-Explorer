# NHL Draft Explorer (web)

A Next.js + shadcn/ui website for exploring the 1963–2022 NHL Entry Draft —
browse every draft class, search all ~12,000 drafted players, and see which
rounds have historically produced the most value. Data lives in Supabase
across a normalized schema (`teams`, `amateur_teams`, `players`,
`draft_picks`, `player_stats`).

This is the third iteration of the NHL draft project in this repo:
- `assignment-1` — Streamlit app reading the CSV directly
- `assignment-2` — Streamlit app reading from a flat Supabase table, deployed on Modal
- `assignment-3` (this branch) — Next.js + shadcn/ui site reading from a normalized Supabase schema, deployed on Vercel

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

- Vercel: https://nhl-draft-explorer.vercel.app/
- GitHub: https://github.com/abearman1373/NHL-Draft-Explorer/tree/assignment-3
