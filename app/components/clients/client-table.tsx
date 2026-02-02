"use client";

import { Client } from "../../types/client";
import EditClientModal from "./edit-client-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ClientTable({
  clients,
  setClients,
  canEdit,
}: {
  clients: Client[];
  setClients: (c: Client[]) => void;
  canEdit: boolean;
}) {
  function handleUpdate(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
  }

  return (
    <Table className="w-full table-auto">
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} className="hover:bg-muted/40">
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.location}</TableCell>
            <TableCell>{client.phoneNumber}</TableCell>
            <TableCell className="text-right">
              {canEdit ? (
                <EditClientModal client={client} onUpdated={handleUpdate} />
              ) : (
                <Button disabled size="sm" variant="outline">
                  Edit
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
