"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth, updateStoredPoints } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatsCards from "@/components/dashboard/StatsCards";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import RecentUpdates from "@/components/dashboard/RecentUpdates";
import DailyChallenges from "@/components/dashboard/DailyChallenges";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-ecopoint.vercel.app/api";

interface DashboardData {
  stats: {
    total_poin: number;
    reports_submitted: number;
    badges_earned: number;
  };
  weekly_activity: { day: string; count: number }[];
  recent_achievements: {
    badges_id: string;
    nama_badge: string;
    deskripsi: string;
    syarat_poin: number;
    earned_at: string;
  }[];
  recent_updates: {
    notifications_id: string;
    pesan: string;
    is_read: boolean;
    created_at: string;
  }[];
  user: { created_at: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const [showChallenges, setShowChallenges] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth?.token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d?.stats?.total_poin !== undefined) {
          updateStoredPoints(d.stats.total_poin);
        }
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
    window.addEventListener("ecopoint-auth-changed", fetchDashboard);
    return () =>
      window.removeEventListener("ecopoint-auth-changed", fetchDashboard);
  }, [fetchDashboard]);

  // Member since
  const memberSince = data?.user?.created_at
    ? new Date(data.user.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
        {/* Profile Card skeleton */}
        <Skeleton className="h-[180px] w-full rounded-[32px]" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Skeleton className="h-[100px] rounded-[32px]" />
          <Skeleton className="h-[100px] rounded-[32px]" />
          <Skeleton className="h-[100px] rounded-[32px]" />
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[280px] rounded-[32px]" />
            <Skeleton className="h-[180px] rounded-[32px]" />
          </div>
          <Skeleton className="h-[350px] rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
      {/* Profile Card */}
      <ProfileCard
        onOpenChallenges={() => setShowChallenges(true)}
        memberSince={memberSince}
      />

      {/* Stats Cards - full width, live data */}
      <StatsCards
        totalPoin={data?.stats.total_poin ?? 0}
        reportsSubmitted={data?.stats.reports_submitted ?? 0}
        badgesEarned={data?.stats.badges_earned ?? 0}
      />

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <WeeklyActivity data={data?.weekly_activity} />
          <RecentAchievements achievements={data?.recent_achievements} />
        </div>
        {/* Right */}
        <div>
          <RecentUpdates updates={data?.recent_updates} />
        </div>
      </div>

      {/* Daily Challenges Modal */}
      <DailyChallenges
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
      />
    </div>
  );
}
