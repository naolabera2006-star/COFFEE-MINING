import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PAYMENT_METHODS } from '../../data/paymentMethods';
import { X, CreditCard, ShieldCheck, Check, Building2, Smartphone, Building } from 'lucide-react';

export const BankAccountModal: React.FC = () => {
  const { closeModal, user, saveBankDetails } = useApp();
  const [accountHolder, setAccountHolder] = useState(user.bankDetails.accountHolder || '');
  const [bankName, setBankName] = useState(user.bankDetails.bankName || 'Commercial Bank of Ethiopia (CBE)');
  const [accountNumber, setAccountNumber] = useState(user.bankDetails.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user.bankDetails.ifscCode || '');
  const [upiId, setUpiId] = useState(user.bankDetails.upiId || '');
  const [selectedMethodId, setSelectedMethodId] = useState<'cbe' | 'awash' | 'telebirr' | 'cbo'>('cbe');

  const handleSelectMethod = (id: 'cbe' | 'awash' | 'telebirr' | 'cbo') => {
    setSelectedMethodId(id);
    const m = PAYMENT_METHODS.find(pm => pm.id === id);
    if (m) {
      setBankName(m.fullName);
      if (id === 'telebirr') {
        setIfscCode('TELEBIRR-ETH');
      } else {
        setIfscCode(`${m.shortName}-ETH`);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBankDetails({
      accountHolder,
      bankName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase() || 'ET-ADDIS-01',
      upiId: selectedMethodId === 'telebirr' ? accountNumber : (upiId || accountNumber)
    });
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
              <CreditCard size={15} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Link Withdrawal Account
              </h2>
              <span className="text-[11px] text-zinc-400">
                Direct payouts to CBE, Awash, Telebirr & CBO
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

        {/* 1. Select Payment Provider */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 block">
            Select Payout Account Provider:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethodId === method.id;
              const IconComp = method.id === 'telebirr' ? Smartphone : Building;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleSelectMethod(method.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400">
                      <IconComp size={14} />
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-zinc-700'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{method.name}</span>
                    <span className="text-[10px] text-zinc-400 truncate block">{method.shortName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          {/* Account Holder Name */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Account Beneficiary Full Name:
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="e.g. Abebe Bikila"
              className="w-full px-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Account Number / Phone */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              {selectedMethodId === 'telebirr' ? 'Telebirr Mobile Number:' : 'Bank Account Number:'}
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={selectedMethodId === 'telebirr' ? 'e.g. 0911 234 567' : 'e.g. 1000 4829 1048'}
              className="w-full px-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Branch / Swift / Remarks */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Branch / Identification Code (Optional):
            </label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="e.g. CBE-ADDIS-01"
              className="w-full px-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
            <span>Bank account data is encrypted and strictly used for outgoing payout settlements.</span>
          </div>

          <button
            id="btn-save-bank-details"
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>Save & Link Account</span>
          </button>
        </form>
      </div>
    </div>
  );
};
