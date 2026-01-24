"use client"

import { useState } from "react"
import { uploadTSV } from "../../lib/product-api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function BulkUploadModal() {
  const [open, setOpen] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function resetState() {
    setFile(null)
    setResultUrl(null)
    setLoading(false)
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)

    // When closing the modal, reset everything
    if (!value) {
      resetState()
    }
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit() {
    if (!file) {
      toast.error("Please select a TSV file")
      return
    }

    try {
      setLoading(true)

      const base64 = await fileToBase64(file)
      const cleanBase64 = base64.split(",")[1]

      const response = await uploadTSV(cleanBase64)

      const decoded = atob(response.base64file)
      const blob = new Blob([decoded], { type: "text/tab-separated-values" })
      const url = URL.createObjectURL(blob)

      setResultUrl(url)
      toast.success("File processed successfully")
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Upload</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload TSV File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <input
            type="file"
            accept=".tsv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>

          {/* Download */}
          {resultUrl && (
            <a
              href={resultUrl}
              download="upload-result.tsv"
              className="block text-sm text-blue-600 underline"
            >
              Download Result File
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
