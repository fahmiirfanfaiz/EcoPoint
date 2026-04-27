import RewardBanner from "@/components/redeem/RewardBanner";
import RewardGrid from "@/components/redeem/RewardGrid";

export default function TukarPoinPage() {
  return (
    <main className="flex flex-col gap-6 px-4 py-6">
      <RewardBanner />
      <RewardGrid />
    </main>
  );
}
