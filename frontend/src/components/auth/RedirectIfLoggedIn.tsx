"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth } from "@/lib/auth";

export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth && auth.token) {
      router.replace("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Optionally, return nothing while checking to avoid a flash of the landing page
  // But returning null might cause a white screen briefly. We'll just return children if not logged in.
  if (isChecking) {
    return null; // Or a subtle loader
  }

  return <>{children}</>;
}
