"use client";

import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, Loader2, Key, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSignDocument, SignDocumentResponse } from "@/hooks/use-sign-document";
import { toast } from "sonner";

interface BlockchainSigningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    title: string;
    hash?: string;
    blockchainStatus?: string | null;
  };
  onSigned?: (result: SignDocumentResponse) => void;
}

export function BlockchainSigningModal({ open, onOpenChange, document, onSigned }: BlockchainSigningModalProps) {
  const [step, setStep] = useState(1);
  const [signingProgress, setSigningProgress] = useState(0);
  const [signature, setSignature] = useState("");
  const [comments, setComments] = useState("");
  const { signDocument, isLoading, error, data, reset: resetSignDocument } = useSignDocument();

  const handleSign = async () => {
    setStep(2);
    setSigningProgress(20);

    try {
      // Progress: Preparing request
      await new Promise(resolve => setTimeout(resolve, 500));
      setSigningProgress(40);

      // Call the actual API
      const result = await signDocument(document.id, signature);

      setSigningProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSigningProgress(80);

      if (result) {
        setSigningProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        setStep(3);

        toast.success("Document signed successfully and recorded on the blockchain.");
        if (result.redirectUrl) {
          window.open(result.redirectUrl, '_blank', 'noopener,noreferrer');
        }
        onSigned?.(result);
      } else {
        // Error handled by the hook
        setStep(1);
        setSigningProgress(0);
        toast.error(error || "Failed to sign document. Please try again.");
      }
    } catch (err: any) {
      console.error('Error in handleSign:', err);
      setStep(1);
      setSigningProgress(0);
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  const resetModal = () => {
    setStep(1);
    setSigningProgress(0);
    setSignature("");
    setComments("");
    resetSignDocument();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Document Signing
          </DialogTitle>
          <DialogDescription>
            Initiate DocOnChain signing. We will open a new tab if DocOnChain requires further action.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{document.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{document.hash || "Hash will be generated"}</span>
                </div>
                {document.blockchainStatus && (
                  <div className="flex items-center gap-2">
                    <Badge variant={document.blockchainStatus === "signed" ? "default" : "secondary"}>
                      {document.blockchainStatus.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature">Digital Signature</Label>
                <Input
                  id="signature"
                  placeholder="Enter your full name as digital signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Add any comments about this signature..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens when you sign:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Document hash is generated and recorded on blockchain</li>
                <li>• Immutable timestamp is created</li>
                <li>• Digital certificate is generated</li>
                <li>• Document becomes tamper-evident</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSign}
                disabled={!signature.trim() || isLoading}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Sign Document'}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Processing Blockchain Signature</h3>
              <p className="text-muted-foreground">Please wait while we process your signature...</p>
            </div>

            <div className="space-y-2">
              <Progress value={signingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {signingProgress < 20 ? "Generating document hash..." :
                 signingProgress < 40 ? "Connecting to DocOnChain API..." :
                 signingProgress < 60 ? "Creating blockchain transaction..." :
                 signingProgress < 80 ? "Waiting for confirmation..." :
                 "Signature complete!"}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Do not close this window while processing
              </p>
            </div>
          </div>
        )}

        {step === 3 && data && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Document Successfully Signed!</h3>
              <p className="text-muted-foreground">Your document has been signed and recorded on the blockchain</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Signature Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {data.transactionHash}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Project UUID</label>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {data.projectUuid}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={data.status === 'signed' ? 'default' : 'secondary'}>
                        {data.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="font-medium">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Your document is now tamper-evident and verifiable on the blockchain
              </p>
            </div>

            <div className="flex justify-end gap-2">
              {data.redirectUrl && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!data.redirectUrl) return;
                    window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on DocOnChain
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}