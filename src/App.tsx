import React, { useState, useEffect } from 'react';
import { DelegateContext, User, Currency, TabType } from './types';
import { api } from './services/api';

// Icons for mobile bottom nav
import { FileText, Mic, Layers, BookOpen, Menu } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';

// Feature Tabs
import { PositionPaperTab } from './components/tabs/PositionPaperTab';
import { SpeechWriterTab } from './components/tabs/SpeechWriterTab';
import { ResolutionBuilderTab } from './components/tabs/ResolutionBuilderTab';
import { RoPAssistantTab } from './components/tabs/RoPAssistantTab';
import { PolicyResearchTab } from './components/tabs/PolicyResearchTab';
import { CrisisSimulatorTab } from './components/tabs/CrisisSimulatorTab';
import { DebatePracticeTab } from './components/tabs/DebatePracticeTab';
import { DeepSeekChatbot } from './components/DeepSeekChatbot';
import { SettingsTab } from './components/tabs/SettingsTab';
import { ArchivesTab } from './components/tabs/ArchivesTab';
import { AdminDashboard } from './components/AdminDashboard';

const DEFAULT_CONTEXT: DelegateContext = {
  country: 'United States of America',
  committee: 'UNSC',
  topic: 'Non-Proliferation and Regulation of Lethal Autonomous Weapons Systems (LAWS)',
  delegateName: 'Distinguished Delegate'
};

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('position-paper');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mun_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // User & Auth State - persisted to avoid session drops
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mun_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authBannerMessage, setAuthBannerMessage] = useState<string | null>(null);

  // URL Path & Query state for direct page navigation (/forgot-password, /reset-password)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      return window.location.pathname || '/';
    } catch {
      return '/';
    }
  });
  const [resetToken, setResetToken] = useState<string>(() => {
    try {
      return new URLSearchParams(window.location.search).get('token') || '';
    } catch {
      return '';
    }
  });

  // Pricing & Licensing Modal
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');

  // Onboarding & Delegate Context
  const [delegateContext, setDelegateContext] = useState<DelegateContext>(() => {
    try {
      const saved = localStorage.getItem('mun_delegate_context');
      return saved ? JSON.parse(saved) : DEFAULT_CONTEXT;
    } catch {
      return DEFAULT_CONTEXT;
    }
  });
  
  const [contextHistory, setContextHistory] = useState<DelegateContext[]>(() => {
    try {
      const saved = localStorage.getItem('mun_delegate_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Sync Dark Mode class to document element and body
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('mun_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('mun_dark_mode', 'false');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem('mun_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('mun_user');
      }
    } catch {
      // ignore
    }
  };

  // Initialize App: load user, detect geo-currency, check onboarding
  useEffect(() => {
    // 1. Fetch current logged-in user if token exists
    const token = localStorage.getItem('mun_auth_token');
    if (token) {
      api.getCurrentUser()
        .then((res) => {
          if (res.user) {
            handleSetUser(res.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('mun_auth_token');
          handleSetUser(null);
        });
    }

    // 2. Auto-detect user geo currency
    api.detectCurrency().then((cur) => setCurrency(cur));

    // 3. Prompt onboarding if first time
    const hasSeenOnboarding = localStorage.getItem('mun_has_onboarded');
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
      localStorage.setItem('mun_has_onboarded', 'true');
    }

    // 4. Handle browser popstate navigation (/forgot-password, /reset-password)
    const handleLocationChange = () => {
      try {
        const path = window.location.pathname || '/';
        const searchToken = new URLSearchParams(window.location.search).get('token') || '';
        setCurrentPath(path);
        setResetToken(searchToken);
      } catch {}
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string, search = '') => {
    try {
      const fullUrl = search ? `${path}?${search}` : path;
      window.history.pushState({}, '', fullUrl);
      setCurrentPath(path);
      setResetToken(search ? new URLSearchParams(search).get('token') || '' : '');
    } catch {
      window.location.href = search ? `${path}?${search}` : path;
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleUpdateContext = (newCtx: DelegateContext) => {
    setDelegateContext(newCtx);
    try {
      localStorage.setItem('mun_delegate_context', JSON.stringify(newCtx));
    } catch {
      // ignore
    }
  };

  const handleUpdatePartialContext = (patch: Partial<DelegateContext>) => {
    setDelegateContext((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem('mun_delegate_context', JSON.stringify(updated));
        
        // Update history if country or committee changed
        if (patch.country || patch.committee) {
          setContextHistory(prevHist => {
             const newHist = prevHist.filter(h => !(h.country === updated.country && h.committee === updated.committee));
             newHist.unshift(updated);
             const trimmed = newHist.slice(0, 5);
             localStorage.setItem('mun_delegate_history', JSON.stringify(trimmed));
             return trimmed;
          });
        }
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleOpenAuth = (mode?: 'signin' | 'signup' | any) => {
    setAuthMode(typeof mode === 'string' ? mode : 'signin');
    setIsAuthOpen(true);
  };

  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === 'PKR' ? 'USD' : 'PKR'));
  };

  const handleLogout = () => {
    api.logout();
    handleSetUser(null);
  };

  const handlePassActivated = (updatedUser: User) => {
    handleSetUser(updatedUser);
  };

  if (currentPath === '/forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => {
          navigateTo('/');
          setAuthMode('signin');
          setIsAuthOpen(true);
        }}
        onNavigateHome={() => navigateTo('/')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  if (currentPath === '/reset-password') {
    return (
      <ResetPasswordPage
        token={resetToken}
        onNavigateToLogin={(successMsg) => {
          navigateTo('/');
          setAuthMode('signin');
          if (successMsg) {
            setAuthBannerMessage(successMsg);
          }
          setIsAuthOpen(true);
        }}
        onNavigateToForgotPassword={() => {
          navigateTo('/forgot-password');
        }}
        onNavigateHome={() => navigateTo('/')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#060f1d] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#0B1F3A] transition-colors duration-200">
      {showLanding ? (
        <LandingPage
          onEnterApp={() => setShowLanding(false)}
          onOpenAuth={handleOpenAuth}
          onOpenPricing={() => setIsPricingOpen(true)}
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'pricing') {
                setIsPricingOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            user={user}
            onOpenAuth={handleOpenAuth}
            onOpenPricing={() => setIsPricingOpen(true)}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onViewLanding={() => setShowLanding(true)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Top Bar Header */}
            <Header
              context={delegateContext}
              onUpdateContext={handleUpdatePartialContext}
              contextHistory={contextHistory}
              onLoadHistory={(ctx) => setDelegateContext(ctx)}
              user={user}
              onOpenAuth={handleOpenAuth}
              onOpenPricing={() => setIsPricingOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onNavigate={(t) => setActiveTab(t as any)}
              onLogout={handleLogout}
              currency={currency}
              onToggleCurrency={handleToggleCurrency}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
            />

            {/* Scrollable Active View */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
              {activeTab === 'position-paper' && (
                <PositionPaperTab
                  context={delegateContext}
                  onUpdateContext={handleUpdatePartialContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                />
              )}

              {activeTab === 'speech-writer' && (
                <SpeechWriterTab
                  context={delegateContext}
                  onUpdateContext={handleUpdatePartialContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                />
              )}

              {activeTab === 'clause-builder' && (
                <ResolutionBuilderTab
                  context={delegateContext}
                  onUpdateContext={handleUpdatePartialContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                />
              )}

              {activeTab === 'rop-assistant' && (
                <RoPAssistantTab
                  context={delegateContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                />
              )}

              {activeTab === 'policy-research' && (
                <PolicyResearchTab
                  context={delegateContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                />
              )}

              {activeTab === 'crisis-simulator' && (
                <CrisisSimulatorTab
                  context={delegateContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                />
              )}

              {activeTab === 'debate-practice' && (
                <DebatePracticeTab
                  context={delegateContext}
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                />
              )}

              {activeTab === 'archives' && (
                <ArchivesTab
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onLoadDraftContext={(partial) => {
                    setDelegateContext((prev) => ({ ...prev, ...partial }));
                    setActiveTab('position-paper');
                  }}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'admin' && user?.email === 'abdulahad2010mine@gmail.com' && (
                <AdminDashboard />
              )}
            </main>

            {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet viewports) */}
            <nav 
              id="mobile-bottom-nav"
              aria-label="Mobile Bottom Navigation"
              className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#071326]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16 px-1 shadow-lg"
            >
              <button
                id="bottom-nav-paper-btn"
                onClick={() => setActiveTab('position-paper')}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                  activeTab === 'position-paper'
                    ? 'text-[#0B1F3A] dark:text-[#D4AF37] font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">Paper</span>
              </button>

              <button
                id="bottom-nav-speech-btn"
                onClick={() => setActiveTab('speech-writer')}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                  activeTab === 'speech-writer'
                    ? 'text-[#0B1F3A] dark:text-[#D4AF37] font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">Speeches</span>
              </button>

              <button
                id="bottom-nav-clauses-btn"
                onClick={() => setActiveTab('clause-builder')}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                  activeTab === 'clause-builder'
                    ? 'text-[#0B1F3A] dark:text-[#D4AF37] font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">Clauses</span>
              </button>

              <button
                id="bottom-nav-rop-btn"
                onClick={() => setActiveTab('rop-assistant')}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                  activeTab === 'rop-assistant'
                    ? 'text-[#0B1F3A] dark:text-[#D4AF37] font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">RoP</span>
              </button>

              <button
                id="bottom-nav-menu-btn"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Open full diplomatic suite menu"
              >
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">More</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentContext={delegateContext}
        onSaveContext={handleUpdateContext}
      />

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthBannerMessage(null);
        }}
        initialMode={authMode}
        bannerMessage={authBannerMessage}
        onForgotPassword={() => {
          setIsAuthOpen(false);
          navigateTo('/forgot-password');
        }}
        onSuccess={(authedUser) => {
          handleSetUser(authedUser);
          setIsAuthOpen(false);
          setAuthBannerMessage(null);
          setShowLanding(false); // Seamlessly enter the diplomatic suite upon registration/login
          if (authedUser.name && (!delegateContext.delegateName || delegateContext.delegateName === 'Distinguished Delegate')) {
            handleUpdatePartialContext({ delegateName: authedUser.name });
          }
        }}
        onAuthSuccess={(authedUser) => {
          handleSetUser(authedUser);
          setIsAuthOpen(false);
          setAuthBannerMessage(null);
          setShowLanding(false);
          if (authedUser.name && (!delegateContext.delegateName || delegateContext.delegateName === 'Distinguished Delegate')) {
            handleUpdatePartialContext({ delegateName: authedUser.name });
          }
        }}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Pricing & Conference Passes Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={user}
        onOpenAuth={handleOpenAuth}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        onPassActivated={handlePassActivated}
      />
      {/* DeepSeek Chatbot Floating Widget */}
      <DeepSeekChatbot />
    </div>
  );
}

