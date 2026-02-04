"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OperatorsTable from "@/components/admin/operators-table";
import { Eye, EyeOff } from "lucide-react";

type User = {
  email: string;
  role: string;
};

type Operator = {
  email: string;
  active: boolean;
};

export default function OperatorsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Protect page (Supervisor only)
  useEffect(() => {
    async function init() {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (data.role !== "ROLE_SUPERVISOR") {
        router.push("/orders");
        return;
      }

      setUser(data);

      // dummy operators for now
      setOperators([
        { email: "operator1", active: true },
        { email: "operator2", active: true },
      ]);
    }

    init();
  }, [router]);

  async function handleCreate() {
    if (!email || !password) {
      toast.error("email and password required", {
        duration: Infinity,
        closeButton: true,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/auth/create-operator", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMessage = "Something went wrong";

        try {
          const data = await res.json();
          errorMessage = data.message ?? errorMessage;
        } catch {
          errorMessage = await res.text();
        }

        toast.error(errorMessage, {
          duration: Infinity,
          closeButton: true,
        });
        return;
      }

      setemail("");
      setPassword("");
      toast.success("Operator created");

      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Server error", {
        duration: Infinity,
        closeButton: true,
      });
    }
  }

  function handleRevoke(index: number) {
    setOperators((prev) =>
      prev.map((op, i) =>
        i === index ? { ...op, active: !op.active } : op,
      ),
    );
  }

  if (!user) return null;

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
            placeholder="email"
            className="border rounded px-3 py-2"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />

          {/* Password with eye toggle */}
          <div className="relative">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="border rounded px-3 py-2 w-full pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>
        </div>

        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Create Operator
        </button>

        {message && (
          <p
            className={`text-sm ${message.includes("success")
                ? "text-green-600"
                : "text-red-600"
              }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Operators Table */}
      <OperatorsTable refreshKey={refreshKey} />
    </div>
  );
}
