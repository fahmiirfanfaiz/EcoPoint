"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Loader2, Award, Users, TrendingUp, Target, Star, Shield, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import ConfirmModal from "@/components/ui/ConfirmModal";

const API = "http://localhost:4000/api/badges";

const JENIS_SYARAT = [
  { value: "TOTAL_POIN", label: "Total Poin", icon: Zap, color: "text-amber-600 bg-amber-50", description: "Berdasarkan total poin yang dikumpulkan" },
  { value: "TOTAL_LAPORAN", label: "Total Laporan", icon: Target, color: "text-emerald-600 bg-emerald-50", description: "Berdasarkan jumlah laporan sampah" },
  { value: "LOGIN_STREAK", label: "Login Streak", icon: TrendingUp, color: "text-blue-600 bg-blue-50", description: "Berdasarkan streak login berturut-turut" },
  { value: "CHALLENGE_SELESAI", label: "Challenge Selesai", icon: Star, color: "text-purple-600 bg-purple-50", description: "Berdasarkan jumlah challenge yang diselesaikan" },
] as const;

const BADGE_PRESETS = [
  { nama: "Pemula Hijau", desk: "Langkah pertama menuju kampus hijau.", jenis: "TOTAL_POIN", nilai: 100 },
  { nama: "Penjaga Lingkungan", desk: "Kamu telah mengumpulkan cukup banyak poin!", jenis: "TOTAL_POIN", nilai: 500 },
  { nama: "Eco Champion", desk: "Kontributor lingkungan terbaik di kampus.", jenis: "TOTAL_POIN", nilai: 2000 },
  { nama: "Pelapor Aktif", desk: "Telah melaporkan 10 sampah.", jenis: "TOTAL_LAPORAN", nilai: 10 },
  { nama: "Pelapor Setia", desk: "Telah melaporkan 50 sampah.", jenis: "TOTAL_LAPORAN", nilai: 50 },
  { nama: "7-Day Streak", desk: "Login selama 7 hari berturut-turut.", jenis: "LOGIN_STREAK", nilai: 7 },
  { nama: "30-Day Streak", desk: "Login selama 30 hari berturut-turut.", jenis: "LOGIN_STREAK", nilai: 30 },
  { nama: "Challenge Hunter", desk: "Menyelesaikan 10 daily challenge.", jenis: "CHALLENGE_SELESAI", nilai: 10 },
];

interface Badge {
  badges_id: string;
  nama_badge: string;
  deskripsi: string;
  syarat_poin: number;
  jenis_syarat: string;
  nilai_syarat: number;
  earned_count: number;
}

function getSyaratInfo(jenis: string) {
  return JENIS_SYARAT.find((j) => j.value === jenis) ?? JENIS_SYARAT[0];
}

function getSyaratLabel(jenis: string, nilai: number): string {
  switch (jenis) {
    case "TOTAL_POIN": return `${nilai.toLocaleString()} poin`;
    case "TOTAL_LAPORAN": return `${nilai} laporan`;
    case "LOGIN_STREAK": return `${nilai} hari`;
    case "CHALLENGE_SELESAI": return `${nilai} challenge`;
    default: return `${nilai}`;
  }
}

