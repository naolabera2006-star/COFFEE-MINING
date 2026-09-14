import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Shield,
  ShieldCheck,
  User,
  CheckCircle,
  XCircle,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Users,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle
} from 'lucide-react';

export const UserPermissionModal: React.FC = () => {
  const {
    user,
    setUserRole,
    updateUserBalance,
    simulateTeamMemberJoin,
    resetAllData,
    closeModal,
    showToast
  } = useApp();

  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Admin Performance Bonus');

  // Simulated permission toggles
  const [canInvest, setCanInvest] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [canRecharge, setCanRecharge] = useState(true);
  const [isKycVerified, setIsKycVerified] = useState(true);

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustAmount);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    updateUserBalance(val, adjustType, adjustReason);
    setAdjustAmount('');
    showToast(`Successfully ${adjustType === 'credit' ? 'credited' : 'debited'} ETB ${val.toFixed(2)}`, 'success');
  };

  const handleTogglePermission = (name: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current;
    setter(next);
    showToast(`${name} permission ${next ? 'Granted' : 'Revoked'}`, next ? 'success' : 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                User Permission & Security Center
              </h2>
              <p className="text-xs text-zinc-400">
                Manage roles, transaction privileges, KYC verification, and wallet balances
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-black font-black text-lg">
                {user.displayName?.[0] || 'A'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{user.displayName || 'Naol Abera'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                    {user.role}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  ID: <span className="text-emerald-400 font-mono">{user.userId}</span> • Phone: {user.phone || '+251 911 234 567'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-medium">Wallet Balance</span>
              <span className="text-sm font-black text-emerald-400 font-['Outfit']">
                ETB {(user?.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
              Active Account Role
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUserRole('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  user.role === 'admin'
                    ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Administrator Role</span>
              </button>

              <button
                onClick={() => setUserRole('user')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  user.role === 'user'
                    ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <User size={14} />
                <span>Standard User Role</span>
              </button>
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
              Module Access & Privileges
            </h4>

            <div className="space-y-2">
              {/* Plan Investment */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${canInvest ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Unlock size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Plan Investment Permission</p>
                    <p className="text-[11px] text-zinc-400">Allow user to purchase coffee mining units</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePermission('Investment', canInvest, setCanInvest)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    canInvest ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {canInvest ? 'Allowed' : 'Disabled'}
                </button>
              </div>

              {/* Withdrawal Permission */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${canWithdraw ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Unlock size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Withdrawal Permission</p>
                    <p className="text-[11px] text-zinc-400">Allow payout requests to CBE or Telebirr</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePermission('Withdrawal', canWithdraw, setCanWithdraw)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    canWithdraw ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {canWithdraw ? 'Allowed' : 'Disabled'}
                </button>
              </div>

              {/* Recharge Permission */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${canRecharge ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Unlock size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Recharge Deposit Permission</p>
                    <p className="text-[11px] text-zinc-400">Allow submitting deposit slips</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePermission('Recharge', canRecharge, setCanRecharge)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    canRecharge ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {canRecharge ? 'Allowed' : 'Disabled'}
                </button>
              </div>

              {/* KYC Status */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isKycVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">KYC & Identity Status</p>
                    <p className="text-[11px] text-zinc-400">Verified official bank / Telebirr account</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePermission('KYC', isKycVerified, setIsKycVerified)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isKycVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isKycVerified ? 'Verified' : 'Unverified'}
                </button>
              </div>
            </div>
          </div>

          {/* Admin Balance Adjust Form */}
          <form onSubmit={handleAdjustBalance} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              <span>Direct Balance Adjustment</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('credit')}
                className={`py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 ${
                  adjustType === 'credit'
                    ? 'bg-emerald-500 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Plus size={12} />
                <span>Credit (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('debit')}
                className={`py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1 ${
                  adjustType === 'debit'
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Minus size={12} />
                <span>Debit (-)</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 500"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Manual promotion credit / compensation"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Apply Balance Change
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Logged Admin: <strong className="text-white">Naol Abera</strong></span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
