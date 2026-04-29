import React from "react";
import { Bell, CheckCircle, Award, Info, AlertCircle, Clock } from "lucide-react";

const updates = [
  {
    icon: CheckCircle,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Report Verified",
    desc: 'Your submission "Plastic Bottle #291" has been verified.',
    time: "2 hours ago",
    badge: "+20pts",
  },
  {
    icon: () => (
      <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
        <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="currentColor" />
        <path d="M4 12v8l4-2 4 2v-8" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Badge Earned!",
    desc: 'You unlocked the "Early Adopter" badge.',
    time: "Yesterday",
  },
  {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Campus Event",
    desc: 'Join the "Clean Campus Day" this Friday at the main square.',
    time: "2 days ago",
  },
  {
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Action Required",
    desc: "Please update your profile picture for the student ID.",
    time: "4 days ago",
  },
];

const RecentUpdates: React.FC = () => (
  <div
    className="rounded-[32px] bg-white p-6"
    style={{
      outline: "1px #ECFDF5 solid",
      outlineOffset: "-1px",
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
    }}
  >
    {/* Header */}
    <div className="mb-6 flex items-center gap-2 text-red-400">
      <Bell size={20} />
      <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Recent Updates</span>
    </div>

    {/* Items */}
    <div className="flex flex-col gap-4">
      {updates.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex gap-3 rounded-3xl p-3 hover:bg-gray-50 transition-colors">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.iconColor}`}>
              <Icon size={20} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-outfit text-sm font-semibold leading-5 text-gray-800">{item.title}</span>
              <span className="font-outfit text-xs leading-4 text-gray-500">{item.desc}</span>
              <span className="font-outfit mt-0.5 flex items-center gap-1 text-[10px] leading-[15px] text-gray-400">
                <Clock size={10} /> {item.time}
              </span>
            </div>
            {item.badge && (
              <div className="flex-shrink-0">
                <span className="font-quicksand rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold leading-4 text-emerald-500">{item.badge}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Footer */}
    <div className="mt-4 border-t border-emerald-100 pt-4 text-center">
      <button className="font-outfit text-sm leading-5 text-gray-500 hover:text-emerald-500">View All Notifications</button>
    </div>
  </div>
);

export default RecentUpdates;

