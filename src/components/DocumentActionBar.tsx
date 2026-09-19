import React, { useState } from 'react';
import { Copy, Check, Download, Share2, FileText } from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';

interface DocumentActionBarProps {
  documentTitle: string;
  content: string;
  onExportWord?: () => void;
  onExportPDF?: () => void;
  onCopySuccess?: () => void;
}

export const DocumentActionBar: React.FC<DocumentActionBarProps> = ({
  documentTitle,
  content,
  onExportWord,
  onExportPDF,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!content) return;
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (!content) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: documentTitle,
          text: content.slice(0, 1500) + (content.length > 1500 ? '\n\n[...Generated via Yeilded MUN Suite]' : '')
        });
        return;
      } catch (err) {
        // User aborted share or not supported
      }
    }

    // Fallback: Copy to clipboard
    const ok = await copyToClipboard(content);
    if (ok) {
      setShareToast('Content copied to clipboard ready to share!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="w-4 h-4 text-[#0B1F3A] dark:text-[#D4AF37] shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
            {documentTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!content}
            aria-label="Copy text"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all touch-press disabled:opacity-40 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            disabled={!content}
            aria-label="Share document"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all touch-press disabled:opacity-40"
            title="Share via messaging or apps"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* DOCX Export */}
          {onExportWord && (
            <button
              type="button"
              onClick={onExportWord}
              disabled={!content}
              aria-label="Download DOCX"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all touch-press disabled:opacity-40 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">DOCX</span>
            </button>
          )}

          {/* PDF Export */}
          {onExportPDF && (
            <button
              type="button"
              onClick={onExportPDF}
              disabled={!content}
              aria-label="Download PDF"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0B1F3A] dark:bg-[#0f2a4a] text-[#D4AF37] hover:bg-[#15345d] border border-[#D4AF37]/30 transition-all touch-press disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {copied && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0B1F3A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 border border-[#D4AF37]/40 z-30 animate-in fade-in slide-in-from-top-1">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied to clipboard!</span>
        </div>
      )}

      {shareToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0B1F3A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 border border-[#D4AF37]/40 z-30 animate-in fade-in slide-in-from-top-1">
          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{shareToast}</span>
        </div>
      )}
    </div>
  );
};
