import React, { useState } from 'react';

import { DelegateContext, User, RoPItem } from '../../types';
import { ROP_DATABASE } from '../../data/ropCheatSheet';
import { api } from '../../services/api';
import {
  BookOpen,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';

interface RoPAssistantTabProps {
  context: DelegateContext;
  user: User | null;
  onOpenAuth: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'chair';
  text: string;
}

export const RoPAssistantTab: React.FC<RoPAssistantTabProps> = ({
  context,
  user,
  onOpenAuth
}) => {
  const [activeSubView, setActiveSubView] = useState<'cheatsheet' | 'chatbot'>('cheatsheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('point-order');

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'chair',
      text: `Honorable Delegate of ${context.country}, welcome to the Rules of Procedure Dais. I am your parliamentary advisor. Ask me any question regarding motions, points of order, speaker yields, voting procedures, or THIMUN/UNA-USA rules.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Filter RoP items
  const filteredItems = ROP_DATABASE.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.samplePhrasing.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendQuestion = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: question.trim()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsChatLoading(true);

    try {
      const res = await api.generateAI('rop-chat', {
        messages: [{ role: 'user', content: question.trim() }],
        committeeContext: `${context.committee} (${context.topic})`,
        language: context.language || 'English'
      });

      const chairReply: ChatMessage = {
        id: 'chair_' + Date.now(),
        sender: 'chair',
        text: res.result || 'Under standard parliamentary rules, this motion is in order upon recognition by the Chair.'
      };
      setChatMessages((prev) => [...prev, chairReply]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'chair',
          text: 'The Dais cannot process this inquiry due to network interruption. Please refer to the RoP Cheat Sheet tab for instant reference.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const sampleQuestions = [
    'How do I introduce a draft resolution?',
    'Can I yield remaining time to points of information in UNA-USA rules?',
    'Difference between Point of Order and Point of Parliamentary Inquiry?',
    'What majority is required to divide the question?'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-[#071326] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PARLIAMENTARY RULES OF PROCEDURE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            Rules of Procedure (RoP) Assistant
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instant parliamentary reference for UNA-USA & THIMUN, plus AI Parliamentarian rulings.
          </p>
        </div>

        {/* Sub-view toggle (full width on mobile) */}
        <div className="grid grid-cols-2 sm:flex items-center bg-slate-100 dark:bg-[#0b1b33] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 w-full sm:w-auto">
          <button
            id="btn-rop-view-cheatsheet"
            onClick={() => setActiveSubView('cheatsheet')}
            className={`px-3 sm:px-4 py-2 min-h-[42px] text-xs sm:text-sm font-bold rounded-lg transition-all text-center touch-press active:scale-98 ${
              activeSubView === 'cheatsheet'
                ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cheat Sheet
          </button>
          <button
            id="btn-rop-view-chatbot"
            onClick={() => setActiveSubView('chatbot')}
            className={`px-3 sm:px-4 py-2 min-h-[42px] text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-center touch-press active:scale-98 ${
              activeSubView === 'chatbot'
                ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-white dark:text-[#0B1F3A] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#0B1F3A]" />
            <span>AI Dais Counsel</span>
          </button>
        </div>
      </div>

      {activeSubView === 'cheatsheet' ? (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white dark:bg-[#071326] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="input-rop-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search motions, points, caucuses, voting thresholds..."
                className="w-full pl-10 pr-3 py-2.5 min-h-[48px] text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Rules' },
                { id: 'point', label: 'Points' },
                { id: 'caucus', label: 'Caucuses' },
                { id: 'motion', label: 'Motions' },
                { id: 'voting', label: 'Voting' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-rop-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-press active:scale-98 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0B1F3A] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] shadow-xs'
                      : 'bg-slate-100 dark:bg-[#0b1b33] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const isExpanded = expandedItemId === item.id;
              return (
                <div
                  key={item.id}
                  id={`rop-item-${item.id}`}
                  className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="p-4 min-h-[56px] cursor-pointer flex items-center justify-between bg-slate-50/50 dark:bg-[#0b1b33]/60 hover:bg-slate-50 dark:hover:bg-[#0b1b33] transition-colors touch-press"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0B1F3A] text-[#D4AF37]">
                          {item.category}
                        </span>
                        {item.interruptSpeaker && (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                            May Interrupt
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {item.title}
                      </h4>
                    </div>

                    <button 
                      className="text-slate-400 dark:text-slate-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                      aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="p-4 pt-2 text-sm sm:text-base space-y-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{item.explanation}</p>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-semibold">Second Required?</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.secondRequired ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-semibold">Vote Required</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.voteRequired}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-semibold">Debatable?</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.debatable}</span>
                      </div>
                    </div>

                    {/* Verbatim Phrasing */}
                    <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Delegate Phrasing at Microphone:
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.samplePhrasing);
                          }}
                          className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="italic text-sm sm:text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                        "{item.samplePhrasing}"
                      </p>
                    </div>

                    {item.chairResponse && isExpanded && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Dais Standard Ruling: </span>
                        <span className="italic">{item.chairResponse}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Chatbot Sub-view */
        <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[560px] sm:h-[600px] transition-colors">
          {/* Chat header */}
          <div className="p-3.5 sm:p-4 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#0B1F3A] flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Parliamentary Counsel AI</h4>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Instant rulings on UNA-USA & THIMUN procedural questions
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              Free
            </span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-[#050f1e]/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0B1F3A] dark:bg-[#0f2a4a] text-white rounded-br-none'
                      : 'bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#0b1b33] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 rounded-bl-none text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-[#0B1F3A] dark:border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                  <span>Consulting Parliamentary Rulebook...</span>
                </div>
              </div>
            )}
          </div>

          {/* Sample question chips */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-[#071326] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                id={`btn-sample-question-${i}`}
                type="button"
                onClick={() => handleSendQuestion(sq)}
                className="px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-100 dark:bg-[#0b1b33] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap transition-colors touch-press active:scale-98"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-3 sm:p-4 bg-white dark:bg-[#071326] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              id="input-rop-chat-query"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendQuestion();
              }}
              placeholder="Ask a procedural question..."
              className="flex-1 px-4 py-2.5 min-h-[48px] text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#0b1b33] text-slate-800 dark:text-slate-100"
            />
            <button
              id="btn-send-rop-chat"
              onClick={() => handleSendQuestion()}
              disabled={!inputQuestion.trim() || isChatLoading}
              className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] rounded-xl shadow-xs transition-all disabled:opacity-40 touch-press active:scale-98"
              title="Send question"
              aria-label="Send question"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
