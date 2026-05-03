"use client";

import React from "react";
import Link from "next/link";
import { Settings, Plus, Zap, Star } from "lucide-react";
import { AuthUser, getStoredAuth, API_BASE_URL } from "@/lib/auth";
import EditProfileModal, { getAvatarUrl } from "./EditProfileModal";

interface LevelInfo {
  current: { level_number: number; nama_level: string; syarat_poin: number } | null;
  next: { level_number: number; nama_level: string; syarat_poin: number } | null;
  lifetime_poin: number;
}

interface ProfileCardProps {
  onOpenChallenges?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onOpenChallenges }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [levelInfo, setLevelInfo] = React.useState<LevelInfo | null>(null);

  const syncData = React.useCallback(() => {
    const auth = getStoredAuth();
    if (auth) {
      setUser(auth.user);
    } else {
      setUser(null);
    }
  }, []);

  // Fetch level info from dashboard API
  const fetchLevel = React.useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.level) {
          setLevelInfo(data.level);
        }
        if (data.user) {
          // If the dashboard returns user, we can merge it or let syncData handle it
          // Wait, dashboard doesn't update local storage. Let's rely on local storage for profile data 
          // but we can update state here if we want.
        }
      }
    } catch (e) {
      console.error("Failed to fetch level info:", e);
    }
  }, []);

  React.useEffect(() => {
    syncData();
    fetchLevel();
    window.addEventListener("ecopoint-auth-changed", syncData);
    return () => window.removeEventListener("ecopoint-auth-changed", syncData);
  }, [syncData, fetchLevel]);

  // Level progress calculation
  const currentLevel = levelInfo?.current;
  const nextLevel = levelInfo?.next;
  const lifetimePoin = levelInfo?.lifetime_poin ?? 0;

  let progressPercent = 0;
  let pointsToNext = 0;
  if (currentLevel && nextLevel) {
    const rangeStart = currentLevel.syarat_poin;
    const rangeEnd = nextLevel.syarat_poin;
    const range = rangeEnd - rangeStart;
    const progress = lifetimePoin - rangeStart;
    progressPercent = range > 0 ? Math.min((progress / range) * 100, 100) : 100;
    pointsToNext = Math.max(rangeEnd - lifetimePoin, 0);
  } else if (currentLevel && !nextLevel) {
    // Max level reached
    progressPercent = 100;
    pointsToNext = 0;
  }

  const levelDisplay = currentLevel
    ? `Lvl ${currentLevel.level_number}`
    : "Lvl 1";
  const levelName = currentLevel?.nama_level ?? "Newcomer";

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
            <img src={user ? getAvatarUrl(user, user.profile_pic) : getAvatarUrl({} as any, 0)} alt="Avatar" className="h-full w-full object-contain bg-white p-2" />
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute -right-2 top-0 rounded-full bg-white p-2 text-gray-400 shadow-md transition-colors hover:text-emerald-500 hover:bg-emerald-50"
            title="Edit Profil"
          >
            <Settings size={18} />
          </button>
          <div
            className="absolute bottom-0 left-1/2 flex -translate-x-2 -translate-y-1 items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", outline: "2px solid white", outlineOffset: "-2px" }}
          >
            <Star size={12} className="text-white" fill="white" />
            <span className="font-quicksand whitespace-nowrap text-xs font-bold leading-4 text-white">{levelDisplay}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 text-center md:text-left">
          <h1 className="font-quicksand text-[30px] font-bold leading-9 text-gray-800">
            Hello, {user?.nama?.split(" ")[0] || "User"}! 👋
          </h1>
          <div className="flex flex-wrap justify-center gap-4 pb-2 md:justify-start">
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              NIM: {user?.nim || "N/A"}
            </span>
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              {user?.fakultas || "Fakultas belum diset"}
            </span>
          </div>

          {/* Level progress */}
          <div className="flex items-center gap-2 pb-1">
            <span className="font-outfit text-xs font-semibold text-amber-600">{levelName}</span>
            {nextLevel && (
              <span className="font-outfit text-xs text-gray-400">→ {nextLevel.nama_level}</span>
            )}
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)" }} />
          </div>
          <p className="font-outfit text-xs leading-4 text-gray-500">
            {nextLevel
              ? `${pointsToNext.toLocaleString("id-ID")} poin lagi ke ${nextLevel.nama_level}`
              : currentLevel
                ? "Level maksimal tercapai! 🎉"
                : "Belum ada data level"}
          </p>
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
          <button
            onClick={onOpenChallenges}
            className="flex items-center justify-center gap-2 rounded-3xl bg-white px-6 py-3 transition hover:bg-emerald-50"
            style={{ outline: "2px #D1FAE5 solid", outlineOffset: "-2px" }}
          >
            <Zap size={20} className="text-emerald-700" />
            <span className="font-outfit text-base leading-6 text-emerald-700">Daily Challenges</span>
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={() => {
          setIsEditModalOpen(false);
          syncData(); // Re-sync from localStorage
        }}
      />
    </div>
  );
};

export default ProfileCard;