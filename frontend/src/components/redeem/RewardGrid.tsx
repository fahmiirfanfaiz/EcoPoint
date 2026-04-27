"use client";
import { useState, useMemo } from "react";

// Dummy available points — ganti kalau mau ubah minimumnya
const USER_AVAILABLE_POINTS = 650;

type Category = "All Rewards" | "Food & Drink" | "Merchandise" | "Donations";
type SortOption = "Recommended" | "Lowest Points" | "Highest Points" | "Newest";
type Tag = "Popular" | "New" | "Limited" | "Hot Deal" | "Eco Pick";

interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  category: Exclude<Category, "All Rewards">;
  tags: Tag[];
  emoji: string;
  bgColor: string;
}

// Dummy card data
const ALL_REWARDS: Reward[] = [
  { id: 1,  name: "Free Coffee Voucher",    description: "Redeem for a medium coffee at any campus cafe.",          points: 300,  category: "Food & Drink",  tags: ["Popular", "Hot Deal"],  emoji: "☕", bgColor: "#18181b" },
  { id: 2,  name: "Bookstore Discount",     description: "Get 15% off textbooks and supplies at the campus store.", points: 300,  category: "Merchandise",   tags: ["Popular"],              emoji: "📚", bgColor: "#2d1b4e" },
  { id: 3,  name: "Sustainable Tote Bag",   description: "Durable, eco-friendly reusable bag for your groceries.", points: 300,  category: "Merchandise",   tags: ["Eco Pick"],             emoji: "👜", bgColor: "#e8f4f8" },
  { id: 4,  name: "Plant a Tree",           description: "A real tree will be planted in your name.",              points: 300,  category: "Donations",     tags: ["Eco Pick", "Popular"],  emoji: "🌱", bgColor: "#052e16" },
  { id: 5,  name: "GrabFood Voucher 15k",   description: "Diskon Rp15.000 untuk order GrabFood kamu.",            points: 450,  category: "Food & Drink",  tags: ["Popular"],              emoji: "🛵", bgColor: "#fef9c3" },
  { id: 6,  name: "Chatime Buy 1 Get 1",    description: "Berlaku semua varian minuman Chatime.",                  points: 500,  category: "Food & Drink",  tags: ["Hot Deal", "Limited"],  emoji: "🧋", bgColor: "#fce7f3" },
  { id: 7,  name: "Notebook Daur Ulang",    description: "Notebook dari kertas daur ulang berkualitas.",           points: 650,  category: "Merchandise",   tags: ["Eco Pick", "New"],      emoji: "📓", bgColor: "#fef9c3" },
  { id: 8,  name: "Tanam 1 Pohon",          description: "Donasi tanam pohon di hutan Kalimantan.",               points: 200,  category: "Donations",     tags: ["Eco Pick", "Popular"],  emoji: "🌳", bgColor: "#064e3b" },
  { id: 9,  name: "Indomaret 20k Voucher",  description: "Belanja kebutuhan sehari-hari di Indomaret.",           points: 700,  category: "Food & Drink",  tags: ["New"],                  emoji: "🛒", bgColor: "#dbeafe" },
  { id: 10, name: "Beasiswa Lingkungan",    description: "Dukung siswa peduli lingkungan Indonesia.",              points: 2000, category: "Donations",     tags: ["New"],                  emoji: "🎓", bgColor: "#1e3a5f" },
  { id: 11, name: "EcoPoint T-Shirt",       description: "Kaos eksklusif EcoPoint edisi terbatas.",               points: 1500, category: "Merchandise",   tags: ["Limited", "New"],       emoji: "👕", bgColor: "#fde8e8" },
  { id: 12, name: "EcoPoint Tumbler",       description: "Tumbler stainless 500ml branded EcoPoint.",             points: 1200, category: "Merchandise",   tags: ["Eco Pick", "Popular"],  emoji: "♻️", bgColor: "#d1fae5" },
  { id: 13, name: "Solar Panel Community",  description: "Dukung energi surya untuk komunitas desa.",             points: 2500, category: "Donations",     tags: ["Eco Pick", "Limited"],  emoji: "☀️", bgColor: "#fef3c7" },
  { id: 14, name: "Smoothie Bowl Voucher",  description: "Healthy bowl di restoran partner EcoPoint.",            points: 800,  category: "Food & Drink",  tags: ["New", "Hot Deal"],      emoji: "🥗", bgColor: "#d1fae5" },
  { id: 15, name: "Bamboo Straw Set",       description: "Set sedotan bambu ramah lingkungan isi 6 pcs.",         points: 400,  category: "Merchandise",   tags: ["Eco Pick"],             emoji: "🎋", bgColor: "#dcfce7" },
  { id: 16, name: "Menanam Mangrove",       description: "1 bibit mangrove untuk pesisir Indonesia.",             points: 150,  category: "Donations",     tags: ["Popular", "Eco Pick"],  emoji: "🌾", bgColor: "#064e3b" },
];

