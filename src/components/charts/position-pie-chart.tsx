"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const POSITION_LABELS: Record<string, string> = {
  C: "Center",
  LW: "Left Wing",
  RW: "Right Wing",
  D: "Defense",
  G: "Goalie",
  Other: "Other",
};

const chartConfig = {
  C: { label: "Center", color: "var(--chart-1)" },
  LW: { label: "Left Wing", color: "var(--chart-2)" },
  RW: { label: "Right Wing", color: "var(--chart-3)" },
  D: { label: "Defense", color: "var(--chart-4)" },
  G: { label: "Goalie", color: "var(--chart-5)" },
  Other: { label: "Other", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function PositionPieChart({ data }: { data: { position: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: POSITION_LABELS[d.position] ?? d.position,
    fill: chartConfig[d.position as keyof typeof chartConfig]?.color ?? "var(--muted-foreground)",
  }));

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-72">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
        <Pie data={chartData} dataKey="count" nameKey="label" innerRadius={55} strokeWidth={2}>
          {chartData.map((entry) => (
            <Cell key={entry.position} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="label" />} />
      </PieChart>
    </ChartContainer>
  );
}
