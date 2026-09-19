import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  isLimitBlocked?: boolean;
  onOpenPricing?: () => void;
  buttonText?: string;
}

export function ErrorAlert({ message, isLimitBlocked, onOpenPricing, buttonText = 'Get Premium' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-200 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold">Notice</p>
        <p className="mt-0.5">{message}</p>
      </div>
      {isLimitBlocked && onOpenPricing && (
        <button
          onClick={onOpenPricing}
          className="px-3 py-1.5 min-h-[36px] bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] hover:text-amber-200 font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 border border-[#D4AF37]/30"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
