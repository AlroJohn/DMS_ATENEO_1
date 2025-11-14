"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, FileText, Image, Video } from "lucide-react";

export default function StorageAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Analytics</h1>
        <p className="text-muted-foreground">Monitor storage usage and quotas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><HardDrive className="h-4 w-4" />Total Storage</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">128 GB</div><p className="text-xs text-muted-foreground">of 1000 GB</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Documents</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">85 GB</div><p className="text-xs text-muted-foreground">66.4%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Images</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">32 GB</div><p className="text-xs text-muted-foreground">25.0%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Videos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">11 GB</div><p className="text-xs text-muted-foreground">8.6%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Storage by Department</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[{ name: "Legal", usage: "45 GB", percentage: 35 }, { name: "HR", usage: "28 GB", percentage: 22 }, { name: "Finance", usage: "32 GB", percentage: 25 }].map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-muted-foreground">{dept.usage}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${dept.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
