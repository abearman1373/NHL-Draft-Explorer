import Link from "next/link";
import { notFound } from "next/navigation";

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
import { YearPicker } from "@/components/year-picker";
import { getDraftPicksForYear, getYearRange } from "@/lib/queries";

export default async function DraftYearPage(props: PageProps<"/draft/[year]">) {
  const { year: yearParam } = await props.params;
  const year = Number(yearParam);
  const { min, max } = await getYearRange();

  if (!Number.isInteger(year) || year < min || year > max) notFound();

  const picks = await getDraftPicksForYear(year);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{year} NHL Entry Draft</h1>
          <p className="text-muted-foreground">{picks.length} picks · jump to any draft year</p>
        </div>
        <YearPicker year={year} min={min} max={max} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft board</CardTitle>
          <CardDescription>In order of overall pick</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pick</TableHead>
                <TableHead className="w-16">Rd</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead>Nationality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picks.map((pick) => (
                <TableRow key={pick.id}>
                  <TableCell className="font-mono text-muted-foreground">{pick.overall_pick}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{pick.round}</TableCell>
                  <TableCell>
                    {pick.team ? (
                      <Link href={`/teams/${pick.team.id}`} className="hover:underline">
                        {pick.team.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
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
