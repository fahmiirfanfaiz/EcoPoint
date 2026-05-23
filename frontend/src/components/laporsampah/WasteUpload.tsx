"use client";
import {
  useEffect,
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
  bgColor: string;
  iconBg: string;
}

const categories: CategoryOption[] = [
  {
    id: "organik",
    label: "Organik",
    description: "Sisa makanan, kulit buah, daun",
    emoji: "🍎",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    id: "anorganik",
    label: "Anorganik",
    description: "Plastik, kaleng, botol, kemasan",
    emoji: "♻️",
    bgColor: "bg-sky-50",
    iconBg: "bg-sky-100",
  },
  {
    id: "bahan berbahaya dan beracun",
    label: "B3",
    description: "Baterai, obat, cairan kimia, lampu",
    emoji: "☣️",
    bgColor: "bg-rose-50",
    iconBg: "bg-rose-100",
  },
  {
    id: "kertas",
    label: "Kertas",
    description: "Kardus, kertas tulis, koran",
    emoji: "📄",
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-100",
  },
  {
    id: "residu yang dibungkus",
    label: "Residu",
    description: "Sampah campuran yang sudah dibungkus",
    emoji: "🗑️",
    bgColor: "bg-stone-50",
    iconBg: "bg-stone-100",
  },
];

interface DetectionResult {
  category: Category;
  confidence: number;
  explanation: string;
  imageUrl: string;
}

interface VerificationResult {
  status: string;
  confidence: number;
  explanation: string;
  rewardEligible: boolean;
}

const getAuthHeader = () => {
  const bearer = getBearerToken();

  if (!bearer) {
    throw new Error("Silakan login ulang untuk mengirim laporan.");
  }

  return bearer;
};

const DetectionCard = ({
  label,
  imageUrl,
  onClick,
  onDrop,
  onDragLeave,
  onDragOver,
  isDragging,
}: {
  label: string;
  imageUrl: string | null;
  onClick: () => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  isDragging: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer
        transition-all duration-200 select-none p-4
        ${isDragging ? "bg-white border-2 border-blue-400 border-dashed" : "bg-gray-50 border-2 border-transparent"}
        min-h-56
      `}
      style={{
        background: isDragging
          ? undefined
          : "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
      }}
    >
      <p className="text-sm font-bold text-gray-700">{label}</p>
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

export default function WasteDetectionSection() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isDraggingBefore, setIsDraggingBefore] = useState(false);
  const [isDraggingAfter, setIsDraggingAfter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [reportId, setReportId] = useState<string | null>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const beforePreviewUrlRef = useRef<string | null>(null);
  const afterPreviewUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (beforePreviewUrlRef.current) {
        URL.revokeObjectURL(beforePreviewUrlRef.current);
      }
      if (afterPreviewUrlRef.current) {
        URL.revokeObjectURL(afterPreviewUrlRef.current);
      }
    };
  }, []);

  const resetAfterState = () => {
    setAfterImage(null);
    setVerificationResult(null);
    setVerificationError(null);
    setReportId(null);

    if (afterPreviewUrlRef.current) {
      URL.revokeObjectURL(afterPreviewUrlRef.current);
      afterPreviewUrlRef.current = null;
    }
  };

  const handleBeforeFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    if (beforePreviewUrlRef.current) {
      URL.revokeObjectURL(beforePreviewUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    beforePreviewUrlRef.current = url;
    setBeforeImage(url);
    setDetectionResult(null);
    setSelectedCategory(null);
    setAnalysisError(null);
    setIsAnalyzing(true);
    resetAfterState();

    const currentRequestId = ++requestIdRef.current;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/lapor-sampah/classify", {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        report_id?: string;
        result?: {
          category: Category;
          confidence: number;
          explanation: string;
        };
        message?: string;
        detail?: string;
      } | null;

      if (currentRequestId !== requestIdRef.current) return;

      if (!response.ok || !payload?.result || !payload.report_id) {
        throw new Error(
          payload?.message ??
            payload?.detail ??
            "Gagal mengklasifikasikan gambar",
        );
      }

      const normalizedResult: DetectionResult = {
        category: payload.result.category,
        confidence: payload.result.confidence,
        explanation: payload.result.explanation,
        imageUrl: url,
      };

      setDetectionResult(normalizedResult);
      setSelectedCategory(normalizedResult.category);
      setReportId(payload.report_id);
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

  const handleAfterFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!reportId) {
      setVerificationError(
        "Lakukan klasifikasi gambar before terlebih dahulu.",
      );
      return;
    }

    if (afterPreviewUrlRef.current) {
      URL.revokeObjectURL(afterPreviewUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    afterPreviewUrlRef.current = url;
    setAfterImage(url);
    setVerificationResult(null);
    setVerificationError(null);
    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append("report_id", reportId);
      formData.append("after_image", file);

      const response = await fetch("/api/lapor-sampah/verify-cleanup", {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        result?: {
          status?: string;
          confidence?: number;
          explanation?: string;
          reward_eligible?: boolean;
        };
        message?: string;
        detail?: string;
      } | null;

      if (!response.ok || !payload?.result) {
        throw new Error(
          payload?.message ??
            payload?.detail ??
            "Gagal memverifikasi kebersihan",
        );
      }

      setVerificationResult({
        status: payload.result.status ?? "unknown",
        confidence: payload.result.confidence ?? 0,
        explanation: payload.result.explanation ?? "",
        rewardEligible: Boolean(payload.result.reward_eligible),
      });
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

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 font-sans">
      <div
        className="w-full max-w-5xl"
        style={{
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        }}
      >
        <div className="p-1">
          <div className="rounded-2xl">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 flex flex-col gap-4">
                <DetectionCard
                  label="1. Upload foto sampah sebelum dibersihkan"
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

                {reportId && (
                  <>
                    <DetectionCard
                      label="2. Upload foto sesudah dibersihkan"
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

                {analysisError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {analysisError}
                  </div>
                )}

                {isAnalyzing && (
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700">
                    AI sedang mengklasifikasikan gambar before.
                  </div>
                )}

                {detectionResult && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      Hasil klasifikasi: {detectionResult.category}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Confidence: {Math.round(detectionResult.confidence * 100)}
                      %
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {detectionResult.explanation}
                    </p>
                  </div>
                )}

                {verificationError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {verificationError}
                  </div>
                )}

                {isVerifying && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
                    AI sedang memverifikasi kebersihan before vs after.
                  </div>
                )}

                {verificationResult && (
                  <div
                    className={`rounded-2xl border p-4 ${
                      verificationResult.rewardEligible
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-800">
                      Status verifikasi: {verificationResult.status}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confidence:{" "}
                      {Math.round(verificationResult.confidence * 100)}%
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      {verificationResult.explanation}
                    </p>
                    <p
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        verificationResult.rewardEligible
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {verificationResult.rewardEligible
                        ? "Reward Eligible"
                        : "Not Eligible"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-800">
                    Konfirmasi Kategori
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Pilih kategori yang paling sesuai jika AI salah.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-2xl text-left
                          transition-all duration-200 border-2
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
