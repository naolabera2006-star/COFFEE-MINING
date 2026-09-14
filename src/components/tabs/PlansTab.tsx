import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvestmentPlan } from '../../types';
import {
  Coffee,
  Zap,
  TrendingUp,
  Check,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Layers,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react';

export const PlansTab: React.FC = () => {
  const {
    plans,
    user,
    openModal,
    investInPlan,
    activeOrders,
    claimPlanDailyYield,
    deletePlan,
    togglePlanPermission,
    resetPlansToDefault,
    showToast
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'popular' | 'vip' | 'restricted'>('all');
  const isAdmin = user.role === 'admin';

  const filteredPlans = plans.filter((plan) => {
    if (filterType === 'popular') return plan.price <= 3000;
    if (filterType === 'vip') return plan.price > 3000;
    if (filterType === 'restricted') return plan.permission === 'restricted' || plan.isActive === false;
    return true;
  });

  const getActiveCountForPlan = (planId: string) => {
    return activeOrders.filter(order => order.planId === planId).length;
  };

  // Suggestion 1: Total Days Invested calculation
  const totalDaysInvested = activeOrders.reduce((sum, o) => {
    const days = o.daysCompleted ?? (o.dailyIncome > 0 ? Math.round((o.totalEarnedSoFar || 0) / o.dailyIncome) : 0);
    return sum + days;
  }, 0);

  const handleDeletePlan = (plan: InvestmentPlan) => {
    if (window.confirm(`Are you sure you want to delete "${plan.title}"?`)) {
      deletePlan(plan.id);
    }
  };

  return (
    <div className="flex-1 px-4 py-3 space-y-4 pb-8">
      
      {/* Prominent Current Balance Card */}
      <div className="bg-[#0e2a1e] border border-[#1b4e36] rounded-2xl p-3.5 sm:p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xs border border-emerald-400/30">
              ETB
            </div>
            <div>
              <span className="text-xs text-emerald-300/80 font-semibold block">Current Balance</span>
              <span className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                ETB {(user?.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => openModal('recharge')}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs shadow-md shadow-emerald-400/20 transition-all cursor-pointer"
          >
            Recharge
          </button>
        </div>

        {/* Global Summary: Total Invested & Daily Claimed */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b4e36]/70 text-xs">
          <div className="bg-[#0a2318]/80 rounded-xl px-2.5 py-2 flex items-center justify-between border border-[#1b4e36]/50">
            <span className="text-zinc-400 text-[11px] font-medium">Total Invested:</span>
            <span className="font-extrabold font-['Outfit'] text-amber-300 text-xs">
              ETB {activeOrders.reduce((sum, o) => sum + (o.totalEarnedSoFar || 0), 0).toLocaleString('en-US')}.00
            </span>
          </div>
          <div className="bg-[#0a2318]/80 rounded-xl px-2.5 py-2 flex items-center justify-between border border-[#1b4e36]/50">
            <span className="text-zinc-400 text-[11px] font-medium">Total Days Invested:</span>
            <span className="font-extrabold font-['Outfit'] text-emerald-400 text-xs">
              {totalDaysInvested} Days
            </span>
          </div>
        </div>
      </div>

      {/* Header with Category filter & Admin Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-black text-white font-['Outfit'] tracking-tight">
            Coffee Mining Plans
          </h1>
        </div>

        {/* Right side: Admin Create button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-create-plan-admin"
                onClick={() => openModal('planEditor')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-400/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Create Plan</span>
              </button>

              <button
                onClick={resetPlansToDefault}
                className="p-1.5 rounded-xl bg-[#0a2318] hover:bg-[#103324] text-emerald-200 border border-[#1b4e36] transition-colors cursor-pointer"
                title="Reset Catalog to Defaults"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plan Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/25'
              : 'bg-[#0a2318] border border-[#1b4e36] text-emerald-200/80 hover:border-emerald-400/40'
          }`}
        >
          All Units ({plans.length})
        </button>
        <button
          onClick={() => setFilterType('popular')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'popular'
              ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/25'
              : 'bg-[#0a2318] border border-[#1b4e36] text-emerald-200/80 hover:border-emerald-400/40'
          }`}
        >
          Standard (ETB 600 - ETB 3,000)
        </button>
        <button
          onClick={() => setFilterType('vip')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'vip'
              ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/25'
              : 'bg-[#0a2318] border border-[#1b4e36] text-emerald-200/80 hover:border-emerald-400/40'
          }`}
        >
          VIP & Enterprise
        </button>
        {isAdmin && (
          <button
            onClick={() => setFilterType('restricted')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'restricted'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-[#0a2318] border border-[#1b4e36] text-emerald-200/80 hover:border-emerald-400/40'
            }`}
          >
            Restricted ({plans.filter(p => p.permission === 'restricted' || p.isActive === false).length})
          </button>
        )}
      </div>

      {/* Plans List matching Screenshot 2 & Admin Controls */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => {
          const activeUnits = getActiveCountForPlan(plan.id);
          const hasActiveOrders = activeUnits > 0;
          const isRestricted = plan.permission === 'restricted' || plan.isActive === false;
          const planOrders = activeOrders.filter((o) => o.planId === plan.id && o.status === 'ACTIVE');
          const hasInvested = planOrders.length > 0;
          const todayStr = new Date().toDateString();
          const isClaimedToday = hasInvested && planOrders.every((o) => o.lastClaimedDate === todayStr);
          const canClaimToday = hasInvested && !isClaimedToday;
          const planTotalClaimed = planOrders.reduce((sum, o) => sum + (o.totalEarnedSoFar || 0), 0);
          // Suggestion 1: Total Invested equal the sum all daily claimed in plan mining
          const planTotalInvested = planTotalClaimed;
          const planTotalDaysInvested = planOrders.reduce((sum, o) => {
            const days = o.daysCompleted ?? (o.dailyIncome > 0 ? Math.round((o.totalEarnedSoFar || 0) / o.dailyIncome) : 0);
            return sum + days;
          }, 0);
          const unclaimedDailyYield = planOrders
            .filter((o) => o.lastClaimedDate !== todayStr)
            .reduce((sum, o) => sum + (o.dailyIncome || 0), 0);

          return (
            <div
              key={plan.id}
              id={`plan-card-${plan.id}`}
              className={`rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#0e2a1e] via-[#123828] to-[#0a2318] border ${
                isRestricted
                  ? 'border-rose-500/30 opacity-90'
                  : 'border-[#1b4e36] hover:border-emerald-400/50'
              }`}
            >
              {/* Admin Action Toolbar (Only for Admin) */}
              {isAdmin && (
                <div className="mb-3 pb-2.5 border-b border-[#1b4e36] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-300">Plan Permission:</span>
                    <button
                      onClick={() => togglePlanPermission(plan.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isRestricted
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                      }`}
                      title="Toggle between Allowed and Restricted"
                    >
                      {isRestricted ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{isRestricted ? 'Restricted' : 'Allowed'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Plan */}
                    <button
                      onClick={() => openModal('planEditor', plan)}
                      className="px-2.5 py-1 rounded-lg bg-[#0a2318] hover:bg-[#103324] text-zinc-200 text-xs font-bold border border-[#1b4e36] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Edit / Update Mining Plan"
                    >
                      <Edit3 size={12} className="text-emerald-400" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Plan */}
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Delete Plan from Catalog"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Top Section: Image + Specs */}
              <div className="flex items-start gap-3 sm:gap-4 mb-3.5">
                
                {/* Left: Image Container with INACTIVE/ACTIVE badge */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 border border-[#1b4e36] shadow-inner">
                  
                  {/* Status Badge */}
                  {hasActiveOrders && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-black font-black text-[9.5px] uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Check size={10} className="stroke-[3]" />
                        ACTIVE ({activeUnits})
                      </span>
                    </div>
                  )}

                  {isRestricted && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                      <span className="w-full py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider shadow-md flex items-center justify-center gap-0.5">
                        <Lock size={9} />
                        RESTRICTED
                      </span>
                    </div>
                  )}

                  {/* Coffee Equipment / Machine Image */}
                  <img
                    src={plan.image}
                    alt={plan.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                </div>

                {/* Right: Plan Title & Spec Rows */}
                <div className="flex-1 min-w-0 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight truncate">
                      {plan.title}
                    </h3>
                    {plan.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        {plan.tag}
                      </span>
                    )}
                  </div>

                  {plan.subtitle ? (
                    <p className="text-[11px] text-zinc-400 truncate mb-2">
                      {plan.subtitle}
                    </p>
                  ) : null}

                  {/* Spec rows */}
                  <div className="space-y-1 text-xs font-semibold text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Price:</span>
                      <span className="font-extrabold font-['Outfit'] text-sm text-white">ETB {plan.price.toLocaleString('en-US')}.00</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Cycle:</span>
                      <span className="font-bold text-zinc-200">{plan.cycleDays} Days</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Daily Yield:</span>
                      <span className="font-extrabold font-['Outfit'] text-emerald-400 text-sm">
                        +ETB {plan.dailyIncome.toLocaleString('en-US')}.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-zinc-400 font-medium">Total Invested:</span>
                      <span className="font-extrabold font-['Outfit'] text-amber-300 text-sm">
                        ETB {planTotalInvested.toLocaleString('en-US')}.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Total Days Invested:</span>
                      <span className="font-extrabold font-['Outfit'] text-emerald-400 text-sm">
                        {planTotalDaysInvested} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Stat Pills */}
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {/* Left Pill: Price INVEST */}
                <div className="bg-[#0a2318]/85 rounded-2xl py-2 px-3 text-center border border-[#1b4e36] shadow-xs">
                  <p className="text-xs sm:text-[13px] font-extrabold text-white font-['Outfit']">
                    ETB {plan.price.toLocaleString('en-US')}.00
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
                    INVEST
                  </p>
                </div>

                {/* Right Pill: Daily DAILY */}
                <div className="bg-[#0a2318]/85 rounded-2xl py-2 px-3 text-center border border-[#1b4e36] shadow-xs">
                  <p className="text-xs sm:text-[13px] font-extrabold text-emerald-400 font-['Outfit']">
                    ETB {plan.dailyIncome.toLocaleString('en-US')}.00
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
                    DAILY
                  </p>
                </div>
              </div>

              {/* Bottom Action Button: INVEST / CLAIM / CLAIMED */}
              {isRestricted ? (
                <button
                  disabled={!isAdmin}
                  onClick={() => isAdmin ? openModal('investConfirm', plan) : showToast('This plan is temporarily restricted by Administrator', 'info')}
                  className={`w-full py-2.5 sm:py-3 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                    isAdmin
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} />
                  <span>{isAdmin ? 'INVEST (ADMIN OVERRIDE)' : 'PLAN RESTRICTED'}</span>
                </button>
              ) : hasInvested ? (
                canClaimToday ? (
                  <button
                    id={`btn-claim-${plan.id}`}
                    onClick={() => claimPlanDailyYield(plan.id)}
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 active:scale-[0.98] text-black font-black text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Sparkles size={16} className="text-black" />
                    <span>CLAIM {unclaimedDailyYield > 0 ? `(ETB ${unclaimedDailyYield.toFixed(0)})` : ''}</span>
                  </button>
                ) : (
                  <button
                    id={`btn-claimed-${plan.id}`}
                    disabled
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-[#0a2318] border border-[#1b4e36] text-emerald-400 font-black text-sm tracking-wide flex items-center justify-center gap-2 cursor-default shadow-xs"
                  >
                    <CheckCircle2 size={16} className="text-emerald-400 stroke-[2.5]" />
                    <span>CLAIMED</span>
                  </button>
                )
              ) : (
                <button
                  id={`btn-invest-${plan.id}`}
                  onClick={() => openModal('investConfirm', plan)}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-black font-black text-sm tracking-wide shadow-lg shadow-emerald-400/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 group"
                >
                  <span>INVEST NOW</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

