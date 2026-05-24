"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-ecopoint.vercel.app/api";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

export default function AdminUserDetailPage({}: { params?: never }) {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading user details...
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
          <p className="mb-2 text-sm text-slate-500">Admin / Users / Detail</p>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            User Detail
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <Link
            href={`/admin/users/${user.user_id}/edit`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <PencilLine size={16} />
            Edit User
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-black text-emerald-600">
                {user.nama.charAt(0)}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {user.nama}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {user.role}
            </span>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                NIM
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {user.nim}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Faculty
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {user.fakultas}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Points
              </dt>
              <dd className="mt-1 text-sm font-semibold text-emerald-600">
                {user.total_poin} pts
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created At
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(user.created_at).toLocaleString("id-ID")}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-linear-to-br from-emerald-600 to-emerald-500 p-6 text-white shadow-sm">
          <h3 className="text-lg font-bold">Account Snapshot</h3>
          <p className="mt-2 text-sm text-emerald-50/90">
            Detail user ditampilkan sebagai halaman tersendiri agar admin bisa
            meninjau informasi tanpa popup.
          </p>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-50/80">
              User ID
            </p>
            <p className="mt-2 break-all text-sm font-medium">{user.user_id}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
