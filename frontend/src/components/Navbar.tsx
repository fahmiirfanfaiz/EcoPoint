"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Beranda", href: "/dashboard" },
  { label: "Lapor Sampah", href: "/lapor-sampah" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Tukar Poin", href: "/tukar-poin" },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const syncAuthState = () => {
      const auth = getStoredAuth();
      setIsAuthenticated(Boolean(auth));
      setUserName(auth?.user?.nama || null);
      setUserRole(auth?.user?.role || null);
    };

    syncAuthState();
    window.addEventListener("ecopoint-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("ecopoint-auth-changed", syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    setIsAuthenticated(false);
    setUserName(null);
    router.push("/login");
  };

  const guestActions = (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="outline" size="sm" className="rounded-full">
          Masuk
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="rounded-full">Daftar</Button>
      </Link>
    </div>
  );

  const authenticatedActions = (
    <div className="flex items-center gap-4">
      {/* Points Badge */}
      <div
        className="hidden sm:flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          background: "#EAFFDD",
          outline: "1px #E7E8E9 solid",
          outlineOffset: "-1px",
        }}
      >
        <span className="text-sm leading-none">
          <svg width="18" height="18" viewBox="0 0 25 24" fill="none">
            <path d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z" fill="#065F46" />
          </svg>
        </span>
        <span className="font-outfit text-[13px] font-bold leading-5 text-emerald-800">
          1,240
        </span>
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full p-[1.5px]"
            style={{
              background: "linear-gradient(45deg, #34D399, #14B8A6)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="#94A3B8"
                />
              </svg>
            </div>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {profileDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-4 py-2 mb-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Akun</p>
                <p className="text-sm font-bold text-gray-800 truncate">{userName || "User"}</p>
              </div>
              <div className="h-[1px] bg-gray-100 mx-2 mb-1" />
              <Link
                href="/profile"
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
                Profil Saya
              </Link>
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="h-[1px] bg-gray-100 mx-2 my-1" />
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <div className="h-[76px] w-full transition-all duration-500" />
      <nav
        className={`fixed z-[100] transition-all duration-500 ease-out left-1/2 -translate-x-1/2 ${
          isScrolled 
            ? "top-4 w-[calc(100%-2rem)] max-w-[1100px] bg-white/95 backdrop-blur-md shadow-lg rounded-full py-2 px-6 border border-gray-200"
            : "top-0 w-full max-w-full bg-white/95 backdrop-blur-md py-4 px-6 md:px-8 border border-transparent border-b-gray-100"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1235px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline transition-transform hover:scale-[1.02]">
            <Image
              src="/Logo/Logo.svg"
              alt="EcoPoint Logo"
              width={isScrolled ? 28 : 32}
              height={isScrolled ? 28 : 32}
              className="transition-all"
            />
            <span className={`font-nunito font-extrabold text-gray-800 transition-all ${isScrolled ? "text-lg" : "text-xl md:text-2xl"}`}>
              EcoPoint
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 font-nunito text-sm font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-[1px] bg-gray-200 mx-1" />

            <div className="flex items-center">
              {isAuthenticated ? authenticatedActions : guestActions}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
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

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute left-0 right-0 transition-all duration-400 overflow-hidden ${
            isScrolled ? "top-[calc(100%+12px)] px-0" : "top-full px-0"
          } ${mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className={`mt-2 mx-4 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100`}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`rounded-xl px-4 py-3 font-nunito text-base font-bold transition-all ${
                      isActive ? "bg-emerald-50 text-emerald-600" : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="h-[1px] bg-gray-100 my-2" />
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-bold text-gray-800">{userName}</span>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
                      <svg width="14" height="14" viewBox="0 0 25 24" fill="none">
                        <path d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z" fill="#065F46" />
                      </svg>
                      <span className="text-xs font-bold text-emerald-800">1,240 PTS</span>
                    </div>
                  </div>
                  <Link href="/profile" className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500" onClick={() => setMobileMenuOpen(false)}>Profil Saya</Link>
                  {userRole === "admin" && (
                    <Link href="/admin" className="rounded-xl px-4 py-3 text-sm font-bold text-emerald-600" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl border-red-100 text-red-600 hover:bg-red-50">Keluar</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl">Masuk</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full rounded-xl">Daftar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
