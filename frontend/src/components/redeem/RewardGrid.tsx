"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
} from "lucide-react";
import {
  API_BASE_URL,
  getBearerToken,
  getStoredAuth,
  updateStoredPoints,
} from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortOption =
  | "Rekomendasi"
  | "Poin Terendah"
  | "Poin Tertinggi"
  | "Stok Terbanyak";
type FilterOption = "Semua" | "Bisa Ditukar" | "Stok Habis" | "Nonaktif";

interface Reward {
  reward_id: string;
  nama_reward: string;
  deskripsi: string;
  poin_dibutuhkan: number;
  stok: number;
  is_active: boolean;
}

const SORT_OPTIONS: SortOption[] = [
  "Rekomendasi",
  "Poin Terendah",
  "Poin Tertinggi",
  "Stok Terbanyak",
];
const FILTER_OPTIONS: FilterOption[] = [
  "Semua",
  "Bisa Ditukar",
  "Stok Habis",
  "Nonaktif",
];

const formatPoints = (value: number) => value.toLocaleString("id-ID");

const badgeClass = (active: boolean, affordable: boolean, stock: number) => {
  if (!active) return "bg-slate-100 text-slate-600 border-slate-200";
  if (stock <= 0) return "bg-rose-50 text-rose-700 border-rose-200";
  if (affordable) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

function RewardCard({
  reward,
  userPoints,
  onRedeem,
  redeeming,
}: {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
  redeeming: boolean;
}) {
  const affordable = userPoints >= reward.poin_dibutuhkan;
  const canRedeem = reward.is_active && reward.stok > 0 && affordable;
  const buttonLabel = redeeming
    ? "Menukar..."
    : !reward.is_active
      ? "Nonaktif"
      : reward.stok <= 0
        ? "Stok Habis"
        : affordable
          ? "Tukar Poin"
          : "Poin Kurang";

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
      <div className="relative min-h-40 overflow-hidden bg-linear-to-br from-emerald-500 via-emerald-500 to-teal-600 p-5 text-white">
        <div className="absolute inset-0 opacity-35">
          <div className="absolute -left-8 -top-12 h-40 w-40 rounded-full bg-white/20" />
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10 flex h-full items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Reward
            </p>
            <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">
              {reward.nama_reward}
            </h3>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
              Points
            </p>
            <p className="mt-1 text-2xl font-black leading-none">
              {formatPoints(reward.poin_dibutuhkan)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span
            className={`rounded-full border px-3 py-1 ${badgeClass(reward.is_active, affordable, reward.stok)}`}
          >
            {reward.is_active
              ? reward.stok > 0
                ? affordable
                  ? "Bisa ditukar"
                  : "Butuh poin lebih"
                : "Stok habis"
              : "Nonaktif"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
            {reward.stok > 0 ? `${reward.stok} tersedia` : "Stok habis"}
          </span>
        </div>

        <p className="min-h-12 text-sm leading-6 text-slate-600">
          {reward.deskripsi}
        </p>

        <div className="mt-auto rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Star size={14} className="text-emerald-600" />
              Saldo kamu
            </span>
            <span className="font-black text-slate-900">
              {formatPoints(userPoints)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Butuh {formatPoints(reward.poin_dibutuhkan)} poin</span>
            <span>
              {formatPoints(Math.max(0, reward.poin_dibutuhkan - userPoints))}{" "}
              sisa
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={redeeming || !canRedeem}
          onClick={() => onRedeem(reward)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition-all duration-200 hover:bg-emerald-600 hover:shadow-[0_12px_28px_rgba(16,185,129,0.36)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-300 disabled:hover:shadow-none"
        >
          {redeeming ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menukar...
            </>
          ) : (
            <>
              <Gift size={16} />
              {buttonLabel}
            </>
          )}
        </button>

        {reward.is_active && reward.stok > 0 && !affordable && !redeeming ? (
          <p className="-mt-1 text-center text-xs font-semibold text-amber-600">
            Butuh {formatPoints(reward.poin_dibutuhkan - userPoints)} poin lagi
            untuk menukar.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function RewardsGrid() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("Semua");
  const [sort, setSort] = useState<SortOption>("Rekomendasi");
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const loadRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rewards`);
      const payload = (await response.json().catch(() => null)) as {
        rewards?: Reward[];
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal memuat reward");
      }

      setRewards(payload?.rewards ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat reward");
    } finally {
      setLoading(false);
    }
  };

  const syncCurrentPoints = async () => {
    const auth = getStoredAuth();
    const token = getBearerToken();

    if (!auth?.user?.user_id || !token) {
      setUserPoints(auth?.user?.total_poin ?? 0);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: token },
      });

      if (!response.ok) {
        const cached = getStoredAuth()?.user?.total_poin;
        if (typeof cached === "number") {
          setUserPoints(cached);
        }
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        user?: { total_poin?: number };
      } | null;

      const latestPoints = payload?.user?.total_poin;
      if (typeof latestPoints === "number" && Number.isFinite(latestPoints)) {
        setUserPoints(latestPoints);
        updateStoredPoints(latestPoints);
      }
    } catch {
      const fallback = getStoredAuth()?.user?.total_poin;
      if (typeof fallback === "number") {
        setUserPoints(fallback);
      }
    }
  };

  useEffect(() => {
    setIsHydrated(true);

    const cached = getStoredAuth()?.user?.total_poin;
    if (typeof cached === "number") setUserPoints(cached);

    void loadRewards();
    void syncCurrentPoints();

    const syncAuth = () => void syncCurrentPoints();
    window.addEventListener("ecopoint-auth-changed", syncAuth);
    return () => window.removeEventListener("ecopoint-auth-changed", syncAuth);
  }, []);

  const filteredRewards = useMemo(() => {
    let items = rewards.filter((reward) => {
      if (filter === "Bisa Ditukar")
        return (
          reward.is_active &&
          reward.stok > 0 &&
          userPoints >= reward.poin_dibutuhkan
        );
      if (filter === "Stok Habis") return reward.stok <= 0;
      if (filter === "Nonaktif") return !reward.is_active;
      return true;
    });

    if (sort === "Poin Terendah") {
      items = [...items].sort((a, b) => a.poin_dibutuhkan - b.poin_dibutuhkan);
    } else if (sort === "Poin Tertinggi") {
      items = [...items].sort((a, b) => b.poin_dibutuhkan - a.poin_dibutuhkan);
    } else if (sort === "Stok Terbanyak") {
      items = [...items].sort((a, b) => b.stok - a.stok);
    } else {
      items = [...items].sort((a, b) => {
        const aAffordable =
          a.is_active && a.stok > 0 && userPoints >= a.poin_dibutuhkan;
        const bAffordable =
          b.is_active && b.stok > 0 && userPoints >= b.poin_dibutuhkan;
        if (aAffordable !== bAffordable) return aAffordable ? -1 : 1;
        if (a.poin_dibutuhkan !== b.poin_dibutuhkan)
          return a.poin_dibutuhkan - b.poin_dibutuhkan;
        return b.stok - a.stok;
      });
    }

    return items;
  }, [filter, rewards, sort, userPoints]);

  const redeemableCount = rewards.filter(
    (reward) =>
      reward.is_active &&
      reward.stok > 0 &&
      userPoints >= reward.poin_dibutuhkan,
  ).length;

  const requestRedeem = (reward: Reward) => {
    const auth = getStoredAuth();
    const token = getBearerToken();

    if (!auth?.user?.user_id || !token) {
      setMessage({
        type: "err",
        text: "Silakan login ulang untuk menukar reward.",
      });
      return;
    }

    if (userPoints < reward.poin_dibutuhkan) {
      setMessage({
        type: "err",
        text: "Poin kamu belum cukup untuk reward ini.",
      });
      return;
    }

    setPendingReward(reward);
    setMessage(null);
  };

  const executeRedeem = async (reward: Reward) => {
    const token = getBearerToken();

    if (!token) {
      setMessage({
        type: "err",
        text: "Silakan login ulang untuk menukar reward.",
      });
      return;
    }

    setRedeemingId(reward.reward_id);
    setMessage(null);
    setPendingReward(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/redeem`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reward_id: reward.reward_id }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        data?: { sisa_poin?: number };
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menukar reward");
      }

      const newPoints =
        payload?.data?.sisa_poin ??
        Math.max(0, userPoints - reward.poin_dibutuhkan);
      setUserPoints(newPoints);
      updateStoredPoints(newPoints);
      setMessage({
        type: "ok",
        text: `Reward ${reward.nama_reward} berhasil ditukar.`,
      });
      await loadRewards();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menukar reward",
      });
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div id="reward-catalog" className="font-nunito w-full space-y-6">
      <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            <Sparkles size={12} />
            Reward Redemption
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Tukar poin dengan benefit kampus yang nyata.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Reward akan otomatis berkurang stoknya saat ditukar, dan saldo poin
            kamu akan turun secara atomik melalui backend.
          </p>
    
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-[22px] bg-slate-50 p-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Saldo kamu
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {formatPoints(userPoints)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Reward aktif
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {rewards.filter((reward) => reward.is_active).length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Bisa ditukar
            </p>
            <p className="mt-2 text-2xl font-black text-emerald-600">
              {redeemableCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Filter aktif
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">{filter}</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                filter === option
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-500">Sort:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSort(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                sort === option
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {!isHydrated || loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <div className="flex items-center gap-3 font-bold">
            <ShieldAlert size={18} />
            {error}
          </div>
          <button
            onClick={() => void loadRewards()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
          >
            Coba lagi
          </button>
        </div>
      ) : filteredRewards.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.reward_id}
              reward={reward}
              userPoints={userPoints}
              onRedeem={requestRedeem}
              redeeming={redeemingId === reward.reward_id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          <Gift size={36} className="mx-auto text-slate-300" />
          <p className="mt-4 text-lg font-bold text-slate-800">
            Tidak ada reward yang cocok dengan filter ini.
          </p>
          <p className="mt-1 text-sm">
            Coba ganti filter atau buka reward lain yang masih aktif.
          </p>
        </div>
      )}

      <AlertDialog
        open={Boolean(pendingReward)}
        onOpenChange={(open) => {
          if (!open) setPendingReward(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi penukaran poin</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReward
                ? `Tukar ${formatPoints(pendingReward.poin_dibutuhkan)} poin untuk "${pendingReward.nama_reward}"? Jika Anda menekan Ya, reward akan langsung diproses dan stok berkurang.`
                : "Konfirmasi penukaran reward ini."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingReward) {
                  void executeRedeem(pendingReward);
                }
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Ya, tukar poin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
