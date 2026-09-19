import React, { useState } from 'react';
import { DelegateContext, User, PositionPaperDraft, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../types';
import { UN_COMMITTEES, PAKISTAN_POLITICAL_PARTIES } from '../../data/unPresets';
import { api } from '../../services/api';
import { exportDocumentToPDF, exportDocumentToWord, copyToClipboard } from '../../utils/exportUtils';
import { ErrorAlert } from '../ErrorAlert';
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
  ChevronDown
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

  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    console.log('[Yeilded] Committee selected:', selectedId);
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#071326] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
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
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            Position Paper Generator
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {isPNA
              ? 'Draft an authentic Pakistani parliamentary policy brief tailored to constitutional mandates, provincial equity, and statutory legislation.'
              : isUNICEF
              ? 'Draft an official UNICEF Executive Board policy paper anchored in the Convention on the Rights of the Child, humanitarian access, and field programs.'
              : isINTERPOL
              ? 'Draft an INTERPOL law enforcement dossier with operational threat assessments, I-24/7 intelligence, and cross-border police protocols.'
              : 'Draft an official four-section MUN position paper formatted with formal UN conventions, citations, and strategic sovereign proposals.'}
          </p>
        </div>

        {/* Free Tier Tracker Pill */}
        {isFree && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3 shrink-0">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context & Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#071326] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center justify-between">
              <span>Delegation & Committee Setup</span>
              <span className="text-xs font-normal text-slate-400">Customizable</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              {/* Committee Selector Dropdown */}
              <div>
                <label 
                  htmlFor="select-paper-committee"
                  className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Committee Forum / Legislative Body
                </label>
                <div className="relative">
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
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Mandate:</span>
                    <span>{currentComm.mandate}</span>
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
                    className="w-full min-h-[44px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
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
                    className="w-full min-h-[44px] p-3 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
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
                  className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Agenda Topic
                </label>
                <input
                  id="input-paper-topic"
                  type="text"
                  value={context.topic}
                  onChange={(e) => onUpdateContext && onUpdateContext({ topic: e.target.value })}
                  placeholder="Enter specific crisis agenda or debate item..."
                  className="w-full min-h-[44px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                />
              </div>

              {/* Answer / Output Language */}
              <div>
                <label 
                  htmlFor="select-paper-language"
                  className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1"
                >
                  <span>Answer / Output Language</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Roman Urdu & Multilingual</span>
                </label>
                <div className="relative">
                  <select
                    id="select-paper-language"
                    value={context.language || 'English'}
                    onChange={(e) => onUpdateContext && onUpdateContext({ language: e.target.value as SupportedLanguage })}
                    className="w-full min-h-[44px] p-3 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
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

            {/* Optional Key Stance Points */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Key Stance Points (Optional)
                </label>
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
                    ? "Constituency priorities (e.g., Article 160 NFC award, CCI water distribution, flood rehabilitation PSDP grants)..."
                    : isUNICEF
                    ? "Child welfare priorities (e.g., CRC obligations, RUTF local production, mobile learning centers, child labor bans)..."
                    : isINTERPOL
                    ? "Law enforcement directives (e.g., I-24/7 telemetry exchange, Red Notice integrity, joint cyber operations, forensic vaults)..."
                    : "Bullet points or specific doctrines your delegation wants included (e.g. prioritize sovereignty, propose multilateral fund, oppose sanctions)..."
                }
                className="w-full p-3 text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Action Button */}
            <button
              id="btn-generate-position-paper"
              onClick={handleGenerate}
              disabled={isGenerating || isLimitBlocked}
              className="w-full min-h-[44px] py-3 px-4 bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-50 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                  <span>DeepSeek Drafting Position Paper...</span>
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

          {/* Tips Card tailored to committee */}
          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-[#071326] border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 space-y-1.5 transition-colors">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0B1F3A] dark:text-[#D4AF37]" />
              <span>
                {isPNA
                  ? 'Pakistani Parliamentary Brief Format:'
                  : isUNICEF
                  ? 'UNICEF Executive Board Format:'
                  : isINTERPOL
                  ? 'INTERPOL Law Enforcement Dossier Format:'
                  : 'UN Standard Four-Part Format:'}
              </span>
            </p>
            {isPNA ? (
              <p className="text-xs leading-relaxed">
                1. <strong>Legislative Genesis:</strong> 1973 Constitution & 18th Amendment<br/>
                2. <strong>Parliamentary Stance:</strong> Constituency priorities & NFC fiscal allocations<br/>
                3. <strong>Existing Framework:</strong> Acts of Parliament & PAC scrutiny<br/>
                4. <strong>Proposed Solutions:</strong> Statutory bills & CCI coordination
              </p>
            ) : isUNICEF ? (
              <p className="text-xs leading-relaxed">
                1. <strong>Humanitarian Context:</strong> CRC rights & pediatric metrics<br/>
                2. <strong>Child Rights Doctrine:</strong> Sovereign social protection commitments<br/>
                3. <strong>Protection Initiatives:</strong> National statutes & UNICEF partnerships<br/>
                4. <strong>Field Programs:</strong> Therapeutic pipelines & safe learning spaces
              </p>
            ) : isINTERPOL ? (
              <p className="text-xs leading-relaxed">
                1. <strong>Threat Assessment:</strong> Cross-border syndicate methodology<br/>
                2. <strong>NCB Posture:</strong> I-24/7 database interoperability & notice standards<br/>
                3. <strong>Operational Record:</strong> Global strike operations & crypto seizures<br/>
                4. <strong>Tactical Directives:</strong> Real-time alerts & digital forensics vaults
              </p>
            ) : (
              <p className="text-xs leading-relaxed">
                1. <strong>Background:</strong> Historical roots & UN conventions<br/>
                2. <strong>National Stance:</strong> Sovereign geopolitical interests<br/>
                3. <strong>Past Actions:</strong> Domestic & international treaties<br/>
                4. <strong>Proposed Solutions:</strong> Operative, actionable proposals
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Output / Rich Editor */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full min-h-[580px] transition-colors">
            {/* Output Toolbar */}
            <div className="p-4 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0b1b33] rounded-t-2xl transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Document Output
                </span>
                {generatedText && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                    {wordCount} words
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-copy-toolbar"
                  onClick={handleCopy}
                  disabled={!generatedText}
                  className={`px-3 py-1.5 min-h-[38px] rounded-lg border text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-40 active:scale-98 ${
                    copied
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Copy full text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-save-draft"
                  onClick={handleSaveDraft}
                  disabled={!generatedText}
                  className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-98"
                  title="Save to My Archive"
                >
                  <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
                </button>

                <button
                  id="btn-export-docx"
                  onClick={handleExportWord}
                  disabled={!generatedText}
                  className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOCX</span>
                </button>

                <button
                  id="btn-export-pdf"
                  onClick={handleExportPDF}
                  disabled={!generatedText}
                  className="px-3 py-1.5 min-h-[38px] rounded-lg bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Editable Content Area */}
            <div className="p-4 flex-1 flex flex-col">
              {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-[#0B1F3A] dark:border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      Drafting Diplomatic Position Paper
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Synthesizing international treaties, {context.country} foreign policy doctrines, and operative solutions via DeepSeek...
                    </p>
                  </div>
                </div>
              ) : generatedText ? (
                <div className="relative flex-1 flex flex-col min-h-[440px]">
                  {/* Dedicated Rich Text Action Bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 dark:bg-[#0b1b33] border border-b-0 border-slate-200 dark:border-slate-800 rounded-t-xl text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#0B1F3A] dark:text-[#D4AF37]" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">UN Diplomatic Paper (Editable)</span>
                      <span className="hidden sm:inline text-slate-400 dark:text-slate-500">• Ready for Word / Google Docs</span>
                    </div>

                    {/* Prominent Copy to Clipboard Button on the Editor itself */}
                    <button
                      id="btn-copy-to-clipboard-editor"
                      type="button"
                      onClick={handleCopy}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-sm font-bold transition-all shadow-xs cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 text-white shadow-emerald-200'
                          : 'bg-[#0B1F3A] hover:bg-[#15345d] text-[#D4AF37] hover:text-amber-200 active:scale-95'
                      }`}
                      title="Copy full position paper to clipboard to paste into document editors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    id="position-paper-textarea"
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="w-full flex-1 p-4 text-sm leading-relaxed border border-slate-200 dark:border-slate-800 rounded-b-xl bg-white dark:bg-[#0b1b33] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] resize-none"
                    placeholder="Your position paper will appear here..."
                  />

                  {/* Visual Toast Notification on Copy */}
                  {copied && (
                    <div className="absolute bottom-4 right-4 bg-[#0B1F3A] text-white text-sm px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500/50 animate-in fade-in slide-in-from-bottom-2 z-10">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">Position paper copied to clipboard. Ready to paste!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2">
                  <FileText className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                    No Position Paper Generated Yet
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Click "Draft Full Position Paper" on the left to create a UN-formatted diplomatic dossier for {context.country}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
