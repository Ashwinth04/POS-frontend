"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import { Order } from "../../app/types/order";
import { editOrder } from "../../app/lib/order-api";
import { toast } from "sonner";
import { formatMoney } from "../../app/lib/money";

/* ---------------- types ---------------- */

type Product = {
  id: string;
  barcode: string;
  name: string;
  mrp: number;
};

type EditableItem = {
  barcode: string;
  orderedQuantity: number;
  sellingPrice: number;
  suggestions?: Product[];
};

/* ---------------- dropdown portal ---------------- */

function BarcodeDropdown({
  anchor,
  products,
  onSelect,
}: {
  anchor: HTMLInputElement | null;
  products: Product[];
  onSelect: (p: Product) => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();

    setStyle({
      position: "absolute",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, [anchor, products.length]);

  if (!anchor || products.length === 0) return null;

  return createPortal(
    <div
      style={style}
      className="rounded-xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden"
    >
      {products.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">{p.barcode}</p>
          </div>
          <span className="text-sm font-semibold text-gray-800">₹{p.mrp}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

/* ---------------- component ---------------- */

export default function EditOrderModal({
  order,
  onSubmit,
  onClose,
}: {
  order: Order;
  onSubmit: (updatedOrder: Order) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<EditableItem[]>(
    order.orderItems.map((i) => ({
      barcode: i.barcode,
      orderedQuantity: i.orderedQuantity,
      sellingPrice: i.sellingPrice,
    }))
  );

  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const barcodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  /* ---------------- helpers ---------------- */

  const updateField = (index: number, field: keyof EditableItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateBarcode = (index: number, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], barcode: value, suggestions: [] };
      return copy;
    });

    clearTimeout(debounceTimers.current[index]);

    if (!value.trim()) return;

    debounceTimers.current[index] = setTimeout(async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/products/search",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "barcode", query: value, page: 0, size: 8 }),
            credentials: "include",
          }
        );
        const data = await res.json();
        setItems((prev) => {
          const copy = [...prev];
          copy[index].suggestions = data.content ?? [];
          return copy;
        });
      } catch {
        /* ignore */
      }
    }, 300);
  };

  const selectProduct = (index: number, p: Product) => {
    clearTimeout(debounceTimers.current[index]);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        barcode: p.barcode,
        sellingPrice: p.mrp,
        suggestions: [],
      };
      return copy;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { barcode: "", orderedQuantity: 1, sellingPrice: 0 }]);
  };

  const removeItem = (i: number) => {
    clearTimeout(debounceTimers.current[i]);
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ---------------- auto scroll ---------------- */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [items.length]);

  /* ---------------- submit ---------------- */

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await editOrder(order.orderId, items);
      toast.success("Order updated successfully");
      onSubmit({ ...order, orderItems: items });
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update order", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.orderedQuantity * i.sellingPrice, 0);
  const isInvalid =
    items.length === 0 || items.some((i) => !i.barcode || i.orderedQuantity <= 0 || i.sellingPrice <= 0);

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-semibold">
              {order.orderStatus === "FULFILLABLE" ? "Edit Order" : "Retry Order"}
            </h2>
            <p className="text-sm text-gray-500">{order.orderId}</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Table section */}
        <div className="px-6 pt-4 flex-1 flex flex-col relative">
          <div className="relative border rounded-xl overflow-hidden flex-1">
            {/* Table header */}
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Barcode</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
            </table>

            {/* Scrollable body */}
            <div ref={scrollRef} className="max-h-[40vh] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 relative">
                        <input
                          ref={(el: HTMLInputElement | null) => {
                            barcodeRefs.current[i] = el ?? null;
                          }}
                          value={item.barcode}
                          onChange={(e) => updateBarcode(i, e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                        <BarcodeDropdown
                          anchor={barcodeRefs.current[i]}
                          products={item.suggestions ?? []}
                          onSelect={(p) => selectProduct(i, p)}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={item.sellingPrice}
                          onChange={(e) => updateField(i, "sellingPrice", Number(e.target.value))}
                          className="w-24 border rounded px-2 py-1 text-right"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.orderedQuantity}
                          onChange={(e) => updateField(i, "orderedQuantity", Number(e.target.value))}
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      </td>
                      <td className="p-3 text-right font-medium">{formatMoney(item.orderedQuantity * item.sellingPrice)}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t shrink-0 mt-5">
          <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Item</button>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="border px-4 py-2 rounded-lg">Cancel</button>
            <button
              disabled={isInvalid}
              onClick={() => setConfirm(true)}
              className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
            >
              {order.orderStatus === "FULFILLABLE" ? "Submit Changes" : "Retry Order"}
            </button>
          </div>
        </div>

        {/* Confirm Modal */}
        {confirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-sm">
              <h4 className="font-semibold mb-2">Confirm Changes</h4>
              <p className="text-sm text-gray-600 mb-5">Are you sure you want to update this order?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirm(false)} className="border px-4 py-2 rounded-lg">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  {loading ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
