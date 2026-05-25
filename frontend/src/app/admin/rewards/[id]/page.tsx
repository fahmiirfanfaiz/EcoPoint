"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  PencilLine,
  TrendingUp,
} from "lucide-react";

interface Reward {
  reward_id: string;
  nama_reward: string;
  deskripsi: string;
  poin_dibutuhkan: number;
  stok: number;
  is_active: boolean;
  redeemed_count?: number;
}

const formatPoints = (value: number) => value.toLocaleString("id-ID");

export default function AdminRewardDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const token = getBearerToken();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      setError(
        !token
          ? "Silakan login ulang sebagai admin."
          : "Reward tidak ditemukan.",
      );
      return;
    }

    const loadReward = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/rewards/${id}`, {
          headers: { Authorization: token },
        });
        const payload = (await response.json().catch(() => null)) as {
          reward?: Reward;
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.message ?? "Gagal memuat detail reward");
        }

        setReward(payload?.reward ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat detail reward",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadReward();
  }, [id, token]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        Loading reward details...
      </div>
    );
  }

  if (error || !reward) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error || "Reward not found"}
      </div>
    );
  }

  const statusTone = reward.is_active
    ? reward.stok > 0
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-slate-500">
            Admin / Rewards / Detail
          </p>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Reward Detail
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rewards"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <Link
            href={`/admin/rewards/${reward.reward_id}/edit`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <PencilLine size={16} />
            Edit Reward
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-black text-emerald-600">
                <Gift size={28} />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {reward.nama_reward}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{reward.deskripsi}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}
            >
              {reward.is_active
                ? reward.stok > 0
                  ? "Bisa Ditukar"
                  : "Stok Habis"
                : "Nonaktif"}
            </span>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reward ID
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold text-slate-900">
                {reward.reward_id}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Points Required
              </dt>
              <dd className="mt-1 text-sm font-semibold text-emerald-600">
                {formatPoints(reward.poin_dibutuhkan)} pts
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stock
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {formatPoints(reward.stok)} item
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Redeemed Count
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {formatPoints(reward.redeemed_count ?? 0)}x
              </dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-3xl bg-linear-to-br from-emerald-600 to-emerald-500 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 text-emerald-50/90">
            <CheckCircle2 size={18} />
            Reward Overview
          </div>
          <p className="mt-2 text-sm text-emerald-50/90">
            Halaman ini menampilkan data detail reward dari endpoint admin dan
            bisa dipakai untuk review sebelum edit atau delete.
          </p>
          <div className="mt-6 space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-50/80">
                Status
              </span>
              <span className="text-sm font-bold">
                {reward.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-50/80">
                Stock
              </span>
              <span className="text-sm font-bold">{reward.stok}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-50/80">
                Popularity
              </span>
              <span className="text-sm font-bold inline-flex items-center gap-1">
                <TrendingUp size={14} />
                {reward.redeemed_count ?? 0} redeem
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
