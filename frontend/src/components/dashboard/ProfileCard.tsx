import React from "react";

const ProfileCard: React.FC = () => {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] bg-white p-8 w-[90%] mx-auto"
      style={{
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.03), 0px 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full opacity-50" style={{ background: "#D1FAE5", filter: "blur(20px)" }} />
      <div className="pointer-events-none absolute left-0 top-[70px] h-32 w-32 rounded-full opacity-50" style={{ background: "#FEF9C3", filter: "blur(20px)" }} />

      <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="h-[128px] w-[128px] overflow-hidden rounded-full bg-emerald-100"
            style={{
              boxShadow: "0px 8px 10px -6px rgba(0,0,0,0.10), 0px 20px 25px -5px rgba(0,0,0,0.10)",
              outline: "4px solid white",
              outlineOffset: "-4px",
            }}
          >
            <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=Emery" alt="Avatar" className="h-full w-full object-cover" />
          </div>
          <div
            className="absolute bottom-0 left-1/2 flex -translate-x-2 -translate-y-1 items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", outline: "2px solid white", outlineOffset: "-2px" }}
          >
            <svg width="12" height="11" viewBox="0 0 12 11" fill="none"><path d="M6 0L7.76 3.58L11.71 4.15L8.85 6.94L9.53 10.87L6 9.01L2.47 10.87L3.15 6.94L0.29 4.15L4.24 3.58L6 0Z" fill="white" /></svg>
            <span className="font-quicksand text-xs font-bold leading-4 text-white whitespace-nowrap ">Lvl 5</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 text-center md:text-left">
          <h1 className="font-quicksand text-[30px] font-bold leading-9 text-gray-800">
            Hello, Alex! 👋
          </h1>
          <div className="flex flex-wrap justify-center gap-4 pb-4 md:justify-start">
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              NIM: 23/514737/TK/56513
            </span>
            <span className="font-outfit rounded-lg bg-emerald-50 px-3 py-1 text-sm leading-5 text-gray-600" style={{ outline: "1px #D1FAE5 solid", outlineOffset: "-1px" }}>
              Program Studi: Teknologi Informasi
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "60%", background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)" }} />
          </div>
          <p className="font-outfit text-xs leading-4 text-gray-500">120 points to next level</p>
        </div>

        {/* Buttons */}
        <div className="flex min-w-[200px] flex-col gap-3">
          <button
            className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-10 py-3 text-white transition hover:bg-emerald-600"
            style={{ boxShadow: "0px 4px 6px -4px #A7F3D0, 0px 10px 15px -3px #A7F3D0" }}
          >
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none"><path d="M19 13h-6v6h-4v-6H3v-4h6V3h4v6h6v4z" fill="white" /></svg>
            <span className="font-outfit text-base font-semibold leading-6">New Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-3xl bg-white px-6 py-3 transition hover:bg-emerald-50" style={{ outline: "2px #D1FAE5 solid", outlineOffset: "-2px" }}>
            <svg width="20" height="19" viewBox="0 0 20 19" fill="none"><path d="M20 7h-7.18L10 .5 7.18 7H0l5.82 4.24L3.64 18.5 10 13.77l6.36 4.73-2.18-7.26L20 7z" fill="#047857" /></svg>
            <span className="font-outfit text-base leading-6 text-emerald-700">Redeem Points</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
