"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Operator = {
  username: string;
};

export default function OperatorsTable({ refreshKey }: { refreshKey: number }) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 5;

  async function fetchOperators(p: number) {
    try {
      const res = await fetch("http://localhost:8080/auth/get-all-operators", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: p, size }),
      });

      if (!res.ok) return;

      const data = await res.json();

      const cleaned = (data.content || []).filter(
        (op: any) => op.username && op.username.trim() !== "",
      );

      if (cleaned.length === 0 && p > 0) {
        fetchOperators(p - 1);
        return;
      }

      setOperators(cleaned);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (e) {
      console.error("Failed to fetch operators", e);
    }
  }

  useEffect(() => {
    fetchOperators(0); // reset to first page after create
  }, [refreshKey]);


  function handlePageChange(newPage: number) {
    if (newPage < 0 || newPage >= totalPages) return;
    fetchOperators(newPage);
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Operators</h2>
          <p className="text-sm text-gray-500">
            {operators.length} operator{operators.length !== 1 && "s"} on this page
          </p>
        </div>
      </div>

      {/* Operator list */}
      <div className="divide-y rounded-xl border">
        {operators.map((op) => (
          <div
            key={op.username}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
              {op.username.charAt(0).toUpperCase()}
            </div>

            {/* Username */}
            <div className="font-medium text-gray-900">
              {op.username}
            </div>
          </div>
        ))}

        {operators.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No operators found
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              className={page === 0 ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              className={
                page + 1 >= totalPages ? "pointer-events-none opacity-40" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
