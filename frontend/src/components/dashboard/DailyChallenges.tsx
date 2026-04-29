"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStoredAuth } from "@/lib/auth";
import { Recycle, Share2, Trophy, Star, Eye } from "lucide-react";

interface TodayChallengeData {
  challenge_of_the_day_id: string;
  nama_challenge: string;
  deskripsi: string;
  poin_hadiah: number;
  target_count: number;
  challenge_type: string;
  is_permanent: boolean;
  user_progress: {
    current_progress: number;
    is_completed: boolean;
    is_points_claimed: boolean;
    claimed_at: string | null;
  } | null;
}

const TYPE_ICONS: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  waste_report: {
    bg: "bg-blue-100",
    color: "text-blue-600",
    icon: Recycle,
  },
  share_invite: {
    bg: "bg-orange-100",
    color: "text-orange-600",
    icon: Share2,
  },
  redeem_reward: {
    bg: "bg-purple-100",
    color: "text-purple-600",
    icon: Trophy,
  },
  login_streak: {
    bg: "bg-amber-100",
    color: "text-amber-600",
    icon: Star,
  },
  view_leaderboard: {
    bg: "bg-cyan-100",
    color: "text-cyan-600",
    icon: Eye,
  },
};

const DEFAULT_ICON = TYPE_ICONS.waste_report;

interface DailyChallengesProps {
  isOpen: boolean;
  onClose: () => void;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

const DailyChallenges: React.FC<DailyChallengesProps> = ({ isOpen, onClose }) => {
  const [challenges, setChallenges] = useState<TodayChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getStoredAuth();
      const headers: Record<string, string> = {};
      if (auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const res = await fetch(`${API}/daily-challenges/today`, { headers });
      if (!res.ok) throw new Error("Gagal memuat challenges");
      const data = await res.json();
      setChallenges(data.challenges ?? []);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchChallenges();
  }, [isOpen, fetchChallenges]);

