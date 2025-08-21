
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ProjectSummaryChartProps {
  data: {
    type: string;
    weight: number;
    fill: string;
  }[];
}

const chartConfig = {
  weight: {
    label: "Weight (kg)",
  },
} as ChartConfig

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index, payload }: any) => {
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            className="fill-foreground text-xs"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


export default function ProjectSummaryChart({ data }: ProjectSummaryChartProps) {
    const totalWeight = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.weight, 0)
    }, [data])

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 h-48">
                 <p className="text-sm text-muted-foreground">No items to display in chart.</p>
            </div>
        )
    }

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[200px]"
      >
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="weight"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                    labelLine={true}
                    label={renderCustomizedLabel}
                >
                    {data.map((entry) => (
                    <Cell key={`cell-${entry.type}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}
