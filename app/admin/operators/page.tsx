"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  userId: string
  role: string
}

type Operator = {
  username: string
  active: boolean
}

export default function OperatorsPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [operators, setOperators] = useState<Operator[]>([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  // Protect page (Supervisor only)
  useEffect(() => {
    async function init() {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (!res.ok) {
        router.push("/login")
        return
      }

      const data = await res.json()

      if (data.role !== "ROLE_SUPERVISOR") {
        router.push("/orders")
        return
      }

      setUser(data)

      // dummy operators for now
      setOperators([
        { username: "operator1", active: true },
        { username: "operator2", active: true },
      ])
    }

    init()
  }, [])

  async function handleCreate() {
    setMessage("")

    if (!username || !password) {
      setMessage("Username and password required")
      return
    }

    try {
      const res = await fetch("http://localhost:8080/auth/create-operator", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const text = await res.text()
        setMessage(text || "Failed to create operator")
        return
      }

      // Add locally (since backend has no list endpoint)
      setOperators((prev) => [
        ...prev,
        { username, active: true },
      ])

      setUsername("")
      setPassword("")
      setMessage("Operator created successfully")
    } catch {
      setMessage("Server error")
    }
  }

  function handleRevoke(index: number) {
    setOperators((prev) =>
      prev.map((op, i) =>
        i === index ? { ...op, active: !op.active } : op
      )
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Operator Management</h1>
        <p className="text-gray-500 text-sm">
          Create and manage operator access
        </p>
      </div>

      {/* Create Operator */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">Create New Operator</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Username"
            className="border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            className="border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Create Operator
        </button>

        {message && (
          <p
            className={`text-sm ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Operators Table */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Operators</h2>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="text-left py-2">Username</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op, i) => (
              <tr key={op.username} className="border-b last:border-0">
                <td className="py-3 font-medium">{op.username}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      op.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {op.active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleRevoke(i)}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    {op.active ? "Revoke" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
