"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAuth } from "@/lib/auth/AuthContext";
import { AlertCircle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="font-nunito text-gray-500 font-semibold">Memuat halaman admin...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-gray-200/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h1 className="mb-2 font-nunito text-2xl font-extrabold text-gray-900">
            Akses Ditolak
          </h1>
          <p className="mb-8 font-quicksand text-gray-500">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini khusus untuk Administrator.
          </p>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 font-nunito text-sm font-bold text-white transition-all hover:bg-emerald-600 shadow-md shadow-emerald-200"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Topbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
