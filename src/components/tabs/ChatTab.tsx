import React, { useState, useEffect, useRef } from 'react';
import { DelegateContext, User } from '../../types';
import { UN_COUNTRIES } from '../../data/unPresets';
import { api } from '../../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowUpRight, 
  User as UserIcon, 
  Loader2, 
  Globe, 
  Shield, 
  Lock,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatTabProps {
  context: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
}

const QUICK_PROMPTS = [
  'Suggest 3 sharp points of inquiry for our committee topic',
  'Draft a 60-second GSL speech hook for our country',
  'What are the voting procedure rules for a 2/3 majority resolution?',
  'Analyze potential bloc partners and treaties on our stance'
];

export const ChatTab: React.FC<ChatTabProps> = ({
  context,
  onUpdateContext,
  user,
  onOpenAuth,
  onOpenPricing
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | 'unlimited'>(
    !user || user.tier === 'free' ? 5 : 'unlimited'
  );
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = `mun_chat_history_${user?.id || 'guest'}`;

  // 1. Load history and initial greeting
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}

    const delegateLabel = context.country 
      ? `Honorable Delegate of ${context.country}` 
      : 'Honorable Delegate';
    const committeeLabel = context.committee ? ` in ${context.committee}` : '';

    setMessages([
      {
        id: 'init_msg',
        role: 'assistant',
        content: `Greetings, ${delegateLabel}${committeeLabel}. I am your AI Diplomatic Advisor powered by DeepSeek. How can I assist your conference preparation, Rules of Procedure questions, or speech drafting today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [user?.id, context.country, context.committee]);

  // 2. Save history on message change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, storageKey]);

  // 3. Sync usage from backend
  const refreshUsage = async () => {
    if (!user) {
      setRemainingMessages(0);
      setIsLimitReached(false);
      return;
    }
    try {
      const usage = await api.getChatUsage();
      setRemainingMessages(usage.remaining);
      setIsLimitReached(usage.isChatLimitReached || (usage.isFree && usage.remaining === 0));
    } catch {
      // fallback based on user tier
      if (user.tier === '1week' || user.tier === 'monthly') {
        setRemainingMessages('unlimited');
        setIsLimitReached(false);
      }
    }
  };

  useEffect(() => {
    refreshUsage();
  }, [user]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all conversation history for this session?')) {
      const delegateLabel = context.country ? `Honorable Delegate of ${context.country}` : 'Honorable Delegate';
      const initial: ChatMessage[] = [
        {
          id: 'cleared_' + Date.now(),
          role: 'assistant',
          content: `Conversation cleared. Ready for your next diplomatic directive, ${delegateLabel}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  };

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || input;
    if (!rawText.trim() || isLoading) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    if (isLimitReached) {
      onOpenPricing();
      return;
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    // Build context system prompt
    const systemPrompt = `You are an elite Model United Nations diplomatic advisor and coach.
Delegate context:
- Country: ${context.country || 'Neutral / Unassigned'}
- Committee: ${context.committee || 'General Assembly'}
- Topic: ${context.topic || 'International Diplomacy'}
- Delegate Name: ${context.delegateName || 'Ambassador'}
- Political Party / Bloc: ${context.politicalParty || context.bloc || 'Unaligned'}

Give concise, diplomatic, realistic MUN advice, formal UN rhetoric, parliamentary tactics, or speech points tailored to their country's stance.`;

    const apiPayload = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage.content }
    ];

    try {
      const res = await api.chat(apiPayload);
      
      const assistantMessage: ChatMessage = {
        id: 'res_' + Date.now(),
        role: 'assistant',
        content: res.reply || 'Chat is temporarily unavailable, please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (res.remaining !== undefined) {
        setRemainingMessages(res.remaining);
        if (res.remaining === 0) {
          setIsLimitReached(true);
        }
      }
    } catch (err: any) {
      console.error('[CHAT TAB ERROR]', err);
      if (err?.isChatLimitReached) {
        setIsLimitReached(true);
        setRemainingMessages(0);
        setErrorMessage(err.message || 'Free tier daily chat limit reached (5 messages/day).');
      } else if (err?.requireAuth) {
        onOpenAuth();
      } else {
        const fallbackText = err?.message?.includes('temporarily')
          ? err.message
          : 'Chat is temporarily unavailable, please try again.';
        setMessages(prev => [
          ...prev,
          {
            id: 'err_' + Date.now(),
            role: 'assistant',
            content: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      refreshUsage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isFree = !user || user.tier === 'free';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full min-h-0 bg-white dark:bg-[#071326] sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-2xl overflow-hidden shadow-xs">
      {/* Compact Header */}
      <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0c1c33] shrink-0 space-y-2">
        {/* Line 1: Title + DeepSeek Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#141B3D] dark:text-white truncate">
              AI Diplomatic Advisor
            </h1>
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shrink-0">
              DeepSeek Powered
            </span>
          </div>
        </div>

        {/* Line 2: Country Selector + Compact Auth/Limit Pill + Trash icon */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Full-width compact country dropdown */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#D4AF37]">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <select
              value={context.country || 'United States of America'}
              onChange={(e) => onUpdateContext?.({ country: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] appearance-none truncate cursor-pointer"
              title="Select representing country"
            >
              {UN_COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs">
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {!user ? (
            <button
              onClick={onOpenAuth}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-2xs whitespace-nowrap min-h-[34px]"
              title="Sign In for 5 Free Messages Daily"
            >
              <Lock className="w-3 h-3" />
              <span>5 Free msgs/day</span>
            </button>
          ) : isFree ? (
            <div className="shrink-0 flex items-center gap-1">
              <span className={`text-[11px] px-2 py-1 rounded-md font-semibold border ${
                isLimitReached 
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {remainingMessages}/5 left
              </span>
              <button
                onClick={onOpenPricing}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-[#141B3D] hover:bg-[#1f2852] dark:bg-[#D4AF37] dark:hover:bg-[#c49f2f] text-[#D4AF37] dark:text-[#0B1F3A] border border-[#D4AF37]/30 transition-colors shadow-2xs min-h-[30px]"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Pass</span>
              </button>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Pro Active</span>
            </div>
          )}

          {/* Clear chat trash icon on same row */}
          <button
            onClick={handleClearHistory}
            title="Clear conversation history"
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 min-h-[34px] min-w-[34px] flex items-center justify-center"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Free Tier Limit Reached Warning Card */}
      {isLimitReached && (
        <div className="bg-amber-50 dark:bg-[#1f1906] border-b border-amber-300 dark:border-amber-700/60 p-2.5 sm:p-3 flex items-center justify-between gap-2 text-amber-900 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs truncate">
              Daily free limit (5/5) reached. Upgrade for unlimited AI advice.
            </p>
          </div>
          <button
            onClick={onOpenPricing}
            className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#141B3D] hover:bg-[#1f2852] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] border border-[#D4AF37]/40 transition-colors shadow-2xs flex items-center gap-1 min-h-[32px]"
          >
            <span>Upgrade</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Messages List - Up to ~90% width, minimal side padding, comfortable line height */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[92%] sm:max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Optional tiny avatar visible only on larger screens */}
              <div
                className={`hidden sm:flex w-6 h-6 rounded-full items-center justify-center shrink-0 text-[10px] font-bold ${
                  isUser
                    ? 'bg-[#141B3D] dark:bg-slate-700 text-white'
                    : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                }`}
              >
                {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`space-y-1 min-w-0 flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block text-left p-3 sm:p-3.5 rounded-2xl text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap select-text shadow-2xs ${
                    isUser
                      ? 'bg-[#141B3D] text-white dark:bg-[#D4AF37] dark:text-[#0B1F3A] font-medium rounded-tr-xs'
                      : 'bg-slate-100 text-[#141B3D] dark:bg-slate-800/90 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>

                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 p-0.5"
                      title="Copy answer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2 mr-auto max-w-[92%] sm:max-w-[85%]">
            <div className="hidden sm:flex w-6 h-6 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              <span>Consulting diplomatic briefing archives...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (Horizontally scrollable row with fade mask at edges) */}
      {messages.length <= 4 && !isLoading && (
        <div className="relative border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          {/* Subtle edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-slate-50 dark:from-[#060f1d] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-slate-50 dark:from-[#060f1d] to-transparent z-10" />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-3.5 py-1.5">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">Prompts:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading || isLimitReached || !user}
                className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 shrink-0 disabled:opacity-50 min-h-[32px] flex items-center shadow-2xs font-medium active:scale-97"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pinned Input Area above Bottom Nav with iOS safe area padding */}
      <div 
        className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071326] shrink-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 10px)' }}
      >
        {!user ? (
          <div className="p-2.5 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              Sign in for 5 free AI diplomatic consults per day.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#141B3D] hover:bg-[#1f2852] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Create Free Account</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1 min-w-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLimitReached
                    ? "Daily free limit reached (5/5). Upgrade to continue..."
                    : `Ask about ${context.country || 'your stance'} or committee rules...`
                }
                rows={1}
                disabled={isLoading || isLimitReached}
                className="w-full resize-none py-2.5 px-3.5 text-[15px] sm:text-base leading-snug bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#141B3D] dark:focus:ring-[#D4AF37] text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50 max-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimitReached}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-[#141B3D] hover:bg-[#1f2852] dark:bg-[#D4AF37] dark:hover:bg-[#c49f2f] text-[#D4AF37] dark:text-[#0B1F3A] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-2xs shrink-0 active:scale-95"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Send</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
