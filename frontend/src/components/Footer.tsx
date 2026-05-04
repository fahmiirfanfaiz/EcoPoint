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
    // <footer className="w-full bg-transparent px-6 py-8">
    //   <div className="mx-auto flex w-full max-w-[7xl] items-center justify-center">
    //     <p className="font-nunito text-center text-sm leading-5 text-gray-400">
    //       © 2026 EcoPoint Campus. Save the Earth, One Point at a Time.
    //     </p>
    //   </div>
    // </footer>
    <footer className="font-nunito w-full h-20 bg-white flex items-center justify-between px-20">
      <div className="flex gap-2">
        <Image
          src="images/Logo.svg"
          alt="EcoPoint Campus Logo"
          width={23.94}
          height={23.94}
        />
        <span className="font-bold">EcoPoint Campus</span>
      </div>

      <div className="flex gap-6 justify-center text-slate-500 font-bold">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Contact</span>
      </div>

      <div>
        <span className="text-slate-400">© 2026 EcoPoint Campus. Let&apos;s grow together.</span>
      </div>
    </footer>
  );
};

export default Footer;
