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

export type TabScreen = 'home' | 'expenses' | 'ledger' | 'insights' | 'settings';

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

