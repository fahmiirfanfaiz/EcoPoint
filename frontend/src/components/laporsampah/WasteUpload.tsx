"use client";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import { getBearerToken } from "@/lib/auth";

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
        transition-all duration-200 select-none p-4
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isDragging ? "bg-white border-2 border-emerald-400 border-dashed" : "bg-gray-50 border-2 border-transparent"}
        min-h-56
      `}
      style={{
        background: isDragging
          ? undefined
          : "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
      }}
    >
      <p className="text-sm font-bold text-gray-700">
        {stepNumber}. {label}
      </p>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={label}
          width={400}
          height={240}
          unoptimized
          className="max-h-40 max-w-full rounded-xl object-cover"
          style={{ width: "auto", height: "auto" }}
        />
      ) : (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(186,230,253,0.5)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="7" cy="7" r="4" fill="#38bdf8" opacity="0.3" />
              <text x="5" y="10" fontSize="7" fill="#0ea5e9" fontWeight="bold">
                +
              </text>
              <rect x="3" y="9" width="18" height="12" rx="3" fill="#38bdf8" />
              <circle cx="12" cy="15" r="3.5" fill="white" />
              <circle cx="12" cy="15" r="2" fill="#38bdf8" />
              <path
                d="M8 9V7.5A1.5 1.5 0 0 1 9.5 6h1A1.5 1.5 0 0 1 12 7.5V9"
                fill="#0ea5e9"
              />
            </svg>
          </div>

          <div className="text-center px-4">
            <p className="font-bold text-gray-800 text-base">
              Ambil Foto atau Upload
            </p>
            <p className="text-gray-500 text-sm mt-1 leading-snug">
              Drag &amp; drop foto sampahmu di sini. Format: JPG, PNG.
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
      <div className="min-h-[50vh] flex items-center justify-center p-4 font-sans">
        <div
          className="w-full max-w-lg text-center"
          style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
        >
          <div className="rounded-3xl bg-white shadow-lg shadow-emerald-100/50 p-10">
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
              Laporan Terkirim!
            </h2>
            <p className="text-gray-500 mb-6">
              Laporan kamu sedang menunggu validasi admin. Poin akan ditambahkan setelah laporan diapprove.
            </p>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
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
    <div className="min-h-[50vh] flex items-center justify-center p-4 font-sans">
      <div
        className="w-full max-w-5xl"
        style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
      >
        <div className="p-1">
          <div className="rounded-2xl">
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

              {/* ── RIGHT COLUMN: Category Selection ── */}
              <div className="flex-1 p-6 flex flex-col gap-4">
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
      </div>
    </div>
  );
}
