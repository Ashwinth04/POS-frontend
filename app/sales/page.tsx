"use client";

import { useEffect, useState } from "react";
import SalesFilters from "../../components/sales/sales-filters";
import SalesSummaryCards from "../../components/sales/sales-summary-cards";
import ClientDetailsModal from "../../components/sales/client-details-modal";
import { toast } from "sonner";

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
    const hasStart = !!startDate;
    const hasEnd = !!endDate;

    if (hasStart !== hasEnd) {
      toast.error("Please select both start and end dates", {
        duration: Infinity,
        closeButton: true,
      });
      return;
    }

    if (clientName && !hasStart) {
      toast.error("Please select both start and end dates", {
        duration: Infinity,
        closeButton: true,
      });
      return;
    }

    if (!hasStart && !hasEnd) {
      loadDefault(0);
      return;
    }

    const s = startDate!.toISOString().split("T")[0];
    const e = endDate!.toISOString().split("T")[0];

    setRows([]);

    if (clientName) {
      setMode("client");
      setSummary(null);
      setRows(await getClientSales(clientName, s, e));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Sales
          </h1>
          <p className="text-slate-600 text-sm">Track and analyze your sales performance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
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
        </div>

        {summary && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SalesSummaryCards
              totalOrders={summary.totalOrders}
              totalProducts={summary.totalProducts}
              totalRevenue={summary.totalRevenue}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-50 hover:to-slate-100/50">
                  {mode === "default" && (
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </TableHead>
                  )}
                  {mode === "daily" && (
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Client
                    </TableHead>
                  )}
                  {mode === "client" && (
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product
                    </TableHead>
                  )}
                  <TableHead className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                    Units Sold
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Revenue
                  </TableHead>
                  {mode === "default" && <TableHead className="w-[100px]" />}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((r, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 hover:shadow-sm"
                  >
                    {mode === "default" && (
                      <TableCell className="px-4 py-2.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                        {r.date?.split("T")[0] ?? "-"}
                      </TableCell>
                    )}

                    {mode === "daily" && (
                      <TableCell className="px-4 py-2.5 text-sm font-semibold text-slate-900">
                        {r.clientName ?? (
                          <span className="text-slate-500 font-normal italic">Walk-in</span>
                        )}
                      </TableCell>
                    )}

                    {mode === "client" && (
                      <TableCell className="px-4 py-2.5 text-sm font-semibold text-slate-900">
                        {r.product}
                      </TableCell>
                    )}

                    <TableCell className="px-4 py-2.5 text-center text-sm tabular-nums font-medium text-slate-700 whitespace-nowrap">
                      {r.totalProducts ?? r.quantity ?? 0}
                    </TableCell>

                    <TableCell className="px-4 py-2.5 text-center text-sm tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                      ₹{(r.totalRevenue ?? r.revenue ?? 0).toLocaleString("en-IN")}
                    </TableCell>

                    {mode === "default" && (
                      <TableCell className="px-4 py-2.5 text-right">
                        {r.clients?.length > 0 && (
                          <ClientDetailsModal clients={r.clients} />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={mode === "default" ? 4 : 3} 
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <svg 
                            className="w-6 h-6 text-slate-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-slate-900">No data available</p>
                          <p className="text-xs text-slate-500">Try adjusting your filters</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {mode === "default" && totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <PaginationControl
              page={page}
              totalPages={totalPages}
              onPageChange={loadDefault}
            />
          </div>
        )}
      </div>
    </div>
  );
}