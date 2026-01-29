"use client"

import { useEffect, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Operator = {
  username: string
  status: "ACTIVE" | "REVOKED" | null
}

type ApiResponse = {
  content: Operator[]
  totalPages: number
  number: number // current page index (0-based)
}

export default function OperatorsTable() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const size = 5

  async function fetchOperators(p: number) {
  try {
    const res = await fetch("http://localhost:8080/auth/get-all-operators", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: p, size }),
    })

    if (!res.ok) return

    const data = await res.json()

    const cleaned = (data.content || []).filter(
      (op: any) => op.username && op.username.trim() !== ""
    )

    // 👇 If backend claims page exists but actually returns garbage
    if (cleaned.length === 0 && p > 0) {
      fetchOperators(p - 1)
      return
    }

    setOperators(cleaned)
    setTotalPages(data.totalPages)
    setPage(p)
  } catch (e) {
    console.error("Failed to fetch operators", e)
  }
}


  useEffect(() => {
    fetchOperators(page)
  }, [])

  function handlePageChange(newPage: number) {
    if (newPage < 0 || newPage >= totalPages) return
    fetchOperators(newPage)
  }

  function handleRevoke(index: number) {
    setOperators((prev) =>
      prev.map((op, i) =>
        i === index
          ? { ...op, status: op.status === "REVOKED" ? "ACTIVE" : "REVOKED" }
          : op
      )
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="font-semibold">Operators</h2>

      <table className="w-full text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="text-left py-2">Username</th>
            <th className="text-left py-2">Status</th>
            <th className="text-right py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {operators.map((op, i) => {
            const active = op.status !== "REVOKED"

            return (
              <tr key={op.username} className="border-b last:border-0">
                <td className="py-3 font-medium">{op.username}</td>

                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {active ? "Active" : "Revoked"}
                  </span>
                </td>

                <td className="py-3 text-right">
                  <button
                    onClick={() => handleRevoke(i)}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    {active ? "Revoke" : "Restore"}
                  </button>
                </td>
              </tr>
            )
          })}

          {operators.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-6 text-gray-500">
                No operators found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Centered shadcn pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              className={page === 0 ? "pointer-events-none opacity-50" : ""}
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
                page + 1 >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
