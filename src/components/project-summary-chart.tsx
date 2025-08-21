
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ProjectSummaryChartProps {
  data: {
    type: string;
    weight: number;
    fill: string;
  }[];
}

const generateChartConfig = (data: ProjectSummaryChartProps['data']): ChartConfig => {
    const config: ChartConfig = {
         weight: {
            label: "Weight (kg)",
        },
    };
    data.forEach(item => {
        config[item.type] = {
            label: item.type,
            color: item.fill,
        }
    });
    return config;
}


export default function ProjectSummaryChart({ data }: ProjectSummaryChartProps) {
    const dynamicChartConfig = React.useMemo(() => generateChartConfig(data), [data]);
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
        config={dynamicChartConfig}
        className="mx-auto aspect-square h-[350px]"
      >
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="weight"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    labelLine={false}
                    label={({ payload, cornerRadius, tooltipPayload, ...props }) => {
                        const percent = totalWeight > 0 ? (payload.weight / totalWeight) * 100 : 0;
                        return (
                            <text
                                {...props}
                                className="fill-foreground text-sm font-semibold"
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                               {`${percent.toFixed(0)}%`}
                            </text>
                        );
                    }}
                    strokeWidth={2}
                >
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.type}`} fill={entry.fill} name={entry.type}/>
                    ))}
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="-mt-2"
                />
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}
