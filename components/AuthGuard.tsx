"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../app/lib/auth";
import { getCachedUser, saveUser, clearUser } from "../app/lib/auth-cache";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );

  useEffect(() => {
    async function checkAuth() {
      const cached = getCachedUser();

      if (cached) {
        if (allowedRoles && !allowedRoles.includes(cached.role)) {
          router.replace("/orders");
          setStatus("denied");
          return;
        }

        setStatus("allowed");
        return;
      }

      const user = await getCurrentUser();

      if (!user) {
        clearUser();
        router.replace("/login");
        setStatus("denied");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/orders");
        setStatus("denied");
        return;
      }

      saveUser(user);
      setStatus("allowed");
    }

    checkAuth();
  }, []);

  if (status === "loading") {
    return <div className="p-10 text-gray-500">Checking session...</div>;
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
