"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";

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

export default function AdminRewardEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const token = getBearerToken();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama_reward: "",
    deskripsi: "",
    poin_dibutuhkan: "0",
    stok: "0",
    is_active: true,
  });

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
          throw new Error(payload?.message ?? "Gagal memuat reward");
        }

        const loadedReward = payload?.reward ?? null;
        setReward(loadedReward);
        if (loadedReward) {
          setForm({
            nama_reward: loadedReward.nama_reward,
            deskripsi: loadedReward.deskripsi,
            poin_dibutuhkan: loadedReward.poin_dibutuhkan.toString(),
            stok: loadedReward.stok.toString(),
            is_active: loadedReward.is_active,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat reward");
      } finally {
        setLoading(false);
      }
    };

    void loadReward();
  }, [id, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reward || !token) return;

    const poin = Number(form.poin_dibutuhkan);
    const stok = Number(form.stok);
    if (
      !form.nama_reward.trim() ||
      !form.deskripsi.trim() ||
      !Number.isFinite(poin) ||
      poin < 0 ||
      !Number.isFinite(stok) ||
      stok < 0
    ) {
      setError("Isi reward dengan data yang valid.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/rewards/${reward.reward_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama_reward: form.nama_reward.trim(),
            deskripsi: form.deskripsi.trim(),
            poin_dibutuhkan: poin,
            stok,
            is_active: form.is_active,
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menyimpan reward");
      }

      router.push(`/admin/rewards/${reward.reward_id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan reward");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        Loading edit form...
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-slate-500">Admin / Rewards / Edit</p>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Edit Reward
          </h1>
        </div>
        <Link
          href={`/admin/rewards/${reward.reward_id}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to Detail
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_320px]"
      >
        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4">
            <label className="text-sm font-medium text-slate-700">
              Nama Reward
              <input
                value={form.nama_reward}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nama_reward: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Deskripsi
              <textarea
                value={form.deskripsi}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deskripsi: event.target.value,
                  }))
                }
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Poin Dibutuhkan
                <input
                  type="number"
                  min={0}
                  value={form.poin_dibutuhkan}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      poin_dibutuhkan: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Stok
                <input
                  type="number"
                  min={0}
                  value={form.stok}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stok: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Reward aktif dan dapat diredeem user
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href="/admin/rewards"
                className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel
              </Link>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl bg-slate-900 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
          <h3 className="text-lg font-bold">Editing Notes</h3>
          <p className="mt-2 text-sm text-slate-300">
            Perubahan akan disimpan ke endpoint admin rewards dan kembali ke
            halaman detail setelah berhasil.
          </p>
          <div className="mt-6 space-y-3 rounded-2xl bg-white/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Current Reward ID
              </p>
              <p className="mt-2 break-all text-sm font-medium">
                {reward.reward_id}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Current Stock
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatPoints(reward.stok)} item
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
