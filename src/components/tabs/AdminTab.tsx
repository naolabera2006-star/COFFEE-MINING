import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvestmentPlan, TransactionRecord } from '../../types';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  CreditCard,
  User,
  Coffee,
  AlertCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Zap,
  Tag,
  FileText,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import {
  exportRechargeRecordsFile,
  exportWithdrawalRecordsFile,
  generateTransactionsCSV,
  downloadCSVFile,
  downloadWordDocFile,
  printPDFReport
} from '../../utils/exportUtils';

const PRESET_IMAGES = [
  { label: 'Arabica Extractor', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  { label: 'Espresso Roaster', url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Barista Rig', url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Roastery Unit', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80' },
  { label: 'Plantation Unit', url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80' },
  { label: 'Consortium Flagship', url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&fit=crop&q=80' }
];

export const AdminTab: React.FC = () => {
  const {
    plans,
    createPlan,
    updatePlan,
    deletePlan,
    resetPlansToDefault,
    transactions,
    verifyWithdrawal,
    rejectWithdrawal,
    createMockWithdrawal,
    verifyRecharge,
    rejectRecharge,
    createMockRecharge,
    updateUserBalance,
    user,
    activeOrders,
    setCurrentTab,
    showToast
  } = useApp();

  // Sub-tabs
  const [adminSection, setAdminSection] = useState<'withdrawals' | 'deposits' | 'plans' | 'userManagement'>('deposits');

  // Withdrawal filters
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [withdrawMethodFilter, setWithdrawMethodFilter] = useState<'ALL' | 'cbe' | 'awash' | 'telebirr' | 'cbo'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Deposit filters
  const [depositStatusFilter, setDepositStatusFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [depositMethodFilter, setDepositMethodFilter] = useState<'ALL' | 'cbe' | 'awash' | 'telebirr' | 'cbo'>('ALL');
  const [depositSearchQuery, setDepositSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Withdrawal Verification & Rejection Modal State
  const [verifyingOrder, setVerifyingOrder] = useState<TransactionRecord | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const [rejectingOrder, setRejectingOrder] = useState<TransactionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid account / beneficiary mismatch');

  // Recharge Verification & Rejection Modal State
  const [verifyingRecharge, setVerifyingRecharge] = useState<TransactionRecord | null>(null);
  const [rechargeAdminNote, setRechargeAdminNote] = useState('');

  const [rejectingRecharge, setRejectingRecharge] = useState<TransactionRecord | null>(null);
  const [rejectRechargeReason, setRejectRechargeReason] = useState('Slip number not found in bank statement');

  // Plan Edit / Create Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    title: '',
    subtitle: '',
    price: 1000,
    dailyIncome: 50,
    cycleDays: 90,
    coffeeType: 'Arabica Light Roast',
    powerRating: '2.0 kW / h',
    image: PRESET_IMAGES[0].url,
    tag: 'NEW',
    description: ''
  });

  // User Balance Adjust State
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState('');
  const [balanceAdjustType, setBalanceAdjustType] = useState<'credit' | 'debit'>('credit');
  const [balanceAdjustReason, setBalanceAdjustReason] = useState('Admin Bonus Credit');

  // Filter withdrawals
  const allWithdrawals = transactions.filter(t => t.type === 'withdraw');
  const allDeposits = transactions.filter(t => t.type === 'recharge' || Boolean(t.slipNo));
  
  const pendingWithdrawalsCount = allWithdrawals.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;
  const pendingDepositsCount = allDeposits.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;

  // Suggestion 3: Admin User Financial Metrics
  // Total Recharged equal to all sum of user invested or recharged
  const adminInvestedSum = activeOrders.reduce((acc, o) => acc + (o.price || 0), 0) +
    transactions.filter(t => t.type === 'investment' && t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0);
  const adminRechargedSum = allDeposits
    .filter(t => t.status === 'SUCCESS' || t.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const adminTotalRecharged = adminRechargedSum + adminInvestedSum;

  // Total withdraw equal to all sum users withdrawed
  const adminTotalWithdraw = allWithdrawals
    .filter(t => t.status === 'SUCCESS' || t.status === 'APPROVED' || t.withdrawalStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total Income is sum of all recharged and handling & Tax fee(5%) for Admin User
  const adminHandlingTaxFee = adminTotalWithdraw * 0.05;
  const adminTotalIncome = adminTotalRecharged + adminHandlingTaxFee;

  const approvedWithdrawalsTotal = adminTotalWithdraw;
  const pendingWithdrawalsTotal = allWithdrawals
    .filter(t => t.status === 'PENDING' || t.status === 'PROCESSING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const verifiedDepositsTotal = adminTotalRecharged;
  const pendingDepositsTotal = allDeposits
    .filter(t => t.status === 'PENDING' || t.status === 'PROCESSING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredWithdrawals = allWithdrawals.filter(t => {
    // Status filter
    if (withdrawStatusFilter === 'PENDING' && t.status !== 'PENDING' && t.status !== 'PROCESSING') return false;
    if (withdrawStatusFilter === 'SUCCESS' && t.status !== 'SUCCESS') return false;
    if (withdrawStatusFilter === 'FAILED' && t.status !== 'FAILED') return false;

    // Method filter
    if (withdrawMethodFilter !== 'ALL') {
      const bank = (t.bankName || '').toLowerCase();
      const upi = (t.upiId || '').toLowerCase();
      const method = (t.payoutMethod || '').toLowerCase();
      if (!bank.includes(withdrawMethodFilter) && !upi.includes(withdrawMethodFilter) && !method.includes(withdrawMethodFilter)) {
        return false;
      }
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.orderId.toLowerCase().includes(q) ||
      (t.bankHolder && t.bankHolder.toLowerCase().includes(q)) ||
      (t.userPhone && t.userPhone.includes(q)) ||
      (t.bankName && t.bankName.toLowerCase().includes(q)) ||
      (t.upiId && t.upiId.toLowerCase().includes(q))
    );
  });

  const filteredDeposits = allDeposits.filter(t => {
    // Status filter
    if (depositStatusFilter === 'PENDING' && t.status !== 'PENDING' && t.status !== 'PROCESSING') return false;
    if (depositStatusFilter === 'SUCCESS' && t.status !== 'SUCCESS') return false;
    if (depositStatusFilter === 'FAILED' && t.status !== 'FAILED') return false;

    // Method filter
    if (depositMethodFilter !== 'ALL') {
      const verify = (t.verifyBy || '').toLowerCase();
      const pm = (t.paymentMethod || '').toLowerCase();
      const title = (t.title || '').toLowerCase();
      if (!verify.includes(depositMethodFilter) && !pm.includes(depositMethodFilter) && !title.includes(depositMethodFilter)) {
        return false;
      }
    }

    if (!depositSearchQuery.trim()) return true;
    const q = depositSearchQuery.toLowerCase();
    return (
      t.orderId.toLowerCase().includes(q) ||
      (t.slipNo && t.slipNo.toLowerCase().includes(q)) ||
      (t.verifyBy && t.verifyBy.toLowerCase().includes(q)) ||
      (t.senderAccount && t.senderAccount.toLowerCase().includes(q)) ||
      (t.userPhone && t.userPhone.toLowerCase().includes(q)) ||
      (t.title && t.title.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Open Withdrawal Verify Modal
  const openVerifyModal = (tx: TransactionRecord) => {
    setVerifyingOrder(tx);
    const prefix = tx.bankName?.toLowerCase().includes('telebirr') ? 'TB-DISBURSE-' : 'BANK-REF-';
    setUtrInput(prefix + Math.floor(100000000000 + Math.random() * 900000000000));
    setAdminNote(`Approved & disbursed to ${tx.bankName || 'bank account'}`);
  };

  const handleConfirmVerify = () => {
    if (!verifyingOrder) return;
    verifyWithdrawal(verifyingOrder.orderId, utrInput, adminNote);
    setVerifyingOrder(null);
  };

  // Open Withdrawal Reject Modal
  const openRejectModal = (tx: TransactionRecord) => {
    setRejectingOrder(tx);
    setRejectReason('Bank details mismatch / Invalid account number');
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    rejectWithdrawal(rejectingOrder.orderId, rejectReason);
    setRejectingOrder(null);
  };

  // Open Recharge Verify Modal
  const openVerifyRechargeModal = (tx: TransactionRecord) => {
    setVerifyingRecharge(tx);
    setRechargeAdminNote(`Slip verified in ${tx.verifyBy || 'bank'} statement. Deposited.`);
  };

  const handleConfirmVerifyRecharge = () => {
    if (!verifyingRecharge) return;
    verifyRecharge(verifyingRecharge.orderId, rechargeAdminNote);
    setVerifyingRecharge(null);
  };

  // Open Recharge Reject Modal
  const openRejectRechargeModal = (tx: TransactionRecord) => {
    setRejectingRecharge(tx);
    setRejectRechargeReason('Invalid transaction slip / Transfer not received in merchant account');
  };

  const handleConfirmRejectRecharge = () => {
    if (!rejectingRecharge) return;
    rejectRecharge(rejectingRecharge.orderId, rejectRechargeReason);
    setRejectingRecharge(null);
  };

  // Open Create Plan Modal
  const openCreatePlanModal = () => {
    setEditingPlanId(null);
    const nextIndex = plans.length + 1;
    setPlanForm({
      name: `Mining -${nextIndex}`,
      title: `Mining -${nextIndex}`,
      subtitle: '',
      price: 2500,
      dailyIncome: 145,
      cycleDays: 90,
      coffeeType: 'Single Origin Arabica',
      powerRating: `${(nextIndex * 1.8).toFixed(1)} kW / h`,
      image: PRESET_IMAGES[Math.min(nextIndex - 1, PRESET_IMAGES.length - 1)].url,
      tag: 'NEW',
      description: 'Automated precision coffee roaster and yield extraction unit.'
    });
    setIsPlanModalOpen(true);
  };

  // Open Edit Plan Modal
  const openEditPlanModal = (plan: InvestmentPlan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      title: plan.title,
      subtitle: plan.subtitle,
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      cycleDays: plan.cycleDays,
      coffeeType: plan.coffeeType,
      powerRating: plan.powerRating,
      image: plan.image,
      tag: plan.tag || 'HOT',
      description: plan.description
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlanId) {
      updatePlan(editingPlanId, {
        name: planForm.name,
        title: planForm.title,
        subtitle: planForm.subtitle,
        price: Number(planForm.price),
        dailyIncome: Number(planForm.dailyIncome),
        cycleDays: Number(planForm.cycleDays),
        coffeeType: planForm.coffeeType,
        powerRating: planForm.powerRating,
        image: planForm.image,
        tag: planForm.tag,
        description: planForm.description
      });
    } else {
      createPlan({
        miningIndex: plans.length + 1,
        name: planForm.name,
        title: planForm.title,
        subtitle: planForm.subtitle,
        price: Number(planForm.price),
        dailyIncome: Number(planForm.dailyIncome),
        cycleDays: Number(planForm.cycleDays),
        totalReturn: Number(planForm.dailyIncome) * Number(planForm.cycleDays),
        coffeeType: planForm.coffeeType,
        powerRating: planForm.powerRating,
        image: planForm.image,
        tag: planForm.tag,
        description: planForm.description
      });
    }
    setIsPlanModalOpen(false);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(balanceAdjustAmount);
    if (!val || val <= 0) return;
    const delta = balanceAdjustType === 'credit' ? val : -val;
    updateUserBalance(delta, balanceAdjustReason);
    setBalanceAdjustAmount('');
  };

  // Permission Safeguard: Non-admin users cannot view the Admin Console
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-zinc-400 max-w-xs">
            This section is restricted to administrative personnel.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('home')}
          className="px-5 py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-400"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28 pt-2 px-3 sm:px-4 max-w-2xl mx-auto space-y-4">
      {/* Top Admin Header Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shadow-inner">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight font-['Outfit']">
                  Admin Control Console
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  MASTER
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Manage mining products, edit pricing, and verify withdrawal requests
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('mine')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700 transition-all cursor-pointer"
          >
            ← Exit to App
          </button>
        </div>

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 font-medium block">Pending Slips</span>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">
              {pendingDepositsCount + pendingWithdrawalsCount} <span className="text-[10px] text-zinc-500">total</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Needs review</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 font-medium block">Total Recharged</span>
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
              ETB {adminTotalRecharged.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-500/80">Invested + Recharged</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 font-medium block">Total Withdraw</span>
            <div className="text-sm sm:text-base font-black text-amber-300 font-mono mt-0.5">
              ETB {adminTotalWithdraw.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Users withdrawed</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 font-medium block">5% Handling & Tax</span>
            <div className="text-sm sm:text-base font-black text-purple-300 font-mono mt-0.5">
              ETB {adminHandlingTaxFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-purple-400/80">Withdrawal fee</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2.5 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-400 font-medium block">Total Income</span>
            <div className="text-sm sm:text-base font-black text-emerald-300 font-mono mt-0.5">
              ETB {adminTotalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-400/80">Recharged + 5% Fee</span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap rounded-2xl bg-zinc-950 p-1 border border-zinc-800 mt-4 gap-1">
          <button
            id="tab-admin-deposits"
            onClick={() => setAdminSection('deposits')}
            className={`flex-1 min-w-[130px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adminSection === 'deposits'
                ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Recharge Slips</span>
            {pendingDepositsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                adminSection === 'deposits' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {pendingDepositsCount}
              </span>
            )}
          </button>

          <button
            id="tab-admin-withdrawals"
            onClick={() => setAdminSection('withdrawals')}
            className={`flex-1 min-w-[130px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adminSection === 'withdrawals'
                ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign size={14} />
            <span>Withdrawals</span>
            {pendingWithdrawalsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                adminSection === 'withdrawals' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            id="tab-admin-plans"
            onClick={() => setAdminSection('plans')}
            className={`flex-1 min-w-[110px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adminSection === 'plans'
                ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Coffee size={14} />
            <span>Plans ({plans.length})</span>
          </button>

          <button
            id="tab-admin-users"
            onClick={() => setAdminSection('userManagement')}
            className={`flex-1 min-w-[110px] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adminSection === 'userManagement'
                ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User size={14} />
            <span>User & Balance</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WITHDRAWALS VERIFICATION & MANAGEMENT */}
      {/* ========================================================================= */}
      {adminSection === 'withdrawals' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Action Toolbar & Filters */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setWithdrawStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    withdrawStatusFilter === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Clock size={12} />
                  <span>Pending Review ({allWithdrawals.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length})</span>
                </button>

                <button
                  onClick={() => setWithdrawStatusFilter('SUCCESS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    withdrawStatusFilter === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <CheckCircle size={12} />
                  <span>Verified / Paid ({allWithdrawals.filter(t => t.status === 'SUCCESS').length})</span>
                </button>

                <button
                  onClick={() => setWithdrawStatusFilter('FAILED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    withdrawStatusFilter === 'FAILED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <XCircle size={12} />
                  <span>Rejected ({allWithdrawals.filter(t => t.status === 'FAILED').length})</span>
                </button>

                <button
                  onClick={() => setWithdrawStatusFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    withdrawStatusFilter === 'ALL'
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  All ({allWithdrawals.length})
                </button>
              </div>

              {/* Export & Mock Generator Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-zinc-900 border border-emerald-500/30 rounded-xl p-0.5 shadow-xs">
                  <button
                    id="btn-admin-export-withdrawals-excel"
                    onClick={() => {
                      const { count, fileName } = exportWithdrawalRecordsFile(filteredWithdrawals, withdrawStatusFilter, 'excel');
                      showToast(`Exported ${count} withdrawal records to Excel (${fileName})`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-emerald-500/20 active:scale-95 text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    title="Export withdrawal records to Excel (.csv)"
                  >
                    <Download size={11} />
                    <span>Excel</span>
                  </button>

                  <button
                    id="btn-admin-export-withdrawals-word"
                    onClick={() => {
                      const { count, fileName } = exportWithdrawalRecordsFile(filteredWithdrawals, withdrawStatusFilter, 'word');
                      showToast(`Exported ${count} withdrawal records to Word (${fileName})`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-emerald-500/20 active:scale-95 text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border-l border-zinc-800"
                    title="Export withdrawal records to Word (.doc)"
                  >
                    <span>Word</span>
                  </button>

                  <button
                    id="btn-admin-export-withdrawals-pdf"
                    onClick={() => {
                      const { count, fileName } = exportWithdrawalRecordsFile(filteredWithdrawals, withdrawStatusFilter, 'pdf');
                      showToast(`Generated PDF for ${count} withdrawal records`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-rose-500/20 active:scale-95 text-rose-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border-l border-zinc-800"
                    title="Print / Save withdrawal records as PDF"
                  >
                    <span>PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => createMockWithdrawal(Math.floor(Math.random() * 20 + 4) * 100)}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-amber-300 border border-zinc-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  title="Inject sample pending withdrawal request"
                >
                  <Plus size={12} />
                  <span>+ Mock Request</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Phone, Bank, Account, or Holder Name..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Withdrawals List */}
          {filteredWithdrawals.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-white">No Withdrawal Requests</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                There are currently no withdrawal transactions matching this filter. Click "+ Mock Request" to simulate a new withdrawal.
              </p>
              <button
                onClick={() => createMockWithdrawal(1200)}
                className="mt-2 px-3.5 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-400"
              >
                Create Sample Request (ETB 1,200)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((tx) => {
                const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
                const isSuccess = tx.status === 'SUCCESS';
                const isFailed = tx.status === 'FAILED';
                const txAmt = tx.amount || 0;
                const fee = txAmt * 0.05;
                const netPayout = txAmt - fee;

                return (
                  <div
                    key={tx.id}
                    className={`bg-zinc-900 border rounded-3xl p-4 transition-all space-y-3.5 ${
                      isPending
                        ? 'border-amber-500/40 bg-zinc-900/90 shadow-md shadow-amber-500/5'
                        : isSuccess
                        ? 'border-emerald-500/30'
                        : 'border-rose-500/30 bg-zinc-900/60'
                    }`}
                  >
                    {/* Header: Order ID, Timestamp & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-white">
                            #{tx.orderId}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.orderId, tx.orderId)}
                            className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === tx.orderId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                          <span className="text-[10px] text-zinc-500">• {tx.date}</span>
                        </div>

                        <p className="text-xs font-semibold text-zinc-300 mt-0.5">
                          {tx.title}
                        </p>
                      </div>

                      {/* Status pill */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : isSuccess
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {isPending && <Clock size={11} />}
                        {isSuccess && <CheckCircle size={11} />}
                        {isFailed && <XCircle size={11} />}
                        {tx.status}
                      </span>
                    </div>

                    {/* Financial Amount Box */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Requested Amount</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ETB {txAmt.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Fee (5%)</span>
                        <span className="font-mono font-bold text-rose-400">
                          -ETB {fee.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold block">Payable Net</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          ETB {netPayout.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Beneficiary & Banking Details Box */}
                    <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800/60 text-[11px]">
                        <span className="font-bold text-zinc-300">Beneficiary Information</span>
                        <span className="text-zinc-500">ID: {tx.userId || user.userId}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-500 block">Account Holder:</span>
                          <span className="font-bold text-white">
                            {tx.bankHolder || user.bankDetails.accountHolder || 'Nao Labera'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">User Contact:</span>
                          <span className="font-mono text-zinc-300">
                            {tx.userPhone || user.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Bank & Account:</span>
                          <span className="font-mono text-white font-bold">
                            {tx.bankName || user.bankDetails.bankName || 'Bank'}: {tx.accountNumber || (user.bankDetails.accountNumber ? `****${user.bankDetails.accountNumber.slice(-4)}` : 'N/A')}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">IFSC / UPI:</span>
                          <span className="font-mono text-amber-300">
                            {tx.ifscCode || tx.upiId || user.bankDetails.ifscCode || user.bankDetails.upiId || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Settlement Info / Notes if processed */}
                    {isSuccess && tx.utrNumber && (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-2.5 text-xs text-emerald-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold block">Verified UTR / Reference No.</span>
                          <span className="font-mono font-black text-white">{tx.utrNumber}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{tx.reviewedAt}</span>
                      </div>
                    )}

                    {isFailed && (
                      <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-2.5 text-xs text-rose-300">
                        <span className="text-[10px] text-rose-400 font-bold block">Rejection Reason (Refunded):</span>
                        <span>{tx.rejectReason || 'Information mismatch'}</span>
                      </div>
                    )}

                    {/* Admin Action Buttons (for Pending) */}
                    {isPending && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          id={`btn-verify-${tx.orderId}`}
                          onClick={() => openVerifyModal(tx)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={15} />
                          <span>VERIFY & APPROVE (ETB {(netPayout || 0).toFixed(2)})</span>
                        </button>

                        <button
                          id={`btn-reject-${tx.orderId}`}
                          onClick={() => openRejectModal(tx)}
                          className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle size={15} />
                          <span>Reject & Refund</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DEPOSIT SLIP AUDIT & VERIFICATION */}
      {/* ========================================================================= */}
      {adminSection === 'deposits' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Action Toolbar & Filters */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setDepositStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    depositStatusFilter === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Clock size={12} />
                  <span>Pending Confirmation ({allDeposits.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length})</span>
                </button>

                <button
                  onClick={() => setDepositStatusFilter('SUCCESS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    depositStatusFilter === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <CheckCircle size={12} />
                  <span>Confirmed ({allDeposits.filter(t => t.status === 'SUCCESS').length})</span>
                </button>

                <button
                  onClick={() => setDepositStatusFilter('FAILED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    depositStatusFilter === 'FAILED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <XCircle size={12} />
                  <span>Rejected ({allDeposits.filter(t => t.status === 'FAILED').length})</span>
                </button>

                <button
                  onClick={() => setDepositStatusFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    depositStatusFilter === 'ALL'
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  All ({allDeposits.length})
                </button>
              </div>

              {/* Export & Quick Sample Recharge Generator */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-zinc-900 border border-emerald-500/30 rounded-xl p-0.5 shadow-xs">
                  <button
                    id="btn-admin-export-deposits-excel"
                    onClick={() => {
                      const { count, fileName } = exportRechargeRecordsFile(filteredDeposits, depositStatusFilter, 'excel');
                      showToast(`Exported ${count} recharge records to Excel (${fileName})`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-emerald-500/20 active:scale-95 text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    title="Export recharge records to Excel (.csv)"
                  >
                    <Download size={11} />
                    <span>Excel</span>
                  </button>

                  <button
                    id="btn-admin-export-deposits-word"
                    onClick={() => {
                      const { count, fileName } = exportRechargeRecordsFile(filteredDeposits, depositStatusFilter, 'word');
                      showToast(`Exported ${count} recharge records to Word (${fileName})`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-emerald-500/20 active:scale-95 text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border-l border-zinc-800"
                    title="Export recharge records to Word (.doc)"
                  >
                    <span>Word</span>
                  </button>

                  <button
                    id="btn-admin-export-deposits-pdf"
                    onClick={() => {
                      const { count, fileName } = exportRechargeRecordsFile(filteredDeposits, depositStatusFilter, 'pdf');
                      showToast(`Generated PDF for ${count} recharge records`, 'success');
                    }}
                    className="px-2 py-1 hover:bg-rose-500/20 active:scale-95 text-rose-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border-l border-zinc-800"
                    title="Print / Save recharge records as PDF"
                  >
                    <span>PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => createMockRecharge(Math.floor(Math.random() * 15 + 5) * 100)}
                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  title="Generate sample user deposit slip"
                >
                  <Plus size={12} />
                  <span>+ Mock Deposit Slip</span>
                </button>
              </div>
            </div>

            {/* Provider Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-zinc-800/60 text-xs">
              <span className="text-[11px] text-zinc-500 font-bold whitespace-nowrap mr-1">Channel:</span>
              {[
                { key: 'ALL', label: 'All Channels' },
                { key: 'cbe', label: 'CBE Bank' },
                { key: 'awash', label: 'Awash Bank' },
                { key: 'telebirr', label: 'Telebirr' },
                { key: 'cbo', label: 'CBO Bank' }
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setDepositMethodFilter(p.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    depositMethodFilter === p.key
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-zinc-500" />
              <input
                id="input-search-deposits"
                type="text"
                value={depositSearchQuery}
                onChange={(e) => setDepositSearchQuery(e.target.value)}
                placeholder="Search by Slip No, Order ID, Bank / Channel, or Sender Account..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Deposit Slips List */}
          {filteredDeposits.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 space-y-2">
              <FileText size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm font-bold text-zinc-300">No deposit slips found</p>
              <p className="text-xs text-zinc-500">
                {depositSearchQuery ? 'Try matching another slip number or account query.' : 'Deposit slips submitted during recharge will appear here.'}
              </p>
              <button
                onClick={() => createMockRecharge(1500, 'CBE Bank')}
                className="mt-2 px-3.5 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-400"
              >
                Create Sample CBE Slip (ETB 1,500)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeposits.map((tx) => {
                const isPending = tx.status === 'PENDING' || tx.status === 'PROCESSING';
                const isSuccess = tx.status === 'SUCCESS';
                const isFailed = tx.status === 'FAILED';

                return (
                  <div
                    key={tx.id}
                    className={`bg-zinc-900 border rounded-3xl p-4 sm:p-5 space-y-3 transition-all shadow-md ${
                      isPending
                        ? 'border-amber-500/40 bg-zinc-900/90 shadow-amber-500/5'
                        : isSuccess
                        ? 'border-emerald-500/30'
                        : 'border-rose-500/30 bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold flex-shrink-0 ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <ArrowDownLeft size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white font-['Outfit']">
                            {tx.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-0.5">
                            <span>ID: #{tx.orderId}</span>
                            <button
                              onClick={() => handleCopy(tx.orderId, tx.orderId)}
                              className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                              title="Copy Order ID"
                            >
                              {copiedOrderId === tx.orderId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                            <span className="text-[10px] text-zinc-500">• {tx.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400 font-['Outfit'] block">
                          +ETB {(tx.amount || 0).toFixed(2)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                              : isSuccess
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {isPending && <Clock size={10} />}
                          {isSuccess && <CheckCircle size={10} />}
                          {isFailed && <XCircle size={10} />}
                          {tx.status}
                        </span>
                      </div>
                    </div>

                    {/* Verification & Slip Details Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Transfer Slip / Ref No:</span>
                          {tx.slipNo && (
                            <button
                              onClick={() => handleCopy(tx.slipNo!, tx.id)}
                              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedOrderId === tx.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                              <span>{copiedOrderId === tx.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                        <span className="font-mono font-black text-amber-300 text-sm block">
                          {tx.slipNo || 'NO-SLIP-PROVIDED'}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <span>Account deposited to:</span>
                          <span className="font-mono font-bold text-amber-300">
                            {tx.senderAccount || tx.accountNumber || tx.userPhone || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Payment Channel:</span>
                        <span className="font-bold text-white text-xs block">
                          {tx.verifyBy || tx.paymentMethod || 'CBE Bank / Telebirr'}
                        </span>
                        {tx.senderAccount && (
                          <span className="text-[11px] text-zinc-400 font-mono block">
                            Sender / Phone: {tx.senderAccount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Audit note / reason */}
                    {tx.details && (
                      <p className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                        {tx.details}
                      </p>
                    )}

                    {/* Admin Verification / Rejection Confirmation Buttons */}
                    {isPending && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          id={`btn-verify-recharge-${tx.orderId}`}
                          onClick={() => openVerifyRechargeModal(tx)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={15} />
                          <span>CONFIRM & CREDIT (+ETB {(tx.amount || 0).toFixed(2)})</span>
                        </button>

                        <button
                          id={`btn-reject-recharge-${tx.orderId}`}
                          onClick={() => openRejectRechargeModal(tx)}
                          className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle size={15} />
                          <span>Reject Slip</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: MINING & INVESTMENT PLANS MANAGEMENT */}
      {/* ========================================================================= */}
      {adminSection === 'plans' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header Action Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-['Outfit']">
                Active Mining Plans Inventory
              </h2>
              <p className="text-xs text-zinc-400">
                Total {plans.length} plan tiers active on the platform catalog
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetPlansToDefault}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700 flex items-center gap-1 cursor-pointer"
                title="Restore default 6 mining plans"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>

              <button
                id="btn-create-new-plan"
                onClick={openCreatePlanModal}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Create Plan</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="space-y-3">
            {plans.map((plan, index) => {
              const dailyRoiPercent = plan?.price ? (((plan.dailyIncome || 0) / plan.price) * 100).toFixed(2) : '0.00';
              const totalRoiPercent = plan?.price ? ((((plan.dailyIncome || 0) * (plan.cycleDays || 0)) / plan.price) * 100).toFixed(0) : '0';

              return (
                <div
                  key={plan.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Plan Image */}
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0 relative">
                      <img
                        src={plan.image}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {plan.tag && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-amber-500 text-black text-[8px] font-black uppercase">
                          {plan.tag}
                        </span>
                      )}
                    </div>

                    {/* Plan Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-white truncate font-['Outfit']">
                          {plan.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                          Tier #{index + 1}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 truncate">
                        {plan.subtitle ? `${plan.subtitle} • ` : ''}<span className="text-amber-400 font-medium">{plan.coffeeType}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Price</span>
                      <span className="font-mono font-bold text-white">ETB {plan.price}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Daily Yield</span>
                      <span className="font-mono font-bold text-emerald-400">+ETB {plan.dailyIncome}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Cycle</span>
                      <span className="font-mono font-bold text-zinc-300">{plan.cycleDays}d</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Total Return</span>
                      <span className="font-mono font-black text-amber-400">ETB {plan.dailyIncome * plan.cycleDays}</span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
                    <div className="text-[11px] text-zinc-400">
                      ROI: <strong className="text-emerald-400">{dailyRoiPercent}%/day</strong> • Total <strong className="text-amber-400">{totalRoiPercent}%</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${plan.title}"?`)) {
                            deletePlan(plan.id);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: USER & SYSTEM BALANCE MANAGER */}
      {/* ========================================================================= */}
      {adminSection === 'userManagement' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* User Account Snapshot */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    {user.displayName || 'Active Member'}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    ID: #{user.userId} • {user.phone}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                Active User
              </span>
            </div>

            {/* Balances grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Withdrawable Balance</span>
                <span className="font-mono font-black text-emerald-400 text-sm">ETB {(user?.balance || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Total Deposited</span>
                <span className="font-mono font-bold text-white text-sm">ETB {(user?.depositBalance || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Total Withdrawn</span>
                <span className="font-mono font-bold text-amber-400 text-sm">ETB {(user?.totalWithdrawn || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Balance Adjustment Form */}
            <form onSubmit={handleAdjustBalance} className="pt-2 border-t border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-300">
                Direct User Balance Adjustment (Credit / Debit)
              </h4>

              <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('credit')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceAdjustType === 'credit'
                      ? 'bg-emerald-500 text-black font-extrabold'
                      : 'text-zinc-400'
                  }`}
                >
                  + Credit Bonus / Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceAdjustType('debit')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    balanceAdjustType === 'debit'
                      ? 'bg-rose-500 text-white font-extrabold'
                      : 'text-zinc-400'
                  }`}
                >
                  - Debit Balance
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">ETB</span>
                  <input
                    type="number"
                    value={balanceAdjustAmount}
                    onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    min={1}
                    className="w-full pl-10 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <input
                  type="text"
                  value={balanceAdjustReason}
                  onChange={(e) => setBalanceAdjustReason(e.target.value)}
                  placeholder="Reason / Note for audit log"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBalanceAdjustAmount(val.toString())}
                    className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-300 hover:border-zinc-700 cursor-pointer"
                  >
                    ETB {val}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!balanceAdjustAmount || Number(balanceAdjustAmount) <= 0}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                APPLY {balanceAdjustType.toUpperCase()} (ETB {Number(balanceAdjustAmount || 0).toFixed(2)})
              </button>
            </form>
          </div>

          {/* System Rules Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-2 text-xs text-zinc-300">
            <h4 className="font-bold text-white">System Withdrawal Configuration</h4>
            <div className="space-y-1 text-zinc-400 text-[11px]">
              <p>• Minimum Withdrawal Threshold: <strong className="text-white font-mono">ETB 150.00</strong></p>
              <p>• System Payout Handling & Tax Fee: <strong className="text-white font-mono">5.0%</strong></p>
              <p>• Settlement Mode: <strong className="text-emerald-400">Admin Manual Verification & Disbursal</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VERIFY & APPROVE WITHDRAWAL */}
      {/* ========================================================================= */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-['Outfit']">
                    Verify & Approve Withdrawal
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Order #{verifyingOrder.orderId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setVerifyingOrder(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Payout Summary Box */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Gross Amount:</span>
                <span className="font-mono font-bold text-white">ETB {(verifyingOrder.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Fee (5%):</span>
                <span className="font-mono text-rose-400">-ETB {((verifyingOrder.amount || 0) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800 text-sm font-bold text-emerald-400">
                <span>Net Disbursal Amount:</span>
                <span className="font-mono font-black">ETB {((verifyingOrder.amount || 0) * 0.95).toFixed(2)}</span>
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3 text-xs space-y-1">
              <p className="text-[11px] text-zinc-400">
                <strong>Beneficiary:</strong> {verifyingOrder.bankHolder || 'User'} ({verifyingOrder.userPhone || user.phone})
              </p>
              <p className="text-[11px] text-zinc-400">
                <strong>Account / Phone:</strong> {verifyingOrder.bankName || 'Bank'} • {verifyingOrder.accountNumber || verifyingOrder.upiId || 'N/A'}
              </p>
              {verifyingOrder.ifscCode && (
                <p className="text-[11px] text-zinc-400">
                  <strong>Branch / Code:</strong> {verifyingOrder.ifscCode}
                </p>
              )}
            </div>

            {/* UTR Input Form */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Bank Reference / Disbursal TX Number:
                </label>
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. CBE-TX-928374829102"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Admin Verification Remark:
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Verification remark"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingOrder(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-verify-modal"
                type="button"
                onClick={handleConfirmVerify}
                className="flex-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                CONFIRM APPROVAL & DISBURSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT WITHDRAWAL & REFUND */}
      {/* ========================================================================= */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-['Outfit']">
                    Reject Withdrawal & Refund
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Order #{rejectingOrder.orderId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 space-y-1">
              <p className="font-bold">Automatic Balance Refund Notice:</p>
              <p className="text-[11px] text-rose-200/80">
                Rejecting this request will immediately refund <strong>ETB {(rejectingOrder.amount || 0).toFixed(2)}</strong> back to the user's withdrawable balance.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Select or Enter Reason for Rejection:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white mb-2 focus:outline-hidden focus:border-rose-500"
              >
                <option value="Invalid bank account / phone number mismatch">Invalid bank account / phone number mismatch</option>
                <option value="Telebirr account not active / KYC incomplete">Telebirr account not active / KYC incomplete</option>
                <option value="Account name mismatch with registered KYC">Account name mismatch with registered KYC</option>
                <option value="Bank system transfer failure / bounced back">Bank system transfer failure / bounced back</option>
                <option value="Duplicate withdrawal request">Duplicate withdrawal request</option>
              </select>

              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Custom reason description..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-reject-modal"
                type="button"
                onClick={handleConfirmReject}
                className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                CONFIRM REJECT & REFUND ETB {(rejectingOrder.amount || 0).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM RECHARGE & CREDIT USER BALANCE */}
      {/* ========================================================================= */}
      {verifyingRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-['Outfit']">
                    Confirm Deposit & Credit Balance
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Slip: {verifyingRecharge.slipNo || 'N/A'} • #{verifyingRecharge.orderId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setVerifyingRecharge(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Deposit Summary Box */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Recharge Amount:</span>
                <span className="font-mono font-black text-emerald-400 text-base">+ETB {(verifyingRecharge.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Channel:</span>
                <span className="font-bold text-white">{verifyingRecharge.verifyBy || 'CBE Bank / Telebirr'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Slip Number / Ref:</span>
                <span className="font-mono font-bold text-amber-300">{verifyingRecharge.slipNo}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Account deposited to:</span>
                <span className="font-mono text-amber-300 font-bold">{verifyingRecharge.senderAccount || verifyingRecharge.accountNumber || verifyingRecharge.userPhone || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-300">
              <p className="font-bold">Instant User Balance Credit:</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Confirming this slip will immediately add <strong>ETB {(verifyingRecharge.amount || 0).toFixed(2)}</strong> to the user's available balance and mark the deposit as completed.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Admin Confirmation Remark:
              </label>
              <input
                type="text"
                value={rechargeAdminNote}
                onChange={(e) => setRechargeAdminNote(e.target.value)}
                placeholder="e.g. Verified in CBE bank statement. Settled."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Confirm buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingRecharge(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-recharge-modal-submit"
                type="button"
                onClick={handleConfirmVerifyRecharge}
                className="flex-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                CONFIRM & CREDIT ETB {(verifyingRecharge.amount || 0).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REJECT RECHARGE SLIP */}
      {/* ========================================================================= */}
      {rejectingRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-['Outfit']">
                    Reject Deposit Slip
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Slip: {rejectingRecharge.slipNo || 'N/A'} • #{rejectingRecharge.orderId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRejectingRecharge(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 space-y-1">
              <p className="font-bold">Slip Rejection Notice:</p>
              <p className="text-[11px] text-rose-200/80">
                This deposit slip for <strong>ETB {(rejectingRecharge.amount || 0).toFixed(2)}</strong> will be marked as REJECTED. No funds will be credited to the account.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Select or Enter Reason for Slip Rejection:
              </label>
              <select
                value={rejectRechargeReason}
                onChange={(e) => setRejectRechargeReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white mb-2 focus:outline-hidden focus:border-rose-500"
              >
                <option value="Slip number not found in bank statement">Slip number not found in bank statement</option>
                <option value="Transfer amount does not match slip amount">Transfer amount does not match slip amount</option>
                <option value="Duplicate / reused slip number">Duplicate / reused slip number</option>
                <option value="Payment was sent to an outdated/invalid account">Payment was sent to an outdated/invalid account</option>
                <option value="Transfer rejected or reversed by bank">Transfer rejected or reversed by bank</option>
              </select>

              <input
                type="text"
                value={rejectRechargeReason}
                onChange={(e) => setRejectRechargeReason(e.target.value)}
                placeholder="Custom reason description..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRecharge(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-reject-recharge-modal"
                type="button"
                onClick={handleConfirmRejectRecharge}
                className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                CONFIRM REJECT SLIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE / EDIT MINING PLAN */}
      {/* ========================================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white my-8">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  <Coffee size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-['Outfit']">
                    {editingPlanId ? 'Edit Mining Plan' : 'Create New Mining Plan'}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Configure pricing, daily earnings, cycle duration, and coffee type
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              {/* Name & Title */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Plan Identifier:</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value, title: e.target.value })}
                    required
                    placeholder="e.g. Mining -7"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Badge Tag:</label>
                  <input
                    type="text"
                    value={planForm.tag}
                    onChange={(e) => setPlanForm({ ...planForm, tag: e.target.value })}
                    placeholder="e.g. HOT, STARTER, VIP"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Subtitle & Coffee Variety */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Machine Subtitle:</label>
                  <input
                    type="text"
                    value={planForm.subtitle}
                    onChange={(e) => setPlanForm({ ...planForm, subtitle: e.target.value })}
                    required
                    placeholder="e.g. Nitro Cold Brewer"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Coffee Variety:</label>
                  <input
                    type="text"
                    value={planForm.coffeeType}
                    onChange={(e) => setPlanForm({ ...planForm, coffeeType: e.target.value })}
                    required
                    placeholder="e.g. Geisha Reserve"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Price, Daily Income & Cycle Days */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Price (ETB):</label>
                  <input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    min={100}
                    required
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Daily Income (ETB):</label>
                  <input
                    type="number"
                    value={planForm.dailyIncome}
                    onChange={(e) => setPlanForm({ ...planForm, dailyIncome: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Cycle (Days):</label>
                  <input
                    type="number"
                    value={planForm.cycleDays}
                    onChange={(e) => setPlanForm({ ...planForm, cycleDays: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Power Rating & Description */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Power Rating:</label>
                  <input
                    type="text"
                    value={planForm.powerRating}
                    onChange={(e) => setPlanForm({ ...planForm, powerRating: e.target.value })}
                    placeholder="e.g. 4.5 kW / h"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Calculated Total (ETB):</label>
                  <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono font-black text-amber-400">
                    ETB {(Number(planForm.dailyIncome) * Number(planForm.cycleDays)).toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Description:</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  rows={2}
                  placeholder="Plan feature summary and details..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Image Presets Selector */}
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Machine Photo Preset:</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPlanForm({ ...planForm, image: img.url })}
                      className={`p-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        planForm.image === img.url
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="text-[10px] text-zinc-300 font-bold truncate">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Estimated Daily ROI:</span>
                  <span className="text-emerald-400 font-black font-mono">
                    {planForm.price > 0 ? ((planForm.dailyIncome / planForm.price) * 100).toFixed(2) : 0}% / day
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Total Net Profit:</span>
                  <span className="text-amber-400 font-black font-mono">
                    +ETB {Math.max(0, (planForm.dailyIncome * planForm.cycleDays) - planForm.price).toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Total ROI:</span>
                  <span className="text-white font-black font-mono">
                    {planForm.price > 0 ? (((planForm.dailyIncome * planForm.cycleDays) / planForm.price) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-plan-submit"
                  type="submit"
                  className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingPlanId ? 'UPDATE MINING PLAN' : 'CREATE MINING PLAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
