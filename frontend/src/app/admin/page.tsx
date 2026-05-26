"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  FileText,
  Gift,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";

/* ─── Types ────────────────────────────────────────────────── */

interface AdminStats {
  total_users: number;
  active_challenges: number;
  reports_resolved: number;
  points_distributed: number;
}

interface PendingReport {
  report_id: number;
  user_id: string;
  kategori_user: string;
  kategori_ai: string | null;
  status_validasi: string;
  poin_didapat: number;
  created_at: string;
  user?: { nama: string };
}

interface TopUser {
  user_id: string;
  nama: string;
  total_poin: number;
  fakultas: string;
}

/* ─── Helpers ──────────────────────────────────────────────── */

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock },
  approved: { label: "Disetujui", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  rejected: { label: "Ditolak", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
};

/* ─── Component ────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderPeriod, setLeaderPeriod] = useState<"sepanjang-waktu" | "mingguan">("sepanjang-waktu");
  const [leaderLoading, setLeaderLoading] = useState(false);

  const fetchLeaderboard = async (period: string) => {
    setLeaderLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/leaderboard?period=${period}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setTopUsers(
          (data.leaderboard ?? []).map(
            (u: { user_id: string; nama: string; total_poin: number; fakultas?: string }) => ({
              user_id: u.user_id,
              nama: u.nama,
              total_poin: Number(u.total_poin),
              fakultas: u.fakultas ?? "",
            })
          )
        );
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLeaderLoading(false);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      const token = getBearerToken();
      if (!token) return;

      setIsLoading(true);
      try {
        const [dashRes, reportsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard`, { headers: { Authorization: token } }),
          fetch(`${API_BASE_URL}/admin/waste-reports`, { headers: { Authorization: token } }),
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData.admin_stats) {
            setAdminStats(dashData.admin_stats);
          }
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          const allReports: PendingReport[] = reportsData.reports ?? [];
          setTotalReports(allReports.length);
          const pending = allReports.filter(
            (r: PendingReport) => r.status_validasi?.replace(/'/g, "").toLowerCase() === "pending"
          );
          setTotalPending(pending.length);
          setPendingReports(pending.slice(0, 5));
        }

        await fetchLeaderboard(leaderPeriod);
      } catch (err) {
        console.error("Admin dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch leaderboard when period changes
  useEffect(() => {
    void fetchLeaderboard(leaderPeriod);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderPeriod]);

  const stats = [
    {
      title: "Total Pengguna",
      value: adminStats?.total_users?.toLocaleString("id-ID") ?? "-",
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      title: "Tantangan Aktif",
      value: adminStats?.active_challenges?.toLocaleString("id-ID") ?? "-",
      icon: Target,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
    },
    {
      title: "Laporan Disetujui",
      value: adminStats?.reports_resolved?.toLocaleString("id-ID") ?? "-",
      icon: CheckCircle,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      title: "Poin Didistribusikan",
      value: adminStats?.points_distributed?.toLocaleString("id-ID") ?? "-",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
  ];

  const quickLinks = [
    { label: "Validasi Laporan", href: "/admin/validasi", icon: ClipboardCheck, desc: "Review laporan masuk", color: "text-emerald-600 bg-emerald-50" },
    { label: "Kelola Pengguna", href: "/admin/users", icon: Users, desc: "Manajemen akun", color: "text-blue-600 bg-blue-50" },
    { label: "Kelola Badge", href: "/admin/badges", icon: Award, desc: "Atur lencana", color: "text-purple-600 bg-purple-50" },
    { label: "Kelola Rewards", href: "/admin/rewards", icon: Gift, desc: "Atur hadiah", color: "text-orange-600 bg-orange-50" },
    { label: "Daily Challenge", href: "/admin/challenges", icon: Target, desc: "Atur tantangan harian", color: "text-pink-600 bg-pink-50" },
    { label: "Kirim Notifikasi", href: "/admin/notifications", icon: FileText, desc: "Broadcast pengumuman", color: "text-amber-600 bg-amber-50" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <div className="h-8 w-64 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-5 w-96 mt-2 rounded-lg bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-[400px] rounded-2xl bg-white border border-gray-100 animate-pulse" />
          <div className="h-[400px] rounded-2xl bg-white border border-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
          Dashboard Admin
        </h1>
        <p className="mt-1 text-gray-500 font-quicksand">
          Ringkasan data dan aktivitas platform EcoPoint.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightColor} text-white transition-transform group-hover:scale-110`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-quicksand text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="mt-1 font-nunito text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full scale-x-0 transition-transform group-hover:scale-x-100 origin-left ${stat.color}`}
              />
            </div>
          );
        })}
      </div>

      {/* Middle Section: Pending Reports + Top Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Pending Reports */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="font-nunito text-lg font-bold text-gray-900">
                Laporan Menunggu Validasi
              </h2>
              <p className="mt-1 font-quicksand text-sm text-gray-500">
                {totalPending} dari {totalReports} laporan perlu ditinjau.
              </p>
            </div>
            {totalPending > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 border border-amber-200">
                <AlertCircle size={14} />
                {totalPending} pending
              </div>
            )}
          </div>

          <div className="p-6">
            {pendingReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm">
                  <CheckCircle size={20} />
                </div>
                <p className="mt-4 font-nunito text-base font-bold text-gray-900">
                  Semua laporan sudah divalidasi 🎉
                </p>
                <p className="mt-1 font-quicksand text-sm text-gray-500">
                  Tidak ada laporan yang menunggu persetujuan saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.map((report) => {
                  const rawStatus = report.status_validasi?.replace(/'/g, "").toLowerCase() ?? "pending";
                  const cfg = statusConfig[rawStatus] ?? statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={`${report.report_id}-${report.user_id}`}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-quicksand text-sm font-semibold text-gray-900 truncate">
                          {report.user?.nama ?? "Pengguna"} — {report.kategori_user?.replace(/'/g, "") || report.kategori_ai?.replace(/'/g, "") || "Sampah"}
                        </p>
                        <p className="font-quicksand text-xs text-gray-500 mt-0.5 truncate">
                          {formatDate(report.created_at)} · +{report.poin_didapat} poin
                        </p>
                      </div>
                      <Link
                        href="/admin/validasi"
                        className="flex-shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  );
                })}

                {totalPending > 5 && (
                  <Link
                    href="/admin/validasi"
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3 font-quicksand text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    Lihat semua {totalPending} laporan <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Users by Points */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-nunito text-lg font-bold text-gray-900">
                  Top Pengguna
                </h2>
                <p className="mt-1 font-quicksand text-sm text-gray-500">
                  {leaderPeriod === "mingguan" ? "Poin minggu ini" : "Poin sepanjang waktu"}.
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setLeaderPeriod("sepanjang-waktu")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  leaderPeriod === "sepanjang-waktu"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sepanjang Waktu
              </button>
              <button
                onClick={() => setLeaderPeriod("mingguan")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  leaderPeriod === "mingguan"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mingguan
              </button>
            </div>
          </div>

          <div className="p-4">
            {leaderLoading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                      <div className="h-3 w-1/4 rounded bg-gray-100" />
                    </div>
                    <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : topUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <p className="font-nunito text-base font-bold text-gray-900">Belum ada data pengguna</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topUsers.map((user, idx) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-nunito text-sm font-extrabold ${
                        idx === 0
                          ? "bg-amber-100 text-amber-700"
                          : idx === 1
                            ? "bg-gray-200 text-gray-600"
                            : idx === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-quicksand text-sm font-bold text-gray-900 truncate">
                        {user.nama}
                      </p>
                      <p className="font-quicksand text-xs text-gray-400 truncate">
                        {user.fakultas?.replace(/'/g, "") || "—"}
                      </p>
                    </div>
                    <span className="font-nunito text-sm font-extrabold text-emerald-600">
                      {user.total_poin.toLocaleString("id-ID")} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-nunito text-lg font-bold text-gray-900">
            Aksi Cepat
          </h2>
          <p className="mt-1 font-quicksand text-sm text-gray-500">
            Pintasan ke halaman pengelolaan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-sm"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${link.color} transition-transform group-hover:scale-110`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-quicksand text-sm font-bold text-gray-900">{link.label}</p>
                  <p className="font-quicksand text-xs text-gray-400">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