export default function AdminBadges() {
  const { token } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [form, setForm] = useState({ badges_id: "", nama_badge: "", deskripsi: "", jenis_syarat: "TOTAL_POIN", nilai_syarat: 100 });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive?: boolean; onConfirm: () => void }>({ isOpen: false, title: "", message: "", isDestructive: false, onConfirm: () => {} });

  const flash = (msg: string, type: "ok" | "err" = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const hdrs = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/all`, { headers: hdrs() });
      if (res.ok) { const d = await res.json(); setBadges(d.badges ?? []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [hdrs]);

  useEffect(() => { if (token) fetchBadges(); }, [token, fetchBadges]);

  const openNew = () => { setIsEditing(false); setForm({ badges_id: "", nama_badge: "", deskripsi: "", jenis_syarat: "TOTAL_POIN", nilai_syarat: 100 }); setShowPresets(true); setModalOpen(true); };
  const openEdit = (b: Badge) => { setIsEditing(true); setForm({ badges_id: b.badges_id, nama_badge: b.nama_badge, deskripsi: b.deskripsi, jenis_syarat: b.jenis_syarat, nilai_syarat: b.nilai_syarat }); setShowPresets(false); setModalOpen(true); };
  const applyPreset = (p: typeof BADGE_PRESETS[number]) => { setForm((f) => ({ ...f, nama_badge: p.nama, deskripsi: p.desk, jenis_syarat: p.jenis, nilai_syarat: p.nilai })); setShowPresets(false); };

  const handleSave = async () => {
    if (!form.nama_badge || !form.deskripsi) { flash("Nama dan deskripsi wajib diisi", "err"); return; }
    setSaving(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API}/admin/${form.badges_id}` : `${API}/admin`;
      const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      flash(isEditing ? "Badge berhasil diupdate!" : "Badge berhasil dibuat!");
      setModalOpen(false); await fetchBadges();
    } catch (e: any) { flash(e.message || "Gagal menyimpan", "err"); } finally { setSaving(false); }
  };

  const handleDelete = (b: Badge) => {
    setConfirmConfig({ isOpen: true, title: "Hapus Badge", message: b.earned_count > 0 ? `Badge "${b.nama_badge}" sudah dimiliki oleh ${b.earned_count} user. Badge tidak bisa dihapus.` : `Apakah Anda yakin ingin menghapus badge "${b.nama_badge}"?`, isDestructive: true,
      onConfirm: async () => {
        setConfirmConfig((p) => ({ ...p, isOpen: false }));
        if (b.earned_count > 0) { flash("Badge tidak bisa dihapus karena sudah dimiliki user", "err"); return; }
        try { const res = await fetch(`${API}/admin/${b.badges_id}`, { method: "DELETE", headers: hdrs() }); const d = await res.json(); if (!res.ok) throw new Error(d.message); flash("Badge dihapus"); await fetchBadges(); } catch (e: any) { flash(e.message || "Gagal menghapus", "err"); }
      } });
  };

  const totalEarned = badges.reduce((sum, b) => sum + b.earned_count, 0);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      {toast && (<div className={`fixed right-6 top-20 z-[60] flex items-center gap-2 rounded-xl px-5 py-3 font-quicksand text-sm font-semibold shadow-lg ${toast.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{toast.type === "ok" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{toast.msg}</div>)}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Award size={20} /></div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Total Badge</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">{badges.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Users size={20} /></div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Total Diraih</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">{totalEarned}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Shield size={20} /></div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Jenis Syarat</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">{new Set(badges.map((b) => b.jenis_syarat)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Badges & Achievements</h1>
          <p className="mt-1 font-quicksand text-gray-500">Kelola badge pencapaian untuk memotivasi pengguna</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"><Plus size={20} />Tambah Badge</button>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {badges.map((b) => {
          const info = getSyaratInfo(b.jenis_syarat);
          const Icon = info.icon;
          return (
            <div key={b.badges_id} className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${info.color}`}>
                  <Award size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(b)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(b)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-nunito text-lg font-extrabold text-gray-900">{b.nama_badge}</h3>
              <p className="font-quicksand text-sm text-gray-500 mt-1 line-clamp-2">{b.deskripsi}</p>
              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${info.color}`}>
                  <Icon size={13} />{info.label}
                </span>
                <span className="font-quicksand text-sm font-bold text-gray-700">{getSyaratLabel(b.jenis_syarat, b.nilai_syarat)}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 font-quicksand">
                <Users size={12} />{b.earned_count} user memiliki badge ini
              </div>
            </div>
          );
        })}
        {badges.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Award size={48} className="text-gray-300 mb-3" />
            <p className="font-nunito text-lg font-bold text-gray-400">Belum ada badge</p>
            <p className="font-quicksand text-sm text-gray-400 mt-1">Klik &quot;Tambah Badge&quot; untuk membuat badge pertama!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-nunito text-2xl font-extrabold text-gray-900">{isEditing ? "Edit Badge" : "Tambah Badge Baru"}</h2>
            </div>
            {showPresets && !isEditing && (
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                <p className="font-quicksand text-sm font-semibold text-gray-600 mb-3">⚡ Template Cepat</p>
                <div className="grid grid-cols-2 gap-2">
                  {BADGE_PRESETS.map((p, i) => { const info = getSyaratInfo(p.jenis); const Icon = info.icon; return (
                    <button key={i} onClick={() => applyPreset(p)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs transition-all hover:border-emerald-400 hover:shadow-sm">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${info.color} flex-shrink-0`}><Icon size={16} /></div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{p.nama}</p>
                        <p className="text-gray-500 truncate">{getSyaratLabel(p.jenis, p.nilai)}</p>
                      </div>
                    </button>
                  ); })}
                </div>
                <button onClick={() => setShowPresets(false)} className="mt-3 text-xs text-emerald-600 font-semibold hover:underline">Atau buat manual ↓</button>
              </div>
            )}
            <div className="space-y-4 px-6 py-5 font-quicksand">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Syarat</label>
                <div className="grid grid-cols-2 gap-2">
                  {JENIS_SYARAT.map((j) => { const Icon = j.icon; const sel = form.jenis_syarat === j.value; return (
                    <button key={j.value} onClick={() => setForm((f) => ({ ...f, jenis_syarat: j.value }))}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-xs transition-all ${sel ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon size={18} className={sel ? "text-emerald-600" : "text-gray-400"} />
                      <div className="text-left">
                        <span className={`font-semibold block ${sel ? "text-emerald-700" : "text-gray-600"}`}>{j.label}</span>
                        <span className="text-gray-400 text-[10px]">{j.description}</span>
                      </div>
                    </button>
                  ); })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Badge</label>
                <input type="text" value={form.nama_badge} onChange={(e) => setForm((f) => ({ ...f, nama_badge: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Eco Champion" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 min-h-[80px]" placeholder="Jelaskan pencapaian yang harus diraih..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nilai Syarat ({getSyaratInfo(form.jenis_syarat).label})
                </label>
                <input type="number" min={1} value={form.nilai_syarat} onChange={(e) => setForm((f) => ({ ...f, nilai_syarat: parseInt(e.target.value) || 1 }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                <p className="text-xs text-gray-400 mt-1">User harus mencapai {getSyaratLabel(form.jenis_syarat, form.nilai_syarat)} untuk mendapatkan badge ini</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setModalOpen(false)} className="rounded-xl px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} isDestructive={confirmConfig.isDestructive} onConfirm={confirmConfig.onConfirm} onCancel={() => setConfirmConfig((p) => ({ ...p, isOpen: false }))} />
    </div>
  );
}
