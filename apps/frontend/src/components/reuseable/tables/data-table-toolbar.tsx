"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  PlusCircle,
  Search,
  FileText,
  Upload,
  Send,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Filter,
} from "lucide-react";
import { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateDocumentModal } from "@/components/modals/create-document-modal";
import { UploadDocumentModal } from "@/app/(private)/documents/[id]/components/upload-document-modal";
import { DocumentFiltersModal } from "@/components/modals/document-filters-modal";

import {
  DOC_CLASSIFICATION_OPTIONS,
  DOC_STATUS_OPTIONS,
} from "@/lib/doc-enums";

// ============================================================================
// DataTableFacetedFilter Component
// ============================================================================

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onFilterChange?: (values: string[]) => void; // For modal usage
  selectedValues?: string[]; // For modal usage
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  onFilterChange,
  selectedValues: externalSelectedValues,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Determine if we're using internal state (for table usage) or external state (for modal usage)
  const isModalMode =
    onFilterChange !== undefined && externalSelectedValues !== undefined;

  let internalSelectedValues: Set<string>;
  let setInternalSelectedValues: (values: string[]) => void;

  if (isModalMode) {
    internalSelectedValues = new Set(externalSelectedValues);
    setInternalSelectedValues = onFilterChange;
  } else {
    // For table usage
    const facets = column?.getFacetedUniqueValues();
    internalSelectedValues = new Set(column?.getFilterValue() as string[]);
    setInternalSelectedValues = (values) => {
      if (column) {
        column.setFilterValue(values.length > 0 ? values : undefined);
      }
    };
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {internalSelectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {internalSelectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {internalSelectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {internalSelectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) =>
                      internalSelectedValues.has(option.value)
                    )
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = internalSelectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        internalSelectedValues.delete(option.value);
                      } else {
                        internalSelectedValues.add(option.value);
                      }
                      const filterValues = Array.from(internalSelectedValues);
                      setInternalSelectedValues(filterValues);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {isModalMode || (column && column.getCanFilter()) ? (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {/* Show count if available */}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {internalSelectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setInternalSelectedValues([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
import { toast } from "sonner";
import { BulkTransmitModal } from "@/components/modals/bulk-transmit-modal";

// DataTableViewOptions Component
// ============================================================================

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const resetToDefault = () => {
    // Reset to default column visibility (hide security and dates columns)
    table.setColumnVisibility({
      security: false,
      dates: false,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={resetToDefault}
          className="flex items-center justify-between"
        >
          <span>Reset to default</span>
          <X className="h-4 w-4 ml-2" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// DataTablePagination Component
// ============================================================================

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  showSelected?: boolean;
}

export function DataTablePagination<TData>({
  table,
  showSelected = true,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        {showSelected && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        )}
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DataTableToolbar Component
// ============================================================================

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  excludedFilters?: string[]; // New prop
  showUploadButton?: boolean; // Prop to control upload button visibility
}

export function DataTableToolbar<TData>({
  table,
  excludedFilters = [],
  showUploadButton = false, // Default to false to maintain existing behavior
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isBulkTransmitOpen, setBulkTransmitOpen] = React.useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [isFiltersModalOpen, setFiltersModalOpen] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState<any[]>([]);

  // Check if specific columns exist before attempting to get them
  const allColumnIds = table.getAllColumns().map((column) => column.id);
  const documentColumn = allColumnIds.includes("document")
    ? table.getColumn("document")
    : null;
  const statusColumn = allColumnIds.includes("status")
    ? table.getColumn("status")
    : null;
  const typeColumn = allColumnIds.includes("type")
    ? table.getColumn("type")
    : null;
  const classificationColumn = allColumnIds.includes("classification")
    ? table.getColumn("classification")
    : null;

  // Data for filters — use values consistent with Prisma enums (lowercase literals)
  const statusOptions = DOC_STATUS_OPTIONS;

  const typeOptions = [
    { label: "Report", value: "Report" },
    { label: "Invoice", value: "Invoice" },
    { label: "Guideline", value: "Guideline" },
    { label: "Delivery notes", value: "Delivery notes" },
  ];

  const classificationOptions = DOC_CLASSIFICATION_OPTIONS;

  const fileStatusOptions = [
    { label: "Uploaded", value: "uploaded" },
    { label: "Enrolled", value: "enrolled" },
  ];

  return (
    <>
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <UploadDocumentModal
        open={isUploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
      <DocumentFiltersModal
        open={isFiltersModalOpen}
        onOpenChange={setFiltersModalOpen}
        table={table}
      />
      <BulkTransmitModal
        isOpen={isBulkTransmitOpen}
        onClose={() => setBulkTransmitOpen(false)}
        documents={selectedDocuments}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {/* Only show the search bar and filters directly if we're not implementing the modal approach */}
          {/* For now, we'll keep the search bar but add a filter button instead of individual filters */}
          {documentColumn && (
            <div className="relative">
              <Search className="absolute h-5 w-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={(documentColumn.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  documentColumn.setFilterValue(event.target.value)
                }
                className="h-10 w-[200px] lg:w-[300px] pl-10"
              />
            </div>
          )}

          {/* Replace individual filter chips with a single filter button that opens the modal */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersModalOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {isFiltered && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 rounded-full flex items-center justify-center"
              >
                {table.getState().columnFilters.length}
              </Badge>
            )}
          </Button>

          {/* Reset button if there are active filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows;
              if (selectedRows.length === 0) {
                toast.error("Please select documents to transmit");
                return;
              }
              setSelectedDocuments(selectedRows.map((row) => row.original));
              setBulkTransmitOpen(true);
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Transmit
          </Button>
          {showUploadButton && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Document
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </>
  );
}
