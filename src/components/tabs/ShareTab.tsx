import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Copy, 
  Check, 
  QrCode, 
  Users, 
  TrendingUp, 
  Sparkles, 
  UserCheck, 
  Award, 
  Layers, 
  Coins, 
  Percent, 
  ArrowUpRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export const ShareTab: React.FC = () => {
  const { user, teamMembers, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'level1' | 'level2' | 'level3'>('all');

  const getReferralLink = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}?code=${user.inviteCode}`;
    }
    return user.invitationUrl || `https://coffee-invest.app?code=${user.inviteCode}`;
  };

  const currentReferralLink = getReferralLink();

  const handleCopyLink = async () => {
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentReferralLink);
        copiedSuccess = true;
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, using fallback copy:', err);
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

    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = async () => {
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(user.inviteCode);
        copiedSuccess = true;
      }
    } catch (err) {
      console.warn('Clipboard writeText failed:', err);
    }

    if (!copiedSuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = user.inviteCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (e) {
        console.error(e);
      }
    }

    showToast(`Invite code ${user.inviteCode} copied to clipboard!`, 'success');
  };

  // Filtered members for the activity ledger
  const filteredMembers = teamMembers.filter((m) => {
    if (activeTabFilter === 'level1') return m.level === 1;
    if (activeTabFilter === 'level2') return m.level === 2;
    if (activeTabFilter === 'level3') return m.level === 3;
    return true;
  });

  const totalCalculatedCommission = user.level1Commission + user.level2Commission + user.level3Commission;
  const effectiveCommission = Math.max(user.teamProfit, totalCalculatedCommission);

  return (
    <div className="flex-1 px-4 py-3 space-y-4 pb-10">
      
      {/* Header Title */}
      <div className="pt-1">
        <h1 className="text-2xl font-extrabold text-white font-['Outfit'] tracking-tight">
          My Team & Referrals
        </h1>
      </div>

      {/* 1. DETAILED STATISTICS CARDS OVERVIEW */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-['Outfit']">
            Referral Statistics
          </span>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Total Referrals */}
          <div 
            id="stat-card-total-referrals"
            className="bg-gradient-to-b from-[#0e2a1e] to-[#0a2318] p-4 rounded-3xl border border-[#1b4e36] shadow-lg space-y-2 relative overflow-hidden group hover:border-emerald-400/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Total Referrals</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-xs">
                <Users size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
                {user.totalTeamSize}
                <span className="text-xs font-normal text-zinc-400 ml-1">members</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 font-medium">
                <span className="text-emerald-400 font-bold">{user.level1Count}</span> direct • 
                <span className="text-zinc-300 font-semibold"> {user.level2Count + user.level3Count}</span> indirect
              </div>
            </div>
          </div>

          {/* Card 2: Total Commission Earned */}
          <div 
            id="stat-card-total-commission"
            className="bg-gradient-to-b from-[#123828] to-[#0a2318] p-4 rounded-3xl border border-emerald-400/40 shadow-lg shadow-emerald-950/20 space-y-2 relative overflow-hidden group hover:border-emerald-400/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">Total Commission</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xs">
                <Coins size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-['Outfit'] tracking-tight">
                ETB {(effectiveCommission || 0).toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-300/90 mt-1 font-semibold">
                <TrendingUp size={12} />
                <span>Lifetime dividends</span>
              </div>
            </div>
          </div>

        </div>

        {/* Secondary Detailed Metrics: Volume & Active Rate */}
        <div className="grid grid-cols-2 gap-2.5">
          <div 
            id="stat-card-team-recharge"
            className="bg-[#0a2318] rounded-2xl p-3 border border-[#1b4e36] flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Total Team Volume</p>
              <p className="text-sm font-extrabold text-white font-['Outfit'] mt-0.5">
                ETB {(user?.totalTeamRecharge || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#103324] border border-[#1b4e36] flex items-center justify-center text-zinc-400">
              <Layers size={14} />
            </div>
          </div>

          <div 
            id="stat-card-active-tier1"
            className="bg-[#0a2318] rounded-2xl p-3 border border-[#1b4e36] flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Direct Commission</p>
              <p className="text-sm font-extrabold text-emerald-400 font-['Outfit'] mt-0.5">
                ETB {(user?.level1Commission || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#103324] border border-[#1b4e36] flex items-center justify-center text-emerald-400">
              <Award size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. INVITATION LINK & CODE CARD */}
      <div
        id="invitation-link-box"
        className="bg-[#0e2a1e]/90 rounded-3xl p-4 sm:p-5 border border-[#1b4e36]/70 shadow-md space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-300 font-semibold uppercase tracking-wider font-['Outfit']">
            Your Referral Link
          </p>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            Auto-bind sponsor
          </span>
        </div>

        {/* Link container & One-Tap Copy button */}
        <div 
          onClick={handleCopyLink}
          className="flex items-center gap-3 bg-[#0a2318] p-3 rounded-2xl border border-[#1b4e36] hover:border-emerald-400/50 transition-colors cursor-pointer group"
          title="Click to copy referral link"
        >
          <div className="w-10 h-10 rounded-xl bg-[#103324] border border-[#1b4e36] flex items-center justify-center flex-shrink-0 text-emerald-400 group-hover:border-emerald-400/40 transition-colors shadow-xs">
            <QrCode size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-zinc-300 font-medium break-all line-clamp-2 leading-tight select-all">
              {currentReferralLink}
            </p>
          </div>

          <button
            id="btn-copy-invite-link"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-md active:scale-95 ${
              copied
                ? 'bg-emerald-300 text-black shadow-emerald-300/30'
                : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/20'
            }`}
          >
            {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Quick invite code row */}
        <div className="flex items-center justify-between text-xs pt-0.5 px-1">
          <span className="text-zinc-400">My Referral Code:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400 bg-[#0a2318] px-2.5 py-0.5 rounded-md border border-[#1b4e36]">
              {user.inviteCode}
            </span>
            <button
              id="btn-copy-invite-code"
              type="button"
              onClick={handleCopyCode}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs hover:underline cursor-pointer flex items-center gap-1"
            >
              <Copy size={11} />
              <span>Copy Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 3-TIER COMMISSION BREAKDOWN CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-['Outfit']">
            3-Tier Commission Structure
          </h3>
          <span className="text-[11px] text-zinc-400">Tier Rates: 18% / 3% / 1%</span>
        </div>
        
        {/* LEVEL 1: 18% commission */}
        <div id="commission-level-1" className="bg-[#0e2a1e]/90 rounded-3xl p-4 border border-[#1b4e36]/70 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                1
              </div>
              <h4 className="text-sm font-extrabold text-white font-['Outfit']">
                Level - 1 (Direct Referrals)
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              18% commission
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Total Referrals</p>
              <p className="text-base font-black text-white font-['Outfit'] mt-0.5">
                {user.level1Count}
              </p>
            </div>

            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Commission Earned</p>
              <p className="text-base font-black text-emerald-400 font-['Outfit'] mt-0.5">
                ETB {(user?.level1Commission || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* LEVEL 2: 3% commission */}
        <div id="commission-level-2" className="bg-[#0e2a1e]/90 rounded-3xl p-4 border border-[#1b4e36]/70 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                2
              </div>
              <h4 className="text-sm font-extrabold text-white font-['Outfit']">
                Level - 2 (Secondary Referrals)
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              3% commission
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Total Referrals</p>
              <p className="text-base font-black text-white font-['Outfit'] mt-0.5">
                {user?.level2Count || 0}
              </p>
            </div>

            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Commission Earned</p>
              <p className="text-base font-black text-emerald-400 font-['Outfit'] mt-0.5">
                ETB {(user?.level2Commission || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* LEVEL 3: 1% commission */}
        <div id="commission-level-3" className="bg-[#0e2a1e]/90 rounded-3xl p-4 border border-[#1b4e36]/70 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                3
              </div>
              <h4 className="text-sm font-extrabold text-white font-['Outfit']">
                Level - 3 (Tertiary Referrals)
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              1% commission
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Total Referrals</p>
              <p className="text-base font-black text-white font-['Outfit'] mt-0.5">
                {user?.level3Count || 0}
              </p>
            </div>

            <div className="bg-[#0a2318] rounded-xl p-2.5 text-center border border-[#1b4e36]">
              <p className="text-[11px] text-zinc-400">Commission Earned</p>
              <p className="text-base font-black text-emerald-400 font-['Outfit'] mt-0.5">
                ETB {(user?.level3Commission || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. DETAILED REFERRAL LEDGER & ACTIVITY */}
      <div className="bg-[#0e2a1e]/90 rounded-3xl p-4 border border-[#1b4e36]/70 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 font-['Outfit'] uppercase tracking-wider">
            Referral Activity Ledger ({teamMembers.length})
          </h4>
          
          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0a2318] p-1 rounded-xl border border-[#1b4e36] text-[10px]">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTabFilter === 'all' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTabFilter('level1')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTabFilter === 'level1' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lv.1
            </button>
            <button
              onClick={() => setActiveTabFilter('level2')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTabFilter === 'level2' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lv.2
            </button>
            <button
              onClick={() => setActiveTabFilter('level3')}
              className={`px-2 py-0.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTabFilter === 'level3' ? 'bg-emerald-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lv.3
            </button>
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0a2318] border border-[#1b4e36] text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white">{m.phone}</span>
                    <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                      m.level === 1 
                        ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300' 
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                    }`}>
                      Tier {m.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{m.joinDate} • {m.activePlan}</span>
                </div>

                <div className="text-right">
                  <span className="font-black text-emerald-400 block font-['Outfit'] text-xs">
                    +ETB {(m?.commissionGenerated || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-zinc-400">Plan: ETB {m.totalInvested}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center space-y-1.5 bg-[#0a2318]/60 rounded-2xl border border-dashed border-[#1b4e36]">
            <UserPlus size={24} className="mx-auto text-zinc-500" />
            <p className="text-xs text-zinc-400 font-medium">No referrals logged in this category yet</p>
            <p className="text-[11px] text-zinc-500">Share your link to recruit partners and earn automated rewards</p>
          </div>
        )}
      </div>

    </div>
  );
};

