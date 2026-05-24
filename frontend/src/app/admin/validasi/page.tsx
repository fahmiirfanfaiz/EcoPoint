"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  ImageIcon,
  Bot,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_BASE_URL, getBearerToken } from "@/lib/auth";

interface WasteReport {
  report_id: number;
  user_id: string;
  foto_url: string;
  kategori_user: string;
  kategori_ai: string | null;
  status_validasi: string;
  poin_didapat: number;
  created_at: string;
  user: {
    user_id: string;
    nama: string;
    nim: string;
    email: string;
    fakultas: string;
    profile_pic: number;
  };
}

interface ParsedFotoUrl {
  before?: string;
  after?: string;
  classify_result?: {
    category?: string;
    confidence?: number;
    explanation?: string;
  };
  verify_result?: {
    status?: string;
    confidence?: number;
    explanation?: string;
    reward_eligible?: boolean;
    before_description?: string;
    after_description?: string;
  };
}

/**
 * Extract the storage object path from a Supabase Storage URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/AI-Service/reports/..." → "reports/..."
 */
const extractStoragePath = (url: string): string | null => {
  if (!url) return null;

  const markers = [
    "/storage/v1/object/public/AI-Service/",
    "/storage/v1/object/AI-Service/",
  ];

  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx >= 0) return url.slice(idx + marker.length);
  }

  // Already a plain path like "reports/..."
  if (url.startsWith("reports/")) return url;

  return null;
};

const parseFotoUrl = (fotoUrl: string): ParsedFotoUrl => {
  try {
    const parsed = JSON.parse(fotoUrl) as ParsedFotoUrl & { before?: string; after?: string };
    return {
      before: parsed.before ? extractStoragePath(parsed.before) ?? undefined : undefined,
      after: parsed.after ? extractStoragePath(parsed.after) ?? undefined : undefined,
      classify_result: parsed.classify_result ?? undefined,
      verify_result: parsed.verify_result ?? undefined,
    };
  } catch {
    const path = fotoUrl ? extractStoragePath(fotoUrl) : null;
    return { before: path ?? undefined };
  }
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Menunggu",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock size={14} className="text-amber-500" />,
  },
  approved: {
    label: "Disetujui",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  rejected: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle size={14} className="text-red-500" />,
  },
};

