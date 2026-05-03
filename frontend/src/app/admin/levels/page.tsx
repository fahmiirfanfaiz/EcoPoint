"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Loader2, TrendingUp, Star } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import ConfirmModal from "@/components/ui/ConfirmModal";

const API = "http://localhost:4000/api/levels";

interface Level {
  level_id: string;
  level_number: number;
  nama_level: string;
  syarat_poin: number;
}

const LEVEL_PRESETS = [
  { level_number: 1, nama_level: "Eco Newbie", syarat_poin: 0 },
  { level_number: 2, nama_level: "Eco Learner", syarat_poin: 100 },
  { level_number: 3, nama_level: "Eco Explorer", syarat_poin: 300 },
  { level_number: 4, nama_level: "Eco Warrior", syarat_poin: 600 },
  { level_number: 5, nama_level: "Eco Champion", syarat_poin: 1000 },
  { level_number: 6, nama_level: "Eco Hero", syarat_poin: 1500 },
  { level_number: 7, nama_level: "Eco Legend", syarat_poin: 2500 },
  { level_number: 8, nama_level: "Eco Guardian", syarat_poin: 4000 },
  { level_number: 9, nama_level: "Eco Master", syarat_poin: 6000 },
  { level_number: 10, nama_level: "Eco Supreme", syarat_poin: 10000 },
];

