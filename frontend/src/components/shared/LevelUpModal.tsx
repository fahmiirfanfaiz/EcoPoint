"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { X, Trophy, Sparkles } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelNumber: number;
  levelName: string;
}

export default function LevelUpModal({ isOpen, onClose, levelNumber, levelName }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-xl shadow-amber-200">
          <Trophy size={48} className="text-white" />
        </div>

        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
            <Sparkles size={16} />
            NAIK LEVEL
          </div>
        </div>

        <h2 className="font-nunito mb-2 text-3xl font-extrabold text-gray-900">
          Level {levelNumber}
        </h2>
        
        <p className="font-quicksand text-lg font-bold text-emerald-600 mb-4">
          {levelName}
        </p>

        <p className="font-quicksand text-sm text-gray-500 mb-8 px-4">
          Luar biasa! Anda telah membuktikan dedikasi yang tinggi untuk lingkungan yang lebih baik. Terus tingkatkan aksimu!
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white transition-transform hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-200"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
