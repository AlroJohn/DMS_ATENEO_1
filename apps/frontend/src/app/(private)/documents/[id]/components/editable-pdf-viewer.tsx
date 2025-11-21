"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { Rnd } from "react-rnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Move,
  PenLine,
  Save,
  Type,
  Undo2,
  X,
} from "lucide-react";
import type { DocumentFileMetadata } from "@/hooks/use-document-files";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf";

const PDFJS_WORKER_CDN =
  process.env.NEXT_PUBLIC_PDFJS_WORKER_URL ||
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/legacy/build/pdf.worker.min.mjs";

if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
}

type AnnotationType = "text" | "image" | "signature";

interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextAnnotation extends BaseAnnotation {
  type: "text";
  text: string;
  fontSize: number;
  fontName: StandardFonts;
  backgroundColor?: string | null;
}

interface ImageAnnotation extends BaseAnnotation {
  type: "image" | "signature";
  dataUrl: string;
  mimeType: string;
}

type Annotation = TextAnnotation | ImageAnnotation;

interface PdfPageRender {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

interface EditablePdfViewerProps {
  documentId: string;
  files: DocumentFileMetadata[];
  initialFileId?: string | null;
  isLoadingFiles: boolean;
  onExit: () => void;
  onSaved: () => void;
}

const isPdfLikeFile = (file?: DocumentFileMetadata | null) => {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (type.includes("pdf")) return true;
  const name = (file.name || "").toLowerCase();
  return name.endsWith(".pdf");
};

const createAnnotationId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataUrlToUint8Array = (dataUrl: string) => {
  const parts = dataUrl.split(",");
  const base64 = parts[1] ?? "";
  const byteString = atob(base64);
  const buffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i);
  }
  return buffer;
};

const hexToRgbColor = (hex?: string | null) => {
  if (!hex || hex === "transparent") return null;
  const normalized = hex.replace("#", "");
  if (![3, 6].includes(normalized.length)) return null;
  const expand = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const num = parseInt(expand, 16);
  if (Number.isNaN(num)) return null;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return rgb(r / 255, g / 255, b / 255);
};

