"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredAuth, updateStoredPoints } from "@/lib/auth";
import DailyChallenges from "@/components/dashboard/DailyChallenges";
import {
  Zap, ChevronRight, Plus, Trophy, Recycle, Loader2,
  Target, Star, TrendingUp, Award, Flame, BarChart3, Gift
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

interface TodayChallengeItem {
  challenge_of_the_day_id: string;
  nama_challenge: string;
  deskripsi: string;
  poin_hadiah: number;
  target_count: number;
  challenge_type: string;
  is_permanent: boolean;
  user_progress: { current_progress: number; is_completed: boolean; is_points_claimed: boolean } | null;
}

interface LeaderboardUser {
  rank: number;
  nama: string;
  total_poin: number;
  reports_count: number;
}

interface UserStats {
  total_poin: number;
  reports_submitted: number;
  badges_earned: number;
}

interface WeeklyDay {
  day: string;
  count: number;
}

const CHALLENGE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  waste_report: { icon: Recycle, color: "text-blue-600", bg: "bg-blue-100" },
  share_invite: { icon: Target, color: "text-orange-600", bg: "bg-orange-100" },
  redeem_reward: { icon: Trophy, color: "text-purple-600", bg: "bg-purple-100" },
  login_streak: { icon: Star, color: "text-amber-600", bg: "bg-amber-100" },
  view_leaderboard: { icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-100" },
};

export default function BerandaPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<TodayChallengeItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (challengeOfTheDayId: string) => {
    const auth = getStoredAuth();
    if (!auth?.token) return;
    setClaimingId(challengeOfTheDayId);
    try {
      const res = await fetch(`${API}/daily-challenges/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ challenge_of_the_day_id: challengeOfTheDayId }),
      });
      if (res.ok) {
        const result = await res.json();
        updateStoredPoints(result.data.total_poin);
      }
    } catch (e) {
      console.error("Claim error:", e);
    } finally {
      setClaimingId(null);
    }
  };

  const fetchAll = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth) { router.push("/login"); return; }
    setUserName(auth.user.nama);
    const headers = { Authorization: `Bearer ${auth.token}` };

    try {
      const [dashRes, chalRes, lbRes] = await Promise.all([
        fetch(`${API}/dashboard`, { headers }),
        fetch(`${API}/daily-challenges/today`, { headers }),
        fetch(`${API}/leaderboard?limit=5`),
      ]);
      if (dashRes.ok) { const d = await dashRes.json(); setStats(d.stats); setWeeklyActivity(d.weekly_activity ?? []); }
      if (chalRes.ok) { const d = await chalRes.json(); setChallenges(d.challenges ?? []); }
      if (lbRes.ok) { const d = await lbRes.json(); setLeaderboard(d.leaderboard ?? []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { 
    fetchAll(); 
    window.addEventListener("ecopoint-auth-changed", fetchAll);
    return () => window.removeEventListener("ecopoint-auth-changed", fetchAll);
  }, [fetchAll]);

  const completedCount = challenges.filter((c) => c.user_progress?.is_completed).length;
  const totalChalPoin = challenges.reduce((s, c) => s + c.poin_hadiah, 0);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="font-quicksand text-gray-400 font-semibold">Memuat beranda...</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-8">

      {/* ── Hero Section ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10" style={{ background: "linear-gradient(135deg, #059669 0%, #10B981 40%, #34D399 100%)" }}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full" style={{ background: "rgba(253,224,71,0.12)" }} />
        <div className="pointer-events-none absolute right-20 bottom-0 h-32 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-outfit text-emerald-100 text-sm mb-1">{greeting} 🌿</p>
            <h1 className="font-nunito text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {userName}!
            </h1>
            <p className="font-quicksand text-emerald-100 mt-2 max-w-md">
              Ayo mulai hari ini dengan aksi nyata untuk kampus yang lebih hijau dan bersih.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/lapor-sampah" className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-outfit font-semibold text-emerald-700 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
              <Plus size={20} /> Lapor Sampah
            </Link>
            <Link href="/tukar-poin" className="flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3 font-outfit font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 border border-white/20">
              <Gift size={18} /> Tukar Poin
            </Link>
          </div>
        </div>

        {/* Mini Stats in Hero */}
        {stats && (
          <div className="relative z-10 mt-8 grid grid-cols-3 gap-4">
            {[
              { 
                icon: () => (
                  <svg width="20" height="20" viewBox="0 0 25 24" fill="none">
                    <path d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z" fill="currentColor" />
                  </svg>
                ),
                label: "Total Poin", 
                value: stats.total_poin.toLocaleString(), 
                accent: "bg-amber-400/20 text-amber-200" 
              },
              { icon: Recycle, label: "Laporan", value: stats.reports_submitted.toLocaleString(), accent: "bg-white/10 text-emerald-100" },
              { 
                icon: () => (
                  <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
                    <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="currentColor" />
                    <path d="M4 12v8l4-2 4 2v-8" fill="currentColor" opacity="0.6"/>
                  </svg>
                ),
                label: "Badge", 
                value: stats.badges_earned.toLocaleString(), 
                accent: "bg-purple-400/20 text-purple-200" 
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/10">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${s.accent}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="font-outfit text-[11px] text-emerald-200">{s.label}</p>
                  <p className="font-quicksand text-xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content Grid ──────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">

        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Daily Challenges */}
          <div className="rounded-[28px] bg-white p-6 shadow-sm" style={{ outline: "1px #ECFDF5 solid", outlineOffset: "-1px" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Flame size={20} />
                </div>
                <div>
                  <h2 className="font-nunito text-lg font-extrabold text-gray-900">Challenge Hari Ini</h2>
                  <p className="font-quicksand text-xs text-gray-400">{completedCount}/{challenges.length} selesai · Total {totalChalPoin} poin</p>
                </div>
              </div>
            </div>

            {challenges.length > 0 ? (
              <div className="space-y-3">
                {challenges.map((c) => {
                  const ci = CHALLENGE_ICONS[c.challenge_type] || CHALLENGE_ICONS.waste_report;
                  const Icon = ci.icon;
                  const progress = c.user_progress?.current_progress ?? 0;
                  const pct = c.target_count > 0 ? Math.min((progress / c.target_count) * 100, 100) : 0;
                  const done = c.user_progress?.is_completed ?? false;
                  const claimed = c.user_progress?.is_points_claimed ?? false;
                  const isFullyDone = done && claimed;

                  return (
                    <div key={c.challenge_of_the_day_id} className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${isFullyDone ? "bg-slate-50/70 opacity-60 grayscale-[0.5]" : done ? "bg-emerald-50 outline outline-1 outline-emerald-200 shadow-sm" : "bg-gray-50 hover:bg-gray-100/70"}`}>
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${ci.bg} ${ci.color}`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-nunito text-sm font-bold text-gray-800 ${isFullyDone ? "line-through text-slate-500" : ""}`}>{c.nama_challenge}</p>
                        <p className="font-quicksand text-xs text-gray-400 mt-0.5 truncate">{c.deskripsi}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div className={`h-full rounded-full transition-all duration-500 ${isFullyDone ? "bg-slate-400" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-quicksand text-[11px] font-semibold text-gray-400">{progress}/{c.target_count}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {!done && (
                          <>
                            <span className="font-quicksand text-sm font-bold text-emerald-600">+{c.poin_hadiah}</span>
                            <span className="font-outfit text-[10px] text-gray-400">poin</span>
                          </>
                        )}
                        {done && !claimed && (
                          <button
                            onClick={() => handleClaim(c.challenge_of_the_day_id)}
                            disabled={claimingId === c.challenge_of_the_day_id}
                            className="font-nunito flex-shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 shadow-md shadow-emerald-200 disabled:opacity-50"
                          >
                            {claimingId === c.challenge_of_the_day_id ? "..." : `Claim +${c.poin_hadiah}`}
                          </button>
                        )}
                        {isFullyDone && (
                          <span className="font-nunito flex-shrink-0 rounded-md bg-slate-200 px-2 py-1 text-xs font-bold leading-4 text-slate-500">
                            Claimed ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <Flame size={40} className="text-gray-200 mb-3" />
                <p className="font-nunito text-sm font-bold text-gray-400">Belum ada challenge hari ini</p>
              </div>
            )}
          </div>

          {/* Weekly Activity */}
          <div className="rounded-[28px] bg-white p-6 shadow-sm" style={{ outline: "1px #ECFDF5 solid", outlineOffset: "-1px" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="font-nunito text-lg font-extrabold text-gray-900">Aktivitas Mingguan</h2>
                  <p className="font-quicksand text-xs text-gray-400">{weeklyActivity.reduce((s, w) => s + w.count, 0)} laporan minggu ini</p>
                </div>
              </div>
              <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-xs text-emerald-800">Minggu Ini</span>
            </div>
            <div className="flex items-end justify-between gap-2 px-2" style={{ height: "160px" }}>
              {weeklyActivity.map((w) => {
                const maxVal = Math.max(...weeklyActivity.map((d) => d.count), 1);
                const barH = maxVal > 0 ? (w.count / maxVal) * 120 : 0;
                return (
                  <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full max-w-[40px]" style={{ height: "120px" }}>
                      <div className="absolute bottom-0 w-full rounded-t-xl transition-all duration-500" style={{ height: `${barH}px`, background: w.count >= maxVal * 0.8 ? "linear-gradient(180deg, #10B981 0%, #34D399 100%)" : "linear-gradient(180deg, #6EE7B7 0%, #A7F3D0 100%)" }} />
                      {w.count > 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-quicksand text-[10px] font-bold text-emerald-600">{w.count}</span>}
                    </div>
                    <span className="font-quicksand text-xs font-bold text-gray-400">{w.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* Leaderboard Mini */}
          <div className="rounded-[28px] bg-white p-6 shadow-sm" style={{ outline: "1px #ECFDF5 solid", outlineOffset: "-1px" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                  <TrendingUp size={20} />
                </div>
                <h2 className="font-nunito text-lg font-extrabold text-gray-900">Leaderboard</h2>
              </div>
              <Link href="/leaderboard" className="font-quicksand text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                Semua <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-2">
              {leaderboard.map((u, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${i < 3 ? "bg-amber-50/50" : "hover:bg-gray-50"}`}>
                    <span className="w-8 text-center font-nunito text-lg font-extrabold">
                      {i < 3 ? medals[i] : <span className="text-sm text-gray-400">{u.rank}</span>}
                    </span>
                    <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${u.nama}`} alt="" className="h-9 w-9 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-nunito text-sm font-bold text-gray-800 truncate">{u.nama}</p>
                      <p className="font-quicksand text-[11px] text-gray-400">{u.reports_count} laporan</p>
                    </div>
                    <span className="font-quicksand text-sm font-bold text-emerald-600 flex-shrink-0">{u.total_poin.toLocaleString()}</span>
                  </div>
                );
              })}
              {leaderboard.length === 0 && (
                <p className="font-quicksand text-sm text-gray-400 text-center py-6">Belum ada data</p>
              )}
            </div>
          </div>

          {/* Eco Tips */}
          <div className="rounded-[28px] overflow-hidden shadow-sm" style={{ outline: "1px #ECFDF5 solid", outlineOffset: "-1px" }}>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h3 className="font-nunito text-base font-extrabold text-emerald-800">Eco Tips</h3>
              </div>
              <p className="font-quicksand text-sm text-emerald-700 leading-relaxed">
                Tahukah kamu? Satu botol plastik bisa membutuhkan <strong>450 tahun</strong> untuk terurai secara alami. Dengan melaporkan dan mendaur ulang sampah plastik, kamu membantu mengurangi dampak buruk ini!
              </p>
            </div>
          </div>

          {/* Impact Summary */}
          {stats && (
            <div className="rounded-[28px] bg-white p-6 shadow-sm" style={{ outline: "1px #ECFDF5 solid", outlineOffset: "-1px" }}>
              <h3 className="font-nunito text-base font-extrabold text-gray-900 mb-4">Dampak Kontribusimu 🌍</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-quicksand text-xs text-gray-500">Laporan Sampah</span>
                    <span className="font-quicksand text-xs font-bold text-emerald-600">{stats.reports_submitted}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(stats.reports_submitted * 2, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-quicksand text-xs text-gray-500">Badge Diraih</span>
                    <span className="font-quicksand text-xs font-bold text-purple-600">{stats.badges_earned}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100">
                    <div className="h-full rounded-full bg-purple-500 transition-all duration-700" style={{ width: `${Math.min(stats.badges_earned * 10, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-quicksand text-xs text-gray-500">Poin Terkumpul</span>
                    <span className="font-quicksand text-xs font-bold text-amber-600">{stats.total_poin.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${Math.min(stats.total_poin / 50, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Challenges Modal */}
      <DailyChallenges isOpen={showChallengesModal} onClose={() => setShowChallengesModal(false)} />
    </div>
  );
}
