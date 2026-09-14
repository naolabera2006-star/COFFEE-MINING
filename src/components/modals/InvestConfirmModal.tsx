import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, Check, Sparkles, TrendingUp, AlertCircle, ArrowRight, FileText, Smartphone, Building, RefreshCw, Copy, Wallet } from 'lucide-react';

interface PaymentChannelOption {
  id: string;
  name: string;
  provider: string;
  accountNumber: string;
  icon: any;
  prefix: string;
}

const CHANNELS: PaymentChannelOption[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    provider: 'Telebirr Express Slip',
    accountNumber: '0911 234 567',
    icon: Smartphone,
    prefix: 'TB-',
  },
  {
    id: 'cbe',
    name: 'CBE Mobile/Bank',
    provider: 'Commercial Bank of Ethiopia',
    accountNumber: '1000 4829 1048',
    icon: Building,
    prefix: 'CBE-',
  },
  {
    id: 'cbe_birr',
    name: 'CBE Birr',
    provider: 'CBE Birr Digital',
    accountNumber: '0922 456 789',
    icon: Smartphone,
    prefix: 'CBB-',
  },
  {
    id: 'awash',
    name: 'Awash Bank',
    provider: 'Awash Bank Direct',
    accountNumber: '0130 9281 9201',
    icon: Building,
    prefix: 'AWB-',
  },
];

