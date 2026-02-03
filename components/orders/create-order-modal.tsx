"use client";

import { useEffect, useRef, useState } from "react";
import { createOrder, getInvoice } from "../../app/lib/order-api";
import { toast } from "sonner";

type Item = {
  orderItemId?: string;
  barcode: string;
  orderedQuantity: string;
  sellingPrice: string;
  error?: string;
};

export async function downloadInvoice(orderId: string) {
  const blob = await getInvoice(orderId);

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}

function TrashIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([
    { barcode: "", orderedQuantity: "", sellingPrice: "" },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  function addItem() {
    setItems([
      ...items,
      { barcode: "", orderedQuantity: "", sellingPrice: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function update(index: number, field: keyof Item, value: string) {
    const copy = [...items];
    copy[index][field] = value;
    copy[index].error = undefined;
    setItems(copy);
  }

  /* ---------------- auto scroll ---------------- */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [items.length]);

  async function handleSubmit() {
    try {
      const payload = items.map((i) => ({
        barcode: i.barcode,
        orderedQuantity: Number(i.orderedQuantity),
        sellingPrice: Number(i.sellingPrice),
      }));

      const res = await createOrder(payload);

      toast.success("Order created successfully");
      setCreatedOrderId(res.orderId);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong", {
        duration: Infinity,
        closeButton: true,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[760px] max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create Order
            </h2>
            <p className="text-sm text-gray-500">
              Add items and confirm to place the order
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Items (scrollable) */}
        <div
          ref={scrollRef}
          className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-5"
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-xl border bg-gray-50 p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Inputs */}
                <div className="grid flex-1 grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Barcode
                    </label>
                    <input
                      value={item.barcode}
                      onChange={(e) => update(i, "barcode", e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-black focus:outline-none"
                      placeholder="e.g. BRC123"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.orderedQuantity}
                      onChange={(e) =>
                        update(i, "orderedQuantity", e.target.value)
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-black focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      value={item.sellingPrice}
                      onChange={(e) =>
                        update(i, "sellingPrice", e.target.value)
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:border-black focus:outline-none"
                      placeholder="₹0.00"
                    />
                  </div>
                </div>

                {/* Delete */}
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="mt-6 rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    title="Remove item"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>

              {item.error && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {item.error}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 shrink-0">
          <button
            onClick={addItem}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Add another item
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              Submit Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
