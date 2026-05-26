"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b border-gray-100 bg-white/90 px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-nunito text-sm font-bold text-gray-900">
            {user?.email || "Admin User"}
          </p>
          <p className="font-outfit text-xs text-gray-500 capitalize">
            {user?.role || "Administrator"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
          A
        </div>
      </div>
    </header>
  );
}
