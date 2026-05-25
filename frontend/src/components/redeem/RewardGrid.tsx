"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Loader2,
  ShieldAlert,
  Star,
  CheckCircle,
} from "lucide-react";
import {
  API_BASE_URL,
  getBearerToken,
  getStoredAuth,
  updateStoredPoints,
} from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

type FilterOption = "Semua" | "Bisa Ditukar" | "Belum Cukup";

interface Reward {
  reward_id: string;
  nama_reward: string;
  deskripsi: string;
  poin_dibutuhkan: number;
  stok: number;
  is_active: boolean;
}

const FILTER_OPTIONS: FilterOption[] = [
  "Semua",
  "Bisa Ditukar",
  "Belum Cukup",
];

const formatPoints = (value: number) => value.toLocaleString("id-ID");

/* ── Single Reward Card ── */
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
  const outOfStock = reward.stok <= 0;
  const inactive = !reward.is_active;

  const statusLabel = inactive
    ? "Nonaktif"
    : outOfStock
      ? "Stok Habis"
      : affordable
        ? "Bisa Ditukar"
        : "Poin Belum Cukup";

  const statusColor = inactive
    ? "bg-slate-100 text-slate-500 border border-slate-200/80"
    : outOfStock
      ? "bg-red-50 text-red-600 border border-red-200/80"
      : affordable
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
        : "bg-amber-50 text-amber-700 border border-amber-200/80";

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
        canRedeem
          ? "border-emerald-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100/40"
          : "border-slate-100 opacity-80"
      }`}
    >
      {/* Header gradient */}
      <div
        className="relative overflow-hidden p-5 pb-4"
        style={{
          background: canRedeem
            ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}
              >
                {statusLabel}
              </span>
              {!inactive && reward.stok > 0 && (
                <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm">
                  Sisa {reward.stok}
                </span>
              )}
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-tight text-slate-900">
              {reward.nama_reward}
            </h3>
          </div>
          <div
            className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${
              canRedeem ? "bg-emerald-500" : "bg-slate-400"
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
              Poin
            </span>
            <span className="text-xl font-black leading-none text-white">
              {formatPoints(reward.poin_dibutuhkan)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
        <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
          {reward.deskripsi}
        </p>

        {/* CTA Button */}
        <button
          type="button"
          disabled={redeeming || !canRedeem}
          onClick={() => onRedeem(reward)}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
            canRedeem
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200/80 active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          {redeeming ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menukar...
            </>
          ) : canRedeem ? (
            <>
              <Gift size={16} />
              Tukar Poin
            </>
          ) : (
            <>
              {inactive
                ? "Nonaktif"
                : outOfStock
                  ? "Stok Habis"
                  : `Kurang ${formatPoints(reward.poin_dibutuhkan - userPoints)} poin`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Confirmation Modal (inline, no Radix dependency) ── */
function ConfirmRedeemModal({
  reward,
  userPoints,
  onConfirm,
  onCancel,
}: {
  reward: Reward;
  userPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const sisaPoin = userPoints - reward.poin_dibutuhkan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className="p-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-md">
              <Gift size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Konfirmasi Penukaran
              </h3>
              <p className="text-sm text-slate-500">
                Pastikan sebelum menukar poin
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-700">
              {reward.nama_reward}
            </p>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {reward.deskripsi}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Biaya
              </p>
              <p className="mt-1 text-lg font-black text-amber-700">
                -{formatPoints(reward.poin_dibutuhkan)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Sisa Poin
              </p>
              <p className="mt-1 text-lg font-black text-emerald-700">
                {formatPoints(sisaPoin)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200/60 transition-all hover:bg-emerald-600 active:scale-[0.98]"
          >
            <CheckCircle size={16} />
            Ya, Tukar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Grid ── */
export default function RewardsGrid() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("Semua");
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

  const activeRewards = useMemo(
    () => rewards.filter((r) => r.is_active && r.stok > 0),
    [rewards],
  );

  const filteredRewards = useMemo(() => {
    let items = activeRewards;

    if (filter === "Bisa Ditukar") {
      items = items.filter((r) => userPoints >= r.poin_dibutuhkan);
    } else if (filter === "Belum Cukup") {
      items = items.filter((r) => userPoints < r.poin_dibutuhkan);
    }

    // Sort: affordable first, then by points ascending
    return [...items].sort((a, b) => {
      const aAffordable = userPoints >= a.poin_dibutuhkan;
      const bAffordable = userPoints >= b.poin_dibutuhkan;
      if (aAffordable !== bAffordable) return aAffordable ? -1 : 1;
      return a.poin_dibutuhkan - b.poin_dibutuhkan;
    });
  }, [filter, activeRewards, userPoints]);

  const redeemableCount = activeRewards.filter(
    (r) => userPoints >= r.poin_dibutuhkan,
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
        text: `🎉 Reward "${reward.nama_reward}" berhasil ditukar!`,
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
    <div className="font-nunito w-full space-y-5">
      {/* ── Filter + Stats Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                filter === option
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {option}
              {option === "Bisa Ditukar" && redeemableCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-black">
                  {redeemableCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Star size={14} className="text-emerald-500" />
          <span>
            <strong className="text-slate-700">{formatPoints(userPoints)}</strong>{" "}
            poin tersedia
          </span>
        </div>
      </div>

      {/* ── Toast Messages ── */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle size={18} />
          ) : (
            <ShieldAlert size={18} />
          )}
          {message.text}
        </div>
      )}

      {/* ── Grid ── */}
      {!isHydrated || loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
            >
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          <Gift size={36} className="mx-auto text-slate-300" />
          <p className="mt-4 text-lg font-bold text-slate-800">
            {filter === "Bisa Ditukar"
              ? "Belum ada reward yang bisa ditukar dengan poinmu saat ini."
              : "Tidak ada reward yang cocok dengan filter ini."}
          </p>
          <p className="mt-1 text-sm">
            Coba ganti filter atau kumpulkan lebih banyak poin.
          </p>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {pendingReward && (
        <ConfirmRedeemModal
          reward={pendingReward}
          userPoints={userPoints}
          onConfirm={() => {
            if (pendingReward) {
              void executeRedeem(pendingReward);
            }
          }}
          onCancel={() => setPendingReward(null)}
        />
      )}
    </div>
  );
}
