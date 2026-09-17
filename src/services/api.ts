import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect host IP so real phones, Expo Go, and emulators all connect seamlessly.
// In production builds, connects directly to your deployed backend URL.
export const getBaseUrl = () => {
  // 0. Production deployed URL from environment variable (.env) or app.json
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  const extraApiUrl = (Constants.expoConfig as any)?.extra?.apiUrl;
  if (extraApiUrl) {
    return extraApiUrl.replace(/\/+$/, '');
  }

  // 1. Check Expo hostUri (contains the IP of your computer running Expo/Metro)
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

  // 2. Check NativeModules scriptURL
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/:\/\/([^:/]+)/);
    const ip = match ? match[1] : null;
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5001/api`;
    }
  }

  // 3. Fallback for Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  // 4. Default for iOS simulator / web
  return 'http://localhost:5001/api';
};

export const API_BASE_URL = getBaseUrl();
console.log('[CapiTrack Network] Connected API Base URL:', API_BASE_URL);

let currentApiUser = 'Digvijay';

export const setCurrentApiUser = (name: string) => {
  if (name && name.trim()) {
    currentApiUser = name.trim();
  }
};

// Generic fetch helper with forgiving timeout & graceful network handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-name': currentApiUser,
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
    throw err;
  }
}

export const api = {
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
};
