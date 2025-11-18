"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Send,
  Users,
  Archive,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface DocumentStats {
  owned: number;
  inTransit: number;
  shared: number;
  archive: number;
  recycleBin: number;
  total: number;
}

const statsConfig = [
  {
    key: "owned" as keyof DocumentStats,
    title: "Owned",
    icon: FileText,
    url: "/documents/owned",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "inTransit" as keyof DocumentStats,
    title: "In-transit",
    icon: Send,
    url: "/documents/in-transit",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "shared" as keyof DocumentStats,
    title: "Shared",
    icon: Users,
    url: "/documents/shared",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "archive" as keyof DocumentStats,
    title: "Archive",
    icon: Archive,
    url: "/documents/archive",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "recycleBin" as keyof DocumentStats,
    title: "Recycle Bin",
    icon: Trash2,
    url: "/documents/recycle-bin",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export function DocumentStatsCards() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(`Failed to fetch document statistics: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Dashboard stats response:", data);
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || "Unknown error");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching document stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>{error || "Failed to load statistics"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        {statsConfig.map((config) => {
          const Icon = config.icon;
          const count = stats[config.key];

          return (
            <Link key={config.key} href={config.url}>
              <Card className="transition-all hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {config.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {count === 1 ? "document" : "documents"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        
        {/* Total Summary Card */}
        <Card className="transition-all hover:shadow-lg cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total documents
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
