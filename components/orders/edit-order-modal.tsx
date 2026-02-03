"use client";

import { useEffect, useRef, useState } from "react";
import { Order } from "../../app/types/order";
import { editOrder } from "../../app/lib/order-api";
import { toast } from "sonner";
import { formatMoney } from "../../app/lib/money";

type EditableItem = {
  barcode: string;
  orderedQuantity: number;
  sellingPrice: number;
};

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
    })),
  );

  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 ref for scroll container
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* ------------------ helpers ------------------ */

  const updateItem = (
    index: number,
    field: keyof EditableItem,
    value: string | number,
  ) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([...items, { barcode: "", orderedQuantity: 1, sellingPrice: 0 }]);
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.orderedQuantity * i.sellingPrice,
    0,
  );

  const isInvalid =
    items.length === 0 ||
    items.some(
      (i) => !i.barcode || i.orderedQuantity <= 0 || i.sellingPrice <= 0,
    );

  /* ------------------ auto scroll ------------------ */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // auto-scroll to bottom when items change
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [items.length]);

  /* ------------------ submit ------------------ */

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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-xl font-semibold">{order.orderStatus === "FULFILLABLE" ? "Edit Order" : "Retry Order"}</h2>
            <p className="text-sm text-gray-500">{order.orderId}</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Table section */}
        <div className="px-6 pt-4 flex-1 flex flex-col">
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
            <div
              ref={scrollRef}
              className="max-h-[40vh] overflow-y-auto"
            >
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">
                        <input
                          value={item.barcode}
                          onChange={(e) =>
                            updateItem(i, "barcode", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>

                      <td className="p-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={item.sellingPrice}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "sellingPrice",
                              Number(e.target.value),
                            )
                          }
                          className="w-24 border rounded px-2 py-1 text-right"
                        />
                      </td>

                      <td className="p-3 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.orderedQuantity}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "orderedQuantity",
                              Number(e.target.value),
                            )
                          }
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      </td>

                      <td className="p-3 text-right font-medium">
                        {formatMoney(
                          item.orderedQuantity * item.sellingPrice,
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom fade indicator */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t shrink-0 mt-5">

          
          {/* Add item (always visible) */}
          <button
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Item
          </button>
          
          <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            disabled={isInvalid}
            onClick={() => setConfirm(true)}
            className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
          >
            {order.orderStatus === "FULFILLABLE" ? "Submit Changes" : "Retry Order"}
          </button>
          </div>
        </div>

        {/* Confirm */}
        {confirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-sm">
              <h4 className="font-semibold mb-2">Confirm Changes</h4>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to update this order?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirm(false)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
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
