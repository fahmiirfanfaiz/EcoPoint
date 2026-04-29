"use client";

import React from "react";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/90 px-8 backdrop-blur-md">
      <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search something..."
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 font-quicksand"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right">
            <p className="font-nunito text-sm font-bold text-gray-900">{user?.email || "Admin User"}</p>
            <p className="font-outfit text-xs text-gray-500 capitalize">{user?.role || "Administrator"}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
