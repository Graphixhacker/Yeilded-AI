import React, { useState } from 'react';
import { DelegateContext, User, Currency, SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { useSwipeDismiss } from '../hooks/useSwipeDismiss';
import { UN_COMMITTEES, UN_COUNTRIES, PAKISTAN_POLITICAL_PARTIES } from '../data/unPresets';
import { Globe, Shield, Settings, UserCircle, LogIn, Sparkles, ChevronDown, Check, Clock, X, DollarSign, Menu, Moon, Sun, Languages, Search } from 'lucide-react';
import { ROP_DATABASE } from '../data/ropCheatSheet';

interface HeaderProps {
  context: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  contextHistory?: DelegateContext[];
  onLoadHistory?: (ctx: DelegateContext) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onLogout: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
  onOpenOnboarding: () => void;
  onToggleMobileMenu?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  context,
  onUpdateContext,
  contextHistory = [],
  onLoadHistory,
  user,
  onOpenAuth,
  onOpenPricing,
  onLogout,
  currency,
  onToggleCurrency,
  onOpenOnboarding,
  onToggleMobileMenu,
  isDarkMode = false,
  onToggleDarkMode,
  onNavigate
}) => {
  const [showContextModal, setShowContextModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = searchQuery.trim() 
    ? ROP_DATABASE.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];


  const currentLanguage: SupportedLanguage = context.language || 'English';
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const isPNA = (context.committee || '').toLowerCase().includes('pakistan') || (context.committee || '').toLowerCase().includes('pna');

  const safeUpdate = (patch: Partial<DelegateContext>) => {
    if (onUpdateContext) {
      onUpdateContext(patch);
    }
  };

  const { offset, isSwiping, touchHandlers } = useSwipeDismiss({
    onDismiss: () => setShowContextModal(false),
    direction: 'down',
    threshold: 60,
    enabled: showContextModal
  });

  // Calculate pass time remaining if active
  const getPassBadge = () => {
    if (!user) return null;
    if (user.tier === 'free') {
      const remaining = Math.max(0, 3 - user.generationsUsed);
      return (
        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors min-h-[38px]"
          title="Free Tier: 3 lifetime papers/speeches"
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="hidden sm:inline">Free: {remaining}/3 Left</span>
          <span className="sm:hidden font-bold">{remaining}/3 Free</span>
        </button>
      );
    }

    if (user.passExpiresAt) {
      const msLeft = user.passExpiresAt - Date.now();
      if (msLeft > 0) {
        const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
        const daysLeft = Math.floor(hoursLeft / 24);
        const remHours = hoursLeft % 24;
        const timeStr = daysLeft > 0 ? `${daysLeft}d ${remHours}h left` : `${hoursLeft}h left`;

        return (
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded-full bg-linear-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 dark:from-[#D4AF37]/30 dark:to-[#D4AF37]/15 text-[#0B1F3A] dark:text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all shadow-2xs min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
            <span className="hidden sm:inline">{user.tier === '1week' ? '1-Week Pass' : 'Monthly Pass'}: {timeStr}</span>
            <span className="sm:hidden">{user.tier === '1week' ? '1W Pass' : 'Pass'}</span>
          </button>
        );
      }
    }

    return null;
  };

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-[#071326] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Active Delegate Context Pill & Mobile Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            id="mobile-hamburger-btn"
            onClick={onToggleMobileMenu}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#0B1F3A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Crest & Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#0B1F3A] to-[#15345d] text-[#D4AF37] flex items-center justify-center font-black text-xs sm:text-sm shadow-xs border border-[#D4AF37]/40">
            Y
          </div>
          <span className="font-display font-bold text-base sm:text-lg text-[#0B1F3A] dark:text-white tracking-tight">
            Yeilded
          </span>
        </div>

        {/* Delegate Context Pill (Desktop only - mobile accesses via More tab & Hamburger) */}
        <button
          id="delegate-context-pill-btn"
          onClick={() => setShowContextModal(true)}
          className="hidden sm:flex group items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1c33] hover:bg-slate-100 dark:hover:bg-[#102442] hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left min-w-0 max-w-[130px] xs:max-w-[190px] sm:max-w-none min-h-[44px]"
          title="Click to change your delegate country or committee"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-lg bg-[#0B1F3A] text-[#D4AF37] flex items-center justify-center font-black text-xs sm:text-sm shadow-xs border border-[#D4AF37]/30">
            {context.country.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0B1F3A] dark:group-hover:text-[#D4AF37] truncate block">
                {context.country}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1 py-0.2 rounded border border-amber-300/60 dark:border-amber-700/60 shrink-0 hidden xs:inline-block truncate max-w-[60px] sm:max-w-none">
                {context.committee}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[240px] md:max-w-[340px]">
              {context.topic}
            </p>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
        </button>

        <button
          id="preset-switcher-btn"
          onClick={onOpenOnboarding}
          className="hidden md:inline-flex text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-[#D4AF37] underline underline-offset-2"
        >
          Preset Dossiers
        </button>
      </div>

      {/* Global Search Bar (Hidden on tiny screens) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Rules of Procedure (e.g., Point of Order)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-1.5 text-base bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all shadow-inner"
          />
        </div>
        
        {showSearchResults && searchQuery && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)}></div>
            <div className="absolute top-full left-0 mt-3 w-[450px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0c1c33] z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">RoP Toolkit Results</span>
                <button onClick={() => setShowSearchResults(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div key={result.id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-default">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-base font-bold text-[#0B1F3A] dark:text-[#D4AF37]">{result.title}</h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-[#0B1F3A] group-hover:text-white dark:group-hover:bg-[#D4AF37] dark:group-hover:text-[#0B1F3A] transition-colors">{result.category}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{result.explanation}</p>
                      {result.samplePhrasing && (
                        <div className="mt-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">"{result.samplePhrasing}"</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                   <div className="p-6 text-center text-base text-slate-500">No matching rules found for "{searchQuery}".</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle Button (Desktop only - mobile accesses via More tab & Hamburger) */}
        {onToggleDarkMode && (
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="hidden sm:flex min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-[#D4AF37] hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all items-center justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode for late-night caucus'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#D4AF37] hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>
        )}

        {/* Currency Switcher (Desktop only - mobile accesses via More tab) */}
        <button
          id="currency-toggle-btn"
          onClick={onToggleCurrency}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 min-h-[44px]"
          title="Toggle pricing currency between PKR and USD"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">CURR:</span>
          <span className="font-bold text-[#0B1F3A] dark:text-[#D4AF37]">{currency}</span>
        </button>

        {/* Answer Language Switcher (Desktop only - mobile accesses via More tab) */}
        <div className="relative hidden sm:block">
          <button
            id="language-switcher-btn"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px] justify-center"
            title="Choose answer/generation language (e.g. English, Roman Urdu, etc.)"
            aria-label="Select answer language"
          >
            <span className="text-base">{currentLangObj.flag}</span>
            <span className="font-bold text-[#0B1F3A] dark:text-[#D4AF37] hidden sm:inline-block">
              {currentLangObj.label}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div 
              id="language-dropdown-menu"
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0c1c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
            >
              <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  Answer Language
                </p>
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  id={`lang-option-${lang.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    safeUpdate({ language: lang.id });
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    currentLanguage === lang.id
                      ? 'font-bold text-[#0B1F3A] dark:text-[#D4AF37] bg-amber-50/50 dark:bg-amber-950/30'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">({lang.native})</span>
                  </span>
                  {currentLanguage === lang.id && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pass Status Badge (Desktop only) */}
        <div className="hidden sm:flex items-center">
          {getPassBadge()}
        </div>

        {/* Upgrade button if on free tier */}
        {(!user || user.tier === 'free') && (
          <button
            id="header-upgrade-btn"
            onClick={onOpenPricing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] text-sm font-bold rounded-xl transition-all shadow-xs border border-[#D4AF37]/40 hover:border-[#D4AF37]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade Pass</span>
          </button>
        )}

        {/* User Account */}
        {user ? (
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Toggle user account menu"
              className="min-h-[44px] flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden md:inline-block">
                {user.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm border-2 border-[#D4AF37]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c1c33] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <div className="mt-1.5 inline-block text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Tier: {user.tier.toUpperCase()}
                  </div>
                </div>
                <button
                  id="user-menu-pricing-btn"
                  onClick={() => { setShowUserMenu(false); onOpenPricing(); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Subscription & Passes</span>
                </button>
                <button
                  id="user-menu-onboarding-btn"
                  onClick={() => { setShowUserMenu(false); onOpenOnboarding(); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>Delegate Dossier Setup</span>
                </button>
                <button
                  id="user-menu-settings-btn"
                  onClick={() => { setShowUserMenu(false); if (onNavigate) onNavigate('settings'); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  id="user-menu-logout-btn"
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="header-signin-btn"
            onClick={() => onOpenAuth()}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl transition-colors border border-slate-300 dark:border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Quick Context Edit Modal */}
      {showContextModal && (
        <div 
          id="context-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContextModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            id="context-modal-dialog"
            {...touchHandlers}
            style={{
              transform: offset.y > 0 ? `translateY(${offset.y}px)` : undefined,
              transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
            }}
            className="bg-white dark:bg-[#0c1c33] rounded-2xl w-[96%] max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Mobile swipe indicator */}
            <div className="sm:hidden flex justify-center pt-2 pb-1 bg-[#0B1F3A] cursor-grab active:cursor-grabbing border-b border-[#D4AF37]/10">
              <div className="w-12 h-1 rounded-full bg-slate-400/60" />
            </div>

            <div className="bg-[#0B1F3A] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base">Delegate Representation</h3>
              </div>
              <button
                id="close-context-modal-btn"
                onClick={() => setShowContextModal(false)}
                className="text-slate-300 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Committee / Assembly
                </label>
                <select
                  id="context-committee-select"
                  value={context.committee}
                  onChange={(e) => {
                    safeUpdate({
                      committee: e.target.value
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {UN_COMMITTEES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {!isPNA && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Country / Sovereign State
                  </label>
                  <select
                    id="context-country-select"
                    value={context.country}
                    onChange={(e) => safeUpdate({ country: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 text-base sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                  >
                    {UN_COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {isPNA && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Political Party
                  </label>
                  <select
                    id="context-party-select"
                    value={context.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]}
                    onChange={(e) => safeUpdate({ politicalParty: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 text-base sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                  >
                    {PAKISTAN_POLITICAL_PARTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>Working / Answer Language</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-normal">Roman Urdu & Multilingual</span>
                </label>
                <select
                  id="context-language-select"
                  value={currentLanguage}
                  onChange={(e) => safeUpdate({ language: e.target.value as SupportedLanguage })}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.label} ({l.native})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Agenda Topic
                  </label>

                </div>
                <textarea
                  id="context-topic-input"
                  value={context.topic}
                  onChange={(e) => safeUpdate({ topic: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 text-base sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
                  placeholder="Enter agenda topic"
                />
              </div>

              {contextHistory && contextHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Recent Profiles
                  </label>
                  <div className="flex flex-col gap-2">
                    {contextHistory.map((hist, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (onLoadHistory) onLoadHistory(hist);
                          setShowContextModal(false);
                        }}
                        className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0B1F3A] dark:group-hover:text-[#D4AF37]">{hist.country}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{hist.committee}</span>
                        </div>
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D4AF37]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  id="save-context-btn"
                  onClick={() => setShowContextModal(false)}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] text-sm sm:text-base font-bold rounded-xl transition-colors shadow-xs border border-[#D4AF37]/30"
                >
                  Apply & Save Context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
