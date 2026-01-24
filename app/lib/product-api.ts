import { Product } from "../types/product"

const BASE = "http://localhost:8080/api/products"

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


export async function fetchProducts(page = 0, size = 8) {
  const res = await fetch(`${BASE}/get-all-paginated`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, size }),
    cache: "no-store",
    credentials: "include",
  })
  return handleResponse(res);
}

export async function addProduct(product: Omit<Product, "id">) {

    console.log(JSON.stringify(product));

  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    credentials: "include",
  })

  console.log(res);

  return handleResponse(res);
}


export async function uploadTSV(base64: string) {
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({base64file: base64}),
    credentials: "include",
  })
  return handleResponse(res);
}
