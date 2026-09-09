import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeam } from "@/lib/queries";

export default async function TeamPage(props: PageProps<"/teams/[id]">) {
  const { id } = await props.params;
  const { team, picks } = await getTeam(Number(id));
  if (!team) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to teams
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Draft history</CardTitle>
          <CardDescription>{picks.length} picks, most recent first</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead className="w-16">Pick</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>Nationality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picks.map((pick) => (
                <TableRow key={pick.id}>
                  <TableCell>
                    <Link href={`/draft/${pick.year}`} className="hover:underline">
                      {pick.year}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{pick.overall_pick}</TableCell>
                  <TableCell className="font-medium">
                    {pick.player ? (
                      <Link href={`/players/${pick.player.id}`} className="hover:underline">
                        {pick.player.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {pick.player?.primary_position && (
                      <Badge variant="secondary">{pick.player.primary_position}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{pick.player?.nationality ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
