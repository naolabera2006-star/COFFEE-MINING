import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  TrendingUp,
  ArrowDownToLine,
  Share2,
  Copy,
  ChevronRight,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';

export type GuideSection = 'recharge' | 'commission' | 'withdrawal' | 'referral';

interface GuideModalProps {
  initialSection?: GuideSection;
}

export const GuideModal: React.FC<GuideModalProps> = ({ initialSection = 'recharge' }) => {
  const { closeModal, openModal, user, showToast, t } = useApp();
  const [activeSection, setActiveSection] = useState<GuideSection>(initialSection);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(user.invitationUrl);
    showToast(t('copied', 'Invite link copied to clipboard!'), 'success');
  };

  const tabs: { id: GuideSection; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'recharge', label: t('rechargeGuideTab', 'Recharge'), icon: CreditCard },
    { id: 'commission', label: t('commissionGuideTab', 'Commission'), icon: TrendingUp },
    { id: 'withdrawal', label: t('withdrawalGuideTab', 'Withdrawal'), icon: ArrowDownToLine },
    { id: 'referral', label: t('referralGuideTab', 'Referral Link'), icon: Share2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                {t('guideModalTitle', 'User Guide & Tutorial')}
              </h2>
              <p className="text-xs text-zinc-400">
                {t('guideModalSubtitle', 'Step-by-step instructions for all features')}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 4 Interactive Category Pills */}
        <div className="px-3 pt-3 pb-2 bg-zinc-900/30 border-b border-zinc-800/60 overflow-x-auto no-scrollbar flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon size={14} className={isActive ? 'stroke-[2.5]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* SECTION 1: RECHARGE GUIDE */}
          {activeSection === 'recharge' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                <CreditCard className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('guideRechargeTitle', 'Recharge & Deposit Guide')}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {t('guideRechargeDesc', 'Deposit funds seamlessly via Telebirr or Commercial Bank of Ethiopia (CBE) to start earning daily returns.')}
                  </p>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-bold text-white">
                      {t('guideRechargeStep1Title', 'Step 1: Select Amount & Channel')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('guideRechargeStep1Desc', 'Open the Recharge section, choose your deposit amount (starting from ETB 600) and select Telebirr or CBE Bank.')}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-bold text-white">
                      {t('guideRechargeStep2Title', 'Step 2: Transfer via Banking App')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('guideRechargeStep2Desc', 'Copy the official merchant account details shown on screen and transfer the exact amount using your CBE Birr or Telebirr app.')}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-black font-black text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-bold text-white">
                      {t('guideRechargeStep3Title', 'Step 3: Submit Transaction Reference ID')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('guideRechargeStep3Desc', 'Paste the transaction reference / UTR number from your payment SMS receipt and click confirm. Balance updates in minutes.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  closeModal();
                  openModal('recharge');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CreditCard size={15} />
                <span>{t('guideRechargeActionBtn', 'Go to Recharge Now')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* SECTION 2: COMMISSION GUIDE */}
          {activeSection === 'commission' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                <TrendingUp className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('guideCommissionTitle', 'Multi-Tier Commission Structure')}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {t('guideCommissionDesc', 'Earn up to 30% direct team rebates and milestone bonuses every time your invited members activate coffee plans.')}
                  </p>
                </div>
              </div>

              {/* 3 Tiers Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">{t('guideCommTier1Title', 'Level 1 (Direct)')}</span>
                  <p className="text-xl font-black text-white font-['Outfit']">{t('guideCommTier1Rate', '26%')}</p>
                  <span className="text-[10px] text-zinc-400 leading-tight block">{t('guideCommTier1Desc', 'Direct Invite Rebate')}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">{t('guideCommTier2Title', 'Level 2')}</span>
                  <p className="text-xl font-black text-white font-['Outfit']">{t('guideCommTier2Rate', '3%')}</p>
                  <span className="text-[10px] text-zinc-400 leading-tight block">{t('guideCommTier2Desc', 'Sub-team Member Rebate')}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">{t('guideCommTier3Title', 'Level 3')}</span>
                  <p className="text-xl font-black text-white font-['Outfit']">{t('guideCommTier3Rate', '1%')}</p>
                  <span className="text-[10px] text-zinc-400 leading-tight block">{t('guideCommTier3Desc', 'Extended Network Rebate')}</span>
                </div>
              </div>

              {/* How it works breakdown */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-400" />
                  <span>{t('guideCommCalcTitle', 'Earnings Calculation Example')}</span>
                </h4>
                <div className="space-y-1.5 text-xs text-zinc-400 leading-relaxed">
                  <p className="flex items-center justify-between border-b border-zinc-800/60 pb-1">
                    <span>{t('guideCommEx1', 'Friend buys Mining-3 (ETB 3,000):')}</span>
                    <strong className="text-emerald-400 font-mono">{t('guideCommEx1Val', '+ETB 780.00 (26%)')}</strong>
                  </p>
                  <p className="flex items-center justify-between border-b border-zinc-800/60 pb-1">
                    <span>{t('guideCommEx2', 'Lv2 Member buys Mining-4 (ETB 6,000):')}</span>
                    <strong className="text-amber-400 font-mono">{t('guideCommEx2Val', '+ETB 180.00 (3%)')}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>{t('guideCommEx3', 'Lv3 Member buys Mining-5 (ETB 15,000):')}</span>
                    <strong className="text-emerald-400 font-mono">{t('guideCommEx3Val', '+ETB 150.00 (1%)')}</strong>
                  </p>
                </div>
              </div>

              {/* Extra Perks */}
              <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  <span>{t('guideCommMilestoneTitle', 'Invitation Milestone Rewards')}</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  {t('guideCommMilestoneDesc', 'Achieve team milestones (5, 10, 20 active members) in the Rewards tab to claim cash prizes and free bonus spins.')}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  closeModal();
                  openModal('share');
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <TrendingUp size={15} />
                <span>{t('guideCommissionActionBtn', 'View Team & Commission')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* SECTION 3: WITHDRAWAL GUIDE */}
          {activeSection === 'withdrawal' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                <ArrowDownToLine className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('guideWithdrawalTitle', 'Fast 24/7 Withdrawal Guide')}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {t('guideWithdrawalDesc', 'Transfer your daily extraction yields and referral commissions directly to your bank account or Telebirr.')}
                  </p>
                </div>
              </div>

              {/* Key Rules Card */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">{t('guideWithdrawMinLabel', 'Minimum Withdrawal')}</span>
                  <p className="text-sm font-black text-white font-mono">{t('guideWithdrawMinVal', 'ETB 100.00')}</p>
                  <span className="text-[10px] text-emerald-400">{t('guideWithdrawMinTag', 'Low threshold')}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">{t('guideWithdrawTimeLabel', 'Processing Time')}</span>
                  <p className="text-sm font-black text-white font-mono">{t('guideWithdrawTimeVal', '15 - 30 Mins')}</p>
                  <span className="text-[10px] text-emerald-400">{t('guideWithdrawTimeTag', '24/7 Automated Gateway')}</span>
                </div>
              </div>

              {/* Step instructions */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">
                      {t('guideWithdrawStep1Title', 'Step 1: Bind Bank or Telebirr Account')}
                    </h4>
                    <p className="text-zinc-400 leading-relaxed">
                      {t('guideWithdrawStep1Desc', 'Go to Profile > Bank & Wallet binding to save your Commercial Bank of Ethiopia (CBE), Awash, or Telebirr account info.')}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">
                      {t('guideWithdrawStep2Title', 'Step 2: Enter Withdrawal Amount')}
                    </h4>
                    <p className="text-zinc-400 leading-relaxed">
                      {t('guideWithdrawStep2Desc', 'Enter the amount you wish to withdraw and click Confirm. The funds will be credited to your account promptly.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  closeModal();
                  openModal('withdraw');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ArrowDownToLine size={15} />
                <span>{t('guideWithdrawActionBtn', 'Go to Withdraw Now')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* SECTION 4: REFERRAL LINK GUIDE */}
          {activeSection === 'referral' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 flex items-start gap-3">
                <Share2 className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('guideReferralTitle', 'Referral Link & Sharing Guide')}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {t('guideReferralDesc', 'Copy your unique promotional link and share it on social media to build your active coffee investor team.')}
                  </p>
                </div>
              </div>

              {/* Fast Copy Box */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">{t('guideReferralCodeLabel', 'Your Invitation Code:')}</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {user.inviteCode}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={user.invitationUrl}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 truncate select-all"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all flex-shrink-0"
                  >
                    <Copy size={13} />
                    <span>{t('guideReferralCopyBtn', 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Where to share recommendations */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-zinc-200">
                  {t('guideReferralWhereTitle', 'Where & How to Share:')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{t('guideReferralPlatform1', 'Telegram Channels & Groups')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{t('guideReferralPlatform2', 'WhatsApp Status & Chats')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>{t('guideReferralPlatform3', 'Facebook Groups & Messenger')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400" />
                    <span>{t('guideReferralPlatform4', 'TikTok Bio & Direct Messages')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 active:scale-[0.98] text-white font-black text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Copy size={15} />
                  <span>{t('guideReferralActionCopy', 'Copy Invite Link')}</span>
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openModal('share');
                  }}
                  className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('guideReferralActionTeam', 'Open Team Tab')}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
