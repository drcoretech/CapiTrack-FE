import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserSlice } from '../types';
import { api, setCurrentApiUser } from '../../services/api';

export const createUserSlice: StateCreator<AppState, [], [], UserSlice> = (set, get) => ({
  userName: 'Digvijay',
  currencySymbol: '₹',
  selectedLanguage: 'en',
  firstRunStep: 'splash',
  hasCompletedOnboarding: false,
  autoCaptureEnabled: false,
  darkModeEnabled: false,
  businessTrackingEnabled: false,

  setFirstRunStep: (step) => {
    set({ firstRunStep: step });
    if (step === 'main') {
      set({ hasCompletedOnboarding: true });
      AsyncStorage.setItem('@capitrack_onboarding_completed', 'true').catch(() => {});
    }
  },

  setHasCompletedOnboarding: (completed) => {
    set({ hasCompletedOnboarding: completed });
    if (completed) {
      AsyncStorage.setItem('@capitrack_onboarding_completed', 'true').catch(() => {});
    } else {
      AsyncStorage.removeItem('@capitrack_onboarding_completed').catch(() => {});
    }
  },

  setUserName: async (name: string) => {
    const trimmed = name.trim() || 'You';
    const currentName = get().userName;
    if (trimmed !== currentName) {
      set({
        userName: trimmed,
        expenses: [],
        contacts: [],
        clientProjects: [],
        dashboardData: null,
      });
      AsyncStorage.multiRemove([
        '@capitrack_client_projects',
        '@capitrack_expenses',
        '@capitrack_contacts',
      ]).catch(() => {});
    } else {
      set({ userName: trimmed });
    }
    setCurrentApiUser(trimmed);
    AsyncStorage.setItem('@capitrack_user_name', trimmed).catch(() => {});
    try {
      await api.updatePreferences({ name: trimmed });
    } catch {}
    get().loadInitialData().catch(() => {});
  },

  setSelectedLanguage: async (lang) => {
    set({ selectedLanguage: lang });
    try {
      await api.updatePreferences({ preferredLanguage: lang });
    } catch {}
  },

  toggleAutoCapture: async () => {
    const nextVal = !get().autoCaptureEnabled;
    set({
      autoCaptureEnabled: nextVal,
      pendingNudge: nextVal ? get().pendingNudge : null,
    });
    AsyncStorage.setItem('@capitrack_auto_capture_enabled', nextVal ? 'true' : 'false').catch(() => {});
    try {
      await api.updatePreferences({ autoCaptureEnabled: nextVal });
    } catch {}
  },

  toggleDarkMode: async () => {
    const nextVal = !get().darkModeEnabled;
    set({ darkModeEnabled: nextVal });
    try {
      await api.updatePreferences({ darkMode: nextVal });
    } catch {}
  },

  toggleBusinessTracking: async () => {
    const nextVal = !get().businessTrackingEnabled;
    set({ businessTrackingEnabled: nextVal });
    AsyncStorage.setItem('@capitrack_business_tracking_enabled', nextVal ? 'true' : 'false').catch(() => {});
  },

  resetOnboarding: () => {
    AsyncStorage.removeItem('@capitrack_onboarding_completed').catch(() => {});
    set({ firstRunStep: 'splash', hasCompletedOnboarding: false });
  },
});
