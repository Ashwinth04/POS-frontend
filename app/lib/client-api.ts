import { Client } from "../types/client";

const BASE = "http://localhost:8080/api/clients";

async function handleResponse(res: Response) {
  const text = await res.text();

  try {
    const json = JSON.parse(text);

    if (!res.ok) {
      throw new Error(json.message || "Something went wrong");
    }

    return json;
  } catch {
    if (!res.ok) {
      throw new Error(text || "Something went wrong");
    }

    return text;
  }
}

export async function fetchClients(page = 0, size = 10) {
  const res = await fetch(`${BASE}/get-all-paginated`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, size }),
    cache: "no-store",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function addClient(client: Omit<Client, "id">) {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
    credentials: "include",
  });

  return handleResponse(res);
}

export async function updateClient(
  oldName: string,
  client: Omit<Client, "id">,
) {
  const res = await fetch(`${BASE}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
    credentials: "include",
  });

  return handleResponse(res);
}