const getStatusDisplay = (status: string) => {
  const normalized = status.replace(/'/g, "");
  return (
    statusConfig[normalized] ?? {
      label: normalized,
      color: "text-gray-700",
      bg: "bg-gray-50 border-gray-200",
      icon: <Clock size={14} className="text-gray-500" />,
    }
  );
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const categoryLabel: Record<string, string> = {
  organik: "Organik",
  anorganik: "Anorganik",
  "bahan berbahaya dan beracun": "B3",
  kertas: "Kertas",
  "residu yang dibungkus": "Residu",
};

/** Component that loads an image via a server-generated signed URL */
function SignedImage({
  storagePath,
  alt,
  getSignedUrl,
}: {
  storagePath: string;
  alt: string;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    getSignedUrl(storagePath).then((signedUrl) => {
      if (cancelled) return;
      if (signedUrl) {
        setUrl(signedUrl);
      } else {
        setFailed(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [storagePath, getSignedUrl]);

  if (loading) {
    return (
      <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (failed || !url) {
    return (
      <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
        <ImageIcon size={32} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function AdminValidasiPage() {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [poinOverrides, setPoinOverrides] = useState<Record<number, string>>({});
  const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});

  /** Fetch a signed URL for a storage object path */
  const getSignedUrl = useCallback(async (path: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/lapor-sampah/image?path=${encodeURIComponent(path)}`);
      const data = (await res.json()) as { ok?: boolean; signedUrl?: string };
      return data.signedUrl ?? null;
    } catch {
      return null;
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getBearerToken();
      if (!token) throw new Error("Unauthorized");

      const url = filter
        ? `${API_BASE_URL}/admin/waste-reports?status=${filter}`
        : `${API_BASE_URL}/admin/waste-reports`;

      const response = await fetch(url, {
        headers: { Authorization: token },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          (payload as { message?: string })?.message ?? "Gagal memuat data",
        );
      }

      const data = (await response.json()) as { reports: WasteReport[] };
      setReports(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleAction = async (reportId: number, action: "approve" | "reject") => {
    setActionLoading(reportId);
    try {
      const token = getBearerToken();
      if (!token) throw new Error("Unauthorized");

      // Build request body — include custom poin if approving
      const body: Record<string, unknown> = {};
      if (action === "approve") {
        const overrideVal = poinOverrides[reportId];
        if (overrideVal !== undefined && overrideVal !== "") {
          const parsed = parseInt(overrideVal, 10);
          if (!Number.isNaN(parsed) && parsed > 0) {
            body.poin = parsed;
          }
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/waste-reports/${reportId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          (payload as { message?: string })?.message ?? `Gagal ${action} laporan`,
        );
      }

      // Refresh list
      await fetchReports();
      setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : `Gagal ${action} laporan`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-nunito text-3xl font-extrabold text-gray-900">
            Validasi Laporan
          </h1>
          <p className="mt-1 text-gray-500 font-quicksand">
            Review dan validasi laporan sampah dari pengguna.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {["pending", "approved", "rejected", ""].map((f) => {
            const label = f === "" ? "Semua" : getStatusDisplay(f).label;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CheckCircle size={48} className="mb-3" />
          <p className="font-nunito text-lg font-bold">
            Tidak ada laporan {filter ? getStatusDisplay(filter).label.toLowerCase() : ""}
          </p>
        </div>
      )}

      {/* Report List */}
      {!isLoading && !error && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((report) => {
            const isExpanded = expandedId === report.report_id;
            const status = getStatusDisplay(report.status_validasi);
            const photos = parseFotoUrl(report.foto_url);

            return (
              <div
                key={report.report_id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Row */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : report.report_id)
                  }
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* User avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {report.user.nama.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-bold text-gray-900 text-sm truncate">
                      {report.user.nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.user.nim} • {formatDate(report.created_at)}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {categoryLabel[report.kategori_user] ?? report.kategori_user}
                    </span>
                  </div>

                  {/* Status */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </div>

                  {/* Points */}
                  <span className="text-sm font-bold text-emerald-600 shrink-0">
                    +{report.poin_didapat}
                  </span>

                  {/* Expand */}
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Before Image */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Foto Sebelum
                        </p>
                        {photos.before ? (
                          <SignedImage storagePath={photos.before} alt="Before" getSignedUrl={getSignedUrl} />
                        ) : (
                          <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>

                      {/* After Image */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Foto Sesudah
                        </p>
                        {photos.after ? (
                          <SignedImage storagePath={photos.after} alt="After" getSignedUrl={getSignedUrl} />
                        ) : (
                          <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detail info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500">Kategori User</p>
                        <p className="font-bold text-sm text-gray-800">
                          {categoryLabel[report.kategori_user] ?? report.kategori_user}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kategori AI</p>
                        <p className="font-bold text-sm text-gray-800">
                          {report.kategori_ai
                            ? categoryLabel[report.kategori_ai] ?? report.kategori_ai
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fakultas</p>
                        <p className="font-bold text-sm text-gray-800">
                          {report.user.fakultas || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Poin Default</p>
                        <p className="font-bold text-sm text-emerald-600">
                          +{report.poin_didapat}
                        </p>
                      </div>
                    </div>

                    {/* AI Analysis Collapsible */}
                    {(photos.classify_result || photos.verify_result) && (
                      <div className="mb-6">
                        <button
                          onClick={() =>
                            setShowAiAnalysis((prev) => ({
                              ...prev,
                              [report.report_id]: !prev[report.report_id],
                            }))
                          }
                          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          <Bot size={16} />
                          Hasil Analisis AI
                          {showAiAnalysis[report.report_id] ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>

                        {showAiAnalysis[report.report_id] && (
                          <div className="mt-3 space-y-3">
                            {/* Classify Result */}
                            {photos.classify_result && (
                              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                                  Klasifikasi Sampah
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Kategori</p>
                                    <p className="font-bold text-gray-800">
                                      {categoryLabel[photos.classify_result.category ?? ""] ?? photos.classify_result.category ?? "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Confidence</p>
                                    <p className="font-bold text-gray-800">
                                      {photos.classify_result.confidence
                                        ? `${Math.round(photos.classify_result.confidence * 100)}%`
                                        : "—"}
                                    </p>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <p className="text-xs text-gray-500">Penjelasan</p>
                                    <p className="text-gray-700 text-xs mt-0.5">
                                      {photos.classify_result.explanation ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Verify Result */}
                            {photos.verify_result && (
                              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
                                  Verifikasi Kebersihan
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <p className="font-bold text-gray-800">
                                      {photos.verify_result.status ?? "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Confidence</p>
                                    <p className="font-bold text-gray-800">
                                      {photos.verify_result.confidence
                                        ? `${Math.round(photos.verify_result.confidence * 100)}%`
                                        : "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Reward Eligible</p>
                                    <p className={`font-bold text-sm ${photos.verify_result.reward_eligible ? "text-emerald-600" : "text-red-600"}`}>
                                      {photos.verify_result.reward_eligible ? "Ya ✓" : "Tidak ✗"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Penjelasan</p>
                                    <p className="text-gray-700 text-xs mt-0.5">
                                      {photos.verify_result.explanation ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons (only for pending) */}
                    {report.status_validasi.replace(/'/g, "") === "pending" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Editable Poin */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                            Poin:
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={poinOverrides[report.report_id] ?? report.poin_didapat.toString()}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || parseInt(val, 10) >= 0) {
                                setPoinOverrides((prev) => ({
                                  ...prev,
                                  [report.report_id]: val,
                                }));
                              }
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (e.target.value === "" || Number.isNaN(val) || val <= 0) {
                                setPoinOverrides((prev) => ({
                                  ...prev,
                                  [report.report_id]: Math.max(1, report.poin_didapat).toString(),
                                }));
                              }
                            }}
                            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleAction(report.report_id, "approve")
                            }
                            disabled={actionLoading === report.report_id}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50 shadow-md shadow-emerald-200"
                          >
                            {actionLoading === report.report_id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(report.report_id, "reject")
                            }
                            disabled={actionLoading === report.report_id}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50 shadow-md shadow-red-200"
                          >
                            {actionLoading === report.report_id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
