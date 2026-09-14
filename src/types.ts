export interface UserAccount {
  role: 'user' | 'admin';
  phone: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'phone' | 'email';
  isVerified?: boolean;
  userId: string;
  inviteCode: string;
  invitationUrl: string;
  referredBy?: string; // Invite code from the sponsor/share link
  balance: number;            // Withdrawable / total active balance
  depositBalance: number;     // Total deposited amount
  totalReward: number;        // Accumulated rewards
  totalWithdrawn: number;
  activeStaked?: number;      // Capital invested in active extractors
  totalRecharge?: number;
  dailyEarnings?: number;
  referralRewards?: number;
  totalEarned?: number;
  vipLevel?: number;
  teamProfit: number;
  totalTeamSize: number;
  totalTeamRecharge: number;
  
  // Level Breakdown
  level1Count: number;
  level1Invest: number;
  level1Commission: number;
  
  level2Count: number;
  level2Invest: number;
  level2Commission: number;
  
  level3Count: number;
  level3Invest: number;
  level3Commission: number;
  
  // Daily check-in
  checkInStreak: number;
  lastCheckInDate: string | null;
  
  // Bank & UPI binding
  bankDetails: BankDetails;
  
  // Claimed task IDs
  claimedTasks: string[];
  redeemedGiftCodes: string[];
}

export type PaymentMethodType = 'cbe' | 'awash' | 'telebirr' | 'cbo';

export interface BankDetails {
  isBound: boolean;
  accountHolder: string;
  bankName: string; // 'CBE Bank' | 'Awash Bank' | 'Telebirr' | 'CBO'
  accountNumber: string; // Account number or Telebirr wallet phone
  methodType?: PaymentMethodType;
  branchName?: string;
  ifscCode?: string;
  upiId?: string;
  phoneLinked?: string;
}

export interface InvestmentPlan {
  id: string;
  miningIndex: number;
  name: string;
  title: string;
  subtitle?: string;
  price: number;
  cycleDays: number;
  dailyIncome: number;
  totalReturn: number;
  image: string;
  coffeeType: string;
  powerRating: string;
  tag?: string;
  description: string;
  isActive?: boolean;
  permission?: 'allowed' | 'restricted';
}

export interface ActiveMiningOrder {
  id: string;
  planId: string;
  title: string;
  image: string;
  price: number;
  dailyIncome: number;
  purchaseDate: string;
  purchaseTimestamp: number;
  cycleDays: number;
  daysCompleted: number;
  totalEarnedSoFar: number;
  lastHarvestTimestamp: number;
  lastClaimedDate?: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export type TransactionType = 'recharge' | 'withdraw' | 'income' | 'commission' | 'bonus' | 'investment';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  timestamp: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'PROCESSING' | 'APPROVED' | 'PAID';
  withdrawalStatus?: WithdrawalStatus;
  approvedAt?: string;
  paidAt?: string;
  orderId: string;
  details?: string;
  slipNo?: string;
  verifyBy?: string;
  senderAccount?: string;
  transferDate?: string;
  payoutMethod?: 'bank' | 'telebirr' | 'upi';
  paymentMethod?: string;
  bankHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  userPhone?: string;
  userEmail?: string;
  userId?: string;
  userName?: string;
  planId?: string;
  utrNumber?: string;
  adminNote?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface InvitationTask {
  id: string;
  title: string;
  targetValidMembers: number;
  rewardAmount: number;
  description: string;
}

export interface TeamMember {
  id: string;
  phone: string;
  level: 1 | 2 | 3;
  joinDate: string;
  totalInvested: number;
  commissionGenerated: number;
  activePlan: string;
  status: 'ACTIVE' | 'REGISTERED';
}

export type NavigationTab = 'home' | 'plans' | 'bonus' | 'report' | 'share' | 'mine' | 'admin';

export type Language = 'en' | 'am' | 'om';
