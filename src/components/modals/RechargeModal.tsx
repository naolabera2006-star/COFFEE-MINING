import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PAYMENT_METHODS, PaymentMethodConfig } from '../../data/paymentMethods';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  FileText,
  Smartphone,
  Building,
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const METHOD_ICONS: Record<string, any> = {
  cbe: Building,
  awash: Building2,
  telebirr: Smartphone,
  cbo: Building,
};

export const RechargeModal: React.FC = () => {
  const { closeModal, rechargeWallet, user, showToast } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(600);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('cbe');
  const [slipNo, setSlipNo] = useState<string>('');
  const [senderAccount, setSenderAccount] = useState<string>(user.bankDetails?.accountNumber || user.phone || '');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const presetAmounts = [600, 1200, 3000, 6000, 15000, 35000];
  const currentRechargeAmount = customAmount ? Number(customAmount) : selectedAmount;

  const currentChannel: PaymentMethodConfig = PAYMENT_METHODS.find((c) => c.id === selectedChannelId) || PAYMENT_METHODS[0];

  const handleAmountClick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount('');
    setValidationError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setValidationError(null);
  };

  const handleCopyAccount = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentChannel.accountNumber.replace(/\s/g, ''));
      } else {
        const ta = document.createElement('textarea');
        ta.value = currentChannel.accountNumber.replace(/\s/g, '');
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedAccount(true);
      showToast(`${currentChannel.name} account number copied!`, 'success');
      setTimeout(() => setCopiedAccount(false), 2000);
    } catch (e) {
      showToast(`Account: ${currentChannel.accountNumber}`, 'info');
    }
  };

  const handleGenerateSampleSlip = () => {
    const randomCode = Math.floor(10000000 + Math.random() * 90000000);
    const sample = `${currentChannel.prefix}${randomCode}`;
    setSlipNo(sample);
    setValidationError(null);
    showToast(`Generated verification slip #${sample}`, 'info');
  };

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentRechargeAmount || currentRechargeAmount < 100) {
      setValidationError('Minimum recharge amount is ETB 100.00');
      return;
    }

    if (!slipNo.trim()) {
      setValidationError('Please enter the transaction Slip / Reference number from your payment confirmation.');
      return;
    }

    setValidationError(null);
    setIsProcessing(true);

    try {
      const verifyByString = `${currentChannel.provider} Slip`;
      await rechargeWallet(
        currentRechargeAmount,
        currentChannel.id,
        slipNo.trim(),
        verifyByString,
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
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
              ETB
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Recharge Coffee Wallet
              </h2>
              <span className="text-[11px] text-zinc-400">
                Current Balance: <strong className="text-emerald-400">ETB {(user?.balance || 0).toFixed(2)}</strong>
              </span>
            </div>
          </div>

          <button
            id="btn-close-recharge-modal"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmitRecharge} className="space-y-4">
          {/* 1. Deposit Amount Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300">
                1. Select Deposit Amount (ETB):
              </label>
              <span className="text-[11px] text-emerald-400 font-bold">
                Selected: ETB {(currentRechargeAmount || 0).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2.5">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountClick(amt)}
                  className={`py-2.5 px-2 rounded-xl text-center font-extrabold text-xs font-['Outfit'] border transition-all cursor-pointer ${
                    currentRechargeAmount === amt && !customAmount
                      ? 'bg-emerald-400 text-black border-emerald-300 shadow-md shadow-emerald-400/20 scale-102 font-black'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  ETB {(amt || 0).toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-500">ETB</span>
              <input
                id="input-recharge-custom-amount"
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Or enter custom amount (min ETB 100)"
                className="w-full pl-11 pr-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>

          {/* 2. Payment Method & Verify By Channels */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">
              2. Verify By Payment Channel:
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
              {PAYMENT_METHODS.map((channel) => {
                const IconComp = METHOD_ICONS[channel.id] || Building;
                const isSelected = selectedChannelId === channel.id;

                return (
                  <button
                    key={channel.id}
                    id={`btn-channel-${channel.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      if (slipNo && !slipNo.startsWith(channel.prefix)) {
                        setSlipNo(`${channel.prefix}${Math.floor(10000000 + Math.random() * 90000000)}`);
                      }
                    }}
                    className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-400 ring-1 ring-emerald-400/40'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <IconComp size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{channel.fullName}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{channel.provider}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {channel.popular && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                          Fast
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-zinc-700'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Enter Your Bank Account */}
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <label htmlFor="input-sender-account" className="flex items-center gap-1.5 cursor-pointer">
                <Building size={14} className="text-emerald-400" />
                <span>Enter Your Bank Account</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                {currentChannel.shortName}
              </span>
            </div>

            <div className="relative">
              <input
                id="input-sender-account"
                type="text"
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
                placeholder="Enter Your Bank Account"
                className="w-full px-3.5 py-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* 4. Payment Verification Text Form (Slip No. Input) */}
          <div className="space-y-2.5 bg-zinc-950/90 p-3.5 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <label htmlFor="input-slip-number" className="text-xs font-black text-white flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-400" />
                <span>Payment Slip No. / Reference Code *</span>
              </label>

              <button
                id="btn-generate-sample-slip"
                type="button"
                onClick={handleGenerateSampleSlip}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Fill sample slip number for testing"
              >
                <RefreshCw size={11} />
                <span>Sample Slip</span>
              </button>
            </div>

            {/* Slip No input */}
            <div className="relative">
              <input
                id="input-slip-number"
                type="text"
                value={slipNo}
                onChange={(e) => {
                  setSlipNo(e.target.value);
                  setValidationError(null);
                }}
                placeholder={`e.g. ${currentChannel.prefix}89340219 or Bank Transfer Ref`}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 rounded-xl border border-zinc-700/80 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            <p className="text-[10px] text-zinc-400">
              Enter the transaction reference or slip number from your {currentChannel.name} receipt to verify payment.
            </p>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Verification Channel Badge */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Verify By: <strong className="text-zinc-200">{currentChannel.provider}</strong>
            </span>
            <span className="font-mono text-emerald-400">
              {slipNo ? `Slip: ${slipNo}` : 'Awaiting Slip No.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            id="btn-confirm-recharge-submit"
            type="submit"
            disabled={isProcessing || currentRechargeAmount < 100}
            className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="animate-pulse flex items-center gap-2">
                <RefreshCw size={15} className="animate-spin" />
                Verifying Transfer Slip #{slipNo || '...'}
              </span>
            ) : (
              <>
                <span>VERIFY SLIP & DEPOSIT ETB {(currentRechargeAmount || 0).toLocaleString()}.00</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
