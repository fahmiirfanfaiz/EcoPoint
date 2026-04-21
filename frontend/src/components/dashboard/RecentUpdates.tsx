import React from "react";

const updates = [
  {
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 0C3.36 0 0 3.36 0 7.5S3.36 15 7.5 15 15 11.64 15 7.5 11.64 0 7.5 0zM6 11.25L2.25 7.5l1.06-1.06L6 9.12l5.69-5.69 1.06 1.06L6 11.25z" fill="#059669" /></svg>,
    iconBg: "#D1FAE5",
    title: "Report Verified",
    desc: 'Your submission "Plastic Bottle #291" has been verified.',
    time: "2 hours ago",
    badge: "+20pts",
  },
  {
    icon: <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
          <path d="M8 0L9.79 3.58L13.71 4.15L10.85 6.94L11.59 10.87L8 9.01L4.41 10.87L5.15 6.94L2.29 4.15L6.21 3.58L8 0Z" fill="#F59E0B" />
          <path d="M4 12v8l4-2 4 2v-8" fill="#F59E0B" opacity="0.6"/>
        </svg>,
    iconBg: "#FEF9C3",
    title: "Badge Earned!",
    desc: 'You unlocked the "Early Adopter" badge.',
    time: "Yesterday",
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 0C3.36 0 0 3.36 0 7.5S3.36 15 7.5 15 15 11.64 15 7.5 11.64 0 7.5 0zm.75 11.25h-1.5V6.75h1.5v4.5zm0-6h-1.5v-1.5h1.5v1.5z" fill="#2563EB" /></svg>,
    iconBg: "#DBEAFE",
    title: "Campus Event",
    desc: 'Join the "Clean Campus Day" this Friday at the main square.',
    time: "2 days ago",
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 0C3.36 0 0 3.36 0 7.5S3.36 15 7.5 15 15 11.64 15 7.5 11.64 0 7.5 0zm.75 8.25h-1.5V3.75h1.5v4.5zm0 3h-1.5v-1.5h1.5v1.5z" fill="#DC2626" /></svg>,
    iconBg: "#FEE2E2",
    title: "Action Required",
    desc: "Please update your profile picture for the student ID.",
    time: "4 days ago",
  },
];

const RecentUpdates: React.FC = () => (
  <div
    className="rounded-[32px] bg-white p-6 w-[90%] mx-auto"
    style={{
      outline: "1px #ECFDF5 solid",
      outlineOffset: "-1px",
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
    }}
  >
    {/* Header */}
    <div className="mb-6 flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H9v6l5.25 3.15.75-1.23-4.5-2.67V5z" fill="#F87171" />
      </svg>
      <span className="font-quicksand text-lg font-bold leading-7 text-gray-800">Recent Updates</span>
    </div>

    {/* Items */}
    <div className="flex flex-col gap-4">
      {updates.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-3xl p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: item.iconBg }}>
            {item.icon}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-outfit text-sm leading-5 text-gray-800">{item.title}</span>
            <span className="font-outfit text-xs leading-4 text-gray-500">{item.desc}</span>
            <span className="font-outfit mt-0.5 text-[10px] leading-[15px] text-gray-400">{item.time}</span>
          </div>
          {item.badge && (
            <div className="flex-shrink-0">
              <span className="font-quicksand rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold leading-4 text-emerald-500">{item.badge}</span>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="mt-4 border-t border-emerald-100 pt-4 text-center">
      <button className="font-outfit text-sm leading-5 text-gray-500 hover:text-emerald-500">View All Notifications</button>
    </div>
  </div>
);

export default RecentUpdates;
