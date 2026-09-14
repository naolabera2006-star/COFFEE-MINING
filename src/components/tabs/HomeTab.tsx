import React from 'react';
import { useApp } from '../../context/AppContext';
import { CoffeeBeansBanner } from '../common/CoffeeBeansBanner';
import { CoffeeIconBadge } from '../common/CoffeeIconBadge';
import { RedeemCodeBonusCard } from '../home/RedeemCodeBonusCard';
import {
  ShieldCheck,
  Zap,
  Users,
  TrendingUp,
  Wallet,
  Coins,
  ReceiptText,
  BadgeAlert,
  ArrowUpRight,
  Activity,
  CalendarCheck,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    user,
    openModal,
    setCurrentTab,
    activeOrders,
    harvestAllYields,
    pendingHarvestTotal,
    transactions,
    t
  } = useApp();

  const isAdmin = user.role === 'admin';

  // User-specific computations
  // Suggestion 1: Total Invested equal the sum all daily claimed in plan mining
  const totalDailyClaimedInPlans = Math.max(
    activeOrders.reduce((acc, o) => acc + (o.totalEarnedSoFar || 0), 0),
    transactions
      .filter(t => (t.type === 'daily_yield' || t.type === 'harvest' || t.type === 'income') && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const userTotalInvested = totalDailyClaimedInPlans;

  // Suggestion 3: Daily Production Est must be equal Total Invested
  const userEstimatedDailyYield = userTotalInvested;

  // Suggestion 4: Total Reward sum of all bonus and Daily claimed
  const totalAllBonus = transactions
    .filter(t => (t.type === 'bonus' || t.type === 'commission') && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const userTotalReward = totalAllBonus + totalDailyClaimedInPlans;

  // Suggestion 1 (New): Total Days Invested
  const totalDaysInvested = activeOrders.reduce((sum, o) => {
    const days = o.daysCompleted ?? (o.dailyIncome > 0 ? Math.round((o.totalEarnedSoFar || 0) / o.dailyIncome) : 0);
    return sum + days;
  }, 0);

  // Suggestion 2: Current Balance equal to all sum of Rechargedor invested plus Bonus plus Daily claimed for User role
  const userRechargedTotal = transactions
    .filter(t => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const userInvestedTotal = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const userTotalRechargedOrInvested = userRechargedTotal + userInvestedTotal;
  const userCurrentBalance = user.role === 'user'
    ? (userTotalRechargedOrInvested + totalAllBonus + totalDailyClaimedInPlans)
    : user.balance;

  const todayStr = new Date().toDateString();
  const hasCheckedInToday = user.lastCheckInDate === todayStr;

  // Pending counts for badges
  const pendingRechargesCount = transactions.filter(
    t => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'PENDING' || t.status === 'PROCESSING')
  ).length;

  const pendingWithdrawalsCount = transactions.filter(
    t => t.type === 'withdraw' && (t.status === 'PENDING' || t.status === 'PROCESSING')
  ).length;

  const totalPendingSlips = pendingRechargesCount + pendingWithdrawalsCount;

  // Suggestion 3: Admin Financial Metrics
  // "Total Recharged equal to all sum of user invested or recharged, Total withdraw equal to all sum users withdrawed and total Income is sum of all recharged and handling & Tax fee(5%) for Admin User."
  const adminRechargedSum = transactions
    .filter(t => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const adminInvestedSum = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0) +
    transactions.filter(t => t.type === 'investment' && t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0);

  const adminTotalRecharged = adminRechargedSum + adminInvestedSum;

  const adminTotalWithdraw = transactions
    .filter(t => t.type === 'withdraw' && (t.status === 'SUCCESS' || t.status === 'APPROVED' || t.withdrawalStatus === 'PAID'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const adminHandlingTaxFee = adminTotalWithdraw * 0.05; // 5% handling & Tax fee
  const adminTotalIncome = adminTotalRecharged + adminHandlingTaxFee;

  // Request: Total profit calculated from all user invested for Admin Home tab
  const investedFromOrders = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const investedFromTransactions = transactions
    .filter(t => t.type === 'investment' && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const adminTotalProfit = Math.max(investedFromOrders, investedFromTransactions, adminInvestedSum) || (user.activeStaked || 0);

  const totalUsersActive = user.level1Count + user.level2Count + user.level3Count + 54;

  return (
    <div className="flex-1 px-4 py-3 space-y-4 pb-6">
      
      {/* 1. Hero Coffee Beans Banner */}
      <CoffeeBeansBanner onBannerClick={() => setCurrentTab('plans')} />

      {/* 2. Four Quick Action Circular Buttons (Admin vs Regular User) */}
      <div className="grid grid-cols-4 gap-2 items-center justify-items-center py-2 px-1">
        {isAdmin ? (
          <>
            {/* 1. Recharge Approve */}
            <button
              id="btn-quick-recharge-approve"
              onClick={() => openModal('rechargeApprove')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
            >
              <div className="relative">
                <CoffeeIconBadge type="recharge" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
                {pendingRechargesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950 animate-bounce shadow-md">
                    {pendingRechargesCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-[12px] font-bold text-emerald-400 group-hover:text-white tracking-tight text-center leading-tight">
                Recharge Approve
              </span>
            </button>

            {/* 2. Withdraw Approve */}
            <button
              id="btn-quick-withdraw-approve"
              onClick={() => openModal('withdrawApprove')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
            >
              <div className="relative">
                <CoffeeIconBadge type="withdraw" size="md" className="group-hover:scale-105 group-hover:border-amber-500/60" />
                {pendingWithdrawalsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-zinc-950 animate-bounce shadow-md">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-[12px] font-bold text-amber-400 group-hover:text-white tracking-tight text-center leading-tight">
                Withdraw Approve
              </span>
            </button>

            {/* 3. User Permission */}
            <button
              id="btn-quick-user-permission"
              onClick={() => openModal('userPermission')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="checkin" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[11px] sm:text-[12px] font-bold text-zinc-300 group-hover:text-white tracking-tight text-center leading-tight">
                User Permission
              </span>
            </button>

            {/* 4. Support / Help */}
            <button
              id="btn-quick-support"
              onClick={() => openModal('support')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="support" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[11px] sm:text-[12px] font-semibold text-zinc-300 group-hover:text-white tracking-tight">
                {t('support', 'Support')}
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Standard User Quick Actions */}
            <button
              id="btn-quick-recharge"
              onClick={() => openModal('recharge')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="recharge" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[12px] font-semibold text-zinc-300 group-hover:text-white tracking-tight">{t('recharge', 'Recharge')}</span>
            </button>

            <button
              id="btn-quick-withdraw"
              onClick={() => openModal('withdraw')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="withdraw" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[12px] font-semibold text-zinc-300 group-hover:text-white tracking-tight">{t('withdraw', 'Withdraw')}</span>
            </button>

            <button
              id="btn-quick-checkin"
              onClick={() => openModal('checkIn')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="checkin" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[12px] font-semibold text-zinc-300 group-hover:text-white tracking-tight">{t('checkIn', 'Check In')}</span>
            </button>

            <button
              id="btn-quick-support"
              onClick={() => openModal('support')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <CoffeeIconBadge type="support" size="md" className="group-hover:scale-105 group-hover:border-emerald-500/60" />
              <span className="text-[12px] font-semibold text-zinc-300 group-hover:text-white tracking-tight">{t('support', 'Support')}</span>
            </button>
          </>
        )}
      </div>

      {/* 3. ADMIN ONLY: Side-by-Side KPI Panels with Distinct Attractive Color Themes (Total Users Active, Total Invested, Total Profit, Total Spend) */}
      {isAdmin ? (
        <div className="space-y-3.5">
          <div id="admin-kpi-summary-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Total Users Active - Vibrant Emerald Glass Theme */}
            <div className="bg-gradient-to-br from-[#092b1d] via-[#062015] to-[#03130d] p-4 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-950/40 relative overflow-hidden group hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">
                  Total Users Active
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Users size={14} />
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                <h4 className="text-xl sm:text-2xl lg:text-[26px] font-black font-['Outfit'] text-emerald-100 tracking-tight">
                  {totalUsersActive}
                </h4>
                <p className="text-[10.5px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Active accounts
                </p>
              </div>
            </div>

            {/* 2. Total Recharged (EXPANDED NUMBER) - Vibrant Emerald / Neon Green Glow Theme */}
            <div className="bg-gradient-to-br from-[#062b1a] via-[#041d12] to-[#02100a] p-4 rounded-2xl border border-emerald-500/50 shadow-lg shadow-emerald-950/40 relative overflow-hidden group hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">
                  Total Recharged
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Wallet size={14} />
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                <h4 className="text-xl sm:text-2xl lg:text-[26px] font-black font-['Outfit'] text-emerald-300 tracking-tight">
                  ETB {adminTotalRecharged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-[10.5px] text-emerald-400/80 font-medium">
                  Sum of invested & recharged
                </p>
              </div>
            </div>

            {/* 3. Total profit calculated from all user invested - Rich Violet / Purple Royal Theme */}
            <div className="bg-gradient-to-br from-[#261036] via-[#1a0a27] to-[#0d0414] p-4 rounded-2xl border border-purple-500/45 shadow-lg shadow-purple-950/40 relative overflow-hidden group hover:border-purple-400 transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider">
                  Total Profit
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-500/25 border border-purple-400/50 text-purple-200 flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                <h4 className="text-xl sm:text-2xl lg:text-[26px] font-black font-['Outfit'] text-purple-100 tracking-tight">
                  ETB {adminTotalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-[10.5px] text-purple-300 font-medium">
                  From all user invested
                </p>
              </div>
            </div>

            {/* 4. Total Withdraw - Warm Amber / Rose Gold Radiant Theme */}
            <div className="bg-gradient-to-br from-[#2d1b09] via-[#1e1105] to-[#120902] p-4 rounded-2xl border border-amber-500/45 shadow-lg shadow-amber-950/40 relative overflow-hidden group hover:border-amber-400 transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">
                  Total Withdraw
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/25 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Coins size={14} />
                </div>
              </div>
              <div className="space-y-0.5 relative z-10">
                <h4 className="text-xl sm:text-2xl lg:text-[26px] font-black font-['Outfit'] text-amber-300 tracking-tight">
                  ETB {adminTotalWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-[10.5px] text-amber-400/80 font-medium">
                  All users withdrawed
                </p>
              </div>
            </div>
          </div>

          {/* Side by Side Panel: Pending Slips & Deposit Volume with Notification */}
          <div id="admin-slips-deposit-notification-panel" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Pending Slips Panel with Notification Banner - High Contrast Orange / Crimson Alert Glow */}
            <div 
              onClick={() => openModal(pendingRechargesCount > 0 ? 'rechargeApprove' : 'withdrawApprove')}
              className="bg-gradient-to-br from-[#331408] via-[#210c04] to-[#140602] rounded-2xl p-4 border border-orange-500/50 hover:border-orange-400 shadow-xl shadow-orange-950/50 relative overflow-hidden cursor-pointer group transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/25 border border-orange-400/50 text-orange-300 flex items-center justify-center font-bold shadow-xs">
                    <BadgeAlert size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-orange-300 uppercase tracking-wider">
                      Pending Slips
                    </h4>
                    <p className="text-[11px] text-orange-200/70">
                      Approval verification queue
                    </p>
                  </div>
                </div>

                {/* Live Notification Indicator */}
                {totalPendingSlips > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-black animate-ping inline-block" />
                    {totalPendingSlips} New Slips
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 text-xs font-medium">
                    All cleared
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-orange-500/20 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-orange-200">
                    {totalPendingSlips}
                  </span>
                  <span className="text-xs text-orange-300/80 ml-1.5 font-semibold">Actionable requests</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-300 font-extrabold group-hover:underline">
                  <span>Review Slips</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            {/* 2. Deposit Volume Panel with Live Summary - Deep Teal Ocean Theme */}
            <div 
              onClick={() => setCurrentTab('report')}
              className="bg-gradient-to-br from-[#052424] via-[#031818] to-[#010e0e] rounded-2xl p-4 border border-teal-500/50 hover:border-teal-400 shadow-xl shadow-teal-950/50 relative overflow-hidden cursor-pointer group transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/25 border border-teal-400/50 text-teal-300 flex items-center justify-center font-bold shadow-xs">
                    <ReceiptText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-teal-300 uppercase tracking-wider">
                      Total Recharged
                    </h4>
                    <p className="text-[11px] text-teal-200/70">
                      Total sum of user invested & recharged
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-teal-500/25 border border-teal-400/50 text-teal-200 text-[11px] font-extrabold">
                  Live Ledger
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-teal-500/20 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-teal-100">
                    ETB {adminTotalRecharged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-teal-300 font-extrabold group-hover:underline">
                  <span>Audit History</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard User View: Maximized Current Balance & Core Modules */
        <div className="space-y-4">
          
          {/* 1. CURRENT BALANCE HERO CARD */}
          <div
            id="current-balance-hero-card"
            className="rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0e2a1e] via-[#123828] to-[#0a2318] border-2 border-emerald-400/50 ring-1 ring-emerald-500/20"
          >
            <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-36 h-36 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

            {/* Header: Current Balance Text Label with medium size */}
            <div className="flex items-center justify-between mb-2.5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 shadow-xs">
                <Wallet size={16} className="text-emerald-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300 font-['Outfit']">
                  CURRENT BALANCE
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </div>
            </div>

            {/* Medium Balance Figure */}
            <div className="mb-3.5 relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-emerald-400 font-['Outfit']">ETB</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit'] tracking-tight text-white drop-shadow-sm">
                  {userCurrentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            {/* Secondary Balances Strip: Deposit Balance & Total Reward */}
            <div className="grid grid-cols-2 gap-2 mb-3.5 relative z-10">
              <div className="bg-[#0a2318]/85 rounded-2xl p-2.5 border border-[#1b4e36]">
                <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Deposit Balance
                </span>
                <span className="text-sm sm:text-base font-bold text-white font-mono">
                  ETB {(user?.depositBalance || 0).toFixed(2)}
                </span>
              </div>

              <div className="bg-[#0a2318]/85 rounded-2xl p-2.5 border border-[#1b4e36]">
                <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Total Reward
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-300 font-mono">
                  ETB {(userTotalReward ?? user?.totalReward ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Invested Plan Overview Strip */}
            <div className="bg-[#0a2318]/70 rounded-2xl p-3 border border-[#1b4e36] grid grid-cols-3 gap-2 text-xs text-zinc-300 relative z-10">
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium">Total Invested</span>
                <span className="font-bold text-white font-mono text-sm">
                  ETB {(userTotalInvested || 0).toFixed(2)}
                </span>
              </div>

              <div className="text-center border-x border-[#1b4e36]/60 px-1">
                <span className="text-[10px] text-zinc-400 block font-medium">Total Days Invested</span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {totalDaysInvested} Days
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">Daily Production Est.</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  +ETB {(userEstimatedDailyYield || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. REDEEM CODE BONUS FORM FILL */}
          <RedeemCodeBonusCard />

          {/* Daily Attendance Activity */}
          <div id="user-daily-activity-container" className="bg-[#0e2a1e]/90 rounded-3xl p-4 sm:p-5 border border-[#1b4e36]/70 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Daily Attendance
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Claim daily coffee check-in bonus dividends
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0a2318] text-emerald-200 border border-[#1b4e36]">
                Today
              </span>
            </div>

            {/* Daily Attendance Check-in Item */}
            <div 
              onClick={() => setCurrentTab('bonus')}
              className="bg-[#0a2318]/80 hover:bg-[#103324] p-3.5 rounded-2xl border border-[#1b4e36] hover:border-emerald-400/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${hasCheckedInToday ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
                  {hasCheckedInToday ? <CheckCircle2 size={18} /> : <CalendarCheck size={18} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                    Daily Attendance Streak
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {hasCheckedInToday ? `Streak: ${user.checkInStreak} days claimed` : 'Claim today’s attendance bonus'}
                  </p>
                </div>
              </div>

              {hasCheckedInToday ? (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Claimed
                </span>
              ) : (
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-xl bg-amber-500 text-black animate-pulse flex items-center gap-1 shadow-sm">
                  Claim Now
                </span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};


