"use client";

import { useEffect, useState } from "react";
import { fetchOrders, fetchFilteredOrders } from "../lib/order-api";
import { Order } from "../types/order";
import OrderCard from "../../components/orders/order-card";
import CreateOrderModal from "../../components/orders/create-order-modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { PaginationControl } from "../../components/pagination-controls";

type PageResponse = {
  content: Order[];
  totalPages: number;
  number: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "FULFILLABLE" | "UNFULFILLABLE">(
    "ALL",
  );
  const [open, setOpen] = useState(false);
  const [retryOrder, setRetryOrder] = useState<Order | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const MAX_PAGES = 5;

  const startPage = Math.max(
    0,
    Math.min(page - Math.floor(MAX_PAGES / 2), totalPages - MAX_PAGES),
  );

  const endPage = Math.min(totalPages, startPage + MAX_PAGES);

  useEffect(() => {
    loadUnfiltered(0);
  }, []);

  async function loadUnfiltered(p: number) {
    const data: PageResponse = await fetchOrders(p, 6);
    setOrders(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
  }

  async function loadPage(p: number) {
    try {
      let data: PageResponse;

      if (startDate && endDate) {
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
    filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex justify-between items-center">
          {/* Left: title + date filters */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold">Orders</h1>

            {/* Date filters */}
            <div className="flex items-center gap-3">
              {/* Start date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(startDate)}
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

              {/* End date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={startDate ? { before: startDate } : undefined}
                  />
                </PopoverContent>
              </Popover>

              {/* Apply */}
              <Button
                variant="secondary"
                onClick={() => loadPage(0)}
                disabled={!startDate || !endDate}
                className="hover:bg-black hover:text-white hover:cursor-pointer"
              >
                Apply
              </Button>

              {/* Clear */}
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    loadUnfiltered(0);
                  }}
                  className="hover:cursor-pointer"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Right: status filter + create */}
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
              className="bg-black text-white px-4 py-2 rounded-lg hover:cursor-pointer"
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
              onRetry={(order) => {
                setRetryOrder(order);
                setOpen(true);
              }}
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
