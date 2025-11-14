"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { useSocket } from "@/components/providers/providers";

export default function ArchivePage() {
  const [archivedDocs, setArchivedDocs] = useState([
    { id: "1", title: "Contract Agreement 2023", archivedDate: "2024-01-15", archivedBy: "John Doe", size: "2.4 MB" },
    { id: "2", title: "Employee NDA - Old Template", archivedDate: "2024-02-20", archivedBy: "Jane Smith", size: "1.8 MB" },
  ]);
  const { socket } = useSocket();

  // Listen for real-time document updates (when archive functionality is implemented)
  useEffect(() => {
    if (!socket) return;

    const handleDocumentArchived = () => {
      // TODO: Refetch archived documents when archive API is implemented
      // refetchArchivedDocuments();
    };

    const handleDocumentRestored = () => {
      // TODO: Refetch archived documents when archive API is implemented
      // refetchArchivedDocuments();
    };

    // Listen for document-related events
    socket.on('documentArchived', handleDocumentArchived);
    socket.on('documentRestored', handleDocumentRestored);

    // Cleanup listeners on unmount
    return () => {
      socket.off('documentArchived', handleDocumentArchived);
      socket.off('documentRestored', handleDocumentRestored);
    };
  }, [socket]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
          <p className="text-muted-foreground">Archived documents with retention policies</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search archived documents..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Archived Documents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {archivedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">Archived on {doc.archivedDate} by {doc.archivedBy} • {doc.size}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><RotateCcw className="mr-2 h-4 w-4" />Restore</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
