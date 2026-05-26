"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";
import {
  Bell,
  Megaphone,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
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

interface Broadcast {
  notifications_id: string;
  pesan: string;
  created_at: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminNotifications() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [pesan, setPesan] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Broadcast | null>(null);

  const token = getBearerToken();

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("Silakan login ulang sebagai admin.");
      }

      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { Authorization: token },
      });

      const payload = (await response.json().catch(() => null)) as {
        broadcasts?: Broadcast[];
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal memuat pengumuman");
      }

      setBroadcasts(payload?.broadcasts ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat pengumuman",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  const handleSend = async () => {
    if (!token) {
      setMessage({ type: "err", text: "Silakan login ulang sebagai admin." });
      return;
    }

    if (!pesan.trim()) {
      setMessage({ type: "err", text: "Pesan pengumuman tidak boleh kosong." });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pesan: pesan.trim() }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        count?: number;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal mengirim pengumuman");
      }

      setMessage({
        type: "ok",
        text: payload?.message ?? "Pengumuman berhasil dikirim.",
      });
      setPesan("");
      await loadBroadcasts();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal mengirim pengumuman",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget || !token) return;

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/notifications/${deleteTarget.notifications_id}`,
        {
          method: "DELETE",
          headers: { Authorization: token },
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Gagal menghapus pengumuman");
      }

      setMessage({
        type: "ok",
        text: payload?.message ?? "Pengumuman berhasil dihapus.",
      });
      setDeleteTarget(null);
      await loadBroadcasts();
    } catch (err) {
      setMessage({
        type: "err",
        text:
          err instanceof Error ? err.message : "Gagal menghapus pengumuman",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            <ShieldAlert size={12} />
            Admin Notification Center
          </p>
          <h1 className="mt-3 font-nunito text-3xl font-extrabold text-gray-900">
            Manajemen Notifikasi
          </h1>
          <p className="text-gray-500 font-quicksand mt-1">
            Kirim pengumuman publik ke seluruh pengguna dan kelola riwayat
            notifikasi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
              Total Pengumuman
            </p>
            <p className="mt-2 text-2xl font-black text-gray-900">
              {broadcasts.length}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
              Tipe
            </p>
            <p className="mt-2 text-2xl font-black text-emerald-600">
              Broadcast
            </p>
          </div>
        </div>
      </div>

      {/* Flash message */}
      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${message.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Compose Form */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-nunito text-xl font-extrabold text-gray-900">
                Kirim Pengumuman
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Pesan ini akan dikirim ke seluruh pengguna.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-700">
                Isi Pengumuman
              </span>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                className="min-h-36 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Contoh: Selamat pagi! Jangan lupa ikut challenge hari ini untuk mendapatkan poin bonus 🌱"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {sending ? "Mengirim..." : "Kirim Pengumuman"}
            </button>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-nunito text-xl font-extrabold text-gray-900">
                  Riwayat Pengumuman
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Daftar pengumuman yang pernah dikirim ke pengguna.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadBroadcasts()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                {error}
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <Bell size={24} className="text-gray-400" />
                <p className="mt-3 text-sm font-bold text-gray-900">
                  Belum ada pengumuman
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Pengumuman yang dikirim akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {broadcasts.map((b) => (
                  <div
                    key={b.notifications_id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            Broadcast
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">
                            {formatDate(b.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {b.pesan}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(b);
                          setMessage(null);
                        }}
                        className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Pengumuman "${deleteTarget.pesan.substring(0, 60)}${deleteTarget.pesan.length > 60 ? "..." : ""}" akan dihapus dari semua pengguna.`
                : "Pengumuman ini akan dihapus."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirmed()}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl"
            >
              {sending ? "Menghapus..." : "Ya, hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
