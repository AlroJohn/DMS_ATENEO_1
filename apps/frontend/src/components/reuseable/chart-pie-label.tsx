"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
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

export const description = "A pie chart with a label";

const chartConfig = {
  count: {
    label: "Documents",
  },
  owned: {
    label: "Owned",
    color: "var(--chart-1)",
  },
  inTransit: {
    label: "In-Transit",
    color: "var(--chart-2)",
  },
  shared: {
    label: "Shared",
    color: "var(--chart-3)",
  },
  archive: {
    label: "Archive",
    color: "var(--chart-4)",
  },
  recycleBin: {
    label: "Recycle Bin",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartPieLabel() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          const formattedData = [
            { category: "owned", count: data.owned, fill: "var(--color-owned)" },
            { category: "inTransit", count: data.inTransit, fill: "var(--color-inTransit)" },
            { category: "shared", count: data.shared, fill: "var(--color-shared)" },
            { category: "archive", count: data.archive, fill: "var(--color-archive)" },
            { category: "recycleBin", count: data.recycleBin, fill: "var(--color-recycleBin)" },
          ].filter(item => item.count > 0);
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col w-full">
        <CardHeader className="items-center text-center pb-0">
          <CardTitle>Document Distribution</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center text-center pb-0">
        <CardTitle>Document Distribution</CardTitle>
        <CardDescription>By Status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="count" label nameKey="category" />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No documents to display
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Document Statistics <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Distribution of documents across different statuses
        </div>
      </CardFooter>
    </Card>
  );
}
