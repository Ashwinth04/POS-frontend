"use client";

import { useState } from "react";
import { addProduct } from "../../lib/product-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddProductModal({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({
    barcode: "",
    clientName: "",
    name: "",
    mrp: "",
    imageUrl: "",
  });

  async function handleSubmit() {
    try {
      if (!form.mrp || isNaN(Number(form.mrp))) {
        toast.error("MRP must be a valid number", {
          duration: Infinity,
          closeButton: true,
        });
        return;
      }

      await addProduct({ ...form, mrp: Number(form.mrp) });
      onAdded();
    } catch (err: any) {
      toast.error(err.message, {
        duration: Infinity,
        closeButton: true,
      });
    }
  }

  const fields = [
    { key: "barcode", label: "Barcode", required: true },
    { key: "clientName", label: "Client Name", required: true },
    { key: "name", label: "Product Name", required: true },
    { key: "mrp", label: "MRP", required: true },
    { key: "imageUrl", label: "Image URL", required: false },
  ] as const;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Add Product</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {fields.map(({ key, label, required }) => (
            <div key={key} className="grid gap-1">
              <Label>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              <Input
                placeholder={label}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="mt-4 w-full hover:cursor-pointer"
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
