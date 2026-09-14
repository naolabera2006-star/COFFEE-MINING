import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserAccount,
  InvestmentPlan,
  ActiveMiningOrder,
  TransactionRecord,
  TeamMember,
  NavigationTab,
  BankDetails,
  Language,
  PropertyItem
} from '../types';
import { translations } from '../i18n/translations';
import {
  supabase,
  fetchPropertiesFromSupabase,
  createPropertyInSupabase,
  deletePropertyFromSupabase,
  fetchUserLikedPropertyIds,
  togglePropertyLikeInSupabase,
  getLocalProperties,
  getLocalUserLikes
} from '../lib/supabase';
import {
  INITIAL_PLANS,
  INITIAL_USER,
  INITIAL_TASKS,
  CHECK_IN_REWARDS,
  SAMPLE_GIFT_CODES
} from '../data/initialData';

const STORAGE_KEY_LANG = 'app_language';

interface AppContextType {
  user: UserAccount;
  isAuthenticated: boolean;
  plans: InvestmentPlan[];
  activeOrders: ActiveMiningOrder[];
  transactions: TransactionRecord[];
  teamMembers: TeamMember[];
  currentTab: NavigationTab;
  previousTab?: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  goBack: () => void;
  
  // Multilingual & Guides
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  selectedGuideSection: 'recharge' | 'commission' | 'withdrawal' | 'referral';
  
  // Auth actions
  loginWithGoogle: (email: string, name?: string, avatar?: string) => Promise<{ success: boolean; message: string }>;
  loginWithCredentials: (identifier: string, pass: string, role?: 'user' | 'admin') => Promise<{ success: boolean; message: string }>;
  registerUser: (identifier: string, pass: string, inviteCode?: string, name?: string) => Promise<{ success: boolean; message: string; requiresEmailConfirmation?: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void> | void;
  setUserRole: (role: 'user' | 'admin') => void;
  switchDemoAccount: (role: 'user' | 'admin') => void;
  
  // Modals & UI Controls
  activeModal: string | null;
  selectedPlan: InvestmentPlan | null;
  isAndroidFrame: boolean;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  
  openModal: (modalName: string, plan?: InvestmentPlan, guideSection?: 'recharge' | 'commission' | 'withdrawal' | 'referral') => void;
  closeModal: () => void;
  toggleAndroidFrame: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  
  // Core Financial & Investment Actions
  rechargeWallet: (
    amount: number,
    method: string,
    slipNo?: string,
    verifyBy?: string,
    senderAccount?: string
  ) => Promise<{ success: boolean; message: string }>;
  withdrawWallet: (
    amount: number,
    method: 'bank' | 'upi',
    customBankDetails?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  investInPlan: (
    planId: string,
    directSlipNo?: string,
    verifyBy?: string,
    senderAccount?: string
  ) => { success: boolean; message: string };
  harvestYield: (orderId: string) => { success: boolean; amount: number; message: string };
  harvestAllYields: () => { success: boolean; totalHarvested: number; message: string };
  claimPlanDailyYield: (planId: string) => { success: boolean; amount: number; message: string };
  
  // Admin Plan, Recharge & Withdrawal Management
  createPlan: (planData: Omit<InvestmentPlan, 'id'>) => { success: boolean; message: string };
  updatePlan: (id: string, planData: Partial<InvestmentPlan>) => { success: boolean; message: string };
  deletePlan: (id: string) => { success: boolean; message: string };
  togglePlanPermission: (id: string) => void;
  resetPlansToDefault: () => void;
  verifyRecharge: (orderId: string, adminNotes?: string) => { success: boolean; message: string };
  rejectRecharge: (orderId: string, reason: string) => { success: boolean; message: string };
  createMockRecharge: (amount: number, method?: string, slipNo?: string, userPhone?: string, userName?: string) => void;
  verifyWithdrawal: (orderId: string, utrNumber?: string, notes?: string) => { success: boolean; message: string };
  approveWithdrawal: (orderId: string, notes?: string) => { success: boolean; message: string };
  markWithdrawalAsPaid: (orderId: string, utrNumber?: string, notes?: string) => { success: boolean; message: string };
  rejectWithdrawal: (orderId: string, reason: string) => { success: boolean; message: string };
  updateUserBalance: (amountDelta: number, reason: string) => { success: boolean; message: string };
  createMockWithdrawal: (amount: number, userPhone?: string, userName?: string) => void;

  // Rewards & Team
  performDailyCheckIn: () => { success: boolean; amount: number; message: string };
  performCoffeeExtractionDraw: () => { success: boolean; amount: number; message: string; tier: string };
  claimInvitationTask: (taskId: string) => { success: boolean; amount: number; message: string };
  giftCodes: Record<string, number | { amount: number; expiresAt: number; createdAt?: number }>;
  generateRedeemCode: (code: string, amount: number) => { success: boolean; message: string };
  redeemGiftCode: (code: string) => { success: boolean; amount: number; message: string };
  saveBankDetails: (details: Partial<BankDetails>) => { success: boolean; message: string };
  simulateTeamMemberJoin: (level: 1 | 2 | 3, investAmount: number) => void;
  resetAllData: () => void;
  
  // Derived state
  pendingHarvestTotal: number;

  // Properties & Liked Items (Supabase-backed)
  properties: PropertyItem[];
  likedPropertyIds: string[];
  loadingProperties: boolean;
  loadProperties: () => Promise<void>;
  toggleLikeProperty: (propertyId: string) => Promise<{ liked: boolean; newCount: number }>;
  listProperty: (propertyData: Omit<PropertyItem, 'id' | 'createdAt' | 'likesCount' | 'userId'>) => Promise<{ success: boolean; message: string }>;
  deleteProperty: (propertyId: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'coffee_app_user_v1';
const STORAGE_KEY_ORDERS = 'coffee_app_orders_v1';
const STORAGE_KEY_TXS = 'coffee_app_txs_v1';
const STORAGE_KEY_TEAM = 'coffee_app_team_v1';
const STORAGE_KEY_FRAME = 'coffee_app_frame_mode';
const STORAGE_KEY_AUTH = 'coffee_app_is_authenticated_v1';
const STORAGE_KEY_PLANS = 'coffee_app_plans_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state (defaults to false so users land on Login/Signup screen)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Dynamic Investment Plans state
  const [plans, setPlans] = useState<InvestmentPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLANS);
    if (saved) {
      try {
        const parsed: InvestmentPlan[] = JSON.parse(saved);
        const legacySubtitles = [
          'Arabica Micro Extractor',
          'Espresso Bean Roaster Mk-II',
          'Commercial Barista Rig V3',
          'Industrial Roastery Station',
          'Coffee Plantation Processing Unit',
          'Global Export Coffee Consortium'
        ];
        return parsed.map(p => ({
          ...p,
          subtitle: p.subtitle && legacySubtitles.includes(p.subtitle) ? '' : (p.subtitle || '')
        }));
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PLANS;
  });

  // Load saved state or default
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_USER,
          ...parsed,
          avatarUrl: parsed.avatarUrl || INITIAL_USER.avatarUrl,
          balance: typeof parsed.balance === 'number' ? parsed.balance : INITIAL_USER.balance,
          depositBalance: typeof parsed.depositBalance === 'number' ? parsed.depositBalance : INITIAL_USER.depositBalance,
          totalReward: typeof parsed.totalReward === 'number' ? parsed.totalReward : INITIAL_USER.totalReward,
          totalWithdrawn: typeof parsed.totalWithdrawn === 'number' ? parsed.totalWithdrawn : INITIAL_USER.totalWithdrawn,
          activeStaked: typeof parsed.activeStaked === 'number' ? parsed.activeStaked : 0,
          totalRecharge: typeof parsed.totalRecharge === 'number' ? parsed.totalRecharge : 0,
          dailyEarnings: typeof parsed.dailyEarnings === 'number' ? parsed.dailyEarnings : 0,
          referralRewards: typeof parsed.referralRewards === 'number' ? parsed.referralRewards : 0,
          totalEarned: typeof parsed.totalEarned === 'number' ? parsed.totalEarned : 0,
          vipLevel: typeof parsed.vipLevel === 'number' ? parsed.vipLevel : 1,
          teamProfit: typeof parsed.teamProfit === 'number' ? parsed.teamProfit : 0,
          totalTeamSize: typeof parsed.totalTeamSize === 'number' ? parsed.totalTeamSize : 0,
          totalTeamRecharge: typeof parsed.totalTeamRecharge === 'number' ? parsed.totalTeamRecharge : 0,
          level1Count: typeof parsed.level1Count === 'number' ? parsed.level1Count : 0,
          level1Invest: typeof parsed.level1Invest === 'number' ? parsed.level1Invest : 0,
          level1Commission: typeof parsed.level1Commission === 'number' ? parsed.level1Commission : 0,
          level2Count: typeof parsed.level2Count === 'number' ? parsed.level2Count : 0,
          level2Invest: typeof parsed.level2Invest === 'number' ? parsed.level2Invest : 0,
          level2Commission: typeof parsed.level2Commission === 'number' ? parsed.level2Commission : 0,
          level3Count: typeof parsed.level3Count === 'number' ? parsed.level3Count : 0,
          level3Invest: typeof parsed.level3Invest === 'number' ? parsed.level3Invest : 0,
          level3Commission: typeof parsed.level3Commission === 'number' ? parsed.level3Commission : 0,
          checkInStreak: typeof parsed.checkInStreak === 'number' ? parsed.checkInStreak : 0,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER;
  });

