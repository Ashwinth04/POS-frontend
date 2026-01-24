"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

async function bulkUpdateInventory(base64file: string) {
  const res = await fetch("http://localhost:8080/api/inventory/bulkUpdate", {
    method: "POST",
    credentials: "include", // important for session auth
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64file }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Bulk update failed")
  }

  return res.json()
}

export default function InventoryBulkUpdateModal() {
  const [open, setOpen] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  function resetState() {
    setFile(null)
    setLoading(false)
    setResultUrl(null)
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) resetState()
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
      const clean = base64.split(",")[1]

      const response = await bulkUpdateInventory(clean)

      console.log("Response: " + response.status + " " + response.base64file)

      if (response.status === "SUCCESS") {
        toast.success("Inventory updated successfully")
        setResultUrl(null)
      } else {
        toast.error("Some rows failed. Download the result file.")
        
        const decoded = atob(response.base64file)
        const blob = new Blob([decoded], {
          type: "text/tab-separated-values",
        })
        const url = URL.createObjectURL(blob)

        setResultUrl(url)
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Inventory Update</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Inventory Update</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="file"
            accept=".tsv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>

          {resultUrl && (
            <a
              href={resultUrl}
              download="inventory-update-result.tsv"
              className="block text-sm text-red-600 underline"
            >
              Download Result File
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
