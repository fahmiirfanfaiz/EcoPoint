"use client";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import { getBearerToken } from "@/lib/auth";
import { MapPin } from "lucide-react";

type Category =
  | "organik"
  | "anorganik"
  | "bahan berbahaya dan beracun"
  | "kertas"
  | "residu yang dibungkus"
  | null;

interface CategoryOption {
  id: Category;
  label: string;
  description: string;
  emoji: string;
  iconBg: string;
}

const categories: CategoryOption[] = [
  {
    id: "organik",
    label: "Organik",
    description: "Sisa makanan, kulit buah, daun",
    emoji: "🍎",
    iconBg: "bg-emerald-100",
  },
  {
    id: "anorganik",
    label: "Anorganik",
    description: "Plastik, kaleng, botol, kemasan",
    emoji: "♻️",
    iconBg: "bg-sky-100",
  },
  {
    id: "bahan berbahaya dan beracun",
    label: "B3",
    description: "Baterai, obat, cairan kimia, lampu",
    emoji: "☣️",
    iconBg: "bg-rose-100",
  },
  {
    id: "kertas",
    label: "Kertas",
    description: "Kardus, kertas tulis, koran",
    emoji: "📄",
    iconBg: "bg-amber-100",
  },
  {
    id: "residu yang dibungkus",
    label: "Residu",
    description: "Sampah campuran yang sudah dibungkus",
    emoji: "🗑️",
    iconBg: "bg-stone-100",
  },
];

interface ClassifyResult {
  category: Category;
  confidence: number;
  explanation: string;
}

interface VerifyResult {
  status: string;
  confidence: number;
  explanation: string;
  reward_eligible: boolean;
  before_description?: string;
  after_description?: string;
}

const getAuthHeader = () => {
  const bearer = getBearerToken();
  if (!bearer) {
    throw new Error("Silakan login ulang untuk mengirim laporan.");
  }
  return bearer;
};

