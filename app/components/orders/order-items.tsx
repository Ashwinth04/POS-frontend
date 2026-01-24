export default function OrderItems({ items }: { items: any[] }) {
  return (
    <div className="mt-3 border rounded-lg overflow-hidden text-sm">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-3 py-2">Barcode</th>
            <th className="text-left px-3 py-2">Quantity</th>
            <th className="text-left px-3 py-2">Price</th>
            <th className="text-left px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.orderItemId} className="border-t">
              <td className="px-3 py-2">{item.barcode}</td>
              <td className="px-3 py-2">{item.orderedQuantity}</td>
              <td className="px-3 py-2">₹{item.sellingPrice}</td>
              <td
                className={`px-3 py-2 font-medium ${
                  item.orderItemStatus === "FULFILLABLE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.orderItemStatus || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
