"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import {
  CheckCircle2,
  Edit2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
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

type RewardFormState = {
  nama_reward: string;
  deskripsi: string;
  poin_dibutuhkan: string;
  stok: string;
  is_active: boolean;
};

const emptyForm: RewardFormState = {
  nama_reward: "",
  deskripsi: "",
  poin_dibutuhkan: "",
  stok: "0",
  is_active: true,
};

const formatPoints = (value: number) => value.toLocaleString("id-ID");

export default function AdminRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyForm);

  const token = getBearerToken();

  const loadRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("Silakan login ulang sebagai admin.");
      }

      const response = await fetch(`${API_BASE_URL}/admin/rewards`, {
        headers: { Authorization: token },
      });

      const payload = (await response.json().catch(() => null)) as {
        rewards?: Reward[];
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal memuat reward admin");
      }

      setRewards(payload?.rewards ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat reward admin",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRewards();

    const sync = () => {
      void loadRewards();
    };

    window.addEventListener("ecopoint-auth-changed", sync);
    return () => window.removeEventListener("ecopoint-auth-changed", sync);
  }, []);

  const stats = useMemo(
    () => ({
      total: rewards.length,
      active: rewards.filter((reward) => reward.is_active).length,
      redeemable: rewards.filter(
        (reward) => reward.is_active && reward.stok > 0,
      ).length,
      redeemed: rewards.reduce(
        (sum, reward) => sum + (reward.redeemed_count ?? 0),
        0,
      ),
    }),
    [rewards],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (reward: Reward) => {
    setEditingId(reward.reward_id);
    setForm({
      nama_reward: reward.nama_reward,
      deskripsi: reward.deskripsi,
      poin_dibutuhkan: reward.poin_dibutuhkan.toString(),
      stok: reward.stok.toString(),
      is_active: reward.is_active,
    });
    setMessage(null);
  };

  const handleSave = async () => {
    if (!token) {
      setMessage({ type: "err", text: "Silakan login ulang sebagai admin." });
      return;
    }

    if (
      !form.nama_reward.trim() ||
      !form.deskripsi.trim() ||
      !form.poin_dibutuhkan.trim()
    ) {
      setMessage({
        type: "err",
        text: "Nama reward, deskripsi, dan poin wajib diisi.",
      });
      return;
    }

    const poin = Number(form.poin_dibutuhkan);
    const stok = Number(form.stok);

    if (
      !Number.isFinite(poin) ||
      poin < 0 ||
      !Number.isFinite(stok) ||
      stok < 0
    ) {
      setMessage({
        type: "err",
        text: "Poin dan stok harus berupa angka valid.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        editingId
          ? `${API_BASE_URL}/admin/rewards/${editingId}`
          : `${API_BASE_URL}/admin/rewards`,
        {
          method: editingId ? "PUT" : "POST",
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

      setMessage({
        type: "ok",
        text: editingId
          ? "Reward berhasil diperbarui."
          : "Reward baru berhasil ditambahkan.",
      });
      resetForm();
      await loadRewards();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menyimpan reward",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (!token) {
      setMessage({ type: "err", text: "Silakan login ulang sebagai admin." });
      return;
    }

    const confirmed = window.confirm(
      `Hapus reward ${reward.nama_reward}? Jika sudah pernah diredeem, sistem akan menonaktifkannya.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/rewards/${reward.reward_id}`,
        {
          method: "DELETE",
          headers: { Authorization: token },
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menghapus reward");
      }

      setMessage({
        type: "ok",
        text: payload?.message ?? "Reward berhasil diproses.",
      });
      if (editingId === reward.reward_id) resetForm();
      await loadRewards();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal menghapus reward",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            <ShieldAlert size={12} />
            Admin Reward Catalog
          </p>
          <h1 className="mt-3 font-nunito text-3xl font-extrabold text-gray-900">
            Rewards Catalog
          </h1>
          <p className="text-gray-500 font-quicksand mt-1">
            Kelola voucher, kupon, dan benefit yang bisa ditukar user dengan
            poin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <Metric label="Total" value={stats.total.toString()} />
          <Metric
            label="Aktif"
            value={stats.active.toString()}
            tone="emerald"
          />
          <Metric
            label="Bisa ditukar"
            value={stats.redeemable.toString()}
            tone="amber"
          />
          <Metric
            label="Total redeem"
            value={stats.redeemed.toString()}
            tone="slate"
          />
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${message.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-nunito text-xl font-extrabold text-gray-900">
                {editingId ? "Edit Reward" : "Tambah Reward"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Isi detail reward untuk katalog redeem user.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X size={16} />
                Batal
              </button>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Nama Reward">
              <input
                value={form.nama_reward}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nama_reward: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Voucher Kopi Campus"
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                value={form.deskripsi}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deskripsi: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Diskon 50% untuk minuman di kantin kampus."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Poin Dibutuhkan">
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
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="250"
                />
              </Field>

              <Field label="Stok">
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
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="10"
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Reward aktif dan dapat diredeem user
            </label>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : editingId ? (
                <CheckCircle2 size={16} />
              ) : (
                <Plus size={16} />
              )}
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Reward"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-nunito text-xl font-extrabold text-gray-900">
                  Daftar Reward
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Klik edit untuk mengubah detail reward yang sudah ada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadRewards()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                {error}
              </div>
            ) : rewards.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                Belum ada reward yang dibuat.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {rewards.map((reward) => {
                  const canRedeem = reward.is_active && reward.stok > 0;

                  return (
                    <div
                      key={reward.reward_id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-nunito text-lg font-bold text-gray-900">
                              {reward.nama_reward}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${canRedeem ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {canRedeem
                                ? "Aktif"
                                : reward.is_active
                                  ? "Stok habis"
                                  : "Nonaktif"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {reward.deskripsi}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                            <span className="rounded-full bg-white px-3 py-1">
                              {formatPoints(reward.poin_dibutuhkan)} poin
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Stok {reward.stok}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Redeem {reward.redeemed_count ?? 0}x
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(reward)}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(reward)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "amber";
}) {
  const tones = {
    slate: "text-gray-900",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  } as const;

  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}
