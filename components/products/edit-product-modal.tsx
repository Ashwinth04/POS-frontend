"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Product = {
  id?: string;
  barcode: string;
  clientName: string;
  name: string;
  mrp: number;
  imageUrl: string;
  quantity: number;
};

export default function EditProductModal({
  product,
  onUpdated,
  trigger,
}: {
  product: Product;
  onUpdated: (updated: Product) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Product>({ ...product });

  // ✅ Keep form in sync with latest product
  useEffect(() => {
    setForm({ ...product });
  }, [product]);

  function handleChange(field: keyof Product, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: field === "mrp" ? Number(value) : value,
    }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/products/edit", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      toast.success("Product updated successfully");

      // ✅ Notify parent with updated product
      onUpdated(data);

      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Barcode</Label>
            <Input value={form.barcode} disabled />
          </div>

          <div>
            <Label>Client Name</Label>
            <Input
              value={form.clientName}
              onChange={(e) =>
                handleChange("clientName", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Product Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
            />
          </div>

          <div>
            <Label>MRP</Label>
            <Input
              type="number"
              value={form.mrp}
              onChange={(e) =>
                handleChange("mrp", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                handleChange("imageUrl", e.target.value)
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
