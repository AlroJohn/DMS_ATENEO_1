"use client";

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
  CheckCircle,
  XCircle,
  Trash2,
  Archive,
  Copy,
  Shield,
  FilePenLine,
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReleaseDocumentModal } from "@/components/modals/release-document-modal";
import { EditDocumentModal } from "@/app/(private)/documents/[id]/components/edit-document-modal";
import { Document } from "@/hooks/use-documents-owned";
import { useAuth } from "@/hooks/use-auth";
import {
  canViewDocuments,
  canEditDocumentDetails,
  canEditDocument,
  canViewDocument,
  canSignDocument,
  canReleaseDocument,
  canCompleteDocument,
  canCancelDocument,
  canArchiveDocument,
  canDeleteDocument
} from "@/lib/document-permissions";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [modalState, setModalState] = useState({
    view: false,
    edit: false,
    release: false,
    complete: false,
    sign: false,
  });

  const document = row.original as Document;

  // Event handlers
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(document.documentId);
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
    router.push(`/documents/${document.id}`);
  };

  const handleOpenEditor = () => {
    router.push(`/documents/${document.id}?mode=edit`);
  };

  const handleSign = () => {
    setSelectedDocument(document);
    toggleModal("sign", true);
  };

  const handleEdit = () => {
    setSelectedDocument(document);
    toggleModal("edit", true);
  };

  const handleRelease = () => {
    console.log('🔄 Release button clicked for document:', document);
    setSelectedDocument(document);
    toggleModal("release", true);
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/documents/${document.id}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to complete document');
      }

      toast.success("Document completed successfully.");
    } catch (error: any) {
      console.error("Error completing document:", error);
      toast.error(error.message || "Failed to complete document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/documents/${document.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to cancel document');
      }

      toast.success("Document cancelled successfully.");
    } catch (error: any) {
      console.error("Error cancelling document:", error);
      toast.error(error.message || "Failed to cancel document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete document';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Document successfully deleted.");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/archive/${document.id}/archive`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to archive document';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Document successfully archived.");
    } catch (error: any) {
      console.error("Error archiving document:", error);
      toast.error(error.message || "Failed to archive document.");
    } finally {
      setIsLoading(false);
    }
  };

  // Permission checks
  const canViewDetails = canViewDocuments(currentUser);
  const canEditDetails = canEditDocumentDetails(currentUser, document);
  const canEditDoc = canEditDocument(currentUser, document);
  const canViewDoc = canViewDocument(currentUser);
  const canSignDoc = canSignDocument(currentUser, document);
  const canRelease = canReleaseDocument(currentUser, document);
  const canComplete = canCompleteDocument(currentUser, document);
  const canCancel = canCancelDocument(currentUser, document);
  const canArchive = canArchiveDocument(currentUser, document);
  const canDelete = canDeleteDocument(currentUser, document);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            onClick={(e) => e.stopPropagation()}
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[160px]">
          {/* Copy Code - remains for all authenticated users */}
          <DropdownMenuItem onClick={(e) => handleAction(e, handleCopyCode)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </DropdownMenuItem>

          {/* View Details - for users with document read permissions */}
          {canViewDetails && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleView)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}

          {/* View Document - for users with document read permissions */}
          {canViewDoc && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleViewDocument)}>
              <Eye className="mr-2 h-4 w-4" />
              View Document
            </DropdownMenuItem>
          )}

          {/* Edit PDF - opens the in-app editor */}
          {canEditDoc && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleOpenEditor)}>
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit PDF
            </DropdownMenuItem>
          )}

          {/* Sign Document - for users with signing permissions on owned documents */}
          {canSignDoc && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleSign)}>
              <Shield className="mr-2 h-4 w-4" />
              Sign Document
            </DropdownMenuItem>
          )}

          {/* Edit Details - for users with edit permissions on owned documents */}
          {canEditDetails && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleEdit)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
          )}

          {/* Edit Documents - for users with edit permissions on owned documents */}
          {canEditDoc && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleEdit)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Documents
            </DropdownMenuItem>
          )}

          {(canSignDoc || canEditDetails || canEditDoc) && <DropdownMenuSeparator />}

          {/* Release - for users with transfer permissions on shared documents */}
          {canRelease && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleRelease)}>
              <Send className="mr-2 h-4 w-4" />
              Release
            </DropdownMenuItem>
          )}

          {/* Complete - for users with document receive permissions */}
          {canComplete && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleComplete)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </DropdownMenuItem>
          )}

          {/* Cancel - for users with transfer reject permissions on intransit documents */}
          {canCancel && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleCancel)}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          )}

          {(canRelease || canComplete || canCancel) && <DropdownMenuSeparator />}

          {/* Archive - for users with archive permissions on owned documents */}
          {canArchive && (
            <DropdownMenuItem onClick={(e) => handleAction(e, handleArchive)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}

          {/* Delete - for users with delete permissions on owned documents */}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  disabled={isLoading}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this document?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    document and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

      {/* Edit Modal */}
      {selectedDocument && (
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
