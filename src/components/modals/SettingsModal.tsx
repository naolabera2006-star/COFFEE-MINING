import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/translations';
import {
  X,
  Globe,
  HelpCircle,
  CreditCard,
  TrendingUp,
  ArrowDownToLine,
  Share2,
  Headphones,
  LogOut,
  ChevronRight,
  Check,
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  User,
  Clock,
} from 'lucide-react';
import {
  generateTransactionsCSV,
  downloadCSVFile,
  downloadWordDocFile,
  printPDFReport,
} from '../../utils/exportUtils';

export const SettingsModal: React.FC = () => {
  const {
    closeModal,
    openModal,
    language,
    setLanguage,
    user,
    logout,
    showToast,
    transactions,
    setCurrentTab,
    t
  } = useApp();

  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'general' | 'reports'>('general');
  const [reportFilter, setReportFilter] = useState<'all' | 'recharge' | 'withdraw'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');

  const effectiveTab = isAdmin ? activeTab : 'general';

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    showToast(
      langCode === 'am'
        ? 'ቋንቋ ወደ አማርኛ ተቀይሯል'
        : langCode === 'om'
        ? 'Afaan gara Afaan Oromootti jijjiirameera'
        : `Language switched to ${langObj?.name || 'English'}`,
      'success'
    );
  };

  const openGuideSection = (section: 'recharge' | 'commission' | 'withdrawal' | 'referral') => {
    openModal('guide', undefined, section);
  };

  // Filter transactions for report export
  const reportTransactions = transactions.filter((tx) => {
    if (reportFilter !== 'all' && tx.type !== reportFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && (tx.status === 'PENDING' || tx.status === 'PROCESSING')) return true;
      return tx.status === statusFilter;
    }
    return true;
  });

  const handleExport = (format: 'excel' | 'word' | 'pdf') => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const prefix = reportFilter === 'recharge' ? 'Recharge_Deposits' : reportFilter === 'withdraw' ? 'Withdrawal_Payouts' : 'Financial_Statement';
    const fileName = `${prefix}_${statusFilter.toLowerCase()}_${dateStr}`;

    if (format === 'excel') {
      const csv = generateTransactionsCSV(reportTransactions, `Settings_Report_${reportFilter}`);
      downloadCSVFile(csv, `${fileName}.csv`);
      showToast(`Exported ${reportTransactions.length} records to Excel (${fileName}.csv)`, 'success');
    } else if (format === 'word') {
      downloadWordDocFile(reportTransactions, `MY COFFEE VIP Financial Statement (${reportFilter.toUpperCase()})`, `${fileName}.doc`);
      showToast(`Exported ${reportTransactions.length} records to Word (${fileName}.doc)`, 'success');
    } else if (format === 'pdf') {
      printPDFReport(reportTransactions, `MY COFFEE VIP Financial Statement (${reportFilter.toUpperCase()})`);
      showToast(`Generated PDF for ${reportTransactions.length} records`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700/60 text-emerald-400 flex items-center justify-center">
              {effectiveTab === 'general' ? <Globe size={18} /> : <FileSpreadsheet size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                {effectiveTab === 'general' ? t('settings', 'Settings & Preferences') : t('reportGenerator', 'Reports & Export Center')}
              </h2>
              <p className="text-xs text-zinc-400">
                {user.displayName || user.email || user.phone} • ID: <span className="text-emerald-400 font-mono">{user.userId}</span>
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

        {/* Tab Selector: General vs Reports (Visible only for Administrator accounts) */}
        {isAdmin && (
          <div className="px-4 pt-3 pb-1 bg-zinc-900/40 border-b border-zinc-800/60 flex gap-2">
            <button
              id="tab-settings-general"
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'general'
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Globe size={13} />
              <span>{t('preferencesAndGuides', 'Preferences & Guides')}</span>
            </button>

            <button
              id="tab-settings-reports"
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <FileSpreadsheet size={13} />
              <span>{t('reportGenerator', 'Report Generator')}</span>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {effectiveTab === 'reports' && isAdmin ? (
            /* REPORT GENERATOR SECTION */
            <div className="space-y-4">
              {/* Credentials Card */}
              <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User size={13} className="text-emerald-400" /> {t('loggedAccountInfo', 'Logged Account Info')}
                  </span>
                  <span className="text-[10px] text-zinc-400">{t('accountStatus', 'Status')}: <strong className="text-emerald-400">{t('verified', 'Verified')}</strong></span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9.5px] text-zinc-500 block">{t('loggedIdNo', 'Logged ID No')}</span>
                    <span className="font-mono font-bold text-emerald-400">{user.userId}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850">
                    <span className="text-[9.5px] text-zinc-500 block">{t('emailPhone', 'Email / Phone')}</span>
                    <span className="text-zinc-200 truncate block">{user.email || user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Report Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-400" />
                  <span>{t('selectStatementType', 'Select Statement Type')}</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: t('allRecords', 'All Records') },
                    { id: 'recharge', label: t('rechargeFiles', 'Recharge Files') },
                    { id: 'withdraw', label: t('withdrawalFiles', 'Withdrawal Files') }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setReportFilter(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        reportFilter === item.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-400" />
                  <span>{t('filterByStatus', 'Filter By Status')}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'ALL', label: t('statusAll', 'All') },
                    { id: 'SUCCESS', label: t('statusApproved', 'Approved') },
                    { id: 'PENDING', label: t('statusPending', 'Pending') },
                    { id: 'FAILED', label: t('statusRejected', 'Rejected') }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setStatusFilter(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                        statusFilter === item.id
                          ? 'bg-zinc-800 border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Buttons: Excel, Word & PDF */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Download size={14} className="text-emerald-400" />
                    <span>{t('downloadReport', 'Download Report')} ({reportTransactions.length})</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="btn-settings-export-excel"
                    onClick={() => handleExport('excel')}
                    className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/60 text-left transition-all group cursor-pointer flex flex-col justify-between active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1.5">
                      <FileSpreadsheet size={15} />
                    </div>
                    <span className="text-xs font-bold text-white block">Excel</span>
                    <span className="text-[9px] text-zinc-400 font-mono">.csv / .xlsx</span>
                  </button>

                  <button
                    id="btn-settings-export-word"
                    onClick={() => handleExport('word')}
                    className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/60 text-left transition-all group cursor-pointer flex flex-col justify-between active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1.5">
                      <FileText size={15} />
                    </div>
                    <span className="text-xs font-bold text-white block">Word</span>
                    <span className="text-[9px] text-zinc-400 font-mono">.doc Document</span>
                  </button>

                  <button
                    id="btn-settings-export-pdf"
                    onClick={() => handleExport('pdf')}
                    className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rose-500/60 text-left transition-all group cursor-pointer flex flex-col justify-between active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1.5">
                      <Printer size={15} />
                    </div>
                    <span className="text-xs font-bold text-white block">PDF</span>
                    <span className="text-[9px] text-zinc-400 font-mono">.pdf Print</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      closeModal();
                      setCurrentTab('report');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    {t('openFullReportTab', 'Open Full Financial Report Tab →')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GENERAL PREFERENCES & SETTINGS */
            <>
              {/* 1. Language Switcher (English, Oromo, Amharic) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-400" />
                    <span>{t('language', 'Language')} / ቋንቋ / Afaan</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-semibold">3 Supported</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                            <Check size={10} className="stroke-[3]" />
                          </div>
                        )}
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-xs font-bold font-['Outfit']">{lang.nativeName}</span>
                        <span className="text-[10px] text-zinc-400">{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. User Guides Quick Shortcuts */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-emerald-400" />
                  <span>{t('userGuide', 'User Guides & Tutorials')}</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Recharge Guide */}
                  <button
                    onClick={() => openGuideSection('recharge')}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all hover:bg-zinc-850 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <CreditCard size={14} />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{t('rechargeGuideTab', 'Recharge Guide')}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{language === 'am' ? 'በ CBE እና ቴሌብር ሙላ' : language === 'om' ? 'CBE fi Telebirr' : 'Deposit CBE & Telebirr'}</p>
                  </button>

                  {/* Commission Guide */}
                  <button
                    onClick={() => openGuideSection('commission')}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 text-left transition-all hover:bg-zinc-850 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <TrendingUp size={14} />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{t('commissionGuideTab', 'Commission Guide')}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">26% / 3% / 1% {language === 'am' ? 'የቡድን ኮሚሽን' : language === 'om' ? 'Koomishinii Garee' : 'Team tiers'}</p>
                  </button>

                  {/* Withdrawal Guide */}
                  <button
                    onClick={() => openGuideSection('withdrawal')}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all hover:bg-zinc-850 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <ArrowDownToLine size={14} />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{t('withdrawalGuideTab', 'Withdrawal Guide')}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">24/7 {language === 'am' ? 'የባንክ ክፍያ' : language === 'om' ? 'Kaffaltii Baankii' : 'Bank payouts'}</p>
                  </button>

                  {/* Referral Link Guide */}
                  <button
                    onClick={() => openGuideSection('referral')}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/40 text-left transition-all hover:bg-zinc-850 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Share2 size={14} />
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{t('referralGuideTab', 'Referral Link Guide')}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{language === 'am' ? 'የግብዣ ኮድ ማጋሪያ' : language === 'om' ? 'Koodii Affeerraa' : 'Invite code & sharing'}</p>
                  </button>
                </div>
              </div>

              {/* 3. Account & Service Rows */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    closeModal();
                    openModal('bank');
                  }}
                  className="w-full p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={15} className="text-emerald-400" />
                    <span>{t('bankAccount', 'Bank & Wallet Binding')}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500" />
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    openModal('support');
                  }}
                  className="w-full p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Headphones size={15} className="text-emerald-400" />
                    <span>{t('contactSupport', 'Customer Support (24/7)')}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500" />
                </button>
              </div>

              {/* 4. App Info & Logout */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="text-zinc-500 text-[11px]">
                  <span>{t('appVersion', 'Version')}: v2.5.0</span>
                </div>

                <button
                  onClick={() => {
                    closeModal();
                    logout();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  <span>{t('logout', 'Log Out')}</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
