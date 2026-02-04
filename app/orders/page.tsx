"use client";

import { useEffect, useState } from "react";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filter, setFilter] = useState<
    "ALL" | "FULFILLABLE" | "UNFULFILLABLE"
  >("ALL");

  const [open, setOpen] = useState(false);
  const [retryOrder, setRetryOrder] = useState<Order | null>(null);

  // date filters
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // 🔍 order id search
  const [orderId, setOrderId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  type Mode = "DEFAULT" | "SEARCH" | "DATE_FILTER";
  const [mode, setMode] = useState<Mode>("DEFAULT");


  useEffect(() => {
    loadUnfiltered(0);
  }, []);

  async function loadUnfiltered(p: number) {
    const data: PageResponse = await fetchOrders(p, 6);
    setOrders(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
  }

  async function searchByOrderId(p: number) {
    const res = await fetch(
      "http://localhost:8080/api/orders/search-by-id",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          page: p,
          size: 6,
        }),
        credentials: "include"
      },
    );

    if (!res.ok) {
      throw new Error("Failed to search order");
    }

    const data = await res.json();
    setOrders(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
  }

  async function loadPage(p: number) {
  try {
    let data: PageResponse;

    if (mode === "SEARCH") {
      await searchByOrderId(p);
      return;
    }

    if (mode === "DATE_FILTER" && startDate && endDate) {
      const startPlusOne = new Date(startDate);
      startPlusOne.setDate(startPlusOne.getDate() + 1);

      const endPlusOne = new Date(endDate);
      endPlusOne.setDate(endPlusOne.getDate() + 1);

      const start = startPlusOne.toISOString().split("T")[0];
      const end = endPlusOne.toISOString().split("T")[0];

      data = await fetchFilteredOrders(p, 6, start, end);
    } else {
      data = await fetchOrders(p, 6);
    }

    setOrders(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
  } catch (e: any) {
    alert(e.message);
  }
}


  function formatDate(date?: Date) {
    return date ? format(date, "dd MMM yyyy") : "Select date";
  }

  const visible =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  const dateFilterActive = startDate || endDate;

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold">Orders</h1>

            {/* 🔍 Search by order id */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by Order ID"
                value={orderId}
                disabled={!!dateFilterActive}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  if (startDate || endDate) {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }
                }}
                className="w-64"
              />

              <Button
  variant="secondary"
  disabled={!orderId}
  onClick={() => {
    setMode("SEARCH");
    setIsSearching(true);
    loadPage(0);
  }}
>
  Search
</Button>


              {isSearching && (
                <Button
  variant="ghost"
  onClick={() => {
    setOrderId("");
    setIsSearching(false);
    setMode("DEFAULT");
    loadUnfiltered(0);
  }}
>
  Clear
</Button>

              )}
            </div>

            {/* 📅 Date filters */}
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSearching}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      setStartDate(d);
                      if (orderId) {
                        setOrderId("");
                        setIsSearching(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSearching}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => {
                      setEndDate(d);
                      if (orderId) {
                        setOrderId("");
                        setIsSearching(false);
                      }
                    }}
                    disabled={
                      startDate ? { before: startDate } : undefined
                    }
                  />
                </PopoverContent>
              </Popover>

              <Button
  variant="secondary"
  disabled={!startDate || !endDate || isSearching}
  onClick={() => {
    setMode("DATE_FILTER");
    loadPage(0);
  }}
>
  Apply
</Button>


              {(startDate || endDate) && (
                <Button
  variant="ghost"
  onClick={() => {
    setStartDate(undefined);
    setEndDate(undefined);
    setMode("DEFAULT");
    loadUnfiltered(0);
  }}
>
  Clear
</Button>

              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="ALL">All</option>
              <option value="FULFILLABLE">Fulfillable</option>
              <option value="UNFULFILLABLE">Unfulfillable</option>
              <option value="PLACED">Placed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={() => setOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + Create Order
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((order, i) => (
            <OrderCard
              key={i}
              order={order}
              onRefresh={() => loadPage(page)}
            />
          ))}
        </div>

        {/* Pagination */}
        <PaginationControl
          page={page}
          totalPages={totalPages}
          onPageChange={loadPage}
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
