import React from "react";
import { Bell, Clock } from "lucide-react";

interface UpdateItem {
  notifications_id: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

interface RecentUpdatesProps {
  updates?: UpdateItem[];
  className?: string;
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
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getNotifStyle(pesan: string) {
  const lower = pesan.toLowerCase();
  if (lower.includes("badge") || lower.includes("lencana") || lower.includes("penghargaan"))
    return { bg: "bg-amber-100", color: "text-amber-600" };
  if (lower.includes("verif") || lower.includes("diterima") || lower.includes("berhasil"))
    return { bg: "bg-emerald-100", color: "text-emerald-600" };
  if (lower.includes("ditolak") || lower.includes("gagal") || lower.includes("error"))
    return { bg: "bg-red-100", color: "text-red-600" };
  return { bg: "bg-blue-100", color: "text-blue-600" };
}

const RecentUpdates: React.FC<RecentUpdatesProps> = ({ updates = [], className = "" }) => (
  <div
    className={`rounded-[32px] bg-white p-6 flex flex-col ${className}`}
    style={{
      outline: "1px #ECFDF5 solid",
      outlineOffset: "-1px",
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
    }}
  >
    {/* Header */}
    <div className="mb-6 flex items-center gap-2 text-red-400">
      <Bell size={20} />
      <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Recent Updates</span>
    </div>

    {/* Items */}
    {updates.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-8 flex-1">
        <span className="text-4xl">🔔</span>
        <p className="font-quicksand text-sm font-semibold text-gray-400">Belum ada notifikasi</p>
        <p className="font-outfit text-xs text-gray-400">Notifikasi terbaru akan muncul di sini.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {updates.map((item) => {
          const style = getNotifStyle(item.pesan);
          return (
            <div key={item.notifications_id} className={`flex gap-3 rounded-3xl p-3 transition-colors hover:bg-gray-50 ${!item.is_read ? "bg-emerald-50/30" : ""}`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${style.bg} ${style.color}`}>
                <Bell size={18} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={`font-outfit text-sm leading-5 ${!item.is_read ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                  {item.pesan}
                </span>
                <span className="font-outfit mt-0.5 flex items-center gap-1 text-[10px] leading-[15px] text-gray-400">
                  <Clock size={10} /> {timeAgo(item.created_at)}
                </span>
              </div>
              {!item.is_read && (
                <div className="flex-shrink-0 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default RecentUpdates;
