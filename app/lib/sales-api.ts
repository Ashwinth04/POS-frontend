const BASE_URL = "http://localhost:8080/api/sales";

export async function getAllSalesPaginated(page: number, size: number) {
  const res = await fetch(`${BASE_URL}/get-all-paginated`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, size }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch sales");
  return res.json();
}

export async function getDailySales(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`${BASE_URL}/get-daily-sales?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch daily sales");
  return res.json();
}

export async function getClientSales(
  clientName: string,
  startDate: string,
  endDate: string,
) {
  const params = new URLSearchParams({ clientName, startDate, endDate });
  const res = await fetch(`${BASE_URL}/get-client-sales?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch client sales");
  return res.json();
}
