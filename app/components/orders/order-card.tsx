"use client";

import { useState } from "react";
import { Order } from "../../types/order";
import { toast } from "sonner";
import {
  cancelOrder,
  generateInvoice,
  downloadInvoice,
} from "../../lib/order-api";
import { downloadBase64Pdf } from "../../lib/file";
import { formatMoney } from "../../lib/money";
import EditOrderModal from "./edit-order-modal";
import ConfirmActionModal from "../confirm-action-modal";

const statusStyles: Record<string, string> = {
  FULFILLABLE: "bg-green-100 text-green-700",
  UNFULFILLABLE: "bg-yellow-100 text-yellow-800",
  PLACED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-gray-200 text-gray-600",
};

export default function OrderCard({
  order,
  onRetry,
  onRefresh,
}: {
  order: Order;
  onRetry: (order: Order) => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    null | "cancel" | "invoice"
  >(null);

  /* ------------------ actions ------------------ */

  const handleCancel = async () => {
    try {
      await cancelOrder(order.orderId);
      toast.success("Order cancelled");
      onRefresh();
      setOpen(false);
    } catch {
      toast.error("Failed to cancel order", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setConfirmAction(null);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const res = await generateInvoice(order.orderId);
      downloadBase64Pdf(res.base64file, `invoice-${order.orderId}.pdf`);
      toast.success("Invoice generated");
      onRefresh();
    } catch {
      toast.error("Failed to generate invoice", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await downloadInvoice(order.orderId);
      downloadBase64Pdf(res.base64file, `invoice-${order.orderId}.pdf`);
    } catch {
      toast.error("Failed to download invoice", {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  /* ------------------ totals ------------------ */

  const itemsWithTotals = (order.orderItems || []).map((item) => ({
    ...item,
    total: (item.orderedQuantity || 0) * (item.sellingPrice || 0),
  }));

  const orderSubtotal = itemsWithTotals.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const orderTotal = orderSubtotal;

  return (
    <>
      {/* Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{order.orderId}</h3>
            <p className="text-sm text-gray-500">
              {new Date(order.orderTime).toLocaleString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.orderStatus]}`}
          >
            {order.orderStatus}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          {/* Left action group */}
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(true)}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              View Order
            </button>

            {(order.orderStatus === "FULFILLABLE" ||
              order.orderStatus === "UNFULFILLABLE") && (
              <>
                <button
                  onClick={() => {
                    setEditOpen(true);
                    setOpen(false);
                  }}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Edit Order
                </button>

                <button
                  onClick={() => setConfirmAction("cancel")}
                  className="border px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              </>
            )}

            {order.orderStatus === "FULFILLABLE" && (
              <button
                onClick={() => setConfirmAction("invoice")}
                className="border text-green-700 px-4 py-2 rounded-lg hover:bg-green-50"
              >
                Generate Invoice
              </button>
            )}
          </div>

          {/* Right action */}
          {order.orderStatus === "PLACED" && (
            <button
              onClick={handleDownloadInvoice}
              className="text-blue-600 hover:underline text-sm whitespace-nowrap"
            >
              Download Invoice
            </button>
          )}
        </div>
      </div>

      {/* ------------------ Order Details Modal ------------------ */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6">
            {/* Header */}
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Order Details</h2>
                <p className="text-sm text-gray-500">{order.orderId}</p>
              </div>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.orderStatus]}`}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* Items table */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Barcode</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {itemsWithTotals.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{item.barcode}</td>
                      <td className="p-3 text-right">{item.orderedQuantity}</td>
                      <td className="p-3 text-right">
                        {formatMoney(item.sellingPrice)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatMoney(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-gray-600">
                      Subtotal
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatMoney(orderSubtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right">
                      Total
                    </td>
                    <td className="p-3 text-right text-lg font-bold text-green-700">
                      {formatMoney(orderTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Edit Order Modal ------------------ */}
      {editOpen && (
        <EditOrderModal
          order={order}
          onClose={() => setEditOpen(false)}
          onSubmit={() => {
            onRefresh();
            setEditOpen(false);
          }}
        />
      )}

      {/* ------------------ Confirm Actions ------------------ */}
      {confirmAction === "cancel" && (
        <ConfirmActionModal
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Cancel Order"
          confirmColor="red"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleCancel}
        />
      )}

      {confirmAction === "invoice" && (
        <ConfirmActionModal
          title="Generate Invoice"
          description="Generate invoice for this order?"
          confirmText="Generate"
          confirmColor="green"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleGenerateInvoice}
        />
      )}
    </>
  );
}
