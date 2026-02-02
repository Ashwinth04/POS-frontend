"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "../lib/auth-cache";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username, password }),
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
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
            <div className="relative">
              {/* Eye icon (always same) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              {/* Slash (only when hidden) */}
              {!showPassword && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-6 h-[2px] bg-current rotate-45"></span>
                </span>
              )}
            </div>
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
