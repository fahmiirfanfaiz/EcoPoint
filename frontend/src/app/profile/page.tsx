import ProfileCard from "@/components/dashboard/ProfileCard";
import StatsCards from "@/components/dashboard/StatsCards";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import RecentUpdates from "@/components/dashboard/RecentUpdates";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
      {/* Profile Card */}
      <ProfileCard />

      {/* Stats Cards - full width */}
      <StatsCards />

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <WeeklyActivity />
          <RecentAchievements />
        </div>
        {/* Right */}
        <div>
          <RecentUpdates />
        </div>
      </div>
    </div>
  );
}
