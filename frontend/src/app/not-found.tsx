import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      {/* Icon or Illustration */}
      <div
        className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50"
        style={{
          boxShadow: "0px 8px 10px -6px rgba(16, 185, 129, 0.1), 0px 20px 25px -5px rgba(16, 185, 129, 0.1)",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
            fill="#10B981"
          />
          <path
            d="M15.5355 12C15.5355 13.9526 13.9526 15.5355 12 15.5355C10.0474 15.5355 8.46447 13.9526 8.46447 12Z"
            fill="#10B981"
          />
          <path
            d="M8.29289 8.29289C8.68342 7.90237 9.31658 7.90237 9.70711 8.29289L10.4142 9C10.8047 9.39052 10.8047 10.0237 10.4142 10.4142C10.0237 10.8047 9.39052 10.8047 9 10.4142L8.29289 9.70711C7.90237 9.31658 7.90237 8.68342 8.29289 8.29289Z"
            fill="#10B981"
          />
          <path
            d="M13.5858 10.4142C13.1953 10.0237 13.1953 9.39052 13.5858 9L14.2929 8.29289C14.6834 7.90237 15.3166 7.90237 15.7071 8.29289C16.0976 8.68342 16.0976 9.31658 15.7071 9.70711L15 10.4142C14.6095 10.8047 13.9763 10.8047 13.5858 10.4142Z"
            fill="#10B981"
          />
        </svg>
      </div>

      {/* Error Content */}
      <h1 className="font-nunito text-[80px] font-extrabold leading-none text-emerald-500">
        404
      </h1>
      <h2 className="font-quicksand mt-4 text-2xl font-bold leading-8 text-gray-800">
        Halaman Tidak Ditemukan
      </h2>
      <p className="font-outfit mt-3 max-w-[400px] text-base leading-6 text-gray-500">
        Maaf, halaman yang Anda cari mungkin telah dipindahkan, diubah namanya,
        atau sudah tidak tersedia lagi.
      </p>

      {/* Action Button */}
      <Link
        href="/"
        className="font-outfit mt-10 flex min-w-[200px] items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-emerald-600"
        style={{
          boxShadow: "0px 4px 6px -4px #A7F3D0, 0px 10px 15px -3px #A7F3D0",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
            fill="white"
          />
        </svg>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
