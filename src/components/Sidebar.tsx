import React from 'react';
import { motion, PanInfo } from 'motion/react';
import {
  FileText,
  Mic,
  Layers,
  BookOpen,
  Globe,
  Flame,
  Swords,
  Archive,
  Sparkles,
  Lock,
  ChevronRight,
  Menu,
  X,
  Clock,
  ShieldAlert,
  Settings,
  Mail
} from 'lucide-react';
import { User, TabType, DelegateContext, Currency, SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { Sun, Moon, Languages, DollarSign } from 'lucide-react';

export type ActiveTab = TabType;

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: User | null;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onOpenPricing: () => void;
  isMobileOpen?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onToggleMobile?: () => void;
  onViewLanding?: () => void;
  context?: DelegateContext;
  onUpdateContext?: (ctx: Partial<DelegateContext>) => void;
  onOpenContextModal?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  currency?: Currency;
  onToggleCurrency?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onOpenPricing,
  isMobileOpen,
  isOpenMobile,
  onCloseMobile,
  onToggleMobile,
  onViewLanding,
  context,
  onUpdateContext,
  onOpenContextModal,
  isDarkMode,
  onToggleDarkMode,
  currency,
  onToggleCurrency
}) => {
  const isDrawerOpen = isMobileOpen ?? isOpenMobile ?? false;
  
  const isAdmin = user?.email === 'abdulahad2010mine@gmail.com';

  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
    if (onToggleMobile) onToggleMobile();
  };

  
  const isFree = !user || user.tier === 'free';
  const freeGenerationsUsed = user?.generationsUsed || 0;
  const isFreeLimitHit = isFree && freeGenerationsUsed >= 3;

  const navItems = [
    {
      id: 'position-paper' as TabType,
      label: 'Position Paper Generator',
      shortLabel: 'Position Paper',
      icon: FileText,
      description: 'Draft 4-part UN diplomatic position paper',
      freeRemaining: isFree ? Math.max(0, 3 - freeGenerationsUsed) : null,
      gated: isFreeLimitHit
    },
    {
      id: 'speech-writer' as TabType,
      label: 'Speech Writer & Timer',
      shortLabel: 'Speech Writer',
      icon: Mic,
      description: 'GSL, Rebuttals, practice mode teleprompter',
      freeRemaining: isFree ? Math.max(0, 3 - freeGenerationsUsed) : null,
      gated: isFreeLimitHit
    },
    {
      id: 'clause-builder' as TabType,
      label: 'Resolution Clause Builder',
      shortLabel: 'Clause Builder',
      icon: Layers,
      description: 'Preambulatory & Operative clause generator',
      badge: 'Always Free',
      gated: false
    },
    {
      id: 'rop-assistant' as TabType,
      label: 'Rules of Procedure (RoP)',
      shortLabel: 'RoP Assistant',
      icon: BookOpen,
      description: 'Motions cheat sheet & parliamentary AI',
      badge: 'Always Free',
      gated: false
    },
    {
      id: 'policy-research' as TabType,
      label: 'Country Policy Research',
      shortLabel: 'Policy Briefings',
      icon: Globe,
      description: 'Alliances, treaties, red lines & leverage',
      gated: false
    },
    {
      id: 'crisis-simulator' as TabType,
      label: 'Crisis Note Simulator',
      shortLabel: 'Crisis Cabinet',
      icon: Flame,
      description: 'Directives feedback & backroom fallout',
      gated: isFreeLimitHit
    },
    {
      id: 'debate-practice' as TabType,
      label: 'Debate Practice Mode',
      shortLabel: 'Debate Practice',
      icon: Swords,
      description: 'Interactive diplomatic sparring & scoring',
      gated: isFreeLimitHit
    },
    {
      id: 'archives' as TabType,
      label: 'Saved Archive & Drafts',
      shortLabel: 'My Archive',
      icon: Archive,
      description: 'Export and organize all conference texts',
      gated: false
    },
    {
      id: 'settings' as TabType,
      label: 'Settings & Profile',
      shortLabel: 'Settings',
      icon: Settings,
      description: 'Manage account, subscription & preferences',
      gated: false
    }
  ];

  // Calculate pass countdown
  let passCountdownText: string | null = null;
  if (user && user.tier !== 'free' && user.passExpiresAt) {
    const msLeft = user.passExpiresAt - Date.now();
    if (msLeft > 0) {
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      passCountdownText = days > 0 ? `${days}d ${remHours}h left` : `${hours}h remaining`;
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar Container - lg:static ensures it occupies document flow on desktop and never overlaps main content */}
      <motion.aside
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.x < -50) {
            handleClose();
          }
        }}

        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-72 shrink-0 h-full bg-[#0B1F3A] text-slate-100 flex flex-col border-r border-[#1E3A5F] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Swipe-to-dismiss handle bar indicator */}
        <div className="lg:hidden flex justify-center pt-2 pb-0.5">
          <div className="w-10 h-1 rounded-full bg-slate-600/70" />
        </div>

        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg shadow-md overflow-hidden"><img src="/yeilded_logo_refined.png" alt="Yeilded Logo" className="w-full h-full object-contain p-1" /></div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-white text-lg tracking-wide">
                  Yeilded
                </span>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider border border-[#D4AF37]/40">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                Diplomatic Toolkit
              </p>
            </div>
          </div>
          <button
            id="btn-sidebar-close"
            onClick={handleClose}
            aria-label="Close navigation sidebar"
            className="lg:hidden text-slate-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Delegation & Preference Switchers (lives in hamburger menu & More tab) */}
        {context && (
          <div className="px-3 pt-2 pb-1 space-y-2 border-b border-slate-800/80">
            {/* Delegation Switcher */}
            <button
              id="sidebar-delegate-switcher-btn"
              onClick={() => {
                if (onOpenContextModal) onOpenContextModal();
                handleClose();
              }}
              className="w-full p-2.5 rounded-xl bg-[#122847] hover:bg-[#18345b] border border-[#D4AF37]/30 text-left flex items-center justify-between min-h-[44px] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#0B1F3A] text-[#D4AF37] flex items-center justify-center font-black text-xs shrink-0 border border-[#D4AF37]/40">
                  {context.country.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block">
                      {context.country}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                      {context.committee}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {context.topic}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Quick Preference Controls: Theme, Currency, Language */}
            <div className="grid grid-cols-3 gap-1.5">
              {onToggleDarkMode && (
                <button
                  id="sidebar-theme-toggle"
                  onClick={onToggleDarkMode}
                  className="flex items-center justify-center gap-1.5 p-2 min-h-[40px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  title="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
              )}

              {onToggleCurrency && currency && (
                <button
                  id="sidebar-currency-toggle"
                  onClick={onToggleCurrency}
                  className="flex items-center justify-center gap-1 p-2 min-h-[40px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[#D4AF37] text-xs font-bold transition-colors"
                  title="Toggle currency"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{currency}</span>
                </button>
              )}

              {onUpdateContext && (
                <div className="relative">
                  <select
                    id="sidebar-language-select"
                    value={context.language || 'English'}
                    onChange={(e) => onUpdateContext({ language: e.target.value as SupportedLanguage })}
                    className="w-full p-2 min-h-[40px] rounded-lg bg-slate-800/80 text-slate-200 text-xs font-semibold border-none appearance-none text-center cursor-pointer"
                    title="Change language"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                        {l.flag} {l.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription / Pass Banner in Sidebar */}
        <div id="sidebar-tier-card" className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-br from-[#122847] to-[#0D2039] border border-[#D4AF37]/30 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-[#D4AF37]" />
              {user?.tier === '1week'
                ? '1-Week Conference Pass'
                : user?.tier === 'monthly'
                ? 'Monthly Delegate Pass'
                : 'Free Conference Tier'}
            </span>
            {user?.tier !== 'free' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>

          {user?.tier === 'free' ? (
            <div>
              <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                <span>Core Papers & Speeches:</span>
                <span className="font-bold text-amber-300">
                  {Math.max(0, 3 - freeGenerationsUsed)}/3 left
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#D4AF37] transition-all duration-300"
                  style={{ width: `${Math.min(100, (freeGenerationsUsed / 3) * 100)}%` }}
                />
              </div>
              <button
                id="btn-sidebar-unlock-pass"
                onClick={onOpenPricing}
                className="w-full py-2.5 px-3 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#b39126] hover:from-[#e2be49] hover:to-[#c4a132] text-[#0B1F3A] font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 active:scale-98"
              >
                <span>Unlock Unlimited Pass</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-sm text-emerald-300 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{passCountdownText || 'Active Conference Access'}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Unlimited AI position papers, speeches, crisis notes & debate sparring active.
              </p>
              <button
                id="btn-sidebar-view-pass-details"
                onClick={onOpenPricing}
                className="w-full py-2 px-2.5 min-h-[38px] text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors text-center border border-slate-700 active:scale-98"
              >
                View Pass Details
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            DIPLOMATIC SUITE
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  handleClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[48px] rounded-xl text-left transition-all group active:scale-98 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#173866] to-[#112a4d] text-white font-semibold border-l-4 border-[#D4AF37] shadow-md'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#0B1F3A]'
                        : 'bg-[#122847] text-slate-300 group-hover:text-[#D4AF37]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm block truncate leading-tight font-medium">
                      {item.shortLabel}
                    </span>
                    <span className="text-xs text-slate-400 block truncate leading-tight opacity-80">
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-medium border border-emerald-800/60">
                      {item.badge}
                    </span>
                  )}
                  {item.gated && (
                    <span className="text-xs text-amber-400 flex items-center" title="Requires active pass">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pricing Link & Landing Page Footer */}
        <div className="p-3 border-t border-[#1E3A5F] space-y-2">
          
          {isAdmin && (
            <button
              id="btn-sidebar-admin"
              onClick={() => {
                onSelectTab('admin');
                handleClose();
              }}
              className={`w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl border transition-all active:scale-98 ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white border-rose-600 font-bold'
                  : 'bg-slate-900/60 text-slate-200 border-rose-900/40 hover:border-rose-500/50 hover:bg-rose-900/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeTab === 'admin' ? 'text-white' : 'text-rose-400'}`} />
                <span className="text-sm font-bold block">Admin Dashboard</span>
              </div>
            </button>
          )}

          
          <a
            href="https://wa.me/923122421899"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 min-h-[36px] text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span>Need help? WhatsApp</span>
          </a>

          <a
            href="mailto:support@yeilded.com"
            className="w-full py-1.5 px-3 min-h-[36px] text-xs font-medium text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>support@yeilded.com</span>
          </a>

          {onViewLanding && (
            <button
              id="btn-sidebar-tour"
              onClick={() => {
                onViewLanding();
                handleClose();
              }}
              className="w-full py-2 px-3 min-h-[40px] text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Tour Platform & Features</span>
            </button>
          )}

          <button
            id="btn-sidebar-pricing"
            onClick={() => {
              onSelectTab('pricing');
              handleClose();
            }}
            className={`w-full flex items-center justify-between p-3 min-h-[48px] rounded-xl border transition-all active:scale-98 ${
              activeTab === 'pricing'
                ? 'bg-[#D4AF37] text-[#0B1F3A] border-[#D4AF37] font-bold'
                : 'bg-slate-900/60 text-slate-200 border-slate-700/60 hover:border-[#D4AF37]/50 hover:bg-[#132c4f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className={`w-4 h-4 ${activeTab === 'pricing' ? 'text-[#0B1F3A]' : 'text-[#D4AF37]'}`} />
              <div className="text-left">
                <span className="text-sm font-bold block">Conference Passes</span>
                <span className="text-xs opacity-75 block">PKR 399 / $5.00</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </motion.aside>
    </>
  );
};
