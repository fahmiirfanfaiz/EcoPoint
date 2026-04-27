"use client";

import React from "react";

interface Challenge {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  progress: number;
  total: number;
  progressLabel: string;
  completed: boolean;
}

const challenges: Challenge[] = [
  {
    icon: (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="16" fill="#DBEAFE" />
        <path
          d="M14.83 14L16.69 10.94L15.46 8.9C15.29 8.62 15.05 8.48 14.74 8.48C14.43 8.48 14.19 8.62 14.02 8.9L11.98 12.29L14.83 14ZM22.9 19.67L21.04 16.58L23.94 14.92L25.27 17.15C25.42 17.38 25.51 17.65 25.52 17.94C25.53 18.23 25.47 18.5 25.33 18.75C25.19 19.03 24.99 19.25 24.72 19.42C24.45 19.58 24.15 19.67 23.83 19.67H22.9ZM20.5 25.5L17.17 22.17L20.5 18.83V20.5H24.46L23.25 22.92C23.1 23.19 22.89 23.42 22.63 23.58C22.36 23.75 22.07 23.83 21.75 23.83H20.5V25.5ZM12.44 23.83C12.16 23.83 11.91 23.76 11.68 23.61C11.45 23.47 11.28 23.28 11.17 23.04C11.06 22.82 11 22.59 11.01 22.34C11.02 22.1 11.08 21.88 11.21 21.67L11.92 20.5H15.5V23.83H12.44ZM10.38 21.46L9.02 18.75C8.9 18.5 8.84 18.23 8.84 17.95C8.85 17.66 8.93 17.4 9.08 17.15L9.42 16.58L8 15.73L12.56 14.58L13.71 19.17L12.27 18.29L10.38 21.46ZM21.63 14.33L17.06 13.19L18.5 12.33L15.9 8H18.83C19.13 8 19.4 8.07 19.66 8.22C19.91 8.36 20.12 8.56 20.27 8.81L21.35 10.63L22.77 9.75L21.63 14.33Z"
          fill="#2563EB"
        />
      </svg>
    ),
    title: "Report 3 Plastic Items",
    subtitle: "Keep the campus clean!",
    badge: "+50 Pts",
    badgeColor: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    progress: 2,
    total: 3,
    progressLabel: "Progress",
    completed: false,
  },
  {
    icon: (
      <svg width="33" height="31" viewBox="0 0 33 31" fill="none">
        <rect width="33" height="31" rx="15.5" fill="#F3E8FF" />
        <path
          d="M9.67 21.33H13V14.67H9.67V21.33ZM14.67 21.33H18V9.67H14.67V21.33ZM19.67 21.33H23V16.33H19.67V21.33ZM8 23V13H13V8H19.67V14.67H24.67V23H8Z"
          fill="#9333EA"
        />
      </svg>
    ),
    title: "Top 10 on Leaderboard",
    subtitle: "You're crushing it!",
    badge: "Done",
    badgeColor: "text-slate-400",
    badgeBg: "bg-slate-100",
    progress: 1,
    total: 1,
    progressLabel: "Completed",
    completed: true,
  },
  {
    icon: (
      <svg width="36" height="30" viewBox="0 0 36 30" fill="none">
        <rect width="36" height="29.33" rx="14.67" fill="#FFEDD5" />
        <path
          d="M18.42 14.63C18.82 14.18 19.13 13.67 19.34 13.1C19.56 12.53 19.67 11.94 19.67 11.33C19.67 10.72 19.56 10.13 19.34 9.56C19.13 8.99 18.82 8.49 18.42 8.04C19.25 8.15 19.94 8.52 20.5 9.15C21.06 9.77 21.33 10.5 21.33 11.33C21.33 12.17 21.06 12.9 20.5 13.52C19.94 14.15 19.25 14.51 18.42 14.63ZM23 21.33V18.83C23 18.33 22.89 17.86 22.67 17.41C22.44 16.95 22.15 16.56 21.79 16.21C22.5 16.46 23.16 16.78 23.76 17.18C24.36 17.57 24.67 18.13 24.67 18.83V21.33H23ZM24.67 15.5V13.83H23V12.17H24.67V10.5H26.33V12.17H28V13.83H26.33V15.5H24.67ZM14.67 14.67C13.75 14.67 12.97 14.34 12.31 13.69C11.66 13.03 11.33 12.25 11.33 11.33C11.33 10.42 11.66 9.63 12.31 8.98C12.97 8.33 13.75 8 14.67 8C15.58 8 16.37 8.33 17.02 8.98C17.67 9.63 18 10.42 18 11.33C18 12.25 17.67 13.03 17.02 13.69C16.37 14.34 15.58 14.67 14.67 14.67ZM8 21.33V19C8 18.53 8.12 18.09 8.36 17.7C8.61 17.3 8.93 17 9.33 16.79C10.19 16.36 11.07 16.04 11.96 15.82C12.85 15.61 13.75 15.5 14.67 15.5C15.58 15.5 16.49 15.61 17.38 15.82C18.26 16.04 19.14 16.36 20 16.79C20.4 17 20.73 17.3 20.97 17.7C21.21 18.09 21.33 18.53 21.33 19V21.33H8Z"
          fill="#EA580C"
        />
      </svg>
    ),
    title: "Invite a Friend",
    subtitle: "Grow the community.",
    badge: "+100 Pts",
    badgeColor: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    progress: 0,
    total: 1,
    progressLabel: "Not Started",
    completed: false,
  },
];

interface DailyChallengesProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({ isOpen, onClose }) => {
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
        className="relative w-full max-w-[384px] overflow-hidden rounded-3xl bg-white"
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
          {challenges.map((c, i) => (
            <div
              key={i}
              className={`relative flex flex-col gap-3 rounded-3xl p-4 ${
                c.completed
                  ? "bg-emerald-50/50 outline outline-1 outline-offset-[-1px] outline-emerald-100"
                  : "bg-slate-50 outline outline-1 outline-offset-[-1px] outline-slate-100"
              }`}
            >
              {/* Completed check icon */}
              {c.completed && (
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

              <div className={`flex items-start justify-between ${c.completed ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  {c.icon}
                  <div className="flex flex-col">
                    <span
                      className={`font-nunito text-sm font-bold leading-5 text-slate-800 ${
                        c.completed ? "line-through" : ""
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="font-nunito text-xs font-medium leading-4 text-slate-500">
                      {c.subtitle}
                    </span>
                  </div>
                </div>
                {!c.completed && (
                  <span
                    className={`font-nunito flex-shrink-0 rounded-md px-2 py-1 text-xs font-bold leading-4 ${c.badgeColor} ${c.badgeBg}`}
                    style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                  >
                    {c.badge}
                  </span>
                )}
                {c.completed && (
                  <span className="font-nunito flex-shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold leading-4 text-slate-400">
                    {c.badge}
                  </span>
                )}
              </div>

              <div className={`flex flex-col gap-1 ${c.completed ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-nunito text-xs font-semibold leading-4 text-slate-500">
                    {c.progressLabel}
                  </span>
                  <span
                    className={`font-nunito text-xs font-semibold leading-4 ${
                      c.progress > 0 ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {c.progress}/{c.total}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500"
                    style={{
                      width: `${(c.progress / c.total) * 100}%`,
                      boxShadow:
                        c.progress > 0
                          ? "0px 0px 10px 0px rgba(16,185,129,0.4)"
                          : "none",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
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
            Resets in 14h 32m
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
