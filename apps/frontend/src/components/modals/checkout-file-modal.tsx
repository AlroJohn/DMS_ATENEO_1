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
import { Loader2, Lock, Unlock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DocumentFile {
  id: string;
  name: string;
  checkout: boolean;
  checkedOutBy: string | null;
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
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      if (open && documentId) {
        setIsLoading(true);
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

  const handleCheckout = async () => {
    if (!selectedFileId || !documentId) return;

    setIsCheckingOut(true);
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
      router.push(`/documents/${documentId}?mode=edit&fileId=${selectedFileId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedFileId);
  const canCheckout = selectedFileId && selectedFile && !selectedFile.checkout;

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
                    files.map((file) => (
                      <Label
                        key={file.id}
                        htmlFor={file.id}
                        className={`flex items-center justify-between rounded-md border p-3 ${
                          file.checkout
                            ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                            : "cursor-pointer hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={file.id}
                            id={file.id}
                            disabled={file.checkout}
                          />
                          <span>{file.name}</span>
                        </div>
                        {file.checkout ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked by {file.checkedOutBy || "another user"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Unlock className="h-3 w-3" />
                            Available
                          </Badge>
                        )}
                      </Label>
                    ))
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
          <Button
            onClick={handleCheckout}
            disabled={!canCheckout || isCheckingOut}
          >
            {isCheckingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Checkout & Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
