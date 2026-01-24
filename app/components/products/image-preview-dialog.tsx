"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ImagePreview({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={url}
          alt="Product image"
          className="h-48 w-full object-cover rounded-xl cursor-pointer transition hover:scale-[1.02]"
        />
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Image</DialogTitle>
        </DialogHeader>

        <img
          src={url}
          alt="Large product"
          className="w-full rounded-xl"
        />
      </DialogContent>
    </Dialog>
  )
}
