import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserSlice } from '../types';
import { api, setCurrentApiUser, setAuthSession, clearAuthSession } from '../../services/api';
import { biometrics } from '../../services/biometrics';

export const createUserSlice: StateCreator<AppState, [], [], UserSlice> = (set, get) => ({
  userName: '',
  userId: null,
  capitrackId: '',
  referralCode: '',
  rewardPoints: 0,
  profilePicture: '',
  isAuthenticated: false,
  currencySymbol: '₹',
  selectedLanguage: 'en',
  firstRunStep: 'splash',
  hasCompletedOnboarding: false,
  autoCaptureEnabled: false,
  darkModeEnabled: false,
  businessTrackingEnabled: false,
  isBiometricEnabled: false,
  isAppLocked: false,
  isFreshAuth: false,

  setAppLocked: (locked: boolean) => set({ isAppLocked: locked }),
  setFreshAuth: (val: boolean) => set({ isFreshAuth: val }),

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

  setProfilePicture: async (uri: string) => {
    const cleanUri = uri || '';
    set({ profilePicture: cleanUri });
    if (cleanUri) {
      AsyncStorage.setItem('@capitrack_profile_picture', cleanUri).catch(() => {});
    } else {
      AsyncStorage.removeItem('@capitrack_profile_picture').catch(() => {});
    }
    try {
      await api.updatePreferences({ profilePicture: cleanUri });
    } catch {}
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

  toggleBiometricLock: async () => {
    const current = get().isBiometricEnabled;
    const nextVal = !current;
    if (nextVal) {
      const ok = await biometrics.authenticate('Authenticate to enable App Lock');
      if (!ok) return false;
    }
    set({ isBiometricEnabled: nextVal, isAppLocked: false });
    await AsyncStorage.setItem('@capitrack_biometric_enabled', nextVal ? 'true' : 'false');
    return true;
  },

  resetOnboarding: () => {
    AsyncStorage.removeItem('@capitrack_onboarding_completed').catch(() => {});
    set({ firstRunStep: 'splash', hasCompletedOnboarding: false });
  },

  login: async (name: string, password: string, onProgress?: (stage: 'auth' | 'sync') => void) => {
    try {
      const res = await api.login({ name, password });
      if (res.success && res.user) {
        const pic = res.user.profilePicture || '';
        setAuthSession(res.token, res.user.id, res.user.name);
        await AsyncStorage.multiSet([
          ['@capitrack_auth_token', res.token],
          ['@capitrack_auth_user_id', res.user.id],
          ['@capitrack_user_name', res.user.name],
          ['@capitrack_profile_picture', pic],
          ['@capitrack_onboarding_completed', 'true'],
        ]);

        // Keep firstRunStep: 'auth' while prefetching home screen data so user sees the button loader
        set({
          isAuthenticated: true,
          userId: res.user.id,
          userName: res.user.name,
          capitrackId: res.user.capitrackId || '',
          referralCode: res.user.referralCode || '',
          rewardPoints: res.user.rewardPoints || 0,
          profilePicture: pic,
          currencySymbol: res.user.currencySymbol || '₹',
          selectedLanguage: (res.user.preferredLanguage as any) || 'en',
          businessTrackingEnabled: !!res.user.preferences?.businessTrackingEnabled,
          hasCompletedOnboarding: true,
          firstRunStep: 'auth',
          isFreshAuth: false,
        });

        // Notify UI to update button text to workspace sync
        onProgress?.('sync');

        // Prefetch initial dashboard & expense data in the background
        try {
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
          await Promise.race([get().loadInitialData(), timeoutPromise]);
        } catch {}

        // Data is ready, transition to main workspace
        set({
          firstRunStep: 'main',
          isFreshAuth: false,
        });

        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  },

  signup: async (
    name: string,
    password: string,
    businessTrackingEnabled = false,
    referralCode?: string,
    onProgress?: (stage: 'auth' | 'sync') => void
  ) => {
    try {
      const res = await api.signup({
        name,
        password,
        businessTrackingEnabled,
        referralCode,
        preferredLanguage: get().selectedLanguage,
      });
      if (res.success && res.user) {
        const pic = res.user.profilePicture || '';
        setAuthSession(res.token, res.user.id, res.user.name);
        await AsyncStorage.multiSet([
          ['@capitrack_auth_token', res.token],
          ['@capitrack_auth_user_id', res.user.id],
          ['@capitrack_user_name', res.user.name],
          ['@capitrack_profile_picture', pic],
          ['@capitrack_business_tracking_enabled', businessTrackingEnabled ? 'true' : 'false'],
          ['@capitrack_onboarding_completed', 'true'],
        ]);

        // Keep firstRunStep: 'auth' while prefetching home screen data
        set({
          isAuthenticated: true,
          userId: res.user.id,
          userName: res.user.name,
          capitrackId: res.user.capitrackId || '',
          referralCode: res.user.referralCode || '',
          rewardPoints: res.user.rewardPoints || 0,
          profilePicture: pic,
          currencySymbol: res.user.currencySymbol || '₹',
          selectedLanguage: (res.user.preferredLanguage as any) || 'en',
          businessTrackingEnabled: !!businessTrackingEnabled,
          hasCompletedOnboarding: true,
          firstRunStep: 'auth',
          isFreshAuth: false,
          expenses: [],
          contacts: [],
          clientProjects: [],
          dashboardData: null,
        });

        // Notify UI to update button text to workspace setup
        onProgress?.('sync');

        // Prefetch initial dashboard & expense data in the background
        try {
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
          await Promise.race([get().loadInitialData(), timeoutPromise]);
        } catch {}

        // Data is ready, transition to main workspace
        set({
          firstRunStep: 'main',
          isFreshAuth: false,
        });

        return { success: true };
      }
      return { success: false, message: res.message || 'Signup failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Signup failed' };
    }
  },

  logout: async () => {
    clearAuthSession();
    await AsyncStorage.multiRemove([
      '@capitrack_auth_token',
      '@capitrack_auth_user_id',
      '@capitrack_user_name',
      '@capitrack_profile_picture',
      '@capitrack_onboarding_completed',
      '@capitrack_client_projects',
      '@capitrack_expenses',
      '@capitrack_contacts',
      '@capitrack_pending_nudge',
      '@capitrack_pending_nudges',
    ]).catch(() => {});
    set({
      isAuthenticated: false,
      isFreshAuth: false,
      userId: null,
      userName: '',
      profilePicture: '',
      expenses: [],
      contacts: [],
      clientProjects: [],
      dashboardData: null,
      firstRunStep: 'auth',
      hasCompletedOnboarding: true,
    });
  },
});
