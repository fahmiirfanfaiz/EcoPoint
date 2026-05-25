"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStoredAuth } from "@/lib/auth";

const publicPaths = new Set(["/", "/login", "/register"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const currentPath = pathname ?? "/";
  const auth = isClient ? getStoredAuth() : null;
  const isPublicPath = publicPaths.has(currentPath);
  const shouldRedirectToLogin = !isPublicPath && !auth;
  const shouldRedirectToDashboard =
    currentPath === "/" ||
    currentPath === "/login" ||
    currentPath === "/register"
      ? Boolean(auth)
      : false;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace("/login");
      return;
    }

    if (shouldRedirectToDashboard) {
      router.replace("/dashboard");
      return;
    }
  }, [router, shouldRedirectToDashboard, shouldRedirectToLogin]);

  if (!isClient || shouldRedirectToLogin || shouldRedirectToDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f0fdf4_0%,_#ffffff_100%)]">
        <div className="rounded-3xl border border-emerald-100 bg-white px-6 py-5 text-sm font-semibold text-emerald-700 shadow-sm">
          Memuat EcoPoint...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
