"use client";

import { useRef, useState } from "react";
import { uploadTSV } from "../../app/lib/product-api";
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

export default function BulkUploadModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setFile(null);
    setResultUrl(null);
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

      const base64 = await fileToBase64(file);
      const cleanBase64 = base64.split(",")[1];

      const response = await uploadTSV(cleanBase64);

      const decoded = atob(response.base64file);
      const blob = new Blob([decoded], {
        type: "text/tab-separated-values",
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      toast.success("File processed successfully");
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
        <Button variant="outline">Bulk Upload</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* TEMPLATE DOWNLOAD (only before submit) */}
          {!resultUrl && (
            <div className="rounded-lg border border-dashed p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Download template
              </div>
              <p className="mt-1 text-muted-foreground">
                Use this TSV template to ensure correct formatting.
              </p>
              <a
                href="/templates/products-bulk-upload-template.tsv"
                download
                className="mt-3 inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Download className="h-4 w-4" />
                Download TSV template
              </a>
            </div>
          )}

          {/* FILE PICKER */}
          {!resultUrl && (
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
                Only .tsv files are supported
              </p>
            </div>
          )}

          {/* SUBMIT */}
          {!resultUrl && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing…" : "Upload & Process"}
            </Button>
          )}

          {/* RESULT DOWNLOAD */}
          {resultUrl && (
            <div className="rounded-lg border p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-green-600" />
                Product Upload Result
              </div>
              <p className="mt-1 text-muted-foreground">
                Download the result file containing validation outcomes.
              </p>

              <a
                href={resultUrl}
                download="upload-result.tsv"
                className="mt-3 inline-flex items-center gap-2 text-green-700 hover:underline"
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
