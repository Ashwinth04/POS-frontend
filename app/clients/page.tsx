"use client";

import { useEffect, useState } from "react";
import { fetchClients } from "../lib/client-api";
import { Client } from "../types/client";
import ClientTable from "../components/clients/client-table";
import CreateClientModal from "../components/clients/create-client-modal";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AuthGuard from "../components/AuthGuard";
import { PaginationControl } from "../components/pagination-controls";

type PageResponse = {
  content: Client[];
  totalPages: number;
  number: number;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"name" | "email" | "phone">("name");
  const [isSearching, setIsSearching] = useState(false);

  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // Load role
  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("http://localhost:8080/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIsSupervisor(data.role === "ROLE_SUPERVISOR");
        }
      } finally {
        setLoadingRole(false);
      }
    }
    fetchRole();
  }, []);

  // Initial load
  useEffect(() => {
    loadPage(0, false);
  }, []);

  async function loadPage(p: number, searching = isSearching) {
    // Normal pagination
    if (!searching || !search.trim()) {
      const data: PageResponse = await fetchClients(p, 9);
      setClients(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
      setIsSearching(false);
      return;
    }

    // Search pagination
    const res = await fetch(
      `http://localhost:8080/api/clients/search?type=${filter}&query=${search}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page: p,
          size: 9,
        }),
      },
    );

    if (!res.ok) return;

    const data = await res.json();
    setClients(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
  }

  function handleSearch() {
    if (!search.trim()) {
      loadPage(0, false);
      return;
    }

    setIsSearching(true);
    loadPage(0, true);
  }

  if (loadingRole) return null;

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clients and their contact details
            </p>
          </div>

          {isSupervisor && (
            <CreateClientModal onCreated={() => loadPage(0, false)} />
          )}
        </div>

        {/* Filtered Search */}
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder={`Search by ${filter}`}
            value={search}
            maxLength={21}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[320px]"
          />

          <Button onClick={handleSearch} className="px-4">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-background shadow-sm">
          <ClientTable
            clients={clients}
            setClients={setClients}
            canEdit={isSupervisor}
          />
        </div>

        {/* Pagination */}
        <PaginationControl
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => loadPage(p, isSearching)}
        />
      </div>
    </AuthGuard>
  );
}
