import React from "react";

interface WeeklyDay {
  day: string;
  count: number;
}

interface WeeklyActivityProps {
  data?: WeeklyDay[];
}

const WeeklyActivity: React.FC<WeeklyActivityProps> = ({ data }) => {
  const barData = data && data.length > 0
    ? data
    : [
        { day: "Mon", count: 0 },
        { day: "Tue", count: 0 },
        { day: "Wed", count: 0 },
        { day: "Thu", count: 0 },
        { day: "Fri", count: 0 },
        { day: "Sat", count: 0 },
        { day: "Sun", count: 0 },
      ];

  const maxVal = Math.max(...barData.map((d) => d.count), 1);
  const totalReports = barData.reduce((s, w) => s + w.count, 0);
  const maxH = 200;

  return (
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="8" width="3" height="7" rx="1" fill="#10B981" />
            <rect x="6" y="5" width="3" height="10" rx="1" fill="#10B981" />
            <rect x="11" y="2" width="3" height="13" rx="1" fill="#10B981" />
          </svg>
          <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Weekly Recycling Activity</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1">
          <span className="font-outfit text-xs leading-4 text-emerald-800">{totalReports} laporan</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 px-2" style={{ height: `${maxH + 40}px` }}>
        {barData.map((b) => {
          const barH = maxVal > 0 ? (b.count / maxVal) * maxH : 0;
          return (
            <div key={b.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full max-w-[40px]" style={{ height: `${maxH}px` }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-xl transition-all duration-500"
                  style={{
                    height: `${barH}px`,
                    background: b.count >= maxVal * 0.8
                      ? "linear-gradient(180deg, #10B981 0%, #34D399 100%)"
                      : "linear-gradient(180deg, #6EE7B7 0%, #A7F3D0 100%)",
                  }}
                />
                {b.count > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-quicksand text-[10px] font-bold text-emerald-600">
                    {b.count}
                  </span>
                )}
              </div>
              <span className="font-quicksand text-xs font-bold leading-4 text-gray-400">{b.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyActivity;