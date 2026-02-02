"use client";

import { useState } from "react";
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
import { updateClient } from "../../app/lib/client-api";
import { Client } from "../../app/types/client";
import { toast } from "sonner";

export default function EditClientModal({
  client,
  onUpdated,
}: {
  client: Client;
  onUpdated: (updated: Client) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(client);
  const fields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "location", label: "Location" },
    { key: "phoneNumber", label: "Phone number" },
  ];

  async function handleSave() {
    try {
      const updated = await updateClient(client.name, form);
      onUpdated(updated);
      setOpen(false);
    } catch (err: any) {
      toast.error(JSON.parse(err.message).message, {
        duration: Infinity,
        closeButton: true,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:cursor-pointer">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={(form as any)[key]}
                disabled={key === "name"}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="mt-4 hover:cursor-pointer">
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
