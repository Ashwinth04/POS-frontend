"use client"

import { useEffect, useState } from "react"
import { fetchClients } from "../lib/client-api"
import { Client } from "../types/client"
import ClientTable from "../components/clients/client-table"
import CreateClientModal from "../components/clients/create-client-modal"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { get } from "http"
import AuthGuard from "../components/AuthGuard"

type PageResponse = {
  content: Client[]
  totalPages: number
  number: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"name" | "email" | "phone">("name")

  useEffect(() => {
    loadPage(0)
  }, [])

  async function loadPage(p: number) {
    const data: PageResponse = await fetchClients(p, 8)
    setClients(data.content)
    setPage(data.number)
    setTotalPages(data.totalPages)
  }

  const filtered = clients.filter((client) => {
    const value =
      filter === "name"
        ? client.name
        : filter === "email"
        ? client.email
        : client.phoneNumber

    return value.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR"]}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your clients and their contact details
          </p>
        </div>
        <CreateClientModal
          onCreated={() => loadPage(0)} // reload first page
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search by ${filter}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background shadow-sm">
        <ClientTable clients={filtered} setClients={setClients} />
      </div>

      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => loadPage(Math.max(0, page - 1))}
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i}
                  onClick={() => loadPage(i)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => loadPage(Math.min(totalPages - 1, page + 1))}
                className={
                  page === totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
    </AuthGuard>
  )
}
