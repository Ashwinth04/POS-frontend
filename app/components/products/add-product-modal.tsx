"use client"

import { useState } from "react"
import { addProduct } from "../../lib/product-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {toast} from "sonner"

export default function AddProductModal({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({
    barcode: "",
    clientName: "",
    name: "",
    mrp: "",
    imageUrl: "",
  })

  async function handleSubmit() {
    try {
        
        if (!form.mrp || isNaN(Number(form.mrp))) {
          toast.error("MRP must be a valid number")
          return
        }

        await addProduct({ ...form, mrp: Number(form.mrp) })
        onAdded()
    } catch (err: any) {
        toast.error(err.message)
    }
    
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Add Product</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {Object.keys(form).map((k) => (
            <Input
              key={k}
              placeholder={k}
              value={(form as any)[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
        </div>

        <Button onClick={handleSubmit} className="mt-4 w-full hover:cursor-pointer">
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  )
}
