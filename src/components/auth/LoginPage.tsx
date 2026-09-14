import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  Send, 
  X, 
  ArrowLeft,
  ShieldCheck,
  Gift,
  User,
  AlertCircle,
  Database
} from 'lucide-react';
import { SUPABASE_PROJECT_ID } from '../../lib/supabase';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithCredentials, registerUser, resetPasswordForEmail, showToast } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('CMARJT5');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signupSuccessNotice, setSignupSuccessNotice] = useState<string | null>(null);
  
  // Auto-detect invite code from Share Link in URL query params on load
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = 
        urlParams.get('code') || 
        urlParams.get('invite') || 
        urlParams.get('ref') || 
        urlParams.get('sponsor');

      if (codeFromUrl && codeFromUrl.trim()) {
        const cleanCode = codeFromUrl.trim().toUpperCase();
        setInviteCode(cleanCode);
        setMode('register');
        showToast(`Invite code ${cleanCode} auto-applied from referral link!`, 'info');
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [showToast]);

  // Dedicated Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSignupSuccessNotice(null);
    setLoading(true);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const roleToUse: 'user' | 'admin' = cleanEmail.toLowerCase().includes('admin') ? 'admin' : 'user';
        const res = await loginWithCredentials(cleanEmail, password, roleToUse);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(res.message);
          showToast(res.message, 'error');
        }
      } else {
        // Registration mode
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter your password.');
          showToast('Passwords do not match!', 'error');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters (Supabase security requirement).');
          showToast('Password must be at least 6 characters', 'error');
          setLoading(false);
          return;
        }

        const res = await registerUser(cleanEmail, password, inviteCode, fullName);
        if (res.success) {
          if (res.requiresEmailConfirmation) {
            setSignupSuccessNotice(
              `Account created successfully! Supabase has sent a verification email to ${cleanEmail}. Please confirm your email inbox and then sign in.`
            );
            setMode('login');
          } else {
            if (onSuccess) onSuccess();
          }
        } else {
          setErrorMessage(res.message);
          showToast(res.message, 'error');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo account filler
  const handleQuickDemo = async (type: 'investor' | 'admin') => {
    setErrorMessage(null);
    setLoading(true);
    if (type === 'admin') {
      setEmail('admin@coffee-invest.app');
      setPassword('admin123');
      const res = await loginWithCredentials('admin@coffee-invest.app', 'admin123', 'admin');
      if (res.success && onSuccess) onSuccess();
    } else {
      setEmail('demo@coffee-invest.app');
      setPassword('demo123');
      const res = await loginWithCredentials('demo@coffee-invest.app', 'demo123', 'user');
      if (res.success && onSuccess) onSuccess();
    }
    setLoading(false);
  };

  // Forgot Password Action via Supabase
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      showToast('Please enter a valid registered email address', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await resetPasswordForEmail(forgotEmail);
      if (res.success) {
        setForgotSubmitted(true);
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto max-w-md mx-auto w-full">
      <div className="space-y-4 pt-2">
        {/* Top Header & Branding */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/20 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/10">
            ☕
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              COFFEE MINING
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Ethiopian Coffee Investment & Real-Time Cloud Mining
            </p>
          </div>

          {/* Supabase Status Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database size={12} className="text-emerald-400" />
            <span>Supabase Email Auth Active</span>
            <span className="text-zinc-500 font-mono text-[10px]">({SUPABASE_PROJECT_ID.slice(0, 8)}...)</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-inner">
          <button
            id="tab-auth-login"
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Sign In</span>
          </button>

          <button
            id="tab-auth-register"
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Create Account</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              mode === 'register' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              +100 ETB
            </span>
          </button>
        </div>

        {/* Success Notice after registration when email confirmation is active */}
        {signupSuccessNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold text-white">Verification Email Dispatched</strong>
              <p className="leading-relaxed text-zinc-300">{signupSuccessNotice}</p>
            </div>
          </div>
        )}

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button 
              type="button" 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Registration Welcome Incentive Banner */}
        {mode === 'register' && (
          <div className="bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-900 p-3.5 rounded-2xl border border-emerald-500/25 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Gift size={16} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Welcome Gift Pack</h2>
                <p className="text-[11px] text-zinc-400">Claim ETB 100.00 Free Coffee Starter Credit</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 font-mono">+100.00 ETB</span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 bg-zinc-900/60 p-4 rounded-3xl border border-zinc-800/90 shadow-md">
          {/* Full Name field (Sign Up only) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="register-name-input" className="text-xs font-bold text-zinc-300 block">
                Full Name:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={16} />
                </div>
                <input
                  id="register-name-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label htmlFor="auth-email-input" className="text-xs font-bold text-zinc-300 block">
              Email Address:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail size={16} />
              </div>
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password-input" className="text-xs font-bold text-zinc-300 block">
                Password:
              </label>
              {mode === 'register' && (
                <span className="text-[10px] text-zinc-400">Min. 6 characters</span>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock size={16} />
              </div>
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create strong password'}
                className="w-full pl-10 pr-10 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (when in register mode) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password-input" className="text-xs font-bold text-zinc-300 block">
                Confirm Password:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  id="register-confirm-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Invite Code Field (when in register mode) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="register-invite-code-input" className="text-xs font-bold text-zinc-300 block">
                  Invitation Code:
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Bonus ETB 100.00</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Gift size={16} className="text-emerald-400" />
                </div>
                <input
                  id="register-invite-code-input"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CMARJT5"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors uppercase tracking-wider font-mono"
                />
              </div>
            </div>
          )}

          {/* Remember credentials checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMeCheck"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="rememberMeCheck" className="text-xs text-zinc-400 cursor-pointer select-none">
                Remember credentials
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Connecting to Supabase...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Sign In with Email</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Account & Claim ETB 100</span>
              </>
            )}
          </button>

          {/* Forgot Password Link (Login mode only) */}
          {mode === 'login' && (
            <div className="text-center pt-1">
              <button
                id="btn-forgot-password"
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSubmitted(false);
                  setShowForgotPasswordModal(true);
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
              >
                <KeyRound size={13} />
                <span>Forgot Password?</span>
              </button>
            </div>
          )}

          {/* Bottom Switch between login and register */}
          <div className="pt-2 text-center text-xs flex items-center justify-center gap-1.5 border-t border-zinc-800/60 mt-1">
            <span className="text-zinc-400">
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              id="btn-switch-auth-mode"
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
              }}
              className="text-emerald-400 font-bold hover:underline cursor-pointer transition-colors"
            >
              {mode === 'login' ? 'Sign Up for Free' : 'Sign In Here'}
            </button>
          </div>
        </form>

        {/* Quick Testing Demo Accounts */}
        <div className="p-3 bg-zinc-900/40 rounded-2xl border border-zinc-800/70 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Instant Test Accounts (1-Click)</span>
            </span>
            <span className="text-[10px] text-zinc-500">Preview & QA</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-demo-user"
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('investor')}
              className="py-2 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer text-center truncate"
            >
              Demo Investor
            </button>

            <button
              id="btn-quick-demo-admin"
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer text-center truncate"
            >
              Platform Admin
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED FORGOT PASSWORD MODAL (SUPABASE INTEGRATED) */}
      {showForgotPasswordModal && (
        <div 
          id="modal-forgot-password"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white font-['Outfit']">
                    Reset Password
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Secure Supabase Email Recovery
                  </p>
                </div>
              </div>

              <button
                id="btn-close-forgot-modal"
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-3 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-sm text-white">Reset Link Dispatched</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Supabase has sent a password reset email to:
                  <strong className="block text-emerald-400 font-mono mt-1">{forgotEmail}</strong>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Please open your email client and follow the recovery link to set your new password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enter your registered Supabase email address. We will send a secure password reset link to your inbox.
                </p>

                <div className="space-y-1">
                  <label htmlFor="forgot-email-input" className="text-[11px] font-bold text-zinc-300 block">Registered Email Address:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail size={15} />
                    </div>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  id="btn-send-forgot-otp"
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Recovery Email</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
