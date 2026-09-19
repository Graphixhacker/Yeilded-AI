import React, { useState, useEffect, useRef } from 'react';
import { request } from '../services/api';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const DeepSeekChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant powered by DeepSeek. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Hide floating button while keyboard is open to avoid overlapping inputs
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isShrunk = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isShrunk);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Create payload with system prompt included dynamically
      const payloadMessages = [
        { role: 'system', content: 'You are a helpful AI assistant integrated into a Model UN web application. Answer user queries concisely and accurately.' },
        ...newMessages
      ];

      const res = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (res.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button: 44px, bottom-right, 16px above the tab bar, hides when keyboard open */}
      <button
        id="btn-deepseek-chat-toggle"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-[calc(3.5rem+16px+env(safe-area-inset-bottom,0px))] sm:bottom-6 right-4 sm:right-6 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] shadow-xl border border-[#D4AF37]/40 transition-all duration-200 z-40 flex items-center justify-center active:scale-95 touch-press ${
          isOpen || isKeyboardOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Diplomatic Chat"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Chat Window: bottom sheet on mobile, floating card on desktop */}
      <div
        id="deepseek-chat-window"
        className={`fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[85vh] sm:h-[520px] max-h-[85vh] bg-white dark:bg-[#0c1c33] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom sm:origin-bottom-right overflow-hidden ${
          isOpen ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-0 opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#0B1F3A] text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-bold text-base">DeepSeek AI Assistant</h3>
              <p className="text-xs text-slate-300 opacity-80">Ask me anything!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-sm mt-1 ${msg.role === 'user' ? 'bg-[#D4AF37] text-[#0B1F3A]' : 'bg-[#0B1F3A] text-[#D4AF37]'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-base ${msg.role === 'user' ? 'bg-[#0B1F3A] text-white rounded-tr-sm' : 'bg-white dark:bg-[#152a4a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%] flex-row">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-sm mt-1 bg-[#0B1F3A] text-[#D4AF37]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#152a4a] border border-slate-200 dark:border-slate-800 rounded-tl-sm shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#0c1c33] border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#0B1F3A] text-[#D4AF37] hover:bg-[#132c4f] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
