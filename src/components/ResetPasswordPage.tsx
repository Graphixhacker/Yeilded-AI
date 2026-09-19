import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onNavigateToLogin: (message?: string) => void;
  onNavigateToForgotPassword: () => void;
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token,
  onNavigateToLogin,
  onNavigateToForgotPassword,
  onNavigateHome,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token || !token.trim()) {
        if (isMounted) {
          setIsValidating(false);
          setTokenValid(false);
          setTokenError('Password reset link is missing or invalid.');
        }
        return;
      }

      try {
        const res = await api.validateResetToken(token);
        if (isMounted) {
          if (res.valid) {
            setTokenValid(true);
            setMaskedEmail(res.email || null);
          } else {
            setTokenValid(false);
            setTokenError(res.error || 'This password reset link is invalid or expired.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(err.message || 'This password reset link is invalid, used, or expired.');
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPass.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setFormError('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);

    try {
      await api.resetPassword(token, cleanPass);
      setResetSuccess(true);
      // Wait briefly for the user to see the success state, then redirect to login with message
      setTimeout(() => {
        onNavigateToLogin('Password updated successfully. Please sign in with your new password.');
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#060f1d] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <button
          id="reset-pwd-home-link"
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
              id="reset-pwd-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-[#D4AF37] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            id="reset-pwd-header-signin-btn"
            onClick={() => onNavigateToLogin()}
            className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl text-[#0B1F3A] dark:text-[#D4AF37] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors min-h-[44px] flex items-center"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#0c1c33] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Card Banner */}
          <div className="bg-[#0B1F3A] text-white p-5 sm:p-6 border-b border-[#D4AF37]/30 text-center">
            <div className="inline-flex items-center gap-1.5 text-[#D4AF37] mb-2 text-xs font-semibold tracking-wider uppercase bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
              <Shield className="w-3.5 h-3.5" />
              <span>DELEGATION SECURITY</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
              Choose a secure password with at least 6 characters for your Yeilded account.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {/* 1. Loading State */}
            {isValidating && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto text-[#D4AF37] animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Verifying your secure reset token...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting to diplomatic credentials server
                </p>
              </div>
            )}

            {/* 2. Token Invalid or Expired State */}
            {!isValidating && !tokenValid && (
              <div className="text-center py-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Invalid or Expired Link
                </h2>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed bg-rose-50/50 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 text-left">
                  {tokenError || 'This password reset link is invalid, has already been used, or has expired (links are valid for 30 minutes).'}
                </p>

                <div className="space-y-3">
                  <button
                    id="request-new-reset-btn"
                    onClick={onNavigateToForgotPassword}
                    className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4AF37]/30"
                  >
                    <span>Request a New Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="expired-back-to-login-btn"
                    onClick={() => onNavigateToLogin()}
                    className="w-full min-h-[44px] py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Success State */}
            {!isValidating && tokenValid && resetSuccess && (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Password Updated
                </h2>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                  Your credentials have been updated securely. Redirecting to sign in...
                </p>

                <button
                  id="success-login-now-btn"
                  onClick={() => onNavigateToLogin('Password updated successfully. Please sign in with your new password.')}
                  className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border border-[#D4AF37]/30"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 4. Reset Form State */}
            {!isValidating && tokenValid && !resetSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {maskedEmail && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Account:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{maskedEmail}</span>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm font-medium text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{formError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="new-password-input" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    New Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="new-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password-input" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm sm:text-base border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>

                {password && confirmPassword && (
                  <div className="text-xs">
                    {password === confirmPassword ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match yet
                      </span>
                    )}
                  </div>
                )}

                <button
                  id="reset-password-submit-btn"
                  type="submit"
                  disabled={submitting || (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword)}
                  className="w-full min-h-[44px] py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 border border-[#D4AF37]/30 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    id="reset-pwd-cancel-btn"
                    type="button"
                    onClick={() => onNavigateToLogin()}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-[#D4AF37] hover:underline min-h-[36px] px-2 py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
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
