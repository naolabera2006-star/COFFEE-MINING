import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionRecord, ActiveMiningOrder, InvestmentPlan } from '../../types';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Phone,
  User,
  ShieldCheck,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Gift,
  Coins,
  Copy,
  Check,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  Cpu,
  BarChart3,
  BadgeCheck,
  Receipt,
  WalletCards,
  History,
  Hash,
  CreditCard,
  Percent,
  Download,
  FileDown,
  FileText,
  Printer,
  ChevronDown,
  XCircle,
  GripHorizontal,
  ChevronRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import {
  formatAccountBankInfo,
  exportRechargeRecordsFile,
  exportWithdrawalRecordsFile,
  exportOrdersRecordsFile,
  exportPlanRangeAnalysisFile,
  exportVerifiedRecordsFile,
  exportStatementRecordsFile,
  downloadCSVFile,
  downloadWordDocFile,
  printPDFReport,
  generateTransactionsCSV
} from '../../utils/exportUtils';

type ReportSubTab = 'statement' | 'recharge' | 'withdrawal' | 'orders' | 'range' | 'verified';

interface ExportButtonProps {
  label?: string;
  onExport: (format: 'excel' | 'word' | 'pdf') => void;
  count?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

const ExportReportButton: React.FC<ExportButtonProps> = ({
  label = 'Export Report',
  onExport,
  count,
  className = '',
  variant = 'secondary'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (format: 'excel' | 'word' | 'pdf') => {
    setIsOpen(false);
    onExport(format);
  };

  const isPrimary = variant === 'primary';
  const isCompact = variant === 'compact';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer select-none ${
          isPrimary
            ? 'px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95'
            : isCompact
            ? 'px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs'
            : 'px-3 py-1.5 bg-zinc-950/90 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs active:scale-95'
        }`}
        title="Export this report to Excel, Word, or PDF"
      >
        <FileDown size={14} className={isPrimary ? 'text-black stroke-[2.5]' : 'text-emerald-400 stroke-[2]'} />
        <span>{label}</span>
        {count !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
            isPrimary ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {count}
          </span>
        )}
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${isPrimary ? 'text-black' : 'text-zinc-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-zinc-800">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Choose Export Format</span>
            <Download size={11} className="text-zinc-500" />
          </div>

          <div className="py-1">
            <button
              onClick={() => handleSelect('excel')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={13} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white leading-tight">Excel Spreadsheet</div>
                <div className="text-[10px] text-zinc-400 font-normal">Compatible .CSV format</div>
              </div>
            </button>

            <button
              onClick={() => handleSelect('word')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <FileText size={13} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white leading-tight">Microsoft Word</div>
                <div className="text-[10px] text-zinc-400 font-normal">Official .DOC Statement</div>
              </div>
            </button>

            <button
              onClick={() => handleSelect('pdf')}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:bg-amber-500/10 hover:text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Printer size={13} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white leading-tight">Print / Save PDF</div>
                <div className="text-[10px] text-zinc-400 font-normal">Printable financial report</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Draggable status filter button group with mouse & touch drag capabilities
 */
const DraggableStatusPillGroup: React.FC<{
  currentStatus: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED';
  onSelectStatus: (status: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED') => void;
  counts: { all: number; approved: number; pending: number; rejected: number };
}> = ({ currentStatus, onSelectStatus, counts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-1.5 p-1.5 bg-zinc-950/90 rounded-2xl border border-zinc-800/90 overflow-x-auto scrollbar-none select-none transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Drag or swipe to scroll status filter buttons"
      >
        <div className="flex items-center text-zinc-600 px-1 shrink-0" title="Draggable Status Filter Bar">
          <GripHorizontal size={14} className="hover:text-zinc-400" />
        </div>

        {/* 1. ALL BUTTON */}
        <button
          onClick={() => onSelectStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            currentStatus === 'ALL'
              ? 'bg-zinc-200 text-black font-black shadow-md shadow-zinc-300/10 scale-102'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              currentStatus === 'ALL' ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* 2. APPROVED BUTTON */}
        <button
          onClick={() => onSelectStatus('APPROVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            currentStatus === 'APPROVED'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/25 scale-102'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 border border-zinc-800'
          }`}
        >
          <CheckCircle size={13} className={currentStatus === 'APPROVED' ? 'text-black stroke-[2.5]' : 'text-emerald-400'} />
          <span>Approved</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              currentStatus === 'APPROVED' ? 'bg-black/20 text-black font-extrabold' : 'bg-emerald-500/15 text-emerald-300'
            }`}
          >
            {counts.approved}
          </span>
        </button>

        {/* 3. PENDING BUTTON */}
        <button
          onClick={() => onSelectStatus('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            currentStatus === 'PENDING'
              ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/25 scale-102'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800'
          }`}
        >
          <Clock size={13} className={currentStatus === 'PENDING' ? 'text-black stroke-[2.5]' : 'text-amber-400'} />
          <span>Pending</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              currentStatus === 'PENDING'
                ? 'bg-black/20 text-black font-extrabold'
                : 'bg-amber-500/15 text-amber-300 animate-pulse'
            }`}
          >
            {counts.pending}
          </span>
        </button>

        {/* 4. REJECTED BUTTON */}
        <button
          onClick={() => onSelectStatus('REJECTED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            currentStatus === 'REJECTED'
              ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/25 scale-102'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800'
          }`}
        >
          <XCircle size={13} className={currentStatus === 'REJECTED' ? 'text-white stroke-[2.5]' : 'text-rose-400'} />
          <span>Rejected</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              currentStatus === 'REJECTED' ? 'bg-black/20 text-white font-extrabold' : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {counts.rejected}
          </span>
        </button>
      </div>
    </div>
  );
};

