"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar } from "lucide-react";

export default function ContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const contracts = [
    { id: "1", title: "Vendor Agreement - ABC Corp", type: "Vendor", status: "Active", expiryDate: "2025-12-31", annexes: 3 },
    { id: "2", title: "Service Agreement - XYZ Ltd", type: "Service", status: "Active", expiryDate: "2026-06-30", annexes: 2 },
    { id: "3", title: "Employment Contract - John Doe", type: "Employment", status: "Active", expiryDate: "2025-08-15", annexes: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground">Manage contracts with annexes and versions</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />New Contract</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search contracts..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Contracts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{contracts.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{contracts.filter(c => c.status === "Active").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Expiring Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1</div></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/contracts/${contract.id}`)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {contract.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{contract.type} Contract</p>
                </div>
                <Badge variant={contract.status === "Active" ? "default" : "secondary"}>{contract.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Expires: {contract.expiryDate}
                  </div>
                  <div>Annexes: {contract.annexes}</div>
                </div>
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/contracts/${contract.id}/relationships`); }}>View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
