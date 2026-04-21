"use client";
import { useState, useRef } from "react";

type Category = "plastik" | "kertas" | "organik" | "logam" | "kaca" | null;

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
    id: "plastik",
    label: "Plastik",
    description: "Botol, gelas, kemasan makanan",
    emoji: "🥤",
    bgColor: "bg-green-50",
    iconBg: "bg-green-100",
  },
  {
    id: "kertas",
    label: "Kertas",
    description: "Kardus, kertas tulis, koran",
    emoji: "📄",
    bgColor: "bg-yellow-50",
    iconBg: "bg-yellow-100",
  },
  {
    id: "organik",
    label: "Organik",
    description: "Sisa makanan, kulit buah, daun",
    emoji: "🍎",
    bgColor: "bg-red-50",
    iconBg: "bg-red-100",
  },
];

interface DetectionResult {
  category: Category;
  accuracy: number;
  description: string;
  imageUrl: string;
}

export default function WasteDetectionSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("plastik");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // dummy untuk AI
  const detectionResult: DetectionResult | null = uploadedImage
    ? {
        category: "plastik",
        accuracy: 98,
        description: "AI kami menganalisis gambar ini sebagai botol plastik PET.",
        imageUrl: uploadedImage,
      }
    : null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 font-sans">
      {/* Outer card */}
      <div
        className="w-full max-w-5xl"
        style={{
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        }}
      >
        <div className="p-1">
          <div>
            <div className= "rounded-2xl">
              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row">
                {/* ─── LEFT: Upload Panel ─── */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  {/* Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      relative flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer
                      transition-all duration-200 select-none
                      ${isDragging ? "bg-white border-2 border-blue-400 border-dashed" : "bg-gray-50 border-2 border-transparent"}
                      min-h-[220px]
                    `}
                    style={{
                      background: isDragging ? undefined : "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
                    }}
                  >
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-h-48 max-w-full rounded-xl object-cover"
                      />
                    ) : (
                      <>
                        {/* Camera icon circle */}
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
                            {/* + badge */}
                            <circle cx="7" cy="7" r="4" fill="#38bdf8" opacity="0.3" />
                            <text x="5" y="10" fontSize="7" fill="#0ea5e9" fontWeight="bold">+</text>
                            {/* camera body */}
                            <rect x="3" y="9" width="18" height="12" rx="3" fill="#38bdf8" />
                            <circle cx="12" cy="15" r="3.5" fill="white" />
                            <circle cx="12" cy="15" r="2" fill="#38bdf8" />
                            {/* viewfinder notch */}
                            <path d="M8 9V7.5A1.5 1.5 0 0 1 9.5 6h1A1.5 1.5 0 0 1 12 7.5V9" fill="#0ea5e9" />
                          </svg>
                        </div>

                        <div className="text-center px-4">
                          <p className="font-bold text-gray-800 text-base">Ambil Foto atau Upload</p>
                          <p className="text-gray-500 text-sm mt-1 leading-snug">
                            Drag &amp; drop foto sampahmu di sini. Format: JPG, PNG.
                          </p>
                        </div>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Progress bar decoration (always visible, mimics Figma) */}
                  <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: detectionResult ? `${detectionResult.accuracy}%` : "0%",
                        background: "linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>

                  {/* Detection result card */}
                  {detectionResult ? (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3">
                      <img
                        src={detectionResult.imageUrl}
                        alt="thumb"
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-700">🤖 AI Mendeteksi:</span>
                          <span className="text-sm font-bold text-green-600">
                            {categories.find((c) => c.id === detectionResult.category)?.label}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)" }}
                          >
                            {detectionResult.accuracy}% Accuracy
                          </span>
                        </div>
                        {/* mini progress */}
                        <div className="mt-1.5 h-1.5 rounded-full bg-white-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-400"
                            style={{ width: `${detectionResult.accuracy}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{detectionResult.description}</p>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder detection card */
                    <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3 opacity-50">
                      <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-400">🤖 AI Mendeteksi:</span>
                          <span className="text-sm font-bold text-gray-400">—</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-200" />
                        <p className="text-xs text-gray-300 mt-1">Upload foto untuk memulai deteksi.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── RIGHT: Kategori Panel ─── */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-800">Konfirmasi Kategori</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Pilih kategori yang paling sesuai jika AI salah.</p>
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
                            ${isSelected
                              ? "border-green-400 bg-green-50 shadow-sm"
                              : "border-transparent bg-white hover:bg-gray-100"}
                          `}
                        >
                          {/* Icon */}
                          <div
                            className={`
                              w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                              ${cat.iconBg}
                            `}
                          >
                            {cat.emoji}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                          </div>

                          {/* Radio */}
                          <div
                            className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
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
    </div>
  );
}