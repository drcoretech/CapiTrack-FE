import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClientProject } from '../types';

export const CLOUD_API_URL = 'https://capitrack-be.vercel.app/api';

// Automatically detect host IP in local dev mode, or connect to cloud backend in standalone APKs.
export const getBaseUrl = () => {
  // 1. Production deployed URL from environment variable (.env) or EAS env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 2. Extra apiUrl from app.json across all Expo runtimes
  const extraApiUrl =
    (Constants.expoConfig as any)?.extra?.apiUrl ||
    (Constants as any).manifest?.extra?.apiUrl ||
    (Constants as any).manifest2?.extra?.expoClient?.extra?.apiUrl;
  if (extraApiUrl) {
    return extraApiUrl.replace(/\/+$/, '');
  }

  // 3. In local development with Metro (__DEV__), detect local machine IP
  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5001/api`;
      }
    }

    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/:\/\/([^:/]+)/);
      const ip = match ? match[1] : null;
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5001/api`;
      }
    }
  }

  // 4. Default for all standalone builds, APKs, and production: always live cloud backend!
  return CLOUD_API_URL;
};

export const API_BASE_URL = getBaseUrl();
console.log('[CapiTrack Network] Connected API Base URL:', API_BASE_URL);

let currentApiUser = 'Digvijay';
let currentDeviceId = '';
let currentApiToken = '';
let currentApiUserId = '';

export const getOrCreateDeviceId = async (): Promise<string> => {
  if (currentDeviceId) return currentDeviceId;
  try {
    const saved = await AsyncStorage.getItem('@capitrack_device_id');
    if (saved && saved.trim()) {
      currentDeviceId = saved.trim();
      return currentDeviceId;
    }
  } catch {}

  const newId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 11);
  currentDeviceId = newId;
  AsyncStorage.setItem('@capitrack_device_id', newId).catch(() => {});
  return newId;
};

// Initialize device ID in background immediately
getOrCreateDeviceId().catch(() => {});

export const setCurrentApiUser = (name: string) => {
  if (name && name.trim()) {
    currentApiUser = name.trim();
  }
};

export const setAuthSession = (token: string, userId: string, userName: string) => {
  if (token) currentApiToken = token.trim();
  if (userId) currentApiUserId = userId.trim();
  if (userName) currentApiUser = userName.trim();
};

export const clearAuthSession = () => {
  currentApiToken = '';
  currentApiUserId = '';
  currentApiUser = 'User';
};

export const getCurrentDeviceId = () => currentDeviceId;

