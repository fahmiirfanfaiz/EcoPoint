"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Lapor Sampah", href: "/lapor-sampah" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Tukar Poin", href: "/tukar-poin" },
];

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loginAsAdmin, logout, isLoading } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b-2 border-gray-100"
      style={{
        background: "rgba(253, 255, 254, 0.95)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image src="/Logo/Logo.svg" alt="EcoPoint Logo" width={32} height={32} />
          <span className="font-nunito text-2xl font-extrabold leading-8 text-gray-800">
            EcoPoint Campus
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-[30px] lg:flex">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-nunito text-base leading-6 no-underline transition-colors ${
                  isActive
                    ? "border-b-2 border-emerald-500 pb-[2px] font-extrabold text-emerald-500"
                    : "font-bold text-gray-500 hover:text-emerald-500"
                }`}
              >
                {link.label}
              </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {/* Points Badge */}
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: "#EAFFDD",
                outline: "1.64px #E7E8E9 solid",
                outlineOffset: "-1.64px",
              }}
            >
              <span className="text-base leading-none">🪙</span>
              <span className="font-outfit text-sm font-bold leading-5 text-emerald-800">
                1,240 PTS
              </span>
            </div>

            {/* Notification Bell */}
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              style={{
                outline: "1.64px #E7E8E9 solid",
                outlineOffset: "-1.64px",
              }}
            >
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path
                  d="M8 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2C9.5 1.17 8.83.5 8 .5S6.5 1.17 6.5 2v.68C3.64 3.36 2 5.92 2 9v5l-2 2v1h16v-1l-2-2z"
                  fill="#475569"
                />
              </svg>
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            {/* Profile Avatar */}
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="font-nunito rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="font-nunito rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
                <Link
                  href="/profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(45deg, #34D399, #14B8A6)",
                    boxShadow:
                      "0px 2px 4px -2px rgba(0,0,0,0.10), 0px 4px 6px -1px rgba(0,0,0,0.10)",
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill="#94A3B8"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            ) : (
              <button
                onClick={loginAsAdmin}
                disabled={isLoading}
                className="font-nunito rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Login Admin"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-2 pt-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-nunito rounded-xl px-4 py-3 text-base no-underline ${
                  isActive
                    ? "bg-emerald-50 font-extrabold text-emerald-500"
                    : "font-bold text-gray-500"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2" style={{ background: "#EAFFDD" }}>
              <span>🪙</span>
              <span className="font-outfit text-sm font-bold text-emerald-800">1,240 PTS</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
