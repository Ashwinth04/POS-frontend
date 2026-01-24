"use client"

import { useEffect, useState } from "react"
import { fetchOrders } from "../lib/order-api"
import { Order } from "../types/order"
import OrderCard from "../components/orders/order-card"
import CreateOrderModal from "../components/orders/create-order-modal"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import AuthGuard from "../components/AuthGuard"

type PageResponse = {
  content: Order[]
  totalPages: number
  number: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<"ALL" | "FULFILLABLE" | "UNFULFILLABLE">("ALL")
  const [open, setOpen] = useState(false)
  const [retryOrder, setRetryOrder] = useState<Order | null>(null)

  useEffect(() => {
      loadPage(0)
    }, [])
  
    async function loadPage(p: number) {
      const data: PageResponse = await fetchOrders(p, 8)
      setOrders(data.content)
      setPage(data.number)
      setTotalPages(data.totalPages)
    }

  async function load() {
    try {
      const data = await fetchOrders(page, 6)
      setOrders(data.content)
      setTotalPages(data.totalPages)
    } catch (e: any) {
      alert(e.message)
    }
  }

  useEffect(() => { load() }, [page])

  const visible = filter === "ALL"
    ? orders
    : orders.filter(o => o.orderStatus === filter)

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders</h1>

        <div className="flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2">
            <option value="ALL">All</option>
            <option value="FULFILLABLE">Fulfilled</option>
            <option value="UNFULFILLABLE">Unfulfilled</option>
          </select>

          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:cursor-pointer">
            + Create Order
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
                {visible.map((order, i) => (
                <OrderCard
                key={i}
        order={order}
        onRetry={(order) => {
            setRetryOrder(order)
            setOpen(true)
        }}
        />

        ))}
      </div>

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

     {open && (
  <CreateOrderModal
    onClose={() => {
      setOpen(false)
      setRetryOrder(null)
      load()
    }}
    initialOrder={retryOrder}
  />
)}

    </div>
    </AuthGuard>
  )
}
