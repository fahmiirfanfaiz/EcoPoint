"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStoredAuth, getBearerToken } from "@/lib/auth";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  Bot,
  FileCheck,
  MapPin,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

interface ReportData {
  report_id: number;
  foto_url: string;
  kategori_user: string;
  kategori_ai: string | null;
  status_validasi: string;
  poin_didapat: number;
  created_at: string;
}

interface FotoData {
  before?: string;
  after?: string;
  classify_result?: {
    category: string;
    confidence: number;
    explanation: string;
  };
  verify_result?: {
    status: string;
    confidence: number;
    explanation: string;
    reward_eligible: boolean;
    before_description?: string;
    after_description?: string;
  };
}

/* ── SignedImage: loads image via signed URL from our API proxy ── */
function SignedImage({
  storagePath,
  alt,
  className,
}: {
  storagePath: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!storagePath) return;

    // Extract the object path from the full Supabase URL
    const match = storagePath.match(/\/storage\/v1\/object\/AI-Service\/(.+)/);
    const objectPath = match?.[1] ?? storagePath;

    fetch(`/api/lapor-sampah/image?path=${encodeURIComponent(objectPath)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.signedUrl) setSrc(d.signedUrl);
        else setErr(true);
      })
      .catch(() => setErr(true));
  }, [storagePath]);

  if (err)
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-xl ${className}`}
      >
        <Camera size={20} />
      </div>
    );

  if (!src)
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-500" />
      </div>
    );

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover rounded-xl ${className}`}
    />
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode; label: string }
  > = {
    pending: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: <Hourglass size={14} />,
      label: "Menunggu Validasi",
    },
    approved: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      icon: <CheckCircle2 size={14} />,
      label: "Disetujui",
    },
    rejected: {
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-700",
      icon: <XCircle size={14} />,
      label: "Ditolak",
    },
  };

  // Normalize the status (strip quotes from DB default)
  const normalizedStatus = status.replace(/'/g, "").trim();
  const c = config[normalizedStatus] ?? config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${c.bg} ${c.text}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

/* ── Category Emoji Map ── */
const categoryEmoji: Record<string, string> = {
  organik: "🍎",
  anorganik: "♻️",
  "bahan berbahaya dan beracun": "☣️",
  kertas: "📄",
  "residu yang dibungkus": "🗑️",
};

/* ── Time Ago ── */
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Report Detail Card (Expanded View) ── */
function ReportDetail({ report }: { report: ReportData }) {
  let fotoData: FotoData = {};
  try {
    fotoData = JSON.parse(report.foto_url);
  } catch {
    // foto_url is not JSON
  }

  const normalizedStatus = report.status_validasi.replace(/'/g, "").trim();

  // Timeline steps
  const steps = [
    {
      label: "Laporan Dikirim",
      done: true,
      icon: <Camera size={16} />,
      desc: new Date(report.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
    {
      label: "Analisis AI",
      done: !!fotoData.classify_result,
      icon: <Bot size={16} />,
      desc: fotoData.classify_result
        ? `${fotoData.classify_result.category} (${Math.round(fotoData.classify_result.confidence * 100)}%)`
        : "Belum ada",
    },
    {
      label: "Verifikasi Kebersihan",
      done: !!fotoData.verify_result,
      icon: <FileCheck size={16} />,
      desc: fotoData.verify_result
        ? `${fotoData.verify_result.status} (${Math.round(fotoData.verify_result.confidence * 100)}%)`
        : "Belum ada",
    },
    {
      label: "Validasi Admin",
      done: normalizedStatus === "approved" || normalizedStatus === "rejected",
      icon: <CheckCircle2 size={16} />,
      desc:
        normalizedStatus === "approved"
          ? `Disetujui (+${report.poin_didapat} Poin)`
          : normalizedStatus === "rejected"
            ? "Ditolak"
            : "Menunggu...",
    },
  ];

  return (
    <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* ── Images ── */}
      {(fotoData.before || fotoData.after) && (
        <div className="grid grid-cols-2 gap-3">
          {fotoData.before && (
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Sebelum
              </p>
              <SignedImage
                storagePath={fotoData.before}
                alt="Before"
                className="w-full h-36 sm:h-44"
              />
            </div>
          )}
          {fotoData.after && (
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Sesudah
              </p>
              <SignedImage
                storagePath={fotoData.after}
                alt="After"
                className="w-full h-36 sm:h-44"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Timeline ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
          Status Laporan
        </p>
        <div className="relative pl-6 space-y-3">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-gray-200" />

          {steps.map((step, i) => (
            <div key={i} className="relative flex items-start gap-3">
              {/* Dot */}
              <div
                className={`absolute left-[-24px] mt-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 ${
                  step.done
                    ? normalizedStatus === "rejected" && i === steps.length - 1
                      ? "bg-rose-500 text-white"
                      : "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold ${step.done ? "text-gray-800" : "text-gray-400"}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Analysis Results ── */}
      {fotoData.classify_result && (
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100">
              <Bot size={16} className="text-sky-600" />
            </div>
            <p className="text-sm font-bold text-sky-800">
              Hasil Klasifikasi AI
            </p>
          </div>
          <div className="space-y-1.5 text-xs text-sky-700">
            <p>
              <span className="font-semibold">Kategori:</span>{" "}
              {categoryEmoji[fotoData.classify_result.category] ?? ""}{" "}
              {fotoData.classify_result.category}
            </p>
            <p>
              <span className="font-semibold">Confidence:</span>{" "}
              {Math.round(fotoData.classify_result.confidence * 100)}%
            </p>
            <p className="text-sky-600 leading-relaxed">
              {fotoData.classify_result.explanation}
            </p>
          </div>
        </div>
      )}

      {fotoData.verify_result && (
        <div
          className={`rounded-2xl border p-4 ${
            fotoData.verify_result.reward_eligible
              ? "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white"
              : "border-gray-100 bg-gradient-to-br from-gray-50 to-white"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                fotoData.verify_result.reward_eligible
                  ? "bg-emerald-100"
                  : "bg-gray-100"
              }`}
            >
              <FileCheck
                size={16}
                className={
                  fotoData.verify_result.reward_eligible
                    ? "text-emerald-600"
                    : "text-gray-500"
                }
              />
            </div>
            <p
              className={`text-sm font-bold ${
                fotoData.verify_result.reward_eligible
                  ? "text-emerald-800"
                  : "text-gray-700"
              }`}
            >
              Hasil Verifikasi Kebersihan
            </p>
          </div>
          <div
            className={`space-y-1.5 text-xs ${
              fotoData.verify_result.reward_eligible
                ? "text-emerald-700"
                : "text-gray-600"
            }`}
          >
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {fotoData.verify_result.status}
            </p>
            <p>
              <span className="font-semibold">Confidence:</span>{" "}
              {Math.round(fotoData.verify_result.confidence * 100)}%
            </p>
            <p className="leading-relaxed opacity-80">
              {fotoData.verify_result.explanation}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                fotoData.verify_result.reward_eligible
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {fotoData.verify_result.reward_eligible ? (
                <>
                  <Sparkles size={12} /> Reward Eligible
                </>
              ) : (
                "Not Eligible"
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main History Component ── */
export default function ReportHistory() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bearer = getBearerToken();
      if (!bearer) {
        setReports([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/admin/waste-reports/my-reports`, {
        headers: { Authorization: bearer },
      });
      if (!res.ok) throw new Error("Gagal memuat riwayat");
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Listen for new submissions
  useEffect(() => {
    const handler = () => {
      setTimeout(fetchReports, 1000);
    };
    window.addEventListener("ecopoint-auth-changed", handler);
    return () => window.removeEventListener("ecopoint-auth-changed", handler);
  }, [fetchReports]);

  const auth = getStoredAuth();
  if (!auth) return null;

  const displayedReports = showAll ? reports : reports.slice(0, 5);

  const pendingCount = reports.filter(
    (r) => r.status_validasi.replace(/'/g, "").trim() === "pending",
  ).length;
  const approvedCount = reports.filter(
    (r) => r.status_validasi.replace(/'/g, "").trim() === "approved",
  ).length;

  return (
    <div
      className="w-full max-w-5xl mx-auto"
      style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
    >
      <div className="bg-white rounded-3xl shadow-sm shadow-gray-100 overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100">
                <Clock size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-800 text-base">
                  Riwayat Laporan
                </h2>
                <p className="text-xs text-gray-400">
                  {reports.length} laporan total
                </p>
              </div>
            </div>

            {reports.length > 0 && (
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                    <Hourglass size={12} />
                    {pendingCount} pending
                  </span>
                )}
                {approvedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 size={12} />
                    {approvedCount} disetujui
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm text-gray-400">Memuat riwayat...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <p className="text-sm text-rose-500">{error}</p>
              <button
                onClick={fetchReports}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                <MapPin size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Belum ada riwayat laporan.
                <br />
                Mulai laporkan sampah pertamamu!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedReports.map((report) => {
                const isExpanded = expandedId === report.report_id;
                const normalizedStatus = report.status_validasi
                  .replace(/'/g, "")
                  .trim();

                return (
                  <div
                    key={report.report_id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isExpanded
                        ? "border-emerald-200 bg-white shadow-sm"
                        : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    {/* Row */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : report.report_id)
                      }
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                        {categoryEmoji[report.kategori_user] ?? "🗑️"}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800 truncate capitalize">
                            {report.kategori_user}
                          </p>
                          <StatusBadge status={report.status_validasi} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {timeAgo(report.created_at)}
                          {normalizedStatus === "approved" && (
                            <span className="text-emerald-600 font-bold ml-1.5">
                              +{report.poin_didapat} Poin
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Chevron */}
                      <div className="flex-shrink-0 text-gray-300">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-gray-100 pt-3">
                          <ReportDetail report={report} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show More / Less */}
              {reports.length > 5 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {showAll
                      ? "Tampilkan lebih sedikit"
                      : `Lihat semua (${reports.length} laporan)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
