import React, { useState, useEffect, useRef } from 'react';
import { DelegateContext, User } from '../../types';
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
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatTabProps {
  context: DelegateContext;
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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#071326] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1F3A] to-[#1a3a60] dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  AI Diplomatic Advisor
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  DeepSeek Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Live committee consulting, tactical parliamentary phrasing & speech coaching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Context Badge */}
            {context.country && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="truncate max-w-[140px]">{context.country}</span>
              </div>
            )}

            {/* Usage Tier Pill */}
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In for 5 Free msgs/day</span>
              </button>
            ) : isFree ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                  isLimitReached 
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  Free Tier: {remainingMessages}/5 today
                </span>
                <button
                  onClick={onOpenPricing}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Upgrade</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Unlimited Pass Active</span>
              </div>
            )}

            <button
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Free Tier Limit Reached Warning Card */}
      {isLimitReached && (
        <div className="bg-amber-50 dark:bg-[#1f1906] border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Daily Free Tier Chat Limit Reached (5/5)</h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Your 5 free diplomatic messages for today have been used. Upgrade to a Conference Pass for unlimited live AI advice.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] border border-[#D4AF37]/40 transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlock Unlimited Chat</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Chat Box Container */}
      <div className="flex-1 bg-white dark:bg-[#071326] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block text-left p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-text ${
                      isUser
                        ? 'bg-[#0B1F3A] text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
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
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-300 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Consulting diplomatic briefing archives...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Suggested:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading || isLimitReached || !user}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          {!user ? (
            <div className="p-3 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2">
                Sign in or register for free to start using AI Diplomatic Advisor (5 free messages per day).
              </p>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors shadow-xs"
              >
                Sign In / Create Free Account
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
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isLimitReached
                      ? "Daily free limit reached (5/5). Upgrade to continue chatting..."
                      : `Ask anything about ${context.committee || 'committee'}, ${context.country || 'your stance'}, or MUN rules... (Enter to send)`
                  }
                  rows={2}
                  disabled={isLoading || isLimitReached}
                  className="w-full resize-none p-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isLoading || isLimitReached}
                className="min-h-[44px] min-w-[44px] sm:px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#D4AF37] dark:hover:bg-[#c49f2f] text-[#D4AF37] dark:text-[#0B1F3A] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
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
    </div>
  );
};
