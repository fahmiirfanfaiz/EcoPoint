"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

type User = {
  user_id: string;
  nama: string;
  nim: string;
  email: string;
  role: string;
  fakultas: string;
  total_poin: string;
  created_at: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

export default function AdminUserEditPage({}: { params?: never }) {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = params?.id ?? null;

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`);
        if (!res.ok) {
          const body: { message?: string } = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load user");
        }
        const body: { data: User } = await res.json();
        setUser(body.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        nama: String(formData.get("nama") ?? ""),
        nim: String(formData.get("nim") ?? ""),
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "mahasiswa"),
        fakultas: String(formData.get("fakultas") ?? ""),
        total_poin: String(formData.get("total_poin") ?? "0"),
      };

      const res = await fetch(`${API_BASE_URL}/admin/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body: { message?: string } = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update user");
      }

      const body: { data: User } = await res.json();
      setUser(body.data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading edit form...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-slate-500">Admin / Users / Edit</p>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Edit User
          </h1>
        </div>
        <Link
          href={`/admin/users/${user.user_id}`}
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
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                name="nama"
                defaultValue={user.nama}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              NIM
              <input
                name="nim"
                defaultValue={user.nim}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Email
              <input
                name="email"
                defaultValue={user.email}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Role
              <select
                name="role"
                defaultValue={user.role}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              >
                <option value="mahasiswa">mahasiswa</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Total Points
              <input
                name="total_poin"
                defaultValue={user.total_poin}
                inputMode="numeric"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Faculty
              <input
                name="fakultas"
                defaultValue={user.fakultas}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/users"
              className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="text-lg font-bold">Editing Notes</h3>
          <p className="mt-2 text-sm text-slate-300">
            Perubahan akan disimpan ke endpoint admin users dan kembali ke
            halaman detail setelah berhasil.
          </p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Current User ID
            </p>
            <p className="mt-2 break-all text-sm font-medium">{user.user_id}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
