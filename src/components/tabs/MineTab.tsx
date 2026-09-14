import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfilePage } from '../profile/UserProfilePage';
import {
  ChevronRight,
  Copy,
  LogOut,
  ShieldCheck,
  HelpCircle,
  Gift,
  Layers,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  ReceiptText,
  CreditCard,
  Headphones,
  Sparkles,
  TrendingUp,
  Coins,
  CheckCircle2,
  Building2,
  Heart,
  Plus
} from 'lucide-react';

export const MineTab: React.FC = () => {
  const {
    user,
    openModal,
    setCurrentTab,
    showToast,
    activeOrders,
    logout,
    transactions,
    plans,
    properties,
    likedPropertyIds,
    t
  } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<'profile' | 'wallet'>('profile');

  const userIdentifier = user.supabaseUid || user.userId || user.email || '';
  const userLikedCount = likedPropertyIds.length;
  const userListedCount = properties.filter(
    (p) => (p.userId && p.userId === userIdentifier) || (user.email && p.userEmail === user.email)
  ).length;

  const userWithdrawals = transactions.filter((t) => t.type === 'withdraw');
  const pendingWithdrawalsCount = transactions.filter(
    (t) => t.type === 'withdraw' && (t.status === 'PENDING' || t.withdrawalStatus === 'PENDING')
  ).length;

  // Metric calculation according to user rules:
  // 1. For User Role: Current Balance = sum of Recharged or invested + Bonus + Daily claimed
  // 2. For Admin User: Total Recharged = sum of user invested or recharged, Total withdraw = sum users withdrawed, Total Income = sum of all recharged and handling & Tax fee(5%)

  // Total active invested ("invest now")
  const totalInvestNow = Math.max(
    activeOrders.reduce((sum, o) => sum + (o.price || 0), 0),
    user?.activeStaked || 0
  );

  // Sum of direct recharges
  const directRecharges = transactions
    .filter((t) => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
    .reduce((sum, t) => sum + (t.amount || 0), 0) || (user?.totalRecharge || 0);

  // Total user recharged or invested
  const userTotalRechargedOrInvested = directRecharges + totalInvestNow;

  // Bonus for user
  const userTotalBonus = transactions
    .filter((t) => (t.type === 'bonus' || t.type === 'commission') && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || (user?.referralRewards || 0);

  // Total daily claims for user
  const totalDailyClaimed = Math.max(
    activeOrders.reduce((sum, o) => sum + (o.totalEarnedSoFar || 0), 0),
    transactions
      .filter((t) => (t.type === 'harvest' || t.type === 'daily_yield' || t.type === 'income') && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    user?.dailyEarnings || 0
  );

  // Request 2 & 3: Today's Income calculations
  // "2. Today's Income equal Total single daily claimed plus daily bonus and Redeem code bonus for user role"
  const totalSingleDailyClaimed = Math.max(
    activeOrders.reduce((sum, o) => sum + (o.totalEarnedSoFar || 0), 0),
    transactions
      .filter((t) => (t.type === 'harvest' || t.type === 'daily_yield' || t.type === 'income' || t.title?.toLowerCase().includes('harvest')) && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  );

  const totalDailyBonus = transactions
    .filter((t) => t.type === 'bonus' && (t.title?.toLowerCase().includes('check-in') || t.title?.toLowerCase().includes('attendance') || t.orderId?.startsWith('CHK')) && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRedeemCodeBonus = transactions
    .filter((t) => t.type === 'bonus' && (t.title?.toLowerCase().includes('gift code') || t.title?.toLowerCase().includes('redeem') || t.orderId?.startsWith('GIFT')) && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const userCalculatedTodayIncome = totalSingleDailyClaimed + totalDailyBonus + totalRedeemCodeBonus;

  // "3. Today's Income equal Total user invested or recharged plus for Admin role"
  const adminCalculatedTodayIncome = userTotalRechargedOrInvested;

  const calculatedTodayIncome = user.role === 'admin' ? adminCalculatedTodayIncome : userCalculatedTodayIncome;

  // Suggestion 2: Current Balance equal to all sum of Recharged or invested plus Bonus plus Daily claimed for User role
  const computedUserBalance = user.role === 'user'
    ? (userTotalRechargedOrInvested + userTotalBonus + totalDailyClaimed)
    : user.balance;

  // Total Withdraw (all sum users withdrawed)
  const totalWithdrawSum = Math.max(
    transactions
      .filter((t) => t.type === 'withdraw' && (t.status === 'SUCCESS' || t.status === 'APPROVED' || t.withdrawalStatus === 'PAID'))
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    user?.totalWithdrawn || 0
  );

  // Suggestion 3: Admin User Financial Metrics
  const adminTotalRecharged = userTotalRechargedOrInvested;
  const adminTotalWithdraw = totalWithdrawSum;
  const adminHandlingTaxFee = adminTotalWithdraw * 0.05; // 5% handling & Tax fee
  const adminTotalIncome = adminTotalRecharged + adminHandlingTaxFee;

  // Applied values depending on role
  const calculatedTotalRecharge = user.role === 'admin' ? adminTotalRecharged : userTotalRechargedOrInvested;
  const calculatedTotalWithdraw = user.role === 'admin' ? adminTotalWithdraw : totalWithdrawSum;
  const calculatedTotalIncome = user.role === 'admin' ? adminTotalIncome : (totalInvestNow + totalDailyClaimed);

  const totalAssets = computedUserBalance + (user?.depositBalance || 0) + (user?.activeStaked || 0);

  return (
    <div className="flex-1 px-4 py-3 space-y-4 pb-14 select-none">
      {/* TOP VIEW SWITCHER: User Profile (Properties Liked & Listed) vs Financial Wallet */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-inner">
        <button
          id="btn-mine-toggle-profile"
          type="button"
          onClick={() => setActiveViewMode('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeViewMode === 'profile'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 size={14} className={activeViewMode === 'profile' ? 'text-black' : 'text-emerald-400'} />
          <span>User Profile & Properties</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
            activeViewMode === 'profile' ? 'bg-black/25 text-black' : 'bg-[#103324] text-emerald-300 border border-emerald-500/30'
          }`}>
            {userLikedCount} Liked · {userListedCount} Listed
          </span>
        </button>

        <button
          id="btn-mine-toggle-wallet"
          type="button"
          onClick={() => setActiveViewMode('wallet')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeViewMode === 'wallet'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wallet size={14} className={activeViewMode === 'wallet' ? 'text-black' : 'text-emerald-400'} />
          <span>Mining Wallet</span>
        </button>
      </div>

      {activeViewMode === 'profile' ? (
        <UserProfilePage onNavigateToProperties={() => setCurrentTab('properties')} />
      ) : (
        <>
          {/* 3. CORE FINANCIAL ASSETS & QUICK ACTIONS CARD */}
          <div
            id="card-mine-wallet-assets"
            className="bg-gradient-to-b from-[#0e2a1e] to-[#0a2318] p-4 rounded-3xl border border-[#1b4e36] shadow-xl space-y-4"
          >
        {/* Total Assets Balance Display */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Total Assets Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black text-emerald-400">ETB</span>
              <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
                {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Wallet size={20} className="stroke-[2.2]" />
          </div>
        </div>

        {/* 3 Column Sub-Wallets */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1b4e36]/70 text-center">
          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold text-zinc-400">
              Recharge Wallet
            </div>
            <div className="text-sm font-black font-['Outfit'] text-white">
              ETB {(user?.depositBalance || 0).toFixed(0)}
            </div>
          </div>

          <div className="space-y-0.5 border-x border-[#1b4e36]/70">
            <div className="text-[10px] font-semibold text-zinc-400">
              Withdrawable
            </div>
            <div className="text-sm font-black font-['Outfit'] text-emerald-400">
              ETB {(computedUserBalance || 0).toFixed(0)}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] font-semibold text-zinc-400">
              Active Staked
            </div>
            <div className="text-sm font-black font-['Outfit'] text-amber-300">
              ETB {(user?.activeStaked || 0).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Primary Action Tabs: Recharge, Withdrawal, Support */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            id="btn-mine-tab-recharge"
            onClick={() => openModal('recharge')}
            className="p-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-black font-black text-xs tracking-wide transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-400/20"
          >
            <ArrowDownToLine size={20} className="stroke-[2.5]" />
            <span>Recharge</span>
          </button>

          <button
            id="btn-mine-tab-withdraw"
            onClick={() => openModal('withdraw')}
            className="p-3 rounded-2xl bg-[#103324] hover:bg-[#16422f] active:scale-95 border border-[#1b4e36] hover:border-amber-400/50 text-amber-300 hover:text-white font-black text-xs tracking-wide transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <ArrowUpFromLine size={20} className="stroke-[2.5]" />
            <span>Withdrawal</span>
          </button>

          <button
            id="btn-mine-tab-support"
            onClick={() => openModal('support')}
            className="p-3 rounded-2xl bg-[#103324] hover:bg-[#16422f] active:scale-95 border border-[#1b4e36] hover:border-teal-400/50 text-teal-300 hover:text-white font-black text-xs tracking-wide transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <Headphones size={20} className="stroke-[2.5]" />
            <span>Support</span>
          </button>
        </div>
      </div>

      {/* 4. ADMIN CONTROL PANEL CARD (Only for Admin users) */}
      {user.role === 'admin' && (
        <div
          id="card-mine-admin-entry"
          className="rounded-3xl p-4 bg-gradient-to-r from-amber-500/20 via-[#0e2a1e] to-[#0a2318] border border-amber-500/50 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-sm shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-['Outfit']">
                  Admin Control Center
                </h3>
                <p className="text-[11px] text-zinc-300">
                  {pendingWithdrawalsCount} pending withdrawals • {plans.length} investment plans
                </p>
              </div>
            </div>

            <button
              id="btn-mine-open-admin-tab"
              onClick={() => setCurrentTab('admin')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/20"
            >
              <span>Open</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 5. INCOME & PERFORMANCE METRICS GRID (3x2) */}
      <div
        id="card-mine-income-stats"
        className="bg-gradient-to-b from-[#0e2a1e] to-[#0a2318] p-4 rounded-3xl border border-[#1b4e36] shadow-xl"
      >
        <div className="grid grid-cols-3 gap-y-4 text-center divide-x divide-[#1b4e36]/60">
          {/* Row 1 */}
          <div className="px-1 space-y-1">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-white">
              {calculatedTotalRecharge > 0 ? calculatedTotalRecharge.toFixed(0) : '0'}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Total Recharge
            </div>
          </div>

          <div className="px-1 space-y-1">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-white">
              {calculatedTotalWithdraw > 0 ? calculatedTotalWithdraw.toFixed(0) : '0'}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Total Withdraw
            </div>
          </div>

          <div className="px-1 space-y-1">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-amber-300">
              {activeOrders.length}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Running Extractors
            </div>
          </div>

          {/* Row 2 */}
          <div className="px-1 pt-3 space-y-1 border-t border-[#1b4e36]/60">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-emerald-400">
              {calculatedTodayIncome > 0 ? calculatedTodayIncome.toFixed(0) : '0'}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Today's Income
            </div>
          </div>

          <div className="px-1 pt-3 space-y-1 border-t border-[#1b4e36]/60">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-emerald-400">
              {(user?.referralRewards ?? 0) > 0 ? (user?.referralRewards || 0).toFixed(0) : '0'}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Team Income
            </div>
          </div>

          <div className="px-1 pt-3 space-y-1 border-t border-[#1b4e36]/60">
            <div className="text-base sm:text-lg font-black font-['Outfit'] text-emerald-400">
              {calculatedTotalIncome > 0 ? calculatedTotalIncome.toFixed(0) : '0'}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 leading-tight">
              Total Income
            </div>
          </div>
        </div>
      </div>

      {/* 6. ACCOUNT MENU ITEMS */}
      <div
        id="card-mine-services-menu"
        className="bg-gradient-to-b from-[#0e2a1e] to-[#0a2318] rounded-3xl border border-[#1b4e36] shadow-xl divide-y divide-[#1b4e36]/60 overflow-hidden"
      >
        {/* 1. Order: My Orders & Active Mining Units */}
        <button
          id="menu-mine-orders"
          onClick={() => openModal('ordered')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 block">
                Order
              </span>
              <span className="text-[10px] text-zinc-400">
                My orders & active coffee extraction plans
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                {activeOrders.length} Active
              </span>
            )}
            <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* 2. Recharged: Recharge Records & Slips */}
        <button
          id="menu-mine-recharged"
          onClick={() => openModal('history_recharge')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <ArrowDownToLine size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 block">
                Recharged
              </span>
              <span className="text-[10px] text-zinc-400">
                Recharge slips, verify records & deposits
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 3. Withdrawal: Withdrawal Records & Approval Status */}
        <button
          id="menu-mine-withdrawal-records"
          onClick={() => openModal('history_withdraw')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <ArrowUpFromLine size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 block">
                Withdrawal
              </span>
              <span className="text-[10px] text-zinc-400">
                Withdrawal records & transaction list
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
            <span>{userWithdrawals.length} Records</span>
            <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* 4. Transuction: Full Transaction Records */}
        <button
          id="menu-mine-transactions"
          onClick={() => openModal('history')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-400/30 text-teal-400 flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-teal-300 block">
                Transuction
              </span>
              <span className="text-[10px] text-zinc-400">
                Complete financial history, harvest & bonuses
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 5. Support: 24/7 Customer Support */}
        <button
          id="menu-mine-support"
          onClick={() => openModal('support')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 block">
                Support
              </span>
              <span className="text-[10px] text-zinc-400">
                Telegram channel, manager WhatsApp & 24/7 live help
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 6. Bank & Wallet Binding */}
        <button
          id="menu-mine-bank"
          onClick={() => openModal('bank')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-400 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-300 block">
                Bank & Account Binding
              </span>
              <span className="text-[10px] text-zinc-400">
                Link CBE, Telebirr or Awash receiving details
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.bankDetails?.isBound ? (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Bound
              </span>
            ) : (
              <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Not Bound
              </span>
            )}
            <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Claim Coupons / Gift Code */}
        <button
          id="menu-mine-gift-code"
          onClick={() => openModal('giftCode')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 flex items-center justify-center">
              <Gift size={18} />
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-300">
              Redeem Gift Code / Coupons
            </span>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Team & Refer Friends */}
        <button
          id="menu-mine-team"
          onClick={() => setCurrentTab('share')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              My Team & Referrals
            </span>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 24/7 Customer Support */}
        <button
          id="menu-mine-support"
          onClick={() => openModal('support')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Customer Support (24/7)
            </span>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* User Guide & Rules */}
        <button
          id="menu-mine-guide"
          onClick={() => openModal('guide')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-[#123626] transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-700/30 border border-zinc-600/40 text-zinc-300 flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
              User Guide & Tutorial
            </span>
          </div>
          <ChevronRight size={16} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 7. SIGN OUT BUTTON */}
      <div className="pt-2">
        <button
          id="btn-mine-logout"
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-[#103324] hover:bg-rose-950/40 active:scale-98 border border-[#1b4e36] hover:border-rose-500/50 text-zinc-300 hover:text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={16} className="text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
        </>
      )}

    </div>
  );
};
