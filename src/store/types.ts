import { Expense, Person, TabScreen, AppCategory, ExpenseCategory, ClientProject, ProjectPayment } from '../types';

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
  | 'project_detail';

export interface UserSlice {
  userName: string;
  currencySymbol: string;
  selectedLanguage: 'en' | 'hi' | 'mr';
  firstRunStep: 'splash' | 'language' | 'onboarding' | 'main';
  autoCaptureEnabled: boolean;
  darkModeEnabled: boolean;
  businessTrackingEnabled: boolean;
  setFirstRunStep: (step: 'splash' | 'language' | 'onboarding' | 'main') => void;
  setUserName: (name: string) => Promise<void>;
  setSelectedLanguage: (lang: 'en' | 'hi' | 'mr') => Promise<void>;
  toggleAutoCapture: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleBusinessTracking: () => Promise<void>;
  resetOnboarding: () => void;
}

export interface UiSlice {
  activeTab: TabScreen;
  activeModal: ModalType | null;
  selectedPersonId: string | null;
  selectedProjectId: string | null;
  ledgerSubTab: 'personal' | 'projects';
  setLedgerSubTab: (tab: 'personal' | 'projects') => void;
  insightsSubTab: 'personal' | 'revenue';
  setInsightsSubTab: (tab: 'personal' | 'revenue') => void;
  editingExpense: Expense | null;
  setActiveTab: (tab: TabScreen) => void;
  openModal: (modal: ModalType, entityId?: string) => void;
  closeModal: () => void;
  setEditingExpense: (expense: Expense | null) => void;
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
}

export interface LedgerSlice {
  contacts: Person[];
  clientProjects: ClientProject[];
  addLedgerEntry: (personName: string, amount: number, direction: 'LENT' | 'BORROWED', note: string) => Promise<void>;
  settlePerson: (personId: string) => Promise<void>;
  loadPersonDetail: (personId: string) => Promise<void>;
  addClientProject: (
    project: { clientName: string; clientPhone?: string; projectTitle: string; totalValue: number; notes?: string },
    initialPayment?: number,
    addToIncome?: boolean
  ) => Promise<void>;
  addProjectPayment: (
    projectId: string,
    amount: number,
    note?: string,
    method?: ProjectPayment['method'],
    addToIncome?: boolean
  ) => Promise<void>;
  deleteClientProject: (projectId: string) => Promise<void>;
}

export interface SyncSlice {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  dashboardData: DashboardData | null;
  loadInitialData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export type AppState = UserSlice & UiSlice & ExpenseSlice & LedgerSlice & SyncSlice;
