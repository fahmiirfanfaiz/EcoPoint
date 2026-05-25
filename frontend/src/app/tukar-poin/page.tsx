"use client";

import { useState } from "react";
import RewardBanner from "@/components/redeem/RewardBanner";
import RewardGrid from "@/components/redeem/RewardGrid";
import RedemptionHistory from "@/components/redeem/RedemptionHistory";
import { Gift, ClipboardList } from "lucide-react";

export default function TukarPoinPage() {
  const [activeTab, setActiveTab] = useState<"tukar" | "riwayat">("tukar");

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
      <RewardBanner />

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveTab("tukar")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-200 ${
            activeTab === "tukar"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Gift size={16} />
          Tukar Poin
        </button>
        <button
          onClick={() => setActiveTab("riwayat")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold transition-all duration-200 ${
            activeTab === "riwayat"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ClipboardList size={16} />
          Riwayat
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tukar" ? <RewardGrid /> : <RedemptionHistory />}
    </div>
  );
}
