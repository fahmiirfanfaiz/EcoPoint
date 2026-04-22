interface RewardsStoreBannerProps {
  balance?: number;
}

export default function RewardsStoreBanner({ balance = 1250 }: RewardsStoreBannerProps) {
  return (
    <div
      className="max-w-[60rem] mx-auto w-full"
      style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
    >
      <div
        className="relative flex items-center justify-between gap-4 rounded-2xl px-8 py-7 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #34d399 0%, #10b981 40%, #059669 100%)",
          boxShadow: "0 8px 32px rgba(16,185,129,0.35)",
          minHeight: 110,
        }}
      >
        {/* Subtle radial highlight top-left */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
        {/* Subtle radial highlight bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: 180,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

        {/* ── Left: Title + subtitle ── */}
        <div className="flex flex-col gap-1 z-10">
          <h2
            style={{
              fontSize: "clamp(20px, 4vw, 26px)",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Rewards Store
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Redeem your hard-earned points for exclusive campus perks.
          </p>
        </div>

        {/* ── Right: Balance card ── */}
        <div
          className="flex flex-col items-center justify-center flex-shrink-0 z-10"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 14,
            padding: "12px 20px",
            minWidth: 150,
            textAlign: "center",
          }}
        >
          {/* Label */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Current Balance
          </span>

          {/* Icon + Amount */}
          <div className="flex items-center gap-1.5">
            {/* Piggy bank / coin icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 22, height: 22, flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" fill="#fbbf24" />
              <circle cx="12" cy="12" r="7" fill="#fcd34d" />
              {/* leaf/eco mark */}
              <path
                d="M10 14c1-2 3-3.5 4-2s-1 3.5-4 2z"
                fill="#16a34a"
                stroke="#15803d"
                strokeWidth="0.5"
              />
              <path d="M12 15v-4" stroke="#15803d" strokeWidth="1" strokeLinecap="round" />
            </svg>

            <span
              style={{
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {balance.toLocaleString("id-ID")}
            </span>
          </div>

          {/* EcoPoints chip */}
          <div
            style={{
              marginTop: 6,
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.04em",
            }}
          >
            EcoPoints
          </div>
        </div>
      </div>
    </div>
  );
}