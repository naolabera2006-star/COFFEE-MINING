import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CHECK_IN_REWARDS, INITIAL_TASKS } from '../../data/initialData';
import { Sparkles, Check, Flame, Coins, Coffee, ArrowRight, ArrowUpRight, Gift, Users, ChevronRight, Share2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RedeemCodeBonusCard } from '../home/RedeemCodeBonusCard';

export const BonusTab: React.FC = () => {
  const {
    user,
    performDailyCheckIn,
    redeemGiftCode,
    claimInvitationTask,
    showToast,
    openModal,
    setCurrentTab
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  const getReferralLink = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}?code=${user.inviteCode}`;
    }
    return user.invitationUrl || `https://coffee-invest.app?code=${user.inviteCode}`;
  };

  const currentReferralLink = getReferralLink();

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Ethiopian Coffee Mining & Earn Daily Rewards',
          text: `Use my invite code ${user.inviteCode} to get started and earn bonuses!`,
          url: currentReferralLink
        });
        showToast('Invite shared successfully!', 'success');
        return;
      } catch {
        // Fallback to clipboard if share dialog was dismissed or not allowed
      }
    }

    // Fallback copy to clipboard
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentReferralLink);
        copiedSuccess = true;
      }
    } catch {
      // Ignore and try fallback
    }

    if (!copiedSuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentReferralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copiedSuccess = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (e) {
        console.error('Fallback copy error:', e);
      }
    }

    setCopiedLink(true);
    showToast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const today = new Date().toDateString();
  const hasCheckedInToday = user.lastCheckInDate === today;

  return (
    <div className="flex-1 px-4 py-3 space-y-4 pb-8">
      
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-2xl font-extrabold text-white font-['Outfit'] tracking-tight">
          Rewards & Bonuses
        </h1>
        <p className="text-xs text-zinc-400">
          Daily attendance streaks & team invitation rewards
        </p>
      </div>

      {/* 1. 7-Day Continuous Check-in Calendar */}
      <div className="bg-[#0e2a1e]/90 rounded-3xl p-4 sm:p-5 border border-[#1b4e36]/70 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              ☕
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                7-Day Daily Check-In
              </h3>
              <p className="text-[11px] text-zinc-400">
                Streak: <strong className="text-emerald-400">{user.checkInStreak} days</strong>
              </p>
            </div>
          </div>

          <button
            id="btn-checkin-bonus-tab"
            onClick={performDailyCheckIn}
            disabled={hasCheckedInToday}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hasCheckedInToday
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-extrabold shadow-md shadow-emerald-500/20 animate-pulse-subtle'
            }`}
          >
            {hasCheckedInToday ? 'Checked Today' : 'Claim Today'}
          </button>
        </div>

        {/* 7 Day Reward Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
          {CHECK_IN_REWARDS.map((item) => {
            const isCompleted = user.checkInStreak >= item.day;
            const isCurrent = (user.checkInStreak % 7) + 1 === item.day && !hasCheckedInToday;

            return (
              <div
                key={item.day}
                className={`rounded-2xl p-2 text-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-[#0a2318] border-emerald-500 ring-2 ring-emerald-500/30 shadow-md text-white'
                    : 'bg-[#0a2318]/60 border-[#1b4e36]/60 text-zinc-500'
                }`}
              >
                <span className="text-[10px] font-bold block mb-1">
                  Day {item.day}
                </span>

                <div className="w-7 h-7 mx-auto rounded-full bg-[#103324] border border-[#1b4e36] flex items-center justify-center text-xs font-black shadow-inner my-1">
                  {isCompleted ? (
                    <Check size={14} className="text-emerald-400 stroke-[3]" />
                  ) : (
                    <span>☕</span>
                  )}
                </div>

                <span className="text-xs font-extrabold text-emerald-400 font-['Outfit'] block">
                  +ETB {item.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Redeem Code Bonus Form Fill */}
      <RedeemCodeBonusCard />

      {/* 3. Invitation Tasks (Moved from Home tab below Spin for Bonus button) */}
      <div id="invitation-tasks-reward-tab" className="bg-[#0e2a1e]/90 rounded-3xl p-4 sm:p-5 border border-[#1b4e36]/70 shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Gift size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Invitation Tasks
              </h3>
              <p className="text-xs text-zinc-400">
                Invite team members to activate nodes and earn cash bonus rewards
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('share')}
            className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <span>Invite Link</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-3">
          {INITIAL_TASKS.map((task) => {
            const isClaimed = user.claimedTasks.includes(task.id);
            const isReady = user.level1Count >= task.targetValidMembers && !isClaimed;

            return (
              <div
                key={task.id}
                id={`reward-task-card-${task.id}`}
                className="bg-[#0a2318] rounded-2xl p-3.5 border border-[#1b4e36] hover:border-[#246244] transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-zinc-200">
                      {task.title}
                    </h4>
                    {user.role === 'admin' && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Target: Invite {task.targetValidMembers} valid tier-1 partners
                      </p>
                    )}
                  </div>
                  {isClaimed ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                      Claimed
                    </span>
                  ) : isReady ? (
                    <button
                      id={`btn-claim-task-${task.id}`}
                      onClick={() => claimInvitationTask(task.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer animate-bounce"
                    >
                      Claim ETB {(task.rewardAmount || 0).toFixed(2)}
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal('simulateTeam')}
                      className="px-3 py-1 bg-[#103324] hover:bg-[#16422f] text-emerald-400 border border-[#1b4e36] rounded-xl text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Invite</span>
                      <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>

                {user.role === 'admin' && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#103324] border border-[#1b4e36] text-zinc-300 font-medium">
                      Progress: <strong className="text-emerald-400">{user?.level1Count || 0}</strong>/{task.targetValidMembers}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#103324] border border-[#1b4e36] text-zinc-300 font-medium">
                      Reward: <strong className="text-emerald-400 font-mono">ETB {(task.rewardAmount || 0).toFixed(2)}</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#103324] border border-[#1b4e36] text-zinc-300 font-medium">
                      Team Staking: <strong className="text-zinc-200 font-mono">ETB {(user?.level1Invest || 0).toFixed(2)}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Share Link Action Card at the end of page */}
      <div id="reward-share-link-card" className="bg-gradient-to-br from-[#0e2a1e] via-[#123828] to-[#0a2318] rounded-3xl p-5 border border-emerald-500/40 shadow-xl shadow-emerald-950/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Share & Earn Bonus
              </h3>
              <p className="text-xs text-zinc-400">
                Invite friends and earn tier rebates & milestone bonuses
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Code: {user.inviteCode}
          </span>
        </div>

        {/* Link preview box */}
        <div className="bg-[#0a2318] rounded-2xl p-3 border border-[#1b4e36] flex items-center justify-between gap-2">
          <p className="text-xs font-mono text-zinc-300 truncate select-all">
            {currentReferralLink}
          </p>
          <button
            id="btn-copy-share-link-reward"
            onClick={handleShareLink}
            className="px-3 py-1.5 rounded-xl bg-[#103324] hover:bg-[#16422f] active:scale-95 text-xs font-bold text-emerald-400 border border-[#1b4e36] flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Big Action Share Link Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            id="btn-share-link-reward"
            onClick={handleShareLink}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            <span>Share Link</span>
          </button>

          <button
            id="btn-view-team-share-reward"
            onClick={() => setCurrentTab('share')}
            className="w-full py-3 rounded-2xl bg-[#0a2318] hover:bg-[#103324] active:scale-95 text-white font-bold text-xs sm:text-sm border border-[#1b4e36] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Team & Referral Hub</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

    </div>
  );
};
