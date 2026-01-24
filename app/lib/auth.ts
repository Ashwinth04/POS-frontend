export async function getCurrentUser() {
  try {
    const res = await fetch("http://localhost:8080/auth/me", {
      credentials: "include",
      cache: "no-store",
    })

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function logout() {
  await fetch("http://localhost:8080/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}
