export type ExpenseCategory = 'Food' | 'Travel' | 'Grocery' | 'Fun' | 'Health' | 'Shopping' | 'Bills' | 'Custom' | string;

export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  enabled: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  customCategoryName?: string;
  icon: string;
  note: string;
  time: string;
  date?: string;
  dayGroup: 'Today' | 'Yesterday' | string;
  createdAt: string;
  source?: string;
}

export type LedgerDirection = 'LENT' | 'BORROWED';

export interface LedgerTransaction {
  id: string;
  note: string;
  date: string;
  amount: number; // positive number
  direction: LedgerDirection | 'SETTLED';
}

export interface Person {
  id: string;
  name: string;
  initial: string;
  lastDate: string;
  netBalance: number; // positive = they owe you (+₹1400), negative = you owe them (-₹900)
  status: 'pending' | 'settled';
  transactions: LedgerTransaction[];
}

export interface LanguageOption {
  code: 'en' | 'hi' | 'mr';
  native: string;
  roman: string;
}

export type TabScreen = 'home' | 'expenses' | 'split' | 'ledger' | 'insights' | 'settings';

export interface ProjectPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
  method?: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque';
  recordedAsIncome?: boolean;
}

export interface ClientProject {
  id: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  totalValue: number;
  payments: ProjectPayment[];
  status: 'in_progress' | 'payment_pending' | 'completed';
  dueDate?: string;
  createdAt: string;
  notes?: string;
}

export interface SplitParticipant {
  id: string;
  name: string;
  phone?: string;
  upiId?: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  isCurrentUser?: boolean;
}

export interface SplitBill {
  id: string;
  title: string;
  totalAmount: number;
  category: ExpenseCategory;
  date: string;
  paidBy: {
    participantId: string;
    name: string;
    isCurrentUser: boolean;
    upiId?: string;
  };
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  participants: SplitParticipant[];
  groupName?: string;
  groupId?: string;
  groupCode?: string;
  notes?: string;
  status: 'PENDING' | 'SETTLED';
  createdAt: string;
}

export interface GroupMember {
  id?: string;
  userId?: string | null;
  name: string;
  phone?: string;
  capitrackId?: string;
  role?: 'admin' | 'member';
  joinedAt?: string;
}

export interface SplitGroup {
  id: string;
  name: string;
  groupCode: string;
  category: 'trip' | 'home' | 'couple' | 'food' | 'project' | 'other';
  createdBy: string;
  members: GroupMember[];
  totalExpense: number;
  active: boolean;
  createdAt: string;
}

export interface RewardData {
  pointsBalance: number;
  referralCode: string;
  capitrackId: string;
  totalFriendsReferred: number;
  inviteUrl: string;
  referrals: Array<{
    id: string;
    name: string;
    points: number;
    date: string;
  }>;
  redemptionStatus: 'coming_soon' | 'active';
}


