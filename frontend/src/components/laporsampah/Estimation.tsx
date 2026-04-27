interface ReportActionBarProps {
  points?: number;
  categoryAuto?: boolean;
  onSubmit?: () => void;
}

export default function ReportActionBar({
  points = 50,
  onSubmit,
}: ReportActionBarProps) {
  return (
    <div
      className="w-full max-w-[60rem] items-center justify-between mx-auto"
      style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
    >
      {/* Dashed rainbow border wrapper */}
      <div>
        <div
          className="bg-white rounded-2xl"
          style={{ borderRadius: "17px" }}
        >
          {/* Inner bar */}
          <div
            className="flex items-center gap-3 px-4 lg:px-4 py-3"
            style={{ minHeight: "64px" }}
          >
            {/* ── LEFT: Estimated Reward ── */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Coin icon */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                  border: "2px solid #6ee7b7",
                }}
              >
                {/* Recycle / leaf icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 19L12 4l5 15"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 13h5"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="4" r="1.5" fill="#059669" />
                </svg>
              </div>

              {/* Label + Points */}
              <div className="flex flex-col leading-tight">
                <span
                  className="text-gray-400 font-semibold uppercase tracking-widest"
                  style={{ fontSize: "9px" }}
                >
                  Estimated Reward
                </span>
                <span
                  className="font-extrabold text-gray-800"
                  style={{ fontSize: "15px" }}
                >
                  +{points} Points
                </span>
              </div>
            </div>

            {/* ── RIGHT: Submit Button ── */}
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 flex-shrink-0 font-extrabold text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95 ml-auto"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                padding: "10px 20px",
                fontSize: "14px",
                letterSpacing: "0.01em",
              }}
            >
              Kirim Laporan
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}