export function EditablePdfViewer({
  documentId,
  files,
  initialFileId,
  isLoadingFiles,
  onExit,
  onSaved,
}: EditablePdfViewerProps) {
  const FONT_OPTIONS: Array<{
    id: StandardFonts;
    label: string;
    cssFamily: string;
    fontWeight?: string;
    fontStyle?: string;
  }> = [
    {
      id: StandardFonts.Helvetica,
      label: "Helvetica",
      cssFamily: "Helvetica, Arial, sans-serif",
    },
    {
      id: StandardFonts.HelveticaBold,
      label: "Helvetica Bold",
      cssFamily: "Helvetica, Arial, sans-serif",
      fontWeight: "700",
    },
    {
      id: StandardFonts.HelveticaOblique,
      label: "Helvetica Italic",
      cssFamily: "Helvetica, Arial, sans-serif",
      fontStyle: "italic",
    },
    {
      id: StandardFonts.TimesRoman,
      label: "Times",
      cssFamily: "'Times New Roman', Times, serif",
    },
    {
      id: StandardFonts.TimesRomanBold,
      label: "Times Bold",
      cssFamily: "'Times New Roman', Times, serif",
      fontWeight: "700",
    },
    {
      id: StandardFonts.TimesRomanItalic,
      label: "Times Italic",
      cssFamily: "'Times New Roman', Times, serif",
      fontStyle: "italic",
    },
    {
      id: StandardFonts.Courier,
      label: "Courier",
      cssFamily: "'Courier New', Courier, monospace",
    },
  ];

  const getFontStyle = (fontName: StandardFonts | undefined) => {
    const fallback = FONT_OPTIONS[0];
    if (!fontName) return fallback;
    return FONT_OPTIONS.find((f) => f.id === fontName) ?? fallback;
  };

  const pdfFiles = useMemo(
    () => files.filter((file) => isPdfLikeFile(file)),
    [files]
  );
  const [internalSelectedFileId, setInternalSelectedFileId] = useState<
    string | null
  >(initialFileId ?? pdfFiles[0]?.id ?? null);

  const selectedFile = useMemo(() => {
    if (!pdfFiles || pdfFiles.length === 0) return null;

    let targetFileId: string | null = null;

    // 1. Prioritize initialFileId from URL
    if (initialFileId) {
      targetFileId = initialFileId;
    } else if (internalSelectedFileId) {
      // 2. Fallback to internal selection if no initialFileId
      targetFileId = internalSelectedFileId;
    } else {
      // 3. Fallback to the first PDF file if no explicit selection
      targetFileId = pdfFiles[0]?.id ?? null;
    }

    const foundFile = targetFileId
      ? pdfFiles.find((file) => file.id === targetFileId)
      : null;

    // If a file was found with the targetFileId, use it. Otherwise, fall back to the first file.
    return foundFile || pdfFiles[0] || null;
  }, [pdfFiles, initialFileId, internalSelectedFileId]);

  // Moved pages state and its direct useEffect here
  const [pages, setPages] = useState<PdfPageRender[]>([]);
  const [activePage, setActivePage] = useState(1); // activePage also moved here as it's directly related to pages
  const [isRendering, setIsRendering] = useState(false);

  console.log("DEBUG: EditablePdfViewer - pages state:", pages);

  useEffect(() => {
    console.log(
      "DEBUG: EditablePdfViewer - pages/activePage useEffect triggered. pages.length:",
      pages.length,
      "activePage:",
      activePage
    );
    if (pages.length === 0) {
      setActivePage(1);
    } else if (activePage > pages.length) {
      setActivePage(1);
    }
  }, [pages, activePage]);

  useEffect(() => {
    let isMounted = true;
    let loadingTask: { destroy?: () => Promise<void> } | null = null;
    const renderTasks: Array<{ cancel?: () => void }> = [];

    const renderPdfPages = async () => {
      if (!selectedFile) {
        setPages([]);
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      try {
        const url = `/api/documents/${documentId}/files/${selectedFile.id}/stream?download=1`;
        loadingTask = getDocument({
          url,
          withCredentials: true,
          useWorkerFetch: true,
          isEvalSupported: false,
        });

        const pdf = await loadingTask.promise;
        const renderedPages: PdfPageRender[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Unable to get canvas context for PDF rendering.");
          }
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderTask = page.render({ canvasContext: context, viewport });
          renderTasks.push(renderTask);
          await renderTask.promise;

          if (!isMounted) return;

          const imageUrl = canvas.toDataURL("image/png");

          renderedPages.push({
            pageNumber,
            imageUrl,
            width: viewport.width,
            height: viewport.height,
            pdfWidth: viewport.width,
            pdfHeight: viewport.height,
          });
        }

        if (isMounted) {
          setPages(renderedPages);
          setActivePage((prev) => Math.min(prev, renderedPages.length) || 1);
        }
      } catch (error: any) {
        // RenderingCancelledException is expected when switching files mid-render
        if (
          error?.name === "RenderingCancelledException" ||
          error?.message?.includes("Worker was destroyed")
        ) {
          console.warn(
            "PDF render was cancelled or worker was destroyed during cleanup."
          );
        } else {
          console.error("Failed to render PDF for editing", error);
          if (isMounted) {
            setPages([]);
            toast.error("Unable to load PDF for editing. Please try again.");
          }
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    renderPdfPages();

    return () => {
      isMounted = false;
      renderTasks.forEach((task) => {
        try {
          task?.cancel?.();
        } catch {
          // ignore
        }
      });
      if (loadingTask?.destroy) {
        loadingTask.destroy().catch(() => {
          /* ignore cleanup errors */
        });
      }
    };
  }, [documentId, selectedFile]);

  // Original useEffect for rendering pages (depends on selectedFile) remains in its position.
  // const [pages, setPages] = useState<PdfPageRender[]>([]); // This line was moved and removed
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  // const [activePage, setActivePage] = useState(1); // This line was moved and removed
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAssetType, setPendingAssetType] = useState<
    "image" | "signature" | null
  >(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  const measureTextDimensions = (
    text: string,
    fontSize: number,
    fontName?: StandardFonts
  ) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { width: 80, height: fontSize + 4 };
    }
    const fontStyle = getFontStyle(fontName);
    const weight = fontStyle.fontWeight ? `${fontStyle.fontWeight} ` : "";
    const style = fontStyle.fontStyle ? `${fontStyle.fontStyle} ` : "";
    context.font = `${style}${weight}${fontSize}px ${fontStyle.cssFamily}`;

    const lines = text.split("\n");
    const widths = lines.map((line) => context.measureText(line).width);
    const maxWidth = Math.max(...widths);
    const height = lines.length * (fontSize + 2);

    return { width: maxWidth + 8, height };
  };

  const handleAddText = () => {
    if (!selectedFile || pages.length === 0) return;
    const initialText = "Enter text";
    const initialFontSize = 14;
    const { width: initialWidth, height: initialHeight } =
      measureTextDimensions(
        initialText,
        initialFontSize,
        StandardFonts.Helvetica
      );
    const newAnnotation: TextAnnotation = {
      id: createAnnotationId(),
      type: "text",
      pageNumber: activePage,
      x: 40,
      y: 40,
      width: initialWidth,
      height: initialHeight,
      text: initialText,
      fontSize: initialFontSize,
      fontName: StandardFonts.Helvetica,
      backgroundColor: "#ffffff",
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
    setEditingTextId(newAnnotation.id);
  };
  const handleRequestAsset = (type: "image" | "signature") => {
    setPendingAssetType(type);
    assetInputRef.current?.click();
  };

  const handleAssetChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const newAnnotation: ImageAnnotation = {
        id: createAnnotationId(),
        type: pendingAssetType ?? "image",
        pageNumber: activePage,
        x: 48,
        y: 48,
        width: 200,
        height: 90,
        dataUrl,
        mimeType: file.type || "image/png",
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    } catch (error) {
      console.error("Failed to read image", error);
      toast.error("Unable to load the selected image.");
    } finally {
      if (event.target) {
        event.target.value = "";
      }
      setPendingAssetType(null);
    }
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) =>
      prev.map((annotation) =>
        annotation.id === id
          ? ({ ...annotation, ...updates } as Annotation)
          : annotation
      )
    );
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
    if (editingTextId === id) {
      setEditingTextId(null);
    }
  };

  const clampPosition = (annotation: Annotation, x: number, y: number) => {
    const pageMeta = pages.find(
      (page) => page.pageNumber === annotation.pageNumber
    );
    if (!pageMeta) return { x, y };
    const maxX = Math.max(0, pageMeta.width - annotation.width);
    const maxY = Math.max(0, pageMeta.height - annotation.height);
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  };

  const updateAnnotationPosition = (id: string, x: number, y: number) => {
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== id) return annotation;
        const clamped = clampPosition(annotation, x, y);
        return { ...annotation, ...clamped };
      })
    );
  };

  const updateAnnotationSize = (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => {
    setAnnotations((prev) =>
      prev.map((annotation) => {
        if (annotation.id !== id) return annotation;
        const clamped = clampPosition(annotation, x, y);
        return { ...annotation, width, height, ...clamped };
      })
    );
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setEditingTextId(null);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Select a PDF file to edit first.");
      return;
    }
    if (annotations.length === 0) {
      toast.error("Add at least one text, image, or signature before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const sortedPdfFiles = [...pdfFiles].sort((a, b) => {
        const versionA = parseFloat(a.version || "0");
        const versionB = parseFloat(b.version || "0");
        return versionA - versionB;
      });

      // Use the currently selected file as the source; fall back to the oldest if missing
      const sourceFile = selectedFile || sortedPdfFiles[0];

      if (!sourceFile) {
        throw new Error("No PDF file found to edit");
      }

      const response = await fetch(
        `/api/documents/${documentId}/files/${sourceFile.id}/stream?download=1`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to download the PDF");
      }

      const buffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const fontCache = new Map<StandardFonts, PDFFont>();
      const getFont = async (fontName: StandardFonts) => {
        if (fontCache.has(fontName)) return fontCache.get(fontName)!;
        const embedded = await pdfDoc.embedFont(fontName);
        fontCache.set(fontName, embedded);
        return embedded;
      };

      for (const annotation of annotations) {
        const meta = pages.find(
          (page) => page.pageNumber === annotation.pageNumber
        );
        if (!meta) continue;
        const page = pdfDoc.getPage(annotation.pageNumber - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const x = (annotation.x / meta.width) * pageWidth;
        const renderWidth = (annotation.width / meta.width) * pageWidth;
        const renderHeight = (annotation.height / meta.height) * pageHeight;
        const yTop = pageHeight - (annotation.y / meta.height) * pageHeight;
        const yBottom = yTop - renderHeight;

        if (annotation.type === "text") {
          const fontSize = annotation.fontSize ?? 14;
          const font = await getFont(
            annotation.fontName || StandardFonts.Helvetica
          );
          const textValue = annotation.text || "";
          const measuredTextWidth = font.widthOfTextAtSize(textValue, fontSize);
          const rectWidth = Math.max(annotation.width, measuredTextWidth);
          const rectHeight = Math.max(annotation.height, fontSize + 2);
          const rectX = x;
          const rectY = yBottom - 2;
          page.drawRectangle({
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            color: rgb(1, 1, 1),
          });
          const textY = yBottom;
          page.drawText(textValue, {
            x,
            y: textY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
            maxWidth: annotation.width,
            lineHeight: fontSize + 1,
          });
        } else if (
          annotation.type === "image" ||
          annotation.type === "signature"
        ) {
          const bytes = dataUrlToUint8Array(annotation.dataUrl);
          const image = annotation.mimeType.includes("png")
            ? await pdfDoc.embedPng(bytes)
            : await pdfDoc.embedJpg(bytes);
          page.drawImage(image, {
            x,
            y: yBottom,
            width: renderWidth,
            height: renderHeight,
          });
        }
      }

      const editedBytes = await pdfDoc.save();
      const editedFileName = `${(selectedFile.name || "document")
        .replace(/\.pdf$/i, "")
        .trim()}-edited-${Date.now()}.pdf`;
      const editedCopy = new Uint8Array(editedBytes);
      const editedBlob = new Blob([editedCopy], { type: "application/pdf" });
      const editedFile = new File([editedBlob], editedFileName, {
        type: "application/pdf",
      });
      const formData = new FormData();
      formData.append("files", editedFile);

      const uploadResponse = await fetch(`/api/documents/${documentId}/files`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const uploadResult = await uploadResponse.json().catch(() => ({
        success: uploadResponse.ok,
      }));

      if (!uploadResponse.ok || uploadResult.success === false) {
        throw new Error(
          uploadResult.error?.message || "Failed to upload edited PDF."
        );
      }

      toast.success(
        "Saved a new PDF version. The previous file remains available."
      );
      clearAnnotations();
      onSaved();
    } catch (error: any) {
      console.error("Failed to save PDF edits", error);
      toast.error(error.message || "Unable to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const clampFontSize = (value: number) => {
    if (Number.isNaN(value)) return 12;
    return Math.max(6, Math.min(value, 150));
  };

  const renderAnnotationControls = () => {
    if (!selectedAnnotationId) return null;
    const annotation = annotations.find(
      (item) => item.id === selectedAnnotationId
    );
    if (!annotation) return null;
    return (
      <div className="rounded-md border bg-background p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium capitalize">{annotation.type}</p>
            <p className="text-xs text-muted-foreground">
              Page {annotation.pageNumber}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeAnnotation(annotation.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {annotation.type === "text" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Font
                </label>
                <select
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  value={annotation.fontName}
                  onChange={(event) => {
                    const nextFont = event.target.value as StandardFonts;
                    const dims = measureTextDimensions(
                      annotation.text,
                      annotation.fontSize,
                      nextFont
                    );
                    updateAnnotation(annotation.id, {
                      fontName: nextFont,
                      width: dims.width,
                      height: dims.height,
                    });
                  }}
                >
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs font-medium text-muted-foreground">
                  Font size
                </label>
                <input
                  type="number"
                  min={6}
                  max={150}
                  step={1}
                  value={annotation.fontSize}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    const nextSize = clampFontSize(raw);
                    const dims = measureTextDimensions(
                      annotation.text,
                      nextSize,
                      annotation.fontName
                    );
                    updateAnnotation(annotation.id, {
                      fontSize: nextSize,
                      width: dims.width,
                      height: dims.height,
                    });
                  }}
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                />
              </div>
            </div>
            <input
              type="range"
              min={6}
              max={150}
              step={1}
              value={annotation.fontSize}
              onChange={(event) => {
                const raw = Number(event.target.value);
                const nextSize = clampFontSize(raw);
                const dims = measureTextDimensions(
                  annotation.text,
                  nextSize,
                  annotation.fontName
                );
                updateAnnotation(annotation.id, {
                  fontSize: nextSize,
                  width: dims.width,
                  height: dims.height,
                });
              }}
              className="w-full"
            />
          </div>
        )}
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>
            Position: X {Math.round(annotation.x)} px • Y{" "}
            {Math.round(annotation.y)} px
          </p>
          <p>
            Size: {Math.round(annotation.width)} ×{" "}
            {Math.round(annotation.height)} px
          </p>
        </div>
      </div>
    );
  };

  const annotationToolsDisabled =
    !selectedFile || isRendering || pages.length === 0;

  const handleCanvasBackgroundClick = () => {
    setSelectedAnnotationId(null);
    setEditingTextId(null);
  };

  return (
    <Card className="border-2 h-fit border-primary/40 bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Edit PDF
          {selectedFile && (
            <Badge variant="secondary" className="ml-1">
              {selectedFile.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile && (
          <AlertNoPdf hasFiles={pdfFiles.length > 0} onExit={onExit} />
        )}

        {selectedFile && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {/* Only show file selector if no specific file was selected (initialFileId is null) */}
              {!initialFileId && pdfFiles.length > 1 && (
                <Select
                  value={internalSelectedFileId ?? ""}
                  onValueChange={(value) => setInternalSelectedFileId(value)}
                  disabled={pdfFiles.length <= 1}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pick a PDF version" />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name}
                        {file.version ? ` · v${file.version}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Show selected file info when viewing a specific version */}
              {initialFileId && selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                    {selectedFile.version ? ` · v${selectedFile.version}` : ""}
                  </span>
                </div>
              )}

              <Select
                value={String(activePage)}
                onValueChange={(value) => setActivePage(Number(value))}
                disabled={pages.length <= 1}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem
                      key={page.pageNumber}
                      value={String(page.pageNumber)}
                    >
                      Page {page.pageNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddText}
                  disabled={annotationToolsDisabled}
                >
                  <Type className="mr-1 h-4 w-4" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestAsset("image")}
                  disabled={annotationToolsDisabled}
                >
                  <ImageIcon className="mr-1 h-4 w-4" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestAsset("signature")}
                  disabled={annotationToolsDisabled}
                >
                  <PenLine className="mr-1 h-4 w-4" />
                  Signature
                </Button>
              </div>

              <div className="flex flex-1 justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAnnotations}
                  disabled={annotations.length === 0}
                >
                  <Undo2 className="mr-1 h-4 w-4" />
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={onExit}>
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Place text, images, or signatures on the canvas. Saving will
              upload a new version and keep previous files intact.
            </p>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 overflow-auto rounded-md border bg-background p-3">
                {isRendering && (
                  <div className="flex flex-col items-center justify-center gap-2 py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Rendering PDF pages…
                    </p>
                  </div>
                )}

                {!isRendering && pages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Select a PDF file to begin editing.
                  </p>
                )}

                {!isRendering &&
                  pages.map((page) => (
                    <div key={page.pageNumber} className="mb-6">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        Page {page.pageNumber}
                      </div>
                      <div
                        className="relative rounded border bg-white shadow-sm"
                        style={{ width: page.width, height: page.height }}
                      >
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                        />
                      <div
                        className="absolute inset-0"
                        style={{ width: page.width, height: page.height }}
                        onMouseDown={handleCanvasBackgroundClick}
                        >
                          {annotations
                            .filter(
                              (annotation) =>
                                annotation.pageNumber === page.pageNumber
                            )
                            .map((annotation) => (
                              <RndAnnotation
                                key={annotation.id}
                                annotation={annotation}
                                selected={
                                  annotation.id === selectedAnnotationId
                                }
                                onSelect={() =>
                                  setSelectedAnnotationId(annotation.id)
                                }
                                onPositionChange={updateAnnotationPosition}
                                onResize={updateAnnotationSize}
                                onRemove={removeAnnotation}
                              >
                                {annotation.type === "text" ? (
                                  <textarea
                                    rows={1} // <-- important: start as 1 line only
                                    className="
                                      annotation-input
                                      min-w-[24px]
                                      w-full
                                      resize-none
                                      bg-white
                                      text-sm
                                      text-black
                                      outline-none
                                      p-0
                                      leading-none
                                      overflow-hidden
                                    "
                                    value={annotation.text}
                                    style={{
                                      fontSize: annotation.fontSize,
                                      lineHeight: `${
                                        annotation.fontSize + 2
                                      }px`,
                                      whiteSpace: "nowrap",
                                      fontFamily: getFontStyle(
                                        annotation.fontName
                                      ).cssFamily,
                                      fontWeight: getFontStyle(
                                        annotation.fontName
                                      ).fontWeight,
                                      fontStyle: getFontStyle(
                                        annotation.fontName
                                      ).fontStyle,
                                    }}
                                    onChange={(event) => {
                                      const el = event.target;

                                      // auto-grow height
                                      el.style.height = "auto";
                                      el.style.height = `${el.scrollHeight}px`;

                                      const newText = el.value;
                                      const dims = measureTextDimensions(
                                        newText,
                                        annotation.fontSize,
                                        annotation.fontName
                                      );

                                      updateAnnotation(annotation.id, {
                                        text: newText,
                                        width: dims.width, // allow shrinking
                                        height: dims.height, // keep annotation height tight to content
                                      });
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={annotation.dataUrl}
                                    alt={annotation.type}
                                    className="h-full w-full rounded object-contain"
                                  />
                                )}
                              </RndAnnotation>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="w-full max-w-sm space-y-3 rounded-md border bg-background p-3">
                <div className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                  Saving uploads a brand-new PDF to this document. Older
                  versions stay visible in the file list for auditing and
                  rollback.
                </div>

                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="text-sm font-medium">Annotations</p>
                  <p className="text-xs text-muted-foreground">
                    {annotations.length === 0
                      ? "No annotations yet."
                      : `${annotations.length} item${
                          annotations.length === 1 ? "" : "s"
                        } added`}
                  </p>
                </div>

                {renderAnnotationControls()}

                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving || annotations.length === 0}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as New Version
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        <input
          ref={assetInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAssetChosen}
        />
      </CardContent>
    </Card>
  );
}

interface RndAnnotationProps {
  annotation: Annotation;
  selected: boolean;
  onSelect: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onResize: (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  onMouseDownCapture?: (event: React.MouseEvent) => void;
}

function RndAnnotation({
  annotation,
  selected,
  onSelect,
  onPositionChange,
  onResize,
  onRemove,
  children,
  onMouseDownCapture,
}: RndAnnotationProps) {
  const minWidth = annotation.type === "text" ? 24 : 40;
  const minHeight =
    annotation.type === "text"
      ? Math.max(18, Math.round(annotation.fontSize) + 4)
      : 40;
  const enableResizing = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    topRight: true,
    topLeft: true,
    bottomRight: true,
    bottomLeft: true,
  };

  return (
    <Rnd
      size={{ width: annotation.width, height: annotation.height }}
      position={{ x: annotation.x, y: annotation.y }}
      bounds="parent"
      minWidth={minWidth}
      minHeight={minHeight}
      enableResizing={enableResizing}
      dragHandleClassName="annotation-drag-handle"
      onDragStop={(_, data) => onPositionChange(annotation.id, data.x, data.y)}
      onResizeStop={(_, _dir, ref, _delta, position) => {
        onResize(
          annotation.id,
          ref.offsetWidth,
          ref.offsetHeight,
          position.x,
          position.y
        );
      }}
      className={cn(
        "absolute annotation-drag-handle rounded-md border p-0 shadow-sm group",
        selected ? "border-primary ring-2 ring-primary/60" : "border-muted",
        annotation.type === "text" ? "bg-transparent" : "bg-white/0"
      )}
    >
      <div className="relative h-fit w-full">
        <div className="annotation-drag-handle absolute -left-1 -top-8 cursor-pointer flex items-center gap-1 rounded-full border border-muted/50 bg-white/80 px-2 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
          <Move className="h-3 w-3" />
          Drag
        </div>
        {children}
        {/* <button
          type="button"
          className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-600 shadow"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(annotation.id);
          }}
        >
          <X className="h-3 w-3" />
        </button> */}
      </div>
    </Rnd>
  );
}

function AlertNoPdf({
  hasFiles,
  onExit,
}: {
  hasFiles: boolean;
  onExit: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
      {hasFiles ? (
        <p>
          None of the uploaded files for this document are PDFs. Upload a PDF
          version first, then reopen the editor.
        </p>
      ) : (
        <p>
          This document does not have any files yet. Upload a PDF via the “Add
          File” button to start editing.
        </p>
      )}
      <Button variant="outline" size="sm" className="mt-3" onClick={onExit}>
        Go back
      </Button>
    </div>
  );
}
