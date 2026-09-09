import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayersFilterBar } from "@/components/players-filter-bar";
import { PaginationBar } from "@/components/pagination-bar";
import { searchPlayers } from "@/lib/queries";

const PAGE_SIZE = 25;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PlayersPage(props: PageProps<"/players">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const position = typeof sp.position === "string" ? sp.position : "all";
  const page = Math.max(1, Number(sp.page) || 1);

  const { players, total } = await searchPlayers({ q, position, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Players</h1>
        <p className="text-muted-foreground">
          {total.toLocaleString()} drafted players — search by name or filter by position.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Results update as you type</CardDescription>
        </CardHeader>
        <CardContent>
          <PlayersFilterBar q={q} position={position} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Drafted</TableHead>
                <TableHead className="text-right">GP</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => {
                const pick = first(p.draft_picks);
                const stats = first(p.player_stats);
                const team = first(pick?.team);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/players/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.primary_position ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>{p.nationality ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {pick ? (
                        <>
                          {pick.year} · #{pick.overall_pick} · {team?.name ?? "—"}
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{stats?.games_played ?? "—"}</TableCell>
                    <TableCell className="text-right">{stats?.points ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No players match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar page={page} totalPages={totalPages} />
        </CardContent>
      </Card>
    </div>
  );
}
