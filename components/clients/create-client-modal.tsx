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
import { addClient } from "../../app/lib/client-api";
import { Client } from "../../app/types/client";
import { toast } from "sonner";

export default function CreateClientModal({
  onCreated,
}: {
  onCreated: (c: Client) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phoneNumber: "",
  });

  const fields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "location", label: "Location" },
    { key: "phoneNumber", label: "Phone number" },
  ];

  async function handleSubmit() {
    try {
      const newClient = await addClient(form);
      onCreated(newClient);
      setOpen(false);
      setForm({ name: "", email: "", location: "", phoneNumber: "" });
      toast.success("Client added succesfully!");
    } catch (err: any) {
      console.log(err.message);
      toast.error(JSON.parse(err.message).message, {
        duration: Infinity,
        closeButton: true,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 hover:cursor-pointer">Add Client</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label className="flex items-center">
                {field.label}
                <span className="ml-0.5 text-red-500">*</span>
              </Label>

              <Input
                value={(form as any)[field.key]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full mt-4 hover:cursor-pointer"
        >
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
