import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Headphones, 
  Send, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Database, 
  Sparkles,
  User,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { submitInquiryToSupabase, SUPABASE_PROJECT_ID } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const CustomerSupportModal: React.FC = () => {
  const { closeModal, t, user, showToast } = useApp();
  
  // Tab: 'form' (Inquiry submission form) | 'chat' (Live support chat)
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');

  // Inquiry Form State
  const [fullName, setFullName] = useState(user.displayName || (user.email ? user.email.split('@')[0] : 'Coffee Miner'));
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [subject, setSubject] = useState('Recharge & Deposit Issue');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<{ id: string; savedLocally?: boolean } | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: t('supportWelcomeMessage', 'Hello! Welcome to COFFEE MINING VIP Support. How can we assist you with your recharge, daily harvest, or withdrawal today?'),
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const inquiryCategories = [
    'Recharge & Deposit Issue',
    'Withdrawal & Bank Settlement',
    'Mining Machine & Daily Yield',
    'Referral Commission & Team Bonus',
    'Account & Verification Support',
    'Other General Inquiry'
  ];

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

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please provide your name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please provide a valid contact email', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('Please describe your inquiry', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitInquiryToSupabase({
        fullName,
        email,
        phone,
        subject,
        message,
        userId: user.userId
      });

      if (result.success && result.data) {
        setSubmittedInquiry({ id: result.data.id, savedLocally: result.savedLocally });
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast('Failed to submit inquiry: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
        className="w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-800 shadow-2xl space-y-3.5 max-h-[92vh] flex flex-col text-white"
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
                Customer Support & Inquiry Desk
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Database Connected</span>
                <span className="text-zinc-500 font-mono text-[10px]">({SUPABASE_PROJECT_ID.slice(0, 6)}...)</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-support-modal"
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher: Submit Inquiry Form vs Live Chat */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            id="tab-support-inquiry-form"
            type="button"
            onClick={() => {
              setActiveTab('form');
              setSubmittedInquiry(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Submit Inquiry Form</span>
          </button>

          <button
            id="tab-support-live-chat"
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>Live Help Desk</span>
          </button>
        </div>

        {/* TAB 1: INQUIRY FORM */}
        {activeTab === 'form' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {submittedInquiry ? (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-extrabold text-white font-['Outfit']">
                  Inquiry Stored in Database!
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your inquiry has been registered in the Supabase database. Our support administration team will review your ticket promptly.
                </p>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Reference Ticket ID:</span>
                    <span className="font-mono text-emerald-400 font-bold">{submittedInquiry.id.slice(0, 18)}...</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Database Table:</span>
                    <span className="font-mono text-zinc-300">public.inquiries</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-amber-400 font-semibold">Pending Review</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedInquiry(null);
                      setMessage('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-zinc-800/80">
                  <span className="flex items-center gap-1 font-semibold text-zinc-300">
                    <Database size={13} className="text-emerald-400" />
                    <span>Supabase Inquiries Table</span>
                  </span>
                  <span className="text-emerald-400 font-semibold text-[10px]">24/7 SLA Resolution</span>
                </div>

                {/* Submitter Name */}
                <div className="space-y-1">
                  <label htmlFor="inquiry-fullname-input" className="text-xs font-bold text-zinc-300 block">Full Name:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User size={14} />
                    </div>
                    <input
                      id="inquiry-fullname-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Contact Email & Phone in 2-col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="inquiry-email-input" className="text-xs font-bold text-zinc-300 block">Email Address:</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Mail size={14} />
                      </div>
                      <input
                        id="inquiry-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="inquiry-phone-input" className="text-xs font-bold text-zinc-300 block">Phone / Telebirr:</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Phone size={14} />
                      </div>
                      <input
                        id="inquiry-phone-input"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 9..."
                        className="w-full pl-9 pr-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Category / Subject */}
                <div className="space-y-1">
                  <label htmlFor="inquiry-subject-select" className="text-xs font-bold text-zinc-300 block">Inquiry Topic / Category:</label>
                  <select
                    id="inquiry-subject-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    {inquiryCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1">
                  <label htmlFor="inquiry-message-textarea" className="text-xs font-bold text-zinc-300 block">Inquiry Details:</label>
                  <textarea
                    id="inquiry-message-textarea"
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail (include transaction IDs or bank details if relevant)..."
                    className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  id="btn-submit-inquiry-form"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Supabase Database...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Inquiry to Database</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: LIVE HELP CHAT & FAQs */}
        {activeTab === 'chat' && (
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {/* Quick FAQ Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
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
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2.5 bg-zinc-950 rounded-2xl border border-zinc-800 min-h-[180px] max-h-[260px]">
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
            <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
              <input
                id="support-chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('supportInputPlaceholder', 'Type your question or issue here...')}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                id="btn-send-support-chat"
                type="submit"
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        <div className="text-center pt-1 text-[10px] text-zinc-400 border-t border-zinc-800/60">
          Official Support Channel: <span className="font-bold text-emerald-400">@CoffeeMining_Official</span>
        </div>
      </div>
    </div>
  );
};
