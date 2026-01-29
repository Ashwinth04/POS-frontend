"use client"

import { useState } from "react"
import { updateInventory } from "../../lib/inventory-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { toast } from "sonner"


export default function UpdateInventoryModal({ barcode }: { barcode: string }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState("")

  async function handleSubmit() {
  try {
    const res = await updateInventory(barcode, Number(qty))
    setOpen(false)
    toast.success("Inventory updated successfully!")
  } catch (err) {
    console.error(err)

    toast.error(
      err?.response?.data?.message || 
      err?.message || 
      "Failed to update inventory"
    )
  }
}


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
  size="sm"
  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer"
>
  Update Inventory
</Button>

      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Enter quantity"
          value={qty}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {   // allows only digits
              setQty(value);
            }
          }}
        />

        <Button onClick={handleSubmit} className="w-full mt-4 hover:cursor-pointer">
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  )
}
