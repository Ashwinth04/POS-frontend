"use client"

import { useState } from "react"
import { Order } from "../../types/order"
import { getInvoice } from "../../lib/order-api" // adjust path if needed
import { toast } from "sonner"


export default function OrderCard({
  order,
  onRetry,
}: {
  order: Order
  onRetry: (order: Order) => void
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

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.orderStatus === "FULFILLABLE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
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
  
  {/* Left side */}
  <div>
    {order.orderStatus === "UNFULFILLABLE" && (
      <button
        onClick={() => onRetry(order)}
        className="border px-4 py-2 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
      >
        Retry Order
      </button>
    )}
  </div>

  {/* Right side */}
  {/* Right side */}
<div>
  {order.orderStatus !== "UNFULFILLABLE" && (
    <button
      onClick={handleDownload}
      className="text-blue-600 hover:underline text-sm hover:cursor-pointer"
    >
      Download invoice
    </button>
  )}
</div>

</div>
    </div>
  )
}
