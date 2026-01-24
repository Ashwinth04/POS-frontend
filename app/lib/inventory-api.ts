const BASE = "http://localhost:8080/api/inventory"

async function handleResponse(res: Response) {
  let data: any = null

  // Try to parse JSON if possible
  try {
    data = await res.json()
  } catch {
    // Ignore if response is not JSON
  }

  // If response failed, throw meaningful error
  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      "Something went wrong"

    throw new Error(message)
  }

  return data
}


export async function updateInventory(barcode: string, quantity: number) {
  const res = await fetch(`${BASE}/update/${barcode}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
    credentials: "include",
  })
  return handleResponse(res);
}