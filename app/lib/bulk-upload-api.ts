const BASE = "http://localhost:8080/api";

export type BulkUploadResponse = {
  status: "SUCCESS" | "UNSUCCESSFUL";
  base64file?: string;
};

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

async function bulkUpload(
  url: string,
  base64file: string,
): Promise<BulkUploadResponse> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include", // session auth
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64file }),
  });

  // if (!res.ok) {
  //   const text = await res.text();
  //   throw new Error(text || "Bulk upload failed");
  // }

  // return res.json();

  return handleResponse(res);
}

/* -----------------------------
   Product Bulk Upload
-------------------------------- */
export function uploadProductTSV(base64file: string) {
  return bulkUpload(`${BASE}/products/upload`, base64file);
}

/* -----------------------------
   Inventory Bulk Upload
-------------------------------- */
export function uploadInventoryTSV(base64file: string) {
  return bulkUpload(`${BASE}/inventory/bulk-update`, base64file);
}
