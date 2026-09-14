import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PAYMENT_METHODS } from '../../data/paymentMethods';
import {
  X,
  CreditCard,
  AlertCircle,
  Check,
  ArrowRight,
  Building2,
  Smartphone,
  Building,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { closeModal, openModal, user, withdrawWallet } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [selectedMethodId, setSelectedMethodId] = useState<'cbe' | 'awash' | 'telebirr' | 'cbo'>('cbe');
  const [accountNumber, setAccountNumber] = useState<string>(
    user.bankDetails?.accountNumber || user.phone || ''
  );
  const [accountHolder, setAccountHolder] = useState<string>(
    user.bankDetails?.accountHolder || user.name || 'Verified User'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = Number(amount) || 0;
  const handlingFee = numAmount * 0.05;
  const netPayout = Math.max(0, numAmount - handlingFee);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  const handleMaxClick = () => {
    setAmount(Math.floor(user.balance).toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    if (numAmount > user.balance) {
      setError('Insufficient balance for withdrawal');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter your receiving bank account number or phone');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    await withdrawWallet(numAmount, selectedMethod.type === 'bank' ? 'bank' : 'upi', {
      bankName: selectedMethod.name,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim()
    });
    setIsSubmitting(false);
    closeModal();
  };

  const getMethodIcon = (id: string) => {
    switch (id) {
      case 'cbe':
        return <Building2 size={16} className="text-purple-400" />;
      case 'awash':
        return <Building size={16} className="text-blue-400" />;
      case 'telebirr':
        return <Smartphone size={16} className="text-emerald-400" />;
      case 'cbo':
        return <Building2 size={16} className="text-amber-400" />;
      default:
        return <CreditCard size={16} className="text-emerald-400" />;
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
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <CreditCard size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Withdraw Coffee Earnings
              </h2>
              <span className="text-[11px] text-zinc-400">
                Withdrawable Balance: <strong className="text-emerald-400">ETB {(user?.balance || 0).toFixed(2)}</strong>
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

        {/* 1. Payment Process: All Supported Channels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <span>Select Receiving Bank</span>
              <span className="text-[10.5px] font-normal text-zinc-400">(Payout method)</span>
            </label>
          </div>

          {/* Grid of payment process methods */}
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = selectedMethodId === pm.id;
              return (
                <div
                  key={pm.id}
                  onClick={() => setSelectedMethodId(pm.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-950 border-emerald-400 shadow-md shadow-emerald-400/10'
                      : 'bg-zinc-950/60 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      {getMethodIcon(pm.id)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {pm.name}
                      </p>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        {pm.type === 'mobile_money' ? 'Mobile Money' : 'Direct Bank'}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center text-black shrink-0 ml-1">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 2. Enter Account Bank Details */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-emerald-400" />
              <span className="text-xs font-bold text-white font-['Outfit']">
                Enter Your Bank Account
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Account / Mobile Number <span className="text-emerald-400">*</span>
              </label>
              <input
                id="input-withdraw-account-number"
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 1000 4829 1048 or 0912..."
                className="w-full px-3 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Account Holder Name
              </label>
              <div className="relative">
                <input
                  id="input-withdraw-holder-name"
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full name as on bank record"
                  className="w-full px-3 py-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-400"
                />
                <UserCheck size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>
          </div>

          {/* 3. Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Withdrawal Amount:
              </label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Max All
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-500">ETB</span>
              <input
                id="input-withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                min={1}
                max={user.balance}
                className="w-full pl-12 pr-3 py-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-extrabold text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Fee text in form */}
            <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Handling Fee: 5%</span>
              <span>Min withdrawal: ETB 50</span>
            </div>
          </div>

          {/* Breakdown Box */}
          <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Gross Withdrawal:</span>
              <span className="font-bold font-mono text-white">ETB {(numAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Handling & Tax Fee (5%):</span>
              <span className="font-mono text-rose-400">-ETB {(handlingFee || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-zinc-800 font-bold text-white text-sm">
              <span>Actual Payout:</span>
              <span className="font-mono text-emerald-400 font-extrabold font-['Outfit']">
                ETB {(netPayout || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Admin Approval Notice */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
            <ShieldCheck size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <span>
              Your withdrawal request will be sent directly to Admin for verification and settlement to your entered bank account.
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-confirm-withdraw"
            type="submit"
            disabled={isSubmitting || numAmount <= 0 || numAmount > user.balance || !accountNumber.trim()}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              numAmount > 0 && numAmount <= user.balance && accountNumber.trim()
                ? 'bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-black font-black shadow-emerald-400/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            {isSubmitting ? (
              <span>Submitting for Approval...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Send for Admin Approval</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
