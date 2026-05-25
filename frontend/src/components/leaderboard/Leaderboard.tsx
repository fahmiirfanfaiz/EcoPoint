"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import { getAvatarUrl } from "@/components/dashboard/EditProfileModal";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "mingguan" | "sepanjang-waktu";

interface LeaderboardUser {
  rank: number;
  user_id: string;
  nama: string;
  nim: string;
  fakultas: string;
  total_poin: number;
  profile_pic: number;
  badges_count: number;
  reports_count: number;
}

const rankColors: Record<number, { border: string; bg: string; badge: string; shadow: string }> = {
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
        <img src={src} alt={initials} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
      ) : (
        initials
      )}
    </div>
  );
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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard?period=${period}`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboardData(data.leaderboard);

        // Try to track daily challenge action
        const bearer = getBearerToken();
        if (bearer) {
          fetch(`${API_BASE_URL}/daily-challenges/track-action`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: bearer
            },
            body: JSON.stringify({ action: "view_leaderboard" })
          }).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  // Order: 2nd | 1st | 3rd
  const podiumOrder = [2, 1, 3];
  const topPlayers = leaderboardData.filter((p) => p.rank <= 3);
  const tablePlayers = leaderboardData.filter((p) => p.rank > 3);

  return (
    <div className="font-nunito flex w-full flex-col gap-6">

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

        {loading ? (
          <div className="flex flex-col gap-8 w-full">
            {/* Podium Skeleton */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end mt-4">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full" />
                <Skeleton className="h-24 sm:h-28 w-full rounded-2xl" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />
                <Skeleton className="h-28 sm:h-32 w-full rounded-2xl" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full" />
                <Skeleton className="h-24 sm:h-28 w-full rounded-2xl" />
              </div>
            </div>
            
            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_75px] sm:grid-cols-[48px_1fr_1fr_90px] p-3 border-b border-slate-100">
                <Skeleton className="h-4 w-6 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="hidden sm:block h-4 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded justify-self-end" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-[40px_1fr_75px] sm:grid-cols-[48px_1fr_1fr_90px] p-3 sm:p-4 items-center border-b border-slate-50 last:border-0">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-5 w-24 sm:w-32 rounded" />
                  </div>
                  <Skeleton className="hidden sm:block h-5 w-24 rounded" />
                  <Skeleton className="h-6 w-16 rounded justify-self-end" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Podium Top 3 ── */}
            {topPlayers.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
                {podiumOrder.map((rank) => {
                  const player = topPlayers.find((p) => p.rank === rank);
                  if (!player) return <div key={rank} />; // Empty slot if < 3 players

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
                            initials=""
                            bg="#f8fafc"
                            size={is1st ? 70 : 56}
                            fontSize={is1st ? 20 : 15}
                            src={getAvatarUrl({ nama: player.nama } as any, player.profile_pic)}
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
                        className="w-full relative text-center rounded-2xl sm:rounded-2xl"
                        style={{
                          background: cfg.bg,
                          border: `1.5px solid ${cfg.border}`,
                          padding: is1st ? "16px 8px 14px" : "12px 6px",
                          boxShadow: `0 2px 10px ${cfg.shadow}`,
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={player.nama}
                        >
                          {player.nama}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={player.fakultas}>
                          {player.fakultas}
                        </p>
                        <p
                          style={{
                            fontWeight: 900,
                            color: "#22c55e",
                            fontSize: is1st ? 17 : 14,
                          }}
                        >
                          {player.total_poin.toLocaleString("id-ID")} pts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Table ── */}
            {tablePlayers.length > 0 && (
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
                <div className="grid grid-cols-[40px_1fr_75px] sm:grid-cols-[48px_1fr_1fr_90px] px-3 sm:px-5 py-3 border-b border-slate-100">
                  {["RANK", "STUDENT", "FAKULTAS", "POINTS"].map((h) => (
                    <span
                      key={h}
                      className={`text-[10px] font-extrabold text-slate-400 tracking-wider ${h === "POINTS" ? "text-right" : "text-left"} ${h === "FAKULTAS" ? "hidden sm:block" : ""}`}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {tablePlayers.map((player, i) => (
                  <div
                    key={player.rank}
                    className="grid grid-cols-[40px_1fr_75px] sm:grid-cols-[48px_1fr_1fr_90px] px-3 sm:px-5 py-3 sm:py-3.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* Rank */}
                    <span className="font-extrabold text-slate-600 text-sm">
                      {player.rank}
                    </span>

                    {/* Student */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                      <Avatar initials="" bg="#f8fafc" size={34} fontSize={11} src={getAvatarUrl({ nama: player.nama } as any, player.profile_pic)} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={player.nama}>
                          {player.nama}
                        </span>
                        <span className="text-slate-500 text-[11px] sm:hidden whitespace-nowrap overflow-hidden text-ellipsis" title={player.fakultas}>
                          {player.fakultas}
                        </span>
                      </div>
                    </div>

                    {/* Fakultas (Desktop only) */}
                    <span className="hidden sm:block text-slate-500 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis pr-2" title={player.fakultas}>
                      {player.fakultas}
                    </span>

                    {/* Points */}
                    <div className="text-right">
                      <span className="inline-block bg-slate-100 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-[13px] font-bold text-slate-700 whitespace-nowrap">
                        {player.total_poin.toLocaleString("id-ID")} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

    </div>
  );
}