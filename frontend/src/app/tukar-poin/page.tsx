export default function TukarPoinPage() {
  return (
    <main className="flex flex-col gap-6 px-4 py-6">
      <div className="mx-auto w-full max-w-[1152px] text-center">
        <h1 className="font-nunito text-3xl font-extrabold text-gray-800">
          Tukar Poin
        </h1>
        <p className="mt-2 font-nunito text-base text-gray-600">
          Tukarkan poin Anda dengan hadiah menarik
        </p>
      </div>

      {/* Content akan ditambahkan di sini */}
      <div className="mx-auto w-full max-w-[1152px] rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-gray-500">
          Konten Tukar Poin akan ditampilkan di sini
        </p>
      </div>
    </main>
  );
}
