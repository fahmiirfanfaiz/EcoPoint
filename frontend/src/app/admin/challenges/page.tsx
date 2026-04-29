"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, CheckCircle, Zap, Calendar, Recycle, Share2, Eye, Trophy, Star, Loader2, AlertCircle, Pin, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import ConfirmModal from "@/components/ui/ConfirmModal";

const API = "http://localhost:4000/api/daily-challenges";

const CHALLENGE_TYPES = [
  { value: "waste_report", label: "Lapor Sampah", icon: Recycle, color: "text-emerald-600 bg-emerald-50" },
  { value: "share_invite", label: "Share Invitation", icon: Share2, color: "text-blue-600 bg-blue-50" },
  { value: "redeem_reward", label: "Tukar Reward", icon: Trophy, color: "text-purple-600 bg-purple-50" },
  { value: "login_streak", label: "Login Harian", icon: Star, color: "text-amber-600 bg-amber-50" },
  { value: "view_leaderboard", label: "Cek Leaderboard", icon: Eye, color: "text-cyan-600 bg-cyan-50" },
] as const;

const PRESETS = [
  { nama: "Lapor 1 Sampah Hari Ini", desk: "Laporkan minimal 1 sampah yang telah kamu kumpulkan hari ini.", type: "waste_report", target: 1, poin: 25, perm: false },
  { nama: "Lapor 3 Sampah Hari Ini", desk: "Kumpulkan dan laporkan 3 sampah berbeda hari ini.", type: "waste_report", target: 3, poin: 75, perm: false },
  { nama: "Ajak 1 Teman Bergabung", desk: "Bagikan kode undangan EcoPoint ke 1 temanmu.", type: "share_invite", target: 1, poin: 50, perm: false },
  { nama: "Tukar 1 Reward", desk: "Gunakan poin kamu untuk menukarkan 1 hadiah.", type: "redeem_reward", target: 1, poin: 30, perm: false },
  { nama: "Login Streak", desk: "Buka aplikasi EcoPoint hari ini untuk menjaga streak.", type: "login_streak", target: 1, poin: 10, perm: true },
  { nama: "Cek Leaderboard", desk: "Lihat posisimu di leaderboard.", type: "view_leaderboard", target: 1, poin: 10, perm: false },
];

interface Challenge {
  challenge_id: string; nama_challenge: string; deskripsi: string;
  poin_hadiah: number; target_count: number; challenge_type: string;
  is_active: boolean; is_permanent: boolean;
}
interface TodayChallenge {
  challenge_of_the_day_id: string; challenge_id: string; nama_challenge: string;
  deskripsi: string; poin_hadiah: number; target_count: number;
  challenge_type: string; is_permanent: boolean;
}

function getTypeInfo(type: string) {
  return CHALLENGE_TYPES.find((t) => t.value === type) ?? CHALLENGE_TYPES[0];
}

