import {
  Expense,
  Person,
  LedgerTransaction,
  TabScreen,
  AppCategory,
  ExpenseCategory,
  ClientProject,
  ProjectPayment,
  SplitBill,
  SplitParticipant,
} from '../types';

export interface PendingNudge {
  id: string;
  amount: number;
  sourceApp: string;
  merchant: string;
  timestamp: string;
  suggestedCategory: ExpenseCategory;
  createdAt?: number;
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
  | 'edit_expense'
  | 'profile_details'
  | 'add_project'
  | 'project_detail'
  | 'edit_ledger_entry'
  | 'add_split'
  | 'split_detail'
  | 'upi_qr';

export interface UserSlice {
  userName: string;
  userId: string | null;
  isAuthenticated: boolean;
  currencySymbol: string;
  selectedLanguage: 'en' | 'hi' | 'mr';
  firstRunStep: 'splash' | 'language' | 'onboarding' | 'auth' | 'main';
  hasCompletedOnboarding: boolean;
  autoCaptureEnabled: boolean;
  darkModeEnabled: boolean;
  businessTrackingEnabled: boolean;
  setFirstRunStep: (step: 'splash' | 'language' | 'onboarding' | 'auth' | 'main') => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setUserName: (name: string) => Promise<void>;
  setSelectedLanguage: (lang: 'en' | 'hi' | 'mr') => Promise<void>;
  toggleAutoCapture: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleBusinessTracking: () => Promise<void>;
  resetOnboarding: () => void;
  login: (name: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    password: string,
    businessTrackingEnabled?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

export interface UiSlice {
  activeTab: TabScreen;
  activeModal: ModalType | null;
  selectedPersonId: string | null;
  selectedProjectId: string | null;
  selectedSplitBillId: string | null;
  qrModalData: { upiId: string; name: string; amount: number; note: string } | null;
  ledgerSubTab: 'personal' | 'projects';
  setLedgerSubTab: (tab: 'personal' | 'projects') => void;
  insightsSubTab: 'personal' | 'revenue';
  setInsightsSubTab: (tab: 'personal' | 'revenue') => void;
  editingExpense: Expense | null;
  editingLedgerTxn: { personId: string; txn: LedgerTransaction } | null;
  authInitialMode: 'signin' | 'signup';
  setActiveTab: (tab: TabScreen) => void;
  openModal: (modal: ModalType, entityId?: string) => void;
  closeModal: () => void;
  setEditingExpense: (expense: Expense | null) => void;
  setEditingLedgerTxn: (data: { personId: string; txn: LedgerTransaction } | null) => void;
  setQrModalData: (data: { upiId: string; name: string; amount: number; note: string } | null) => void;
  setAuthInitialMode: (mode: 'signin' | 'signup') => void;
}

export interface ExpenseSlice {
  expenses: Expense[];
  categories: AppCategory[];
  pendingNudge: PendingNudge | null;
  pendingNudges: PendingNudge[];
  triggerNudge: (data: {
    id?: string;
    amount: number;
    sourceApp: string;
    merchant: string;
    timestamp?: string;
    suggestedCategory: ExpenseCategory;
    createdAt?: number;
  }) => void;
  saveNudgeExpense: (category: ExpenseCategory, customNote?: string) => Promise<void>;
  dismissNudge: () => void;
  toggleCategory: (id: string) => void;
  addCategory: (name: string, icon: string) => void;
  addExpense: (amount: number, category: Expense['category'], note: string, customDate?: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearAllExpenses: () => Promise<void>;
}

export interface LedgerSlice {
  contacts: Person[];
  clientProjects: ClientProject[];
  addLedgerEntry: (personName: string, amount: number, direction: 'LENT' | 'BORROWED', note: string) => Promise<void>;
  updateLedgerEntry: (
    personId: string,
    txnId: string,
    updates: {
      amount?: number;
      direction?: 'LENT' | 'BORROWED';
      note?: string;
      date?: string;
      personName?: string;
    }
  ) => Promise<void>;
  deleteLedgerEntry: (personId: string, txnId: string) => Promise<void>;
  deletePerson: (personId: string, personName?: string) => Promise<void>;
  settlePerson: (personId: string) => Promise<void>;
  loadPersonDetail: (personId: string) => Promise<void>;
  addClientProject: (
    project: { clientName: string; clientPhone?: string; projectTitle: string; totalValue: number; notes?: string },
    initialPayment?: number,
    addToIncome?: boolean,
    paymentDate?: string
  ) => Promise<void>;
  addProjectPayment: (
    projectId: string,
    amount: number,
    note?: string,
    method?: ProjectPayment['method'],
    addToIncome?: boolean,
    paymentDate?: string
  ) => Promise<void>;
  updateClientProject: (
    id: string,
    updates: Partial<ClientProject>
  ) => Promise<void>;
  updateProjectPayment: (
    projectId: string,
    paymentId: string,
    updates: {
      amount?: number;
      note?: string;
      method?: ProjectPayment['method'];
      recordedAsIncome?: boolean;
      date?: string;
    }
  ) => Promise<void>;
  deleteProjectPayment: (projectId: string, paymentId: string) => Promise<void>;
  deleteClientProject: (projectId: string) => Promise<void>;
}

export interface SplitSlice {
  splitBills: SplitBill[];
  activeSplitFilter: 'ALL' | 'YOU_OWE' | 'OWED_TO_YOU' | 'SETTLED';
  setActiveSplitFilter: (filter: 'ALL' | 'YOU_OWE' | 'OWED_TO_YOU' | 'SETTLED') => void;
  addSplitBill: (bill: Omit<SplitBill, 'id' | 'createdAt' | 'status'>, syncWithLedger?: boolean) => Promise<void>;
  settleSplitParticipant: (billId: string, participantId: string) => Promise<void>;
  deleteSplitBill: (billId: string) => Promise<void>;
  updateSplitBill: (billId: string, updates: Partial<SplitBill>) => Promise<void>;
}

export interface SyncSlice {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  dashboardData: DashboardData | null;
  loadInitialData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export type AppState = UserSlice & UiSlice & ExpenseSlice & LedgerSlice & SplitSlice & SyncSlice;
