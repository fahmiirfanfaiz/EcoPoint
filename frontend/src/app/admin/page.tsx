"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Circle,
  CheckCircle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";

interface RecentUpdate {
  notifications_id: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

const formatAdminTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      trend: "+12%",
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      title: "Active Challenges",
      value: "24",
      trend: "+4%",
      icon: Target,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
    },
    {
      title: "Reports Resolved",
      value: "856",
      trend: "+28%",
      icon: CheckCircle,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
    },
    {
      title: "Points Distributed",
      value: "45K",
      trend: "+15%",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
    },
  ];

  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);
  const [updatesError, setUpdatesError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentUpdates = async () => {
      setIsLoadingUpdates(true);
      setUpdatesError(null);

      try {
        const token = getBearerToken();
        if (!token) {
          throw new Error("Silakan login ulang sebagai admin.");
        }

        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          const fallbackText = await response.text();
          throw new Error(fallbackText || "Gagal memuat recent updates");
        }

        const payload: { recent_updates?: RecentUpdate[] } =
          await response.json();
        setRecentUpdates(payload.recent_updates ?? []);
      } catch (error) {
        setUpdatesError(
          error instanceof Error
            ? error.message
            : "Gagal memuat recent updates",
        );
      } finally {
        setIsLoadingUpdates(false);
      }
    };

    void loadRecentUpdates();
  }, []);

  const unreadCount = useMemo(
    () => recentUpdates.filter((update) => !update.is_read).length,
    [recentUpdates],
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-gray-500 font-quicksand">
          Welcome back, Admin. Here &apos;s what &apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
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
                <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <TrendingUp size={14} />
                  {stat.trend}
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
              ></div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-nunito text-lg font-bold text-gray-900">
              Recent Updates
            </h2>
            <p className="mt-1 font-quicksand text-sm text-gray-500">
              Notifikasi terbaru dari aktivitas pengguna.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <Bell size={14} />
            {unreadCount} unread
          </div>
        </div>

        <div className="p-6">
          {isLoadingUpdates ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : updatesError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {updatesError}
            </div>
          ) : recentUpdates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                <Bell size={20} />
              </div>
              <p className="mt-4 font-nunito text-base font-bold text-gray-900">
                Belum ada recent updates
              </p>
              <p className="mt-1 font-quicksand text-sm text-gray-500">
                Notifikasi aktivitas pengguna akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUpdates.map((update) => (
                <div
                  key={update.notifications_id}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${update.is_read ? "border-gray-100 bg-white" : "border-emerald-100 bg-emerald-50/60"}`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${update.is_read ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {update.is_read ? (
                      <Circle size={14} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-quicksand text-sm font-semibold text-gray-900">
                        {update.pesan}
                      </p>
                      {!update.is_read && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-quicksand text-xs text-gray-500">
                      {formatAdminTime(update.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
