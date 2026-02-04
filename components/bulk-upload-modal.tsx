"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, Download } from "lucide-react";

type UploadResponse = {
  status: "SUCCESS" | "UNSUCCESSFUL";
  base64file?: string;
};

type BulkUploadModalProps = {
  title: string;
  templateUrl: string;
  uploadFn: (base64: string) => Promise<UploadResponse>;
  successMessage: string;
  triggerLabel?: string;
  onSuccess?: () => void;
};

export default function BulkUploadModal({
  title,
  templateUrl,
  uploadFn,
  successMessage,
  triggerLabel = "Bulk Upload",
  onSuccess,
}: BulkUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setFile(null);
    setResultUrl(null);
    setFailedCount(null);
    setTotalCount(null);
    setLoading(false);
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) resetState();
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function fileToText(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function handleSubmit() {
    if (!file) {
      toast.error("Please select a TSV file", {
        duration: Infinity,
        closeButton: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Count total rows
      const text = await fileToText(file);
      const inputLines = text.trim().split("\n");
      const totalRows = Math.max(inputLines.length - 1, 0);
      setTotalCount(totalRows);

      const base64 = await fileToBase64(file);
      const cleanBase64 = base64.split(",")[1];

      const response = await uploadFn(cleanBase64);

      if (response.status === "SUCCESS") {
        toast.success(successMessage);
        onSuccess?.();
        setOpen(false);
        resetState();
        return;
      }

      // UNSUCCESSFUL → show result BELOW submit button
      if (response.base64file) {
        const decoded = atob(response.base64file);
        const resultLines = decoded.trim().split("\n");
        const failedRows = Math.max(resultLines.length - 1, 0);

        setFailedCount(failedRows);

        const blob = new Blob([decoded], {
          type: "text/tab-separated-values",
        });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);

        // 👇 Clear file so user can upload again
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template */}
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Download template
            </div>
            <p className="mt-1 text-muted-foreground">
              Use this TSV template to ensure correct formatting.
            </p>
            <a
              href={templateUrl}
              download
              className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Download className="h-4 w-4" />
              Download TSV template
            </a>
          </div>

          {/* File picker */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".tsv"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {file ? file.name : "Choose TSV file"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Only .tsv files are supported{" "}
              <span className="text-red-500">
                (Maximum Limit: 5000 rows per file)
              </span>
            </p>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Processing…" : "Upload & Process"}
          </Button>

          {/* Failure result (shown ONLY on failure) */}
          {resultUrl && (
            <div className="rounded-lg border p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-red-600" />
                Upload Result
              </div>
              <p className="mt-1 text-muted-foreground">
                {failedCount} / {totalCount} rows failed validation.
              </p>

              <a
                href={resultUrl}
                download="upload-result.tsv"
                className="mt-3 inline-flex items-center gap-2 text-red-700 hover:underline"
              >
                <Download className="h-4 w-4" />
                Download result file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
