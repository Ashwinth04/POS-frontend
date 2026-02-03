"use client";

import { useState } from "react";
import { updateInventory } from "../../app/lib/inventory-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const MAX_QTY = 100000;

export default function UpdateInventoryModal({
  barcode,
  productId,
  onUpdated,
}: {
  barcode: string;
  productId: string;
  onUpdated?: (quantity: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const isInvalid = qty === "" || qty < 0 || qty > MAX_QTY;

  async function handleSubmit() {
    if (isInvalid) return;

    try {
      setLoading(true);

      await updateInventory(productId, qty as number);

      toast.success("Inventory updated successfully!");

      // ✅ Notify parent immediately
      onUpdated?.(qty as number);

      setOpen(false);
      setQty("");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update inventory",
        {
          duration: Infinity,
          closeButton: true,
        },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Update Inventory
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Adjust the available stock for this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Quantity</label>

            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_QTY}
              placeholder="Enter quantity"
              value={qty}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setQty("");
                  return;
                }

                const num = Number(value);
                if (Number.isInteger(num) && num >= 0 && num <= MAX_QTY) {
                  setQty(num);
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />

            <p className="text-xs text-muted-foreground">
              Max allowed quantity: {MAX_QTY.toLocaleString()}
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isInvalid || loading}
            >
              {loading ? "Updating..." : "Update Inventory"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
