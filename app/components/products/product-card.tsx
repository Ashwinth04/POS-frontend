import { Product } from "../../types/product";
import UpdateInventoryModal from "./update-inventory-modal";
import ImagePreview from "./image-preview-dialog";
import EditProductModal from "./edit-product-modal";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProductCard({
  product,
  onUpdated,
  canEdit,
}: {
  product: Product;
  onUpdated?: (p: Product) => void;
  canEdit: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute left-3 top-3 z-20 opacity-0 transition group-hover:opacity-100">
        <EditProductModal
          product={product}
          onUpdated={(updated) => onUpdated?.(updated)}
          trigger={
            canEdit && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full backdrop-blur bg-white/90 hover:bg-white shadow"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex h-full w-full items-center justify-center">
                      <Pencil className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>

                  <TooltipContent>Edit product</TooltipContent>
                </Tooltip>
              </Button>
            )
          }
        />
      </div>

      {/* Image */}
      <div className="relative">
        <ImagePreview url={product.imageUrl} />

        <div className="absolute top-3 right-3">
          <Badge className="bg-black/80 text-white backdrop-blur">
            ₹{" "}
            {new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Number(product.mrp))}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Product info */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-tight line-clamp-2">
            {product.name}
          </h3>

          <p className="text-xs text-muted-foreground">
            Barcode: <span className="font-mono">{product.barcode}</span>
          </p>

          <p className="text-xs text-muted-foreground">
            Client Name: <span className="font-mono">{product.clientName}</span>
          </p>

          <p className="text-xs text-muted-foreground">
            Available inventory:{" "}
            <span className="font-mono">{product.quantity}</span>
          </p>
        </div>

        {/* Action */}
        {canEdit && (
          <div className="pt-2">
            <UpdateInventoryModal
              barcode={product.barcode}
              productId={product.id}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