export const InvestConfirmModal: React.FC = () => {
  const { closeModal, selectedPlan, user, investInPlan, openModal, showToast } = useApp();
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'wallet'>('deposit');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('cbe');
  const [senderAccount, setSenderAccount] = useState<string>(
    user.bankDetails?.accountNumber || user.phone || ''
  );
  const [slipNo, setSlipNo] = useState<string>(() => `CBE-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!selectedPlan) return null;

  const currentChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];
  const hasSufficientWalletBalance = (user?.balance || 0) >= (selectedPlan?.price || 0);

  const handleGenerateSampleSlip = () => {
    const randomCode = Math.floor(10000000 + Math.random() * 90000000);
    const sample = `${currentChannel.prefix}${randomCode}`;
    setSlipNo(sample);
    setValidationError(null);
    showToast(`Generated verification slip #${sample}`, 'info');
  };

  const handleConfirm = async () => {
    if (paymentMode === 'wallet') {
      if (!hasSufficientWalletBalance) {
        openModal('recharge');
        return;
      }
      setIsProcessing(true);
      try {
        await investInPlan(selectedPlan.id);
        closeModal();
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (!senderAccount.trim()) {
      setValidationError('Please enter your depositing bank account or mobile phone number.');
      return;
    }

    if (!slipNo.trim()) {
      setValidationError('Please enter your deposit payment slip or transaction reference number.');
      return;
    }

    setIsProcessing(true);
    setValidationError(null);

    try {
      await investInPlan(
        selectedPlan.id,
        slipNo.trim(),
        `${currentChannel.name} Slip`,
        senderAccount.trim()
      );
      closeModal();
    } finally {
      setIsProcessing(false);
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
              ☕
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Invest in Mining Plan
              </h2>
              <span className="text-[11px] text-zinc-400">
                {selectedPlan.title}{selectedPlan.subtitle ? ` • ${selectedPlan.subtitle}` : ''}
              </span>
            </div>
          </div>

          <button
            id="btn-close-invest-modal"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Plan Preview Card */}
        <div className="flex items-center gap-3.5 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 shadow-xs">
          <img
            src={selectedPlan.image}
            alt={selectedPlan.title}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-zinc-700 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-white font-['Outfit'] truncate">
              {selectedPlan.title} ({selectedPlan.coffeeType})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cycle: <strong className="text-zinc-200">{selectedPlan.cycleDays} Days</strong>
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold text-emerald-400">
                Price: ETB {(selectedPlan?.price || 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Daily: ETB {(selectedPlan?.dailyIncome || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Return Summary */}
        <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
          <div className="flex justify-between">
            <span className="text-zinc-400">Required Investment:</span>
            <span className="font-bold font-mono text-emerald-400 font-extrabold text-sm">ETB {(selectedPlan?.price || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Daily Revenue:</span>
            <span className="font-bold font-mono text-emerald-400">+ETB {(selectedPlan?.dailyIncome || 0).toFixed(2)} / day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Total {selectedPlan?.cycleDays || 0}-Day Return:</span>
            <span className="font-bold font-mono text-emerald-400 font-['Outfit'] font-extrabold">
              ETB {(selectedPlan?.totalReturn || 0).toLocaleString()}.00
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-zinc-800 text-[11px]">
            <span className="text-zinc-400">Your Current Balance:</span>
            <span className="font-bold font-mono text-white">ETB {(user?.balance || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector: Wallet vs Deposit to Verify By Payment Channel */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setPaymentMode('wallet')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMode === 'wallet'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet size={14} />
            <span>Pay from Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode('deposit')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              paymentMode === 'deposit'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building size={14} />
            <span>Deposit Channel</span>
          </button>
        </div>

        {paymentMode === 'wallet' ? (
          /* Option 1: Pay Directly From Wallet */
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Available Wallet Balance:</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                ETB {(user?.balance || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className="text-xs text-zinc-400">Required Plan Price:</span>
              <span className="text-xs font-bold font-mono text-white">
                ETB {(selectedPlan?.price || 0).toFixed(2)}
              </span>
            </div>

            {hasSufficientWalletBalance ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Wallet balance is sufficient for instant miner activation.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={14} className="text-amber-400 shrink-0" />
                  <span>Insufficient wallet balance</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Recharge ETB {((selectedPlan?.price || 0) - (user?.balance || 0)).toFixed(2)} more, or switch to Deposit Channel below.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Option 2: Deposit to Verify By Payment Channel */
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-3">
            {/* Channel Selector */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wider">
                Verify By Payment Channel:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(ch.id);
                      setSlipNo(`${ch.prefix}${Math.floor(10000000 + Math.random() * 90000000)}`);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedChannelId === ch.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{ch.name}</span>
                    <ch.icon size={13} className={selectedChannelId === ch.id ? 'text-emerald-400' : 'text-zinc-500'} />
                  </button>
                ))}
              </div>
            </div>

            {/* User's Depositing Bank Account */}
            <div>
              <label htmlFor="input-invest-sender-account" className="text-xs font-bold text-zinc-300 block mb-1">
                Deposited Account to: <span className="text-emerald-400">*</span>
              </label>
              <input
                id="input-invest-sender-account"
                type="text"
                value={senderAccount}
                onChange={(e) => {
                  setSenderAccount(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. 1000 4829 1048 or 0912..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 rounded-xl border border-zinc-700 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Deposit Slip No. */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-invest-slip-no" className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <FileText size={13} className="text-emerald-400" />
                  <span>Verify Deposit Slip No. *</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSampleSlip}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>Sample Slip</span>
                </button>
              </div>

              <input
                id="input-invest-slip-no"
                type="text"
                value={slipNo}
                onChange={(e) => {
                  setSlipNo(e.target.value);
                  setValidationError(null);
                }}
                placeholder={`e.g. ${currentChannel.prefix}8923019`}
                className="w-full px-3.5 py-2.5 bg-zinc-900 rounded-xl border border-zinc-700 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Notice for Admin Approval */}
        {paymentMode === 'deposit' && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
            <ShieldCheck size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <span>
              Investment requests with deposit slip are sent to Admin for verification. Miner activates immediately upon Admin approval.
            </span>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-confirm-investment-action"
          type="button"
          disabled={
            isProcessing ||
            (paymentMode === 'deposit' && (!senderAccount.trim() || !slipNo.trim()))
          }
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="animate-pulse flex items-center gap-2">
              <RefreshCw size={15} className="animate-spin" />
              {paymentMode === 'wallet' ? 'Activating Miner...' : 'Sending Deposit Slip to Admin...'}
            </span>
          ) : paymentMode === 'wallet' ? (
            hasSufficientWalletBalance ? (
              <>
                <Sparkles size={16} />
                <span>Activate from Wallet (ETB {selectedPlan.price.toFixed(0)})</span>
              </>
            ) : (
              <>
                <Wallet size={16} />
                <span>Recharge from Wallet by Deposit</span>
              </>
            )
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Send Deposit Slip to Admin</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