  const [activeOrders, setActiveOrders] = useState<ActiveMiningOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TXS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'tx-recharge-sample-1',
        type: 'recharge',
        title: 'Recharge via Telebirr',
        amount: 1200,
        date: new Date(Date.now() - 25 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 25 * 60 * 1000,
        status: 'PENDING',
        orderId: 'RC84920194',
        slipNo: 'TB-98421048',
        verifyBy: 'Telebirr',
        paymentMethod: 'telebirr',
        senderAccount: '+251 911 482 910',
        userPhone: '+251 911 482 910',
        userEmail: 'bekele.tadesse@gmail.com',
        userId: 'f9210',
        details: 'Deposit Request of ETB 1200.00 via Telebirr • Slip No: TB-98421048 • Awaiting Admin Confirmation'
      },
      {
        id: 'tx-recharge-sample-2',
        type: 'recharge',
        title: 'Recharge via CBE Bank',
        amount: 3000,
        date: new Date(Date.now() - 50 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 50 * 60 * 1000,
        status: 'PENDING',
        orderId: 'RC50192841',
        slipNo: 'CBE-50192841',
        verifyBy: 'CBE Bank',
        paymentMethod: 'cbe',
        senderAccount: '1000 9821 0482',
        userPhone: '+251 922 849 104',
        userEmail: 'hiwot.kebede@gmail.com',
        userId: 'f3821',
        details: 'Deposit Request of ETB 3000.00 via CBE Bank • Slip No: CBE-50192841 • Awaiting Admin Confirmation'
      },
      {
        id: 'tx-withdraw-user-pending',
        type: 'withdraw',
        title: 'Withdrawal via Telebirr',
        amount: 450,
        date: new Date(Date.now() - 25 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 25 * 60 * 1000,
        status: 'PENDING',
        withdrawalStatus: 'PENDING',
        orderId: 'WD89104821',
        details: 'Gross: ETB 450.00, Fee: ETB 22.50, Net Payout: ETB 427.50 • Account: +251 911 234 567 (Telebirr) • Status: Pending Admin Verification',
        payoutMethod: 'telebirr',
        bankHolder: 'Verified User',
        bankName: 'Telebirr',
        accountNumber: '+251 911 234 567',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55'
      },
      {
        id: 'tx-withdraw-user-approved',
        type: 'withdraw',
        title: 'Withdrawal via CBE Bank',
        amount: 1200,
        date: new Date(Date.now() - 4 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 4 * 3600 * 1000,
        status: 'APPROVED',
        withdrawalStatus: 'APPROVED',
        approvedAt: new Date(Date.now() - 2 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        orderId: 'WD77391024',
        details: 'Gross: ETB 1200.00, Fee: ETB 60.00, Net Payout: ETB 1140.00 • Account: 1000 2938 1029 (CBE Bank) • Approved by Admin • Scheduled for settlement',
        payoutMethod: 'bank',
        bankHolder: 'Verified User',
        bankName: 'CBE Bank',
        accountNumber: '1000 2938 1029',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55'
      },
      {
        id: 'tx-withdraw-user-paid',
        type: 'withdraw',
        title: 'Withdrawal via Awash Bank',
        amount: 800,
        date: new Date(Date.now() - 26 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 26 * 3600 * 1000,
        status: 'SUCCESS',
        withdrawalStatus: 'PAID',
        approvedAt: new Date(Date.now() - 25 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        paidAt: new Date(Date.now() - 24 * 3600 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        utrNumber: 'UTR948201940281',
        orderId: 'WD66190284',
        details: 'Gross: ETB 800.00, Fee: ETB 40.00, Net Payout: ETB 760.00 • Account: 0130 9281 9201 (Awash Bank) • Paid & Settled (UTR: UTR948201940281)',
        payoutMethod: 'bank',
        bankHolder: 'Verified User',
        bankName: 'Awash Bank',
        accountNumber: '0130 9281 9201',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55'
      },
      {
        id: 'tx-withdraw-sample-1',
        type: 'withdraw',
        title: 'Withdrawal via Awash Bank',
        amount: 800,
        date: new Date(Date.now() - 35 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 35 * 60 * 1000,
        status: 'PENDING',
        withdrawalStatus: 'PENDING',
        orderId: 'WD94820194',
        details: 'Gross: ETB 800.00, Fee: ETB 40.00, Net Payout: ETB 760.00',
        payoutMethod: 'bank',
        bankHolder: 'Dawit Alemu',
        bankName: 'Awash Bank',
        accountNumber: '0130 9281 9201',
        userPhone: '+251 933 910 482',
        userEmail: 'dawit.alemu@gmail.com',
        userId: 'f7812'
      },
      {
        id: 'tx-withdraw-sample-2',
        type: 'withdraw',
        title: 'Withdrawal via CBO',
        amount: 1500,
        date: new Date(Date.now() - 15 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 15 * 60 * 1000,
        status: 'PENDING',
        withdrawalStatus: 'PENDING',
        orderId: 'WD78291038',
        details: 'Gross: ETB 1500.00, Fee: ETB 75.00, Net Payout: ETB 1425.00',
        payoutMethod: 'bank',
        bankHolder: 'Aster Yohannes',
        bankName: 'CBO',
        accountNumber: '1004 9281 0492',
        userPhone: '+251 944 102 938',
        userEmail: 'aster.yohannes@gmail.com',
        userId: 'f5509'
      },
      {
        id: 'tx-recharge-sample-verified',
        type: 'recharge',
        title: 'Recharge via Telebirr',
        amount: 600,
        date: new Date(Date.now() - 120 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 120 * 60 * 1000,
        status: 'SUCCESS',
        orderId: 'RC10928471',
        slipNo: 'TB-10928471',
        verifyBy: 'Telebirr',
        paymentMethod: 'telebirr',
        senderAccount: '+251 911 234 567',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55',
        details: 'Deposited ETB 600.00 to Main Coffee Balance • Verified Slip No: TB-10928471 • Confirmed & Credited by Admin'
      },
      {
        id: 'tx-withdraw-sample-rejected',
        type: 'withdraw',
        title: 'Withdrawal via CBE Bank',
        amount: 500,
        date: new Date(Date.now() - 180 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 180 * 60 * 1000,
        status: 'FAILED',
        withdrawalStatus: 'FAILED',
        orderId: 'WD49102849',
        payoutMethod: 'bank',
        bankHolder: 'Verified User',
        bankName: 'CBE Bank',
        accountNumber: '1000 4829 0184',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55',
        rejectReason: 'Bank account name does not match KYC profile name',
        details: 'Rejected: Bank account name does not match KYC profile name. ETB 500.00 refunded to wallet balance.'
      },
      {
        id: 'tx-recharge-sample-rejected',
        type: 'recharge',
        title: 'Recharge via CBE Bank',
        amount: 1000,
        date: new Date(Date.now() - 360 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 360 * 60 * 1000,
        status: 'FAILED',
        orderId: 'RC39201948',
        slipNo: 'CBE-INVALID-REF',
        verifyBy: 'CBE Bank',
        paymentMethod: 'cbe',
        senderAccount: '1000 8920 1849',
        userPhone: '+251 911 234 567',
        userEmail: 'naolabera2006@gmail.com',
        userId: 'f4r55',
        rejectReason: 'Invalid transaction slip / bank deposit reference not found',
        details: 'Deposit rejected: Invalid transaction slip / bank deposit reference not found by audit'
      },
      {
        id: 'tx-welcome-001',
        type: 'bonus',
        title: 'Platform Registration Bonus',
        amount: 0.0,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() - 3600000,
        status: 'SUCCESS',
        orderId: 'SYS' + Math.floor(100000 + Math.random() * 900000),
        details: 'Account successfully initialized with Coffee ID #f4r55'
      }
    ];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEAM);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved as Language) || 'en';
  });
  const [selectedGuideSection, setSelectedGuideSection] = useState<'recharge' | 'commission' | 'withdrawal' | 'referral'>('recharge');
  const [currentTab, setCurrentTabState] = useState<NavigationTab>('home');
  const [previousTab, setPreviousTab] = useState<NavigationTab>('home');

  const setCurrentTab = (tab: NavigationTab) => {
    setCurrentTabState((prev) => {
      if (prev !== tab) {
        setPreviousTab(prev);
      }
      return tab;
    });
  };

  const goBack = () => {
    setCurrentTabState((current) => {
      const target = previousTab && previousTab !== current ? previousTab : 'home';
      setPreviousTab('home');
      return target;
    });
  };
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [giftCodes, setGiftCodes] = useState<Record<string, number | { amount: number; expiresAt: number; createdAt?: number }>>(() => {
    const saved = localStorage.getItem('coffee_gift_codes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasValid = Object.values(parsed).some(
          (val: any) => val && typeof val === 'object' && val.expiresAt && val.expiresAt > Date.now()
        );
        if (hasValid) return parsed;
      } catch (e) {}
    }
    const defaultExpire = Date.now() + 5 * 60 * 1000;
    return {
      'COFFEE2026': { amount: 200, expiresAt: defaultExpire, createdAt: Date.now() },
      'BONUS200': { amount: 200, expiresAt: defaultExpire, createdAt: Date.now() }
    };
  });

  useEffect(() => {
    localStorage.setItem('coffee_gift_codes', JSON.stringify(giftCodes));
  }, [giftCodes]);

  // Request 1: Remove after 5 minutes Active Redeem Codes (Valid for 5 Minutes)
  useEffect(() => {
    const purgeInterval = setInterval(() => {
      const now = Date.now();
      setGiftCodes(prev => {
        let hasExpired = false;
        const remaining: Record<string, number | { amount: number; expiresAt: number; createdAt?: number }> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (val && typeof val === 'object' && 'expiresAt' in val && typeof val.expiresAt === 'number' && now >= val.expiresAt) {
            hasExpired = true; // Expired after 5 minutes, remove
          } else {
            remaining[key] = val as number | { amount: number; expiresAt: number; createdAt?: number };
          }
        }
        return hasExpired ? remaining : prev;
      });
    }, 1000);
    return () => clearInterval(purgeInterval);
  }, []);

  const generateRedeemCode = (code: string, amount: number): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a redeem code' };
    if (amount <= 0) return { success: false, message: 'Bonus amount must be greater than 0' };

    const expiresAt = Date.now() + 5 * 60 * 1000; // Active for 5 minutes only

    setGiftCodes(prev => ({
      ...prev,
      [cleanCode]: {
        amount,
        expiresAt,
        createdAt: Date.now()
      }
    }));

    showToast(`Redeem Code [${cleanCode}] for ETB ${amount.toFixed(2)} generated! Valid for user for 5 minutes.`, 'success');
    return { success: true, message: `Redeem code ${cleanCode} generated successfully (Valid for user for 5 minutes)` };
  };
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FRAME);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language]?.[key] || defaultText || key;
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(activeOrders));
  }, [activeOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FRAME, JSON.stringify(isAndroidFrame));
  }, [isAndroidFrame]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Supabase Auth listener & session restore on startup
  useEffect(() => {
    // Check initial active session from Supabase
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession notice:', error.message);
        return;
      }
      if (session?.user) {
        setIsAuthenticated(true);
        const email = session.user.email || '';
        const meta = session.user.user_metadata || {};
        const name = meta.display_name || meta.name || email.split('@')[0].replace(/[._]/g, ' ');
        const isAdmin = email.toLowerCase().includes('admin') || meta.role === 'admin';
        setUser((prev) => ({
          ...prev,
          email: email || prev.email,
          displayName: prev.displayName && prev.displayName !== 'Active Investor' ? prev.displayName : name,
          userId: session.user.id.slice(0, 8),
          supabaseUid: session.user.id,
          role: isAdmin ? 'admin' : prev.role,
          authProvider: 'email',
          isVerified: session.user.email_confirmed_at ? true : prev.isVerified,
        }));
      }
    });

    // Listen for auth changes (sign in, sign out, user updated)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        setIsAuthenticated(true);
        const email = session.user.email || '';
        const meta = session.user.user_metadata || {};
        const name = meta.display_name || meta.name || email.split('@')[0].replace(/[._]/g, ' ');
        const isAdmin = email.toLowerCase().includes('admin') || meta.role === 'admin';
        setUser((prev) => ({
          ...prev,
          email,
          displayName: name,
          role: isAdmin ? 'admin' : prev.role,
          userId: session.user.id.slice(0, 8),
          supabaseUid: session.user.id,
          authProvider: 'email',
          isVerified: true,
        }));
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /* ========================================================================= */
  /* PROPERTIES & USER LIKES (SUPABASE DATABASE)                              */
  /* ========================================================================= */
  const [properties, setProperties] = useState<PropertyItem[]>(() => getLocalProperties());
  const [likedPropertyIds, setLikedPropertyIds] = useState<string[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const fetched = await fetchPropertiesFromSupabase();
      setProperties(fetched);
    } catch {
      // Fallback already returned by helper
    } finally {
      setLoadingProperties(false);
    }
  };

  // Load properties on initial mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Sync user's liked properties whenever user or authentication state changes
  useEffect(() => {
    const userIdentifier = user.supabaseUid || user.userId || user.email;
    if (isAuthenticated && userIdentifier) {
      fetchUserLikedPropertyIds(userIdentifier).then(ids => {
        setLikedPropertyIds(ids);
      });
    } else {
      setLikedPropertyIds([]);
    }
  }, [isAuthenticated, user.supabaseUid, user.userId, user.email]);

  const toggleLikeProperty = async (propertyId: string): Promise<{ liked: boolean; newCount: number }> => {
    if (!isAuthenticated) {
      showToast('Please sign in to like and save properties', 'error');
      openModal('login');
      return { liked: false, newCount: 0 };
    }

    const userIdentifier = user.supabaseUid || user.userId || user.email || 'user';
    try {
      const result = await togglePropertyLikeInSupabase(propertyId, userIdentifier, user.email);
      if (result.liked) {
        setLikedPropertyIds(prev => Array.from(new Set([...prev, propertyId])));
        showToast('Property saved to your profile!', 'success');
      } else {
        setLikedPropertyIds(prev => prev.filter(id => id !== propertyId));
        showToast('Property removed from saved items', 'info');
      }

      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, likesCount: result.newCount } : p));
      return result;
    } catch (err: any) {
      showToast(err.message || 'Error updating like', 'error');
      return { liked: false, newCount: 0 };
    }
  };

  const listProperty = async (
    propertyData: Omit<PropertyItem, 'id' | 'createdAt' | 'likesCount' | 'userId'>
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) {
      showToast('Please sign in to list properties', 'error');
      openModal('login');
      return { success: false, message: 'Authentication required' };
    }

    const userIdentifier = user.supabaseUid || user.userId || user.email || 'user';
    try {
      const res = await createPropertyInSupabase({
        ...propertyData,
        userId: userIdentifier,
        userEmail: user.email,
        contactEmail: propertyData.contactEmail || user.email,
        contactPhone: propertyData.contactPhone || user.phone
      });

      if (res.success && res.data) {
        setProperties(prev => [res.data!, ...prev.filter(p => p.id !== res.data!.id)]);
        showToast(res.message || 'Property successfully listed in Supabase!', 'success');
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err: any) {
      showToast('Failed to list property', 'error');
      return { success: false, message: err.message || 'Failed to list property' };
    }
  };

  const deleteProperty = async (propertyId: string): Promise<{ success: boolean; message: string }> => {
    const userIdentifier = user.supabaseUid || user.userId || user.email || 'user';
    try {
      const ok = await deletePropertyFromSupabase(propertyId, userIdentifier);
      if (ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        setLikedPropertyIds(prev => prev.filter(id => id !== propertyId));
        showToast('Property listing removed', 'info');
        return { success: true, message: 'Property deleted' };
      }
      return { success: false, message: 'Failed to delete property' };
    } catch {
      return { success: false, message: 'Error deleting property' };
    }
  };

  // Suggestion 2 & Requests: User Balance & Today's Income Sync according to User Rules:
  // 1. Current Balance = sum of Recharged or invested + Bonus + Daily claimed for User role
  // 2. Today's Income = Total single daily claimed + daily bonus + Redeem code bonus for User role
  // 3. Today's Income = Total user invested or recharged for Admin role
  useEffect(() => {
    if (user.role === 'user') {
      const rechargedSum = transactions
        .filter(t => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const investedSum = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      const totalRechargedOrInvested = rechargedSum + investedSum;

      const totalBonus = transactions
        .filter(t => (t.type === 'bonus' || t.type === 'commission') && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalDailyClaimed = activeOrders.reduce((sum, o) => sum + (o.totalEarnedSoFar || 0), 0);

      const computedBalance = totalRechargedOrInvested + totalBonus + totalDailyClaimed;

      // 2. Today's Income equal Total single daily claimed plus daily bonus and Redeem code bonus for user role
      const totalSingleDailyClaimed = Math.max(
        totalDailyClaimed,
        transactions
          .filter(t => (t.type === 'income' || t.type === 'harvest' || t.type === 'daily_yield' || t.title?.toLowerCase().includes('harvest')) && t.status === 'SUCCESS')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
      );

      const totalDailyBonus = transactions
        .filter(t => t.type === 'bonus' && (t.title?.toLowerCase().includes('check-in') || t.title?.toLowerCase().includes('attendance') || t.orderId?.startsWith('CHK')) && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalRedeemCodeBonus = transactions
        .filter(t => t.type === 'bonus' && (t.title?.toLowerCase().includes('gift code') || t.title?.toLowerCase().includes('redeem') || t.orderId?.startsWith('GIFT')) && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const userTodayIncome = totalSingleDailyClaimed + totalDailyBonus + totalRedeemCodeBonus;

      if (
        Math.abs(user.balance - computedBalance) > 0.001 ||
        Math.abs((user.totalReward || 0) - (totalBonus + totalDailyClaimed)) > 0.001 ||
        Math.abs((user.dailyEarnings || 0) - userTodayIncome) > 0.001
      ) {
        setUser(prev => ({
          ...prev,
          balance: computedBalance,
          totalReward: totalBonus + totalDailyClaimed,
          dailyEarnings: userTodayIncome
        }));
      }
    } else if (user.role === 'admin') {
      // 3. Today's Income equal Total user invested or recharged for Admin role
      const adminRechargedSum = transactions
        .filter(t => (t.type === 'recharge' || Boolean(t.slipNo)) && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const adminInvestedSum = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0) +
        transactions.filter(t => t.type === 'investment' && t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0);

      const adminTotalRechargedOrInvested = adminRechargedSum + adminInvestedSum;

      if (Math.abs((user.dailyEarnings || 0) - adminTotalRechargedOrInvested) > 0.001) {
        setUser(prev => ({
          ...prev,
          dailyEarnings: adminTotalRechargedOrInvested
        }));
      }
    }
  }, [user.role, transactions, activeOrders]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Auth: Google Mail Sign-in
  const loginWithGoogle = async (
    email: string,
    name?: string,
    avatar?: string
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const formattedName =
          name ||
          email
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        const customAvatar =
          avatar ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

        setUser((prev) => ({
          ...prev,
          email: email,
          displayName: formattedName,
          avatarUrl: customAvatar,
          authProvider: 'google',
          isVerified: true,
        }));

        setIsAuthenticated(true);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        showToast(`Welcome back, ${formattedName}! Signed in with Google Mail.`, 'success');
        resolve({ success: true, message: 'Google Mail sign-in successful' });
      }, 700);
    });
  };

  // Auth: Standard Credentials Login via Supabase Auth
  const loginWithCredentials = async (
    identifier: string,
    pass: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<{ success: boolean; message: string }> => {
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !pass) {
      return { success: false, message: 'Please enter both login email and password' };
    }
    if (pass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters' };
    }

    // Quick Demo Admin & Investor Fast Pass for immediate testing
    if (cleanIdentifier === 'admin@coffee-invest.app' && pass === 'admin123') {
      setUser((prev) => ({
        ...prev,
        role: 'admin',
        email: cleanIdentifier,
        displayName: 'Platform Admin',
        authProvider: 'email',
        isVerified: true,
      }));
      setIsAuthenticated(true);
      showToast('Signed in as Platform Administrator (Demo Mode)', 'success');
      return { success: true, message: 'Login successful' };
    }
    if (cleanIdentifier === 'demo@coffee-invest.app' && pass === 'demo123') {
      setUser((prev) => ({
        ...prev,
        role: 'user',
        email: cleanIdentifier,
        displayName: 'Demo Investor',
        authProvider: 'email',
        isVerified: true,
      }));
      setIsAuthenticated(true);
      showToast('Signed in as Demo Investor', 'success');
      return { success: true, message: 'Login successful' };
    }

    // Direct Supabase Email Authentication
    try {
      const isEmail = cleanIdentifier.includes('@');
      const emailToUse = isEmail ? cleanIdentifier : `${cleanIdentifier.replace(/\+/g, '').replace(/\s+/g, '')}@coffeemining.app`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: pass,
      });

      if (error) {
        console.warn('Supabase sign-in error:', error);
        return {
          success: false,
          message: error.message || 'Invalid email or password. Please try again.'
        };
      }

      if (data.session && data.user) {
        const userMeta = data.user.user_metadata || {};
        const isUserAdmin = userMeta.role === 'admin' || emailToUse.toLowerCase().includes('admin') || role === 'admin';
        const formattedName = userMeta.display_name || emailToUse.split('@')[0].replace(/[._]/g, ' ');

        setUser((prev) => ({
          ...prev,
          role: isUserAdmin ? 'admin' : 'user',
          email: data.user.email || emailToUse,
          displayName: formattedName,
          authProvider: 'email',
          userId: data.user.id.slice(0, 8),
          isVerified: true,
        }));

        setIsAuthenticated(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        showToast(`Welcome back, ${formattedName}! Signed in successfully.`, 'success');
        return { success: true, message: 'Login successful' };
      }

      return { success: false, message: 'Unable to retrieve session from Supabase.' };
    } catch (err: any) {
      console.error('Supabase signIn catch error:', err);
      return { success: false, message: err?.message || 'Authentication failed. Please check network connection.' };
    }
  };

  // Auth: Set User Role
  const setUserRole = (newRole: 'user' | 'admin') => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
    }));
    showToast(`Switched active role to ${newRole === 'admin' ? 'Administrator' : 'Standard Investor (User)'}`, 'info');
  };

  // Quick Demo Account Switcher
  const switchDemoAccount = (targetRole: 'user' | 'admin') => {
    if (targetRole === 'admin') {
      setUser((prev) => ({
        ...prev,
        role: 'admin',
        displayName: 'Platform Admin',
        email: 'admin@coffee-invest.app',
      }));
      showToast('Switched to Administrator account with full platform management access.', 'success');
    } else {
      setUser((prev) => ({
        ...prev,
        role: 'user',
        displayName: prev.displayName.replace('Admin (', '').replace(')', '') || 'Active Investor',
      }));
      showToast('Switched to Active Investor (User Role). Ready to invest, harvest, recharge & withdraw.', 'success');
    }
  };

  // Auth: Registration with Supabase Email Auth
  const registerUser = async (
    identifier: string,
    pass: string,
    inviteCode: string = 'CMARJT5',
    name?: string
  ): Promise<{ success: boolean; message: string; requiresEmailConfirmation?: boolean }> => {
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !pass) {
      return { success: false, message: 'Please complete all required fields' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters (Supabase requirement)' };
    }

    const isEmail = cleanIdentifier.includes('@');
    const emailToUse = isEmail ? cleanIdentifier : `${cleanIdentifier.replace(/\+/g, '').replace(/\s+/g, '')}@coffeemining.app`;
    const formattedName = name?.trim() || (isEmail ? cleanIdentifier.split('@')[0].replace(/[._]/g, ' ') : `Investor ${cleanIdentifier.slice(-4)}`);
    const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const starterCredit = 100.0;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password: pass,
        options: {
          data: {
            display_name: formattedName,
            invite_code: newInviteCode,
            referred_by: inviteCode || 'CMARJT5',
            role: 'user',
          },
        },
      });

      if (error) {
        console.warn('Supabase signUp error:', error);
        return {
          success: false,
          message: error.message || 'Registration failed. Please check your credentials.'
        };
      }

      const hasSession = !!data.session;
      const newUser: UserAccount = {
        ...INITIAL_USER,
        userId: data.user?.id ? data.user.id.slice(0, 8) : 'f' + Math.floor(1000 + Math.random() * 9000),
        email: emailToUse,
        phone: isEmail ? '+251 98' + Math.floor(10000000 + Math.random() * 89999999) : cleanIdentifier,
        displayName: formattedName,
        inviteCode: newInviteCode,
        invitationUrl: `https://coffeemining.app/member/invitation/login&register?code=${newInviteCode}`,
        referredBy: inviteCode || undefined,
        authProvider: 'email',
        isVerified: hasSession,
        balance: starterCredit,
        totalReward: starterCredit,
      };

      const welcomeTx: TransactionRecord = {
        id: 'tx-' + Date.now(),
        type: 'bonus',
        title: 'Free Coffee Starter Credit',
        amount: starterCredit,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        status: 'SUCCESS',
        orderId: 'SYS' + Math.floor(100000 + Math.random() * 900000),
        details: inviteCode 
          ? `Account registered in Supabase & activated via invite [${inviteCode}] with ETB ${starterCredit.toFixed(2)} Free Starter Credit`
          : `Account registered in Supabase with ETB ${starterCredit.toFixed(2)} Free Starter Credit`,
      };

      setUser(newUser);
      setTransactions([welcomeTx]);
      setActiveOrders([]);
      setTeamMembers([]);

      if (hasSession) {
        setIsAuthenticated(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        showToast(`Account registered in Supabase! ETB 100.00 Free Coffee Starter Credit added.`, 'success');
        return { success: true, message: 'Registration successful!' };
      } else {
        // Confirmation email sent by Supabase
        showToast(`Account created! Verification email sent to ${emailToUse}.`, 'info');
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: `Account created! Supabase has sent a verification email to ${emailToUse}. Please check your inbox or spam folder to confirm your email, then Sign In.`,
        };
      }
    } catch (err: any) {
      console.error('Supabase signUp catch error:', err);
      return { success: false, message: err?.message || 'Failed to sign up with Supabase' };
    }
  };

  // Auth: Password Reset via Supabase
  const resetPasswordForEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, message: 'Please enter a valid email address' };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { success: false, message: error.message };
      }
      showToast(`Password reset email sent to ${cleanEmail} via Supabase!`, 'success');
      return { success: true, message: `Password reset instructions sent to ${cleanEmail}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send password reset request' };
    }
  };

  // Auth: Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    }
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(false));
    showToast('You have been signed out.', 'info');
  };

  const openModal = (
    modalName: string,
    plan?: InvestmentPlan,
    guideSection?: 'recharge' | 'commission' | 'withdrawal' | 'referral'
  ) => {
    if (plan) setSelectedPlan(plan);
    if (guideSection) setSelectedGuideSection(guideSection);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPlan(null);
  };

  const toggleAndroidFrame = () => {
    setIsAndroidFrame(prev => !prev);
  };

  // Calculate pending yield ready to harvest
  const pendingHarvestTotal = activeOrders.reduce((acc, order) => {
    const now = Date.now();
    const elapsedMinutes = (now - order.lastHarvestTimestamp) / 60000;
    // Provide continuous fraction of daily yield (or full if 24h passed)
    // 1 day = 1440 min
    const fraction = Math.min(1, elapsedMinutes / (24 * 60));
    return acc + (order.dailyIncome * fraction);
  }, 0);

  // 1. RECHARGE WALLET (Submits for Admin Confirmation)
  const rechargeWallet = async (
    amount: number,
    method: string,
    slipNo?: string,
    verifyBy?: string,
    senderAccount?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) {
      return { success: false, message: 'Invalid recharge amount' };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = 'RC' + Date.now().toString().slice(-8);
        const resolvedSlipNo = slipNo?.trim() || 'SLIP-' + Math.floor(10000000 + Math.random() * 90000000);
        const resolvedVerifyBy = verifyBy?.trim() || (method.toUpperCase() + ' Transfer Slip');

        const newTx: TransactionRecord = {
          id: 'tx-' + Date.now(),
          type: 'recharge',
          title: `Recharge via ${resolvedVerifyBy}`,
          amount: amount,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'PENDING',
          orderId: orderId,
          slipNo: resolvedSlipNo,
          verifyBy: resolvedVerifyBy,
          paymentMethod: method,
          senderAccount: senderAccount?.trim(),
          userPhone: user.phone,
          userEmail: user.email,
          userId: user.userId,
          details: `Recharge Request of ETB ${amount.toFixed(2)} submitted • Channel: ${resolvedVerifyBy} • Slip No: ${resolvedSlipNo} • Awaiting Admin Confirmation`
        };

        setTransactions(prev => [newTx, ...prev]);

        showToast(`Recharge request of ETB ${amount.toFixed(2)} submitted! Awaiting Admin confirmation.`, 'info');
        resolve({ success: true, message: `Recharge request with Slip No: ${resolvedSlipNo} submitted for admin verification.` });
      }, 500);
    });
  };

  // 2. WITHDRAW WALLET
  const withdrawWallet = async (
    amount: number,
    method: 'bank' | 'upi',
    customBankDetails?: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid withdrawal amount' };
    }
    if (amount > user.balance) {
      return { success: false, message: 'Insufficient balance for withdrawal' };
    }

    const effectiveAccount = customBankDetails?.accountNumber?.trim() || user.bankDetails.accountNumber;
    const effectiveBank = customBankDetails?.bankName?.trim() || user.bankDetails.bankName || 'Direct Bank';
    const effectiveHolder = customBankDetails?.accountHolder?.trim() || user.bankDetails.accountHolder || user.name || 'Account Holder';

    if (!effectiveAccount) {
      return { success: false, message: 'Please enter your bank account number' };
    }

    const fee = amount * 0.05; // 5% handling fee
    const payout = amount - fee;
    const orderId = 'WD' + Date.now().toString().slice(-8);

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'withdraw',
      title: `Withdrawal via ${effectiveBank}`,
      amount: amount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'PENDING',
      withdrawalStatus: 'PENDING',
      orderId: orderId,
      details: `Gross: ETB ${amount.toFixed(2)}, Fee: ETB ${fee.toFixed(2)}, Net Payout: ETB ${payout.toFixed(2)} • Account: ${effectiveAccount} (${effectiveBank}) • Awaiting Admin Approval`,
      payoutMethod: method,
      bankHolder: effectiveHolder,
      bankName: effectiveBank,
      accountNumber: effectiveAccount,
      ifscCode: user.bankDetails.ifscCode,
      upiId: user.bankDetails.upiId,
      userPhone: user.phone,
      userEmail: user.email,
      userId: user.userId
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
      bankDetails: {
        ...prev.bankDetails,
        bankName: effectiveBank,
        accountNumber: effectiveAccount,
        accountHolder: effectiveHolder,
        isBound: true
      }
    }));

    setTransactions(prev => [newTx, ...prev]);

    showToast(`Withdrawal request for ETB ${amount.toFixed(2)} submitted! Sent for Admin Approval.`, 'info');
    return { success: true, message: 'Withdrawal submitted for Admin Approval' };
  };

  // 3. INVEST IN PLAN
  const investInPlan = (
    planId: string,
    directSlipNo?: string,
    verifyBy?: string,
    senderAccount?: string
  ): { success: boolean; message: string } => {
    const plan = plans.find(p => p.id === planId) || INITIAL_PLANS.find(p => p.id === planId);
    if (!plan) return { success: false, message: 'Plan not found' };

    const cleanSlip = directSlipNo?.trim();
    const cleanAccount = senderAccount?.trim() || user.bankDetails?.accountNumber || user.phone;
    const orderId = 'MINING' + Date.now().toString().slice(-6);

    // If slip is provided, submit for Admin Approval
    if (cleanSlip) {
      const newTx: TransactionRecord = {
        id: 'tx-' + Date.now(),
        type: 'investment',
        title: `Invest: ${plan.title}`,
        amount: plan.price,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        status: 'PENDING',
        orderId: orderId,
        slipNo: cleanSlip,
        accountNumber: cleanAccount,
        bankName: verifyBy || 'Bank Transfer',
        planId: plan.id,
        userPhone: user.phone,
        userName: user.displayName || user.phone,
        details: `Investment in ${plan.title} • Deposit Slip: ${cleanSlip} • Account: ${cleanAccount} • Awaiting Admin Confirmation`
      };

      setTransactions(prev => [newTx, ...prev]);

      showToast(`Investment slip for ${plan.title} submitted! Sent to Admin for verification and activation.`, 'info');
      closeModal();
      return { success: true, message: `Investment slip submitted to Admin for approval!` };
    }

    // Direct wallet activation if no slip required
    const planPrice = plan?.price || 0;
    const currentBalance = user?.balance || 0;
    if (currentBalance < planPrice) {
      openModal('recharge');
      return { success: false, message: `Insufficient balance. Recharge ETB ${(planPrice - currentBalance).toFixed(2)} more.` };
    }

    const newOrder: ActiveMiningOrder = {
      id: 'order-' + Date.now(),
      planId: plan.id,
      title: plan.title,
      image: plan.image,
      price: planPrice,
      dailyIncome: plan?.dailyIncome || 0,
      purchaseDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      purchaseTimestamp: Date.now(),
      cycleDays: plan?.cycleDays || 0,
      daysCompleted: 0,
      totalEarnedSoFar: 0,
      lastHarvestTimestamp: Date.now(),
      status: 'ACTIVE'
    };

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'investment',
      title: `Activated ${plan.title} Coffee Miner`,
      amount: planPrice,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: orderId,
      planId: plan.id,
      details: `Daily Yield: ETB ${(plan?.dailyIncome || 0).toFixed(2)} for ${plan?.cycleDays || 0} Days`
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance - plan.price,
      activeStaked: prev.activeStaked + plan.price
    }));

    setActiveOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });

    showToast(`Successfully invested in ${plan.title}! Daily profit started.`, 'success');
    closeModal();
    return { success: true, message: `Activated ${plan.title} successfully!` };
  };

  // ---------------- ADMIN ACTIONS ---------------- //

  // Verify & Confirm User Recharge / Investment (Credits Balance or Activates Plan)
  const verifyRecharge = (orderId: string, adminNotes?: string): { success: boolean; message: string } => {
    const tx = transactions.find(t => t.orderId === orderId);
    if (!tx) return { success: false, message: 'Transaction not found' };
    if (tx.status === 'SUCCESS') return { success: false, message: 'Transaction is already confirmed' };

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // If this is an investment order, activate the mining extractor for the user!
    if (tx.type === 'investment' || tx.planId) {
      const plan = plans.find(p => p.id === tx.planId) || INITIAL_PLANS.find(p => p.id === tx.planId);
      if (plan) {
        const newOrder: ActiveMiningOrder = {
          id: 'order-' + Date.now(),
          planId: plan.id,
          title: plan.title,
          image: plan.image,
          price: plan.price,
          dailyIncome: plan.dailyIncome,
          purchaseDate: dateStr,
          purchaseTimestamp: Date.now(),
          cycleDays: plan.cycleDays,
          daysCompleted: 0,
          totalEarnedSoFar: 0,
          lastHarvestTimestamp: Date.now(),
          status: 'ACTIVE'
        };
        setActiveOrders(prev => [newOrder, ...prev]);
        setUser(prev => ({
          ...prev,
          activeStaked: prev.activeStaked + plan.price,
          depositBalance: prev.depositBalance + plan.price
        }));
      }
    } else {
      // Credit user's wallet and deposit balance
      setUser(prev => ({
        ...prev,
        balance: prev.balance + tx.amount,
        depositBalance: prev.depositBalance + tx.amount
      }));
    }

    setTransactions(prev => prev.map(t => {
      if (t.orderId === orderId) {
        return {
          ...t,
          status: 'SUCCESS',
          reviewedAt: dateStr,
          adminNote: adminNotes || 'Deposit slip verified and approved by Admin',
          details: `${t.details.replace(' • Awaiting Admin Confirmation', '')} • Confirmed & Activated by Admin${adminNotes ? ` • Note: ${adminNotes}` : ''}`
        };
      }
      return t;
    }));

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Order [${orderId}] confirmed and activated by Admin!`, 'success');
    return { success: true, message: `Order confirmed and activated successfully.` };
  };

  // Reject User Recharge
  const rejectRecharge = (orderId: string, reason: string): { success: boolean; message: string } => {
    const tx = transactions.find(t => t.orderId === orderId);
    if (!tx) return { success: false, message: 'Recharge transaction not found' };
    if (tx.status === 'SUCCESS') return { success: false, message: 'Cannot reject already credited recharge' };
    if (tx.status === 'FAILED') return { success: false, message: 'Recharge is already rejected' };

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setTransactions(prev => prev.map(t => {
      if (t.orderId === orderId) {
        return {
          ...t,
          status: 'FAILED',
          rejectReason: reason || 'Invalid slip reference or amount mismatch',
          reviewedAt: dateStr,
          details: `${t.details.replace(' • Awaiting Admin Confirmation', '')} • Rejected by Admin: ${reason || 'Slip verification failed'}`
        };
      }
      return t;
    }));

    showToast(`Recharge [${orderId}] rejected. (Reason: ${reason || 'Slip verification failed'})`, 'info');
    return { success: true, message: 'Recharge rejected' };
  };

  // Create Mock Recharge Request for Admin Testing
  const createMockRecharge = (
    amount: number,
    method?: string,
    slipNo?: string,
    userPhone?: string,
    userName?: string
  ) => {
    const methods = ['CBE Bank', 'Awash Bank', 'Telebirr', 'CBO'];
    const prefixes: Record<string, string> = { 'CBE Bank': 'CBE-', 'Awash Bank': 'AWB-', 'Telebirr': 'TB-', 'CBO': 'CBO-' };
    const chosenMethod = method || methods[Math.floor(Math.random() * methods.length)];
    const prefix = prefixes[chosenMethod] || 'SLIP-';
    const orderId = 'RC' + Math.floor(10000000 + Math.random() * 90000000);
    const resolvedSlip = slipNo || prefix + Math.floor(10000000 + Math.random() * 90000000);
    const mockPhones = ['+251 911 482 910', '+251 922 849 104', '+251 933 910 482', '+251 944 102 938'];
    const mockNames = ['Bekele Tadesse', 'Hiwot Kebede', 'Dawit Alemu', 'Aster Yohannes'];
    const chosenPhone = userPhone || mockPhones[Math.floor(Math.random() * mockPhones.length)];
    const chosenName = userName || mockNames[Math.floor(Math.random() * mockNames.length)];

    const mockTx: TransactionRecord = {
      id: 'tx-' + Date.now() + Math.random().toString(36).substring(2, 6),
      type: 'recharge',
      title: `Recharge via ${chosenMethod}`,
      amount: amount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'PENDING',
      orderId: orderId,
      slipNo: resolvedSlip,
      verifyBy: chosenMethod,
      paymentMethod: chosenMethod.toLowerCase(),
      senderAccount: chosenPhone,
      userPhone: chosenPhone,
      userEmail: `${chosenName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      userId: 'f' + Math.floor(1000 + Math.random() * 9000),
      details: `Recharge Request of ETB ${amount.toFixed(2)} submitted • Channel: ${chosenMethod} • Slip No: ${resolvedSlip} • Awaiting Admin Confirmation`
    };

    setTransactions(prev => [mockTx, ...prev]);
    showToast(`New recharge deposit slip (${resolvedSlip}) added to Admin queue!`, 'info');
  };

  // Verify & Approve Withdrawal
  const verifyWithdrawal = (orderId: string, utrNumber?: string, notes?: string): { success: boolean; message: string } => {
    return markWithdrawalAsPaid(orderId, utrNumber, notes);
  };

  // Step 2 in Lifecycle: Approve Withdrawal (sets status to APPROVED)
  const approveWithdrawal = (orderId: string, notes?: string): { success: boolean; message: string } => {
    const tx = transactions.find(t => t.orderId === orderId);
    if (!tx) return { success: false, message: 'Withdrawal transaction not found' };
    if (tx.status === 'SUCCESS' || tx.withdrawalStatus === 'PAID') return { success: false, message: 'Withdrawal is already paid & settled' };
    if (tx.status === 'APPROVED' || tx.withdrawalStatus === 'APPROVED') return { success: false, message: 'Withdrawal is already approved' };

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setTransactions(prev => prev.map(t => {
      if (t.orderId === orderId) {
        return {
          ...t,
          status: 'APPROVED',
          withdrawalStatus: 'APPROVED',
          approvedAt: dateStr,
          reviewedAt: dateStr,
          details: `${t.details} • Approved by Admin (Ready for payment)${notes ? ` • Note: ${notes}` : ''}`
        };
      }
      return t;
    }));

    showToast(`Withdrawal [${orderId}] approved! Status updated to APPROVED.`, 'success');
    return { success: true, message: `Withdrawal [${orderId}] approved successfully` };
  };

  // Step 3 in Lifecycle: Mark Withdrawal as Paid / Disbursed (sets status to SUCCESS / PAID)
  const markWithdrawalAsPaid = (orderId: string, utrNumber?: string, notes?: string): { success: boolean; message: string } => {
    const tx = transactions.find(t => t.orderId === orderId);
    if (!tx) return { success: false, message: 'Withdrawal transaction not found' };
    if (tx.status === 'SUCCESS' || tx.withdrawalStatus === 'PAID') return { success: false, message: 'Withdrawal is already settled & paid' };

    const utr = utrNumber || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setTransactions(prev => prev.map(t => {
      if (t.orderId === orderId) {
        return {
          ...t,
          status: 'SUCCESS',
          withdrawalStatus: 'PAID',
          utrNumber: utr,
          paidAt: dateStr,
          reviewedAt: dateStr,
          approvedAt: t.approvedAt || dateStr,
          details: `${t.details} • Paid & Settled to Bank (UTR: ${utr})${notes ? ` • Note: ${notes}` : ''}`
        };
      }
      return t;
    }));

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Withdrawal [${orderId}] paid & settled! Ref/UTR: ${utr}`, 'success');
    return { success: true, message: `Withdrawal paid with UTR: ${utr}` };
  };

  // Reject Withdrawal & Refund Balance
  const rejectWithdrawal = (orderId: string, reason: string): { success: boolean; message: string } => {
    const tx = transactions.find(t => t.orderId === orderId);
    if (!tx) return { success: false, message: 'Withdrawal transaction not found' };
    if (tx.status === 'SUCCESS') return { success: false, message: 'Cannot reject already settled withdrawal' };
    if (tx.status === 'FAILED') return { success: false, message: 'Already rejected' };

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Refund amount back to user's balance
    const refundAmt = tx.amount || 0;
    setUser(prev => ({
      ...prev,
      balance: (prev?.balance || 0) + refundAmt,
      totalWithdrawn: Math.max(0, (prev?.totalWithdrawn || 0) - refundAmt)
    }));

    setTransactions(prev => prev.map(t => {
      if (t.orderId === orderId) {
        return {
          ...t,
          status: 'FAILED',
          rejectReason: reason || 'Information mismatch in bank or Telebirr account',
          reviewedAt: dateStr,
          details: `${t.details} • Rejected & Refunded: ${reason || 'Information mismatch'}`
        };
      }
      return t;
    }));

    showToast(`Withdrawal [${orderId}] rejected. ETB ${refundAmt.toFixed(2)} refunded to user balance.`, 'info');
    return { success: true, message: 'Withdrawal rejected and funds refunded to user' };
  };

  // Create Mock Sample Withdrawal for Testing
  const createMockWithdrawal = (amount: number, userPhone?: string, userName?: string) => {
    const fee = amount * 0.05;
    const payout = amount - fee;
    const orderId = 'WD' + Math.floor(10000000 + Math.random() * 90000000);
    const mockPhones = ['+251 911 482 910', '+251 922 849 104', '+251 933 910 482', '+251 944 102 938'];
    const mockNames = ['Bekele Tadesse', 'Hiwot Kebede', 'Dawit Alemu', 'Aster Yohannes'];
    const mockBanks = ['CBE Bank', 'Awash Bank', 'Telebirr', 'CBO'];

    const chosenPhone = userPhone || mockPhones[Math.floor(Math.random() * mockPhones.length)];
    const chosenName = userName || mockNames[Math.floor(Math.random() * mockNames.length)];
    const chosenBank = mockBanks[Math.floor(Math.random() * mockBanks.length)];

    const mockTx: TransactionRecord = {
      id: 'tx-' + Date.now() + Math.random().toString(36).substring(2, 6),
      type: 'withdraw',
      title: `Withdrawal via ${chosenBank}`,
      amount: amount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'PENDING',
      orderId: orderId,
      details: `Gross: ETB ${amount.toFixed(2)}, Fee: ETB ${fee.toFixed(2)}, Net Payout: ETB ${payout.toFixed(2)}`,
      payoutMethod: chosenBank === 'Telebirr' ? 'telebirr' : 'bank',
      bankHolder: chosenName,
      bankName: chosenBank,
      accountNumber: chosenBank === 'Telebirr' ? chosenPhone : '1000' + Math.floor(10000000 + Math.random() * 90000000),
      userPhone: chosenPhone,
      userEmail: `${chosenName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      userId: 'f' + Math.floor(1000 + Math.random() * 9000)
    };

    setTransactions(prev => [mockTx, ...prev]);
    showToast(`New withdrawal request of ETB ${amount.toFixed(2)} added to queue!`, 'info');
  };

  // 4. HARVEST SINGLE ORDER YIELD
  const harvestYield = (orderId: string): { success: boolean; amount: number; message: string } => {
    const order = activeOrders.find(o => o.id === orderId);
    if (!order) return { success: false, amount: 0, message: 'Mining machine not found' };

    const now = Date.now();
    const elapsedMinutes = (now - order.lastHarvestTimestamp) / 60000;
    
    // For demo enjoyment: minimum 1 minute gives fractional harvest, or simulated daily
    const harvestAmount = Math.max(1, Math.min(order.dailyIncome, +(order.dailyIncome * (elapsedMinutes / 1440) + (elapsedMinutes < 5 ? (order.dailyIncome * 0.1) : 0)).toFixed(2)));

    if (harvestAmount <= 0.1) {
      return { success: false, amount: 0, message: 'Coffee is still brewing! Check back shortly.' };
    }

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'income',
      title: `Daily Harvest: ${order.title}`,
      amount: harvestAmount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'HV' + Date.now().toString().slice(-6),
      details: `Harvested Coffee Extraction Yield ETB ${harvestAmount.toFixed(2)}`
    };

    setActiveOrders(prev =>
      prev.map(o => o.id === orderId ? {
        ...o,
        totalEarnedSoFar: o.totalEarnedSoFar + harvestAmount,
        lastHarvestTimestamp: now,
        lastClaimedDate: new Date().toDateString()
      } : o)
    );

    setUser(prev => ({
      ...prev,
      balance: prev.balance + harvestAmount,
      totalReward: prev.totalReward + harvestAmount
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });

    showToast(`Harvested ETB ${harvestAmount.toFixed(2)} from ${order.title}!`, 'success');
    return { success: true, amount: harvestAmount, message: `Collected ETB ${harvestAmount.toFixed(2)}` };
  };

  // 5. HARVEST ALL ACTIVE MINERS
  const harvestAllYields = (): { success: boolean; totalHarvested: number; message: string } => {
    if (activeOrders.length === 0) {
      return { success: false, totalHarvested: 0, message: 'No active coffee miners yet. Purchase a plan first!' };
    }

    let totalAmount = 0;
    const now = Date.now();

    activeOrders.forEach(order => {
      const elapsedMinutes = (now - order.lastHarvestTimestamp) / 60000;
      const amount = Math.max(1.5, +(order.dailyIncome * Math.min(1, Math.max(0.15, elapsedMinutes / 1440))).toFixed(2));
      totalAmount += amount;
    });

    totalAmount = +totalAmount.toFixed(2);

    if (totalAmount <= 0) {
      return { success: false, totalHarvested: 0, message: 'No pending yield to harvest right now.' };
    }

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'income',
      title: `Batch Coffee Harvest (${activeOrders.length} Miners)`,
      amount: totalAmount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'BATCH' + Date.now().toString().slice(-6),
      details: `Collected total dividends from all active coffee units.`
    };

    setActiveOrders(prev =>
      prev.map(o => ({
        ...o,
        totalEarnedSoFar: o.totalEarnedSoFar + (totalAmount / prev.length),
        lastHarvestTimestamp: now
      }))
    );

    setUser(prev => ({
      ...prev,
      balance: prev.balance + totalAmount,
      totalReward: prev.totalReward + totalAmount
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 }
    });

    showToast(`Collected total ETB ${totalAmount.toFixed(2)} from all miners!`, 'success');
    return { success: true, totalHarvested: totalAmount, message: `Collected ETB ${totalAmount.toFixed(2)}` };
  };

  // 5b. CLAIM DAILY YIELD FOR INVESTED PLAN
  const claimPlanDailyYield = (planId: string): { success: boolean; amount: number; message: string } => {
    const todayStr = new Date().toDateString();
    const planOrders = activeOrders.filter(o => o.planId === planId && o.status === 'ACTIVE');
    if (planOrders.length === 0) {
      return { success: false, amount: 0, message: 'No active mining unit found for this plan.' };
    }

    const unClaimedOrders = planOrders.filter(o => o.lastClaimedDate !== todayStr);
    if (unClaimedOrders.length === 0) {
      return { success: false, amount: 0, message: 'Daily yield already claimed for today! Return tomorrow.' };
    }

    const totalToClaim = unClaimedOrders.reduce((sum, o) => sum + (o.dailyIncome || 0), 0);
    const planTitle = unClaimedOrders[0]?.title || 'Coffee Miner';
    const now = Date.now();

    setActiveOrders(prev =>
      prev.map(o => {
        if (o.planId === planId && o.status === 'ACTIVE' && o.lastClaimedDate !== todayStr) {
          return {
            ...o,
            daysCompleted: (o.daysCompleted || 0) + 1,
            totalEarnedSoFar: (o.totalEarnedSoFar || 0) + o.dailyIncome,
            lastHarvestTimestamp: now,
            lastClaimedDate: todayStr
          };
        }
        return o;
      })
    );

    setUser(prev => ({
      ...prev,
      balance: prev.balance + totalToClaim,
      totalReward: (prev.totalReward || 0) + totalToClaim
    }));

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'income',
      title: `Daily Claim: ${planTitle}`,
      amount: totalToClaim,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'CLM' + Date.now().toString().slice(-6),
      details: `Daily Claimed Extraction Yield ETB ${totalToClaim.toFixed(2)}`
    };

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Claimed ETB ${totalToClaim.toFixed(2)} daily yield from ${planTitle}!`, 'success');
    return { success: true, amount: totalToClaim, message: `Claimed ETB ${totalToClaim.toFixed(2)}` };
  };

  // 6. DAILY CHECK-IN
  const performDailyCheckIn = (): { success: boolean; amount: number; message: string } => {
    const today = new Date().toDateString();
    if (user.lastCheckInDate === today) {
      return { success: false, amount: 0, message: 'You have already checked in today! Come back tomorrow.' };
    }

    const nextStreak = (user.checkInStreak % 7) + 1;
    const rewardObj = CHECK_IN_REWARDS.find(r => r.day === nextStreak) || CHECK_IN_REWARDS[0];
    const rewardAmount = rewardObj.reward;

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'bonus',
      title: `Day ${nextStreak} Check-in Bonus`,
      amount: rewardAmount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'CHK' + Date.now().toString().slice(-6),
      details: `Daily attendance streak: Day ${nextStreak}/7`
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance + rewardAmount,
      totalReward: prev.totalReward + rewardAmount,
      checkInStreak: nextStreak,
      lastCheckInDate: today
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Checked in! Received ETB ${rewardAmount.toFixed(2)} Day ${nextStreak} bonus.`, 'success');
    return { success: true, amount: rewardAmount, message: `Received ETB ${rewardAmount.toFixed(2)}!` };
  };

  // 6b. LUCKY COFFEE EXTRACTION DRAW
  const performCoffeeExtractionDraw = (): { success: boolean; amount: number; message: string; tier: string } => {
    const drawPrizes = [
      { amount: 15, tier: 'Yirgacheffe Roast Bonus', weight: 30 },
      { amount: 25, tier: 'Sidama Golden Bean Dividend', weight: 25 },
      { amount: 50, tier: 'Harar Rare Extraction', weight: 20 },
      { amount: 80, tier: 'Limu Supreme Pour-Over', weight: 12 },
      { amount: 100, tier: 'Kaffa Heirloom Jackpot', weight: 8 },
      { amount: 250, tier: 'Grand Geisha Extraction Tier', weight: 4 },
      { amount: 500, tier: 'Royal Ethiopian Coffee Master Prize', weight: 1 }
    ];

    const totalWeight = drawPrizes.reduce((acc, p) => acc + p.weight, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedPrize = drawPrizes[0];

    for (const prize of drawPrizes) {
      if (randomVal < prize.weight) {
        selectedPrize = prize;
        break;
      }
      randomVal -= prize.weight;
    }

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'bonus',
      title: `Lucky Coffee Extraction Draw [${selectedPrize.tier}]`,
      amount: selectedPrize.amount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'EXT' + Date.now().toString().slice(-6),
      details: `Extracted ${selectedPrize.tier} dividend prize.`
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance + selectedPrize.amount,
      totalReward: prev.totalReward + selectedPrize.amount
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.6 }
    });

    showToast(`Extracted ETB ${selectedPrize.amount.toFixed(2)} (${selectedPrize.tier})! Added to balance.`, 'success');
    return {
      success: true,
      amount: selectedPrize.amount,
      message: `Extracted ETB ${selectedPrize.amount.toFixed(2)}!`,
      tier: selectedPrize.tier
    };
  };

  // 7. CLAIM INVITATION TASK
  const claimInvitationTask = (taskId: string): { success: boolean; amount: number; message: string } => {
    const task = INITIAL_TASKS.find(t => t.id === taskId);
    if (!task) return { success: false, amount: 0, message: 'Task not found' };

    if (user.claimedTasks.includes(taskId)) {
      return { success: false, amount: 0, message: 'This task bonus has already been claimed!' };
    }

    if (user.level1Count < task.targetValidMembers) {
      return { success: false, amount: 0, message: `Need ${task.targetValidMembers - user.level1Count} more valid Level 1 members to claim.` };
    }

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'bonus',
      title: `Invitation Milestone Reward`,
      amount: task.rewardAmount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'TASK' + Date.now().toString().slice(-6),
      details: `Claimed reward for inviting ${task.targetValidMembers} valid team members.`
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance + task.rewardAmount,
      totalReward: prev.totalReward + task.rewardAmount,
      claimedTasks: [...prev.claimedTasks, taskId]
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });

    showToast(`Claimed ETB ${task.rewardAmount.toFixed(2)} milestone bonus!`, 'success');
    return { success: true, amount: task.rewardAmount, message: `Claimed ETB ${task.rewardAmount.toFixed(2)}!` };
  };

  // 8. REDEEM GIFT CODE
  const redeemGiftCode = (code: string): { success: boolean; amount: number; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, amount: 0, message: 'Please enter a code' };

    if (user.redeemedGiftCodes.includes(cleanCode)) {
      return { success: false, amount: 0, message: 'Code has already been redeemed by this account.' };
    }

    const rawCode = giftCodes[cleanCode] ?? SAMPLE_GIFT_CODES[cleanCode];
    if (!rawCode) {
      return { success: false, amount: 0, message: 'Invalid or non-existent gift code.' };
    }

    let reward = 0;
    let expiresAt: number | undefined;

    if (typeof rawCode === 'number') {
      reward = rawCode;
    } else if (typeof rawCode === 'object' && rawCode !== null) {
      reward = rawCode.amount;
      expiresAt = rawCode.expiresAt;
    }

    if (expiresAt && Date.now() > expiresAt) {
      setGiftCodes(prev => {
        const next = { ...prev };
        delete next[cleanCode];
        return next;
      });
      return { success: false, amount: 0, message: 'This redeem code has expired after 5 minutes and has been removed.' };
    }

    if (!reward || reward <= 0) {
      return { success: false, amount: 0, message: 'Invalid redeem code amount.' };
    }

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'bonus',
      title: `Gift Code Redeemed [${cleanCode}]`,
      amount: reward,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'GIFT' + Date.now().toString().slice(-6),
      details: `Redeemed promo voucher code: ${cleanCode}`
    };

    setUser(prev => ({
      ...prev,
      balance: prev.balance + reward,
      totalReward: prev.totalReward + reward,
      redeemedGiftCodes: [...prev.redeemedGiftCodes, cleanCode]
    }));

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 }
    });

    showToast(`Code redeemed! ETB ${reward.toFixed(2)} added to your wallet!`, 'success');
    return { success: true, amount: reward, message: `Redeemed ETB ${reward.toFixed(2)} successfully!` };
  };

  // 9. SAVE BANK DETAILS
  const saveBankDetails = (details: Partial<BankDetails>): { success: boolean; message: string } => {
    setUser(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        ...details,
        isBound: true
      }
    }));

    showToast('Bank details successfully saved and bound!', 'success');
    closeModal();
    return { success: true, message: 'Bank details saved successfully.' };
  };

  // 10. SIMULATE TEAM MEMBER REGISTRATION & INVESTMENT
  // Level 1 = 18% commission, Level 2 = 3%, Level 3 = 1%
  const simulateTeamMemberJoin = (level: 1 | 2 | 3, investAmount: number) => {
    const rate = level === 1 ? 0.18 : level === 2 ? 0.03 : 0.01;
    const commission = +(investAmount * rate).toFixed(2);
    const maskedPhone = `+91 ${Math.floor(7000000000 + Math.random() * 2999999999).toString().slice(0, 5)}*****`;

    const newMember: TeamMember = {
      id: 'member-' + Date.now(),
      phone: maskedPhone,
      level: level,
      joinDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalInvested: investAmount,
      commissionGenerated: commission,
      activePlan: investAmount >= 3000 ? 'Mining -3' : investAmount >= 1200 ? 'Mining -2' : 'Mining -1',
      status: 'ACTIVE'
    };

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: 'commission',
      title: `Level ${level} Team Commission (${(rate * 100).toFixed(0)}%)`,
      amount: commission,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'COMM' + Date.now().toString().slice(-6),
      details: `Received ${(rate * 100)}% commission from ${maskedPhone}'s ETB ${investAmount} plan investment.`
    };

    setTeamMembers(prev => [newMember, ...prev]);

    setUser(prev => {
      const newL1Count = level === 1 ? prev.level1Count + 1 : prev.level1Count;
      const newL1Invest = level === 1 ? prev.level1Invest + investAmount : prev.level1Invest;
      const newL1Comm = level === 1 ? prev.level1Commission + commission : prev.level1Commission;

      const newL2Count = level === 2 ? prev.level2Count + 1 : prev.level2Count;
      const newL2Invest = level === 2 ? prev.level2Invest + investAmount : prev.level2Invest;
      const newL2Comm = level === 2 ? prev.level2Commission + commission : prev.level2Commission;

      const newL3Count = level === 3 ? prev.level3Count + 1 : prev.level3Count;
      const newL3Invest = level === 3 ? prev.level3Invest + investAmount : prev.level3Invest;
      const newL3Comm = level === 3 ? prev.level3Commission + commission : prev.level3Commission;

      return {
        ...prev,
        balance: prev.balance + commission,
        teamProfit: prev.teamProfit + commission,
        totalReward: prev.totalReward + commission,
        totalTeamSize: prev.totalTeamSize + 1,
        totalTeamRecharge: prev.totalTeamRecharge + investAmount,
        level1Count: newL1Count,
        level1Invest: newL1Invest,
        level1Commission: newL1Comm,
        level2Count: newL2Count,
        level2Invest: newL2Invest,
        level2Commission: newL2Comm,
        level3Count: newL3Count,
        level3Invest: newL3Invest,
        level3Commission: newL3Comm
      };
    });

    setTransactions(prev => [newTx, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    showToast(`Level ${level} referral invested ETB ${investAmount}! You earned ETB ${commission.toFixed(2)} commission!`, 'success');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ORDERS);
    localStorage.removeItem(STORAGE_KEY_TXS);
    localStorage.removeItem(STORAGE_KEY_TEAM);
    setUser(INITIAL_USER);
    setActiveOrders([]);
    setTransactions([]);
    setTeamMembers([]);
    showToast('Reset account data to initial state.', 'info');
  };

  // Plan Management Handlers for Admin
  const createPlan = (planData: Omit<InvestmentPlan, 'id'>) => {
    const newId = 'plan-' + Date.now();
    const newPlan: InvestmentPlan = {
      id: newId,
      ...planData
    };
    setPlans(prev => [...prev, newPlan]);
    showToast(`Mining plan "${newPlan.title}" created successfully!`, 'success');
  };

  const updatePlan = (id: string, planData: Partial<InvestmentPlan>) => {
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, ...planData } : p)));
    showToast(`Mining plan updated successfully!`, 'success');
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast(`Mining plan removed from catalog.`, 'info');
  };

  const togglePlanPermission = (id: string) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isCurrentlyDisabled = p.permission === 'restricted' || p.isActive === false;
          const nextActive = isCurrentlyDisabled;
          const nextPermission = nextActive ? 'allowed' : 'restricted';
          showToast(`Plan "${p.title}" permission set to: ${nextActive ? 'Active (Allowed)' : 'Restricted (Disabled)'}`, 'info');
          return {
            ...p,
            isActive: nextActive,
            permission: nextPermission as 'allowed' | 'restricted'
          };
        }
        return p;
      })
    );
  };

  const resetPlansToDefault = () => {
    setPlans(INITIAL_PLANS);
    showToast(`Mining plans catalog reset to standard default tiers.`, 'info');
  };

  const updateUserBalance = (amount: number, type: 'credit' | 'debit', reason?: string) => {
    setUser(prev => {
      const newBal = type === 'credit' ? prev.balance + amount : Math.max(0, prev.balance - amount);
      return { ...prev, balance: newBal };
    });

    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      type: type === 'credit' ? 'bonus' : 'withdraw',
      title: reason || (type === 'credit' ? 'Admin Balance Credit' : 'Admin Balance Adjustment'),
      amount: amount,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'SUCCESS',
      orderId: 'AD' + Date.now().toString().slice(-6),
      details: `Manual balance adjustment by Administrator: ${reason || 'Direct adjustment'}`
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`User balance ${type === 'credit' ? 'credited' : 'debited'} by ETB ${amount.toFixed(2)}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        plans,
        activeOrders,
        transactions,
        teamMembers,
        currentTab,
        previousTab,
        setCurrentTab,
        goBack,
        language,
        setLanguage,
        t,
        selectedGuideSection,
        loginWithGoogle,
        loginWithCredentials,
        registerUser,
        resetPasswordForEmail,
        logout,
        setUserRole,
        switchDemoAccount,
        activeModal,
        selectedPlan,
        isAndroidFrame,
        toast,
        openModal,
        closeModal,
        toggleAndroidFrame,
        showToast,
        rechargeWallet,
        withdrawWallet,
        investInPlan,
        harvestYield,
        harvestAllYields,
        claimPlanDailyYield,
        createPlan,
        updatePlan,
        deletePlan,
        togglePlanPermission,
        resetPlansToDefault,
        verifyRecharge,
        rejectRecharge,
        createMockRecharge,
        verifyWithdrawal,
        approveWithdrawal,
        markWithdrawalAsPaid,
        rejectWithdrawal,
        updateUserBalance,
        createMockWithdrawal,
        performDailyCheckIn,
        performCoffeeExtractionDraw,
        claimInvitationTask,
        giftCodes,
        generateRedeemCode,
        redeemGiftCode,
        saveBankDetails,
        simulateTeamMemberJoin,
        resetAllData,
        pendingHarvestTotal,
        properties,
        likedPropertyIds,
        loadingProperties,
        loadProperties,
        toggleLikeProperty,
        listProperty,
        deleteProperty
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
