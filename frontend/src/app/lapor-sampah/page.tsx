import Estimation from "@/components/laporsampah/Estimation";
import WasteUpload from "@/components/laporsampah/WasteUpload";
import History from "@/components/laporsampah/History";

export default function LaporSampahPage() {
  return (
    <main className="flex flex-col gap-6 px-4 py-6">
      <div className="mx-auto w-full max-w-[1152px] text-center">
        <h1 className="font-nunito text-3xl font-extrabold text-gray-800">
          Lapor Sampah
        </h1>
        <p className="mt-2 font-nunito text-base text-gray-600">
          Laporkan sampah yang telah Anda kumpulkan dan dapatkan poin
        </p>
      </div>
      <WasteUpload />
      <Estimation />
      <History />
    </main>
  );
}
