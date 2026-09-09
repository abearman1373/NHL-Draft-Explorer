import Link from "next/link";
import { ArrowRight, Trophy, Users, Shield, CalendarRange } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  getOverviewStats,
  getPositionBreakdown,
  getPicksPerYearByPosition,
  getPickValueByRound,
} from "@/lib/queries";
import { PositionPieChart } from "@/components/charts/position-pie-chart";
import { PicksPerYearChart } from "@/components/charts/picks-per-year-chart";
import { RoundValueChart } from "@/components/charts/round-value-chart";

export default async function HomePage() {
  const [stats, positions, picksPerYear, roundValue] = await Promise.all([
    getOverviewStats(),
    getPositionBreakdown(),
    getPicksPerYearByPosition(),
    getPickValueByRound(),
  ]);

  const kpis = [
    { label: "Draft picks", value: stats.pickCount.toLocaleString(), icon: Trophy },
    { label: "Players drafted", value: stats.playerCount.toLocaleString(), icon: Users },
    { label: "NHL teams", value: stats.teamCount.toLocaleString(), icon: Shield },
    { label: "Draft years", value: `${stats.yearMin}–${stats.yearMax}`, icon: CalendarRange },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <section className="space-y-4 py-6 text-center sm:py-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          🏒 NHL Entry Draft, {stats.yearMin}–{stats.yearMax}
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
          {stats.pickCount.toLocaleString()} draft picks, {stats.playerCount.toLocaleString()} players,
          and {stats.teamCount} franchises — browse every draft class, search any player, and see which
          rounds have historically delivered the most value.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/players" className={buttonVariants({})}>
            Browse players <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link href={`/draft/${stats.yearMax}`} className={buttonVariants({ variant: "outline" })}>
            View {stats.yearMax} draft
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Picks by position</CardTitle>
            <CardDescription>Share of all drafted players, by primary position</CardDescription>
          </CardHeader>
          <CardContent>
            <PositionPieChart data={positions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Best value by round</CardTitle>
            <CardDescription>Average career point shares per pick, rounds 1–10</CardDescription>
          </CardHeader>
          <CardContent>
            <RoundValueChart data={roundValue} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Draft picks per year, by position</CardTitle>
            <CardDescription>How position mix has shifted across draft classes</CardDescription>
          </CardHeader>
          <CardContent>
            <PicksPerYearChart data={picksPerYear} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
