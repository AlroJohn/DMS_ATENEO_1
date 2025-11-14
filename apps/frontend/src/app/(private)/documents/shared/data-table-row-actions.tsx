'use client';

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Copy,
  Shield,
  Lock,
  Unlock,
  RotateCcw
} from "lucide-react";
import { ViewDocumentsModal } from "@/components/reuseable/view-details-documents/view-documents";
import { BlockchainSigningModal } from "@/components/modals/blockchain-signing-modal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ReleaseDocumentModal } from "@/components/modals/release-document-modal";
import { EditDocumentModal } from "@/app/(private)/documents/[id]/components/edit-document-modal";
import { SharedDocument } from "./columns";
import { useDocumentLock } from "@/hooks/useDocumentLock";
import { useAuth } from "@/hooks/use-auth";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SharedDocument | null>(
    null
  );
  const [modalState, setModalState] = useState({
    view: false,
    edit: false,
    release: false,
    sign: false,
    checkout: false,
  });

  const document = row.original as SharedDocument;

  // Get current user from auth context
  const { user } = useAuth();
  const currentUserId = user?.user_id;

  // Initialize document lock hook with current user ID
  const { checkout, checkin, lock, isLoading: isLockLoading, canEdit, canOverride } = useDocumentLock({
    documentId: document.id,
    currentUserId: currentUserId,
  });

  // Event handlers
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(document.documentId || document.id);
    toast.success("Document Code copied to clipboard");
  };

  const toggleModal = (modalType: keyof typeof modalState, value: boolean) => {
    setModalState((prev) => ({ ...prev, [modalType]: value }));
    if (!value) {
      setSelectedDocument(null);
    }
  };

  const handleView = () => {
    toggleModal("view", true);
  };

  const handleViewDocument = () => {
    if (document.id) {
      router.push(`/documents/viewer/${document.id}`);
    }
  };

  const handleSign = () => {
    setSelectedDocument(document);
    toggleModal("sign", true);
  };

  const handleEdit = () => {
    if (document.id) {
      router.push(`/documents/${document.id}/edit`);
    }
  };

  const handleRelease = () => {
    if (isLockedByOther) {
      toast.error("This document is checked out by another user.");
      return;
    }
    console.log('🔄 Release button clicked for document:', document);
    setSelectedDocument(document);
    toggleModal("release", true);
  };

  const handleCheckout = async () => {
    if (document.id) {
      const success = await checkout();
      if (success) {
        toast.success("Document checked out successfully");
      } else {
        toast.error("Failed to checkout document");
      }
    }
  };

  const handleCheckin = async () => {
    if (document.id) {
      const success = await checkin();
      if (success) {
        toast.success("Document checked in successfully");
      } else {
        toast.error("Failed to checkin document");
      }
    }
  };

  // Determine document status
  const isAvailable = !document.checkedOutBy;
  const isCheckedOutByCurrentUser = document.checkedOutBy && document.checkedOutBy.id === currentUserId;
  const isLockedByOther = document.checkedOutBy && !isCheckedOutByCurrentUser;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            onClick={(e) => e.stopPropagation()}
            disabled={isLoading || isLockLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={(e) => handleAction(e, handleCopyCode)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </DropdownMenuItem>

          <DropdownMenuItem onClick={(e) => handleAction(e, handleView)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={(e) => handleAction(e, handleViewDocument)}>
            <Eye className="mr-2 h-4 w-4" />
            View Document
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Checkout/Checkin actions based on availability */}
          {isAvailable && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleCheckout)}>
              <Lock className="mr-2 h-4 w-4" />
              Checkout
            </DropdownMenuItem>
          )}

          {isCheckedOutByCurrentUser && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleCheckin)}>
              <Unlock className="mr-2 h-4 w-4" />
              Check in
            </DropdownMenuItem>
          )}

          {isLockedByOther && (
            <DropdownMenuItem disabled className="opacity-50">
              <Lock className="mr-2 h-4 w-4" />
              Checked out by another
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Sign Document action */}
          {(isAvailable || isCheckedOutByCurrentUser) && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleSign)}>
              <Shield className="mr-2 h-4 w-4" />
              Sign Document
            </DropdownMenuItem>
          )}

          {isLockedByOther && (
            <DropdownMenuItem disabled className="opacity-50">
              <Shield className="mr-2 h-4 w-4" />
              Sign (locked)
            </DropdownMenuItem>
          )}

          {/* Only show Edit if document is available or checked out by current user */}
          {(isAvailable || isCheckedOutByCurrentUser) && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleEdit)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Document
            </DropdownMenuItem>
          )}

          {isLockedByOther && (
            <DropdownMenuItem disabled className="opacity-50">
              <Edit className="mr-2 h-4 w-4" />
              Edit (locked)
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Release action */}
          {(isAvailable || isCheckedOutByCurrentUser) && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleRelease)}>
              <Send className="mr-2 h-4 w-4" />
              Release
            </DropdownMenuItem>
          )}

          {isLockedByOther && (
            <DropdownMenuItem disabled className="opacity-50">
              <Send className="mr-2 h-4 w-4" />
              Release (locked)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Modal */}
      <ViewDocumentsModal
        open={modalState.view}
        onOpenChange={(open) => toggleModal("view", open)}
        documentId={document.id}
      />

      {/* Release Modal */}
      <ReleaseDocumentModal
        isOpen={modalState.release}
        onClose={() => toggleModal("release", false)}
        document={selectedDocument}
      />

      {/* Blockchain Signing Modal */}
      {selectedDocument && (
        <BlockchainSigningModal
          open={modalState.sign}
          onOpenChange={(open) => toggleModal("sign", open)}
          document={{
            id: selectedDocument.id,
            title: selectedDocument.document,
            hash: (selectedDocument as any).blockchainTxHash,
            blockchainStatus: (selectedDocument as any).blockchainStatus ?? selectedDocument.status,
          }}
          onSigned={() => {
            // The real-time update will handle the UI update
          }}
        />
      )}

      {/* Edit Modal - Only show if document is available or checked out by current user */}
      {selectedDocument && (isAvailable || isCheckedOutByCurrentUser) && (
        <EditDocumentModal
          open={modalState.edit}
          onOpenChange={(open) => toggleModal("edit", open)}
          documentId={selectedDocument.id}
          onSuccess={() => {
            // The real-time update will handle the UI update
          }}
        />
      )}
    </>
  );
}