import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Moon, Sun } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateHome,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your account email address.');
      return;
    }

    setLoading(true);

    try {
      await api.forgotPassword(cleanEmail);
      // Consistent success state to prevent account enumeration
      setSubmitted(true);
    } catch (err: any) {
      if (err.status === 429) {
        setError(err.message || 'Too many password reset requests. Please wait an hour before trying again.');
      } else {
        // Even if an unexpected error occurs, don't leak account existence, but report rate limits
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#060f1d] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <button
          id="forgot-pwd-home-link"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0B1F3A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-sm group-hover:border-[#D4AF37] transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Yeilded
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              Diplomatic Suite
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {onToggleDarkMode && (
            <button
              id="forgot-pwd-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-[#D4AF37] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            id="forgot-pwd-nav-signin-btn"
            onClick={onNavigateToLogin}
            className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl text-[#0B1F3A] dark:text-[#D4AF37] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Centered Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#0c1c33] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#0B1F3A] text-white p-5 sm:p-6 border-b border-[#D4AF37]/30 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#D4AF37] mb-2 text-xs font-semibold tracking-wider uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
              <Shield className="w-3.5 h-3.5" />
              <span>SECURITY & CREDENTIALS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
              Enter your registered delegate email and we will send you a secure link to reset your credentials.
            </p>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-7">
            {submitted ? (
              <div className="text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Check Your Inbox
                </h2>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    If an account exists, we've sent a reset link.
                  </span>
                  Please check your email inbox and spam folder. For your security, the reset link is valid for <strong>30 minutes</strong>.
                </p>

                <div className="space-y-2.5">
                  <button
                    id="forgot-pwd-back-to-login-btn"
                    onClick={onNavigateToLogin}
                    className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4AF37]/30"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="forgot-pwd-try-another-btn"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                      setError(null);
                    }}
                    className="w-full min-h-[44px] py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Need to try a different email?
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm font-medium text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="forgot-email-input" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="delegate@school.edu"
                      autoComplete="email"
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    We will send a single-use 30-minute password reset link to this address.
                  </p>
                </div>

                <button
                  id="forgot-password-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 border border-[#D4AF37]/30 disabled:opacity-60"
                >
                  {loading ? (
                    <span>Sending Reset Link...</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    id="forgot-pwd-cancel-btn"
                    type="button"
                    onClick={onNavigateToLogin}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-[#D4AF37] hover:underline min-h-[36px] px-2 py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>Yeilded Diplomatic AI Suite • Secure Delegation Portal</span>
        <span className="hidden sm:inline">•</span>
        <span>Need help? <a href="mailto:support@yeilded.com" className="text-[#0B1F3A] dark:text-[#D4AF37] hover:underline font-medium">support@yeilded.com</a></span>
      </footer>
    </div>
  );
};
