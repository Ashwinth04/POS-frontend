"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateClient } from "../../lib/client-api"
import { Client } from "../../types/client"
import { toast } from "sonner"

export default function EditClientModal({
  client,
  onUpdated
}: {
  client: Client
  onUpdated: (updated: Client) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(client)

  async function handleSave() {
    try {
        const updated = await updateClient(client.name, form)
        onUpdated(updated)
        setOpen(false)
    } catch(err: any) {
        toast.error(JSON.parse(err.message).message)
    }
    
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:cursor-pointer">Edit</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {["name", "email", "location", "phoneNumber"].map((field) => (
            <div key={field}>
              <Label>{field}</Label>
              <Input
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="mt-4 hover:cursor-pointer">Save</Button>
      </DialogContent>
    </Dialog>
  )
}
