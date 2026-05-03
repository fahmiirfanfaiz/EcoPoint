"use client";

import React from "react";
import { usePathname } from "next/navigation";

const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-transparent px-6 py-8">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center">
        <p className="font-nunito text-center text-sm leading-5 text-gray-400">
          © 2026 EcoPoint Campus. Save the Earth, One Point at a Time.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
