import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Leaf,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import RedirectIfLoggedIn from "@/components/auth/RedirectIfLoggedIn";

const highlightCards = [
  {
    icon: Trash2,
    title: "Lapor sampah dengan cepat",
    description:
      "Unggah foto, dapatkan klasifikasi AI, dan kirim laporan dalam satu alur yang ringkas.",
  },
  {
    icon: BadgeCheck,
    title: "Poin, badge, dan level",
    description:
      "Setiap kontribusi langsung terhubung ke sistem gamifikasi yang mendorong partisipasi.",
  },
  {
    icon: ShieldCheck,
    title: "Validasi yang jelas",
    description:
      "Status laporan, riwayat, dan hadiah dirancang agar transparan untuk user maupun admin.",
  },
];

const stats = [
  { value: "3", label: "alur utama terintegrasi" },
  { value: "1", label: "dashboard untuk progres user" },
  { value: "100%", label: "fokus pada aksi nyata" },
];

const steps = [
  {
    title: "Laporkan temuan",
    description:
      "User mengisi kategori, mengunggah foto, lalu mengirim laporan ke sistem.",
  },
  {
    title: "AI membantu klasifikasi",
    description:
      "Model AI membaca deskripsi dan gambar untuk memberi hasil awal yang relevan.",
  },
  {
    title: "Poin bertambah otomatis",
    description:
      "Setelah validasi, poin masuk ke akun dan bisa dipakai untuk redeem reward.",
  },
];

export default function HomePage() {
  return (
    <RedirectIfLoggedIn>
      <main className="overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(180deg,_#f0fdf4_0%,_#ffffff_52%,_#f8fafc_100%)]">
        <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-14 lg:flex-row lg:items-center lg:py-20">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur">
            <Sparkles size={16} />
            EcoPoint Campus
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Sistem bank sampah kampus yang terasa cepat, jelas, dan layak
              dipakai.
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              EcoPoint menggabungkan pelaporan sampah, klasifikasi AI, reward,
              leaderboard, dan challenge harian dalam satu pengalaman yang rapi
              untuk mahasiswa.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Mulai Sekarang
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 shadow-sm transition-colors duration-200 hover:bg-emerald-50"
            >
              Masuk ke Akun
            </Link>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
              >
                <div className="text-2xl font-black text-gray-900">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid w-full gap-4 lg:max-w-xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,185,129,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Leaf size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  EcoPoint Flow
                </p>
                <p className="text-lg font-black text-gray-900">
                  Dari laporan ke reward
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{step.title}</div>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlightCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 pb-16">
        <div className="grid gap-4 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
          <div className="md:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Kenapa EcoPoint
            </p>
            <h2 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl">
              Satu landing page, satu alur, satu pengalaman yang konsisten.
            </h2>
          </div>

          <div className="grid gap-4 md:col-span-2 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <BarChart3 className="text-emerald-700" size={24} />
              <p className="mt-3 font-bold text-gray-900">
                Dashboard informatif
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Statistik poin, laporan, badge, dan aktivitas mingguan
                ditampilkan dalam satu tempat.
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-5">
              <ShieldCheck className="text-sky-700" size={24} />
              <p className="mt-3 font-bold text-gray-900">Hak akses terjaga</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pengguna yang belum login hanya melihat landing page dan akan
                diarahkan ke login saat mengakses fitur privat.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 md:col-span-2 xl:col-span-1">
              <BadgeCheck className="text-amber-700" size={24} />
              <p className="mt-3 font-bold text-gray-900">Gamifikasi aktif</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Poin, reward, badge, dan daily challenge menjaga user tetap
                terlibat.
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>
    </RedirectIfLoggedIn>
  );
}
