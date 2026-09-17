import { Expense, Person, TabScreen, AppCategory, ExpenseCategory } from '../types';

export interface PendingNudge {
  id: string;
  amount: number;
  sourceApp: string;
  merchant: string;
  timestamp: string;
  suggestedCategory: ExpenseCategory;
}

export interface DashboardData {
  spentToday: number;
  spentYesterday: number;
  delta: string;
  insight: string;
  owedToYou: number;
  youOwe: number;
}

export type ModalType =
  | 'add_expense'
  | 'add_ledger'
  | 'person_detail'
  | 'language_select'
  | 'v2_automation'
  | 'manage_categories'
  | 'edit_expense';

export interface UserSlice {
  userName: string;
  currencySymbol: string;
  selectedLanguage: 'en' | 'hi' | 'mr';
  firstRunStep: 'splash' | 'language' | 'onboarding' | 'main';
  autoCaptureEnabled: boolean;
  darkModeEnabled: boolean;
  setFirstRunStep: (step: 'splash' | 'language' | 'onboarding' | 'main') => void;
  setUserName: (name: string) => Promise<void>;
  setSelectedLanguage: (lang: 'en' | 'hi' | 'mr') => Promise<void>;
  toggleAutoCapture: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  resetOnboarding: () => void;
}

export interface UiSlice {
  activeTab: TabScreen;
  activeModal: ModalType | null;
  selectedPersonId: string | null;
  editingExpense: Expense | null;
  setActiveTab: (tab: TabScreen) => void;
  openModal: (modal: ModalType, personId?: string) => void;
  closeModal: () => void;
  setEditingExpense: (expense: Expense | null) => void;
}

export interface ExpenseSlice {
  expenses: Expense[];
  categories: AppCategory[];
  pendingNudge: PendingNudge | null;
  triggerNudge: (data: {
    amount: number;
    sourceApp: string;
    merchant: string;
    timestamp?: string;
    suggestedCategory: ExpenseCategory;
  }) => void;
  saveNudgeExpense: (category: ExpenseCategory, customNote?: string) => Promise<void>;
  dismissNudge: () => void;
  toggleCategory: (id: string) => void;
  addCategory: (name: string, icon: string) => void;
  addExpense: (amount: number, category: Expense['category'], note: string, customDate?: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export interface LedgerSlice {
  contacts: Person[];
  addLedgerEntry: (personName: string, amount: number, direction: 'LENT' | 'BORROWED', note: string) => Promise<void>;
  settlePerson: (personId: string) => Promise<void>;
  loadPersonDetail: (personId: string) => Promise<void>;
}

export interface SyncSlice {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  dashboardData: DashboardData | null;
  loadInitialData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export type AppState = UserSlice & UiSlice & ExpenseSlice & LedgerSlice & SyncSlice;
