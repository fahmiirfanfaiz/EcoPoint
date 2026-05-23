import React from "react";

interface Achievement {
  badges_id: string;
  nama_badge: string;
  deskripsi: string;
  syarat_poin: number;
  earned_at: string;
}

interface RecentAchievementsProps {
  achievements?: Achievement[];
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

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ achievements = [] }) => (
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
        <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Recent Achievements</span>
      </div>
      {achievements.length > 0 && (
        <span className="font-quicksand text-sm font-bold leading-5 text-emerald-500">
          {achievements.length} badge
        </span>
      )}
    </div>

    {achievements.length === 0 ? (
      <div className="flex flex-col items-center gap-2 py-8">
        <span className="text-4xl">🏅</span>
        <p className="font-quicksand text-sm font-semibold text-gray-400">Belum ada badge yang diraih</p>
        <p className="font-outfit text-xs text-gray-400">Terus kumpulkan poin untuk mendapatkan badge!</p>
      </div>
    ) : (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {achievements.map((a) => (
          <div
            key={a.badges_id}
            className="flex min-w-[140px] flex-col items-center rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-4"
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
);

export default RecentAchievements;
