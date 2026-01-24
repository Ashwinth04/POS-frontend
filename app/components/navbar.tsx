"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getCachedUser, saveUser, clearUser } from "../lib/auth-cache"


type User = {
  userId: string
  role: "ROLE_SUPERVISOR" | "ROLE_OPERATOR"
}

const navItems = [
  { name: "Clients", href: "/clients", roles: ["ROLE_SUPERVISOR"] },
  { name: "Products", href: "/products", roles: ["ROLE_SUPERVISOR"] },
  { name: "Orders", href: "/orders", roles: ["ROLE_SUPERVISOR", "ROLE_OPERATOR"] },
  { name: "Admin", href: "/admin/operators", roles: ["ROLE_SUPERVISOR"] },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
  async function loadUser() {
    // 1. Try cache first
    const cached = getCachedUser()
    if (cached) {
      setUser(cached)
      return
    }

    // 2. Cache expired → call backend
    try {
      const res = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
        cache: "no-store",
      })

      if (!res.ok) {
        clearUser()
        setUser(null)
        return
      }

      const data = await res.json()

      // 3. Save to cache
      saveUser(data)

      setUser(data)
    } catch {
      clearUser()
      setUser(null)
    }
  }

  loadUser()
}, [])


  async function handleLogout() {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    setUser(null)
    clearUser()
    router.push("/login")
  }

  if (pathname === "/login") return null

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  const initials = user?.userId?.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            POS Dashboard
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-8">
          {visibleItems.map((item) => {
            const active = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {item.name}
                {active && (
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-black rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-full border bg-white px-3 py-1.5 shadow-sm hover:shadow transition"
            >
              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="text-left text-sm">
                <div className="font-medium leading-tight">{user.userId}</div>
                <div className="text-xs text-gray-500">
                  {user.role === "ROLE_SUPERVISOR" ? "Supervisor" : "Operator"}
                </div>
              </div>
              <span className="text-gray-400 text-xs">▾</span>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
