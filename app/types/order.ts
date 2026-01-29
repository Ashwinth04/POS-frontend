export type OrderItem = {
  orderItemId?: string
  barcode: string
  orderedQuantity: number
  sellingPrice: number
  orderItemStatus?: string
  status?: string
  message?: string
}

export type Order = {
  orderTime: string
  id: string
  orderStatus: "FULFILLABLE" | "UNFULFILLABLE" | "CANCELLED" | "PLACED"
  orderItems: OrderItem[]
}
