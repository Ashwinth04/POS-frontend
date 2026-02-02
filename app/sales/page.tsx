"use client";

import { useEffect, useState } from "react";
import SalesFilters from "../../components/sales/sales-filters";
import SalesSummaryCards from "../../components/sales/sales-summary-cards";
import ClientDetailsModal from "../../components/sales/client-details-modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getAllSalesPaginated,
  getClientSales,
  getDailySales,
} from "../lib/sales-api";
import { PaginationControl } from "../../components/pagination-controls";

export default function SalesPage() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [clientName, setClientName] = useState("");

  const [mode, setMode] = useState<"default" | "daily" | "client">("default");
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadDefault(0);
  }, []);

  async function loadDefault(p = 0) {
    setMode("default");
    setSummary(null);
    setRows([]);
    setPage(p);

    const res = await getAllSalesPaginated(p, 10);

    setRows(res.content ?? []);
    setTotalPages(res.totalPages ?? 0);
  }

  async function handleSubmit() {
    if (!startDate || !endDate) {
      loadDefault();
      return;
    }

    const s = startDate.toISOString().split("T")[0];
    const e = endDate.toISOString().split("T")[0];

    setRows([]); // 🔒 prevent stale render

    if (clientName) {
      setMode("client");
      setSummary(null);
      const res = await getClientSales(clientName, s, e);
      setRows(res ?? []);
    } else {
      setMode("daily");
      const res = await getDailySales(s, e);
      setSummary(res);
      setRows(res.clients ?? []);
    }

    setPage(0);
    setTotalPages(0);
  }

  function handleClear() {
    setStartDate(undefined);
    setEndDate(undefined);
    setClientName("");
    loadDefault(0);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sales</h1>

      <SalesFilters
        startDate={startDate}
        endDate={endDate}
        clientName={clientName}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClientNameChange={setClientName}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {summary && (
        <SalesSummaryCards
          totalOrders={summary.totalOrders}
          totalProducts={summary.totalProducts}
          totalRevenue={summary.totalRevenue}
        />
      )}

      <div className="border rounded-xl overflow-hidden">
        <Table className="text-[13px]">
          <TableHeader className="bg-muted/80">
            <TableRow className="h-9">
              {mode === "default" && <TableHead>Date</TableHead>}
              {mode === "daily" && <TableHead>Client</TableHead>}
              {mode === "client" && <TableHead>Product</TableHead>}
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              {mode === "default" && <TableHead />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r, i) => (
              <TableRow
                key={i}
                className={`h-9 hover:bg-muted/50 ${
                  i % 2 === 0 ? "bg-muted/30" : ""
                }`}
              >
                {mode === "default" && (
                  <TableCell className="py-2">
                    {r?.date ? r.date.split("T")[0] : "-"}
                  </TableCell>
                )}

                {mode === "daily" && (
                  <TableCell className="py-2 font-medium">
                    {r.clientName ?? "Walk-in"}
                  </TableCell>
                )}

                {mode === "client" && (
                  <TableCell className="py-2 font-medium">
                    {r.product}
                  </TableCell>
                )}

                <TableCell className="py-2 text-right tabular-nums">
                  {r.totalProducts ?? r.quantity ?? 0}
                </TableCell>

                <TableCell className="py-2 text-right tabular-nums">
                  ₹ {(r.totalRevenue ?? r.revenue ?? 0).toLocaleString("en-IN")}
                </TableCell>

                {mode === "default" && (
                  <TableCell className="py-2 text-right">
                    {r.clients && r.clients.length > 0 && (
                      <ClientDetailsModal clients={r.clients} />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {mode === "default" && totalPages > 1 && (
        <PaginationControl
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => loadDefault(newPage)}
        />
      )}
    </div>
  );
}