const TAG_COLORS: Record<Tag, { bg: string; color: string }> = {
  "Popular":  { bg: "#dbeafe", color: "#2563eb" },
  "New":      { bg: "#d1fae5", color: "#059669" },
  "Limited":  { bg: "#fee2e2", color: "#dc2626" },
  "Hot Deal": { bg: "#fef3c7", color: "#d97706" },
  "Eco Pick": { bg: "#ede9fe", color: "#7c3aed" },
};

const ITEMS_PER_PAGE = 8;
const categories: Category[] = ["All Rewards", "Food & Drink", "Merchandise", "Donations"];
const sortOptions: SortOption[] = ["Recommended", "Lowest Points", "Highest Points", "Newest"];

// Tag Pill
function TagPill({ tag }: { tag: Tag }) {
  const { bg, color } = TAG_COLORS[tag];
  return (
    <span style={{
      display: "inline-block", background: bg, color,
      fontSize: 9, fontWeight: 800, borderRadius: 999,
      padding: "2px 7px", letterSpacing: "0.02em", lineHeight: 1.6, whiteSpace: "nowrap",
    }}>
      {tag}
    </span>
  );
}

// Padlock Icon
function PadlockIcon() {
  return (
    <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 44, height: 44 }}>
      {/* shackle */}
      <rect x="12" y="22" width="24" height="22" rx="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <path
        d="M16 22V16a8 8 0 1 1 16 0v6"
        stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
        fill="none"
      />
      {/* keyhole circle */}
      <circle cx="24" cy="33" r="4" fill="#94a3b8" />
      {/* keyhole slot */}
      <rect x="22.5" y="33" width="3" height="5" rx="1.5" fill="#94a3b8" />
    </svg>
  );
}

