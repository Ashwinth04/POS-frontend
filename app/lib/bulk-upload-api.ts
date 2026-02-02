const BASE = "http://localhost:8080/api";

export type BulkUploadResponse = {
  status: "SUCCESS" | "UNSUCCESSFUL";
  base64file?: string;
};

/**
 * Shared bulk upload helper
 * - Throws only on HTTP errors
 * - Business failures are handled by UI via `status`
 */
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bulk upload failed");
  }

  return res.json();
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
  return bulkUpload(`${BASE}/inventory/bulkUpdate`, base64file);
}
