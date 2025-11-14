"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DocumentListItem as Document } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";

// Mock data for actions
interface Department {
  department_id: string;
  name: string;
  code: string;
  active: boolean;
}

const requestActions = [
  "For Approval",
  "For Signature",
  "For Review",
  "For Information",
  "For Action",
  "For Comment",
  "For Endorsement",
  "For Filing",
  "For Release",
  "For Follow-up",
  "For Modification",
  "For Rejection",
];

const releaseDocumentSchema = z.object({
  departmentId: z.string().min(1, "Please select a department."),
  requestAction: z.string().min(1, "Please select an action."),
  remarks: z.string().optional(),
});

type ReleaseDocumentForm = z.infer<typeof releaseDocumentSchema>;

interface ReleaseDocumentModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReleaseDocumentModal({
  document,
  isOpen,
  onClose,
}: ReleaseDocumentModalProps) {
  const { user: currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const form = useForm<ReleaseDocumentForm>({
    resolver: zodResolver(releaseDocumentSchema),
    defaultValues: {
      departmentId: "",
      requestAction: "",
      remarks: "",
    },
  });

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await fetch("/api/admin/departments", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filter out the current user's department from the list of available departments
          const filteredDepartments = result.data?.filter(
            (dept: Department) => dept.department_id !== currentUser?.department_id
          ) || [];
          setDepartments(filteredDepartments);
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const { mutate: releaseDocument, isPending } = useMutation({
    mutationFn: async (data: ReleaseDocumentForm) => {
      console.log("🚀 Releasing document:", document!.id, "with data:", data);

      const response = await fetch(`/api/documents/${document!.id}/release`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("📝 Release response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Release error:", errorData);
        throw new Error(errorData.error || "Failed to release document.");
      }

      const result = await response.json();
      console.log("✅ Release success:", result);
      return result;
    },
    onSuccess: () => {
      toast.success("Document released successfully!");
      form.reset();
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to release document.");
    },
  });

  const onSubmit = (data: ReleaseDocumentForm) => {
    releaseDocument(data);
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Release Document</DialogTitle>
          <DialogDescription>
            Release the document to another department for action.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-code" className="text-right">
              Code
            </Label>
            <Input
              id="doc-code"
              value={document.documentId}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-name" className="text-right">
              Name
            </Label>
            <Input
              id="doc-name"
              value={document.document}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-classification" className="text-right">
              Classification
            </Label>
            <Input
              id="doc-classification"
              value={document.classification}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doc-owner" className="text-right">
              Owner
            </Label>
            <Input
              id="doc-owner"
              value={document.contactPerson}
              readOnly
              className="col-span-3"
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder={currentUser?.department_id ? "Select a different department" : "Select a department"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-52">
                        {loadingDepartments ? (
                          <SelectItem value="loading" disabled>
                            Loading departments...
                          </SelectItem>
                        ) : departments.length > 0 ? (
                          departments.map((dep) => (
                            <SelectItem
                              key={dep.department_id}
                              value={dep.department_id}
                            >
                              {dep.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-departments" disabled>
                            {currentUser?.department_id ? "No other departments available" : "No departments available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Action</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-52">
                        {requestActions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any remarks here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Releasing..." : "Release"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
