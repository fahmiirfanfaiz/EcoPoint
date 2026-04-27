import React from "react";

const achievements = [
  { emoji: "🌿", title: "Eco Starter", desc: "First recycle", locked: false },
  { emoji: "♻️", title: "Recycle Pro", desc: "50 items", locked: false },
  { emoji: "🔥", title: "Streak Master", desc: "7 days row", locked: false },
  { emoji: "🔒", title: "Plastic Hero", desc: "Locked", locked: true },
];

const RecentAchievements: React.FC = () => (
  <div
    className="rounded-[32px] bg-white p-6 w-[90%] mx-auto"
    style={{
      outline: "1px #ECFDF5 solid",
      outlineOffset: "-1px",
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
    }}
  >
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
          <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="#F59E0B" />
          <path d="M4 12v8l4-2 4 2v-8" fill="#F59E0B" opacity="0.6" />
        </svg>
        <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Recent Achievements</span>
      </div>
      <button className="font-quicksand text-sm font-bold leading-5 text-emerald-500 hover:text-emerald-600">View All</button>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2">
      {achievements.map((a) => (
        <div
          key={a.title}
          className={`flex min-w-[140px] flex-col items-center rounded-3xl px-4 py-4 ${
            a.locked
              ? "border border-gray-300 bg-gray-50 opacity-60"
              : "border border-emerald-100 bg-emerald-50"
          }`}
        >
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${a.locked ? "bg-gray-200" : "bg-white"}`}
            style={{ boxShadow: a.locked ? "none" : "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <span className="text-2xl">{a.emoji}</span>
          </div>
          <span className={`font-quicksand text-center text-sm font-bold leading-5 ${a.locked ? "text-gray-500" : "text-gray-800"}`}>{a.title}</span>
          <span className={`font-outfit mt-1 text-center text-xs leading-4 ${a.locked ? "text-gray-400" : "text-gray-500"}`}>{a.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

export default RecentAchievements;
