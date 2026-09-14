import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionRecord } from '../../types';
import {
  X,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  Copy,
  PlusCircle,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

export const WithdrawApproveModal: React.FC = () => {
  const {
    transactions,
    approveWithdrawal,
    markWithdrawalAsPaid,
    verifyWithdrawal,
    rejectWithdrawal,
    createMockWithdrawal,
    closeModal,
    showToast
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED'>('PENDING');
  const [bankFilter, setBankFilter] = useState<'ALL' | 'cbe' | 'awash' | 'telebirr' | 'cbo'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Approval & Rejection dialog sub-state
  const [verifyingOrder, setVerifyingOrder] = useState<TransactionRecord | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const [rejectingOrder, setRejectingOrder] = useState<TransactionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Account number invalid or bank name mismatch');

  const allWithdrawals = transactions.filter(t => t.type === 'withdraw');

  const getStatus = (tx: TransactionRecord) => {
    if (tx.withdrawalStatus) return tx.withdrawalStatus;
    if (tx.status === 'SUCCESS') return 'PAID';
    if (tx.status === 'FAILED') return 'FAILED';
    if (tx.status === 'APPROVED') return 'APPROVED';
    return 'PENDING';
  };

  const filteredWithdrawals = allWithdrawals.filter(tx => {
    const s = getStatus(tx);
    // Status filter
    if (statusFilter === 'PENDING' && s !== 'PENDING') return false;
    if (statusFilter === 'APPROVED' && s !== 'APPROVED') return false;
    if (statusFilter === 'PAID' && s !== 'PAID') return false;
    if (statusFilter === 'FAILED' && s !== 'FAILED') return false;

    // Bank filter
    if (bankFilter !== 'ALL') {
      const bName = (tx.bankName || tx.payoutMethod || tx.title || '').toLowerCase();
      if (!bName.includes(bankFilter.toLowerCase())) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAccount = tx.accountNumber?.toLowerCase().includes(q);
      const matchOrder = tx.orderId.toLowerCase().includes(q);
      const matchName = (tx.bankHolder || tx.userPhone || tx.userEmail || '').toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchAccount && !matchOrder && !matchName && !matchAmount) return false;
    }

    return true;
  });

  const pendingCount = allWithdrawals.filter(t => getStatus(t) === 'PENDING').length;
  const approvedCount = allWithdrawals.filter(t => getStatus(t) === 'APPROVED').length;
  const paidCount = allWithdrawals.filter(t => getStatus(t) === 'PAID').length;

  const handleCopy = (text: string, label: string = 'text') => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast(`Copied ${label}`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleConfirmApprove = () => {
    if (!verifyingOrder) return;
    const finalUtr = utrInput.trim() || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
    verifyWithdrawal(verifyingOrder.orderId, finalUtr, adminNote);
    setVerifyingOrder(null);
    setUtrInput('');
    setAdminNote('');
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    rejectWithdrawal(rejectingOrder.orderId, rejectReason);
    setRejectingOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  Withdraw Approve Manager
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Review payout requests, disburse via Telebirr or Bank transfer, and record settlement UTR
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

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Clock size={12} />
                <span>Pending ({pendingCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'APPROVED'
                    ? 'bg-sky-500 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={12} />
                <span>Approved ({approvedCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('PAID')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'PAID'
                    ? 'bg-emerald-500 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCheck size={12} />
                <span>Paid ({paidCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('FAILED')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'FAILED'
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <XCircle size={12} />
                <span>Rejected ({allWithdrawals.filter(t => getStatus(t) === 'FAILED').length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-zinc-200 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All ({allWithdrawals.length})
              </button>
            </div>

            {/* Mock withdrawal trigger */}
            <button
              onClick={() => createMockWithdrawal(850)}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold border border-zinc-700/60 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle size={12} />
              <span>Simulate Request</span>
            </button>
          </div>

          {/* Search and Bank filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by Account No, Beneficiary Name, Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'cbe', 'awash', 'telebirr', 'cbo'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBankFilter(b)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer whitespace-nowrap ${
                    bankFilter === b
                      ? 'bg-zinc-700 text-amber-400 border border-amber-500/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <FileText size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm font-semibold">No withdrawal requests found</p>
              <p className="text-xs text-zinc-400">All member payout tickets have been reviewed.</p>
            </div>
          ) : (
            filteredWithdrawals.map((tx) => {
              const currentStatus = getStatus(tx);
              const isPending = currentStatus === 'PENDING';
              const isApproved = currentStatus === 'APPROVED';
              const isPaid = currentStatus === 'PAID';
              const isRejected = currentStatus === 'FAILED';

              const bankName = tx.bankName || (tx.payoutMethod === 'telebirr' ? 'Telebirr' : 'CBE Bank');
              const userName = tx.bankHolder || tx.userPhone || 'Investor Member';
              const accountNo = tx.accountNumber || tx.userPhone || '1000' + tx.orderId.slice(-6);
              const txAmt = tx.amount || 0;
              const fee = txAmt * 0.05;
              const netPayout = txAmt - fee;

              return (
                <div
                  key={tx.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-zinc-900/90 border-amber-500/40 shadow-sm shadow-amber-500/5'
                      : isApproved
                      ? 'bg-zinc-900/70 border-sky-500/40 shadow-sm shadow-sky-500/5'
                      : isPaid
                      ? 'bg-zinc-900/50 border-emerald-500/30'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    
                    {/* Beneficiary Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-['Outfit']">
                          {userName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-amber-400">
                          {bankName}
                        </span>
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30">
                            1. PENDING REVIEW
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <ShieldCheck size={11} /> 2. APPROVED
                          </span>
                        )}
                        {isPaid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCheck size={11} /> 3. PAID
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            REJECTED
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400">
                        Date: <span className="text-zinc-200">{tx.date}</span> • Order: <span className="font-mono text-zinc-400">{tx.orderId}</span>
                      </p>
                    </div>

                    {/* Amount & Payout Calculation */}
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black font-['Outfit'] text-white">
                        Gross: ETB {txAmt.toLocaleString('en-US')}.00
                      </p>
                      <p className="text-xs font-bold text-emerald-400">
                        Net Payout: ETB {(netPayout || 0).toFixed(2)} (5% Fee)
                      </p>
                    </div>
                  </div>

                  {/* Bank Account / Telebirr Details */}
                  <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-medium">Payout Account:</span>
                      <span className="font-mono font-bold text-white select-all">
                        {accountNo}
                      </span>
                      <button
                        onClick={() => handleCopy(accountNo, 'Account Number')}
                        className="text-zinc-400 hover:text-white cursor-pointer p-0.5"
                      >
                        {copiedText === accountNo ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {tx.utrNumber && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        UTR: {tx.utrNumber}
                      </span>
                    )}

                    {tx.rejectReason && (
                      <span className="text-[11px] text-rose-400 italic">
                        Reason: {tx.rejectReason}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons for Pending */}
                  {isPending && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setRejectingOrder(tx)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject & Refund
                      </button>

                      <button
                        onClick={() => approveWithdrawal(tx.orderId, 'Approved by admin')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ShieldCheck size={13} />
                        <span>Step 2: Approve</span>
                      </button>

                      <button
                        onClick={() => setVerifyingOrder(tx)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCheck size={13} />
                        <span>Step 3: Mark as Paid</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons for Approved */}
                  {isApproved && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setRejectingOrder(tx)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject & Refund
                      </button>

                      <button
                        onClick={() => setVerifyingOrder(tx)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCheck size={13} />
                        <span>Mark as Paid & Disburse</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Logged Admin: <strong className="text-white">Naol Abera</strong></span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Approve Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl p-5 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Withdrawal Approval</h3>
                <p className="text-xs text-zinc-400">Disbursement confirmation & UTR logging</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Beneficiary:</span>
                <span className="font-bold text-white">{verifyingOrder.bankHolder || verifyingOrder.userPhone || 'User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Destination:</span>
                <span className="font-bold text-amber-400">{verifyingOrder.bankName || 'Bank / Telebirr'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Account No / Phone:</span>
                <span className="font-mono font-bold text-white">{verifyingOrder.accountNumber || verifyingOrder.userPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800 text-sm">
                <span className="text-zinc-300 font-bold">Disbursement Amount:</span>
                <span className="font-black text-emerald-400">ETB {((verifyingOrder.amount || 0) * 0.95).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Bank Reference / UTR Number
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="Leave blank for auto-generated UTR reference"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setVerifyingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Disburse & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-5 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reject & Refund Withdrawal</h3>
                <p className="text-xs text-zinc-400">Funds will be immediately restored to user's wallet balance</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Reason for Rejection
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white mb-2 focus:outline-none focus:border-rose-500"
              >
                <option value="Account number invalid or bank name mismatch">Account number invalid or bank name mismatch</option>
                <option value="Telebirr account not KYC verified / wallet limit exceeded">Telebirr account not KYC verified / wallet limit exceeded</option>
                <option value="Suspected fraudulent account activity / security lock">Suspected fraudulent account activity / security lock</option>
                <option value="System banking maintenance / please resubmit with CBE">System banking maintenance / please resubmit with CBE</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Reject & Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
