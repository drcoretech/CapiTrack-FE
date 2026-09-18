import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserSlice } from '../types';
import { api, setCurrentApiUser } from '../../services/api';

export const createUserSlice: StateCreator<AppState, [], [], UserSlice> = (set, get) => ({
  userName: 'Digvijay',
  currencySymbol: '₹',
  selectedLanguage: 'en',
  firstRunStep: 'splash',
  autoCaptureEnabled: false,
  darkModeEnabled: false,

  setFirstRunStep: (step) => set({ firstRunStep: step }),

  setUserName: async (name: string) => {
    const trimmed = name.trim() || 'You';
    set({ userName: trimmed });
    setCurrentApiUser(trimmed);
    AsyncStorage.setItem('@capitrack_user_name', trimmed).catch(() => {});
    try {
      await api.updatePreferences({ name: trimmed });
    } catch {}
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

  resetOnboarding: () => set({ firstRunStep: 'splash' }),
});
