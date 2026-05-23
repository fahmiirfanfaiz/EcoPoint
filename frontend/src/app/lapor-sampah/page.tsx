"use client";

import { useState } from "react";
import WasteUpload from "../../components/laporsampah/WasteUpload";
import History from "@/components/laporsampah/History";
import { Leaf, ClipboardList, Plus } from "lucide-react";

export default function LaporSampahPage() {
  const [activeTab, setActiveTab] = useState<"lapor" | "riwayat">("lapor");

  return (
    <main
      className="min-h-screen pb-12"
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 30%)",
      }}
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(56,189,248,0.1) 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-8 pb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Lapor Sampah
          </h1>
          <p className="mt-2 text-base text-gray-500 max-w-lg mx-auto">
            Laporkan sampah yang kamu temukan, bersihkan, dan dapatkan poin serta
            kontribusi nyata untuk kampus yang lebih bersih.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto max-w-5xl px-4 mb-6">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("lapor")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-200 ${activeTab === "lapor"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Plus size={16} />
            Lapor Baru
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-200 ${activeTab === "riwayat"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <ClipboardList size={16} />
            Riwayat
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-5xl px-4">
        {activeTab === "lapor" ? <WasteUpload /> : <History />}
      </div>
    </main>
  );
}
