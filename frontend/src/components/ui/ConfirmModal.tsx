import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <h3 className="font-nunito text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="font-quicksand text-sm text-gray-500 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end font-quicksand">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
