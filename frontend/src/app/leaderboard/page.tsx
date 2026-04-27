import LeaderboardKampus from "@/components/leaderboard/Leaderboard"

export default function LeaderboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
      <LeaderboardKampus />
    </div>
  );
}