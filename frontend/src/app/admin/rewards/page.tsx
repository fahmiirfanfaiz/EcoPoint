"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import {
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  Gift,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
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

type FilterType = "semua" | "aktif" | "nonaktif" | "habis";

export default function AdminRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [form, setForm] = useState<RewardFormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("semua");
  const [sortBy, setSortBy] = useState<"nama" | "poin" | "stok">("nama");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const token = getBearerToken();

  const loadRewards = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    void loadRewards();

    const sync = () => {
      void loadRewards();
    };

    window.addEventListener("ecopoint-auth-changed", sync);
    return () => window.removeEventListener("ecopoint-auth-changed", sync);
  }, [loadRewards]);

  const stats = useMemo(
    () => ({
      total: rewards.length,
      active: rewards.filter((reward) => reward.is_active).length,
      redeemable: rewards.filter(
        (reward) => reward.is_active && reward.stok > 0,
      ).length,
      outOfStock: rewards.filter(
        (reward) => reward.is_active && reward.stok === 0,
      ).length,
      redeemed: rewards.reduce(
        (sum, reward) => sum + (reward.redeemed_count ?? 0),
        0,
      ),
    }),
    [rewards],
  );

  // Filtered and sorted rewards
  const filteredRewards = useMemo(() => {
    let result = [...rewards];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.nama_reward.toLowerCase().includes(q) ||
          r.deskripsi.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (filter === "aktif") result = result.filter((r) => r.is_active && r.stok > 0);
    else if (filter === "nonaktif") result = result.filter((r) => !r.is_active);
    else if (filter === "habis") result = result.filter((r) => r.is_active && r.stok === 0);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "nama") cmp = a.nama_reward.localeCompare(b.nama_reward);
      else if (sortBy === "poin") cmp = a.poin_dibutuhkan - b.poin_dibutuhkan;
      else if (sortBy === "stok") cmp = a.stok - b.stok;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rewards, searchQuery, filter, sortBy, sortDir]);

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
      const response = await fetch(`${API_BASE_URL}/admin/rewards`, {
        method: "POST",
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
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menyimpan reward");
      }

      setMessage({
        type: "ok",
        text: "Reward baru berhasil ditambahkan.",
      });
      setForm(emptyForm);
      setShowForm(false);
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

  const confirmDelete = (reward: Reward) => {
    setDeleteTarget(reward);
    setMessage(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;

    if (!token) {
      setMessage({ type: "err", text: "Silakan login ulang sebagai admin." });
      setDeleteTarget(null);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/rewards/${deleteTarget.reward_id}`,
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
        text: payload?.message ?? "Reward berhasil dihapus.",
      });
      setDeleteTarget(null);
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

  const toggleSort = (col: "nama" | "poin" | "stok") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: "nama" | "poin" | "stok" }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Kelola Reward
          </h1>
          <p className="text-gray-500 font-quicksand mt-1">
            Atur voucher, kupon, dan benefit yang bisa ditukar pengguna.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus size={18} />
          Tambah Reward
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Gift size={20} />}
          label="Total Reward"
          value={stats.total}
          color="bg-blue-500"
          lightBg="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Aktif & Tersedia"
          value={stats.redeemable}
          color="bg-emerald-500"
          lightBg="bg-emerald-50"
        />
        <StatCard
          icon={<Package size={20} />}
          label="Stok Habis"
          value={stats.outOfStock}
          color="bg-amber-500"
          lightBg="bg-amber-50"
        />
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Total Diredeem"
          value={stats.redeemed}
          color="bg-purple-500"
          lightBg="bg-purple-50"
        />
      </div>

      {/* Toast Message */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-sm font-semibold ${message.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          <div className="flex items-center gap-2">
            {message.type === "ok" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-60 transition-opacity">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add Reward Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="font-nunito text-xl font-extrabold text-gray-900">
                  Tambah Reward Baru
                </h2>
                <p className="mt-1 font-quicksand text-sm text-gray-500">
                  Isi detail reward untuk katalog redeem.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <Field label="Nama Reward">
                <input
                  value={form.nama_reward}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nama_reward: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                  className="min-h-24 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="10"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
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
                Reward aktif dan dapat diredeem
              </label>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {saving ? "Menyimpan..." : "Tambah Reward"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-nunito text-lg font-bold text-gray-900">
              Daftar Reward
            </h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
              {filteredRewards.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari reward..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:w-56"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadRewards()}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-6 py-2">
          {(
            [
              { key: "semua", label: "Semua" },
              { key: "aktif", label: "Aktif" },
              { key: "habis", label: "Stok Habis" },
              { key: "nonaktif", label: "Nonaktif" },
            ] as { key: FilterType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                filter === tab.key
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              {error}
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Gift size={24} />
              </div>
              <p className="mt-4 font-nunito text-base font-bold text-gray-900">
                {searchQuery || filter !== "semua" ? "Tidak ada reward ditemukan" : "Belum ada reward"}
              </p>
              <p className="mt-1 font-quicksand text-sm text-gray-500">
                {searchQuery || filter !== "semua"
                  ? "Coba ubah filter atau kata kunci pencarian."
                  : "Tambahkan reward pertama untuk mulai."}
              </p>
            </div>
          ) : (
            <>
              {/* Sort Header (Table-like) */}
              <div className="mb-3 hidden items-center gap-4 rounded-xl bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 sm:flex">
                <button onClick={() => toggleSort("nama")} className="flex flex-1 items-center gap-1 hover:text-gray-700 transition-colors">
                  Reward <SortIcon col="nama" />
                </button>
                <button onClick={() => toggleSort("poin")} className="flex w-24 items-center justify-end gap-1 hover:text-gray-700 transition-colors">
                  Poin <SortIcon col="poin" />
                </button>
                <button onClick={() => toggleSort("stok")} className="flex w-20 items-center justify-end gap-1 hover:text-gray-700 transition-colors">
                  Stok <SortIcon col="stok" />
                </button>
                <span className="w-16 text-center">Status</span>
                <span className="w-[140px] text-center">Aksi</span>
              </div>

              <div className="space-y-2">
                {filteredRewards.map((reward) => {
                  const canRedeem = reward.is_active && reward.stok > 0;

                  return (
                    <div
                      key={reward.reward_id}
                      className="group flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm sm:flex-row sm:items-center sm:gap-4"
                    >
                      {/* Reward Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${canRedeem ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                            <Gift size={16} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-quicksand text-sm font-bold text-gray-900">
                              {reward.nama_reward}
                            </h3>
                            <p className="truncate font-quicksand text-xs text-gray-400 mt-0.5">
                              {reward.deskripsi}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Poin */}
                      <div className="hidden sm:block w-24 text-right">
                        <span className="font-nunito text-sm font-extrabold text-amber-600">
                          {formatPoints(reward.poin_dibutuhkan)}
                        </span>
                        <p className="text-[10px] text-gray-400">poin</p>
                      </div>

                      {/* Stok */}
                      <div className="hidden sm:block w-20 text-right">
                        <span className={`font-nunito text-sm font-extrabold ${reward.stok > 0 ? "text-gray-800" : "text-red-500"}`}>
                          {reward.stok}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {reward.redeemed_count ? `${reward.redeemed_count}x diredeem` : "stok"}
                        </p>
                      </div>

                      {/* Mobile info */}
                      <div className="flex gap-3 text-xs sm:hidden">
                        <span className="rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-600">
                          {formatPoints(reward.poin_dibutuhkan)} poin
                        </span>
                        <span className={`rounded-lg px-2 py-1 font-bold ${reward.stok > 0 ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600"}`}>
                          Stok: {reward.stok}
                        </span>
                        {reward.redeemed_count ? (
                          <span className="rounded-lg bg-purple-50 px-2 py-1 font-bold text-purple-600">
                            {reward.redeemed_count}x redeem
                          </span>
                        ) : null}
                      </div>

                      {/* Status Badge */}
                      <div className="w-16 hidden sm:flex justify-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            canRedeem
                              ? "bg-emerald-50 text-emerald-700"
                              : reward.is_active
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {canRedeem
                            ? "Aktif"
                            : reward.is_active
                              ? "Habis"
                              : "Off"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2 w-[140px] justify-end">
                        <Link
                          href={`/admin/rewards/${reward.reward_id}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                          title="Detail"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/rewards/${reward.reward_id}/edit`}
                          className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmDelete(reward)}
                          className="rounded-lg border border-rose-200 p-2 text-rose-500 transition-colors hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus reward?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Reward "${deleteTarget.nama_reward}" akan dihapus dari katalog. Jika reward ini sudah pernah diredeem, sistem akan menonaktifkannya.`
                : "Reward ini akan dihapus dari katalog."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
              Batal
              </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirmed()}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl px-6"
            >
              {saving ? "Menghapus..." : "Ya, hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  color,
  lightBg,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
  lightBg: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${lightBg} text-white`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="font-quicksand text-xs font-medium text-gray-500">{label}</p>
          <p className="font-nunito text-2xl font-extrabold text-gray-900">{value.toLocaleString("id-ID")}</p>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transition-transform group-hover:scale-x-100 origin-left ${color}`} />
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