export default function AdminChallenges() {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todayChallenges, setTodayChallenges] = useState<TodayChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [form, setForm] = useState({ challenge_id: "", nama_challenge: "", deskripsi: "", poin_hadiah: 25, target_count: 1, challenge_type: "waste_report", is_active: true, is_permanent: false });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; isDestructive?: boolean; onConfirm: () => void }>({ isOpen: false, title: "", message: "", isDestructive: false, onConfirm: () => {} });

  const flash = (msg: string, type: "ok" | "err" = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const hdrs = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const fetchAll = useCallback(async () => {
    try {
      const [chRes, tdRes] = await Promise.all([
        fetch(`${API}/admin/all`, { headers: hdrs() }),
        fetch(`${API}/admin/today`, { headers: hdrs() }),
      ]);
      if (chRes.ok) { const d = await chRes.json(); setChallenges(d.challenges ?? []); }
      if (tdRes.ok) { const d = await tdRes.json(); setTodayChallenges(d.challenges ?? []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [hdrs]);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

  const openNew = () => { setIsEditing(false); setForm({ challenge_id: "", nama_challenge: "", deskripsi: "", poin_hadiah: 25, target_count: 1, challenge_type: "waste_report", is_active: true, is_permanent: false }); setShowPresets(true); setModalOpen(true); };
  const openEdit = (c: Challenge) => { setIsEditing(true); setForm({ ...c }); setShowPresets(false); setModalOpen(true); };
  const applyPreset = (p: typeof PRESETS[number]) => { setForm((f) => ({ ...f, nama_challenge: p.nama, deskripsi: p.desk, challenge_type: p.type, target_count: p.target, poin_hadiah: p.poin, is_permanent: p.perm })); setShowPresets(false); };

  const handleSave = async () => {
    if (!form.nama_challenge || !form.deskripsi) { flash("Nama dan deskripsi wajib diisi", "err"); return; }
    setSaving(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API}/admin/${form.challenge_id}` : `${API}/admin`;
      const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      flash(isEditing ? "Challenge berhasil diupdate!" : "Challenge berhasil dibuat!");
      setModalOpen(false); await fetchAll();
    } catch (e: any) { flash(e.message || "Gagal menyimpan", "err"); } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({ isOpen: true, title: "Hapus Challenge", message: "Apakah Anda yakin ingin menghapus challenge ini? Tindakan ini tidak dapat dibatalkan.", isDestructive: true,
      onConfirm: async () => { setConfirmConfig((p) => ({ ...p, isOpen: false })); try { await fetch(`${API}/admin/${id}`, { method: "DELETE", headers: hdrs() }); flash("Challenge dihapus"); await fetchAll(); } catch { flash("Gagal menghapus", "err"); } } });
  };

  const toggleActive = (c: Challenge) => {
    const act = c.is_active ? "menonaktifkan" : "mengaktifkan";
    setConfirmConfig({ isOpen: true, title: "Konfirmasi Status", message: `Apakah Anda yakin ingin ${act} challenge "${c.nama_challenge}"?`, isDestructive: c.is_active,
      onConfirm: async () => { setConfirmConfig((p) => ({ ...p, isOpen: false })); try { await fetch(`${API}/admin/${c.challenge_id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ is_active: !c.is_active }) }); flash(c.is_active ? "Challenge dinonaktifkan" : "Challenge diaktifkan"); await fetchAll(); } catch { flash("Gagal update status", "err"); } } });
  };

  const handleReset = () => {
    setConfirmConfig({ isOpen: true, title: "Reset Daily Challenges", message: "Apakah Anda yakin ingin reset daily challenges hari ini? Challenge baru akan dipilih ulang secara otomatis (permanent + random). Reset hanya bisa dilakukan jika tidak ada user yang sedang berproses.", isDestructive: true,
      onConfirm: async () => { setConfirmConfig((p) => ({ ...p, isOpen: false })); try { const res = await fetch(`${API}/admin/reset-today`, { method: "DELETE", headers: hdrs() }); const d = await res.json(); if (!res.ok) throw new Error(d.message); flash(d.message); await fetchAll(); } catch (e: any) { flash(e.message || "Gagal reset", "err"); } } });
  };

  const activeChallenges = challenges.filter((c) => c.is_active);
  const todayIds = new Set(todayChallenges.map((t) => t.challenge_id));

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      {toast && (<div className={`fixed right-6 top-20 z-[60] flex items-center gap-2 rounded-xl px-5 py-3 font-quicksand text-sm font-semibold shadow-lg ${toast.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{toast.type === "ok" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{toast.msg}</div>)}

      {/* Today's Challenges */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 mb-4">
          <Calendar size={22} />
          <h2 className="font-nunito text-xl font-extrabold">Challenge Hari Ini</h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-quicksand text-emerald-600">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            {todayChallenges.length > 0 && (
              <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>
        {todayChallenges.length > 0 ? (
          <div className="space-y-3">
            {todayChallenges.map((tc) => {
              const info = getTypeInfo(tc.challenge_type);
              const Icon = info.icon;
              return (
                <div key={tc.challenge_of_the_day_id} className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${info.color}`}><Icon size={20} /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-nunito font-bold text-gray-900">{tc.nama_challenge}</p>
                        {tc.is_permanent && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"><Pin size={10} />Permanen</span>}
                      </div>
                      <p className="font-quicksand text-xs text-gray-500">{tc.deskripsi}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700"><Zap size={14} />{tc.poin_hadiah} pts</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-quicksand text-gray-500">Belum ada challenge untuk hari ini. Challenge akan otomatis terpilih saat user pertama kali mengakses (permanent + random).</p>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">Daily Challenges</h1>
          <p className="mt-1 font-quicksand text-gray-500">{challenges.length} total · {activeChallenges.length} aktif · {challenges.filter((c) => c.is_permanent).length} permanen</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"><Plus size={20} />Tambah Challenge</button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-quicksand">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Challenge</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Poin</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {challenges.map((c) => {
                const info = getTypeInfo(c.challenge_type);
                const Icon = info.icon;
                const isToday = todayIds.has(c.challenge_id);
                return (
                  <tr key={c.challenge_id} className={`transition-colors ${isToday ? "bg-emerald-50/50" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 max-w-[260px]">
                      <div className="flex items-center gap-2">
                        {isToday && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{c.nama_challenge}</p>
                            {c.is_permanent && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"><Pin size={10} />Permanen</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{c.deskripsi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${info.color}`}><Icon size={14} />{info.label}</span></td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{c.poin_hadiah}</td>
                    <td className="px-6 py-4">{c.target_count}x</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(c)} title={c.is_active ? "Nonaktifkan" : "Aktifkan"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${c.is_active ? "bg-emerald-500" : "bg-gray-200"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.is_active ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        <span className={`text-xs font-semibold ${c.is_active ? "text-emerald-600" : "text-gray-500"}`}>{c.is_active ? "Aktif" : "Nonaktif"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.challenge_id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {challenges.length === 0 && (<tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Belum ada challenge. Klik &quot;Tambah Challenge&quot; untuk memulai!</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-nunito text-2xl font-extrabold text-gray-900">{isEditing ? "Edit Challenge" : "Tambah Challenge Baru"}</h2>
            </div>
            {showPresets && !isEditing && (
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                <p className="font-quicksand text-sm font-semibold text-gray-600 mb-3">⚡ Template Cepat</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p, i) => { const info = getTypeInfo(p.type); const Icon = info.icon; return (
                    <button key={i} onClick={() => applyPreset(p)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-xs transition-all hover:border-emerald-400 hover:shadow-sm">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${info.color} flex-shrink-0`}><Icon size={16} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1"><p className="font-semibold text-gray-800 truncate">{p.nama}</p>{p.perm && <Pin size={10} className="text-amber-500 flex-shrink-0" />}</div>
                        <p className="text-gray-500 truncate">{p.poin} pts · {p.target}x</p>
                      </div>
                    </button>
                  ); })}
                </div>
                <button onClick={() => setShowPresets(false)} className="mt-3 text-xs text-emerald-600 font-semibold hover:underline">Atau buat manual ↓</button>
              </div>
            )}
            <div className="space-y-4 px-6 py-5 font-quicksand">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Challenge</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHALLENGE_TYPES.map((t) => { const Icon = t.icon; const sel = form.challenge_type === t.value; return (
                    <button key={t.value} onClick={() => setForm((f) => ({ ...f, challenge_type: t.value }))}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-xs transition-all ${sel ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon size={20} className={sel ? "text-emerald-600" : "text-gray-400"} />
                      <span className={`font-semibold ${sel ? "text-emerald-700" : "text-gray-600"}`}>{t.label}</span>
                    </button>
                  ); })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Challenge</label>
                <input type="text" value={form.nama_challenge} onChange={(e) => setForm((f) => ({ ...f, nama_challenge: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Lapor 3 Sampah Hari Ini" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 min-h-[80px]" placeholder="Jelaskan apa yang harus dilakukan user..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Poin Hadiah</label>
                  <input type="number" min={0} value={form.poin_hadiah} onChange={(e) => setForm((f) => ({ ...f, poin_hadiah: parseInt(e.target.value) || 0 }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Count</label>
                  <input type="number" min={1} value={form.target_count} onChange={(e) => setForm((f) => ({ ...f, target_count: parseInt(e.target.value) || 1 }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Aktif</p>
                    <p className="text-xs text-gray-500">Bisa dipilih sebagai daily challenge</p>
                  </div>
                  <button onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Pin size={14} className="text-amber-500" />
                      <p className="text-sm font-semibold text-gray-700">Permanen</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Selalu muncul setiap hari (tidak dirandom)</p>
                  </div>
                  <button onClick={() => setForm((f) => ({ ...f, is_permanent: !f.is_permanent }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_permanent ? "bg-amber-500" : "bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_permanent ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
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
