import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPlayer } from "@/lib/queries";

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value ?? "—"}</p>
    </div>
  );
}

export default async function PlayerPage(props: PageProps<"/players/[id]">) {
  const { id } = await props.params;
  const player = await getPlayer(Number(id));
  if (!player) notFound();

  const pick = first(player.draft_picks);
  const team = first(pick?.team);
  const stats = first(player.player_stats);
  const amateurTeam = first(player.amateur_team);
  const isGoalie = player.primary_position === "G";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <Link href="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to players
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
        {player.primary_position && <Badge variant="secondary">{player.primary_position}</Badge>}
        {player.nationality && <Badge variant="outline">{player.nationality}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft record</CardTitle>
          <CardDescription>How and when this player entered the league</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Year" value={pick?.year} />
          <Stat label="Overall pick" value={pick?.overall_pick} />
          <Stat label="Round" value={pick?.round} />
          <Stat
            label="Team"
            value={
              team ? (
                <Link href={`/teams/${team.id}`} className="hover:underline">
                  {team.name}
                </Link>
              ) : (
                "—"
              )
            }
          />
        </CardContent>
      </Card>

      {amateurTeam?.name && (
        <p className="text-sm text-muted-foreground">
          Drafted out of <span className="font-medium text-foreground">{amateurTeam.name}</span>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Career stats</CardTitle>
          <CardDescription>
            {stats?.to_year ? `Through ${stats.to_year}` : "As recorded in the draft dataset"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats || (stats.games_played == null && stats.goalie_games_played == null) ? (
            <p className="text-sm text-muted-foreground">No NHL stats recorded for this player.</p>
          ) : isGoalie ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Games" value={stats.goalie_games_played} />
              <Stat label="Wins" value={stats.goalie_wins} />
              <Stat label="Losses" value={stats.goalie_losses} />
              <Stat label="Ties/OT" value={stats.goalie_ties_overtime} />
              <Stat label="Save %" value={stats.save_percentage} />
              <Stat label="GAA" value={stats.goals_against_average} />
              <Stat label="Point shares" value={stats.point_shares} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Stat label="Games" value={stats.games_played} />
                <Stat label="Goals" value={stats.goals} />
                <Stat label="Assists" value={stats.assists} />
                <Stat label="Points" value={stats.points} />
              </div>
              <Separator className="my-6" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Stat label="+/-" value={stats.plus_minus} />
                <Stat label="PIM" value={stats.penalties_minutes} />
                <Stat label="Point shares" value={stats.point_shares} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
