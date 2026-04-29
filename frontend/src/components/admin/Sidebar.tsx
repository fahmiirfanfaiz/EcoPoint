"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Target, Gift, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Challenges", href: "/admin/challenges", icon: Target },
  { label: "Rewards", href: "/admin/rewards", icon: Gift },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-white shadow-sm flex flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <Image src="/Logo/Logo.svg" alt="EcoPoint Logo" width={28} height={28} />
        <span className="font-nunito text-xl font-extrabold text-emerald-600">
          EcoAdmin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-nunito text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 font-bold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold"
              }`}
            >
              <Icon size={20} className={isActive ? "text-emerald-500" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-nunito text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
