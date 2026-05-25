"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";
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

type User = {
  user_id: string;
  nama: string;
  nim: string;
  email: string;
  role: string;
  fakultas?: string;
  total_poin?: number | string;
  created_at?: string;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Unknown error";
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
      const res = await fetch(`${API_BASE_URL}/admin/users`);
        if (!res.ok) {
          const fallbackText = await res.text();
          throw new Error(fallbackText || "Failed to fetch users");
        }
        const body: { data?: User[] } = await res.json();
        setUsers(body.data ?? []);
      } catch (err: unknown) {
        console.error(err);
        setError(getErrorMessage(err) || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setUsers((s) => s.filter((x) => x.user_id !== id));
        setDeleteTarget(null);
        router.refresh();
      } else {
        const body: { message?: string } = await res.json();
        alert(body.message || "Gagal menghapus pengguna");
      }
    } catch (err: unknown) {
      console.error(err);
      alert(getErrorMessage(err) || "Gagal menghapus pengguna");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Manage Users
          </h1>
          <p className="text-gray-500 font-quicksand mt-1">
            View and manage registered students in EcoPoint.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-quicksand">
                <thead className="bg-gray-50 text-sm font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">NIM</th>
                    <th className="px-6 py-4">Total Points</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {users.map((u) => (
                    <tr
                      key={u.user_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                            {u.nama?.charAt(0) ?? "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.nama}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {u.nim}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {u.total_poin ?? 0} pts
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${u.user_id}`}
                          aria-label={`View ${u.nama}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 mr-2"
                        >
                          <Eye size={17} />
                        </Link>
                        <Link
                          href={`/admin/users/${u.user_id}/edit`}
                          aria-label={`Edit ${u.nama}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors mr-2"
                        >
                          <PencilLine size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${u.nama}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data {deleteTarget?.nama} secara
              permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">
              Cancel
              </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.user_id)}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl w-[5vw]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