// Generic fetch helper with forgiving timeout & graceful network handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  // 20s timeout to allow for serverless cloud cold-starts and slow mobile connections
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  if (!currentDeviceId) {
    await getOrCreateDeviceId();
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-name': currentApiUser,
        'x-device-id': currentDeviceId,
        ...(currentApiUserId ? { 'x-user-id': currentApiUserId } : {}),
        ...(currentApiToken ? { Authorization: `Bearer ${currentApiToken}` } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}: Request failed`);
    }
    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('cancelled')) {
      throw new Error('Server connection took too long. Please try again.');
    }
    throw err;
  }
}

export const api = {
  // Authentication
  signup: (data: {
    name: string;
    password: string;
    preferredLanguage?: string;
    businessTrackingEnabled?: boolean;
    deviceId?: string;
    referralCode?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      token: string;
      user: {
        id: string;
        name: string;
        capitrackId?: string;
        referralCode?: string;
        rewardPoints?: number;
        preferredLanguage: string;
        currencySymbol: string;
        preferences: {
          autoCaptureEnabled: boolean;
          darkMode: boolean;
          businessTrackingEnabled: boolean;
        };
      };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { name: string; password: string; deviceId?: string }) =>
    request<{
      success: boolean;
      message: string;
      token: string;
      user: {
        id: string;
        name: string;
        capitrackId?: string;
        referralCode?: string;
        rewardPoints?: number;
        preferredLanguage: string;
        currencySymbol: string;
        preferences: {
          autoCaptureEnabled: boolean;
          darkMode: boolean;
          businessTrackingEnabled: boolean;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{
      success: boolean;
      user: {
        id: string;
        name: string;
        capitrackId?: string;
        referralCode?: string;
        rewardPoints?: number;
        preferredLanguage: string;
        currencySymbol: string;
        preferences: {
          autoCaptureEnabled: boolean;
          darkMode: boolean;
          businessTrackingEnabled: boolean;
        };
      };
    }>('/auth/me'),

  // Health
  checkHealth: () => request<{ status: string; service: string }>('/health'),

  // Dashboard & Insights
  getDashboardSummary: () =>
    request<{
      success: boolean;
      userName: string;
      currency: string;
      spentToday: number;
      spentYesterday: number;
      delta: string;
      insight: string;
      owedToYou: number;
      youOwe: number;
      recentActivity: any[];
    }>('/dashboard/summary'),

  getMonthlyInsights: (month = 9, year = 2026) =>
    request<{
      success: boolean;
      categories: Array<{
        category: string;
        amount: number;
        label: string;
        percentage: number;
        isTop?: boolean;
      }>;
      topCategory: string;
    }>(`/dashboard/insights?month=${month}&year=${year}`),

  // Expenses
  getExpenses: () =>
    request<{
      success: boolean;
      count: number;
      expenses: Array<{
        id: string;
        amount: number;
        category: string;
        icon: string;
        note: string;
        time: string;
        date: string;
        dayGroup: string;
        source: string;
      }>;
    }>('/expenses'),

  createExpense: (data: { amount: number; category: string; note?: string; source?: string; date?: string; time?: string }) =>
    request<{
      success: boolean;
      expense: {
        id: string;
        amount: number;
        category: string;
        icon: string;
        note: string;
        time: string;
        date: string;
        dayGroup: string;
        source: string;
      };
    }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpense: (
    id: string,
    data: { amount?: number; category?: string; note?: string; date?: string; time?: string; icon?: string }
  ) =>
    request<{
      success: boolean;
      expense: {
        id: string;
        amount: number;
        category: string;
        icon: string;
        note: string;
        time: string;
        date: string;
        dayGroup: string;
        source: string;
      };
    }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExpense: (id: string) =>
    request<{ success: boolean; message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Ledger (Udhaar Khata)
  getContacts: () =>
    request<{
      success: boolean;
      contacts: Array<{
        id: string;
        name: string;
        initial: string;
        netBalance: number;
        status: 'pending' | 'settled';
        lastDate: string;
      }>;
    }>('/ledger/contacts'),

  getContactDetail: (id: string) =>
    request<{
      success: boolean;
      person: {
        id: string;
        name: string;
        initial: string;
        netBalance: number;
        status: 'pending' | 'settled';
        lastDate: string;
      };
      transactions: Array<{
        id: string;
        note: string;
        date: string;
        amount: number;
        direction: 'LENT' | 'BORROWED' | 'SETTLED' | 'SETTLEMENT';
      }>;
    }>(`/ledger/contacts/${id}`),

  addTransaction: (data: {
    personName?: string;
    personId?: string;
    amount: number;
    type: 'LENT' | 'BORROWED';
    note?: string;
  }) =>
    request<{
      success: boolean;
      person: any;
      transaction: any;
    }>('/ledger/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  settleContact: (id: string) =>
    request<{
      success: boolean;
      message: string;
      person: any;
    }>(`/ledger/contacts/${id}/settle`, {
      method: 'POST',
    }),

  deleteContact: (id: string, name?: string) =>
    request<{ success: boolean; message: string }>(
      `/ledger/contacts/${id}${name ? `?name=${encodeURIComponent(name)}` : ''}`,
      {
        method: 'DELETE',
      }
    ),

  // User & Preferences
  getUserProfile: () =>
    request<{
      success: boolean;
      user: {
        id: string;
        name: string;
        currency: string;
        currencySymbol: string;
        preferredLanguage: string;
        preferences: {
          autoCaptureEnabled: boolean;
          darkMode: boolean;
        };
      };
    }>('/user/profile'),

  updatePreferences: (data: {
    preferredLanguage?: string;
    autoCaptureEnabled?: boolean;
    darkMode?: boolean;
    name?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      user: any;
    }>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Client Projects (Freelance & Business)
  getProjects: () =>
    request<{
      success: boolean;
      projects: ClientProject[];
    }>('/projects'),

  createProject: (
    project: { clientName: string; projectTitle?: string; totalValue: number; notes?: string },
    initialPayment?: number,
    addToIncome?: boolean,
    paymentDate?: string
  ) =>
    request<{
      success: boolean;
      project: ClientProject;
    }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ ...project, initialPayment, addToIncome, paymentDate }),
    }),

  addProjectPayment: (
    projectId: string,
    amount: number,
    note?: string,
    method?: string,
    addToIncome?: boolean,
    paymentDate?: string
  ) =>
    request<{
      success: boolean;
      project: ClientProject;
    }>(`/projects/${projectId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount, note, method, addToIncome, paymentDate }),
    }),

  updateProject: (id: string, updates: Partial<ClientProject>) =>
    request<{
      success: boolean;
      project: ClientProject;
    }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  updateProjectPayment: (
    projectId: string,
    paymentId: string,
    updates: {
      amount?: number;
      note?: string;
      method?: string;
      recordedAsIncome?: boolean;
      date?: string;
    }
  ) =>
    request<{
      success: boolean;
      project: ClientProject;
    }>(`/projects/${projectId}/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteProjectPayment: (projectId: string, paymentId: string) =>
    request<{
      success: boolean;
      project: ClientProject;
    }>(`/projects/${projectId}/payments/${paymentId}`, {
      method: 'DELETE',
    }),

  deleteProject: (projectId: string) =>
    request<{
      success: boolean;
      message: string;
    }>(`/projects/${projectId}`, {
      method: 'DELETE',
    }),

  // Split Bills API
  getSplitBills: () =>
    request<{
      success: boolean;
      splitBills: any[];
    }>('/splits'),

  createSplitBill: (bill: any) =>
    request<{
      success: boolean;
      splitBill: any;
    }>('/splits', {
      method: 'POST',
      body: JSON.stringify(bill),
    }),

  settleSplitParticipant: (billId: string, participantId: string) =>
    request<{
      success: boolean;
      splitBill: any;
    }>(`/splits/${billId}/settle/${participantId}`, {
      method: 'POST',
    }),

  deleteSplitBill: (billId: string) =>
    request<{
      success: boolean;
      message: string;
    }>(`/splits/${billId}`, {
      method: 'DELETE',
    }),

  updateSplitBill: (billId: string, updates: any) =>
    request<{
      success: boolean;
      splitBill: any;
    }>(`/splits/${billId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Groups & Rewards API
  checkMember: (query: string) =>
    request<{
      success: boolean;
      exists: boolean;
      user?: { id: string; name: string; capitrackId: string; phone: string };
    }>(`/users/check-member?query=${encodeURIComponent(query)}`),

  getRewards: () =>
    request<{
      success: boolean;
      rewards: any;
    }>('/users/rewards'),

  getGroups: () =>
    request<{
      success: boolean;
      groups: any[];
    }>('/groups'),

  createGroup: (groupData: { name: string; category?: string; initialMembers?: any[] }) =>
    request<{
      success: boolean;
      message: string;
      group: any;
    }>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    }),

  joinGroupByCode: (code: string) =>
    request<{
      success: boolean;
      message: string;
      group?: any;
    }>('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  getGroupDetails: (groupId: string) =>
    request<{
      success: boolean;
      group: any;
      bills: any[];
    }>(`/groups/${groupId}`),
};

