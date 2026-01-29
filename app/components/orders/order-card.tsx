"use client"

import { useState } from "react"
import { Order } from "../../types/order"
import { getInvoice } from "../../lib/order-api" // adjust path if needed
import { toast } from "sonner"
import { cancelOrder, generateInvoice, downloadInvoice } from "../../lib/order-api"
import { downloadBase64Pdf } from "../../lib/file"


const statusStyles: Record<string, string> = {
  FULFILLABLE: "bg-green-100 text-green-700",
  UNFULFILLABLE: "bg-yellow-100 text-yellow-800",
  PLACED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-gray-200 text-gray-600",
}


export default function OrderCard({
  order,
  onRetry,
  onRefresh,
}: {
  order: Order
  onRetry: (order: Order) => void
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(false)

  const handleDownload = async () => {
    console.log("Inside handleDownload: " + order.id)
  try {
    const blob = await getInvoice(order.id)

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${order.id}.pdf`
    document.body.appendChild(a)
    a.click()

    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    toast.error("Failed to download invoice")
  }
}


const handleCancel = async () => {
  try {
    await cancelOrder(order.id)
    toast.success("Order cancelled")
    onRefresh();
  } catch {
    toast.error("Failed to cancel order")
  }
}

const handleGenerateInvoice = async () => {
  try {
    const res = await generateInvoice(order.id)
    downloadBase64Pdf(res.base64file, `invoice-${order.id}.pdf`)
    onRefresh();
  } catch {
    toast.error("Failed to generate invoice")
  }
}

const handleDownloadInvoice = async () => {
  try {
    const res = await downloadInvoice(order.id)
    downloadBase64Pdf(res.base64file, `invoice-${order.id}.pdf`)
  } catch {
    toast.error("Failed to download invoice")
  }
}



  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{order.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.orderTime).toLocaleString()}
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.orderStatus]}`}>
  {order.orderStatus}
</span>

      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="mt-3 text-sm text-blue-600 hover:underline hover:cursor-pointer"
      >
        {open ? "Hide items" : "View items"}
      </button>

      {/* Items */}
      {open && (
        <div className="mt-4 space-y-3">
          {order.orderItems.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 border rounded-lg p-3 grid grid-cols-3 gap-4 text-sm"
            >
              <div>
                <p className="text-gray-500">Barcode</p>
                <p className="font-medium">{item.barcode}</p>
              </div>

              <div>
                <p className="text-gray-500">Quantity</p>
                <p>{item.orderedQuantity}</p>
              </div>

              <div>
                <p className="text-gray-500">Price</p>
                <p>₹{item.sellingPrice}</p>
              </div>

              {item.message && (
                <div className="col-span-3 text-sm text-red-600">
                  {item.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Retry */}
      
      <div className="flex justify-between items-end w-full mt-5">
  {/* Left */}
  <div className="flex gap-3">
  {(order.orderStatus === "FULFILLABLE" ||
    order.orderStatus === "UNFULFILLABLE") && (
    <>
      <button
        onClick={() => onRetry(order)}
        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
      >
        Edit Order
      </button>

      <button
        onClick={handleCancel}
        className="border px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
      >
        Cancel Order
      </button>
    </>
  )}

  {order.orderStatus === "FULFILLABLE" && (
    <button
      onClick={handleGenerateInvoice}
      className="text-green-700 hover:underline text-sm"
    >
      Generate Invoice
    </button>
  )}
</div>


  {/* Right */}
  <div>
    {order.orderStatus === "PLACED" && (
      <button
        onClick={handleDownloadInvoice}
        className="text-blue-600 hover:underline text-sm"
      >
        Download Invoice
      </button>
    )}
  </div>
</div>

    </div>
  )
}