// Reward Card
function RewardCard({
  reward,
  userPoints,
}: {
  reward: Reward;
  userPoints: number;
}) {
  const isLocked = userPoints < reward.points;
  const [redeemed, setRedeemed] = useState(false);
  const [hovered, setHovered]   = useState(false);

  // LOCKED card 
  if (isLocked) {
    return (
      <div style={{
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1.5px solid #e2e8f0",
        background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e9eef5 100%)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "not-allowed",
        userSelect: "none",
      }}>
        {/* Greyed image area */}
        <div style={{
          flex: "0 0 56%",
          background: "linear-gradient(160deg, #e2e8f0 0%, #cbd5e1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: 0,
        }}>
          <PadlockIcon />

          {/* Points badge — muted */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "#94a3b8",
            color: "white",
            borderRadius: 999,
            display: "flex", alignItems: "center", gap: 4,
            padding: "5px 11px", fontSize: 12, fontWeight: 800,
            lineHeight: 1,
          }}>
            <svg viewBox="0 0 10 13" fill="none" style={{ width: 9, height: 11 }}>
              <path d="M6 1L1 7.5h4.5L3 12 10 5H5.5L8 1H6z" fill="white" />
            </svg>
            {reward.points.toLocaleString("id-ID")} pts
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "13px 14px 14px", gap: 5, minHeight: 0,
        }}>
          {/* Blurred placeholder name */}
          <p style={{
            fontWeight: 800, fontSize: 14, color: "#94a3b8",
            margin: 0, lineHeight: 1.3,
            filter: "blur(4px)", userSelect: "none",
            pointerEvents: "none",
          }}>
            {reward.name}
          </p>

          {/* Blurred placeholder description */}
          <p style={{
            fontSize: 11, color: "#cbd5e1", margin: 0,
            lineHeight: 1.5, flex: 1,
            filter: "blur(3px)", userSelect: "none",
            pointerEvents: "none",
          }}>
            {reward.description}
          </p>

          {/* Unlock hint */}
          <div style={{
            marginTop: 10,
            width: "100%",
            background: "#f1f5f9",
            border: "1.5px solid #e2e8f0",
            borderRadius: 14,
            padding: "10px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
              <rect x="3" y="7" width="10" height="8" rx="2" fill="#94a3b8" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>
              Need {(reward.points - userPoints).toLocaleString("id-ID")} more pts
            </span>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED card 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.13)" : "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        height: "100%",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        cursor: "pointer",
        minHeight: 0,
      }}
    >
      {/* Emoji banner */}
      <div style={{
        flex: "0 0 56%",
        background: reward.bgColor,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        overflow: "hidden",
      }}>
        <span style={{ fontSize: 52, lineHeight: 1, userSelect: "none" }}>
          {reward.emoji}
        </span>

        {/* Points badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          color: "white", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 11px", fontSize: 12, fontWeight: 800,
          boxShadow: "0 2px 8px rgba(22,163,74,0.40)", lineHeight: 1,
        }}>
          <svg viewBox="0 0 10 13" fill="none" style={{ width: 9, height: 11 }}>
            <path d="M6 1L1 7.5h4.5L3 12 10 5H5.5L8 1H6z" fill="white" />
          </svg>
          {reward.points.toLocaleString("id-ID")} pts
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "13px 14px 14px", gap: 5, minHeight: 0,
      }}>
        {reward.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {reward.tags.map((t) => <TagPill key={t} tag={t} />)}
          </div>
        )}

        <p style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
          {reward.name}
        </p>

        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.5, flex: 1 }}>
          {reward.description}
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); setRedeemed((v) => !v); }}
          style={{
            marginTop: 10, width: "100%",
            background: redeemed ? "white" : "#10B981",
            color: redeemed ? "#16a34a" : "white",
            border: redeemed ? "2px solid #86efac" : "2px solid transparent",
            borderRadius: 24, padding: "11px 0",
            fontSize: 13, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "0.01em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "all 0.18s ease",
            boxShadow: redeemed ? "none" : "0 4px 0 0 #059669;)",
            flexShrink: 0,
          }}
        >
          {redeemed ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Redeemed
            </>
          ) : (
            <>
              Redeem
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Pagination 
function PaginationBar({ current, total, onChange }: {
  current: number; total: number; onChange: (p: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: "1.5px solid #e2e8f0", background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: current === 1 ? "not-allowed" : "pointer",
          opacity: current === 1 ? 0.4 : 1, transition: "all 0.15s",
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
          <path d="M10 4L6 8l4 4" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: p === current ? "none" : "1.5px solid #e2e8f0",
            background: p === current ? "linear-gradient(135deg,#22c55e,#16a34a)" : "white",
            color: p === current ? "white" : "#475569",
            fontWeight: p === current ? 800 : 600, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            boxShadow: p === current ? "0 2px 8px rgba(34,197,94,0.3)" : "none",
          }}
        >
          {p}
        </button>
      ))}

      <button onClick={() => onChange(current + 1)} disabled={current === total}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: "1.5px solid #e2e8f0", background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: current === total ? "not-allowed" : "pointer",
          opacity: current === total ? 0.4 : 1, transition: "all 0.15s",
        }}
      >
        <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
          <path d="M6 4l4 4-4 4" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function RewardsGrid() {
  // Dummy available points — replace with real user data
  const [userPoints] = useState(USER_AVAILABLE_POINTS);

  const [category, setCategory] = useState<Category>("All Rewards");
  const [sort, setSort]         = useState<SortOption>("Recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage]         = useState(1);

  const filtered = useMemo(() => {
    let list = category === "All Rewards"
      ? ALL_REWARDS
      : ALL_REWARDS.filter((r) => r.category === category);
    
    // Apply sort based on filter
    if (sort === "Lowest Points")  list = [...list].sort((a, b) => a.points - b.points);
    if (sort === "Highest Points") list = [...list].sort((a, b) => b.points - a.points);
    if (sort === "Newest")         list = [...list].sort((a, b) => b.id - a.id);
    
    // misahin yang lock dan unlock, priority unlock
    list = [...list].sort((a, b) => {
      const aLocked = userPoints < a.points;
      const bLocked = userPoints < b.points;
      if (aLocked === bLocked) return 0; // maintain previous sort order
      return aLocked ? 1 : -1; // unlocked (false) comes first
    });
    
    return list;
  }, [category, sort, userPoints]);

  const totalPages     = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated      = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const showPagination = filtered.length > ITEMS_PER_PAGE;

  const rowCount         = Math.ceil(paginated.length / 4);
  const gridTemplateRows = [388, 400, 400, 400]
    .slice(0, rowCount)
    .map((h) => `${h}px`)
    .join(" ");

  return (
    <div className="font-nunito w-full">
      {/* ── User points indicator ── */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#f0fdf4", border: "1.5px solid #86efac",
        borderRadius: 999, padding: "6px 14px", marginBottom: 20,
      }}>
        <svg viewBox="0 0 10 13" fill="none" style={{ width: 9, height: 11 }}>
          <path d="M6 1L1 7.5h4.5L3 12 10 5H5.5L8 1H6z" fill="#16a34a" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#15803d" }}>
          Your Balance: {userPoints.toLocaleString("id-ID")} pts
        </span>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
        padding: "0", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => {
            const isActive = category === cat;
            return (
              <button key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={{
                  padding: "8px 18px", borderRadius: 999, fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  border: isActive ? "none" : "1.5px solid #e2e8f0",
                  background: isActive ? "#0f172a" : "white",
                  color: isActive ? "white" : "#64748b",
                  cursor: "pointer", transition: "all 0.18s", lineHeight: 1,
                  whiteSpace: "nowrap", fontFamily: "inherit",
                  boxShadow: isActive ? "0 2px 8px rgba(15,23,42,0.18)" : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setSortOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 13, color: "#64748b", fontFamily: "inherit", padding: "8px 4px",
            }}
          >
            <span style={{ fontWeight: 500 }}>Sort by:</span>
            <span style={{ fontWeight: 800, color: "#0f172a" }}>{sort}</span>
            <svg viewBox="0 0 16 16" fill="none" style={{
              width: 14, height: 14, transition: "transform 0.2s",
              transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}>
              <path d="M4 6l4 4 4-4" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {sortOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                background: "white", border: "1px solid #e2e8f0", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 170, zIndex: 50, overflow: "hidden",
              }}>
                {sortOptions.map((s) => (
                  <button key={s}
                    onClick={() => { setSortOpen(false); setSort(s); setPage(1); }}
                    style={{
                      display: "block", width: "100%", padding: "10px 16px",
                      textAlign: "left", border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: s === sort ? 800 : 500,
                      color: s === sort ? "#16a34a" : "#334155",
                      background: s === sort ? "#f0fdf4" : "transparent",
                      fontFamily: "inherit",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gridTemplateRows,
          rowGap: 24,
          columnGap: 24,
          alignSelf: "stretch",
        }}>
          {paginated.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={userPoints} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>Tidak ada reward ditemukan</p>
        </div>
      )}

      {/* ── Pagination — 2rem gap ── */}
      {showPagination && (
        <div style={{ marginTop: "2rem" }}>
          <PaginationBar
            current={page}
            total={totalPages}
            onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </div>
      )}
    </div>
  );
}