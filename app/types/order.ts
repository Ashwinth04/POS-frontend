export type OrderItem = {
  orderItemId?: string;
  barcode: string;
  orderedQuantity: number;
  sellingPrice: number;
  orderItemStatus?: string;
  status?: string;
  message?: string;
};

export type Order = {
  orderTime: string;
  orderId: string;
  orderStatus: "FULFILLABLE" | "UNFULFILLABLE" | "CANCELLED" | "PLACED";
  orderItems: OrderItem[];
};
