import ProfileCard from "@/components/dashboard/ProfileCard";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import RecentUpdates from "@/components/dashboard/RecentUpdates";
import StatsCards from "@/components/dashboard/StatsCards";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";


export default function DashboardPage() {
  return (
    <main style={{fontFamily: "'lato','sans-serif'", gap: "1rem"}} className="flex flex-col pt-4">
      <ProfileCard />
      <StatsCards />
      <WeeklyActivity />
      <RecentAchievements />
      <RecentUpdates />
    </main>
  );
}
