"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A line chart with dots";

// Mock data for document trends - can be replaced with API call
const chartData = [
  { month: "Jan", active: 186, archived: 80 },
  { month: "Feb", active: 305, archived: 200 },
  { month: "Mar", active: 237, archived: 120 },
  { month: "Apr", active: 273, archived: 190 },
  { month: "May", active: 209, archived: 130 },
  { month: "Jun", active: 214, archived: 140 },
];

const chartConfig = {
  active: {
    label: "Active",
    color: "var(--chart-1)",
  },
  archived: {
    label: "Archived",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartLineDots() {
  const [data, setData] = useState(chartData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Currently using mock data
    // In the future, this can fetch from an API endpoint like /api/dashboard/trends
    setLoading(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Trends</CardTitle>
        <CardDescription>Last 6 Months Activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Loading trend data...
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="active"
                type="natural"
                stroke="var(--color-active)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-active)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <Line
                dataKey="archived"
                type="natural"
                stroke="var(--color-archived)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-archived)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Document activity tracking <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Active vs Archived documents trend
        </div>
      </CardFooter>
    </Card>
  );
}
