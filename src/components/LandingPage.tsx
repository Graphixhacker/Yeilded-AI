import React from 'react';
import {
  FileText,
  Mic,
  Layers,
  BookOpen,
  Globe,
  Flame,
  Swords,
  Sparkles,
  Shield,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { Currency } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenPricing: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
  onOpenPricing,
  currency,
  onToggleCurrency,
  isDarkMode,
  onToggleDarkMode
}) => {
  const features = [
    {
      icon: FileText,
      title: 'Position Paper Generator',
      desc: 'Formulates comprehensive, four-part diplomatic papers (Background, Stance, Past Actions, Solutions) grounded in genuine UN syntax.'
    },
    {
      icon: Mic,
      title: 'Speech Writer & Teleprompter',
      desc: 'Generates opening statements, GSL interventions, and rebuttals calibrated to precise speaking limits with live pace timing.'
    },
    {
      icon: Layers,
      title: 'Resolution Clause Builder',
      desc: 'Preambulatory and operative clause generation with official starters, sub-clause nesting, and instant draft resolution compilation.'
    },
    {
      icon: BookOpen,
      title: 'Rules of Procedure Assistant',
      desc: 'Searchable parliamentary cheat sheet for motions, points, and voting thresholds plus an instant RoP resolution chatbot.'
    },
    {
      icon: Globe,
      title: 'Country Policy Dossiers',
      desc: 'Instant geopolitical briefings detailing alliances, ratified treaties, trade dependencies, red lines, and strategic leverage.'
    },
    {
      icon: Flame,
      title: 'Crisis Note Simulator',
      desc: 'Draft covert and public directives with automated feasibility scoring, backroom unintended consequences, and news bulletins.'
    },
    {
      icon: Swords,
      title: 'Debate Practice Partner',
      desc: 'Real-time diplomatic sparring against rival bloc AI delegates, complete with parliamentary decorum scoring and counter-arguments.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050f1e] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-[#0B1F3A] transition-colors">
      {/* Top Banner Navigation */}
      <header className="h-20 bg-[#0B1F3A] dark:bg-[#040b17] border-b border-[#D4AF37]/30 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md overflow-hidden"><img src="/yeilded_logo_refined.png" alt="Yeilded Logo" className="w-full h-full object-contain p-1" /></div>
          <div>
            <span className="font-bold text-white text-lg tracking-wide block">
              Yeilded
            </span>
            <span className="text-sm text-[#D4AF37] uppercase tracking-widest font-semibold block">
              Diplomatic Intelligence Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleDarkMode && (
            <button
              id="landing-theme-toggle-btn"
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 min-h-[40px] min-w-[40px] rounded-xl text-slate-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors flex items-center justify-center"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <Moon className="w-5 h-5 text-slate-300" />
              )}
            </button>
          )}

          <button
            id="btn-landing-currency"
            onClick={onToggleCurrency}
            className="text-base font-semibold text-slate-300 hover:text-[#D4AF37] px-3 py-2 min-h-[38px] rounded-lg bg-[#132c4f] border border-slate-700 hidden sm:inline-block active:scale-98 transition-colors"
          >
            Currency: <span className="font-bold text-white">{currency}</span>
          </button>

          <button
            id="btn-landing-signin"
            onClick={() => onOpenAuth('signin')}
            className="text-base font-bold text-slate-200 hover:text-white px-3 py-2 min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-98 transition-colors"
          >
            Sign In
          </button>

          <button
            id="btn-landing-register"
            onClick={() => onOpenAuth('signup')}
            className="text-base font-bold text-[#D4AF37] hover:text-[#e4c251] px-3 py-2 min-h-[44px] hidden xs:flex items-center justify-center rounded-lg border border-[#D4AF37]/40 hover:bg-white/5 active:scale-98 transition-colors"
          >
            Register
          </button>

          <button
            id="btn-landing-open-suite"
            onClick={onEnterApp}
            className="px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#bfa035] hover:from-[#e3c153] hover:to-[#cca937] text-[#0B1F3A] font-bold text-base rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-98"
          >
            <span>Open Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1F3A] via-[#102747] to-[#0B1F3A] text-white py-16 sm:py-20 px-4 sm:px-12 border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-base font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Delegations Toolkit</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Diplomatic Precision for the Modern Delegate
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From drafting four-page position papers and calibrated GSL interventions to simulating crisis backrooms and sparring with opposing blocs, Yeilded equips you for gavel-winning performance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-hero-launch"
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-[#D4AF37] hover:bg-[#e4c251] text-[#0B1F3A] font-bold text-base rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Launch Yeilded</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-passes"
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-white/10 hover:bg-white/15 text-white border border-[#D4AF37]/40 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>View Conference Passes</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

          {/* Quick proof chips */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#D4AF37] font-bold text-lg sm:text-xl">Specialized AI</div>
              <div className="text-sm text-slate-400">Trained on authentic UN resolutions & treaties</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#D4AF37] font-bold text-lg sm:text-xl">1-Week Pass</div>
              <div className="text-sm text-slate-400">Affordable PKR 399 / $5.00 for 1-week conferences</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#D4AF37] font-bold text-lg sm:text-xl">100% UN RoP</div>
              <div className="text-sm text-slate-400">Strict alignment with UNA-USA & THIMUN procedures</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#D4AF37] font-bold text-lg sm:text-xl">Export to PDF</div>
              <div className="text-sm text-slate-400">Formatted documentation ready for Dais submission</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-16 sm:py-20 px-4 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-base font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">
            COMPLETE DELEGATE CAPABILITIES
          </h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white">
            Built Specifically for Model United Nations
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base mt-3">
            Every feature is designed around genuine committee workflows, from pre-conference research dossiers to late-night unmoderated resolution drafting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                id={`feature-card-${i}`}
                className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] dark:bg-[#0f2a4a] text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">
                  {feat.title}
                </h4>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparent Pricing Overview */}
      <section className="py-16 px-4 sm:px-12 bg-slate-100 dark:bg-[#071326]/60 border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-base font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">
            CONFERENCE PASS PRICING
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-white">
            Designed for Real MUN Conference Schedules
          </h3>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mt-2">
            Most delegates only need access during conference weekends. That’s why our 1-Week Conference Pass is our most popular option.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div id="landing-tier-free" className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <span className="text-base font-bold text-slate-500 dark:text-slate-400 uppercase">Starter</span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Free Tier</h4>
              <div className="my-4 text-3xl font-black text-slate-900 dark:text-white">0</div>
              <p className="text-base text-slate-500 dark:text-slate-400 mb-4">
                Full access to RoP cheat sheets and clause starter database, plus 3 free position papers/speeches.
              </p>
            </div>
            <button
              id="btn-landing-tier-free"
              onClick={onEnterApp}
              className="w-full py-3 min-h-[44px] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition-all"
            >
              Start Free
            </button>
          </div>

          {/* 1-Week Pass */}
          <div id="landing-tier-1week" className="bg-white dark:bg-[#071326] p-6 rounded-2xl border-2 border-[#D4AF37] shadow-xl flex flex-col justify-between relative ring-4 ring-[#D4AF37]/10 transition-colors">
            <div className="absolute -top-3 right-4 bg-[#D4AF37] text-[#0B1F3A] text-sm font-black uppercase px-3 py-0.5 rounded-full">
              Most Popular
            </div>
            <div>
              <span className="text-base font-bold text-amber-800 dark:text-amber-400 uppercase">Weekend Pass</span>
              <h4 className="text-xl font-bold text-[#0B1F3A] dark:text-white mt-1">1-Week Conference Pass</h4>
              <div className="my-4 text-3xl font-black text-[#0B1F3A] dark:text-[#D4AF37]">
                {currency === 'PKR' ? 'PKR 399' : '$5.00 USD'}
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 mb-4">
                7 days of unlimited AI generations across all 7 tools. Ideal for the entire conference week.
              </p>
            </div>
            <button
              id="btn-landing-tier-1week"
              onClick={onOpenPricing}
              className="w-full py-3 min-h-[44px] bg-[#0B1F3A] hover:bg-[#132c4f] dark:bg-[#0f2a4a] text-[#D4AF37] rounded-xl text-base font-bold shadow-md active:scale-98 transition-all"
            >
              Get 1-Week Pass
            </button>
          </div>

          {/* Monthly */}
          <div id="landing-tier-monthly" className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <span className="text-base font-bold text-blue-700 dark:text-blue-400 uppercase">Season Access</span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Monthly Pass</h4>
              <div className="my-4 text-3xl font-black text-slate-900 dark:text-white">
                {currency === 'PKR' ? 'PKR 1,399' : '$15.00 USD'}
              </div>
              <p className="text-base text-slate-500 dark:text-slate-400 mb-4">
                30 days of continuous access for delegates and head delegates preparing multiple delegations.
              </p>
            </div>
            <button
              id="btn-landing-tier-monthly"
              onClick={onOpenPricing}
              className="w-full py-3 min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-base font-bold active:scale-98 transition-all"
            >
              Get Monthly Pass
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1F3A] dark:bg-[#040b17] text-slate-400 py-12 px-4 sm:px-12 border-t border-[#D4AF37]/20 text-base">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-white text-base">Yeilded</span>
            <span className="text-slate-500">| Designed for International Delegates</span>
          </div>

          <div>
            Built with UN Rules of Procedure & diplomatic standards.
          </div>
        </div>
      </footer>
    </div>
  );
};
