"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Save, Lock, Unlock, AlertTriangle, LockKeyhole, Loader2 } from "lucide-react";
import { useDocumentLock } from "@/hooks/useDocumentLock";
import { CheckoutDocumentModal } from "@/components/modals/checkout-document-modal";
import { useSocket } from "@/components/providers/providers";
import { DocumentLockBadge } from "@/components/ui/document-lock-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Document {
  document_id: string;
  title: string;
  description?: string;
  document_code: string;
  document_type: string;
  classification: string;
  origin: string;
  status: string;
  detail?: {
    document_name?: string;
    classification?: string;
    origin?: string;
    document_code?: string;
  };
}

interface EditDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  onSuccess: () => void;
}

export function EditDocumentModal({ open, onOpenChange, documentId, onSuccess }: EditDocumentModalProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classification: "",
    origin: "",
  });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutAction, setCheckoutAction] = useState<'checkout' | 'checkin' | 'override'>('checkout');

  // Document lock management
  const { lock, checkout, checkin, override, canEdit, canOverride, checkLock } = useDocumentLock({
    documentId: documentId,
    currentUserId: 'current-user-id', // TODO: Get from auth context
  });
  const { socket } = useSocket();

  useEffect(() => {
    if (open && documentId) {
      fetchDocument();
      checkLock(); // Check lock status on mount
    }

    if (socket && documentId) {
      const handleLockUpdate = (data: { documentId: string }) => {
        if (data.documentId === documentId) {
          checkLock();
        }
      };
      socket.on('documentLockUpdated', handleLockUpdate);
      return () => {
        socket.off('documentLockUpdated', handleLockUpdate);
      };
    }
  }, [open, documentId, checkLock, socket]);

  const fetchDocument = async () => {
    if (!documentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const doc = result.data;
          setDocument(doc);
          setFormData({
            title: doc.title || doc.detail?.document_name || "",
            description: doc.description || "",
            classification: doc.classification || doc.detail?.classification || "",
            origin: doc.origin || doc.detail?.origin || "",
          });
        }
      } else {
        toast.error("Failed to load document");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Error loading document");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutAction = (action: 'checkout' | 'checkin' | 'override') => {
    setCheckoutAction(action);
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    let success = false;
    if (checkoutAction === 'checkout') {
      success = await checkout();
    } else if (checkoutAction === 'checkin') {
      success = await checkin();
    } else {
      success = await override();
    }

    if (success) {
      await checkLock(); // Refresh lock status
      if (socket && documentId) {
        socket.emit('documentLockUpdated', { documentId });
      }
    }
  };

  const handleSave = async () => {
    if (!documentId) return;
    // Check if document is locked by someone else
    if (lock.status === 'locked' && !canEdit) {
      toast.error("Cannot save: Document is locked by another user");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          content: formData.description,
          classification: formData.classification,
          origin: formData.origin,
        }),
      });

      if (response.ok) {
        toast.success("Document updated successfully");
        onSuccess();
        onOpenChange(false);
        if (socket && documentId) {
          socket.emit('documentUpdated', { documentId });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error?.message || "Failed to update document");
      }
    } catch (error) {
      toast.error("Error updating document");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if form should be disabled
  const isFormDisabled = lock.status === 'locked' && !canEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Make changes to your document here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lock Status and Actions */}
              <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Lock Status</h3>
                  <div className="flex items-center gap-2">
                      <DocumentLockBadge
                          status={lock.status}
                          lockedBy={lock.lockedBy}
                          lockedAt={lock.lockedAt}
                      />
                      {lock.status === 'available' && (
                          <Button onClick={() => handleCheckoutAction('checkout')} variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Check Out
                          </Button>
                      )}
                      {lock.status === 'locked_by_you' && (
                          <Button onClick={() => handleCheckoutAction('checkin')} variant="outline" size="sm">
                          <Unlock className="h-4 w-4 mr-2" />
                          Check In
                          </Button>
                      )}
                      {lock.status === 'locked' && canOverride && (
                          <Button onClick={() => handleCheckoutAction('override')} variant="destructive" size="sm">
                          <LockKeyhole className="h-4 w-4 mr-2" />
                          Override
                          </Button>
                      )}
                  </div>
              </div>

              {/* Lock Warning Alert */}
              {lock.status === 'locked' && !canEdit && (
                  <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                      This document is currently locked by <strong>{lock.lockedBy?.name}</strong> since{" "}
                      {lock.lockedAt ? new Date(lock.lockedAt).toLocaleString() : "unknown"}.
                      You cannot edit this document until it is checked back in.
                      {canOverride && (
                      <Button
                          variant="link"
                          className="p-0 h-auto ml-2"
                          onClick={() => handleCheckoutAction('override')}
                      >
                          Override lock
                      </Button>
                      )}
                  </AlertDescription>
                  </Alert>
              )}

              {/* Prompt to checkout if available */}
              {lock.status === 'available' && (
                  <Alert className="border-blue-200 bg-blue-50">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                      This document is available for editing. Consider checking it out to prevent conflicts with other users.
                      <Button
                      variant="link"
                      className="p-0 h-auto ml-2 text-blue-600"
                      onClick={() => handleCheckoutAction('checkout')}
                      >
                      Check out now
                      </Button>
                  </AlertDescription>
                  </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Document Code</Label>
                      <Input
                        id="code"
                        value={document?.document_code || document?.detail?.document_code || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Input
                        id="status"
                        value={document?.status || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter document title"
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter document description"
                      rows={4}
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="classification">Classification</Label>
                      <Select
                        value={formData.classification}
                        onValueChange={(value) => setFormData({ ...formData, classification: value })}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                          <SelectItem value="highly_technical">Highly Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="origin">Origin</Label>
                      <Select
                        value={formData.origin}
                        onValueChange={(value) => setFormData({ ...formData, origin: value })}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isFormDisabled}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <CheckoutDocumentModal
        open={checkoutModalOpen}
        onOpenChange={() => setCheckoutModalOpen(false)}
        onConfirm={handleConfirmCheckout}
        action={checkoutAction}
        documentTitle={document?.title || 'this document'}
      />
    </Dialog>
  );
}
