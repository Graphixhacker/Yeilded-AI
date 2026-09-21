import React, { useState } from 'react';
import { 
  Globe, 
  Moon, 
  Sun, 
  Languages, 
  DollarSign, 
  User as UserIcon, 
  Sparkles, 
  ChevronRight, 
  Settings, 
  LogOut, 
  LogIn, 
  FileText, 
  Zap, 
  Swords, 
  Archive, 
  MessageCircle, 
  Check, 
  ShieldAlert,
  ChevronDown,
  MessageSquare,
  BookOpen,
  Laptop,
  Menu
} from 'lucide-react';
import { 
  User, 
  DelegateContext, 
  Currency, 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  TabType,
  ThemeMode
} from '../../types';
import { BottomSheetPicker } from '../BottomSheetPicker';

interface MoreTabProps {
  user: User | null;
  context: DelegateContext;
  onUpdateContext: (ctx: Partial<DelegateContext>) => void;
  onOpenContextModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  currency: Currency;
  onToggleCurrency: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectTab: (tab: TabType) => void;
  onOpenSidebar?: () => void;
  isAdmin?: boolean;
}

export const MoreTab: React.FC<MoreTabProps> = ({
  user,
  context,
  onUpdateContext,
  onOpenContextModal,
  isDarkMode,
  onToggleDarkMode,
  themeMode = 'system',
  onSetThemeMode,
  currency,
  onToggleCurrency,
  onOpenPricing,
  onOpenAuth,
  onLogout,
  onSelectTab,
  onOpenSidebar,
  isAdmin
}) => {
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  const freeLeft = Math.max(0, 3 - (user?.generationsUsed || 0));
  const isFree = !user || user.tier === 'free';
  const activeLang = SUPPORTED_LANGUAGES.find(l => l.id === context.language) || SUPPORTED_LANGUAGES[0];

  const languageOptions = SUPPORTED_LANGUAGES.map(l => ({
    id: l.id,
    label: `${l.flag} ${l.label} (${l.native})`,
    category: 'Available Answer Languages'
  }));

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* 1. Compact Page Header */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            More Options
          </h2>
          {/* 2. Usage/limit info: small inline chip next to title */}
          {isFree ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              {freeLeft}/3 Free
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#0B1F3A] dark:text-[#D4AF37] border border-[#D4AF37]/50">
              {user?.tier === '1week' ? '1-Week Pass' : 'Monthly Pass'}
            </span>
          )}
        </div>
        <p className="w-full text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
          Conference settings, delegate profile, and preferences.
        </p>
      </div>

      {/* 3. Content Cards */}
      {/* Committee & Dossier Card */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            Active Delegation
          </span>
          <button
            id="btn-more-change-committee"
            onClick={onOpenContextModal}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline min-h-[44px] flex items-center px-2"
          >
            Change
          </button>
        </div>

        <button
          onClick={onOpenContextModal}
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left min-h-[52px] hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-[#D4AF37] flex items-center justify-center font-black text-sm shrink-0 border border-[#D4AF37]/30">
              {context.country.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {context.country}
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50 shrink-0">
                  {context.committee}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {context.topic}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
        </button>
      </div>

      {/* Preferences List: Theme, Language, Currency */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 px-1 py-1 mb-1">
          Conference Preferences
        </h3>

        {/* Theme Mode Selector (3 States: Light, Dark, System) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
                {isDarkMode ? <Moon className="w-4 h-4 text-[#D4AF37]" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 block">
                  Appearance Theme
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {themeMode === 'system' ? 'Device System Default' : themeMode === 'dark' ? 'Dark Mode (Caucus Night)' : 'Light Mode (Standard UN)'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              {themeMode}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              id="btn-more-theme-light"
              type="button"
              onClick={() => onSetThemeMode ? onSetThemeMode('light') : onToggleDarkMode()}
              className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-97 ${
                themeMode === 'light'
                  ? 'bg-[#141B3D] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light</span>
            </button>
            <button
              id="btn-more-theme-dark"
              type="button"
              onClick={() => onSetThemeMode ? onSetThemeMode('dark') : onToggleDarkMode()}
              className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-97 ${
                themeMode === 'dark'
                  ? 'bg-[#141B3D] dark:bg-[#D4AF37] text-[#D4AF37] dark:text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              id="btn-more-theme-system"
              type="button"
              onClick={() => onSetThemeMode ? onSetThemeMode('system') : onToggleDarkMode()}
              className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-97 ${
                themeMode === 'system'
                  ? 'bg-[#141B3D] text-white dark:bg-slate-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Language Row */}
        <button
          id="btn-more-language"
          onClick={() => setShowLanguageSheet(true)}
          className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200 block">
                Answer Language
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeLang.flag} {activeLang.label} ({activeLang.native})
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* Currency Row */}
        <button
          id="btn-more-currency"
          onClick={onToggleCurrency}
          className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200 block">
                Pricing Currency
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Switch between USD ($) and PKR (Rs)
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0B1F3A] dark:text-[#D4AF37]">
            {currency}
          </span>
        </button>
      </div>

      {/* Account & Passes Card */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 px-1 py-1">
          Account & Licensing
        </h3>

        {user ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-base border-2 border-[#D4AF37] shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-base font-bold text-slate-900 dark:text-white block truncate">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 min-h-[44px] min-w-[44px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center justify-center"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full p-3 min-h-[48px] rounded-xl bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-[#D4AF37] flex items-center justify-center font-bold">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-bold text-slate-900 dark:text-white block">
                  Sign In / Register
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Save drafts, access passes, and sync history
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        <button
          onClick={onOpenPricing}
          className="w-full p-3 min-h-[48px] rounded-xl bg-linear-to-r from-amber-500/10 to-amber-600/5 dark:from-[#D4AF37]/15 dark:to-transparent border border-amber-300 dark:border-[#D4AF37]/40 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#0B1F3A] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-base font-bold text-[#0B1F3A] dark:text-[#D4AF37] block">
                Conference Passes
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {isFree ? `${freeLeft} of 3 Free Papers Left • Upgrade` : 'Active Unlimited Access'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#0B1F3A] dark:text-[#D4AF37]" />
        </button>
      </div>

      {/* Diplomatic Tools Shortcuts */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 px-1 py-1 mb-1">
          Diplomatic Suite Modules
        </h3>

        {[
          { id: 'rop-assistant', label: 'Rules of Procedure (RoP)', desc: 'Motions cheat sheet & parliamentary AI', icon: BookOpen },
          { id: 'chat', label: 'AI Diplomatic Chat', desc: 'Real-time DeepSeek MUN advice & tactics', icon: MessageSquare },
          { id: 'policy-research', label: 'Policy Research Dossier', desc: 'Country dossiers, red lines & leverage', icon: Globe },
          { id: 'crisis-simulator', label: 'Crisis Directive Simulator', desc: 'Backroom covert actions & feedback', icon: Zap },
          { id: 'debate-practice', label: 'Debate Sparring Partner', desc: 'Real-time simulated committee sparring', icon: Swords },
          { id: 'archives', label: 'Document Archives', desc: 'View saved position papers & speeches', icon: Archive }
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectTab(mod.id as TabType)}
              className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {mod.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                    {mod.desc}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
            </button>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin')}
            className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 block">
                  Admin Dashboard
                </span>
                <span className="text-xs text-slate-500">
                  Manage conference codes & passes
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-400" />
          </button>
        )}
      </div>

      {/* Support & Contact */}
      <div className="bg-white dark:bg-[#071326] p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
        <a
          href="https://wa.me/923122421899"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <span className="text-base font-semibold">WhatsApp Delegate Support</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60">Live</span>
        </a>
      </div>

      {/* 4. Primary action button: normal full-width button at the end of content (not sticky) */}
      <div className="pt-2">
        <button
          id="btn-more-primary-action"
          onClick={onOpenContextModal}
          className="w-full py-3.5 px-4 min-h-[48px] bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#D4AF37] dark:hover:bg-[#c4a132] text-white dark:text-[#0B1F3A] font-bold text-base rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 touch-press"
        >
          <span>Switch Delegate Committee Dossier</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Sheet for Answer Language Selection */}
      <BottomSheetPicker
        isOpen={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
        title="Select Answer Language"
        options={languageOptions}
        selectedValue={context.language || 'English'}
        onSelect={(langId) => onUpdateContext({ language: langId as SupportedLanguage })}
        placeholder="Search languages..."
      />
    </div>
  );
};
