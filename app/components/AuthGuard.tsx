"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "../lib/auth"
import { getCachedUser, saveUser, clearUser } from "../lib/auth-cache"

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      // 1. Try cache first
      const cached = getCachedUser()

      console.log("Is cached: " + cached?.role + " " + cached?.userId)
      console.log("Allowed roles: " + allowedRoles)

      if (cached) {
        // Role check still applies
        console.log("Not calling backend for auth verification")
        if (allowedRoles && !allowedRoles.includes(cached.role)) {
          
          router.replace("/orders")
          return
        }

        setAllowed(true)
        setLoading(false)
        return
      }

      // 2. Otherwise call backend
      try {
        console.log("Calling backend for auth verification")
        const user = await getCurrentUser()

        if (!user) {
          clearUser()
          router.replace("/login")
          return
        }

        // Save fresh user to cache
        saveUser(user)

        // Role check
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.replace("/orders")
          return
        }

        setAllowed(true)
      } catch {
        clearUser()
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) return <div className="p-10">Checking session...</div>

  if (!allowed) return null

  return <>{children}</>
}
