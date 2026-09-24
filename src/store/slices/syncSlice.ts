import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, SyncSlice } from '../types';
import { api } from '../../services/api';

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> = (set, get) => ({
  isSyncing: false,
  lastSyncedAt: null,
  dashboardData: null,

  loadInitialData: async () => {
    set({ isSyncing: true });
    try {
      const [
        dashRes,
        expRes,
        contactRes,
        userRes,
        localAutoCapture,
        localProjects,
        localBusiness,
        projRes,
        localOnboarding,
        localUserName,
      ] = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getExpenses(),
        api.getContacts(),
        api.getUserProfile(),
        AsyncStorage.getItem('@capitrack_auto_capture_enabled'),
        AsyncStorage.getItem('@capitrack_client_projects'),
        AsyncStorage.getItem('@capitrack_business_tracking_enabled'),
        api.getProjects(),
        AsyncStorage.getItem('@capitrack_onboarding_completed'),
        AsyncStorage.getItem('@capitrack_user_name'),
      ]);

      set((state) => {
        const nextState: Partial<AppState> = { isSyncing: false, lastSyncedAt: new Date() };

        if (localProjects.status === 'fulfilled' && localProjects.value) {
          try {
            const parsed = JSON.parse(localProjects.value);
            if (Array.isArray(parsed)) {
              nextState.clientProjects = parsed;
            }
          } catch {}
        }

        if (projRes.status === 'fulfilled' && projRes.value.success) {
          nextState.clientProjects = projRes.value.projects;
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(projRes.value.projects)).catch(() => {});
        }

        if (localBusiness.status === 'fulfilled' && localBusiness.value !== null) {
          nextState.businessTrackingEnabled = localBusiness.value === 'true';
        }

        if (dashRes.status === 'fulfilled' && dashRes.value.success) {
          nextState.dashboardData = {
            spentToday: dashRes.value.spentToday,
            spentYesterday: dashRes.value.spentYesterday,
            delta: dashRes.value.delta,
            insight: dashRes.value.insight,
            owedToYou: dashRes.value.owedToYou,
            youOwe: dashRes.value.youOwe,
          };
          if (dashRes.value.currency) nextState.currencySymbol = dashRes.value.currency;
        }

        if (expRes.status === 'fulfilled' && expRes.value.success) {
          nextState.expenses = expRes.value.expenses.map((e) => ({
            id: e.id,
            amount: e.amount,
            category: e.category as any,
            icon: e.icon || '💸',
            note: e.note,
            time: e.time,
            dayGroup: e.dayGroup || 'Today',
            date: e.date,
            createdAt: e.date,
          }));
        }

        if (contactRes.status === 'fulfilled' && contactRes.value.success) {
          nextState.contacts = contactRes.value.contacts.map((c) => {
            const existing = state.contacts.find((ex) => ex.id === c.id || ex.name === c.name);
            return {
              id: c.id,
              name: c.name,
              initial: c.initial,
              lastDate: c.lastDate,
              netBalance: c.netBalance,
              status: c.status,
              transactions: existing ? existing.transactions : [],
            };
          });
        }

        if (userRes.status === 'fulfilled' && userRes.value.success) {
          if (userRes.value.user.name) {
            nextState.userName = userRes.value.user.name;
          }
          if (userRes.value.user.preferredLanguage) {
            const lang = userRes.value.user.preferredLanguage;
            if (lang === 'hi' || lang === 'mr' || lang === 'en') {
              nextState.selectedLanguage = lang;
            }
          }
          if (userRes.value.user.preferences) {
            const isAutoCaptureOnLocally =
              localAutoCapture.status === 'fulfilled' && localAutoCapture.value === 'true';
            nextState.autoCaptureEnabled = isAutoCaptureOnLocally;
            nextState.darkModeEnabled = userRes.value.user.preferences.darkMode ?? state.darkModeEnabled;
          }
        }

        const isOnboardingDone =
          (localOnboarding.status === 'fulfilled' && localOnboarding.value === 'true') ||
          (localUserName.status === 'fulfilled' && !!localUserName.value && localUserName.value !== 'You') ||
          (userRes.status === 'fulfilled' && userRes.value.success && !!userRes.value.user.name && userRes.value.user.name !== 'You');

        if (isOnboardingDone) {
          nextState.hasCompletedOnboarding = true;
        }

        return nextState;
      });
    } catch {
      set({ isSyncing: false });
    }
  },

  refreshDashboard: async () => {
    try {
      const [dashRes, expRes, contactRes, projRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getExpenses(),
        api.getContacts(),
        api.getProjects().catch(() => ({ success: false, projects: [] })),
      ]);

      set((state) => ({
        dashboardData: {
          spentToday: dashRes.spentToday,
          spentYesterday: dashRes.spentYesterday,
          delta: dashRes.delta,
          insight: dashRes.insight,
          owedToYou: dashRes.owedToYou,
          youOwe: dashRes.youOwe,
        },
        expenses: expRes.expenses.map((e) => ({
          id: e.id,
          amount: e.amount,
          category: e.category as any,
          icon: e.icon || '💸',
          note: e.note,
          time: e.time,
          dayGroup: e.dayGroup || 'Today',
          date: e.date,
          createdAt: e.date,
        })),
        contacts: contactRes.contacts.map((c) => {
          const existing = state.contacts.find((ex) => ex.id === c.id || ex.name === c.name);
          return {
            id: c.id,
            name: c.name,
            initial: c.initial,
            lastDate: c.lastDate,
            netBalance: c.netBalance,
            status: c.status,
            transactions: existing ? existing.transactions : [],
          };
        }),
        clientProjects: projRes.success ? projRes.projects : state.clientProjects,
      }));
    } catch { }
  },
});