  // Calculate countdown to midnight
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white"
        style={{
          boxShadow:
            "0px 25px 50px -12px rgba(0,0,0,0.25), 0px 0px 0px 1px rgba(226,232,240,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden p-6"
          style={{
            background: "linear-gradient(90deg, #10B981 0%, #14B8A6 100%)",
          }}
        >
          {/* Decorative blurs */}
          <div
            className="pointer-events-none absolute right-[-16px] top-[-16px] h-24 w-24 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", filter: "blur(12px)" }}
          />
          <div
            className="pointer-events-none absolute -left-8 bottom-[-8px] h-32 w-32 rounded-full"
            style={{ background: "rgba(253,224,71,0.2)", filter: "blur(12px)" }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1.17 11.67L0 10.5L4.67 5.83L0 1.17L1.17 0L5.83 4.67L10.5 0L11.67 1.17L7 5.83L11.67 10.5L10.5 11.67L5.83 7L1.17 11.67Z"
                fill="#D1FAE5"
              />
            </svg>
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <path
                  d="M5 22.5V20H10V16.13C8.98 15.9 8.07 15.46 7.27 14.83C6.46 14.19 5.88 13.4 5.5 12.44C3.94 12.25 2.63 11.57 1.58 10.39C0.53 9.21 0 7.83 0 6.25V5C0 4.31 0.24 3.72 0.73 3.23C1.22 2.74 1.81 2.5 2.5 2.5H5V0H17.5V2.5H20C20.69 2.5 21.28 2.74 21.77 3.23C22.26 3.72 22.5 4.31 22.5 5V6.25C22.5 7.83 21.97 9.21 20.92 10.39C19.87 11.57 18.56 12.25 17 12.44C16.63 13.4 16.04 14.19 15.23 14.83C14.43 15.46 13.52 15.9 12.5 16.13V20H17.5V22.5H5ZM5 9.75V5H2.5V6.25C2.5 7.04 2.73 7.76 3.19 8.39C3.65 9.03 4.25 9.48 5 9.75ZM11.25 13.75C12.29 13.75 13.18 13.39 13.91 12.66C14.64 11.93 15 11.04 15 10V2.5H7.5V10C7.5 11.04 7.86 11.93 8.59 12.66C9.32 13.39 10.21 13.75 11.25 13.75ZM17.5 9.75C18.25 9.48 18.85 9.03 19.31 8.39C19.77 7.76 20 7.04 20 6.25V5H17.5V9.75Z"
                  fill="#059669"
                />
              </svg>
            </div>
            <h2 className="font-nunito text-2xl font-extrabold leading-8 text-white">
              Daily Challenges
            </h2>
            <p className="font-nunito mt-1 text-sm font-medium leading-5 text-emerald-50">
              Complete tasks to earn bonus points!
            </p>
          </div>
        </div>

        {/* Challenge List */}
        <div className="flex flex-col gap-4 p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <span className="font-nunito text-sm text-slate-400">Memuat challenges...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="font-nunito text-sm text-red-500">{error}</span>
              <button onClick={fetchChallenges} className="font-nunito text-xs font-bold text-emerald-600 hover:underline">
                Coba lagi
              </button>
            </div>
          ) : challenges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="font-nunito text-sm text-slate-400">Belum ada challenge untuk hari ini.</span>
            </div>
          ) : (
            challenges.map((c) => {
              const progress = c.user_progress?.current_progress ?? 0;
              const total = c.target_count;
              const completed = c.user_progress?.is_completed ?? false;
              const iconData = TYPE_ICONS[c.challenge_type] || DEFAULT_ICON;

              const progressLabel = completed
                ? "Completed"
                : progress > 0
                ? "Progress"
                : "Not Started";

              return (
                <div
                  key={c.challenge_of_the_day_id}
                  className={`relative flex flex-col gap-3 rounded-3xl p-4 ${
                    completed
                      ? "bg-emerald-50/50 outline outline-1 outline-offset-[-1px] outline-emerald-100"
                      : "bg-slate-50 outline outline-1 outline-offset-[-1px] outline-slate-100"
                  }`}
                >
                  {/* Completed check icon */}
                  {completed && (
                    <div className="absolute right-4 top-4">
                      <div className="flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path
                            d="M6.45 10.95L11.74 5.66L10.69 4.61L6.45 8.85L4.31 6.71L3.26 7.76L6.45 10.95ZM7.5 15C6.46 15 5.49 14.8 4.58 14.41C3.66 14.02 2.87 13.48 2.19 12.81C1.52 12.13 0.98 11.34 0.59 10.43C0.2 9.51 0 8.54 0 7.5C0 6.46 0.2 5.49 0.59 4.58C0.98 3.66 1.52 2.87 2.19 2.19C2.87 1.52 3.66 0.98 4.58 0.59C5.49 0.2 6.46 0 7.5 0C8.54 0 9.51 0.2 10.43 0.59C11.34 0.98 12.13 1.52 12.81 2.19C13.48 2.87 14.02 3.66 14.41 4.58C14.8 5.49 15 6.46 15 7.5C15 8.54 14.8 9.51 14.41 10.43C14.02 11.34 13.48 12.13 12.81 12.81C12.13 13.48 11.34 14.02 10.43 14.41C9.51 14.8 8.54 15 7.5 15Z"
                            fill="#10B981"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-start justify-between ${completed ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[16px] ${iconData.bg} ${iconData.color}`}>
                        <iconData.icon size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`font-nunito text-sm font-bold leading-5 text-slate-800 ${
                            completed ? "line-through" : ""
                          }`}
                        >
                          {c.nama_challenge}
                        </span>
                        <span className="font-nunito text-xs font-medium leading-4 text-slate-500">
                          {c.deskripsi}
                        </span>
                      </div>
                    </div>
                    {!completed && (
                      <span
                        className="font-nunito flex-shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold leading-4 text-emerald-700"
                        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                      >
                        +{c.poin_hadiah} Pts
                      </span>
                    )}
                    {completed && (
                      <span className="font-nunito flex-shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold leading-4 text-slate-400">
                        Done
                      </span>
                    )}
                  </div>

                  <div className={`flex flex-col gap-1 ${completed ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-nunito text-xs font-semibold leading-4 text-slate-500">
                        {progressLabel}
                      </span>
                      <span
                        className={`font-nunito text-xs font-semibold leading-4 ${
                          progress > 0 ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {progress}/{total}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${total > 0 ? (progress / total) * 100 : 0}%`,
                          boxShadow:
                            progress > 0
                              ? "0px 0px 10px 0px rgba(16,185,129,0.4)"
                              : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 border-t border-slate-100 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="font-nunito relative w-full rounded-3xl bg-emerald-500 px-6 py-3 text-center text-sm font-bold uppercase leading-5 tracking-tight text-white transition hover:bg-emerald-600"
            style={{
              boxShadow:
                "0px 4px 6px -4px rgba(16,185,129,0.3), 0px 10px 15px -3px rgba(16,185,129,0.3)",
            }}
          >
            Close &amp; Continue
          </button>
          <span className="font-nunito text-[10px] font-medium uppercase leading-4 tracking-wide text-slate-400">
            Resets in {getTimeUntilReset()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
