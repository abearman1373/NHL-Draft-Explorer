"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  C: { label: "Center", color: "var(--chart-1)" },
  LW: { label: "Left Wing", color: "var(--chart-2)" },
  RW: { label: "Right Wing", color: "var(--chart-3)" },
  D: { label: "Defense", color: "var(--chart-4)" },
  G: { label: "Goalie", color: "var(--chart-5)" },
  Other: { label: "Other", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

type YearRow = { year: number } & Partial<Record<string, number>>;

export function PicksPerYearChart({ data }: { data: YearRow[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        {Object.keys(chartConfig).map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stackId="1"
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.35}
          />
        ))}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
