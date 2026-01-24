"use client"

import { Client } from "../../types/client"
import EditClientModal from "./edit-client-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ClientTable({
  clients,
  setClients,
}: {
  clients: Client[]
  setClients: (c: Client[]) => void
}) {
  function handleUpdate(updated: Client) {
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <Table>
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
              <EditClientModal client={client} onUpdated={handleUpdate} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
