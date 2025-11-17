"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { useSocket } from "@/components/providers/providers";
import { useArchive } from "@/hooks/use-archive";

export default function ArchivePage() {
  const { archivedDocuments, loading, error, archiveDocument, restoreDocument, fetchArchivedDocuments } = useArchive();
  const { socket } = useSocket();

  // Listen for real-time document updates
  useEffect(() => {
    if (!socket) return;

    const handleDocumentArchived = () => {
      fetchArchivedDocuments();
    };

    const handleDocumentRestored = () => {
      fetchArchivedDocuments();
    };

    // Listen for document-related events
    socket.on('documentArchived', handleDocumentArchived);
    socket.on('documentRestored', handleDocumentRestored);

    // Cleanup listeners on unmount
    return () => {
      socket.off('documentArchived', handleDocumentArchived);
      socket.off('documentRestored', handleDocumentRestored);
    };
  }, [socket, fetchArchivedDocuments]);

  const handleRestore = async (documentId: string) => {
    await restoreDocument(documentId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search archived documents..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Archived Documents</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading archived documents...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search archived documents..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Archived Documents</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-6 text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
            {archivedDocuments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No archived documents found</div>
            ) : (
              archivedDocuments.map((doc: any) => (
                <div key={doc.document_id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Archived on {doc.deleted_at ? formatDate(doc.deleted_at) : 'N/A'}
                      {doc.files && doc.files.length > 0 && ` • ${doc.files[0].DocumentMetadata?.file_size || 'N/A'}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(doc.document_id)}
                      disabled={loading} // Disable button when loading
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />Restore
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
