import React, { useState, useEffect, useRef } from 'react';
import { DelegateContext, User, SpeechType, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../types';
import { api } from '../../services/api';
import { exportDocumentToPDF, exportDocumentToWord, copyToClipboard } from '../../utils/exportUtils';
import { ErrorAlert } from '../ErrorAlert';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Save,
  Check,
  Clock,
  Volume2,
  Lock,
  Flame,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

interface SpeechWriterTabProps {
  context: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onUpdateUser: (u: User) => void;
}

export const SpeechWriterTab: React.FC<SpeechWriterTabProps> = ({
  context,
  onUpdateContext,
  user,
  onOpenAuth,
  onOpenPricing,
  onUpdateUser
}) => {
  const [speechType, setSpeechType] = useState<SpeechType>('opening');
  const [timeLimit, setTimeLimit] = useState<number>(90); // seconds
  const [tone, setTone] = useState<'formal' | 'passionate' | 'conciliatory' | 'assertive'>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [targetWords, setTargetWords] = useState(195);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Practice Mode state
  const [isPracticing, setIsPracticing] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(90);
  const [currentPaceWpm, setCurrentPaceWpm] = useState(0);

  const timerRef = useRef<any>(null);

  const isFree = !user || user.tier === 'free';
  const freeLeft = user ? Math.max(0, 3 - user.generationsUsed) : 3;
  const isLimitBlocked = isFree && freeLeft === 0;

  // Expected words based on 130 words/minute
  const estimatedTargetWords = Math.round((timeLimit / 60) * 130);
  const actualWords = speechText.trim() ? speechText.trim().split(/\s+/).length : 0;

  // Timer logic for Practice Mode
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const handleStartPractice = () => {
    setSecondsRemaining(timeLimit);
    setIsPracticing(true);
    setTimerRunning(true);
  };

  const handleResetPractice = () => {
    setTimerRunning(false);
    setSecondsRemaining(timeLimit);
  };

  const handleGenerateSpeech = async () => {
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
    setSaved(false);

    try {
      const res = await api.generateAI('speech', {
        speechType,
        country: context.country,
        committee: context.committee,
        topic: context.topic,
        tone,
        timeLimitSeconds: timeLimit,
        language: context.language || 'English'
      });

      if (res.result) {
        setSpeechText(res.result);
      }
      if (res.targetWords) {
        setTargetWords(res.targetWords);
      }
      if (res.user) {
        onUpdateUser(res.user);
      }
    } catch (err: any) {
      if (err.isFreeTierLimit || err.code === 'LIMIT_REACHED') {
        setErrorMsg(err.message || 'Free limit reached. Please activate a Conference Pass.');
      } else {
        setErrorMsg(err.message || 'Speech generation failed. Please check network.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!speechText) return;
    const ok = await copyToClipboard(speechText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSpeech = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!speechText) return;

    try {
      await api.saveSpeech({
        title: `${context.country} - ${speechType.toUpperCase()} (${timeLimit}s)`,
        speechType,
        country: context.country,
        committee: context.committee,
        topic: context.topic,
        timeLimitSeconds: timeLimit,
        wordCount: actualWords,
        tone,
        text: speechText
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErrorMsg('Failed to save speech to library.');
    }
  };

  const handleExportPDF = () => {
    if (!speechText) return;
    exportDocumentToPDF({
      title: `${context.country} - ${speechType.toUpperCase()} Speech`,
      country: context.country,
      committee: context.committee,
      topic: context.topic,
      type: 'Speech',
      content: speechText
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#071326] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
            <Mic className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>ORATORY & SPEECHWRITING ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            Diplomatic Speech Writer & Teleprompter
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Generate calibrated MUN speeches scaled to your allocated speaking time with live practice mode and teleprompter timer.
          </p>
        </div>

        {isFree && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
              {freeLeft}
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {freeLeft > 0 ? `${freeLeft} of 3 Free Generations Left` : 'Free Limit Reached'}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">Tracks position papers & speeches</p>
            </div>
            {isLimitBlocked && (
              <button
                id="btn-speech-upgrade-free"
                onClick={onOpenPricing}
                className="ml-2 px-3 py-1.5 min-h-[36px] bg-[#0B1F3A] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] font-bold text-sm rounded-lg active:scale-98"
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

      {/* Main Form & Speech Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#071326] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Speech Parameters
            </h3>

            {/* Speech Type */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Speech Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'opening', label: 'Opening Statement', hint: '60-90s initial hook' },
                  { id: 'gsl', label: 'General Speakers List', hint: '90s comprehensive stance' },
                  { id: 'rebuttal', label: 'Point of Reply / Rebuttal', hint: '45-60s sharp retort' },
                  { id: 'closing', label: 'Closing Statement', hint: '60s final appeal' }
                ].map((st) => (
                  <button
                    key={st.id}
                    id={`btn-speech-type-${st.id}`}
                    type="button"
                    onClick={() => {
                      setSpeechType(st.id as SpeechType);
                      if (st.id === 'rebuttal') setTimeLimit(45);
                      else if (st.id === 'opening' || st.id === 'closing') setTimeLimit(60);
                      else setTimeLimit(90);
                    }}
                    className={`p-3 min-h-[44px] rounded-xl border text-left transition-all ${
                      speechType === st.id
                        ? 'border-[#0B1F3A] dark:border-[#D4AF37] bg-blue-50/70 dark:bg-[#07172e] font-semibold text-[#0B1F3A] dark:text-[#D4AF37] ring-2 ring-[#0B1F3A]/20 dark:ring-[#D4AF37]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b1b33]'
                    }`}
                  >
                    <div className="text-sm font-bold">{st.label}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{st.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Speaker Time Limit
                </label>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {timeLimit}s (~{estimatedTargetWords} words)
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[30, 45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    id={`btn-time-limit-${sec}`}
                    type="button"
                    onClick={() => setTimeLimit(sec)}
                    className={`flex-1 py-2 min-h-[38px] rounded-lg text-sm font-bold transition-all ${
                      timeLimit === sec
                        ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] shadow-xs'
                        : 'bg-slate-100 dark:bg-[#0b1b33] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Diplomatic Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'formal', label: 'Formal & Measured', desc: 'Objective legal consensus' },
                  { id: 'assertive', label: 'Assertive & Firm', desc: 'Defends sovereign red lines' },
                  { id: 'conciliatory', label: 'Conciliatory & Bridge-Building', desc: 'Unites opposing blocs' },
                  { id: 'passionate', label: 'Passionate & Urgent', desc: 'Humanitarian appeal' }
                ].map((t) => (
                  <button
                    key={t.id}
                    id={`btn-tone-${t.id}`}
                    type="button"
                    onClick={() => setTone(t.id as any)}
                    className={`p-3 min-h-[44px] rounded-lg border text-left text-sm transition-all ${
                      tone === t.id
                        ? 'border-[#D4AF37] bg-amber-50/70 dark:bg-amber-950/30 font-bold text-slate-900 dark:text-white ring-1 ring-[#D4AF37]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0b1b33]'
                    }`}
                  >
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Language Selector */}
            <div>
              <label 
                htmlFor="select-speech-language"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between"
              >
                <span>Answer / Delivery Language</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold normal-case">Roman Urdu & Multilingual</span>
              </label>
              <div className="relative">
                <select
                  id="select-speech-language"
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

            {/* Generate Action */}
            <button
              id="btn-generate-speech"
              onClick={handleGenerateSpeech}
              disabled={isGenerating || isLimitBlocked}
              className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] dark:hover:bg-[#153863] text-[#D4AF37] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-50 active:scale-98"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                  <span>DeepSeek Drafting Speech ({estimatedTargetWords} words)...</span>
                </>
              ) : isLimitBlocked ? (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Free Limit Reached — Upgrade to Continue</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-[#D4AF37]" />
                  <span>Generate Scaled Speech</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Practice Mode */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full min-h-[580px] transition-colors">
            {/* Output Header */}
            <div className="p-4 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0b1b33] rounded-t-2xl transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Speech Script
                </span>
                {speechText && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                    {actualWords} words (~{Math.round((actualWords / 130) * 60)}s read time)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {speechText && (
                  <button
                    id="btn-speech-practice-toggle"
                    onClick={() => {
                      if (!isPracticing) handleStartPractice();
                      else setIsPracticing(false);
                    }}
                    className={`px-3 py-1.5 min-h-[38px] rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all active:scale-98 ${
                      isPracticing
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPracticing ? 'Exit Practice' : 'Practice Mode'}</span>
                  </button>
                )}

                <button
                  id="btn-speech-copy"
                  onClick={handleCopy}
                  disabled={!speechText}
                  className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-98"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  id="btn-speech-save"
                  onClick={handleSaveSpeech}
                  disabled={!speechText}
                  className="px-2.5 py-1.5 min-h-[38px] rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-98"
                >
                  <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{saved ? 'Saved!' : 'Save'}</span>
                </button>

                <button
                  id="btn-speech-pdf"
                  onClick={handleExportPDF}
                  disabled={!speechText}
                  className="px-3 py-1.5 min-h-[38px] rounded-lg bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Practice Mode Live Bar */}
            {isPracticing && (
              <div className="p-4 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#D4AF37]/40 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-2xl font-black font-mono px-3 py-1 rounded-lg ${
                      secondsRemaining <= 10
                        ? 'bg-rose-600 text-white animate-pulse'
                        : secondsRemaining <= 30
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/10 text-[#D4AF37]'
                    }`}
                  >
                    {formatTimer(secondsRemaining)}
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Teleprompter Countdown</span>
                    <span className="text-xs text-slate-300">
                      Standard pace: 120–135 words/min
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-practice-pause-resume"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={timerRunning ? 'Pause timer' : 'Resume timer'}
                    aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    id="btn-practice-reset"
                    onClick={handleResetPractice}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Reset countdown"
                    aria-label="Reset countdown"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
              {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-[#0B1F3A] dark:border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      Calibrating Diplomatic Speech
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      Pacing rhetoric to exactly {timeLimit} seconds with formal salutations and parliamentary yield...
                    </p>
                  </div>
                </div>
              ) : speechText ? (
                <textarea
                  id="speech-script-textarea"
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  className={`w-full flex-1 p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0b1b33] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] resize-none leading-relaxed transition-all ${
                    isPracticing ? 'text-base sm:text-lg tracking-wide bg-amber-50/20 dark:bg-amber-950/20' : 'text-sm'
                  }`}
                  placeholder="Your generated speech script..."
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2">
                  <Mic className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                    No Speech Generated Yet
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Select your speech type and time limit on the left to draft a speech tailored for {context.country}.
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
