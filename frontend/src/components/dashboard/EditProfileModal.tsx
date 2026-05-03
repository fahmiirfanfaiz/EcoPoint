"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { AuthUser, getStoredAuth, saveAuth, API_BASE_URL } from "@/lib/auth";

const FAKULTAS_LIST = [
  "Fakultas Biologi",
  "Fakultas Ekonomika dan Bisnis",
  "Fakultas Farmasi",
  "Fakultas Filsafat",
  "Fakultas Geografi",
  "Fakultas Hukum",
  "Fakultas Ilmu Budaya",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
  "Fakultas Kedokteran Gigi",
  "Fakultas Kedokteran Hewan",
  "Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan (FKKMK)",
  "Fakultas Kehutanan",
  "Fakultas Matematika dan Ilmu Pengetahuan Alam",
  "Fakultas Pertanian",
  "Fakultas Peternakan",
  "Fakultas Psikologi",
  "Fakultas Teknik",
  "Fakultas Teknologi Pertanian",
  "Sekolah Vokasi",
  "Sekolah Pascasarjana"
];

// 6 Hardcoded profile pictures using Dicebear sets — object-contain friendly SVGs
const AVATAR_OPTIONS = [
  { id: 0, url: "https://api.dicebear.com/9.x/adventurer/svg?seed=User&backgroundColor=transparent", label: "Default" },
  { id: 1, url: "https://api.dicebear.com/9.x/bottts/svg?seed=Robot&backgroundColor=transparent", label: "Robot" },
  { id: 2, url: "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Happy&backgroundColor=transparent", label: "Happy Emoji" },
  { id: 3, url: "https://api.dicebear.com/9.x/micah/svg?seed=Cool&backgroundColor=transparent", label: "Cool" },
  { id: 4, url: "https://api.dicebear.com/9.x/notionists/svg?seed=Idea&backgroundColor=transparent", label: "Idea" },
  { id: 5, url: "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract&backgroundColor=transparent", label: "Abstract" },
];

export function getAvatarUrl(_user: AuthUser, picId: number = 0) {
  const option = AVATAR_OPTIONS.find(o => o.id === picId);
  if (option) return option.url;
  return AVATAR_OPTIONS[0].url;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [form, setForm] = useState({
    nama: "",
    nim: "",
    email: "",
    fakultas: "",
    profile_pic: 0
  });
  
  const [isEdited, setIsEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        nama: user.nama || "",
        nim: user.nim || "",
        email: user.email || "",
        fakultas: user.fakultas || "",
        profile_pic: user.profile_pic ?? 0
      });
      setIsEdited(user.is_edited || false);
      setError(null);
      setShowConfirm(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Check if identity fields changed (only matters when not yet edited)
  const identityChanged = !isEdited && (
    form.nama !== (user.nama || "") ||
    form.nim !== (user.nim || "") ||
    form.fakultas !== (user.fakultas || "")
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If identity fields changed and user hasn't edited before, show confirmation
    if (identityChanged) {
      setShowConfirm(true);
      return;
    }
    // Otherwise just save directly (only avatar/email changes)
    doSave();
  };

  const doSave = async () => {
    setSaving(true);
    setError(null);
    setShowConfirm(false);

    try {
      const auth = getStoredAuth();
      if (!auth?.token) throw new Error("Tidak ada token autentikasi");

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui profil");
      }

      // Update local storage
      const newAuth = {
        ...auth,
        user: {
          ...auth.user,
          ...data.user,
        }
      };
      saveAuth(newAuth);
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-nunito text-xl font-extrabold text-gray-900">Edit Profil</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form id="edit-profile-form" onSubmit={handleFormSubmit} className="space-y-8">
              
              {/* Avatar Selection */}
              <div>
                <h3 className="font-nunito text-lg font-bold text-gray-900 mb-3">Profile Picture</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, profile_pic: opt.id })}
                      className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all ${
                        form.profile_pic === opt.id 
                          ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" 
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gray-50" />
                      <img src={opt.url} alt={opt.label} className="absolute inset-0 h-full w-full object-contain p-2" />
                      {form.profile_pic === opt.id && (
                        <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-1 text-white shadow-sm">
                          <CheckCircle size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-quicksand text-gray-500">Avatar bisa diganti kapan saja sesuka hati.</p>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Identitas Section */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-nunito text-lg font-bold text-gray-900">Data Identitas</h3>
                  {isEdited ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      <AlertTriangle size={12} />
                      Sudah Terkunci
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} />
                      Kesempatan 1x Edit
                    </span>
                  )}
                </div>

                {!isEdited && (
                  <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 font-quicksand">
                    <strong>Perhatian:</strong> Perubahan pada <b>Nama</b>, <b>NIM</b>, dan <b>Fakultas</b> hanya dapat dilakukan <b>satu kali seumur hidup</b>. Pastikan data yang Anda masukkan sudah benar sebelum menyimpan.
                  </div>
                )}

                {isEdited && (
                  <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700 font-quicksand flex items-start gap-2.5">
                    <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Data identitas telah dikunci secara permanen.</p>
                      <p>Nama, NIM, dan Fakultas tidak dapat diubah lagi. Jika terdapat kesalahan data, silakan hubungi <b>Admin EcoPoint</b> untuk bantuan lebih lanjut.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 font-quicksand">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama */}
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        disabled={isEdited}
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    
                    {/* NIM */}
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">NIM</label>
                      <input
                        type="text"
                        required
                        disabled={isEdited}
                        value={form.nim}
                        onChange={(e) => setForm({ ...form, nim: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Fakultas */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Fakultas</label>
                    {isEdited ? (
                      <input
                        type="text"
                        disabled
                        value={form.fakultas}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    ) : (
                      <select
                        required
                        value={form.fakultas}
                        onChange={(e) => setForm({ ...form, fakultas: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="" disabled>Pilih Fakultas</option>
                        {FAKULTAS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Email (Always editable) */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Email Utama</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email bisa diubah kapan saja. Pastikan email aktif.</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-profile-form"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-nunito text-lg font-extrabold text-gray-900">Konfirmasi Perubahan</h3>
                  <p className="font-quicksand text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 mb-4 font-quicksand text-sm text-amber-800">
                <p className="font-bold mb-2">Anda akan mengubah data identitas berikut:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  {form.nama !== (user.nama || "") && (
                    <li>Nama: <span className="line-through text-gray-400">{user.nama}</span> → <b>{form.nama}</b></li>
                  )}
                  {form.nim !== (user.nim || "") && (
                    <li>NIM: <span className="line-through text-gray-400">{user.nim}</span> → <b>{form.nim}</b></li>
                  )}
                  {form.fakultas !== (user.fakultas || "") && (
                    <li>Fakultas: <span className="line-through text-gray-400">{user.fakultas || "(kosong)"}</span> → <b>{form.fakultas}</b></li>
                  )}
                </ul>
                <p className="mt-3 font-bold text-amber-900">⚠️ Perubahan ini bersifat <u>permanen</u> dan tidak bisa diubah lagi setelah disimpan.</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-200 border border-gray-200"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={doSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Ya, Saya Yakin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
