import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionRecord } from '../../types';
import {
  X,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Users,
  Gift,
  Coins,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Download,
  Building2,
  UserCheck,
  Search,
  Table,
  List,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import {
  exportRechargeRecordsFile,
  exportWithdrawalRecordsFile,
  generateTransactionsCSV,
  downloadCSVFile,
  formatAccountBankInfo
} from '../../utils/exportUtils';

interface Props {
  initialType?: 'all' | 'recharge' | 'withdraw' | 'rejected' | 'income' | 'commission' | 'bonus';
}

export const TransactionHistoryModal: React.FC<Props> = ({ initialType = 'all' }) => {
  const {
    closeModal,
    transactions,
    showToast,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'recharge' | 'withdraw' | 'rejected'>(
    initialType === 'recharge'
      ? 'recharge'
      : initialType === 'withdraw'
      ? 'withdraw'
      : initialType === 'rejected'
      ? 'rejected'
      : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to copy text
  const handleCopyText = (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(text);
      showToast(`Copied ${label}: ${text}`, 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      showToast(`${label}: ${text}`, 'info');
    }
  };

  // Status checkers
  const isRejectedTx = (tx: TransactionRecord) =>
    tx.status === 'FAILED' || tx.withdrawalStatus === 'FAILED';

  // Counts for tabs
  const rechargeCount = transactions.filter((t) => t.type === 'recharge' && !isRejectedTx(t)).length;
  const withdrawCount = transactions.filter((t) => t.type === 'withdraw' && !isRejectedTx(t)).length;
  const rejectedCount = transactions.filter((t) => isRejectedTx(t)).length;
  const allCount = transactions.length;

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const isRejected = isRejectedTx(tx);

    // Tab filter
    if (activeTab === 'recharge') {
      if (tx.type !== 'recharge' || isRejected) return false;
    } else if (activeTab === 'withdraw') {
      if (tx.type !== 'withdraw' || isRejected) return false;
    } else if (activeTab === 'rejected') {
      if (!isRejected) return false;
    }
    // 'all' includes all records

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrder = tx.orderId?.toLowerCase().includes(q);
      const matchSlip = tx.slipNo?.toLowerCase().includes(q);
      const matchBank = tx.bankName?.toLowerCase().includes(q);
      const matchAcc = tx.accountNumber?.toLowerCase().includes(q) || tx.senderAccount?.toLowerCase().includes(q);
      const matchDetails = tx.details?.toLowerCase().includes(q);
      const matchReason = tx.rejectReason?.toLowerCase().includes(q);
      const matchTitle = tx.title?.toLowerCase().includes(q);
      return matchOrder || matchSlip || matchBank || matchAcc || matchDetails || matchReason || matchTitle;
    }

    return true;
  });

  const handleExport = () => {
    if (activeTab === 'recharge') {
      const { count, fileName } = exportRechargeRecordsFile(transactions, 'ALL');
      showToast(`Exported ${count} Recharge records to ${fileName}`, 'success');
    } else if (activeTab === 'withdraw') {
      const { count, fileName } = exportWithdrawalRecordsFile(transactions, 'ALL');
      showToast(`Exported ${count} Withdrawal records to ${fileName}`, 'success');
    } else {
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `transactions_${activeTab}_${dateStr}.csv`;
      const csv = generateTransactionsCSV(filteredTransactions, `Statement_${activeTab}`);
      downloadCSVFile(csv, fileName);
      showToast(`Exported ${filteredTransactions.length} records to ${fileName}`, 'success');
    }
  };

  const getStatusBadge = (tx: TransactionRecord) => {
    if (isRejectedTx(tx)) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 justify-center whitespace-nowrap">
          <AlertCircle size={11} className="text-rose-400" /> Rejected
        </span>
      );
    }
    if (tx.status === 'SUCCESS' || tx.status === 'PAID') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 justify-center whitespace-nowrap">
          <CheckCircle size={11} className="text-emerald-400" /> Completed
        </span>
      );
    }
    if (tx.status === 'APPROVED') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1 justify-center whitespace-nowrap">
          <ShieldCheck size={11} className="text-sky-400" /> Approved
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 justify-center whitespace-nowrap animate-pulse">
        <Clock size={11} className="text-amber-400" /> Pending
      </span>
    );
  };

  const getTypeBadge = (tx: TransactionRecord) => {
    switch (tx.type) {
      case 'recharge':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1">
            <ArrowDownLeft size={11} /> Recharge
          </span>
        );
      case 'withdraw':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10.5px] font-bold flex items-center gap-1">
            <ArrowUpRight size={11} /> Withdraw
          </span>
        );
      case 'income':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1">
            <Zap size={11} /> Mining
          </span>
        );
      case 'commission':
        return (
          <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[10.5px] font-bold flex items-center gap-1">
            <Users size={11} /> Team
          </span>
        );
      case 'bonus':
        return (
          <span className="px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-400 border border-pink-500/30 text-[10.5px] font-bold flex items-center gap-1">
            <Gift size={11} /> Bonus
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10.5px] font-bold">
            {tx.type}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 border border-zinc-800 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <History size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-['Outfit']">
                Transaction Statement
              </h2>
              <span className="text-[11px] text-zinc-400">
                User ID: <strong className="text-emerald-400 font-mono">{user.userId}</strong> • {filteredTransactions.length} records shown
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
              title="Export statement as CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Primary Filter Tabs: Recharge, Withdraw, Rejected, All */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('recharge')}
            className={`py-2 px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'recharge'
                ? 'bg-emerald-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>Recharge</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'recharge'
                  ? 'bg-black/20 text-black'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {rechargeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>Withdraw</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'withdraw'
                  ? 'bg-black/20 text-black'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {withdrawCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-rose-500 text-white font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>Rejected</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'rejected'
                  ? 'bg-black/30 text-white'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {rejectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2 px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-zinc-200 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'all'
                  ? 'bg-black/20 text-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {allCount}
            </span>
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Order ID, slip, bank, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Table View"
            >
              <Table size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* List Form Table View Content */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
              <History size={22} />
            </div>
            <p className="font-bold text-zinc-400 text-sm">No transaction records found.</p>
            <p className="text-[11px] max-w-xs mx-auto text-zinc-500">
              {searchQuery
                ? `No transactions match "${searchQuery}".`
                : activeTab === 'rejected'
                ? 'No rejected transactions recorded. All your requests are in good standing.'
                : `No ${activeTab} records found in your account history.`}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="flex-1 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-inner max-h-[58vh]">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 text-[10.5px] uppercase font-bold text-zinc-400 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date & Order ID</th>
                  <th className="py-2.5 px-3">Type / Channel</th>
                  <th className="py-2.5 px-3">Bank / Account / Slip</th>
                  <th className="py-2.5 px-3 text-right">Amount (ETB)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-normal">
                {filteredTransactions.map((tx) => {
                  const isRejected = isRejectedTx(tx);
                  const isPositive = ['recharge', 'income', 'commission', 'bonus'].includes(tx.type);
                  const { bankName, accountNumber } = formatAccountBankInfo(tx);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-zinc-900/70 transition-colors ${
                        isRejected ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Column 1: Date & Order ID */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-semibold text-zinc-200">
                            {tx.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(tx.orderId, 'Order ID')}
                            className="text-zinc-500 hover:text-white p-0.5 cursor-pointer rounded"
                            title="Copy Order ID"
                          >
                            {copiedId === tx.orderId ? (
                              <Check size={11} className="text-emerald-400" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {tx.date}
                        </span>
                      </td>

                      {/* Column 2: Type & Channel */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTypeBadge(tx)}
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5 truncate max-w-[140px]">
                          {tx.paymentMethod?.toUpperCase() || tx.payoutMethod || tx.title}
                        </span>
                      </td>

                      {/* Column 3: Bank / Account / Slip / Reason */}
                      <td className="py-3 px-3 align-top">
                        <div className="space-y-0.5 max-w-[220px]">
                          <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                            <Building2 size={11} className="text-emerald-400 shrink-0" />
                            <span className="font-medium truncate">{bankName}</span>
                            {accountNumber && accountNumber !== 'N/A' && (
                              <span className="font-mono text-[10px] text-zinc-400 truncate">
                                ({accountNumber})
                              </span>
                            )}
                          </div>

                          {/* Slip No if available */}
                          {tx.slipNo && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <FileText size={10} className="shrink-0" />
                              <span className="font-mono truncate">Slip: {tx.slipNo}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(tx.slipNo!, 'Slip No')}
                                className="text-zinc-500 hover:text-emerald-300 p-0.5 cursor-pointer"
                                title="Copy Slip"
                              >
                                {copiedId === tx.slipNo ? (
                                  <Check size={10} className="text-emerald-400" />
                                ) : (
                                  <Copy size={10} />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Rejection Reason if Rejected */}
                          {isRejected && (
                            <div className="flex items-start gap-1 text-[10px] text-rose-400 bg-rose-500/10 p-1 rounded-md border border-rose-500/20">
                              <AlertCircle size={11} className="shrink-0 mt-0.5" />
                              <span className="font-medium leading-tight">
                                {tx.rejectReason || tx.details || 'Declined by Administrator'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Amount */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <span
                          className={`font-['Outfit'] font-bold text-xs ${
                            isRejected
                              ? 'text-zinc-400 line-through'
                              : isPositive
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {isPositive ? '+' : '-'}ETB {(tx.amount || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-3 px-3 align-top text-center">
                        {getStatusBadge(tx)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* List Form Card View */
          <div className="flex-1 space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
            {filteredTransactions.map((tx) => {
              const isRejected = isRejectedTx(tx);
              const isPositive = ['recharge', 'income', 'commission', 'bonus'].includes(tx.type);
              const { bankName, accountNumber } = formatAccountBankInfo(tx);

              return (
                <div
                  key={tx.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isRejected
                      ? 'bg-rose-950/15 border-rose-500/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(tx)}
                      <span className="font-mono text-xs font-semibold text-zinc-300">
                        {tx.orderId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(tx.orderId, 'Order ID')}
                        className="text-zinc-500 hover:text-white p-0.5 cursor-pointer rounded"
                        title="Copy Order ID"
                      >
                        {copiedId === tx.orderId ? (
                          <Check size={11} className="text-emerald-400" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span
                        className={`font-['Outfit'] font-bold text-xs ${
                          isRejected
                            ? 'text-zinc-400 line-through'
                            : isPositive
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isPositive ? '+' : '-'}ETB {(tx.amount || 0).toFixed(2)}
                      </span>
                      {getStatusBadge(tx)}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-zinc-300 font-medium">{bankName}</span>
                      {accountNumber !== 'N/A' && (
                        <span className="font-mono text-zinc-400">({accountNumber})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{tx.date}</span>
                  </div>

                  {tx.slipNo && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800 text-emerald-400">
                      <div className="flex items-center gap-1 truncate">
                        <FileText size={10} />
                        <span>Slip: <strong className="font-mono text-white">{tx.slipNo}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(tx.slipNo!, 'Slip No')}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === tx.slipNo ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copiedId === tx.slipNo ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {isRejected && (
                    <div className="mt-1.5 flex items-start gap-1 text-[10.5px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/30">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span><strong>Reason:</strong> {tx.rejectReason || tx.details || 'Declined by Administrator'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info note */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10.5px] text-zinc-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <UserCheck size={12} className="text-emerald-400" />
            <span>Account: <strong className="text-white">{user.email || user.phone}</strong></span>
          </div>
          <span className="text-zinc-500">
            For support regarding rejected requests, contact 24/7 customer service.
          </span>
        </div>
      </div>
    </div>
  );
};
