import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SkeletonLoaderProps {
  title?: string;
  steps?: string[];
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  title = 'AI is drafting your diplomatic dossier...',
  steps = [
    'Reviewing UN Charter and relevant resolutions...',
    'Synthesizing geopolitical posture and treaties...',
    'Structuring operative directives and clauses...',
    'Polishing diplomatic syntax...'
  ],
  lines = 6
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % steps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="w-full py-8 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
      {/* Animated Icon Badge */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#0B1F3A] to-[#1e3a66] dark:from-[#0c1c33] dark:to-[#173059] flex items-center justify-center shadow-lg border border-[#D4AF37]/30">
          <Sparkles className="w-7 h-7 text-[#D4AF37] animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white dark:border-[#071326] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h4>

      {/* Dynamic Step Progress Message */}
      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 min-h-[20px] transition-all duration-300 mb-6 max-w-xs">
        {steps[currentStepIdx]}
      </p>

      {/* Shimmering Skeleton Lines */}
      <div className="w-full max-w-md space-y-3 px-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-3.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-full animate-pulse"></div>
        <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-md w-5/6 animate-pulse"></div>
        <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-11/12 animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 animate-pulse pt-2"></div>
        <div className="h-3.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-full animate-pulse"></div>
      </div>
    </div>
  );
};
