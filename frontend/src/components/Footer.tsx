"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="font-nunito w-full bg-white border-t border-gray-100 mt-auto">
      <div className="mx-auto flex w-full max-w-[1280px] h-20 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/Logo/Logo.svg"
            alt="EcoPoint Campus Logo"
            width={24}
            height={24}
          />
          <span className="font-bold text-gray-800">EcoPoint Campus</span>
        </div>

        <div className="flex gap-6 justify-center text-slate-500 font-bold text-sm">
          <span className="cursor-pointer hover:text-emerald-600 transition-colors">Privacy</span>
          <span className="cursor-pointer hover:text-emerald-600 transition-colors">Terms</span>
          <span className="cursor-pointer hover:text-emerald-600 transition-colors">Contact</span>
        </div>

        <div>
          <span className="text-slate-400 text-sm">© 2026 EcoPoint Campus. Let&apos;s grow together.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
