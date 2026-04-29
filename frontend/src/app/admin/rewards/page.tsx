"use client";

import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminRewards() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Rewards Catalog</h1>
          <p className="text-gray-500 font-quicksand mt-1">Manage items available for point redemption.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md">
          <Plus size={20} />
          Add Reward
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="h-40 w-full bg-slate-100 relative">
               <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  Image Placeholder
               </div>
               <div className="absolute top-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-600 backdrop-blur-sm">
                 250 pts
               </div>
            </div>
            <div className="p-5">
              <h3 className="font-nunito text-lg font-bold text-gray-900">Voucher Kantin {item}</h3>
              <p className="mt-1 text-sm text-gray-500 font-quicksand line-clamp-2">
                Diskon 10% untuk semua menu makanan di kantin teknik.
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-semibold text-gray-500">Stock: {Math.floor(Math.random() * 50)}</span>
                <div className="flex gap-2">
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
