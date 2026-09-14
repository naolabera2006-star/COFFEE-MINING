import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Gift, Sparkles, Check, AlertCircle, ShieldCheck, Plus, Clock, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedeemCodeBonusCardProps {
  className?: string;
}

export const RedeemCodeBonusCard: React.FC<RedeemCodeBonusCardProps> = ({ className = '' }) => {
  const { user, redeemGiftCode, generateRedeemCode, giftCodes, showToast } = useApp();
  
  // Redeem state (for users or admin testing)
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live timer for 5-minute countdown
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Admin code generator state
  const [adminCodeName, setAdminCodeName] = useState('');
  const [adminRewardAmount, setAdminRewardAmount] = useState('200');

  const isAdmin = user.role === 'admin';

  // Process gift codes and calculate remaining time in 5-minute validity window
  const activeCodesList = Object.entries(giftCodes || {}).map(([key, val]) => {
    let amount = 0;
    let expiresAt = 0;
    let createdAt = 0;

    if (typeof val === 'number') {
      amount = val;
      expiresAt = 0; // Legacy sample code with no expiration
    } else if (val && typeof val === 'object') {
      const codeObj = val as { amount: number; expiresAt?: number; createdAt?: number };
      amount = codeObj.amount || 0;
      expiresAt = codeObj.expiresAt || 0;
      createdAt = codeObj.createdAt || 0;
    }

    const isExpired = expiresAt > 0 && currentTime > expiresAt;
    const secondsLeft = expiresAt > 0 ? Math.max(0, Math.floor((expiresAt - currentTime) / 1000)) : null;
    const mins = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
    const secs = secondsLeft !== null ? secondsLeft % 60 : 0;
    const isRedeemed = user.redeemedGiftCodes.includes(key);

    return {
      codeKey: key,
      amount,
      expiresAt,
      createdAt,
      isExpired,
      secondsLeft,
      mins,
      secs,
      isRedeemed
    };
  }).filter(c => {
    // Remove after 5 minutes: only show active codes within their 5-minute validity window
    return c.expiresAt > 0 && currentTime < c.expiresAt && !c.isExpired;
  }).reverse();

  const handleRedeem = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const targetCode = (customCode || code).trim().toUpperCase();
    if (!targetCode) {
      setStatusMessage({ type: 'error', text: 'Please enter a redeem code.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    setTimeout(() => {
      const res = redeemGiftCode(targetCode);
      setIsSubmitting(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Claimed +ETB ${(res.amount || 0).toFixed(2)} bonus to your balance.`
        });
        setCode('');
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Invalid or expired redeem code.'
        });
      }
    }, 300);
  };

  const handleCopyCode = (codeToCopy: string) => {
    try {
      navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(codeToCopy);
      showToast(`Code [${codeToCopy}] copied!`, 'info');
      setCode(codeToCopy);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (e) {
      setCode(codeToCopy);
    }
  };

  const handleAdminGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = adminCodeName.trim().toUpperCase() || `BONUS${Math.floor(100 + Math.random() * 900)}`;
    const amt = Number(adminRewardAmount) || 200;

    const res = generateRedeemCode(targetCode, amt);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Redeem Code [${targetCode}] with ETB ${(amt || 0).toFixed(2)} Bonus reward generated! Valid for user for 5 minutes.`
      });
      setAdminCodeName('');
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 }
      });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const generateRandomCode = () => {
    const prefixes = ['COFFEE', 'BONUS', 'ETHIO', 'HARVEST', 'VIP'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setAdminCodeName(`${p}${num}`);
  };

  return (
    <div
      id="redeem-code-bonus-form-card"
      className={`bg-[#0e2a1e]/95 rounded-3xl p-4 sm:p-5 border border-[#1b4e36]/70 shadow-lg space-y-3.5 relative overflow-hidden ${className}`}
    >
      {/* Subtle emerald background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            {isAdmin ? <ShieldCheck size={17} className="text-amber-400" /> : <Gift size={16} />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white font-['Outfit'] tracking-tight flex items-center gap-2">
              <span>{isAdmin ? 'Generate Redeem Code' : 'Redeem Code Bonus'}</span>
              <Sparkles size={13} className="text-amber-400" />
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isAdmin
                ? 'Create bonus coupon codes with custom ETB rewards for users.'
                : 'Enter your bonus voucher code to claim instant wallet rewards.'}
            </p>
          </div>
        </div>
      </div>

      {/* ADMIN ONLY: Generate Redeem Code Form */}
      {isAdmin ? (
        <form onSubmit={handleAdminGenerate} className="space-y-3 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-zinc-300">Code Name</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                >
                  Generate Random
                </button>
              </div>
              <input
                id="input-admin-code-name"
                type="text"
                value={adminCodeName}
                onChange={(e) => setAdminCodeName(e.target.value.toUpperCase())}
                placeholder="e.g. BONUS500"
                className="w-full px-3.5 py-2.5 bg-[#0a2318] rounded-xl border border-[#1b4e36] text-sm font-mono font-bold text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-400 uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Bonus Reward Amount (ETB)
              </label>
              <input
                id="input-admin-code-reward"
                type="number"
                min="1"
                value={adminRewardAmount}
                onChange={(e) => setAdminRewardAmount(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3.5 py-2.5 bg-[#0a2318] rounded-xl border border-[#1b4e36] text-sm font-mono font-bold text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-zinc-400">
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Clock size={12} />
              Valid for user for 5 minutes
            </span>
            <span className="text-zinc-500">Auto-credited upon redemption</span>
          </div>

          <button
            id="btn-admin-generate-redeem-code"
            type="submit"
            className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Generate Redeem Code with ETB {Number(adminRewardAmount) || 0} Reward</span>
          </button>
        </form>
      ) : (
        /* REGULAR USER: Redeem Code Bonus Input Form */
        <form onSubmit={handleRedeem} className="space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-bonus-voucher-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. COFFEE2026, BONUS200"
                className="w-full px-4 py-3 bg-[#0a2318] rounded-2xl border border-[#1b4e36] text-sm font-mono font-bold text-white placeholder:text-zinc-400 focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors uppercase tracking-wider"
              />
              {code && (
                <button
                  type="button"
                  onClick={() => setCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              id="btn-submit-bonus-code"
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} />
              <span>{isSubmitting ? 'Redeeming...' : 'Redeem Code'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE 5-MINUTE REDEEM CODES FOR USERS */}
      {activeCodesList.length > 0 && (
        <div className="pt-2 border-t border-[#1b4e36]/70 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={12} />
              Active Redeem Codes (Valid for 5 Minutes)
            </span>
            <span className="text-[10px] text-zinc-400">
              Valid for user for 5 min
            </span>
          </div>

          <div className="space-y-1.5">
            {activeCodesList.map((item) => (
              <div
                key={item.codeKey}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  item.isExpired
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 opacity-60'
                    : item.isRedeemed
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0a2318] border-amber-400/40 text-white shadow-md'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs tracking-wider text-amber-300">
                        {item.codeKey}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                        +ETB {item.amount.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {item.isExpired ? (
                        <span className="text-rose-400 font-semibold">Expired (5m validity passed)</span>
                      ) : (
                        <span className="text-amber-300 font-mono font-bold flex items-center gap-1">
                          <Clock size={10} />
                          {item.mins}m {item.secs < 10 ? '0' : ''}{item.secs}s left
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isRedeemed ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Check size={11} />
                      Claimed
                    </span>
                  ) : item.isExpired ? (
                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-lg">
                      Expired
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.codeKey)}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Copy Code"
                      >
                        <Copy size={11} />
                        <span>{copiedCode === item.codeKey ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRedeem(undefined, item.codeKey)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-[10px] font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/30 flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        <span>Redeem</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check size={15} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
