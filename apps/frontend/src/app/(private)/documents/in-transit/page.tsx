"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/reuseable/tables/data-table";
import { outgoingColumns, type OutgoingDocument } from "./outgoing-columns";
import { incomingColumns, type IncomingDocument } from "./incoming-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useIncomingDocuments,
  useOutgoingDocuments,
} from "@/hooks/use-documents-in-transit";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/components/providers/providers";

export default function InTransitDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "incoming"
  );
  const { socket } = useSocket();

  // Fetch incoming documents
  const {
    documents: incomingDocuments = [],
    isLoading: isLoadingIncoming,
    error: incomingError,
    refetch: refetchIncoming,
  } = useIncomingDocuments(1, 100);

  // Fetch outgoing documents
  const {
    documents: outgoingDocuments = [],
    isLoading: isLoadingOutgoing,
    error: outgoingError,
    refetch: refetchOutgoing,
  } = useOutgoingDocuments(1, 100);

  // Listen for real-time document updates
  useEffect(() => {
    if (!socket) return;

    const handleDocumentAdded = () => {
      refetchIncoming();
      refetchOutgoing();
    };

    const handleDocumentUpdated = () => {
      refetchIncoming();
      refetchOutgoing();
    };

    const handleDocumentDeleted = () => {
      refetchIncoming();
      refetchOutgoing();
    };

    // Listen for document-related events
    socket.on("documentAdded", handleDocumentAdded);
    socket.on("documentUpdated", handleDocumentUpdated);
    socket.on("documentDeleted", handleDocumentDeleted);
    socket.on("documentShared", handleDocumentAdded); // Refetch when documents are shared
    socket.on("documentAddedToUser", handleDocumentAdded); // Refetch when a document is specifically shared to this user
    socket.on("documentUploadCompleted", handleDocumentAdded); // Also refetch on upload completion

    // Cleanup listeners on unmount
    return () => {
      socket.off("documentAdded", handleDocumentAdded);
      socket.off("documentUpdated", handleDocumentUpdated);
      socket.off("documentDeleted", handleDocumentDeleted);
      socket.off("documentUploadCompleted", handleDocumentAdded);
    };
  }, [socket, refetchIncoming, refetchOutgoing]);

  return (
    <div className="flex h-full flex-col gap-4 bg-background">
      <Tabs
        defaultValue="incoming"
        className="w-full"
        onValueChange={(value) =>
          setActiveTab(value as "incoming" | "outgoing")
        }
      >
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="incoming">Incoming Documents</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4">
          {isLoadingIncoming ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : incomingError ? (
            <div className="flex items-center justify-center h-64 text-destructive">
              <p>Error loading incoming documents: {incomingError}</p>
            </div>
          ) : (
            <DataTable
              columns={incomingColumns}
              data={incomingDocuments}
              selection={true}
            />
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          {isLoadingOutgoing ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : outgoingError ? (
            <div className="flex items-center justify-center h-64 text-destructive">
              <p>Error loading outgoing documents: {outgoingError}</p>
            </div>
          ) : (
            <DataTable
              columns={outgoingColumns}
              data={outgoingDocuments}
              selection={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
