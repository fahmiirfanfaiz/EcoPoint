"use client";
import { useState } from "react";

type Period = "mingguan" | "sepanjang-waktu";
type Trend = "up" | "down" | "neutral";

interface TopPlayer {
  rank: 1 | 2 | 3;
  name: string;
  fakultas: string;
  points: number;
  avatar?: string;
  initials: string;
  avatarBg: string;
}

interface TablePlayer {
  rank: number;
  name: string;
  fakultas: string;
  points: number;
  trend: Trend;
  avatar?: string;
  initials: string;
  avatarBg: string;
}

const topPlayers: TopPlayer[] = [
  {
    rank: 2,
    name: "Mike Ross",
    fakultas: "Fakultas MIPA",
    points: 2100,
    initials: "MR",
    avatarBg: "#f0e6d6",
  },
  {
    rank: 1,
    name: "Sarah Chen",
    fakultas: "Fakultas Teknik",
    points: 2450,
    initials: "SC",
    avatarBg: "#e8e0f8",
  },
  {
    rank: 3,
    name: "Jessica Lee",
    fakultas: "Fakultas Ekonomi Business",
    points: 1950,
    initials: "JL",
    avatarBg: "#e6f0e8",
  },
];

const tablePlayers: TablePlayer[] = [
  { rank: 4, name: "David Kim", fakultas: "Fakultas Teknik", points: 1800, trend: "up", initials: "DK", avatarBg: "#dbeafe" },
  { rank: 5, name: "Emily Davis", fakultas: "Fakultas Geografi", points: 1750, trend: "neutral", initials: "ED", avatarBg: "#fce7f3" },
  { rank: 6, name: "James Wilson", fakultas: "Fakultas Hukum", points: 1600, trend: "down", initials: "JW", avatarBg: "#ede9fe" },
  { rank: 7, name: "Olivia Martinez", fakultas: "Fakultas Kedokteran", points: 1550, trend: "up", initials: "OM", avatarBg: "#dcfce7" },
  { rank: 8, name: "Daniel Taylor", fakultas: "Sekolah Vokasi", points: 1400, trend: "neutral", initials: "DT", avatarBg: "#d1fae5" },
];

const rankColors = {
  1: { border: "#f59e0b", bg: "#fffbeb", badge: "#f59e0b", shadow: "rgba(245,158,11,0.25)" },
  2: { border: "#94a3b8", bg: "#f8fafc", badge: "#94a3b8", shadow: "rgba(148,163,184,0.2)" },
  3: { border: "#f97316", bg: "#fff7ed", badge: "#ea580c", shadow: "rgba(249,115,22,0.2)" },
};

