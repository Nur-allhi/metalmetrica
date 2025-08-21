
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from "recharts"

import {
  ChartConfig,
  ChartContainer,
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
            label: `${item.type}`,
            color: item.fill,
        }
    });
    return config;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const labelRadius = outerRadius + 20;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill={payload.fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
      {`${payload.type} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};


export default function ProjectSummaryChart({ data }: ProjectSummaryChartProps) {
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
        className="mx-auto aspect-square h-[350px]"
      >
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                <Pie
                    data={data}
                    dataKey="weight"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    strokeWidth={2}
                >
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.type}`} fill={entry.fill} name={entry.type}/>
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}
