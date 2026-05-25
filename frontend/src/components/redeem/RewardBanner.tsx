"use client";

import { useEffect, useState } from "react";
import { getStoredAuth } from "@/lib/auth";

interface RewardsStoreBannerProps {
  balance?: number;
}

export default function RewardsStoreBanner({
  balance,
}: RewardsStoreBannerProps) {
  const [currentBalance, setCurrentBalance] = useState<number>(
    typeof balance === "number" ? balance : 0,
  );

  useEffect(() => {
    const syncBalance = () => {
      const storedBalance = getStoredAuth()?.user.total_poin ?? 0;
      setCurrentBalance(typeof balance === "number" ? balance : storedBalance);
    };

    syncBalance();
    window.addEventListener("ecopoint-auth-changed", syncBalance);
    return () =>
      window.removeEventListener("ecopoint-auth-changed", syncBalance);
  }, [balance]);

  return (
    <div className="font-nunito w-full">
      <div
        className="relative flex items-center justify-between gap-4 rounded-2xl px-8 py-7 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #34d399 0%, #10b981 40%, #059669 100%)",
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
            Tukar Poin
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Tukarkan poin EcoPoint-mu dengan reward eksklusif di kampus.
          </p>
        </div>

        {/* ── Right: Balance card ── */}
        <div
          className="flex shrink-0 flex-col items-center justify-center z-10"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 14,
            padding: "14px 24px",
            minWidth: 200,
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
            Saldo Kamu
          </span>

          {/* Icon + Amount */}
          <div className="flex items-center gap-1.5">
            {/* Coin icon (consistent with Navbar & StatsCards) */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 25 24"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z"
                fill="#fbbf24"
              />
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
              {currentBalance.toLocaleString("id-ID")}
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
