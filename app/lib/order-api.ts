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
