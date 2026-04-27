interface HistoryItem {
  id: string;
  type: "accepted" | "pending" | "badge";
  title: string;
  subtitle: string;
  time: string;
}

const defaultItems: HistoryItem[] = [
  {
    id: "1",
    type: "accepted",
    title: "Laporan Diterima",
    subtitle: "+50 Poin",
    time: "2 jam yang lalu",
  },
  {
    id: "2",
    type: "pending",
    title: "Sedang Diverifikasi",
    subtitle: "Menunggu admin",
    time: "5 jam yang lalu",
  },
  {
    id: "3",
    type: "badge",
    title: "Badge Baru!",
    subtitle: '"Pahlawan Plastik"',
    time: "1 hari yang lalu",
  },
];

const typeConfig = {
  accepted: {
    iconBg: "bg-green-100",
    iconBorder: "border-green-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path
          d="M7.5 12.5l3 3 6-6"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  pending: {
    iconBg: "bg-yellow-100",
    iconBorder: "border-yellow-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#fbbf24" />
        {/* Hourglass */}
        <path
          d="M9 6h6l-3 6 3 6H9l3-6-3-6z"
          fill="white"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  badge: {
    iconBg: "bg-purple-100",
    iconBorder: "border-purple-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#a855f7" />
        {/* Ribbon / medal */}
        <path
          d="M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
          fill="white"
        />
        <path
          d="M9.5 13.5L8 17l4-1.5L16 17l-1.5-3.5"
          fill="white"
        />
      </svg>
    ),
  },
};

interface RecentHistoryProps {
  items?: HistoryItem[];
}

export default function RecentHistory({ items = defaultItems }: RecentHistoryProps) {
  return (
    <div
      className="w-full max-w-[60rem] items-center justify-between mx-auto"
      style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
    >
      {/* Dashed rainbow border */}
      <div>
        <div className="bg-white rounded-2xl overflow-hidden" style={{ borderRadius: "17px" }}>
          {/* ── Header ── */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center gap-2">
              {/* Clock icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-gray-400"
                stroke="currentColor"
                strokeWidth={2}
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
              <h2 className="font-extrabold text-gray-800 text-base">Riwayat Terbaru</h2>
            </div>
          </div>

          {/* ── Cards row ── */}
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {items.map((item) => {
              const cfg = typeConfig[item.type];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors duration-150 cursor-default"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.iconBg} ${cfg.iconBorder}`}
                  >
                    {cfg.icon}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="font-extrabold text-gray-800 text-sm truncate">
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {item.subtitle}
                      {item.subtitle && item.time && (
                        <span className="text-gray-400"> • {item.time}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}