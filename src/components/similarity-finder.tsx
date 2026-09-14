"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Live Modal deployment of the NHL draft-pick equity/similarity pipeline.
// Never localhost -- this calls the deployed FastAPI service directly from the browser.
const API_BASE =
  process.env.NEXT_PUBLIC_SIMILARITY_API_URL ??
  "https://abearman1373--nhl-draft-similarity-api-fastapi-app.modal.run";

type PipelineInfo = {
  steps: string[];
  built_at: string;
  sklearn_version: string;
  n_samples: number;
  overall_pick_range: [number, number];
  year_range: [number, number];
};

type SimilarPick = {
  player: string | null;
  team: string | null;
  position: string | null;
  nationality: string | null;
  year: number | null;
  overall_pick: number | null;
  games_played: number | null;
  points: number | null;
  point_shares: number | null;
  distance: number;
};

type SimilarPicksResponse = {
  results: SimilarPick[];
};

export function SimilarityFinder() {
  const [info, setInfo] = React.useState<PipelineInfo | null>(null);
  const [infoError, setInfoError] = React.useState<string | null>(null);

  const [overallPick, setOverallPick] = React.useState("1");
  const [age, setAge] = React.useState("18");
  const [year, setYear] = React.useState("2024");
  const [k, setK] = React.useState("5");

  const [results, setResults] = React.useState<SimilarPick[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/pipeline-info`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data: PipelineInfo) => setInfo(data))
      .catch((err: Error) => setInfoError(err.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(`${API_BASE}/similar-picks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall_pick: Number(overallPick),
          age: Number(age),
          year: Number(year),
          k: Number(k),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.detail ? JSON.stringify(body.detail) : `API returned ${res.status}`
        );
      }

      const data: SimilarPicksResponse = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Live pipeline:</span>
        {info ? (
          <>
            <Badge variant="secondary">sklearn {info.sklearn_version}</Badge>
            <Badge variant="secondary">{info.n_samples.toLocaleString()} fitted samples</Badge>
            <Badge variant="secondary">
              built {new Date(info.built_at).toLocaleString()}
            </Badge>
          </>
        ) : infoError ? (
          <Badge variant="destructive">API unreachable: {infoError}</Badge>
        ) : (
          <Badge variant="outline">loading…</Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Overall pick</span>
          <Input
            type="number"
            min={1}
            max={300}
            value={overallPick}
            onChange={(e) => setOverallPick(e.target.value)}
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Age</span>
          <Input
            type="number"
            min={15}
            max={40}
            step="0.1"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Draft year</span>
          <Input
            type="number"
            min={1963}
            max={2035}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground"># results</span>
          <Input
            type="number"
            min={1}
            max={25}
            value={k}
            onChange={(e) => setK(e.target.value)}
            required
          />
        </label>
        <div className="col-span-2 sm:col-span-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Find similar picks"}
          </Button>
        </div>
      </form>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {results && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Drafted</TableHead>
                <TableHead className="text-right">GP</TableHead>
                <TableHead className="text-right">Point shares</TableHead>
                <TableHead className="text-right">Distance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.player ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.position ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>{r.team ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.year ?? "—"} · #{r.overall_pick ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{r.games_played ?? "—"}</TableCell>
                  <TableCell className="text-right">{r.point_shares ?? "—"}</TableCell>
                  <TableCell className="text-right">{r.distance.toFixed(3)}</TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
