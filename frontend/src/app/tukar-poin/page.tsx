import RewardBanner from "@/components/redeem/RewardBanner";
import RewardGrid from "@/components/redeem/RewardGrid";

export default function TukarPoinPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-8">
      <RewardBanner />
      <RewardGrid />
    </div>
  );
}
