
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
    const radius = outerRadius + 30; // Increased radius for more space
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Adjust x position for labels on the left to give more space
    if (x < cx) {
        x -= 10;
    } else {
        x += 10;
    }


    return (
        <text
            x={x}
            y={y}
            className="fill-foreground text-xs"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
        >
            {`${payload.type} (${(percent * 100).toFixed(0)}%)`}
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
        className="mx-auto aspect-square h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="weight"
                    nameKey="type"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={2}
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
