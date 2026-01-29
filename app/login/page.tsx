"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveUser } from "../lib/auth-cache"


export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleLogin() {
    setError("")

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        return
      }

      // success
      saveUser(data)   // 👈 store user + timestamp
      sessionStorage.removeItem("explicitLogout")
      router.push("/orders")
    } catch {
      setError("Server not reachable")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[350px] space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <input
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
      </div>
    </div>
  )
}