export default function AdminLevels() {
  const { token } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [form, setForm] = useState({ level_id: "", level_number: 1, nama_level: "", syarat_poin: 0 });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive?: boolean; onConfirm: () => void }>({ isOpen: false, title: "", message: "", isDestructive: false, onConfirm: () => {} });

  const flash = (msg: string, type: "ok" | "err" = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const hdrs = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await fetch(API);
      if (res.ok) { const d = await res.json(); setLevels(d.levels ?? []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const openNew = () => {
    setIsEditing(false);
    const nextNum = levels.length > 0 ? Math.max(...levels.map(l => l.level_number)) + 1 : 1;
    setForm({ level_id: "", level_number: nextNum, nama_level: "", syarat_poin: 0 });
    setShowPresets(levels.length === 0);
    setModalOpen(true);
  };

  const openEdit = (l: Level) => {
    setIsEditing(true);
    setForm({ level_id: l.level_id, level_number: l.level_number, nama_level: l.nama_level, syarat_poin: l.syarat_poin });
    setShowPresets(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama_level) { flash("Nama level wajib diisi", "err"); return; }
    setSaving(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API}/admin/${form.level_id}` : `${API}/admin`;
      const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      flash(isEditing ? "Level berhasil diupdate!" : "Level berhasil dibuat!");
      setModalOpen(false); await fetchLevels();
    } catch (e: any) { flash(e.message || "Gagal menyimpan", "err"); } finally { setSaving(false); }
  };

  const handleDelete = (l: Level) => {
    setConfirmConfig({
      isOpen: true, title: "Hapus Level", message: `Apakah Anda yakin ingin menghapus level ${l.level_number} "${l.nama_level}"?`, isDestructive: true,
      onConfirm: async () => {
        setConfirmConfig((p) => ({ ...p, isOpen: false }));
        try {
          const res = await fetch(`${API}/admin/${l.level_id}`, { method: "DELETE", headers: hdrs() });
          const d = await res.json();
          if (!res.ok) throw new Error(d.message);
          flash("Level dihapus"); await fetchLevels();
        } catch (e: any) { flash(e.message || "Gagal menghapus", "err"); }
      }
    });
  };

  const applyAllPresets = async () => {
    setSaving(true);
    try {
      for (const p of LEVEL_PRESETS) {
        const existing = levels.find(l => l.level_number === p.level_number);
        if (existing) continue;
        const res = await fetch(`${API}/admin`, { method: "POST", headers: hdrs(), body: JSON.stringify(p) });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      }
      flash("Semua preset level berhasil ditambahkan!");
      setShowPresets(false);
      await fetchLevels();
    } catch (e: any) { flash(e.message || "Gagal menambahkan preset", "err"); } finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      {toast && (<div className={`fixed right-6 top-20 z-[60] flex items-center gap-2 rounded-xl px-5 py-3 font-quicksand text-sm font-semibold shadow-lg ${toast.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{toast.type === "ok" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{toast.msg}</div>)}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><TrendingUp size={20} /></div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Total Level</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">{levels.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Star size={20} /></div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Level Tertinggi</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">
                {levels.length > 0 ? `Lvl ${Math.max(...levels.map(l => l.level_number))}` : "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg width="20" height="20" viewBox="0 0 25 24" fill="none"><path d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z" fill="currentColor" /></svg>
            </div>
            <div>
              <p className="font-quicksand text-sm text-gray-500">Poin Maks</p>
              <p className="font-nunito text-2xl font-extrabold text-gray-900">
                {levels.length > 0 ? Math.max(...levels.map(l => l.syarat_poin)).toLocaleString("id-ID") : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Sistem Leveling</h1>
          <p className="mt-1 font-quicksand text-gray-500">Kelola level dan syarat poin yang dibutuhkan pengguna</p>
        </div>
        <div className="flex gap-3">
          {levels.length === 0 && (
            <button onClick={() => setShowPresets(true)} className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-2.5 font-bold text-emerald-700 transition-all hover:bg-emerald-100">
              ⚡ Pakai Preset
            </button>
          )}
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"><Plus size={20} />Tambah Level</button>
        </div>
      </div>

      {/* Presets bulk */}
      {showPresets && levels.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6">
          <h3 className="font-nunito text-lg font-extrabold text-emerald-800 mb-2">⚡ Template Level Cepat</h3>
          <p className="font-quicksand text-sm text-emerald-600 mb-4">Gunakan preset standar untuk memulai sistem leveling dengan cepat. Anda bisa mengedit atau menghapusnya nanti.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {LEVEL_PRESETS.map((p) => (
              <div key={p.level_number} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-center">
                <p className="font-nunito text-sm font-extrabold text-gray-800">Lvl {p.level_number}</p>
                <p className="font-quicksand text-xs text-emerald-600">{p.nama_level}</p>
                <p className="font-quicksand text-[11px] text-gray-400">{p.syarat_poin.toLocaleString("id-ID")} poin</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={applyAllPresets} disabled={saving} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50">
              {saving && <Loader2 size={16} className="animate-spin" />}Terapkan Semua Preset
            </button>
            <button onClick={() => setShowPresets(false)} className="rounded-xl px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100">Batal</button>
          </div>
        </div>
      )}

      {/* Level Table */}
      {levels.length > 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-4 text-left font-quicksand text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left font-quicksand text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left font-quicksand text-xs font-bold text-gray-500 uppercase tracking-wider">Syarat Poin</th>
                <th className="px-6 py-4 text-right font-quicksand text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {levels.sort((a, b) => a.level_number - b.level_number).map((l, i) => (
                <tr key={l.level_id} className={`border-b border-gray-50 transition-colors hover:bg-emerald-50/30 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <span className="font-nunito text-sm font-extrabold">{l.level_number}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-nunito text-sm font-bold text-gray-900">{l.nama_level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {l.syarat_poin.toLocaleString("id-ID")} poin
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(l)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !showPresets && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <TrendingUp size={48} className="text-gray-300 mb-3" />
          <p className="font-nunito text-lg font-bold text-gray-400">Belum ada level</p>
          <p className="font-quicksand text-sm text-gray-400 mt-1">Klik &quot;Tambah Level&quot; atau gunakan preset untuk memulai!</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-nunito text-2xl font-extrabold text-gray-900">{isEditing ? "Edit Level" : "Tambah Level Baru"}</h2>
            </div>
            <div className="space-y-4 px-6 py-5 font-quicksand">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Level</label>
                <input type="number" min={1} value={form.level_number} onChange={(e) => setForm((f) => ({ ...f, level_number: parseInt(e.target.value) || 1 }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Level</label>
                <input type="text" value={form.nama_level} onChange={(e) => setForm((f) => ({ ...f, nama_level: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Eco Warrior" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Syarat Poin (Lifetime)</label>
                <input type="number" min={0} value={form.syarat_poin} onChange={(e) => setForm((f) => ({ ...f, syarat_poin: parseInt(e.target.value) || 0 }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                <p className="text-xs text-gray-400 mt-1">Total poin yang pernah diraih (tidak terpengaruh penukaran)</p>
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
