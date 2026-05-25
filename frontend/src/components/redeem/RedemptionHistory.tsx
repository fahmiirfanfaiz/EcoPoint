"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Loader2,
  ShieldAlert,
  CheckCircle,
  Clock,
  PackageCheck,
  PackageX,
  ClipboardList,
} from "lucide-react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

type HistoryFilter = "Semua" | "Belum Dipakai" | "Sudah Dipakai";

interface Redemption {
  redemption_id: string;
  reward_id: string;
  reward_name: string;
  reward_description: string;
  poin_digunakan: number;
  redeemed_at: string;
  used_at: string | null;
}

const FILTER_OPTIONS: HistoryFilter[] = [
  "Semua",
  "Belum Dipakai",
  "Sudah Dipakai",
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPoints = (value: number) => value.toLocaleString("id-ID");

/* ── Single History Card ── */
function HistoryCard({
  redemption,
  onUse,
  using,
}: {
  redemption: Redemption;
  onUse: (redemption: Redemption) => void;
  using: boolean;
}) {
  const isUsed = redemption.used_at !== null && redemption.used_at !== undefined;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${isUsed
          ? "border-slate-100 opacity-75"
          : "border-emerald-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100/40"
        }`}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden p-5 pb-4"
        style={{
          background: isUsed
            ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
            : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isUsed
                    ? "bg-slate-100 text-slate-500 border border-slate-200/80"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  }`}
              >
                {isUsed ? (
                  <>
                    <PackageCheck size={10} />
                    Sudah Dipakai
                  </>
                ) : (
                  <>
                    <PackageX size={10} />
                    Belum Dipakai
                  </>
                )}
              </span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-tight text-slate-900">
              {redemption.reward_name}
            </h3>
          </div>
          <div
            className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${isUsed ? "bg-slate-400" : "bg-emerald-500"
              }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
              Poin
            </span>
            <span className="text-xl font-black leading-none text-white">
              {formatPoints(redemption.poin_digunakan)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
        <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
          {redemption.reward_description}
        </p>

        {/* Timestamps */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock size={12} />
            Ditukar: {formatDate(redemption.redeemed_at)}
          </div>
          {isUsed && redemption.used_at && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle size={12} />
              Dipakai: {formatDate(redemption.used_at)}
            </div>
          )}
        </div>

        {/* CTA Button */}
        {!isUsed && (
          <button
            type="button"
            disabled={using}
            onClick={() => onUse(redemption)}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 bg-emerald-500 text-white shadow-md shadow-emerald-200/60 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200/80 active:scale-[0.98]"
          >
            {using ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Pakai Reward
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Confirmation Modal ── */
function ConfirmUseModal({
  redemption,
  onConfirm,
  onCancel,
}: {
  redemption: Redemption;
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
              <PackageCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Konfirmasi Penggunaan
              </h3>
              <p className="text-sm text-slate-500">
                Tandai reward ini sebagai dipakai?
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-700">
              {redemption.reward_name}
            </p>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {redemption.reward_description}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs font-semibold text-amber-700">
              ⚠️ Setelah ditandai sebagai dipakai, status ini tidak dapat
              diubah kembali.
            </p>
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
            Ya, Pakai
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main History Component ── */
export default function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>("Semua");
  const [usingId, setUsingId] = useState<string | null>(null);
  const [pendingUse, setPendingUse] = useState<Redemption | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    const token = getBearerToken();
    if (!token) {
      setError("Silakan login untuk melihat riwayat penukaran.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/history`, {
        headers: { Authorization: token },
      });

      const payload = (await response.json().catch(() => null)) as {
        redemptions?: Redemption[];
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal memuat riwayat");
      }

      setRedemptions(payload?.redemptions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    void loadHistory();
  }, []);

  const filteredRedemptions = useMemo(() => {
    if (filter === "Belum Dipakai") {
      return redemptions.filter((r) => r.used_at === null || r.used_at === undefined);
    }
    if (filter === "Sudah Dipakai") {
      return redemptions.filter((r) => r.used_at !== null && r.used_at !== undefined);
    }
    return redemptions;
  }, [filter, redemptions]);

  const unusedCount = redemptions.filter((r) => r.used_at === null || r.used_at === undefined).length;

  const requestUse = (redemption: Redemption) => {
    setPendingUse(redemption);
    setMessage(null);
  };

  const executeUse = async (redemption: Redemption) => {
    const token = getBearerToken();
    if (!token) {
      setMessage({
        type: "err",
        text: "Silakan login ulang.",
      });
      return;
    }

    setUsingId(redemption.redemption_id);
    setMessage(null);
    setPendingUse(null);

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/use`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redemption_id: redemption.redemption_id }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        data?: { used_at?: string };
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menandai reward");
      }

      // Update local state
      setRedemptions((prev) =>
        prev.map((r) =>
          r.redemption_id === redemption.redemption_id
            ? { ...r, used_at: payload?.data?.used_at ?? new Date().toISOString() }
            : r,
        ),
      );

      setMessage({
        type: "ok",
        text: `Reward "${redemption.reward_name}" berhasil dipakai!`,
      });
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menandai reward",
      });
    } finally {
      setUsingId(null);
    }
  };

  return (
    <div className="font-nunito w-full space-y-5">
      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${filter === option
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {option}
              {option === "Belum Dipakai" && unusedCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-black">
                  {unusedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Gift size={14} className="text-emerald-500" />
          <span>
            <strong className="text-slate-700">{redemptions.length}</strong>{" "}
            reward ditukar
          </span>
        </div>
      </div>

      {/* ── Toast Messages ── */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all ${message.type === "ok"
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
            onClick={() => void loadHistory()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
          >
            Coba lagi
          </button>
        </div>
      ) : filteredRedemptions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRedemptions.map((redemption) => (
            <HistoryCard
              key={redemption.redemption_id}
              redemption={redemption}
              onUse={requestUse}
              using={usingId === redemption.redemption_id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          <ClipboardList size={36} className="mx-auto text-slate-300" />
          <p className="mt-4 text-lg font-bold text-slate-800">
            {filter === "Belum Dipakai"
              ? "Semua reward sudah dipakai."
              : filter === "Sudah Dipakai"
                ? "Belum ada reward yang dipakai."
                : "Belum ada riwayat penukaran."}
          </p>
          <p className="mt-1 text-sm">
            {filter === "Semua"
              ? "Tukar poinmu untuk mendapatkan reward eksklusif!"
              : "Coba ganti filter untuk melihat reward lainnya."}
          </p>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {pendingUse && (
        <ConfirmUseModal
          redemption={pendingUse}
          onConfirm={() => {
            if (pendingUse) {
              void executeUse(pendingUse);
            }
          }}
          onCancel={() => setPendingUse(null)}
        />
      )}
    </div>
  );
}
