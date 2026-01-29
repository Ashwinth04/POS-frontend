const BASE = "http://localhost:8080/api/orders"

async function handleResponse(res: Response) {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (!res.ok) throw new Error(json.message || "Something went wrong")
    return json
  } catch {
    if (!res.ok) throw new Error(text || "Something went wrong")
    return text
  }
}

export async function getInvoice(orderId: string): Promise<Blob> {
  const res = await fetch(`${BASE}/${orderId}/invoice`, {
    method: "GET",
    credentials: "include",
  })

  console.log("Get invoice called")

  if (!res.ok) {
    throw new Error("Failed to fetch invoice")
  }

  return await res.blob()
}

export async function fetchOrders(page: number, size: number) {
  const res = await fetch(`${BASE}/get-all-paginated`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, size }),
    credentials: "include",
  })
  return handleResponse(res)
}

export async function createOrder(orderItems: any[]) {
  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderItems }),
    credentials: "include",
  })
  return handleResponse(res)
}

export async function editOrder(orderId: string, orderItems: any[]) {
  const res = await fetch(`${BASE}/edit/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderItems }),
    credentials: "include",
  })
  return handleResponse(res)
}

export async function cancelOrder(orderId: string) {

  const res = await fetch(`${BASE}/cancel/${orderId}`, {
    method: "PUT",
    credentials: "include"
  })

  console.log(res)

  return handleResponse(res);
}

export async function generateInvoice(orderId: string) {

  const res = await fetch(`${BASE}/generate-invoice/${orderId}`, {
    method: "GET",
    credentials: "include"
  })

  return handleResponse(res);
}

export async function downloadInvoice(orderId: string) {
  return fetch(`/api/orders/download-invoice/${orderId}`).then(res => res.json())
}

// lib/order-api.ts

export async function fetchFilteredOrders(
  page: number,
  size: number,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })
  if (startDate) params.append("startDate", startDate)
  if (endDate)   params.append("endDate", endDate)

  const res = await fetch(`${BASE}/filter-orders?${params.toString()}`,{
    credentials:"include"
  }
)
  if (!res.ok) throw new Error("Failed to fetch orders")
  return res.json()
}
