import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  KeyRound, 
  Send, 
  X, 
  ArrowLeft,
  Link2,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Gift
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithCredentials, registerUser, showToast } = useApp();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('CMARJT5');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [detectedFromLink, setDetectedFromLink] = useState(false);
  
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
        setDetectedFromLink(true);
        setMode('register'); // Direct to register tab for immediate onboarding
        showToast(`Invite code ${cleanCode} auto-applied from share link!`, 'info');
      }
    } catch {
      // Graceful fallback for non-standard environments
    }
  }, [showToast]);
  
  // Google Account Chooser modal
  // Dedicated Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Enter Email, 2: Enter OTP, 3: Set New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifier = emailOrPhone.trim();
      const roleToUse: 'user' | 'admin' = identifier.toLowerCase().includes('admin') ? 'admin' : 'user';

      if (mode === 'login') {
        const res = await loginWithCredentials(identifier, password, roleToUse);
        if (res.success && onSuccess) onSuccess();
      } else {
        if (password !== confirmPassword) {
          showToast('Passwords do not match!', 'error');
          return;
        }
        const res = await registerUser(identifier, password, inviteCode);
        if (res.success && onSuccess) onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Actions
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      showToast('Please enter a valid registered email address', 'error');
      return;
    }
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep(2);
      setForgotOtp('582914'); // Realistic demo OTP pre-filled for convenience
      setResendTimer(60);
      showToast(`Verification code sent to ${forgotEmail}`, 'success');
      
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length < 4) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    setForgotStep(3);
    showToast('Code verified successfully! Now create your new password.', 'success');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      showToast('Password must be at least 4 characters long', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setForgotLoading(true);
    setTimeout(async () => {
      setForgotLoading(false);
      setShowForgotPasswordModal(false);
      setPassword(newPassword);
      setEmailOrPhone(forgotEmail);
      setForgotStep(1);
      showToast('Password updated! Signing in automatically...', 'success');
      await loginWithCredentials(forgotEmail, newPassword);
      if (onSuccess) onSuccess();
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto max-w-md mx-auto w-full">
      {/* Top Header & Branding */}
      <div className="space-y-4 pt-3">
        <div className="flex flex-col items-center justify-center text-center py-2 space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/15">
            ☕
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              COFFEE MINING
            </h1>
          </div>
        </div>

        {/* Welcome Banner Card (only in register mode) */}
        {mode === 'register' && (
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white font-['Outfit'] mt-0.5">
                  Create Mining Account
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Get ETB 100 ETB Free Coffee Starter Credit on registration!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Standard Email or Phone Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 shadow-md">
          {/* Email or Phone Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">
              Email or Phone:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail size={16} />
              </div>
              <input
                id="login-email-phone-input"
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Enter your email or phone number"
                className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">Password:</label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock size={16} />
              </div>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
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
              <label className="text-xs font-bold text-zinc-300 block">Confirm Password:</label>
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
                  placeholder="Re-enter password"
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
                  Invite Code:
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
                  placeholder="Enter invite code (e.g. CMARJT5)"
                  className="w-full pl-10 pr-3.5 py-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs sm:text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors uppercase tracking-wider font-mono"
                />
              </div>
            </div>
          )}

          {/* Remember me checkbox */}
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
                <span>Authenticating...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Login</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Register & Claim ETB 100 Bonus</span>
              </>
            )}
          </button>

          {/* Forgot Password Link - Bottom of Login Button */}
          {mode === 'login' && (
            <div className="text-center pt-1">
              <button
                id="btn-forgot-password"
                type="button"
                onClick={() => {
                  setForgotEmail(emailOrPhone);
                  setForgotStep(1);
                  setShowForgotPasswordModal(true);
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
              >
                <KeyRound size={13} />
                <span>Forgot Password?</span>
              </button>
            </div>
          )}

          {/* Don't have an account / Register Account at end of Login */}
          <div className="pt-2 text-center text-xs flex items-center justify-center gap-1.5 border-t border-zinc-800/60 mt-1">
            <span className="text-zinc-400">
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              id="btn-switch-auth-mode"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-emerald-400 font-bold hover:underline cursor-pointer transition-colors"
            >
              {mode === 'login' ? 'Register Account' : 'Login'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. DEDICATED FORGOT PASSWORD MODAL */}
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
                    Reset Account Password
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Step {forgotStep} of 3 • Secure Email Recovery
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

            {/* Step 1: Request OTP by Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enter your registered email address. We will send a 6-digit verification code to reset your password.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Registered Email Address:</label>
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
                      <span>Send 6-Digit Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter Verification Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center space-y-1">
                  <p className="text-[11px] text-zinc-400">Verification code sent to:</p>
                  <strong className="text-xs text-emerald-400 font-mono block truncate">{forgotEmail}</strong>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Enter 6-Digit OTP Code:</label>
                  <input
                    id="forgot-otp-input"
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="582914"
                    className="w-full px-3 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-center text-base font-mono font-black text-emerald-400 tracking-widest focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => {
                      setResendTimer(60);
                      showToast(`Code resent to ${forgotEmail}`, 'info');
                    }}
                    className={`font-bold ${resendTimer > 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-emerald-400 hover:underline cursor-pointer'}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  id="btn-verify-forgot-otp"
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify Code</span>
                </button>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-zinc-300">
                  Create a new secure password for your Coffee Mining account.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">New Password:</label>
                  <div className="relative">
                    <input
                      id="forgot-new-password-input"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 block">Confirm New Password:</label>
                  <input
                    id="forgot-confirm-new-password-input"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <button
                  id="btn-save-new-password"
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={14} />
                      <span>Save Password & Login</span>
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
