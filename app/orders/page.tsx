"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchOrders, fetchFilteredOrders } from "../lib/order-api";
import { Order } from "../types/order";
import OrderCard from "../../components/orders/order-card";
import CreateOrderModal from "../../components/orders/create-order-modal";
import AuthGuard from "../../components/AuthGuard";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { PaginationControl } from "../../components/pagination-controls";
import { Input } from "@/components/ui/input";

type PageResponse = {
  content: Order[];
  totalPages: number;
  number: number;
};

type Mode = "ALL" | "SEARCH" | "DATE";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filter, setFilter] =
    useState<"ALL" | "FULFILLABLE" | "UNFULFILLABLE" | "PLACED" | "CANCELLED">(
      "ALL"
    );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("ALL");

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [orderId, setOrderId] = useState("");

  const loadPage = useCallback(
    async (p: number) => {
      try {
        let data: PageResponse;

        if (mode === "SEARCH") {
          const res = await fetch(
            "http://localhost:8080/api/orders/search-by-id",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, page: p, size: 6 }),
              credentials: "include",
            }
          );

          if (!res.ok) throw new Error("Search failed");
          data = await res.json();
        } else if (mode === "DATE" && startDate && endDate) {
          const s = new Date(startDate);
          s.setDate(s.getDate() + 1);
          const e = new Date(endDate);
          e.setDate(e.getDate() + 1);

          data = await fetchFilteredOrders(
            p,
            6,
            s.toISOString().split("T")[0],
            e.toISOString().split("T")[0]
          );
        } else {
          data = await fetchOrders(p, 6);
        }

        setOrders(data.content || []);
        setTotalPages(data.totalPages || 0);
        setPage(data.number || 0);
      } catch (e) {
        console.error(e);
        setOrders([]);
        setTotalPages(0);
        setPage(0);
      }
    },
    [mode, orderId, startDate, endDate]
  );

  /** 🔑 THIS is the key */
  useEffect(() => {
  loadPage(0);
}, [mode, loadPage]);


  const handleSearch = () => {
    if (!orderId.trim()) return;
    setStartDate(undefined);
    setEndDate(undefined);
    setMode("SEARCH");
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) return;
    setOrderId("");
    setMode("DATE");
  };

  const handleClear = () => {
    setOrderId("");
    setStartDate(undefined);
    setEndDate(undefined);
    setMode("ALL"); // 👈 effect will fetch ALL
  };

  const visible =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold">Orders</h1>

            {/* Search */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by Order ID"
                value={orderId}
                disabled={mode === "DATE"}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64"
              />
              <Button
                variant="secondary"
                disabled={!orderId || mode === "DATE"}
                onClick={handleSearch}
              >
                Search
              </Button>
              {mode === "SEARCH" && (
                <Button variant="ghost" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={mode === "SEARCH"}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {startDate
                      ? format(startDate, "dd MMM yyyy")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={mode === "SEARCH"}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {endDate
                      ? format(endDate, "dd MMM yyyy")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={
                      startDate ? { before: startDate } : undefined
                    }
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="secondary"
                disabled={!startDate || !endDate || mode === "SEARCH"}
                onClick={handleDateFilter}
              >
                Apply
              </Button>

              {mode === "DATE" && (
                <Button variant="ghost" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onRefresh={() => loadPage(page)}
            />
          ))}

          {visible.length === 0 && (
            <p className="text-gray-500 col-span-2 text-center py-10">
              No orders found.
            </p>
          )}
        </div>

        <PaginationControl
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => loadPage(p)}
        />

        {open && (
          <CreateOrderModal
            onClose={() => {
              setOpen(false);
              loadPage(page);
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}
