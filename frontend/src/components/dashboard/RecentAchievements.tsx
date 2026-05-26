"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, ChevronRight, Lock } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

interface Achievement {
  badges_id: string;
  nama_badge: string;
  deskripsi: string;
  syarat_poin: number;
  earned_at: string;
}

interface AllBadge {
  badges_id: string;
  nama_badge: string;
  deskripsi: string;
  syarat_poin: number;
  jenis_syarat: string;
  nilai_syarat: number;
  earned: boolean;
  earned_at?: string;
}

interface RecentAchievementsProps {
  achievements?: Achievement[];
  openAllBadges?: boolean;
  onAllBadgesClosed?: () => void;
}

// Badge emoji mapping based on keywords
function getBadgeEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("starter") || lower.includes("pemula")) return "🌿";
  if (lower.includes("pro") || lower.includes("ahli")) return "♻️";
  if (lower.includes("streak") || lower.includes("rajin")) return "🔥";
  if (lower.includes("hero") || lower.includes("pahlawan")) return "🦸";
  if (lower.includes("master") || lower.includes("master")) return "🏆";
  if (lower.includes("champion") || lower.includes("juara")) return "🥇";
  if (lower.includes("legend") || lower.includes("legenda")) return "⭐";
  if (lower.includes("plastic") || lower.includes("plastik")) return "🧴";
  if (lower.includes("paper") || lower.includes("kertas")) return "📄";
  if (lower.includes("metal") || lower.includes("logam")) return "🔩";
  return "🏅";
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ achievements = [], openAllBadges, onAllBadgesClosed }) => {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [allBadges, setAllBadges] = useState<AllBadge[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // Allow parent to open the all-badges modal
  useEffect(() => {
    if (openAllBadges) {
      setShowAllBadges(true);
      void fetchAllBadges();
    }
  }, [openAllBadges]);

  const fetchAllBadges = useCallback(async () => {
    setLoadingAll(true);
    try {
      // /badges is public, returns all available badges
      const badgesRes = await fetch(`${API_BASE_URL}/badges`);
      const allData = badgesRes.ok ? await badgesRes.json() : { badges: [] };

      // Use the achievements prop as the user's earned badges
      const earnedIds = new Set(achievements.map((a) => a.badges_id));

      const merged: AllBadge[] = (allData.badges ?? []).map(
        (b: { badges_id: string; nama_badge: string; deskripsi: string; syarat_poin: number; jenis_syarat: string; nilai_syarat: number }) => ({
          ...b,
          earned: earnedIds.has(b.badges_id),
          earned_at: achievements.find((a) => a.badges_id === b.badges_id)?.earned_at,
        })
      );

      // Earned badges first, then sort by syarat_poin
      merged.sort((a, b) => {
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        return a.syarat_poin - b.syarat_poin;
      });

      setAllBadges(merged);
    } catch (err) {
      console.error("Error loading all badges:", err);
    } finally {
      setLoadingAll(false);
    }
  }, [achievements]);

  const handleOpenAllBadges = () => {
    setShowAllBadges(true);
    void fetchAllBadges();
  };

  const closeAllBadges = () => {
    setShowAllBadges(false);
    onAllBadgesClosed?.();
  };

  return (
    <>
      <div
        className="rounded-[32px] bg-white p-6"
        style={{
          outline: "1px #ECFDF5 solid",
          outlineOffset: "-1px",
          boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-amber-500">
              <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
                <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="currentColor" />
                <path d="M4 12v8l4-2 4 2v-8" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Pencapaian Terbaru</span>
          </div>
          <button
            onClick={handleOpenAllBadges}
            className="flex items-center gap-1 font-quicksand text-sm font-bold text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            Lihat Semua Badge <ChevronRight size={16} />
          </button>
        </div>

        {achievements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-4xl">🏅</span>
            <p className="font-quicksand text-sm font-semibold text-gray-400">Belum ada badge yang diraih</p>
            <p className="font-outfit text-xs text-gray-400">Terus kumpulkan poin untuk mendapatkan badge!</p>
            <button
              onClick={handleOpenAllBadges}
              className="mt-3 rounded-full bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              Lihat Semua Badge
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievements.map((a) => (
              <div
                key={a.badges_id}
                onClick={() => setSelectedBadge(a)}
                className="flex min-w-[140px] flex-col items-center rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-4 cursor-pointer transition-transform hover:scale-[1.02] hover:bg-emerald-100/50"
              >
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white"
                  style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                >
                  <span className="text-2xl">{getBadgeEmoji(a.nama_badge)}</span>
                </div>
                <span className="font-quicksand text-center text-sm font-bold leading-5 text-gray-800">
                  {a.nama_badge}
                </span>
                <span className="font-outfit mt-1 text-center text-xs leading-4 text-gray-500">
                  {timeAgo(a.earned_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBadge(null)} />
          <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-4 border-white shadow-lg">
              <span className="text-4xl">{getBadgeEmoji(selectedBadge.nama_badge)}</span>
            </div>
            <h3 className="font-nunito mb-2 text-2xl font-extrabold text-gray-900">
              {selectedBadge.nama_badge}
            </h3>
            <p className="font-quicksand text-sm text-gray-600 mb-6 px-2">
              {selectedBadge.deskripsi}
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex justify-between items-center text-sm">
              <span className="font-quicksand font-bold text-gray-500">Syarat Poin</span>
              <span className="font-quicksand font-bold text-amber-500">{selectedBadge.syarat_poin} pts</span>
            </div>
            <p className="font-outfit text-xs text-gray-400 mt-4">
              Diperoleh pada: {new Date(selectedBadge.earned_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* All Badges Modal */}
      {showAllBadges && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAllBadges} />
          <div className="relative w-full max-w-lg max-h-[85vh] rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="font-nunito text-xl font-extrabold text-gray-900">Semua Badge</h3>
                <p className="font-quicksand text-sm text-gray-500 mt-1">
                  {allBadges.filter(b => b.earned).length}/{allBadges.length} badge diraih
                </p>
              </div>
              <button
                onClick={closeAllBadges}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAll ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4 items-center rounded-2xl bg-gray-50 p-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                        <div className="h-3 w-2/3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allBadges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🏅</span>
                  <p className="font-quicksand text-sm font-bold text-gray-400">Belum ada badge tersedia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allBadges.map((badge) => (
                    <div
                      key={badge.badges_id}
                      className={`flex items-center gap-4 rounded-2xl p-4 transition-colors ${
                        badge.earned
                          ? "bg-emerald-50 border border-emerald-100"
                          : "bg-gray-50 border border-gray-100 opacity-70"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                          badge.earned ? "bg-white shadow-sm" : "bg-gray-200"
                        }`}
                      >
                        {badge.earned ? (
                          <span className="text-2xl">{getBadgeEmoji(badge.nama_badge)}</span>
                        ) : (
                          <Lock size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-quicksand text-sm font-bold ${badge.earned ? "text-gray-800" : "text-gray-500"}`}>
                          {badge.nama_badge}
                        </p>
                        <p className="font-outfit text-xs text-gray-400 mt-0.5 truncate">
                          {badge.deskripsi}
                        </p>
                        {badge.earned && badge.earned_at && (
                          <p className="font-outfit text-[10px] text-emerald-500 mt-1">
                            ✓ Diraih {timeAgo(badge.earned_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {badge.earned ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Diraih
                          </span>
                        ) : (
                          <span className="font-quicksand text-xs font-bold text-gray-400">
                            {badge.syarat_poin} pts
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentAchievements;
