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

export async function getCurrentUser() {
  try {
    const res = await fetch("http://localhost:8080/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function logout() {
  await fetch("http://localhost:8080/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
