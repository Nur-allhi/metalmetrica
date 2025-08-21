
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ProjectSummaryChartProps {
  data: {
    type: string;
    weight: number;
    fill: string;
  }[];
}

const chartConfig = {} as ChartConfig
// Populate chartConfig dynamically based on data
const generateChartConfig = (data: ProjectSummaryChartProps['data']): ChartConfig => {
    const config: ChartConfig = {
         weight: {
            label: "Weight (kg)",
        },
    };
    data.forEach(item => {
        config[item.type] = {
            label: `${item.type}`,
            color: item.fill,
        }
    });
    return config;
}


export default function ProjectSummaryChart({ data }: ProjectSummaryChartProps) {
    const totalWeight = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.weight, 0)
    }, [data])
    
    const dynamicChartConfig = React.useMemo(() => generateChartConfig(data), [data]);


    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 h-48">
                 <p className="text-sm text-muted-foreground">No items to display in chart.</p>
            </div>
        )
    }

  return (
      <ChartContainer
        config={dynamicChartConfig}
        className="mx-auto aspect-square h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        hideLabel 
                        formatter={(value, name) => `${value.toFixed(2)} kg`}
                    />}
                />
                <Pie
                    data={data}
                    dataKey="weight"
                    nameKey="type"
                    innerRadius={50}
                    outerRadius={100}
                    strokeWidth={2}
                >
                    {data.map((entry) => (
                    <Cell key={`cell-${entry.type}`} fill={entry.fill} name={entry.type}/>
                    ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="type" />} />
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}
