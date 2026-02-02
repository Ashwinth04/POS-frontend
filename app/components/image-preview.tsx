"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ImagePreview({ url }: { url?: string }) {
  const [error, setError] = useState(false);

  // If no URL or failed to load → show fallback
  if (!url || error) {
    return (
      <div className="flex h-48 w-full items-center justify-center bg-muted text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Image not found</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Product image"
      className="h-48 w-full object-cover"
      onError={() => setError(true)}
    />
  );
}
