const BASE = "http://localhost:8080/api/inventory";

async function handleResponse(res: Response) {
  let data: any = null;

  // Try to parse JSON if possible
  try {
    data = await res.json();
  } catch {
    // Ignore if response is not JSON
  }

  // If response failed, throw meaningful error
  if (!res.ok) {
    const message = data?.message || data?.error || "Something went wrong";

    throw new Error(message);
  }

  return data;
}

export async function updateInventory(barcode: string, quantity: number) {
  const res = await fetch(`${BASE}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode, quantity }),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function bulkUpdateInventory(base64file: string) {
  const res = await fetch("http://localhost:8080/api/inventory/bulkUpdate", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64file }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bulk update failed");
  }

  return res.json();
}
