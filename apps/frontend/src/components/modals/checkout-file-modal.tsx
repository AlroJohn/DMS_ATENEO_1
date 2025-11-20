"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Loader2, Lock, Unlock, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  checkout: boolean;
  version?: string;
  checkedOutBy?: {
    accountId: string;
    name: string;
  };
}

interface CheckoutFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
}

export function CheckoutFileModal({
  open,
  onOpenChange,
  documentId,
}: CheckoutFileModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      if (open && documentId) {
        setIsLoading(true);
        setSelectedFileId(null);
        try {
          const response = await fetch(`/api/documents/${documentId}/files`);
          if (!response.ok) {
            throw new Error("Failed to fetch files");
          }
          const result = await response.json();
          setFiles(result.data || []);
        } catch (error) {
          console.error(error);
          toast.error("Could not load document files.");
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchFiles();
  }, [open, documentId, onOpenChange]);

  const handleConfirm = async () => {
    if (!selectedFileId || !documentId) return;

    const selectedFile = files.find((f) => f.id === selectedFileId);
    if (!selectedFile) return;

    // Debug logging
    console.log("DEBUG: In handleConfirm");
    console.log("selectedFile.checkout:", selectedFile.checkout);
    console.log(
      "selectedFile.checkedOutBy?.accountId:",
      selectedFile.checkedOutBy?.accountId
    );
    console.log("user?.accountId:", user?.accountId);
    console.log(
      "Comparison result:",
      selectedFile.checkout &&
        selectedFile.checkedOutBy?.accountId === user?.accountId
    );

    // If file is already checked out by current user, just go to editor
    if (
      selectedFile.checkout &&
      selectedFile.checkedOutBy?.accountId === user?.accountId
    ) {
      onOpenChange(false);
      router.push(
        `/documents/${documentId}?mode=edit&fileId=${selectedFileId}`
      );
      return;
    }

    // If file is available, check it out
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/files/${selectedFileId}/checkout`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to checkout file.");
      }

      toast.success("File checked out successfully!");
      onOpenChange(false);
      router.push(
        `/documents/${documentId}?mode=edit&fileId=${selectedFileId}`
      );
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedFileId);

  // Debug logging for button text
  console.log("DEBUG: In button text logic");
  console.log("selectedFile:", selectedFile);
  console.log("user:", user);
  if (selectedFile) {
    console.log("selectedFile.checkout:", selectedFile.checkout);
    console.log(
      "selectedFile.checkedOutBy?.accountId:",
      selectedFile.checkedOutBy?.accountId
    );
    console.log("user?.accountId:", user?.accountId);
  }

  let buttonText = "Select a file";
  let buttonDisabled = true;

  if (selectedFile) {
    if (selectedFile.checkout) {
      if (selectedFile.checkedOutBy?.accountId === user?.accountId) {
        buttonText = "Edit PDF";
        buttonDisabled = false;
      } else {
        buttonText = "Locked by another user";
        buttonDisabled = true;
      }
    } else {
      buttonText = "Checkout & Edit";
      buttonDisabled = false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Checkout a File</DialogTitle>
          <DialogDescription>
            Select a file to check out for editing. This will lock the file for
            other users.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-64 pr-4">
              <RadioGroup
                value={selectedFileId ?? ""}
                onValueChange={setSelectedFileId}
              >
                <div className="space-y-2">
                  {files.length > 0 ? (
                    files.map((file) => {
                      const isLocked = file.checkout;
                      const isLockedByMe =
                        isLocked &&
                        file.checkedOutBy?.accountId === user?.accountId;
                      const isLockedByOther = isLocked && !isLockedByMe;

                      return (
                        <Label
                          key={file.id}
                          htmlFor={file.id}
                          className={`flex items-center justify-between rounded-md border p-3 ${
                            isLockedByOther
                              ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                              : "cursor-pointer hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={file.id} id={file.id} />
                            <div className="flex flex-col">
                              <span>{file.name}</span>
                              {file.version && (
                                <span className="text-xs text-muted-foreground">
                                  Version {file.version}
                                </span>
                              )}
                            </div>
                          </div>
                          {isLockedByMe ? (
                            <Badge
                              variant="default"
                              className="flex items-center gap-1 bg-green-600"
                            >
                              <UserCheck className="h-3 w-3" />
                              Locked by you
                            </Badge>
                          ) : isLockedByOther ? (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              <Lock className="h-3 w-3" />
                              Locked by{" "}
                              {file.checkedOutBy?.name || "another user"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-3 w-3" />
                              Available
                            </Badge>
                          )}
                        </Label>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No files found in this document.
                    </p>
                  )}
                </div>
              </RadioGroup>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {/* Show Edit PDF button directly if a file is checked out by the current user */}

          <Button
            onClick={handleConfirm}
            disabled={buttonDisabled || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
