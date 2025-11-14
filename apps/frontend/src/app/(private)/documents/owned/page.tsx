"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/reuseable/tables/data-table";
import { columns } from "@/app/(private)/documents/owned/columns";
import { Document, useDocumentsOwned } from "@/hooks/use-documents-owned";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSocket } from "@/components/providers/providers";

export default function OwnedDocumentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  const { documents, pagination, isLoading, error, refetch } =
    useDocumentsOwned(page, limit);
  const { socket } = useSocket();

  // Function to refresh data
  const handleRefresh = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time document updates
  useEffect(() => {
    if (!socket) return;

    const handleDocumentAdded = () => {
      refetch();
    };

    const handleDocumentUpdated = () => {
      refetch();
    };

    const handleDocumentDeleted = () => {
      refetch();
    };

    // Listen for document-related events
    socket.on('documentAdded', handleDocumentAdded);
    socket.on('documentUpdated', handleDocumentUpdated);
    socket.on('documentDeleted', handleDocumentDeleted);
    socket.on('documentShared', handleDocumentAdded); // Refetch when documents are shared
    socket.on('documentAddedToUser', handleDocumentAdded); // Refetch when a document is specifically shared to this user
    socket.on('documentUploadCompleted', handleDocumentAdded); // Also refetch on upload completion

    // Cleanup listeners on unmount
    return () => {
      socket.off('documentAdded', handleDocumentAdded);
      socket.off('documentUpdated', handleDocumentUpdated);
      socket.off('documentDeleted', handleDocumentDeleted);
      socket.off('documentUploadCompleted', handleDocumentAdded);
    };
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <button
              onClick={refetch}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <DataTable
        columns={columns}
        data={documents}
        selection={true}
      />
    </div>
  );
}
