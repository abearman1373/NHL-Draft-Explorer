"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  avgPointShares: { label: "Avg. point shares", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RoundValueChart({ data }: { data: { round: number; avgPointShares: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="round"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `Rd ${v}`}
        />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => `Round ${v}`} />} />
        <Bar dataKey="avgPointShares" fill="var(--color-avgPointShares)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
