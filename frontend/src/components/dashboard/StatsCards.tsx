import React from "react";
import { Zap, Recycle, Award, ChevronRight } from "lucide-react";
import { getStoredAuth } from "@/lib/auth";

interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  showArrow?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconBg, iconColor, label, value, showArrow }) => (
  <div
    className="flex items-center gap-4 rounded-[32px] bg-white p-6"
    style={{
      outline: "1px #ECFDF5 solid",
      outlineOffset: "-1px",
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
    }}
  >
    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-3xl ${iconBg} ${iconColor}`}>
      <Icon size={24} />
    </div>
    <div className="flex flex-col">
      <span className="font-outfit text-sm leading-5 text-gray-500">{label}</span>
      <span className="font-quicksand text-[30px] font-bold leading-9 text-gray-800">{value}</span>
    </div>
    {showArrow && (
      <div className="ml-auto">
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    )}
  </div>
);

const StatsCards: React.FC = () => {
  const [totalPoints, setTotalPoints] = React.useState(0);

  const syncData = React.useCallback(() => {
    const auth = getStoredAuth();
    if (auth) {
      setTotalPoints(auth.user.total_poin || 0);
    }
  }, []);

  React.useEffect(() => {
    syncData();
    window.addEventListener("ecopoint-auth-changed", syncData);
    return () => window.removeEventListener("ecopoint-auth-changed", syncData);
  }, [syncData]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard
        icon={() => (
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M12.5 2C6.98 2 2.5 6.48 2.5 12s4.48 10 10 10 10-4.48 10-10S18.02 2 12.5 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.22V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.88-3.12 3.19z" fill="currentColor" />
          </svg>
        )}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        label="Total Poin"
        value={totalPoints.toLocaleString()}
      />
      <StatCard
        icon={Recycle}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        label="Laporan Dibuat"
        value="48"
      />
      <StatCard
        icon={() => (
          <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
            <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="currentColor" />
            <path d="M4 12v8l4-2 4 2v-8" fill="currentColor" opacity="0.6"/>
          </svg>
        )}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        label="Badge Diraih"
        value="7"
        showArrow
      />
    </div>
  );
};

export default StatsCards;