import React, { useState } from 'react';
import { DelegateContext, User, PositionPaperDraft, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../types';
import { UN_COMMITTEES, PAKISTAN_POLITICAL_PARTIES } from '../../data/unPresets';
import { api } from '../../services/api';
import { exportDocumentToPDF, exportDocumentToWord, copyToClipboard } from '../../utils/exportUtils';
import { ErrorAlert } from '../ErrorAlert';
import { BottomSheetPicker, PickerOption } from '../BottomSheetPicker';
import { SkeletonLoader } from '../SkeletonLoader';
import { DocumentActionBar } from '../DocumentActionBar';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Save,
  Check,
  AlertCircle,
  Clock,
  Lock,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

interface PositionPaperTabProps {
  context: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onUpdateUser: (u: User) => void;
  onSaveDraftNotification?: () => void;
}

export const PositionPaperTab: React.FC<PositionPaperTabProps> = ({
  context,
  onUpdateContext,
  user,
  onOpenAuth,
  onOpenPricing,
  onUpdateUser,
  onSaveDraftNotification
}) => {
  const [stancePoints, setStancePoints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCommitteePicker, setShowCommitteePicker] = useState(false);
  const [isStanceExpanded, setIsStanceExpanded] = useState(false);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(false);

  const isFree = !user || user.tier === 'free';
  const freeLeft = user ? Math.max(0, 3 - user.generationsUsed) : 3;
  const isLimitBlocked = isFree && freeLeft === 0;

  // Active committee matching
  const currentComm = UN_COMMITTEES.find(
    (c) => c.id === context.committee
  ) || UN_COMMITTEES[0];

  const isPNA = (context.committee || '').toLowerCase().includes('pakistan') || (context.committee || '').toLowerCase().includes('pna');
  const isUNICEF = (context.committee || '').toLowerCase().includes('unicef');
  const isINTERPOL = (context.committee || '').toLowerCase().includes('interpol');

  const committeePickerOptions: PickerOption[] = UN_COMMITTEES.map((comm) => ({
    value: comm.id,
    label: comm.name,
    description: comm.mandate,
    badge: comm.category ? comm.category.toUpperCase() : 'UN'
  }));

  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (onUpdateContext) {
      onUpdateContext({
        committee: selectedId
      });
    }
  };

  const handleCommitteeSelect = (selectedId: string) => {
    if (onUpdateContext) {
      onUpdateContext({
        committee: selectedId
      });
    }
  };




  // Calculate word count
  const wordCount = generatedText.trim() ? generatedText.trim().split(/\s+/).length : 0;

  const handleGenerate = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (isLimitBlocked) {
      onOpenPricing();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const res = await api.generateAI('position-paper', {
        country: context.country,
        committee: context.committee,
        topic: context.topic,
        stancePoints,
        language: context.language || 'English'
      });

      if (res.result) {
        setGeneratedText(res.result);
      }
      if (res.user) {
        onUpdateUser(res.user);
      }
    } catch (err: any) {
      if (err.isFreeTierLimit || err.code === 'LIMIT_REACHED') {
        setErrorMsg(err.message || 'Free tier limit reached. Please upgrade to continue generating.');
      } else {
        setErrorMsg(err.message || 'Failed to generate position paper. Check your connection or API key.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    const ok = await copyToClipboard(generatedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPDF = () => {
    if (!generatedText) return;
    exportDocumentToPDF({
      title: `${context.country} Position Paper`,
      country: context.country,
      committee: context.committee,
      topic: context.topic,
      type: 'Position Paper',
      content: generatedText
    });
  };

  const handleExportWord = () => {
    if (!generatedText) return;
    exportDocumentToWord({
      title: `${context.country} Position Paper`,
      country: context.country,
      committee: context.committee,
      topic: context.topic,
      type: 'Position Paper',
      content: generatedText
    });
  };

  const handleSaveDraft = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!generatedText) return;

    try {
      await api.savePaper({
        title: `${context.country} - ${context.committee} Position Paper`,
        country: context.country,
        committee: context.committee,
        topic: context.topic,
        stancePoints,
        fullText: generatedText
      });
      setSavedSuccess(true);
      if (onSaveDraftNotification) onSaveDraftNotification();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to save draft to server library.');
    }
  };

  const handleLoadSample = () => {
    if (isPNA) {
      setStancePoints(
        `- Reaffirm provincial fiscal rights under Article 160 of the 1973 Constitution and the 10th NFC Award\n- Invoke Article 153 to resolve Council of Common Interests (CCI) deadlocks on water apportionment\n- Mandate 40% decentralized execution for Public Sector Development Programme (PSDP) infrastructure allocations\n- Demand parliamentary audit oversight through the Public Accounts Committee (PAC)`
      );
    } else if (isUNICEF) {
      setStancePoints(
        `- Reaffirm sovereign obligations under the UN Convention on the Rights of the Child (CRC Articles 3, 6, 24)\n- Accelerate decentralized local production and distribution of Ready-to-Use Therapeutic Food (RUTF)\n- Deploy solar-powered mobile Child-Friendly Safe Learning Spaces (CFSLS) in displaced person zones\n- Mandate strict supply-chain auditing to criminalize child labor in sub-contracted manufacturing`
      );
    } else if (isINTERPOL) {
      setStancePoints(
        `- Mandate 24/7 automated telemetry indicator sharing through INTERPOL's I-24/7 communications network\n- Enforce strict evidentiary review on Red Notices and Blue Notices under Articles 2 & 3 of the INTERPOL Constitution\n- Expand multilateral joint taskforces (Operation First Light) targeting illicit cyber fraud and crypto laundering\n- Establish standardized cryptographic chain-of-custody vaults for cross-border digital evidence`
      );
    } else {
      setStancePoints(
        `- Reaffirm sovereignty and non-intervention under Article 2(7) of the UN Charter\n- Support non-binding ethical compliance frameworks with subsidized technical assistance\n- Propose an international verification registry under ECOSOC auspices\n- Demand targeted capacity-building grants for developing member states`
      );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 transition-colors">
        <div>
          {/* Eyebrow: hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              {isPNA
                ? 'PAKISTAN NATIONAL ASSEMBLY LEGISLATIVE POLICY DRAFTER'
                : isUNICEF
                ? 'UNICEF CHILD WELFARE POLICY BRIEF DRAFTER'
                : isINTERPOL
                ? 'INTERPOL LAW ENFORCEMENT DOSSIER DRAFTER'
                : 'UN DIPLOMATIC DOCUMENTATION DRAFTER'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
              Position Paper Generator
            </h2>
            {/* Inline usage chip next to title */}
            {isFree ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                {freeLeft}/3 Free
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#0B1F3A] dark:text-[#D4AF37] border border-[#D4AF37]/50">
                Unlimited Pass
              </span>
            )}
          </div>

          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 mt-1 truncate sm:whitespace-normal">
            {isPNA
              ? 'Draft an authentic Pakistani parliamentary policy brief tailored to constitutional mandates.'
              : isUNICEF
              ? 'Draft an official UNICEF Executive Board policy paper anchored in child welfare.'
              : isINTERPOL
              ? 'Draft an INTERPOL law enforcement dossier with operational threat assessments.'
              : 'Draft an official four-section MUN position paper formatted with formal UN conventions.'}
          </p>
        </div>

        {/* Free Tier Tracker Pill: desktop only */}
        {isFree && (
          <div className="hidden sm:flex bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
              {freeLeft}
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {freeLeft > 0 ? `${freeLeft} of 3 Free Generations Left` : 'Free Limit Reached'}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">Lifetime free tier allocation</p>
            </div>
            {isLimitBlocked && (
              <button
                id="btn-upgrade-limit-blocked"
                onClick={onOpenPricing}
                className="ml-2 px-3 py-1.5 min-h-[36px] bg-[#0B1F3A] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] font-bold text-sm rounded-lg shadow-xs active:scale-98"
              >
                Upgrade
              </button>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <ErrorAlert 
          message={errorMsg} 
          isLimitBlocked={isLimitBlocked} 
          onOpenPricing={onOpenPricing}
          buttonText="Get 1-Week Pass"
        />
      )}

      {/* Main Grid: Inputs on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        {/* Left Column: Context & Input Form */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center justify-between">
              <span>Delegation & Committee Setup</span>
              <span className="text-xs font-normal text-slate-400">Customizable</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              {/* Committee Selector Dropdown & Mobile Bottom Sheet Trigger */}
              <div>
                <label 
                  htmlFor="select-paper-committee"
                  className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1"
                >
                  <span>Committee Forum / Legislative Body</span>
                  <button
                    type="button"
                    onClick={() => setShowCommitteePicker(true)}
                    className="sm:hidden text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search list</span>
                  </button>
                </label>
                
                {/* Mobile Tap Button that opens BottomSheetPicker */}
                <button
                  type="button"
                  onClick={() => setShowCommitteePicker(true)}
                  className="sm:hidden w-full min-h-[48px] p-3 text-left rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center justify-between touch-press"
                >
                  <span className="truncate pr-2">{currentComm.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Desktop Native Select */}
                <div className="relative hidden sm:block">
                  <select
                    id="select-paper-committee"
                    value={context.committee}
                    onChange={handleCommitteeChange}
                    className="w-full min-h-[44px] p-3 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
                  >
                    {UN_COMMITTEES.map((comm) => (
                      <option key={comm.id} value={comm.id}>
                        {comm.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Committee Mandate Info Pill */}
              {currentComm && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold block">Mandate:</span>
                    <span className="line-clamp-2 sm:line-clamp-none">{currentComm.mandate}</span>
                  </div>
                </div>
              )}

              {/* Country / Member / NCB */}
              {!isPNA && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label 
                    htmlFor="input-paper-country"
                    className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    {isINTERPOL ? 'Member Country / National Central Bureau (NCB)' : 'Country / Sovereign State'}
                  </label>
                  <input
                    id="input-paper-country"
                    type="text"
                    value={context.country}
                    onChange={(e) => onUpdateContext && onUpdateContext({ country: e.target.value })}
                    placeholder={isINTERPOL ? 'e.g. France (NCB Paris)' : 'e.g. Pakistan, United States, Brazil'}
                    className="w-full min-h-[48px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                  />
                </div>
              )}

              {isPNA && (
                <div>
                  <label 
                    htmlFor="input-paper-party"
                    className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    Political Party
                  </label>
                  <select
                    id="input-paper-party"
                    value={context.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]}
                    onChange={(e) => onUpdateContext && onUpdateContext({ politicalParty: e.target.value })}
                    className="w-full min-h-[48px] p-3 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
                  >
                    {PAKISTAN_POLITICAL_PARTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Agenda Topic Input */}
              <div>
                <label 
                  htmlFor="input-paper-topic"
                  className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Agenda Topic
                </label>
                <input
                  id="input-paper-topic"
                  type="text"
                  value={context.topic}
                  onChange={(e) => onUpdateContext && onUpdateContext({ topic: e.target.value })}
                  placeholder="Enter specific crisis agenda or debate item..."
                  className="w-full min-h-[48px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                />
              </div>

              {/* Answer / Output Language */}
              <div>
                <label 
                  htmlFor="select-paper-language"
                  className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1"
                >
                  <span>Answer / Output Language</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Multilingual</span>
                </label>
                <div className="relative">
                  <select
                    id="select-paper-language"
                    value={context.language || 'English'}
                    onChange={(e) => onUpdateContext && onUpdateContext({ language: e.target.value as SupportedLanguage })}
                    className="w-full min-h-[48px] p-3 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.flag} {lang.label} ({lang.native})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Collapsible Key Stance Points Accordion */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsStanceExpanded(!isStanceExpanded)}
                className="w-full flex items-center justify-between py-2 text-left touch-press"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Key Stance Directives (Optional)
                  </span>
                  {stancePoints.trim() && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{isStanceExpanded ? 'Hide' : 'Add custom points'}</span>
                  {isStanceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isStanceExpanded && (
                <div className="space-y-2 mt-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-end">
                    <button
                      id="btn-load-sample-points"
                      type="button"
                      onClick={handleLoadSample}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold hover:underline min-h-[32px] flex items-center"
                    >
                      Load sample points
                    </button>
                  </div>
                  <textarea
                    id="input-stance-points"
                    rows={4}
                    value={stancePoints}
                    onChange={(e) => setStancePoints(e.target.value)}
                    placeholder={
                      isPNA
                        ? "Constituency priorities (e.g., Article 160 NFC award, CCI water distribution)..."
                        : isUNICEF
                        ? "Child welfare priorities (e.g., CRC obligations, RUTF local production)..."
                        : isINTERPOL
                        ? "Law enforcement directives (e.g., I-24/7 telemetry exchange, Red Notice integrity)..."
                        : "Bullet points or specific doctrines your delegation wants included..."
                    }
                    className="w-full p-3 text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100 resize-none leading-relaxed transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Primary Action Button (Normal full-width at end of form, not sticky) */}
            <div className="pt-2">
              <button
                id="btn-generate-position-paper"
                onClick={handleGenerate}
                disabled={isGenerating || isLimitBlocked}
                className="w-full min-h-[48px] py-3 px-4 bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-50 active:scale-98 touch-press"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                    <span>Drafting Position Paper...</span>
                  </>
                ) : isLimitBlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Free Limit Reached — Upgrade to Draft</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-[#D4AF37]" />
                    <span>
                      {isPNA
                        ? 'Draft Parliamentary Policy Brief'
                        : isUNICEF
                        ? 'Draft UNICEF Policy Paper'
                        : isINTERPOL
                        ? 'Draft Law Enforcement Dossier'
                        : 'Draft Full Position Paper'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips Card tailored to committee - Collapsible on Mobile */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071326] border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 space-y-2 transition-colors">
            <button
              type="button"
              onClick={() => setIsGuidelinesExpanded(!isGuidelinesExpanded)}
              className="w-full flex items-center justify-between text-left touch-press"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#0B1F3A] dark:text-[#D4AF37]" />
                <span>
                  {isPNA
                    ? 'Parliamentary Format Guide'
                    : isUNICEF
                    ? 'UNICEF Board Guidelines'
                    : isINTERPOL
                    ? 'INTERPOL Dossier Standard'
                    : 'UN 4-Part Structure Guide'}
                </span>
              </p>
              <div className="sm:hidden text-slate-400">
                {isGuidelinesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            <div className={`${isGuidelinesExpanded ? 'block' : 'hidden sm:block'} pt-1`}>
              {isPNA ? (
                <p className="text-xs leading-relaxed space-y-1">
                  1. <strong>Legislative Genesis:</strong> 1973 Constitution & 18th Amendment<br/>
                  2. <strong>Parliamentary Stance:</strong> Constituency priorities & NFC allocations<br/>
                  3. <strong>Existing Framework:</strong> Acts of Parliament & PAC scrutiny<br/>
                  4. <strong>Proposed Solutions:</strong> Statutory bills & CCI coordination
                </p>
              ) : isUNICEF ? (
                <p className="text-xs leading-relaxed space-y-1">
                  1. <strong>Humanitarian Context:</strong> CRC rights & pediatric metrics<br/>
                  2. <strong>Child Rights Doctrine:</strong> Sovereign social protection commitments<br/>
                  3. <strong>Protection Initiatives:</strong> National statutes & UNICEF partnerships<br/>
                  4. <strong>Field Programs:</strong> Therapeutic pipelines & safe learning spaces
                </p>
              ) : isINTERPOL ? (
                <p className="text-xs leading-relaxed space-y-1">
                  1. <strong>Threat Assessment:</strong> Cross-border syndicate methodology<br/>
                  2. <strong>NCB Posture:</strong> I-24/7 database interoperability & notice standards<br/>
                  3. <strong>Operational Record:</strong> Global strike operations & crypto seizures<br/>
                  4. <strong>Tactical Directives:</strong> Real-time alerts & digital forensics vaults
                </p>
              ) : (
                <p className="text-xs leading-relaxed space-y-1">
                  1. <strong>Background:</strong> Historical roots & UN conventions<br/>
                  2. <strong>National Stance:</strong> Sovereign geopolitical interests<br/>
                  3. <strong>Past Actions:</strong> Domestic & international treaties<br/>
                  4. <strong>Proposed Solutions:</strong> Operative, actionable proposals
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Output / Rich Editor */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full min-h-[520px] transition-colors overflow-hidden">
            {/* Output Toolbar */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-[#0b1b33] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Dossier Output
                </span>
                {generatedText && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                    {wordCount} words
                  </span>
                )}
              </div>

              {generatedText && (
                <DocumentActionBar
                  documentTitle={`${context.country} - ${currentComm.id} Position Paper`}
                  content={generatedText}
                  onExportWord={handleExportWord}
                  onExportPDF={handleExportPDF}
                />
              )}
            </div>

            {/* Editable Content Area */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
              {isGenerating ? (
                <SkeletonLoader
                  title={`Drafting ${context.country} Position Paper...`}
                  steps={[
                    `Analyzing ${currentComm.id} mandate & past resolutions...`,
                    `Synthesizing ${context.country} foreign policy & treaties...`,
                    'Drafting operative clauses & bilateral solutions...',
                    'Formatting diplomatic headings & preamble...'
                  ]}
                />
              ) : generatedText ? (
                <div className="relative flex-1 flex flex-col min-h-[440px]">
                  {/* Save Draft Toolbar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 dark:bg-[#0b1b33] border border-b-0 border-slate-200 dark:border-slate-800 rounded-t-xl text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#0B1F3A] dark:text-[#D4AF37] shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Editable Diplomatic Paper
                      </span>
                    </div>

                    <button
                      id="btn-save-draft"
                      onClick={handleSaveDraft}
                      className="px-2.5 py-1 min-h-[32px] rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors touch-press"
                      title="Save to My Archive"
                    >
                      <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
                    </button>
                  </div>

                  {/* Textarea formatted for reading & editing */}
                  <textarea
                    id="position-paper-textarea"
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="w-full flex-1 p-4 text-base sm:text-[17px] leading-relaxed border border-slate-200 dark:border-slate-800 rounded-b-xl bg-white dark:bg-[#0b1b33] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] resize-none"
                    placeholder="Your position paper will appear here..."
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl m-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                    Ready to Draft Your Paper
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 px-4">
                    Tap the button below to generate a formatted UN position paper tailored to {context.country}'s geopolitical stance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet for Committee Selection */}
      <BottomSheetPicker
        isOpen={showCommitteePicker}
        onClose={() => setShowCommitteePicker(false)}
        title="Select Committee / Forum"
        options={committeePickerOptions}
        selectedValue={context.committee}
        onSelect={handleCommitteeSelect}
        placeholder="Search committees (UNSC, PNA, UNICEF...)"
      />
    </div>
  );
};
