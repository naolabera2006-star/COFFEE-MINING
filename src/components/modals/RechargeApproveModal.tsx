import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionRecord } from '../../types';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Check,
  Copy,
  AlertCircle,
  Filter,
  CreditCard,
  PlusCircle,
  FileText
} from 'lucide-react';

export const RechargeApproveModal: React.FC = () => {
  const {
    transactions,
    verifyRecharge,
    rejectRecharge,
    createMockRecharge,
    closeModal,
    showToast
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [bankFilter, setBankFilter] = useState<'ALL' | 'cbe' | 'awash' | 'telebirr' | 'cbo'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlip, setCopiedSlip] = useState<string | null>(null);

  // Verification & Rejection dialog sub-state
  const [verifyingOrder, setVerifyingOrder] = useState<TransactionRecord | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState<TransactionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Deposit slip not matching bank statement');

  const allRecharges = transactions.filter(t => t.type === 'recharge' || Boolean(t.slipNo));

  const filteredRecharges = allRecharges.filter(tx => {
    // Status filter
    if (statusFilter === 'PENDING' && tx.status !== 'PENDING' && tx.status !== 'PROCESSING') return false;
    if (statusFilter === 'SUCCESS' && tx.status !== 'SUCCESS') return false;
    if (statusFilter === 'FAILED' && tx.status !== 'FAILED') return false;

    // Bank filter
    if (bankFilter !== 'ALL') {
      const bName = (tx.verifyBy || tx.paymentMethod || tx.title || '').toLowerCase();
      if (!bName.includes(bankFilter.toLowerCase())) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSlip = tx.slipNo?.toLowerCase().includes(q);
      const matchOrder = tx.orderId.toLowerCase().includes(q);
      const matchName = (tx.userPhone || tx.userEmail || tx.bankHolder || '').toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchSlip && !matchOrder && !matchName && !matchAmount) return false;
    }

    return true;
  });

  const pendingCount = allRecharges.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlip(text);
    showToast(`Copied ${text}`, 'info');
    setTimeout(() => setCopiedSlip(null), 2000);
  };

  const handleConfirmApprove = () => {
    if (!verifyingOrder) return;
    verifyRecharge(verifyingOrder.orderId, adminNote);
    setVerifyingOrder(null);
    setAdminNote('');
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    rejectRecharge(rejectingOrder.orderId, rejectReason);
    setRejectingOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  Recharge Approve Manager
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Audit deposit bank slips, verify CBE / Awash / Telebirr, and approve wallet balance credits
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

        {/* Filter & Search Toolbar */}
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
                <span>Pending ({allRecharges.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('SUCCESS')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'SUCCESS'
                    ? 'bg-emerald-500 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CheckCircle size={12} />
                <span>Approved ({allRecharges.filter(t => t.status === 'SUCCESS').length})</span>
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
                <span>Rejected ({allRecharges.filter(t => t.status === 'FAILED').length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-zinc-200 text-black font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All ({allRecharges.length})
              </button>
            </div>

            {/* Mock deposit trigger for easy testing */}
            <button
              onClick={() => createMockRecharge(1200)}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold border border-zinc-700/60 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle size={12} />
              <span>Simulate Slip</span>
            </button>
          </div>

          {/* Search and Bank filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by Slip No, User Name, Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'cbe', 'awash', 'telebirr', 'cbo'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBankFilter(b)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase cursor-pointer whitespace-nowrap ${
                    bankFilter === b
                      ? 'bg-zinc-700 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRecharges.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <FileText size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm font-semibold">No recharge deposit slips found</p>
              <p className="text-xs text-zinc-400">All submitted recharge tickets have been reviewed.</p>
            </div>
          ) : (
            filteredRecharges.map((tx) => {
              const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
              const isApproved = tx.status === 'SUCCESS';
              const isRejected = tx.status === 'FAILED';

              const bankName = tx.verifyBy || tx.paymentMethod || 'CBE Bank';
              const userName = tx.bankHolder || tx.userPhone || tx.userEmail || 'Investor Member';

              return (
                <div
                  key={tx.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-zinc-900/90 border-amber-500/40 shadow-sm shadow-amber-500/5'
                      : isApproved
                      ? 'bg-zinc-900/50 border-emerald-500/30'
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    
                    {/* Left: User info & Bank */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-['Outfit']">
                          {userName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-emerald-400">
                          {bankName}
                        </span>
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 animate-pulse">
                            AWAITING APPROVAL
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400">
                        Date: <span className="text-zinc-200">{tx.date}</span> • Order: <span className="font-mono text-zinc-400">{tx.orderId}</span>
                      </p>
                    </div>

                    {/* Right: Amount & Status */}
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black font-['Outfit'] text-emerald-400">
                        ETB {(tx.amount || 0).toLocaleString('en-US')}.00
                      </p>
                      <div className="flex items-center gap-1 sm:justify-end text-xs">
                        {isApproved && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={12} /> Approved</span>}
                        {isPending && <span className="text-amber-400 font-bold flex items-center gap-1"><Clock size={12} /> Pending Audit</span>}
                        {isRejected && <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={12} /> Rejected</span>}
                      </div>
                    </div>
                  </div>

                  {/* Slip Reference & Details */}
                  <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 font-medium">Bank Slip No:</span>
                        <span className="font-mono font-bold text-white select-all">
                          {tx.slipNo || 'N/A'}
                        </span>
                        {tx.slipNo && (
                          <button
                            onClick={() => handleCopy(tx.slipNo!)}
                            className="text-zinc-400 hover:text-white cursor-pointer p-0.5"
                            title="Copy Slip Number"
                          >
                            {copiedSlip === tx.slipNo ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>

                      <span className="text-zinc-600 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 font-medium">Account deposited to:</span>
                        <span className="font-mono font-bold text-amber-300 select-all">
                          {tx.senderAccount || tx.accountNumber || tx.userPhone || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {tx.adminNote && (
                      <span className="text-[11px] text-emerald-400/90 italic">
                        Note: {tx.adminNote}
                      </span>
                    )}

                    {tx.rejectReason && (
                      <span className="text-[11px] text-rose-400 italic">
                        Reason: {tx.rejectReason}
                      </span>
                    )}
                  </div>

                  {/* Admin Actions for Pending */}
                  {isPending && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setRejectingOrder(tx)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject Slip
                      </button>

                      <button
                        onClick={() => setVerifyingOrder(tx)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle size={13} />
                        <span>Approve & Credit</span>
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

      {/* Approve Confirmation Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl p-5 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Recharge Approval</h3>
                <p className="text-xs text-zinc-400">Deposit amount will be credited to user wallet</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Beneficiary:</span>
                <span className="font-bold text-white">{verifyingOrder.userPhone || verifyingOrder.bankHolder || 'User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Bank / Channel:</span>
                <span className="font-bold text-emerald-400">{verifyingOrder.verifyBy || verifyingOrder.paymentMethod || 'CBE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Slip Reference:</span>
                <span className="font-mono font-bold text-white">{verifyingOrder.slipNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Account deposited to:</span>
                <span className="font-mono font-bold text-amber-300">{verifyingOrder.senderAccount || verifyingOrder.accountNumber || verifyingOrder.userPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800 text-sm">
                <span className="text-zinc-300 font-bold">Credit Amount:</span>
                <span className="font-black text-emerald-400">ETB {(verifyingOrder.amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Admin Audit Note (Optional)
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g., Verified against CBE Birr merchant statement"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
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
                Confirm & Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-5 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reject Deposit Slip</h3>
                <p className="text-xs text-zinc-400">The user will see this ticket as rejected</p>
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
                <option value="Deposit slip not matching bank statement">Deposit slip not matching bank statement</option>
                <option value="Invalid slip reference ID / duplicate slip">Invalid slip reference ID / duplicate slip</option>
                <option value="Amount transferred is lower than ticket amount">Amount transferred is lower than ticket amount</option>
                <option value="Transaction reversed by bank">Transaction reversed by bank</option>
                <option value="Fraudulent / altered slip attachment">Fraudulent / altered slip attachment</option>
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
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