export const ReportTab: React.FC = () => {
  const {
    user,
    transactions,
    activeOrders,
    plans,
    showToast,
    setCurrentTab,
    verifyRecharge,
    rejectRecharge,
    verifyWithdrawal,
    rejectWithdrawal
  } = useApp();

  // Active Navigation Subtab: Defaults to 'statement'
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('statement');
  
  // Statement Master Filters
  const [statementStatus, setStatementStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [statementPaymentProcess, setStatementPaymentProcess] = useState<'ALL' | 'recharge' | 'withdraw' | 'invest' | 'yield' | 'bonus'>('ALL');
  const [statementBankFilter, setStatementBankFilter] = useState<'ALL' | 'cbe' | 'awash' | 'telebirr' | 'cbo' | 'dashen'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rejection Dialog State
  const [rejectingTx, setRejectingTx] = useState<TransactionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid deposit slip');

  // Subtab status filters for legacy tables
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');

  const isAdmin = user.role === 'admin';

  // Permission Safeguard: Non-admin users cannot access the Report Tab
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white font-['Outfit']">Administrator Access Only</h2>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Financial reports, transaction statements, and audit records are restricted to Administrator accounts.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('home')}
          className="px-5 py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Counts for Statement & Reports
  const statementCounts = {
    all: transactions.length,
    approved: transactions.filter((t) => t.status === 'SUCCESS').length,
    pending: transactions.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING').length,
    rejected: transactions.filter((t) => t.status === 'FAILED').length
  };

  // Statement & Reports Master Records
  const statementRecords = transactions.filter((tx) => {
    // Status Filter
    if (statementStatus === 'APPROVED' && tx.status !== 'SUCCESS') return false;
    if (statementStatus === 'PENDING' && tx.status !== 'PENDING' && tx.status !== 'PROCESSING') return false;
    if (statementStatus === 'REJECTED' && tx.status !== 'FAILED') return false;

    // Payment Process Filter
    if (statementPaymentProcess !== 'ALL') {
      if (statementPaymentProcess === 'recharge' && tx.type !== 'recharge') return false;
      if (statementPaymentProcess === 'withdraw' && tx.type !== 'withdraw') return false;
      if (statementPaymentProcess === 'invest' && tx.type !== 'investment') return false;
      if (statementPaymentProcess === 'yield' && tx.type !== 'harvest' && tx.type !== 'daily_yield') return false;
      if (statementPaymentProcess === 'bonus' && tx.type !== 'bonus' && tx.type !== 'commission' && tx.type !== 'checkin') return false;
    }

    // Bank Filter
    if (statementBankFilter !== 'ALL') {
      const bStr = (tx.bankName || tx.verifyBy || tx.paymentMethod || tx.title || '').toLowerCase();
      if (!bStr.includes(statementBankFilter.toLowerCase())) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (tx.bankHolder || tx.userName || tx.userPhone || tx.userEmail || user.name || '').toLowerCase().includes(q);
      const matchBank = (tx.bankName || tx.verifyBy || tx.paymentMethod || '').toLowerCase().includes(q);
      const matchSlip = tx.slipNo?.toLowerCase().includes(q);
      const matchUtr = tx.utrNumber?.toLowerCase().includes(q);
      const matchOrder = tx.orderId?.toLowerCase().includes(q) || tx.id?.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchName && !matchBank && !matchSlip && !matchUtr && !matchOrder && !matchAmount) return false;
    }

    return true;
  });

  // Recharges list
  const rechargeRecords = transactions.filter((tx) => tx.type === 'recharge');
  const filteredRecharges = rechargeRecords.filter((tx) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && (tx.status === 'PENDING' || tx.status === 'PROCESSING')) {
        // match
      } else if (tx.status !== statusFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (tx.orderId || tx.id || '').toLowerCase().includes(q) ||
        (tx.slipNo || '').toLowerCase().includes(q) ||
        (tx.bankName || tx.paymentMethod || '').toLowerCase().includes(q) ||
        (tx.senderAccount || tx.accountNumber || '').toLowerCase().includes(q) ||
        (tx.userPhone || '').toLowerCase().includes(q) ||
        (tx.userEmail || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Withdrawals list
  const withdrawalRecords = transactions.filter((tx) => tx.type === 'withdraw');
  const filteredWithdrawals = withdrawalRecords.filter((tx) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && (tx.status === 'PENDING' || tx.status === 'PROCESSING')) {
        // match
      } else if (tx.status !== statusFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (tx.orderId || tx.id || '').toLowerCase().includes(q) ||
        (tx.utrNumber || '').toLowerCase().includes(q) ||
        (tx.bankName || tx.paymentMethod || '').toLowerCase().includes(q) ||
        (tx.accountNumber || '').toLowerCase().includes(q) ||
        (tx.bankHolder || '').toLowerCase().includes(q) ||
        (tx.userPhone || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Order history
  const filteredOrders = activeOrders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.title.toLowerCase().includes(q) ||
        order.planId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Verified records
  const verifiedTransactions = transactions.filter(
    (tx) => tx.status === 'SUCCESS' && (tx.type === 'recharge' || tx.type === 'withdraw')
  );
  const filteredVerified = verifiedTransactions.filter((tx) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (tx.orderId || tx.id || '').toLowerCase().includes(q) ||
        (tx.slipNo || '').toLowerCase().includes(q) ||
        (tx.utrNumber || '').toLowerCase().includes(q) ||
        (tx.bankName || tx.paymentMethod || '').toLowerCase().includes(q) ||
        (tx.accountNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Range of Invested Plans analysis
  const totalPlatformInvested = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDailyYieldPlatform = activeOrders.reduce((sum, o) => sum + (o.dailyIncome || 0), 0);

  const planRangeAnalysis = plans.map((plan) => {
    const ordersForPlan = activeOrders.filter((o) => o.planId === plan.id);
    const count = ordersForPlan.length;
    const totalInvestedInPlan = count * (plan?.price || 0);
    const totalDailyPayout = count * (plan?.dailyIncome || 0);
    const sharePercentage = totalPlatformInvested > 0 ? (totalInvestedInPlan / totalPlatformInvested) * 100 : 0;
    const dailyReturnPercent = (plan?.price && plan.price > 0) ? (((plan.dailyIncome || 0) / plan.price) * 100).toFixed(1) : '0';

    let tierGroup = 'Starter Tier';
    if (plan.price >= 30000) tierGroup = 'Enterprise VIP';
    else if (plan.price >= 15000) tierGroup = 'High-Yield Mining';
    else if (plan.price >= 3000) tierGroup = 'Standard Machine';

    return {
      plan,
      tierGroup,
      count,
      totalInvestedInPlan,
      totalDailyPayout,
      sharePercentage,
      dailyReturnPercent
    };
  });

  // Payment process actions
  const handleQuickApprove = (tx: TransactionRecord) => {
    if (tx.type === 'recharge' || tx.slipNo) {
      const res = verifyRecharge(tx.orderId || tx.id);
      showToast(res.message, res.success ? 'success' : 'error');
    } else if (tx.type === 'withdraw') {
      const res = verifyWithdrawal(tx.orderId || tx.id);
      showToast(res.message, res.success ? 'success' : 'error');
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingTx) return;
    if (rejectingTx.type === 'withdraw') {
      const res = rejectWithdrawal(rejectingTx.orderId || rejectingTx.id, rejectReason);
      showToast(res.message, res.success ? 'success' : 'error');
    } else {
      const res = rejectRecharge(rejectingTx.orderId || rejectingTx.id, rejectReason);
      showToast(res.message, res.success ? 'success' : 'error');
    }
    setRejectingTx(null);
  };

  // Export Handlers with feedback
  const handleExportStatement = (format: 'excel' | 'word' | 'pdf') => {
    const res = exportStatementRecordsFile(statementRecords, statementStatus, format);
    showToast(`Exported ${res.count} statement records (${res.fileName})`, 'success');
  };

  const handleExportRecharge = (format: 'excel' | 'word' | 'pdf') => {
    const res = exportRechargeRecordsFile(filteredRecharges, statusFilter, format);
    showToast(`Exported ${res.count} recharge records (${res.fileName})`, 'success');
  };

  const handleExportWithdrawal = (format: 'excel' | 'word' | 'pdf') => {
    const res = exportWithdrawalRecordsFile(filteredWithdrawals, statusFilter, format);
    showToast(`Exported ${res.count} withdrawal records (${res.fileName})`, 'success');
  };

  const handleExportOrders = (format: 'excel' | 'word' | 'pdf') => {
    const formattedOrders = filteredOrders.map((o) => ({
      id: o.id,
      title: o.title,
      planId: o.planId,
      price: o.price,
      dailyIncome: o.dailyIncome,
      totalEarnedSoFar: o.totalEarnedSoFar,
      daysCompleted: o.daysCompleted,
      cycleDays: o.cycleDays,
      purchaseDate: o.purchaseDate,
      status: o.status
    }));
    const res = exportOrdersRecordsFile(formattedOrders, format);
    showToast(`Exported ${res.count} mining orders (${res.fileName})`, 'success');
  };

  const handleExportRange = (format: 'excel' | 'word' | 'pdf') => {
    const res = exportPlanRangeAnalysisFile(planRangeAnalysis, format);
    showToast(`Exported ${res.count} plan categories portfolio (${res.fileName})`, 'success');
  };

  const handleExportVerified = (format: 'excel' | 'word' | 'pdf') => {
    const res = exportVerifiedRecordsFile(filteredVerified, format);
    showToast(`Exported ${res.count} verified settlement records (${res.fileName})`, 'success');
  };

  const handleExportCurrent = (format: 'excel' | 'word' | 'pdf') => {
    if (activeSubTab === 'statement') handleExportStatement(format);
    else if (activeSubTab === 'recharge') handleExportRecharge(format);
    else if (activeSubTab === 'withdrawal') handleExportWithdrawal(format);
    else if (activeSubTab === 'orders') handleExportOrders(format);
    else if (activeSubTab === 'range') handleExportRange(format);
    else if (activeSubTab === 'verified') handleExportVerified(format);
  };

  const getStatusBadge = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black inline-flex items-center gap-1">
            <CheckCircle size={10} /> Approved
          </span>
        );
      case 'PROCESSING':
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black inline-flex items-center gap-1">
            <Clock size={10} /> Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black inline-flex items-center gap-1">
            <AlertCircle size={10} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 px-3.5 sm:px-4 py-3 space-y-4 pb-10 text-white">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-3xl p-4 sm:p-5 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet size={16} />
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight font-['Outfit']">
                Statement & Financial Reports
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ExportReportButton
              label="Export Report"
              variant="primary"
              onExport={handleExportCurrent}
            />
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs in Clean Segmented Layout */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {[
          { id: 'statement', label: 'Statement & Reports', icon: FileSpreadsheet, count: transactions.length },
          { id: 'recharge', label: 'Recharged History', icon: ArrowDownLeft, count: rechargeRecords.length },
          { id: 'withdrawal', label: 'Withdrawal History', icon: ArrowUpRight, count: withdrawalRecords.length },
          { id: 'orders', label: 'Order History', icon: Layers, count: activeOrders.length },
          { id: 'range', label: 'Range of Invested Plan', icon: BarChart3, count: plans.length },
          { id: 'verified', label: 'Verified History', icon: BadgeCheck, count: verifiedTransactions.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as ReportSubTab);
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-black stroke-[2.5]' : 'text-zinc-400'} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/20 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. MASTER STATEMENT & REPORTS TAB (MOVED FROM HOME TAB WITH DRAGGABLE BUTTONS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'statement' && (
        <div id="statement-reports-tab-container" className="bg-zinc-900/90 rounded-3xl p-4 sm:p-5 border border-zinc-800 shadow-md space-y-4">
          
          {/* Top Bar Header & Export Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-400" />
                <h2 className="text-base font-bold text-white font-['Outfit']">
                  Financial Statement & Audit Ledger
                </h2>
              </div>
              <p className="text-xs text-zinc-400">
                User logged name, payment bank, date, slip verification, money & interactive approval actions
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ExportReportButton
                label="Export Statement"
                count={statementRecords.length}
                onExport={handleExportStatement}
              />
            </div>
          </div>

          {/* DRAGGABLE FILTER BUTTONS (All, Approved, Pending, Rejected) + PAYMENT PROCESS & BANK SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              
              {/* Draggable Button Group for Status: All, Approved, Pending, Rejected */}
              <DraggableStatusPillGroup
                currentStatus={statementStatus}
                onSelectStatus={setStatementStatus}
                counts={statementCounts}
              />

              {/* Payment Bank Gateway Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {(['ALL', 'cbe', 'awash', 'telebirr', 'cbo', 'dashen'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setStatementBankFilter(b)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      statementBankFilter === b
                        ? 'bg-zinc-700 text-emerald-400 border border-emerald-500/40 shadow-xs'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {b === 'ALL' ? 'All Banks' : b}
                  </button>
                ))}
              </div>

            </div>

            {/* Second Row: Payment Process Channels + Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              
              {/* Draggable / Scrollable Payment Process Types */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Processes' },
                  { id: 'recharge', label: 'Recharge Deposits' },
                  { id: 'withdraw', label: 'Withdrawal Payouts' },
                  { id: 'invest', label: 'Machine Staking' },
                  { id: 'yield', label: 'Daily Yields' },
                  { id: 'bonus', label: 'Bonuses & Rewards' },
                ].map((proc) => (
                  <button
                    key={proc.id}
                    onClick={() => setStatementPaymentProcess(proc.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      statementPaymentProcess === proc.id
                        ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {proc.label}
                  </button>
                ))}
              </div>

              {/* Live Search Input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, slip, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

            </div>
          </div>

          {/* Statement Table Form with all Payment Process Actions */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-inner">
            <table className="w-full text-left text-xs border-collapse min-w-[780px]">
              <thead>
                <tr className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">User Logged Name</th>
                  <th className="py-3 px-3">Payment Bank / Channel</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Slip / Reference</th>
                  <th className="py-3 px-3 text-right">Money</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Payment Process Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {statementRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500">
                      <FileText size={28} className="mx-auto mb-2 text-zinc-600" />
                      <p className="text-xs font-semibold text-zinc-400">No transaction statement records matching filter.</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">Try resetting the status or payment process filters.</p>
                    </td>
                  </tr>
                ) : (
                  statementRecords.map((tx) => {
                    const isApproved = tx.status === 'SUCCESS';
                    const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
                    const isRejected = tx.status === 'FAILED';

                    const loggedName = tx.bankHolder || tx.userName || tx.userPhone || tx.userEmail || user.name || 'Naol Abera';
                    const paymentBank = tx.bankName || tx.verifyBy || (tx.type === 'recharge' ? 'CBE Bank' : tx.type === 'withdraw' ? 'Telebirr' : 'Internal Wallet');
                    const refCode = tx.slipNo || tx.utrNumber || tx.orderId || tx.id;
                    const isOutflow = tx.type === 'withdraw' || tx.type === 'investment';

                    return (
                      <tr key={tx.id || tx.orderId} className="hover:bg-zinc-900/60 transition-colors">
                        
                        {/* 1. User Logged Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                              {loggedName[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white leading-tight truncate max-w-[130px]">{loggedName}</p>
                              <p className="text-[10px] font-mono text-zinc-400">
                                {tx.userPhone || user.phone || 'ID: ' + (tx.userId || user.userId)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Payment Bank / Channel */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-emerald-400 shrink-0" />
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/80 text-emerald-400 font-bold text-[11px] whitespace-nowrap">
                              {paymentBank}
                            </span>
                          </div>
                          {tx.senderAccount && (
                            <span className="text-[10px] text-zinc-400 font-mono block pl-4 mt-0.5">
                              Acc: {tx.senderAccount}
                            </span>
                          )}
                          {tx.accountNumber && (
                            <span className="text-[10px] text-zinc-400 font-mono block pl-4 mt-0.5">
                              Acc: {tx.accountNumber}
                            </span>
                          )}
                        </td>

                        {/* 3. Date */}
                        <td className="py-3 px-3 text-zinc-300 font-medium whitespace-nowrap text-[11px]">
                          {tx.date || new Date(tx.timestamp).toLocaleDateString()}
                          <span className="text-[9.5px] text-zinc-500 font-mono block">
                            {tx.date ? '12:00 PM' : new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                        </td>

                        {/* 4. Slip / Reference */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800 w-fit">
                            <span className="font-mono text-zinc-200 text-[10.5px] font-bold">
                              {refCode}
                            </span>
                            <button
                              onClick={() => handleCopy(refCode, `statement-ref-${tx.id}`)}
                              className="text-zinc-500 hover:text-white cursor-pointer"
                              title="Copy Reference"
                            >
                              {copiedId === `statement-ref-${tx.id}` ? (
                                <Check size={11} className="text-emerald-400" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 5. Money */}
                        <td className="py-3 px-3 text-right">
                          <span className={`font-black font-['Outfit'] text-xs sm:text-sm ${
                            isOutflow ? 'text-zinc-200' : 'text-emerald-400'
                          }`}>
                            {isOutflow ? '-' : '+'}ETB {(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          {tx.type === 'withdraw' && (
                            <span className="text-[9.5px] text-zinc-500 block font-mono">Net: ETB {((tx.amount || 0) * 0.95).toFixed(2)}</span>
                          )}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(tx.status)}
                        </td>

                        {/* 7. Action / Process */}
                        <td className="py-3 px-3 text-center">
                          {isPending ? (
                            <div className="flex items-center justify-center gap-1.5">
                              {tx.type === 'recharge' || tx.slipNo ? (
                                <button
                                  onClick={() => handleQuickApprove(tx)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-[10.5px] rounded-lg cursor-pointer transition-all shadow-xs"
                                  title="Approve & Credit Deposit Slip"
                                >
                                  Approve
                                </button>
                              ) : tx.type === 'withdraw' ? (
                                <button
                                  onClick={() => handleQuickApprove(tx)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-[10.5px] rounded-lg cursor-pointer transition-all shadow-xs"
                                  title="Disburse Bank Payout"
                                >
                                  Disburse
                                </button>
                              ) : null}

                              <button
                                onClick={() => {
                                  setRejectingTx(tx);
                                  setRejectReason('Invalid deposit slip');
                                }}
                                className="px-2 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-[10.5px] rounded-lg cursor-pointer transition-all"
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </div>
                          ) : isApproved ? (
                            <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10.5px] font-bold">
                              <ShieldCheck size={13} />
                              <span>Settled</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-[10px] font-medium" title={tx.rejectReason || 'Rejected'}>
                              {tx.rejectReason ? tx.rejectReason.slice(0, 15) + '...' : 'Rejected'}
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Statement Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 pt-1 gap-2">
            <span>
              Showing {statementRecords.length} records matching filter • Total Audit Volume: <strong className="text-emerald-400 font-mono">ETB {statementRecords.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500">Drag or swipe filter bar for quick review</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RECHARGED HISTORY - TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'recharge' && (
        <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3.5">
          {/* Top Bar Controls: Filters, Search & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none">
              {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Records' : st === 'SUCCESS' ? 'Approved' : st === 'PENDING' ? 'Pending' : 'Rejected'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search slip, account, bank, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <ExportReportButton
                label="Export"
                count={filteredRecharges.length}
                onExport={handleExportRecharge}
              />
            </div>
          </div>

          {/* Recharged Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[10.5px] text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Order / Date</th>
                  <th className="py-3 px-3">Depositor / Phone</th>
                  <th className="py-3 px-3">Payment Bank</th>
                  <th className="py-3 px-3">Slip Number</th>
                  <th className="py-3 px-3 text-right">Amount (ETB)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredRecharges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-xs">
                      No recharged records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecharges.map((tx) => {
                    const { bankName, accountNumber } = formatAccountBankInfo(tx);
                    return (
                      <tr key={tx.id || tx.orderId} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-white text-xs">
                            {tx.orderId || tx.id}
                          </div>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {tx.date || new Date(tx.timestamp).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-zinc-200">
                            {tx.userName || user.name}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {tx.userPhone || user.phone || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-emerald-400 shrink-0" />
                            <span className="font-medium text-white">{bankName}</span>
                          </div>
                          {accountNumber !== 'N/A' && (
                            <span className="text-[10px] font-mono text-zinc-400 block pl-4">
                              Acc: {accountNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {tx.slipNo ? (
                            <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800 w-fit">
                              <span className="font-mono text-emerald-300 text-[11px] font-bold">
                                {tx.slipNo}
                              </span>
                              <button
                                onClick={() => handleCopy(tx.slipNo || '', `recharge-slip-${tx.id}`)}
                                className="text-zinc-500 hover:text-white cursor-pointer"
                                title="Copy Slip Ref"
                              >
                                {copiedId === `recharge-slip-${tx.id}` ? (
                                  <Check size={11} className="text-emerald-400" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-[11px] font-mono">Auto / Direct</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-emerald-400 font-['Outfit'] text-sm">
                            +ETB {(tx.amount || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WITHDRAWAL HISTORY - TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'withdrawal' && (
        <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3.5">
          {/* Top Bar Controls: Filters, Search & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-none">
              {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-zinc-800 text-amber-400 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Withdrawals' : st === 'SUCCESS' ? 'Settled' : st === 'PENDING' ? 'Pending' : 'Rejected'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search UTR, account, bank, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <ExportReportButton
                label="Export"
                count={filteredWithdrawals.length}
                onExport={handleExportWithdrawal}
              />
            </div>
          </div>

          {/* Withdrawal Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[10.5px] text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Order / Timestamp</th>
                  <th className="py-3 px-3">Beneficiary Account</th>
                  <th className="py-3 px-3">Payout Bank</th>
                  <th className="py-3 px-3">Settlement UTR</th>
                  <th className="py-3 px-3 text-right">Gross Amount</th>
                  <th className="py-3 px-3 text-right">Net Payout</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500 text-xs">
                      No withdrawal records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((tx) => {
                    const fee = tx.amount * 0.05;
                    const netAmount = tx.amount - fee;
                    return (
                      <tr key={tx.id || tx.orderId} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-white text-xs">
                            {tx.orderId || tx.id}
                          </div>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {tx.date || new Date(tx.timestamp).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-white">
                            {tx.bankHolder || user.name}
                          </div>
                          <span className="text-[10.5px] font-mono text-zinc-400 block">
                            {tx.accountNumber || '1000...'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-amber-400 shrink-0" />
                            <span className="font-medium text-white">{tx.bankName || 'CBE Bank'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {tx.utrNumber ? (
                            <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-amber-500/30 w-fit">
                              <span className="font-mono text-amber-300 text-[11px] font-bold">
                                {tx.utrNumber}
                              </span>
                              <button
                                onClick={() => handleCopy(tx.utrNumber || '', `payout-utr-${tx.id}`)}
                                className="text-zinc-500 hover:text-white cursor-pointer"
                                title="Copy UTR"
                              >
                                {copiedId === `payout-utr-${tx.id}` ? (
                                  <Check size={11} className="text-emerald-400" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-[10.5px] font-mono">Pending Bank UTR</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-zinc-300 font-mono text-xs">
                            ETB {(tx.amount || 0).toFixed(2)}
                          </span>
                          <span className="text-[9.5px] text-zinc-500 block font-mono">Fee: 5%</span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-emerald-400 font-['Outfit'] text-sm">
                            ETB {(netAmount || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ORDER HISTORY - TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3.5">
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="text-xs text-zinc-400 font-medium">
              Active & Historic Mining Contracts ({filteredOrders.length} records)
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search plan title, order ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <ExportReportButton
                label="Export"
                count={filteredOrders.length}
                onExport={handleExportOrders}
              />
            </div>
          </div>

          {/* Order Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[10.5px] text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Order ID / Date</th>
                  <th className="py-3 px-3">Machine Plan</th>
                  <th className="py-3 px-3 text-right">Capital Invested</th>
                  <th className="py-3 px-3 text-right">Daily Yield</th>
                  <th className="py-3 px-3 text-right">Total Earned</th>
                  <th className="py-3 px-3 text-center">Cycle Progress</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500 text-xs">
                      No order history found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const progressPct = Math.min(100, Math.round((order.daysCompleted / order.cycleDays) * 100));
                    return (
                      <tr key={order.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-white text-xs">
                            {order.id}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {order.purchaseDate}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={order.image}
                              alt={order.title}
                              className="w-8 h-8 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-white text-xs block truncate max-w-[160px]">
                                {order.title}
                              </span>
                              <span className="text-[9.5px] text-zinc-400 font-mono block">
                                Tier: {order.planId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-extrabold text-white font-['Outfit'] text-xs">
                            ETB {(order.price || 0).toLocaleString('en-US')}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-emerald-400 font-mono text-xs">
                            +ETB {(order.dailyIncome || 0).toFixed(2)}/d
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-extrabold text-amber-400 font-['Outfit'] text-xs">
                            ETB {(order.totalEarnedSoFar || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1 min-w-[100px]">
                            <span className="text-[10px] font-mono text-zinc-300">
                              {order.daysCompleted}/{order.cycleDays} Days ({progressPct}%)
                            </span>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RANGE OF INVESTED PLAN BY TYPE PLAN */}
      {/* ========================================================================= */}
      {activeSubTab === 'range' && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Active Capital</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-['Outfit'] block mt-0.5">
                ETB {totalPlatformInvested.toLocaleString('en-US')}
              </span>
              <span className="text-[9.5px] text-emerald-400 font-medium">Across all plan types</span>
            </div>

            <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Daily Yield Distributed</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-['Outfit'] block mt-0.5">
                ETB {totalDailyYieldPlatform.toFixed(2)}/day
              </span>
              <span className="text-[9.5px] text-zinc-400">Aggregated node yield</span>
            </div>

            <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Active Nodes</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-400 font-['Outfit'] block mt-0.5">
                {activeOrders.length} Machines
              </span>
              <span className="text-[9.5px] text-zinc-400">Online mining units</span>
            </div>

            <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Plan Range Tiers</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-['Outfit'] block mt-0.5">
                ETB 500 – 60,000
              </span>
              <span className="text-[9.5px] text-zinc-400">{plans.length} configured tiers</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white font-['Outfit']">
                  Portfolio Breakdown by Plan Type & Price Range
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                  90-Day Cycles
                </span>
                <ExportReportButton
                  label="Export Portfolio"
                  count={plans.length}
                  onExport={handleExportRange}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[10.5px] text-zinc-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Plan Type / Machine</th>
                    <th className="py-3 px-3 text-center">Category Tier</th>
                    <th className="py-3 px-3 text-right">Price Tier</th>
                    <th className="py-3 px-3 text-right">Daily Return</th>
                    <th className="py-3 px-3 text-center">Active Units</th>
                    <th className="py-3 px-3 text-right">Total Invested</th>
                    <th className="py-3 px-3 text-right">Daily Yield Volume</th>
                    <th className="py-3 px-3 text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {planRangeAnalysis.map(({ plan, tierGroup, count, totalInvestedInPlan, totalDailyPayout, sharePercentage, dailyReturnPercent }) => (
                    <tr key={plan.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={plan.image}
                            alt={plan.title}
                            className="w-9 h-9 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-white block text-xs truncate max-w-[160px] sm:max-w-none">
                              {plan.title}
                            </span>
                            <span className="text-[9.5px] text-zinc-400 block font-mono">
                              {plan.coffeeType} • {plan.powerRating}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                          {tierGroup}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-white font-mono">
                        ETB {plan.price.toLocaleString('en-US')}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold font-mono">
                        +{dailyReturnPercent}%/d
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-200 text-[10.5px] font-bold border border-zinc-800">
                          {count} units
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-extrabold text-white font-['Outfit']">
                        ETB {totalInvestedInPlan.toLocaleString('en-US')}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400 font-bold font-mono">
                        ETB {(totalDailyPayout || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-zinc-300 text-[11px] font-bold">
                            {(sharePercentage || 0).toFixed(1)}%
                          </span>
                          <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.max(4, sharePercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. VERIFIED HISTORY - TABLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'verified' && (
        <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3.5">
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="text-xs text-zinc-400 font-medium">
              Audit trail of successfully settled deposits, approved payouts, and verified bank accounts ({filteredVerified.length} records)
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search verified ref, bank, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <ExportReportButton
                label="Export"
                count={filteredVerified.length}
                onExport={handleExportVerified}
              />
            </div>
          </div>

          {/* Verified Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[10.5px] text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Audit Ref / Date</th>
                  <th className="py-3 px-3">Transaction Type</th>
                  <th className="py-3 px-3">Settlement Channel</th>
                  <th className="py-3 px-3">Account Number</th>
                  <th className="py-3 px-3 text-right">Settled Amount (ETB)</th>
                  <th className="py-3 px-3">Verification Mechanism</th>
                  <th className="py-3 px-3 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredVerified.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500 text-xs">
                      No verified settlement records found.
                    </td>
                  </tr>
                ) : (
                  filteredVerified.map((tx) => {
                    const { bankName, accountNumber } = formatAccountBankInfo(tx);
                    const isDeposit = tx.type === 'recharge';
                    const refCode = tx.slipNo || tx.utrNumber || tx.orderId;

                    return (
                      <tr key={tx.id || tx.orderId} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-emerald-400 text-xs">
                            {refCode}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {tx.date || new Date(tx.timestamp).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            isDeposit
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isDeposit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {isDeposit ? 'Bank Recharge' : 'Withdrawal Payout'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-emerald-400 shrink-0" />
                            <span className="font-medium text-white">{bankName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-zinc-300 text-xs">
                            {accountNumber}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-emerald-400 font-['Outfit'] text-sm">
                            ETB {(tx.amount || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-zinc-300 text-[11px] block">
                            {tx.verifyBy || 'CBE / Telebirr Automated Auditor'}
                          </span>
                          <span className="text-[9.5px] text-emerald-400 font-mono">
                            Checksum OK
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black inline-flex items-center gap-1">
                            <CheckCircle size={10} /> Settled
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-400 border-b border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  Reject {rejectingTx.type === 'withdraw' ? 'Withdrawal Payout' : 'Deposit Slip'}
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Ref: {rejectingTx.slipNo || rejectingTx.orderId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Select or Type Rejection Reason:
              </label>

              <div className="space-y-1.5">
                {[
                  'Invalid deposit slip / unreadable',
                  'Amount mismatch with bank record',
                  'Duplicate transaction reference',
                  'Beneficiary account name mismatch',
                  'Telebirr / CBE transaction not received'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      rejectReason === reason
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Or enter custom reason..."
                className="w-full px-3 py-2 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setRejectingTx(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white text-xs font-black cursor-pointer shadow-md shadow-rose-500/20 transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
