import React, { useState, useEffect } from 'react';
import { User, PositionPaperDraft, SpeechDraft, DelegateContext } from '../../types';
import { api } from '../../services/api';
import { exportDocumentToPDF, copyToClipboard } from '../../utils/exportUtils';
import {
  FolderArchive,
  FileText,
  Mic,
  Trash2,
  Download,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ArchivesTabProps {
  user: User | null;
  onOpenAuth: () => void;
  onLoadDraftContext: (ctx: Partial<DelegateContext>) => void;
}

export const ArchivesTab: React.FC<ArchivesTabProps> = ({
  user,
  onOpenAuth,
  onLoadDraftContext
}) => {
  const [papers, setPapers] = useState<PositionPaperDraft[]>([]);
  const [speeches, setSpeeches] = useState<SpeechDraft[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'papers' | 'speeches'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchArchives = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [resPapers, resSpeeches] = await Promise.all([
        api.getPapers(),
        api.getSpeeches()
      ]);
      setPapers(resPapers.papers || []);
      setSpeeches(resSpeeches.speeches || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [user]);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportPaperPDF = (p: PositionPaperDraft) => {
    exportDocumentToPDF({
      title: p.title,
      country: p.country,
      committee: p.committee,
      topic: p.topic,
      type: 'Position Paper',
      content: p.fullText
    });
  };

  const handleExportSpeechPDF = (s: SpeechDraft) => {
    exportDocumentToPDF({
      title: s.title,
      country: s.country,
      committee: s.committee,
      topic: s.topic,
      type: 'Speech',
      content: s.text
    });
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-[#071326] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4 transition-colors">
        <FolderArchive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
          Sign In to Access Your Delegation Archive
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Save your position papers, custom speeches, and working paper clauses securely to your account for future conference sessions.
        </p>
        <button
          id="btn-archive-signin"
          onClick={() => onOpenAuth()}
          className="px-6 py-3 min-h-[44px] bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] font-bold text-sm rounded-xl shadow-md active:scale-98 transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-[#071326] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">
            <FolderArchive className="w-4 h-4 text-[#0B1F3A] dark:text-[#D4AF37]" />
            <span>DOCUMENT REPOSITORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            My Saved Delegation Archive
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Browse and export all position papers, speech scripts, and diplomatic files saved during your conference preparations.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center bg-slate-100 dark:bg-[#0b1b33] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            id="btn-archive-filter-all"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-2 min-h-[38px] rounded-lg text-sm font-bold transition-all active:scale-98 ${
              activeFilter === 'all'
                ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({papers.length + speeches.length})
          </button>
          <button
            id="btn-archive-filter-papers"
            onClick={() => setActiveFilter('papers')}
            className={`px-3 py-2 min-h-[38px] rounded-lg text-sm font-bold transition-all active:scale-98 ${
              activeFilter === 'papers'
                ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Papers ({papers.length})
          </button>
          <button
            id="btn-archive-filter-speeches"
            onClick={() => setActiveFilter('speeches')}
            className={`px-3 py-2 min-h-[38px] rounded-lg text-sm font-bold transition-all active:scale-98 ${
              activeFilter === 'speeches'
                ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Speeches ({speeches.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500">
          <div className="w-8 h-8 border-2 border-[#0B1F3A] dark:border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading delegation archives...</p>
        </div>
      ) : papers.length === 0 && speeches.length === 0 ? (
        <div className="bg-white dark:bg-[#071326] p-12 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3 transition-colors">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No Saved Drafts Yet</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When you generate position papers or speeches, click the "Save Draft" button in the toolbar to access them here anytime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Position Papers */}
          {(activeFilter === 'all' || activeFilter === 'papers') &&
            papers.map((p) => (
              <div
                key={p.id}
                id={`archive-paper-${p.id}`}
                className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Position Paper</span>
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                    {p.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    Topic: {p.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-[#0b1b33] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {p.fullText}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {p.country} • {p.committee}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-copy-paper-${p.id}`}
                      onClick={() => handleCopy(p.id, p.fullText)}
                      className="p-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold active:scale-98"
                      title="Copy full text"
                      aria-label="Copy full text"
                    >
                      {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      id={`btn-export-pdf-paper-${p.id}`}
                      onClick={() => handleExportPaperPDF(p)}
                      className="px-3 py-2 min-h-[40px] rounded-xl bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] text-sm font-bold flex items-center gap-1 shadow-xs active:scale-98"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Speeches */}
          {(activeFilter === 'all' || activeFilter === 'speeches') &&
            speeches.map((s) => (
              <div
                key={s.id}
                id={`archive-speech-${s.id}`}
                className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Speech ({s.timeLimitSeconds}s)</span>
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                    {s.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                    Topic: {s.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-[#0b1b33] p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {s.text}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {s.wordCount} words • {s.tone} tone
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-copy-speech-${s.id}`}
                      onClick={() => handleCopy(s.id, s.text)}
                      className="p-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold active:scale-98"
                      title="Copy full text"
                      aria-label="Copy full text"
                    >
                      {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      id={`btn-export-pdf-speech-${s.id}`}
                      onClick={() => handleExportSpeechPDF(s)}
                      className="px-3 py-2 min-h-[40px] rounded-xl bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] text-sm font-bold flex items-center gap-1 shadow-xs active:scale-98"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
