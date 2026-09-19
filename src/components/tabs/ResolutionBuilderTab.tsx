import React, { useState } from 'react';
import { ErrorAlert } from "../ErrorAlert";

import { DelegateContext, User, ResolutionClause } from '../../types';
import { PREAMBULATORY_STARTERS, OPERATIVE_STARTERS } from '../../data/unPresets';
import { api } from '../../services/api';
import { exportDocumentToPDF, exportDocumentToWord, copyToClipboard } from '../../utils/exportUtils';
import { DocumentActionBar } from '../DocumentActionBar';
import { SkeletonLoader } from '../SkeletonLoader';
import {
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Download,
  Copy,
  Check,
  FileDown,
  AlertCircle
} from 'lucide-react';

interface ResolutionBuilderTabProps {
  context: DelegateContext;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
}

export const ResolutionBuilderTab: React.FC<ResolutionBuilderTabProps> = ({
  context,
  user,
  onOpenAuth,
  onOpenPricing
}) => {
  const [clauses, setClauses] = useState<ResolutionClause[]>([
    {
      id: 'clause-1',
      type: 'preambulatory',
      starter: 'Deeply concerned',
      text: 'by the proliferation of destabilizing autonomous weapons systems lacking human supervisory verification protocols,'
    },
    {
      id: 'clause-2',
      type: 'preambulatory',
      starter: 'Reaffirming',
      text: 'the non-derogable humanitarian principles enshrined in the Geneva Conventions of 1949 and relevant protocols,'
    },
    {
      id: 'clause-3',
      type: 'operative',
      starter: 'Calls upon',
      text: 'all sovereign member states to implement an immediate moratorium on the deployment of lethal autonomous weapons in populated civilian corridors;'
    },
    {
      id: 'clause-4',
      type: 'operative',
      starter: 'Decides',
      text: 'to establish an International Technology Review Panel (ITRP) under the auspices of the First Committee to conduct annual algorithmic security audits.'
    }
  ]);

  const [clauseType, setClauseType] = useState<'preambulatory' | 'operative'>('operative');
  const [selectedStarter, setSelectedStarter] = useState<string>('Calls upon');
  const [clauseContent, setClauseContent] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyClause = async (clause: ResolutionClause) => {
    const fullText = `${clause.starter} ${clause.text}`;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopiedClauseId(clause.id);
      setTimeout(() => setCopiedClauseId(null), 2000);
    }
  };

  // Add a clause manually
  const handleAddClause = () => {
    if (!clauseContent.trim()) return;
    const newClause: ResolutionClause = {
      id: 'clause_' + Date.now(),
      type: clauseType,
      starter: selectedStarter,
      text: clauseContent.trim() + (clauseType === 'preambulatory' ? ',' : ';')
    };
    setClauses([...clauses, newClause]);
    setClauseContent('');
  };

  // Reorder clause
  const moveClause = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= clauses.length) return;
    const updated = [...clauses];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setClauses(updated);
  };

  const deleteClause = (id: string) => {
    setClauses(clauses.filter((c) => c.id !== id));
  };

  // AI suggest clauses based on topic + country bloc
  const handleAISuggestClauses = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSuggesting(true);
    setErrorMsg(null);

    try {
      const res = await api.generateAI('clauses', {
        committee: context.committee,
        topic: context.topic,
        country: context.country,
        language: context.language || 'English'
      });

      if (res.result?.clauses && Array.isArray(res.result.clauses)) {
        const mapped = res.result.clauses.map((c: any, idx: number) => ({
          id: 'clause_ai_' + Date.now() + '_' + idx,
          type: c.type || 'operative',
          starter: c.starter || (c.type === 'preambulatory' ? 'Guided by' : 'Encourages'),
          text: c.text || ''
        }));
        setClauses((prev) => [...prev, ...mapped]);
      } else {
        setErrorMsg('AI returned a format that could not be parsed automatically.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Clause suggestion failed. Please try again.');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Compile full draft resolution
  const preambulatoryClauses = clauses.filter((c) => c.type === 'preambulatory');
  const operativeClauses = clauses.filter((c) => c.type === 'operative');

  const isPNA = context.committee.includes('Pakistan') || context.committee.includes('PNA');
  const isINTERPOL = context.committee.includes('INTERPOL');
  const isUNICEF = context.committee.includes('UNICEF');

  const docTitle = isPNA
    ? 'NATIONAL ASSEMBLY OF PAKISTAN\nOFFICIAL RESOLUTION / PRIVATE MEMBER MOTION'
    : isINTERPOL
    ? 'INTERPOL GENERAL ASSEMBLY\nDRAFT EXECUTIVE RESOLUTION'
    : isUNICEF
    ? 'UNICEF EXECUTIVE BOARD\nDRAFT PROGRAMME RESOLUTION'
    : 'UNITED NATIONS\nGENERAL DRAFT RESOLUTION';

  const sponsorsLabel = isPNA
    ? `MOVER: Honorable MNA representing ${context.country}`
    : isINTERPOL
    ? `SPONSORS: National Central Bureau of ${context.country}`
    : `SPONSORS: Delegation of ${context.country}`;

  const compiledDraftText = `${docTitle}

COMMITTEE: ${context.committee}
TOPIC: ${context.topic}
${sponsorsLabel}
SIGNATORIES: Multiple Delegations / Member Entities

${isPNA ? 'The National Assembly of Pakistan,' : isINTERPOL ? 'The INTERPOL General Assembly,' : `The ${context.committee},`}

${preambulatoryClauses.map((c) => `${c.starter} ${c.text}`).join('\n\n')}

${operativeClauses
  .map((c, i) => `${i + 1}. ${c.starter} ${c.text}`)
  .join('\n\n')}`;

  const handleCopyDraft = async () => {
    const ok = await copyToClipboard(compiledDraftText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = () => {
    exportDocumentToPDF({
      title: `${context.committee} Draft Resolution`,
      country: context.country,
      committee: context.committee,
      topic: context.topic,
      type: 'Draft Resolution',
      content: compiledDraftText
    });
  };

  return (
    <div className="space-y-3 sm:space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 transition-colors">
        <div>
          {/* Eyebrow: hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>RESOLUTION DRAFTING SUITE</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
              Resolution Clause Builder
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#0B1F3A] dark:text-[#D4AF37] border border-[#D4AF37]/50">
              {clauses.length} {clauses.length === 1 ? 'Clause' : 'Clauses'}
            </span>
          </div>

          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 mt-1 truncate sm:whitespace-normal">
            Build formal draft resolutions with committee starters and clause drafting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-ai-suggest-clauses"
            onClick={handleAISuggestClauses}
            disabled={isSuggesting}
            className="w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/30 active:scale-98 touch-press"
          >
            {isSuggesting ? (
              <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4 fill-[#D4AF37]" />
            )}
            <span>AI Suggest Clauses</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <ErrorAlert message={errorMsg} />
      )}

      {/* Grid: Creator on Top / Left, Active Resolution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        {/* Clause Input Form */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Add New Clause
            </h3>

            {/* Type Switcher as horizontal pill row */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Clause Category
              </label>
              <div className="flex gap-2">
                <button
                  id="btn-clause-type-preambulatory"
                  type="button"
                  onClick={() => {
                    setClauseType('preambulatory');
                    setSelectedStarter('Deeply concerned');
                  }}
                  className={`flex-1 p-2.5 min-h-[44px] rounded-xl border text-center text-xs sm:text-sm font-bold transition-all touch-press ${
                    clauseType === 'preambulatory'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-[#D4AF37] text-amber-900 dark:text-amber-300 ring-2 ring-[#D4AF37]/20'
                      : 'bg-white dark:bg-[#0b1b33] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="italic">Preambulatory</span>
                </button>

                <button
                  id="btn-clause-type-operative"
                  type="button"
                  onClick={() => {
                    setClauseType('operative');
                    setSelectedStarter('Calls upon');
                  }}
                  className={`flex-1 p-2.5 min-h-[44px] rounded-xl border text-center text-xs sm:text-sm font-bold transition-all touch-press ${
                    clauseType === 'operative'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-[#0B1F3A] dark:border-[#D4AF37] text-[#0B1F3A] dark:text-[#D4AF37] ring-2 ring-[#0B1F3A]/20 dark:ring-[#D4AF37]/30'
                      : 'bg-white dark:bg-[#0b1b33] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="underline decoration-2">Operative</span>
                </button>
              </div>
            </div>

            {/* Starter Dropdown */}
            <div>
              <label 
                htmlFor="select-clause-starter"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Official UN Clause Starter
              </label>
              <select
                id="select-clause-starter"
                value={selectedStarter}
                onChange={(e) => setSelectedStarter(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[48px] text-base font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37]"
              >
                {(clauseType === 'preambulatory' ? PREAMBULATORY_STARTERS : OPERATIVE_STARTERS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Clause Content */}
            <div>
              <label 
                htmlFor="textarea-clause-substance"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Clause Substance
              </label>
              <textarea
                id="textarea-clause-substance"
                rows={3}
                value={clauseContent}
                onChange={(e) => setClauseContent(e.target.value)}
                placeholder={`Type the clause text following "${selectedStarter}"...`}
                className="w-full p-3 text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100 resize-none leading-relaxed"
              />
            </div>

            <button
              id="btn-add-clause"
              onClick={handleAddClause}
              disabled={!clauseContent.trim()}
              className="w-full min-h-[48px] py-2.5 bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>Append Clause to Draft</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#071326] border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs uppercase tracking-wider">Diplomatic Drafter's Rules:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Preambulatory clauses explain rationale; italicized, end with comma.</li>
              <li>Operative clauses mandate action; numbered, underlined, end with semicolon.</li>
            </ul>
          </div>
        </div>

        {/* Clause List & Reordering */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 transition-colors">
            <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Draft Resolution Clauses ({clauses.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {preambulatoryClauses.length} Preambulatory • {operativeClauses.length} Operative
                </p>
              </div>

              {clauses.length > 0 && (
                <DocumentActionBar
                  documentTitle={`${context.committee} - Draft Resolution (${context.country})`}
                  content={compiledDraftText}
                  onExportWord={() => exportDocumentToWord({
                    title: `${context.committee} - Draft Resolution`,
                    country: context.country,
                    committee: context.committee,
                    topic: context.topic,
                    type: 'Draft Resolution',
                    content: compiledDraftText
                  })}
                  onExportPDF={handleExportPDF}
                />
              )}
            </div>

            {/* Clauses Reorderable List */}
            {clauses.length === 0 ? (
              <div className="text-center py-14 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No clauses in draft</p>
                <p className="text-xs sm:text-sm mt-1 max-w-sm mx-auto">Add a clause on the left or tap "AI Suggest Clauses" to draft clauses tailored for {context.country}.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {clauses.map((clause, index) => (
                  <div
                    key={clause.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                      clause.type === 'preambulatory'
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 hover:border-amber-300'
                        : 'bg-blue-50/30 dark:bg-blue-950/20 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          clause.type === 'preambulatory'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {clause.type === 'preambulatory' ? 'Preambulatory' : `Operative #${operativeClauses.findIndex(c => c.id === clause.id) + 1}`}
                      </span>
                    </div>

                    {/* Full width text */}
                    <p className="text-base sm:text-[17px] leading-relaxed text-slate-800 dark:text-slate-200 break-words">
                      <span
                        className={
                          clause.type === 'preambulatory'
                            ? 'italic font-bold text-amber-900 dark:text-amber-300 mr-1.5'
                            : 'underline font-bold text-[#0B1F3A] dark:text-[#D4AF37] mr-1.5'
                        }
                      >
                        {clause.starter}
                      </span>
                      <span>{clause.text}</span>
                    </p>

                    {/* Small action row at bottom: Up, Down, Copy, Delete as icons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveClause(index, 'up')}
                          disabled={index === 0}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-25 touch-press"
                          title="Move up"
                          aria-label="Move clause up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveClause(index, 'down')}
                          disabled={index === clauses.length - 1}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-25 touch-press"
                          title="Move down"
                          aria-label="Move clause down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyClause(clause)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B1F3A] dark:hover:text-[#D4AF37] hover:bg-slate-200/60 dark:hover:bg-slate-800 touch-press"
                          title="Copy clause"
                          aria-label="Copy clause text"
                        >
                          {copiedClauseId === clause.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteClause(clause.id)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 touch-press"
                          title="Delete clause"
                          aria-label="Delete clause"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
