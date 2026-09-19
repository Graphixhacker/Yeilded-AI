import React, { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useSwipeDismiss } from '../hooks/useSwipeDismiss';

export interface PickerOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface BottomSheetPickerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
}

export const BottomSheetPicker: React.FC<BottomSheetPickerProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  searchable = true,
  placeholder = 'Search...'
}) => {
  const [query, setQuery] = useState('');

  const { offset, touchHandlers } = useSwipeDismiss({
    onDismiss: onClose,
    direction: 'down',
    threshold: 60,
    enabled: isOpen
  });

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bottom-sheet-picker-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        {...touchHandlers}
        style={{
          transform: offset.y > 0 ? `translateY(${offset.y}px)` : undefined,
          transition: offset.y === 0 ? 'transform 200ms ease-out' : 'none'
        }}
        className="w-full sm:max-w-lg bg-white dark:bg-[#071326] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 id="bottom-sheet-picker-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close picker"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar if searchable */}
        {searchable && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-base focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] placeholder-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 transition-colors touch-press rounded-xl ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 text-[#0B1F3A] dark:text-[#D4AF37]'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-semibold truncate ${isSelected ? 'font-bold' : ''}`}>
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching options found for "{query}".
            </div>
          )}
        </div>

        {/* Safe Area padding for iOS Home Bar */}
        <div className="h-[env(safe-area-inset-bottom,12px)] bg-white dark:bg-[#071326]"></div>
      </div>
    </div>
  );
};
