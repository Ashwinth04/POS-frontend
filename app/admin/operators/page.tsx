"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import OperatorsTable from "@/app/components/admin/operators-table"

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
      toast.error("Username and password required")
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
        toast.error(text || "Failed to create operator")
        return
      }

      // Add locally (since backend has no list endpoint)
      setOperators((prev) => [
        ...prev,
        { username, active: true },
      ])

      setUsername("")
      setPassword("")
      toast.success("Operator created successfully")
    } catch {
      toast.error("Server error")
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
      <OperatorsTable />
    </div>
  )
}
