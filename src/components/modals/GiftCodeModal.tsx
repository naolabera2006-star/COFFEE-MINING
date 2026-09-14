import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Gift, Sparkles, ShieldCheck, Plus, Clock, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GiftCodeModal: React.FC = () => {
  const { closeModal, user, redeemGiftCode, generateRedeemCode, giftCodes, showToast } = useApp();
  const [code, setCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [adminAmount, setAdminAmount] = useState('200');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live timer for 5-minute countdown
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = user.role === 'admin';

  // Process gift codes and calculate remaining time in 5-minute validity window
  const activeCodesList = Object.entries(giftCodes || {}).map(([key, val]) => {
    let amount = 0;
    let expiresAt = 0;
    let createdAt = 0;

    if (typeof val === 'number') {
      amount = val;
      expiresAt = 0;
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
    if (c.expiresAt > 0) {
      return currentTime - c.expiresAt < 60000;
    }
    return false;
  }).reverse();

  const handleRedeemSubmit = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const target = (customCode || code).trim().toUpperCase();
    if (!target) return;
    const res = redeemGiftCode(target);
    if (res.success) {
      closeModal();
    }
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
    const targetCode = adminCode.trim().toUpperCase() || `BONUS${Math.floor(100 + Math.random() * 900)}`;
    const amt = Number(adminAmount) || 200;

    const res = generateRedeemCode(targetCode, amt);
    if (res.success) {
      setAdminCode('');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {isAdmin ? <ShieldCheck size={16} className="text-amber-400" /> : <Gift size={16} />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                <span>{isAdmin ? 'Generate Redeem Code' : 'Redeem Gift Voucher'}</span>
                <Sparkles size={13} className="text-amber-400" />
              </h2>
              <span className="text-[11px] text-zinc-400">
                {isAdmin
                  ? 'Create bonus coupon codes with custom ETB rewards for users.'
                  : 'Instant bonus credited to your wallet'}
              </span>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {isAdmin ? (
          /* Admin Form: Generate Redeem Code */
          <form onSubmit={handleAdminGenerate} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Redeem Code Name:
              </label>
              <input
                id="input-modal-admin-code"
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                placeholder="e.g. VIPBONUS500"
                className="w-full px-3.5 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-400 uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Bonus Reward Amount (ETB):
              </label>
              <input
                id="input-modal-admin-amount"
                type="number"
                min="1"
                value={adminAmount}
                onChange={(e) => setAdminAmount(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3.5 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Clock size={12} />
                Valid for user for 5 minutes
              </span>
              <span className="text-zinc-500">Auto-credited to balance</span>
            </div>

            <button
              id="btn-modal-generate-code"
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Generate Redeem Code with ETB {Number(adminAmount) || 0} Reward</span>
            </button>
          </form>
        ) : (
          /* User Form: Redeem Code */
          <form onSubmit={handleRedeemSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                Enter Official Promo Code:
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. COFFEE2026"
                className="w-full px-3.5 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 uppercase tracking-wider"
              />
            </div>

            <button
              id="btn-submit-gift-code"
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={15} />
              <span>Redeem Now</span>
            </button>
          </form>
        )}

        {/* ACTIVE 5-MINUTE REDEEM CODES */}
        {activeCodesList.length > 0 && (
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                <Clock size={12} />
                Active Redeem Codes (Valid for 5 Minutes)
              </span>
              <span className="text-[10px] text-zinc-400">5-min validity</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {activeCodesList.map((item) => (
                <div
                  key={item.codeKey}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    item.isExpired
                      ? 'bg-zinc-950/60 border-zinc-800 text-zinc-600 opacity-60'
                      : item.isRedeemed
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-950 border-amber-400/40 text-white shadow-md'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs tracking-wider text-amber-300">
                        {item.codeKey}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                        +ETB {item.amount.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-[10px]">
                      {item.isExpired ? (
                        <span className="text-rose-400 font-semibold">Expired</span>
                      ) : (
                        <span className="text-amber-300 font-mono font-bold flex items-center gap-1">
                          <Clock size={10} />
                          {item.mins}m {item.secs < 10 ? '0' : ''}{item.secs}s left
                        </span>
                      )}
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
                        >
                          <Copy size={11} />
                          <span>{copiedCode === item.codeKey ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRedeemSubmit(undefined, item.codeKey)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black transition-all cursor-pointer shadow-sm flex items-center gap-1"
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
      </div>
    </div>
  );
};