function Avatar({
  initials,
  bg,
  size = 56,
  fontSize = 16,
  src,
}: {
  initials: string;
  bg: string;
  size?: number;
  fontSize?: number;
  src?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 800,
        color: "#475569",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {src ? (
        <img src={src} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  );
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <path d="M8 12V4M4 8l4-4 4 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (trend === "down") return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
      <path d="M8 4v8M4 8l4 4 4-4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return <span style={{ color: "#94a3b8", fontSize: 18, lineHeight: 1 }}>—</span>;
}

// Trophy SVG for #1
function TrophyIcon() {
  return (
    <svg viewBox="0 0 40 32" fill="none" className="w-8 h-7" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 22c-5 0-9-4-9-9V5h18v8c0 5-4 9-9 9z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M11 8H6a4 4 0 0 0 4 4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 8h5a4 4 0 0 1-4 4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="17" y="22" width="6" height="4" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="13" y="26" width="14" height="2.5" rx="1.25" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  );
}

export default function LeaderboardKampus() {
  const [period, setPeriod] = useState<Period>("mingguan");

  // Order: 2nd | 1st | 3rd
  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3];

  return (
    <div
      className="w-full"
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        background: "#f0fdf4",
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      <div className="max-w-[60rem] mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              style={{
                fontSize: "clamp(22px, 5vw, 30px)",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Leaderboard Kampus
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              {period === "mingguan"
                ? "Lihat siapa yang memimpin di minggu ini!"
                : "Lihat siapa yang memimpin sepanjang waktu!"}
            </p>
          </div>

          {/* Period toggle */}
          <div
            className="flex items-center"
            style={{
              background: "white",
              borderRadius: 999,
              padding: "4px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              alignSelf: "flex-start",
            }}
          >
            {(["mingguan", "sepanjang-waktu"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: period === p ? "#22c55e" : "transparent",
                  color: period === p ? "white" : "#64748b",
                  boxShadow: period === p ? "0 2px 8px rgba(34,197,94,0.3)" : "none",
                }}
              >
                {p === "mingguan" ? "Mingguan" : "Sepanjang waktu"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Podium Top 3 ── */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", alignItems: "end" }}
        >
          {podiumOrder.map((rank) => {
            const player = topPlayers.find((p) => p.rank === rank)!;
            const cfg = rankColors[rank];
            const is1st = rank === 1;

            return (
              <div
                key={rank}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0,
                  position: "relative",
                }}
              >
                {/* Trophy for 1st */}
                {is1st && (
                  <div style={{ marginBottom: 4 }}>
                    <TrophyIcon />
                  </div>
                )}

                {/* Avatar with rank badge */}
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <div
                    style={{
                      borderRadius: "50%",
                      border: `3px solid ${cfg.border}`,
                      padding: 3,
                      background: "white",
                      boxShadow: `0 4px 16px ${cfg.shadow}`,
                    }}
                  >
                    <Avatar
                      initials={player.initials}
                      bg={player.avatarBg}
                      size={is1st ? 70 : 56}
                      fontSize={is1st ? 20 : 15}
                    />
                  </div>
                  {/* Rank badge */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: cfg.badge,
                      color: "white",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 7px",
                      border: "2px solid white",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rank}{rank === 1 ? "st" : rank === 2 ? "nd" : "rd"}
                  </div>
                </div>

                {/* Card */}
                <div
                  style={{
                    width: "100%",
                    background: cfg.bg,
                    border: `1.5px solid ${cfg.border}`,
                    borderRadius: 16,
                    padding: is1st ? "16px 12px 14px" : "12px 10px",
                    textAlign: "center",
                    boxShadow: `0 2px 10px ${cfg.shadow}`,
                    position: "relative",
                  }}
                >
                  {/* Sparkle dots for 1st */}
                  {is1st && (
                    <>
                      <div style={{ position: "absolute", top: 10, left: 10, width: 5, height: 5, borderRadius: "50%", background: "#fcd34d", opacity: 0.7 }} />
                      <div style={{ position: "absolute", top: 14, right: 14, width: 4, height: 4, borderRadius: "50%", background: "#fcd34d", opacity: 0.5 }} />
                    </>
                  )}

                  <p
                    style={{
                      fontWeight: 800,
                      color: "#0f172a",
                      fontSize: is1st ? 15 : 13,
                      lineHeight: 1.2,
                      marginBottom: 2,
                    }}
                  >
                    {player.name}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>
                    {player.fakultas}
                  </p>
                  <p
                    style={{
                      fontWeight: 900,
                      color: "#22c55e",
                      fontSize: is1st ? 17 : 14,
                    }}
                  >
                    {player.points.toLocaleString("id-ID")} pts
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 1fr 90px 60px",
              padding: "12px 20px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {["RANK", "STUDENT", "FAKULTAS", "POINTS", "TREND"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textAlign: h === "POINTS" || h === "TREND" ? "right" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {tablePlayers.map((player, i) => (
            <div
              key={player.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 1fr 90px 60px",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom: i < tablePlayers.length - 1 ? "1px solid #f8fafc" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fffe")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Rank */}
              <span style={{ fontWeight: 800, color: "#475569", fontSize: 14 }}>
                {player.rank}
              </span>

              {/* Student */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={player.initials} bg={player.avatarBg} size={34} fontSize={11} />
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                  {player.name}
                </span>
              </div>

              {/* Fakultas */}
              <span style={{ color: "#64748b", fontSize: 13 }}>{player.fakultas}</span>

              {/* Points */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "#f1f5f9",
                    borderRadius: 8,
                    padding: "3px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  {player.points.toLocaleString("id-ID")} pts
                </span>
              </div>

              {/* Trend */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <TrendIcon trend={player.trend} />
              </div>
            </div>
          ))}

          {/* View All link */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#22c55e",
                fontWeight: 700,
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              Lihat Seluruh Leaderboard
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}