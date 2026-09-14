import { InvestmentPlan, InvitationTask, UserAccount } from '../types';

export const INITIAL_PLANS: InvestmentPlan[] = [
  {
    id: 'mining-1',
    miningIndex: 1,
    name: 'Mining -1',
    title: 'Mining -1',
    subtitle: '',
    price: 600,
    cycleDays: 90,
    dailyIncome: 35,
    totalReturn: 3150,
    coffeeType: 'Arabica Light Roast',
    powerRating: '0.8 kW / h',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    tag: 'STARTER',
    description: 'Entry-level compact coffee extraction unit generating steady daily harvest dividends.'
  },
  {
    id: 'mining-2',
    miningIndex: 2,
    name: 'Mining -2',
    title: 'Mining -2',
    subtitle: '',
    price: 1200,
    cycleDays: 90,
    dailyIncome: 70,
    totalReturn: 6300,
    coffeeType: 'Italian Dark Roast',
    powerRating: '1.6 kW / h',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&auto=format&fit=crop&q=80',
    tag: 'POPULAR',
    description: 'High-efficiency dual boiler extraction machine with consistent automated daily yield distribution.'
  },
  {
    id: 'mining-3',
    miningIndex: 3,
    name: 'Mining -3',
    title: 'Mining -3',
    subtitle: '',
    price: 3000,
    cycleDays: 90,
    dailyIncome: 176,
    totalReturn: 15840,
    coffeeType: 'Single Origin Specialty',
    powerRating: '3.5 kW / h',
    image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop&q=80',
    tag: 'HOT',
    description: 'Commercial scale triple-group automated espresso extractor with maximum daily brew output.'
  },
  {
    id: 'mining-4',
    miningIndex: 4,
    name: 'Mining -4',
    title: 'Mining -4',
    subtitle: '',
    price: 6000,
    cycleDays: 90,
    dailyIncome: 370,
    totalReturn: 33300,
    coffeeType: 'Bourbon & Geisha Blend',
    powerRating: '7.2 kW / h',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80',
    tag: 'HIGH YIELD',
    description: 'High-throughput fluidized-bed roaster delivering rapid returns and premium harvest revenue.'
  },
  {
    id: 'mining-5',
    miningIndex: 5,
    name: 'Mining -5',
    title: 'Mining -5',
    subtitle: '',
    price: 15000,
    cycleDays: 90,
    dailyIncome: 980,
    totalReturn: 88200,
    coffeeType: 'Blue Mountain Reserve',
    powerRating: '15.0 kW / h',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&auto=format&fit=crop&q=80',
    tag: 'VIP MASTER',
    description: 'Complete automated wet-mill processing facility maximizing estate-level recurring returns.'
  },
  {
    id: 'mining-6',
    miningIndex: 6,
    name: 'Mining -6',
    title: 'Mining -6',
    subtitle: '',
    price: 35000,
    cycleDays: 90,
    dailyIncome: 2450,
    totalReturn: 220500,
    coffeeType: 'Imperial Grand Cru Reserve',
    powerRating: '35.0 kW / h',
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&fit=crop&q=80',
    tag: 'ENTERPRISE',
    description: 'Flagship enterprise tier automated coffee production grid with supreme daily earnings.'
  }
];

export const INITIAL_TASKS: InvitationTask[] = [
  {
    id: 'task-1',
    title: 'Invite 3 valid members to earn ETB 80.00',
    targetValidMembers: 3,
    rewardAmount: 80,
    description: 'Claim rewards when your Level 1 members invest or purchase a plan.'
  },
  {
    id: 'task-2',
    title: 'Invite 5 valid members to earn ETB 160.00',
    targetValidMembers: 5,
    rewardAmount: 160,
    description: 'Reach 5 active Level 1 investors to unlock extra bonus dividend.'
  },
  {
    id: 'task-3',
    title: 'Invite 10 valid members to earn ETB 380.00',
    targetValidMembers: 10,
    rewardAmount: 380,
    description: 'Directly sponsor 10 members to earn massive gold tier bonus.'
  },
  {
    id: 'task-4',
    title: 'Invite 20 valid members to earn ETB 900.00',
    targetValidMembers: 20,
    rewardAmount: 900,
    description: 'Super team builder milestone with highest cash payout.'
  }
];

export const INITIAL_USER: UserAccount = {
  role: 'user',
  phone: '+251 911 234 567',
  email: 'naolabera2006@gmail.com',
  displayName: 'Nao Labera',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  authProvider: 'google',
  isVerified: true,
  userId: 'f4r55',
  inviteCode: '318g3wd752',
  invitationUrl: 'https://coffee-invest.app/member/invitation/login&register?code=318g3wd752',
  balance: 0.0,
  depositBalance: 0.0,
  totalReward: 0.0,
  totalWithdrawn: 0.0,
  activeStaked: 0.0,
  totalRecharge: 0.0,
  dailyEarnings: 0.0,
  referralRewards: 0.0,
  totalEarned: 0.0,
  vipLevel: 1,
  teamProfit: 0.0,
  totalTeamSize: 0,
  totalTeamRecharge: 0.0,
  
  level1Count: 0,
  level1Invest: 0.0,
  level1Commission: 0.0,
  
  level2Count: 0,
  level2Invest: 0.0,
  level2Commission: 0.0,
  
  level3Count: 0,
  level3Invest: 0.0,
  level3Commission: 0.0,
  
  checkInStreak: 0,
  lastCheckInDate: null,
  
  bankDetails: {
    isBound: false,
    accountHolder: '',
    bankName: 'CBE Bank',
    accountNumber: '',
    methodType: 'cbe',
    branchName: '',
    ifscCode: '',
    upiId: '',
    phoneLinked: '+251 911 234 567'
  },
  
  claimedTasks: [],
  redeemedGiftCodes: []
};

export const CHECK_IN_REWARDS = [
  { day: 1, reward: 10, label: 'Day 1' },
  { day: 2, reward: 15, label: 'Day 2' },
  { day: 3, reward: 20, label: 'Day 3' },
  { day: 4, reward: 30, label: 'Day 4' },
  { day: 5, reward: 40, label: 'Day 5' },
  { day: 6, reward: 60, label: 'Day 6' },
  { day: 7, reward: 120, label: 'Day 7 (Jackpot ☕)' },
];

export const SAMPLE_GIFT_CODES: Record<string, number | { amount: number; expiresAt: number; createdAt?: number }> = {
  'COFFEE2026': { amount: 200, expiresAt: Date.now() + 5 * 60 * 1000, createdAt: Date.now() },
  'BONUS200': { amount: 200, expiresAt: Date.now() + 5 * 60 * 1000, createdAt: Date.now() }
};
