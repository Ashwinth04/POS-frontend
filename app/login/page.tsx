"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "../lib/auth-cache";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setError("");

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // success
      saveUser(data); // 👈 store user + timestamp
      sessionStorage.removeItem("explicitLogout");
      sessionStorage.setItem("forceNavbarUpdate", "true");
      router.push("/orders");
    } catch {
      setError("Server not reachable");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[350px] space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <input
          placeholder="email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setemail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 pr-10 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black hover:cursor-pointer"
          >
            
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}

          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
      </div>
    </div>
  );
}
