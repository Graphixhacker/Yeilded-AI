import React, { useState, useEffect, useRef } from 'react';
import { DelegateContext, User, StudyGuide, StudyGuideSummary, TabType } from '../../types';
import { UN_COMMITTEES } from '../../data/unPresets';
import { api } from '../../services/api';
import { ErrorAlert } from '../ErrorAlert';
import {
  BookOpen,
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Clock,
  Lock,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Scale,
  Calendar,
  HelpCircle,
  FileUp,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface StudyGuideTabProps {
  context: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onNavigate?: (tab: TabType) => void;
}

export const StudyGuideTab: React.FC<StudyGuideTabProps> = ({
  context,
  onUpdateContext,
  user,
  onOpenAuth,
  onOpenPricing,
  onNavigate
}) => {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(1);
  const [currentCount, setCurrentCount] = useState(0);
  const [canAdd, setCanAdd] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload / Creation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(context.committee || 'UNSC');
  const [customCommitteeName, setCustomCommitteeName] = useState('');
  const [topic, setTopic] = useState(context.topic || '');
  const [inputType, setInputType] = useState<'pdf' | 'text'>('pdf');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');

  // Editing State
  const [editingGuide, setEditingGuide] = useState<StudyGuide | null>(null);
  const [editSummary, setEditSummary] = useState<StudyGuideSummary>({
    rules_of_procedure: '',
    key_facts: '',
    existing_laws_and_gaps: '',
    past_events: '',
    questions_to_answer: ''
  });
  const [editTopic, setEditTopic] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Expanded View State
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [showRawTextId, setShowRawTextId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFree = !user || user.tier === 'free';

  // Load guides
  const loadGuides = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getStudyGuides();
      setGuides(res.guides || []);
      setLimit(res.limit || (user.tier === 'free' ? 1 : 5));
      setCurrentCount(res.currentCount || (res.guides ? res.guides.length : 0));
      setCanAdd(res.canAdd ?? true);
    } catch (err: any) {
      console.error('Failed to load study guides:', err);
      setErrorMsg(err.message || 'Unable to load study guides.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, [user]);

  // Sync committee selection with delegate context when context changes
  useEffect(() => {
    if (context.committee) {
      setSelectedCommittee(context.committee);
    }
    if (context.topic) {
      setTopic(context.topic);
    }
  }, [context.committee, context.topic]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('PDF file exceeds the 10MB size limit.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    // Read as Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read PDF file. Please try again or paste text.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('PDF file exceeds the 10MB size limit.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read PDF file. Please try again or paste text.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!canAdd) {
      onOpenPricing();
      return;
    }

    const resolvedCommittee = selectedCommittee === 'CUSTOM'
      ? customCommitteeName.trim()
      : selectedCommittee;

    if (!resolvedCommittee) {
      setErrorMsg('Please specify or select a committee.');
      return;
    }

    if (inputType === 'pdf') {
      if (!selectedFile || !fileBase64) {
        setErrorMsg('Please select a PDF study guide to upload.');
        return;
      }
    } else {
      if (pastedText.trim().length < 500) {
        setErrorMsg(`Pasted text is too short (${pastedText.trim().length} chars). Please paste at least 500 characters of background material.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setUploadStep('Extracting background text & analyzing with DeepSeek AI...');

    try {
      const payload: any = {
        committeeId: resolvedCommittee,
        committeeName: resolvedCommittee,
        topic: topic.trim(),
        inputType
      };

      if (inputType === 'pdf') {
        payload.pdfBase64 = fileBase64;
        payload.fileName = selectedFile?.name || 'study_guide.pdf';
        payload.fileSize = selectedFile?.size || 0;
      } else {
        payload.text = pastedText.trim();
        payload.fileName = 'pasted_study_guide.txt';
        payload.fileSize = new Blob([pastedText]).size;
      }

      const res = await api.uploadStudyGuide(payload);
      setGuides(res.guides || []);
      setCurrentCount(res.currentCount || (res.guides ? res.guides.length : 0));
      setLimit(res.limit || limit);
      setCanAdd(res.canAdd ?? true);
      setSuccessMsg('Study guide successfully summarized and linked to ' + resolvedCommittee + '!');
      setTimeout(() => setSuccessMsg(null), 5000);

      // Reset form
      setIsModalOpen(false);
      setSelectedFile(null);
      setFileBase64(null);
      setPastedText('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Auto-expand the newly created guide
      if (res.guide?.id) {
        setExpandedGuideId(res.guide.id);
      }
    } catch (err: any) {
      console.error('Upload study guide error:', err);
      setErrorMsg(err.message || 'Failed to process study guide. Please verify the content and try again.');
    } finally {
      setIsSubmitting(false);
      setUploadStep('');
    }
  };

  const handleDelete = async (id: string, committeeName: string) => {
    if (!window.confirm(`Are you sure you want to delete the study guide for ${committeeName}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.deleteStudyGuide(id);
      setGuides(res.guides || []);
      setCurrentCount(res.currentCount || 0);
      setLimit(res.limit || limit);
      setCanAdd(res.canAdd ?? true);
      if (expandedGuideId === id) setExpandedGuideId(null);
      setSuccessMsg(`Study guide for ${committeeName} deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete study guide.');
    }
  };

  const handleStartEdit = (guide: StudyGuide) => {
    setEditingGuide(guide);
    setEditSummary({
      rules_of_procedure: guide.summary?.rules_of_procedure || '',
      key_facts: guide.summary?.key_facts || '',
      existing_laws_and_gaps: guide.summary?.existing_laws_and_gaps || '',
      past_events: guide.summary?.past_events || '',
      questions_to_answer: guide.summary?.questions_to_answer || ''
    });
    setEditTopic(guide.topic || '');
  };

  const handleSaveEdit = async () => {
    if (!editingGuide) return;
    setIsSavingEdit(true);
    setErrorMsg(null);
    try {
      const res = await api.updateStudyGuide(editingGuide.id, {
        summary: editSummary,
        topic: editTopic.trim()
      });
      setGuides((prev) => prev.map((g) => (g.id === editingGuide.id ? res.guide : g)));
      setEditingGuide(null);
      setSuccessMsg('Study guide summary updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update study guide summary.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUseInDrafting = (guide: StudyGuide, targetTab: TabType) => {
    if (onUpdateContext) {
      onUpdateContext({
        committee: guide.committeeId || guide.committeeName,
        topic: guide.topic || context.topic
      });
    }
    if (onNavigate) {
      onNavigate(targetTab);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div id="study-guide-tab" className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white dark:bg-[#0c1a2e] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                My Study Guides
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-Injected
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Upload your committee background PDF or paste guide text. DeepSeek synthesizes your guide into 5-part diplomatic intelligence and automatically injects it into your <span className="font-semibold text-slate-900 dark:text-white">Position Papers</span>, <span className="font-semibold text-slate-900 dark:text-white">Speeches</span>, <span className="font-semibold text-slate-900 dark:text-white">Resolution Clauses</span>, and <span className="font-semibold text-slate-900 dark:text-white">Debate Practice</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Quota Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Guide Slots:</span>
              <span className={`font-bold ${currentCount >= limit ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {currentCount} / {limit} Used
              </span>
              {isFree && currentCount >= limit && (
                <button
                  onClick={onOpenPricing}
                  className="ml-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <Zap className="w-3 h-3" /> Upgrade to 5
                </button>
              )}
            </div>

            {/* Add Guide Button */}
            <button
              id="add-study-guide-btn"
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                if (!canAdd) {
                  onOpenPricing();
                  return;
                }
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132c52] dark:bg-[#D4AF37] dark:hover:bg-[#c29e2f] text-white dark:text-[#0B1F3A] font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Add Study Guide</span>
            </button>
          </div>
        </div>

        {/* Live Safety and Reference Explanation */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong className="text-slate-700 dark:text-slate-300">Prompt Isolation:</strong> Guides are safely fenced within <code>&lt;guide&gt;</code> tags and treated strictly as factual reference data.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span><strong className="text-slate-700 dark:text-slate-300">Zero Configuration:</strong> Selecting this committee anywhere in MUN Companion automatically incorporates this guide.</span>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span><strong className="text-slate-700 dark:text-slate-300">Smart Chunking:</strong> Long documents up to 50 pages are recursively summarized and merged without data loss.</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error Notice</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {errorMsg.toLowerCase().includes('plan limit') && (
              <button
                onClick={onOpenPricing}
                className="px-3 py-1.5 min-h-[36px] bg-[#0B1F3A] dark:bg-[#0f2a4a] text-[#D4AF37] font-bold text-xs rounded-lg shadow-xs border border-[#D4AF37]/30"
              >
                Upgrade Plan
              </button>
            )}
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Not Signed In Banner */}
      {!user && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Required</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Please sign in or create a free account to upload study guides, view AI-structured summaries, and automatically inject committee data into your drafts.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132c52] text-white text-sm font-semibold shadow-sm transition"
          >
            Sign In / Register Free
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && user && (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500">Loading your saved study guides...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && user && guides.length === 0 && (
        <div className="p-10 sm:p-14 text-center bg-white dark:bg-[#0c1a2e] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Study Guides Added Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload your official committee guide PDF (up to 10MB, 50 pages) or paste background text to give your AI assistants authoritative, committee-specific context.
            </p>
          </div>
          <button
            id="empty-state-upload-btn"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132c52] dark:bg-[#D4AF37] dark:hover:bg-[#c29e2f] text-white dark:text-[#0B1F3A] font-semibold text-sm shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Your First Study Guide</span>
          </button>
        </div>
      )}

      {/* List of Saved Guides */}
      {!isLoading && user && guides.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Committee Guides ({guides.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click any guide to view or edit the AI intelligence breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {guides.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              const isCurrentActiveCommittee =
                (context.committee || '').toLowerCase() === (guide.committeeName || '').toLowerCase() ||
                (context.committee || '').toLowerCase() === (guide.committeeId || '').toLowerCase();

              return (
                <div
                  key={guide.id}
                  className={`bg-white dark:bg-[#0c1a2e] rounded-2xl border transition-all overflow-hidden ${
                    isCurrentActiveCommittee
                      ? 'border-blue-500/60 dark:border-blue-500/60 shadow-md ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Guide Header Card */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase">
                          {guide.committeeName}
                        </span>
                        {isCurrentActiveCommittee && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active in Current Session
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {guide.fileName}
                        </span>
                        {guide.pageCount && guide.pageCount > 1 && (
                          <span className="text-xs text-slate-400">
                            • {guide.pageCount} pages
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          • {formatFileSize(guide.fileSize)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {guide.topic || `${guide.committeeName} Background Guide`}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Added {new Date(guide.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Auto-injected into 4 MUN drafting tools
                        </span>
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Collapse' : 'View Intelligence'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        title="Edit Structured Summary"
                        onClick={() => handleStartEdit(guide)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete Guide"
                        onClick={() => handleDelete(guide.id, guide.committeeName)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-[#081220]/60 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                      {/* Action Bar to jump to drafting */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#0c1a2e] rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Draft with this committee's intelligence:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleUseInDrafting(guide, 'position-paper')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Position Paper
                          </button>
                          <button
                            onClick={() => handleUseInDrafting(guide, 'speech-writer')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Speech Writer
                          </button>
                          <button
                            onClick={() => handleUseInDrafting(guide, 'clause-builder')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition flex items-center gap-1"
                          >
                            <Layers className="w-3 h-3" /> Resolution
                          </button>
                          <button
                            onClick={() => handleUseInDrafting(guide, 'debate-practice')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Debate Spar
                          </button>
                        </div>
                      </div>

                      {/* 5 Structured Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Rules of Procedure */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" />
                            <span>Rules of Procedure</span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {guide.summary?.rules_of_procedure || 'No procedural rules extracted.'}
                          </div>
                        </div>

                        {/* 2. Key Facts & Figures */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                            <FileCheck className="w-4 h-4" />
                            <span>Key Facts & Figures</span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {guide.summary?.key_facts || 'No key statistics extracted.'}
                          </div>
                        </div>

                        {/* 3. Existing Laws & Gaps */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                            <Scale className="w-4 h-4" />
                            <span>Existing Laws & Gaps</span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {guide.summary?.existing_laws_and_gaps || 'No legal frameworks extracted.'}
                          </div>
                        </div>

                        {/* 4. Past Events & Precedents */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <Calendar className="w-4 h-4" />
                            <span>Past Events & Precedents</span>
                          </div>
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {guide.summary?.past_events || 'No historical events extracted.'}
                          </div>
                        </div>
                      </div>

                      {/* 5. Questions to Answer (Full width) */}
                      <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                          <HelpCircle className="w-4 h-4" />
                          <span>Core Questions to Answer (Committee Agenda)</span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {guide.summary?.questions_to_answer || 'No questions extracted.'}
                        </div>
                      </div>

                      {/* Raw Text Accordion */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                        <button
                          onClick={() => setShowRawTextId(showRawTextId === guide.id ? null : guide.id)}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
                        >
                          <span>{showRawTextId === guide.id ? 'Hide Raw Extracted Text' : 'View Raw Extracted Text'}</span>
                          <span>({(guide.rawText || '').length} characters)</span>
                        </button>

                        {showRawTextId === guide.id && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-[#050b14] border border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {guide.rawText}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Modal / Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1a2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FileUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Committee Study Guide
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PDF upload (max 10MB, 50 pages) or direct text paste
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Committee Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Committee <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {UN_COMMITTEES.map((comm) => (
                    <option key={comm.id} value={comm.name}>
                      {comm.name} ({comm.id})
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom / Specialized Committee...</option>
                </select>

                {selectedCommittee === 'CUSTOM' && (
                  <input
                    type="text"
                    placeholder="Enter custom committee name (e.g., Crisis Cabinet, Historic Security Council)"
                    value={customCommitteeName}
                    onChange={(e) => setCustomCommitteeName(e.target.value)}
                    disabled={isSubmitting}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    required
                  />
                )}
              </div>

              {/* Agenda / Topic Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Agenda Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Non-Proliferation of Lethal Autonomous Weapons Systems (LAWS)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              {/* Input Type Selector: PDF vs Paste Text */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Study Guide Source
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setInputType('pdf')}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      inputType === 'pdf'
                        ? 'bg-white dark:bg-[#0c1a2e] text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('text')}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      inputType === 'text'
                        ? 'bg-white dark:bg-[#0c1a2e] text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Paste Text</span>
                  </button>
                </div>
              </div>

              {/* PDF Upload Zone */}
              {inputType === 'pdf' && (
                <div className="space-y-2">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      selectedFile
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50 dark:bg-slate-800/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(selectedFile.size)} • Click to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Drag & drop your study guide PDF here, or <span className="text-blue-600 dark:text-blue-400 font-bold">browse</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PDF only • Maximum 10MB • Up to 50 pages
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paste Text Area */}
              {inputType === 'text' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Study Guide Content <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs ${pastedText.trim().length >= 500 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      {pastedText.trim().length} / min 500 characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    placeholder="Paste the committee study guide text here. Include background context, timeline, past international actions, questions the resolution must answer, and procedural rules..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono leading-relaxed"
                  />
                  {pastedText.trim().length > 0 && pastedText.trim().length < 500 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please provide at least 500 characters so DeepSeek can build a reliable structured intelligence profile.
                    </p>
                  )}
                </div>
              )}

              {/* Progress message during processing */}
              {isSubmitting && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      {uploadStep || 'Synthesizing guide intelligence with DeepSeek...'}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Chunking long sections, resolving legal frameworks, and creating strict reference bounds. This takes about 10-20 seconds.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132c52] dark:bg-[#D4AF37] dark:hover:bg-[#c29e2f] text-white dark:text-[#0B1F3A] text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Guide...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Process & Save Guide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Summary Modal */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1a2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Edit Guide Intelligence: {editingGuide.committeeName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Refine or expand the structured points injected into AI prompts
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSavingEdit && setEditingGuide(null)}
                disabled={isSavingEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Agenda Topic
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Rules of Procedure
                </label>
                <textarea
                  rows={3}
                  value={editSummary.rules_of_procedure}
                  onChange={(e) => setEditSummary({ ...editSummary, rules_of_procedure: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> Key Facts & Figures
                </label>
                <textarea
                  rows={3}
                  value={editSummary.key_facts}
                  onChange={(e) => setEditSummary({ ...editSummary, key_facts: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> Existing Laws & Regulatory Gaps
                </label>
                <textarea
                  rows={3}
                  value={editSummary.existing_laws_and_gaps}
                  onChange={(e) => setEditSummary({ ...editSummary, existing_laws_and_gaps: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Past Events & Diplomatic Precedents
                </label>
                <textarea
                  rows={3}
                  value={editSummary.past_events}
                  onChange={(e) => setEditSummary({ ...editSummary, past_events: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Core Questions to Answer
                </label>
                <textarea
                  rows={3}
                  value={editSummary.questions_to_answer}
                  onChange={(e) => setEditSummary({ ...editSummary, questions_to_answer: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132c52] dark:bg-[#D4AF37] dark:hover:bg-[#c29e2f] text-white dark:text-[#0B1F3A] text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingEdit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
