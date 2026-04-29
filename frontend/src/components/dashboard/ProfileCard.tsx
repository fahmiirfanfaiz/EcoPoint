"use client";

import React from "react";
import Link from "next/link";
import { Plus, Gift, Star } from "lucide-react";

interface ProfileCardProps {
  onOpenChallenges?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onOpenChallenges }) => {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] bg-white p-8"
      style={{
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full opacity-50" style={{ background: "#D1FAE5", filter: "blur(20px)" }} />
      <div className="pointer-events-none absolute left-0 top-[70px] h-32 w-32 rounded-full opacity-50" style={{ background: "#FEF9C3", filter: "blur(20px)" }} />

      <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="h-[128px] w-[128px] overflow-hidden rounded-full bg-emerald-100"
            style={{
              boxShadow: "0px 8px 10px -6px rgba(0,0,0,0.10), 0px 20px 25px -5px rgba(0,0,0,0.10)",
              outline: "4px solid white",
              outlineOffset: "-4px",
            }}
          >
            <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=Emery" alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <div
            className="absolute bottom-0 left-1/2 flex -translate-x-2 -translate-y-1 items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", outline: "2px solid white", outlineOffset: "-2px" }}
          >
            <Star size={12} className="text-white" fill="white" />
            <span className="font-quicksand whitespace-nowrap text-xs font-bold leading-4 text-white">Lvl 5</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 text-center md:text-left">
          <h1 className="font-quicksand text-[30px] font-bold leading-9 text-gray-800">
            Hello, Alex! 👋
          </h1>
          <div className="flex flex-wrap justify-center gap-4 pb-4 md:justify-start">
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              NIM: 23/514737/TK/56513
            </span>
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              Program Studi: Teknologi Informasi
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "60%", background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)" }} />
          </div>
          <p className="font-outfit text-xs leading-4 text-gray-500">120 points to next level</p>
        </div>

        {/* Buttons */}
        <div className="flex min-w-[200px] flex-col gap-3">
          <Link
            href="/lapor-sampah"
            className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-10 py-3 text-white transition hover:bg-emerald-600 shadow-md"
            style={{ boxShadow: "0px 4px 6px -4px #A7F3D0, 0px 10px 15px -3px #A7F3D0" }}
          >
            <Plus size={20} />
            <span className="font-outfit text-base font-semibold leading-6">Lapor Sampah</span>
          </Link>
          <Link
            href="/tukar-poin"
            className="flex items-center justify-center gap-2 rounded-3xl bg-white px-6 py-3 transition hover:bg-emerald-50"
            style={{ outline: "2px #D1FAE5 solid", outlineOffset: "-2px" }}
          >
            <Gift size={20} className="text-emerald-700" />
            <span className="font-outfit text-base leading-6 text-emerald-700">Tukar Poin</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;