/* ─── Upload Card ─── */
const UploadCard = ({
  label,
  stepNumber,
  imageUrl,
  onClick,
  onDrop,
  onDragLeave,
  onDragOver,
  isDragging,
  disabled,
}: {
  label: string;
  stepNumber: number;
  imageUrl: string | null;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  isDragging: boolean;
  disabled?: boolean;
}) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onDrop={disabled ? undefined : onDrop}
      onDragOver={disabled ? undefined : onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl
        transition-all duration-300 select-none overflow-hidden
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
        ${isDragging ? "ring-2 ring-emerald-400 ring-offset-2 bg-emerald-50" : "bg-gray-50/80 border border-gray-200/60"}
        ${imageUrl ? "p-2" : "p-6"}
        min-h-[200px]
      `}
    >
      {/* Step Number Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm ${
          imageUrl ? "bg-white/90 text-gray-700 backdrop-blur-sm" : "bg-emerald-100 text-emerald-700"
        }`}>
          {stepNumber}. {label}
        </span>
      </div>

      {imageUrl ? (
        <div className="w-full relative group">
          <Image
            src={imageUrl}
            alt={label}
            width={400}
            height={240}
            unoptimized
            className="w-full h-48 rounded-xl object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
            <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Ganti Foto
            </span>
          </div>
        </div>
      ) : (
        <>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: isDragging
                ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                : "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke={isDragging ? "#059669" : "#10b981"}
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>

          <div className="text-center px-4 mt-1">
            <p className="font-bold text-gray-700 text-sm">
              {isDragging ? "Lepaskan di sini" : "Klik atau Drag & Drop"}
            </p>
            <p className="text-gray-400 text-xs mt-1 leading-snug">
              Format: JPG, PNG, WebP
            </p>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
export default function WasteDetectionSection() {
  // Files (kept for submit)
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Preview URLs
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  // Drag states
  const [isDraggingBefore, setIsDraggingBefore] = useState(false);
  const [isDraggingAfter, setIsDraggingAfter] = useState(false);

  // AI results
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);

  // Location state
  const [lokasi, setLokasi] = useState("");

  // Loading & error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Refs
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  /* ── Helpers ── */
  const resetAll = () => {
    setBeforeFile(null);
    setAfterFile(null);
    setBeforeImage(null);
    setAfterImage(null);
    setClassifyResult(null);
    setVerifyResult(null);
    setSelectedCategory(null);
    setLokasi("");
    setAnalysisError(null);
    setVerificationError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const canSubmit =
    classifyResult !== null &&
    selectedCategory !== null &&
    beforeFile !== null &&
    afterFile !== null &&
    !isAnalyzing &&
    !isVerifying &&
    !isSubmitting &&
    !submitSuccess;

  /* ── Handle Before Image ── */
  const handleBeforeFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setBeforeFile(file);
    setBeforeImage(url);
    setClassifyResult(null);
    setSelectedCategory(null);
    setAnalysisError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    // Reset after state when before changes
    setAfterFile(null);
    setAfterImage(null);
    setVerifyResult(null);
    setVerificationError(null);

    setIsAnalyzing(true);
    const currentRequestId = ++requestIdRef.current;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/lapor-sampah/classify", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        result?: ClassifyResult;
        message?: string;
        detail?: string;
      } | null;

      if (currentRequestId !== requestIdRef.current) return;

      if (!response.ok || !payload?.result) {
        throw new Error(
          payload?.message ?? payload?.detail ?? "Gagal mengklasifikasikan gambar",
        );
      }

      setClassifyResult(payload.result);
      setSelectedCategory(payload.result.category);
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) return;
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Gagal mengklasifikasikan gambar",
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  /* ── Handle After Image ── */
  const handleAfterFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!beforeFile) return;

    const url = URL.createObjectURL(file);
    setAfterFile(file);
    setAfterImage(url);
    setVerifyResult(null);
    setVerificationError(null);
    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append("before_image", beforeFile);
      formData.append("after_image", file);

      const response = await fetch("/api/lapor-sampah/verify-cleanup", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        result?: VerifyResult;
        message?: string;
        detail?: string;
      } | null;

      if (!response.ok || !payload?.result) {
        throw new Error(
          payload?.message ?? payload?.detail ?? "Gagal memverifikasi kebersihan",
        );
      }

      setVerifyResult(payload.result);
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Gagal memverifikasi kebersihan",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /* ── Submit Report ── */
  const handleSubmit = async () => {
    if (!canSubmit || !beforeFile || !afterFile || !selectedCategory) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("before_image", beforeFile);
      formData.append("after_image", afterFile);
      formData.append("kategori_user", selectedCategory);
      if (classifyResult?.category) {
        formData.append("kategori_ai", classifyResult.category);
      }
      // Send AI analysis results for admin review
      if (classifyResult) {
        formData.append("classify_result", JSON.stringify(classifyResult));
      }
      if (verifyResult) {
        formData.append("verify_result", JSON.stringify(verifyResult));
      }
      // Send optional location
      if (lokasi.trim()) {
        formData.append("lokasi", lokasi.trim());
      }

      const response = await fetch("/api/lapor-sampah/submit", {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.message ?? "Gagal mengirim laporan",
        );
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal mengirim laporan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Drag & drop ── */
  const handleBeforeDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingBefore(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleBeforeFile(file);
  };

  const handleAfterDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingAfter(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleAfterFile(file);
  };

  const handleBeforeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleBeforeFile(file);
  };

  const handleAfterInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleAfterFile(file);
  };

  /* ── Success screen ── */
  if (submitSuccess) {
    return (
      <div className="w-full max-w-5xl mx-auto" style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
              <circle cx="12" cy="12" r="10" fill="#22c55e" />
              <path
                d="M7.5 12.5l3 3 6-6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            Laporan Terkirim! 🎉
          </h2>
          <p className="text-gray-500 mb-3 max-w-md mx-auto">
            Laporan kamu sedang menunggu validasi admin. Poin akan ditambahkan setelah laporan disetujui.
          </p>
          <div className="flex flex-col items-center">
          <div className="inline-flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700 max-w-sm mx-auto mb-6 text-left">
            <span className="text-base">⏱️</span>
            <span>
              <strong>Fallback otomatis:</strong> Jika admin belum merespons dalam{" "}
              <strong>24 jam</strong>, sistem akan otomatis memverifikasi laporan
              berdasarkan hasil analisis AI.
            </span>
          </div>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
            }}
          >
            Kirim Laporan Baru
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto" style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* ── LEFT COLUMN: Upload & Results ── */}
          <div className="flex-1 p-6 flex flex-col gap-4">
                {/* Before Image */}
                <UploadCard
                  label="Upload foto sampah"
                  stepNumber={1}
                  imageUrl={beforeImage}
                  onClick={() => beforeInputRef.current?.click()}
                  onDrop={handleBeforeDrop}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingBefore(true);
                  }}
                  onDragLeave={() => setIsDraggingBefore(false)}
                  isDragging={isDraggingBefore}
                />
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleBeforeInput}
                />

                {/* Classify status messages */}
                {isAnalyzing && (
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700 flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
                    AI sedang mengklasifikasikan gambar...
                  </div>
                )}
                {analysisError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {analysisError}
                  </div>
                )}
                {classifyResult && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      Hasil klasifikasi AI: {classifyResult.category}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Confidence: {Math.round(classifyResult.confidence * 100)}%
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {classifyResult.explanation}
                    </p>
                  </div>
                )}

                {/* After Image — shown once classify is done */}
                {classifyResult && (
                  <>
                    <UploadCard
                      label="Upload foto setelah dibersihkan"
                      stepNumber={2}
                      imageUrl={afterImage}
                      onClick={() => afterInputRef.current?.click()}
                      onDrop={handleAfterDrop}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDraggingAfter(true);
                      }}
                      onDragLeave={() => setIsDraggingAfter(false)}
                      isDragging={isDraggingAfter}
                    />
                    <input
                      ref={afterInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAfterInput}
                    />
                  </>
                )}

                {/* Verify status messages */}
                {isVerifying && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700 flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
                    AI sedang memverifikasi kebersihan before vs after...
                  </div>
                )}
                {verificationError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {verificationError}
                  </div>
                )}
                {verifyResult && (
                  <div
                    className={`rounded-2xl border p-4 ${
                      verifyResult.reward_eligible
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-800">
                      Status verifikasi: {verifyResult.status}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confidence: {Math.round(verifyResult.confidence * 100)}%
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      {verifyResult.explanation}
                    </p>
                    <p
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        verifyResult.reward_eligible
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {verifyResult.reward_eligible
                        ? "Reward Eligible ✓"
                        : "Not Eligible"}
                    </p>
                  </div>
                )}

                {/* Submit error */}
                {submitError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {submitError}
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="hidden lg:block w-px bg-gray-100" />

              {/* ── RIGHT COLUMN: Category Selection ── */}
              <div className="flex-1 p-6 flex flex-col gap-4 border-t lg:border-t-0 border-gray-100">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800">
                    Konfirmasi Kategori
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {classifyResult
                      ? "Kategori dipilih oleh AI. Koreksi jika salah."
                      : "Upload foto sampah terlebih dahulu."}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const isDisabled = !classifyResult;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => !isDisabled && setSelectedCategory(cat.id)}
                        disabled={isDisabled}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-2xl text-left
                          transition-all duration-200 border-2
                          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                          ${
                            isSelected
                              ? "border-green-400 bg-green-50 shadow-sm"
                              : "border-transparent bg-white hover:bg-gray-100"
                          }
                        `}
                      >
                        <div
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                            ${cat.iconBg}
                          `}
                        >
                          {cat.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">
                            {cat.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {cat.description}
                          </p>
                        </div>

                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            transition-all duration-200
                            ${isSelected ? "border-green-500" : "border-gray-300"}
                          `}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Location Input ── */}
                <div className="mt-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Lokasi Sampah
                    <span className="ml-1.5 text-[11px] font-normal text-gray-400">(opsional)</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      placeholder="Contoh: Komplek Fakultas Teknik UGM, Jl. Grafika No.2, Yogyakarta, Sendowo, Sinduadi, Kec. Mlati, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55281"
                      maxLength={200}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* ── Submit Button (integrated) ── */}
                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`
                      w-full flex items-center justify-center gap-2 font-extrabold text-white rounded-xl
                      transition-all duration-200
                      ${canSubmit ? "hover:opacity-90 active:scale-95" : "opacity-50 cursor-not-allowed"}
                    `}
                    style={{
                      background: canSubmit
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : "#9ca3af",
                      boxShadow: canSubmit
                        ? "0 4px 14px rgba(34,197,94,0.35)"
                        : "none",
                      padding: "14px 24px",
                      fontSize: "15px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Laporan
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  {!classifyResult && !isAnalyzing && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Upload foto sampah untuk mengaktifkan tombol kirim.
                    </p>
                  )}
                  {classifyResult && !afterFile && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Upload foto setelah dibersihkan untuk melanjutkan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
