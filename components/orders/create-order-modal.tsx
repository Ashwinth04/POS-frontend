"use client";

import {
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { createOrder } from "../../app/lib/order-api";
import { toast } from "sonner";

/* ---------------- types ---------------- */

type Product = {
  id: string;
  barcode: string;
  name: string;
  mrp: number;
};

type Item = {
  barcode: string;
  orderedQuantity: string;
  sellingPrice: string;
  suggestions?: Product[];
};

/* ---------------- icons ---------------- */

function TrashIcon() {
  return (
    <svg
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
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="text-xs text-gray-500">{p.barcode}</p>
          </div>
          <span className="text-sm font-semibold">₹{p.mrp}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}

/* ---------------- component ---------------- */

export default function CreateOrderModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [items, setItems] = useState<Item[]>([
    { barcode: "", orderedQuantity: "", sellingPrice: "" },
  ]);

  const barcodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  /* ---------------- handlers ---------------- */

  function updateField(
    index: number,
    field: keyof Item,
    value: string,
  ) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function updateBarcode(index: number, value: string) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        barcode: value,
        suggestions: [],
      };
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
          },
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
  }

  function selectProduct(index: number, p: Product) {
    clearTimeout(debounceTimers.current[index]);

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        barcode: p.barcode,
        sellingPrice: String(p.mrp),
        suggestions: [],
      };
      return copy;
    });
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { barcode: "", orderedQuantity: "", sellingPrice: "" },
    ]);
  }

  function removeItem(i: number) {
    clearTimeout(debounceTimers.current[i]);
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* ---------------- submit ---------------- */

  async function handleSubmit() {
    try {
      await createOrder(
        items.map((i) => ({
          barcode: i.barcode,
          orderedQuantity: Number(i.orderedQuantity),
          sellingPrice: Number(i.sellingPrice),
        })),
      );

      toast.success("Order created successfully");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    }
  }

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[760px] max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="border-b px-6 py-4 flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">Create Order</h2>
            <p className="text-sm text-gray-500">
              Add items and place the order
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[420px]">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border bg-gray-50 p-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Barcode
                  </label>
                  <input
                    ref={(el) => {
                      barcodeRefs.current[i] = el;
                    }}
                    value={item.barcode}
                    onChange={(e) =>
                      updateBarcode(i, e.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />

                  <BarcodeDropdown
                    anchor={barcodeRefs.current[i]}
                    products={item.suggestions ?? []}
                    onSelect={(p) => selectProduct(i, p)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={item.orderedQuantity}
                    onChange={(e) =>
                      updateField(
                        i,
                        "orderedQuantity",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    value={item.sellingPrice}
                    onChange={(e) =>
                      updateField(
                        i,
                        "sellingPrice",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {items.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  className="mt-3 text-red-500"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t px-6 py-4 flex justify-between">
          <button
            onClick={addItem}
            className="text-blue-600 text-sm font-medium"
          >
            + Add another item
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}
