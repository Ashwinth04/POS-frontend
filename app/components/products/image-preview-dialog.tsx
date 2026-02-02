"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageOff } from "lucide-react";

export default function ImagePreview({ url }: { url?: string }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-t-2xl bg-muted text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Image not found</span>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="block h-48 w-full overflow-hidden rounded-t-2xl">
          <img
            src={url}
            alt="Product image"
            onError={() => setError(true)}
            className="block h-full w-full object-cover transition hover:scale-[1.02]"
          />
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Product Image</DialogTitle>
        </DialogHeader>

        <img
          src={url}
          alt="Large product"
          onError={() => setError(true)}
          className="w-full rounded-xl"
        />
      </DialogContent>
    </Dialog>
  );
}
