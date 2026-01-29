"use client"

import { useState } from "react"
import { createOrder, editOrder } from "../../lib/order-api"
import { toast } from "sonner"
import { Order } from "../../types/order"
import { getInvoice } from "../../lib/order-api"


type Item = {
  orderItemId?: string
  barcode: string
  orderedQuantity: string
  sellingPrice: string
  error?: string
}

export async function downloadInvoice(orderId: string) {
  const blob = await getInvoice(orderId)

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `invoice-${orderId}.pdf`
  document.body.appendChild(a)
  a.click()

  a.remove()
  window.URL.revokeObjectURL(url)
}


export default function CreateOrderModal({
  onClose,
  initialOrder,
}: {
  onClose: () => void
  initialOrder?: Order | null
}) {
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>(() => {
    if (!initialOrder) {
      return [{ barcode: "", orderedQuantity: "", sellingPrice: "" }]
    }


    return initialOrder.orderItems.map((i) => ({
      orderItemId: i.orderItemId,
      barcode: i.barcode,
      orderedQuantity: String(i.orderedQuantity),
      sellingPrice: String(i.sellingPrice),
    }))
  })

  function addItem() {
    setItems([
      ...items,
      {barcode: "", orderedQuantity: "", sellingPrice: "" },
    ])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }


  function update(index: number, field: keyof Item, value: string) {
    const copy = [...items]
    copy[index][field] = value
    copy[index].error = undefined
    setItems(copy)
  }

  async function handleSubmit() {
  try {
    const payload = items.map((i) => ({
      barcode: i.barcode,
      orderedQuantity: Number(i.orderedQuantity),
      sellingPrice: Number(i.sellingPrice),
    }))

    const res = initialOrder
  ? await editOrder(initialOrder.id, payload)
  : await createOrder(payload)


    console.log(res.orderItems);

    // Clear old errors
    const updated = items.map(i => ({ ...i, error: undefined }))

    const results = res.orderItems || []

    let hasError = false

    results.forEach((result: any, index: number) => {
      console.log("Result status: ", result.status)
      if (result.status !== "VALID" && result.status != "FULFILLABLE") {
        updated[index].error = result.message
        hasError = true
      }
    })

    console.log("Has error: ", hasError)

    if (!hasError) {
      if (initialOrder == null) {
        toast.success("Order placed successfully")
      }
      else {
        toast.success("Order edited successfully!")
      }
      
      console.log(res)
      setCreatedOrderId(res.orderId) // or res.orderId depending on backend
      return
    }


    setItems(updated)
  } catch (e: any) {
    alert(e.message || "Something went wrong")
  }
}



  
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[750px] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">
            {initialOrder ? "Retry Order" : "Create Order"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black hover:cursor-pointer">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4 max-h-[400px] overflow-auto pr-1">
          {items.map((item, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 space-y-3 bg-gray-50 relative"
              >
                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 hover:cursor-pointer"
                  title="Delete item"
                >
                  🗑️
                </button>
              <div className="grid grid-cols-3 gap-4">
                <input
                  placeholder="Barcode"
                  value={item.barcode}
                  onChange={(e) => update(i, "barcode", e.target.value)}
                  className="border px-3 py-2 rounded-lg"
                />

                <input
                  placeholder="Quantity"
                  value={item.orderedQuantity}
                  onChange={(e) =>
                    update(i, "orderedQuantity", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg"
                />

                <input
                  placeholder="Selling Price"
                  value={item.sellingPrice}
                  onChange={(e) =>
                    update(i, "sellingPrice", e.target.value)
                  }
                  className="border px-3 py-2 rounded-lg"
                />
              </div>

              {item.error != "OK" && (
                <p className="text-sm text-red-600 font-medium">
                  {item.error}
                </p>
              )}
            </div>
          ))}
        </div>
          
        {createdOrderId && (
          <div className="mt-5 p-4 border border-green-200 bg-green-50 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-medium text-green-800">Order created successfully</p>
              <p className="text-sm text-green-600">
                You can now download the invoice
              </p>
            </div>

            <button
              onClick={() => downloadInvoice(createdOrderId)}
              className="text-blue-600 hover:underline text-sm hover:cursor-pointer"
            >
              Download invoice
            </button>
          </div>
        )}


        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={addItem}
            className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
          >
            + Add another item
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 hover:cursor-pointer"
            >
              Submit Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
