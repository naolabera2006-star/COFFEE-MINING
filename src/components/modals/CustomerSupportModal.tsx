import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Headphones, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const CustomerSupportModal: React.FC = () => {
  const { closeModal, t, language } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: t('supportWelcomeMessage', 'Hello! Welcome to MY COFFEE VIP Support. How can we assist you with your recharge, daily harvest, or withdrawal today?'),
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const faqs = [
    {
      q: t('supportFaq1Q', 'How to recharge?'),
      a: t('supportFaq1A', 'Click Recharge on Home or Mine tab, select an amount (starting at ETB 600), choose Telebirr or CBE, transfer the funds and enter your reference ID.')
    },
    {
      q: t('supportFaq2Q', 'When is daily profit paid?'),
      a: t('supportFaq2A', 'Daily coffee extraction profit is calculated in real-time and ready to harvest every 24 hours directly into your withdrawable balance.')
    },
    {
      q: t('supportFaq3Q', 'Withdrawal rules & time?'),
      a: t('supportFaq3A', 'Withdrawals are open 24/7. Minimum withdrawal is ETB 100. Settlements process automatically within 15–30 minutes into your bound account.')
    },
    {
      q: t('supportFaq4Q', 'How to earn referral commission?'),
      a: t('supportFaq4A', 'Share your invitation link from the Share tab. You earn 26% on Level 1, 3% on Level 2, and 1% on Level 3 member investments!')
    }
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputText,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputText.toLowerCase();
    setInputText('');

    setTimeout(() => {
      let botResponse = t(
        'supportBotDefaultReply',
        'Thank you for reaching out! A coffee customer support manager has recorded your request. Our automated gateway handles 24/7 instant settlements.'
      );
      
      if (
        currentQuery.includes('recharge') ||
        currentQuery.includes('deposit') ||
        currentQuery.includes('ሙላ') ||
        currentQuery.includes('guuti') ||
        currentQuery.includes('telebirr') ||
        currentQuery.includes('cbe')
      ) {
        botResponse = t(
          'supportBotRechargeReply',
          'For recharge inquiries: You can recharge via Telebirr or CBE Bank starting from ETB 600. Funds credit automatically to your deposit balance upon reference confirmation.'
        );
      } else if (
        currentQuery.includes('withdraw') ||
        currentQuery.includes('bank') ||
        currentQuery.includes('payout') ||
        currentQuery.includes('አውጣ') ||
        currentQuery.includes('baasi') ||
        currentQuery.includes('baasu')
      ) {
        botResponse = t(
          'supportBotWithdrawReply',
          'Withdrawal guidelines: Ensure your Bank Account or Telebirr details are bound in the Mine tab. Withdrawals starting at ETB 100 are processed round-the-clock within 15-30 minutes.'
        );
      } else if (
        currentQuery.includes('referral') ||
        currentQuery.includes('team') ||
        currentQuery.includes('invite') ||
        currentQuery.includes('ግብዣ') ||
        currentQuery.includes('ኮሚሽን') ||
        currentQuery.includes('garee') ||
        currentQuery.includes('affeerraa')
      ) {
        botResponse = t(
          'supportBotReferralReply',
          'Referral Program: Share your unique link from the Share tab. You will automatically receive 26% Level 1, 3% Level 2, and 1% Level 3 direct cash commissions!'
        );
      }

      const agentMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'agent',
        text: botResponse,
        time: 'Just now'
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 600);
  };

  const handleFaqClick = (faq: { q: string; a: string }) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: faq.q,
      time: 'Just now'
    };
    const agentMsg: ChatMessage = {
      id: 'msg-' + (Date.now() + 1),
      sender: 'agent',
      text: faq.a,
      time: 'Just now'
    };
    setMessages(prev => [...prev, userMsg, agentMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-800 shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Headphones size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                {t('supportDeskTitle', '24/7 Customer Support Desk')}
              </h2>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t('supportOnlineStatus', 'Online & Available')}
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

        {/* Quick FAQ Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {faqs.map((f, i) => (
            <button
              key={i}
              onClick={() => handleFaqClick(f)}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white whitespace-nowrap cursor-pointer shadow-2xs"
            >
              {f.q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-2.5 bg-zinc-950 rounded-2xl border border-zinc-800 min-h-[220px] max-h-[300px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'agent' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                  ☕
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-black font-semibold rounded-br-xs'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 shadow-2xs rounded-bl-xs leading-relaxed'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('supportInputPlaceholder', 'Type your question or issue here...')}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <Send size={14} />
          </button>
        </form>

        <div className="text-center pt-1 text-[10px] text-zinc-400">
          {t('supportOfficialTelegram', 'Official Telegram Channel & Group:')} <span className="font-bold text-emerald-400">@CoffeeMining_Official</span>
        </div>
      </div>
    </div>
  );
};
