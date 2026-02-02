"use client";

import { useState } from "react";
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
      (i) => !i.barcode || i.orderedQuantity <= 0 || i.sellingPrice < 0,
    );

  /* ------------------ submit ------------------ */

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await editOrder(
        order.orderId,
        items.map((i) => ({
          barcode: i.barcode,
          orderedQuantity: i.orderedQuantity,
          sellingPrice: i.sellingPrice,
        })),
      );

      toast.success("Order updated successfully");
      onSubmit({ ...order, orderItems: items });
      onClose();
    } catch (err: any) {
      const message =
        typeof err === "string"
          ? err
          : err?.message
            ? err.message
            : err?.error
              ? err.error
              : "Failed to update order";

      toast.error(message, {
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
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Edit Order</h2>
            <p className="text-sm text-gray-500">{order.orderId}</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Items */}
        <div className="border rounded-xl overflow-hidden">
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

            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <input
                      value={item.barcode}
                      onChange={(e) => updateItem(i, "barcode", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>

                  <td className="p-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.sellingPrice}
                      onChange={(e) =>
                        updateItem(i, "sellingPrice", Number(e.target.value))
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
                        updateItem(i, "orderedQuantity", Number(e.target.value))
                      }
                      className="w-20 border rounded px-2 py-1 text-right"
                    />
                  </td>

                  <td className="p-3 text-right font-medium">
                    {formatMoney(item.orderedQuantity * item.sellingPrice)}
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

            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="p-3 text-right">
                  Total
                </td>
                <td className="p-3 text-right font-bold text-green-700">
                  {formatMoney(subtotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add item */}
        <button
          onClick={addItem}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          + Add Item
        </button>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            disabled={isInvalid}
            onClick={() => setConfirm(true)}
            className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
          >
            Submit Changes
          </button>
        </div>

        {/* Confirm */}
        {confirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
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
