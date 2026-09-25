import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, SyncSlice } from '../types';
import { api, setAuthSession } from '../../services/api';

const deletedEntityIds = new Set<string>();

export const markEntityDeleted = (id: string) => {
  if (id) {
    deletedEntityIds.add(id);
    AsyncStorage.getItem('@capitrack_deleted_ids')
      .then((val) => {
        const arr = val ? JSON.parse(val) : [];
        if (!arr.includes(id)) {
          arr.push(id);
          return AsyncStorage.setItem('@capitrack_deleted_ids', JSON.stringify(arr.slice(-200)));
        }
      })
      .catch(() => {});
  }
};

AsyncStorage.getItem('@capitrack_deleted_ids')
  .then((val) => {
    if (val) {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) {
          arr.forEach((id) => deletedEntityIds.add(id));
        }
      } catch {}
    }
  })
  .catch(() => {});

// Helper to safely merge remote projects with local state, preserving local edits & payments
const mergeProjects = (remoteList: any[] = [], localList: any[] = []): any[] => {
  const localMap = new Map((localList || []).map((p) => [p.id, p]));
  const remoteIds = new Set((remoteList || []).map((p) => p.id));

  const merged = (remoteList || [])
    .filter((rp) => !deletedEntityIds.has(rp.id))
    .map((rp) => {
    const lp = localMap.get(rp.id);
    if (!lp) return rp;

    // Prefer local edits for user-customizable fields so refresh never wipes user changes
    const payments = lp.payments && lp.payments.length > 0 ? lp.payments : rp.payments || [];
    return {
      ...rp,
      ...lp,
      clientName: lp.clientName || rp.clientName,
      clientPhone: lp.clientPhone !== undefined ? lp.clientPhone : rp.clientPhone,
      projectTitle: lp.projectTitle || rp.projectTitle,
      totalValue: lp.totalValue !== undefined ? lp.totalValue : rp.totalValue,
      status: lp.status || rp.status,
      notes: lp.notes !== undefined ? lp.notes : rp.notes,
      createdAt: lp.createdAt || rp.createdAt,
      payments,
    };
  });

  (localList || []).forEach((lp) => {
    if (!remoteIds.has(lp.id) && !deletedEntityIds.has(lp.id)) {
      merged.push(lp);
    }
  });

  return merged;
};

// Helper to safely merge remote expenses with local state, preserving local edits & offline/lump-sum entries
const mergeExpenses = (remoteList: any[] = [], localList: any[] = []): any[] => {
  const localMap = new Map((localList || []).map((e) => [e.id, e]));
  const remoteIds = new Set((remoteList || []).map((e) => e.id));

  const merged = (remoteList || [])
    .filter((re) => !deletedEntityIds.has(re.id))
    .map((re) => {
    const le = localMap.get(re.id);
    if (!le) return re;
    return {
      ...re,
      ...le,
      amount: le.amount !== undefined ? le.amount : re.amount,
      note: le.note !== undefined ? le.note : re.note,
      category: le.category || re.category,
      date: le.date || re.date,
      time: le.time || re.time,
      icon: le.icon || re.icon,
      dayGroup: le.dayGroup || re.dayGroup,
    };
  });

  (localList || []).forEach((le) => {
    if (!remoteIds.has(le.id) && !deletedEntityIds.has(le.id)) {
      merged.push(le);
    }
  });

  // Sort chronologically descending
  merged.sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime() || 0;
    const timeB = new Date(b.date || b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  return merged;
};

// Helper to safely merge remote contacts with local state, preserving local transactions & balances
const mergeContacts = (remoteList: any[] = [], localList: any[] = []): any[] => {
  const localMap = new Map((localList || []).map((c) => [c.id, c]));
  const localNameMap = new Map((localList || []).map((c) => [(c.name || '').toLowerCase().trim(), c]));
  const remoteIds = new Set((remoteList || []).map((c) => c.id));
  const remoteNames = new Set((remoteList || []).map((c) => (c.name || '').toLowerCase().trim()));

  const merged = (remoteList || [])
    .filter((rc) => !deletedEntityIds.has(rc.id))
    .map((rc) => {
    const normalizedName = (rc.name || '').toLowerCase().trim();
    const lc = localMap.get(rc.id) || localNameMap.get(normalizedName);
    if (!lc) return rc;

    const localTxns = lc.transactions && lc.transactions.length > 0 ? lc.transactions : rc.transactions || [];
    let netBalance = rc.netBalance;
    let status = rc.status;

    if (lc.transactions && lc.transactions.length > 0) {
      netBalance = lc.transactions.reduce((sum: number, t: any) => {
        if (t.direction === 'LENT') return sum + t.amount;
        if (t.direction === 'BORROWED') return sum - t.amount;
        return sum;
      }, 0);
      status = netBalance === 0 ? 'settled' : 'pending';
    }

    return {
      ...rc,
      ...lc,
      name: lc.name || rc.name,
      initial: (lc.name || rc.name || 'F')[0].toUpperCase(),
      netBalance,
      status,
      lastDate: lc.lastDate || rc.lastDate,
      transactions: localTxns,
    };
  });

  (localList || []).forEach((lc) => {
    const normalizedName = (lc.name || '').toLowerCase().trim();
    if (!remoteIds.has(lc.id) && !remoteNames.has(normalizedName) && !deletedEntityIds.has(lc.id)) {
      merged.push(lc);
    }
  });

  return merged;
};

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> = (set, get) => ({
  isSyncing: false,
  lastSyncedAt: null,
  dashboardData: null,

  loadInitialData: async () => {
    set({ isSyncing: true });
    try {
      const [token, userId, localName] = await Promise.all([
        AsyncStorage.getItem('@capitrack_auth_token'),
        AsyncStorage.getItem('@capitrack_auth_user_id'),
        AsyncStorage.getItem('@capitrack_user_name'),
      ]);

      if (!token && !localName) {
        set({ isSyncing: false, isAuthenticated: false });
        return;
      }

      setAuthSession(token || '', userId || '', localName || '');
      set({ isAuthenticated: true, userId: userId || null, userName: localName || '' });

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
        localExpensesRaw,
        localContactsRaw,
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
        AsyncStorage.getItem('@capitrack_expenses'),
        AsyncStorage.getItem('@capitrack_contacts'),
      ]);

      set((state) => {
        const nextState: Partial<AppState> = { isSyncing: false, lastSyncedAt: new Date() };

        // 1. Client Projects
        let currentProjects = state.clientProjects || [];
        if (localProjects.status === 'fulfilled' && localProjects.value) {
          try {
            const parsed = JSON.parse(localProjects.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentProjects = parsed;
              nextState.clientProjects = parsed;
            }
          } catch {}
        }
        if (projRes.status === 'fulfilled' && projRes.value.success) {
          const merged = mergeProjects(projRes.value.projects, currentProjects);
          nextState.clientProjects = merged;
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(merged)).catch(() => {});
        } else if (currentProjects.length > 0) {
          nextState.clientProjects = currentProjects;
        }

        // 2. Expenses
        let currentExpenses = state.expenses || [];
        if (localExpensesRaw.status === 'fulfilled' && localExpensesRaw.value) {
          try {
            const parsed = JSON.parse(localExpensesRaw.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentExpenses = parsed;
              nextState.expenses = parsed;
            }
          } catch {}
        }
        if (expRes.status === 'fulfilled' && expRes.value.success) {
          const remoteExpenses = (expRes.value.expenses || []).map((e: any) => ({
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
          const mergedExpenses = mergeExpenses(remoteExpenses, currentExpenses);
          nextState.expenses = mergedExpenses;
          AsyncStorage.setItem('@capitrack_expenses', JSON.stringify(mergedExpenses)).catch(() => {});
        } else if (currentExpenses.length > 0) {
          nextState.expenses = currentExpenses;
        }

        // 3. Contacts / Ledger
        let currentContacts = state.contacts || [];
        if (localContactsRaw.status === 'fulfilled' && localContactsRaw.value) {
          try {
            const parsed = JSON.parse(localContactsRaw.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentContacts = parsed;
              nextState.contacts = parsed;
            }
          } catch {}
        }
        if (contactRes.status === 'fulfilled' && contactRes.value.success) {
          const mergedContacts = mergeContacts(contactRes.value.contacts || [], currentContacts);
          nextState.contacts = mergedContacts;
          AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(mergedContacts)).catch(() => {});
        } else if (currentContacts.length > 0) {
          nextState.contacts = currentContacts;
        }

        // 4. Preferences & Settings
        if (localBusiness.status === 'fulfilled' && localBusiness.value !== null) {
          nextState.businessTrackingEnabled = localBusiness.value === 'true';
        }

        // 5. Dashboard Data
        const finalContacts = nextState.contacts || currentContacts;
        const calcOwedToYou = finalContacts.reduce((sum, c) => (c.netBalance > 0 ? sum + c.netBalance : sum), 0);
        const calcYouOwe = finalContacts.reduce((sum, c) => (c.netBalance < 0 ? sum + Math.abs(c.netBalance) : sum), 0);

        if (dashRes.status === 'fulfilled' && dashRes.value.success) {
          nextState.dashboardData = {
            spentToday: dashRes.value.spentToday,
            spentYesterday: dashRes.value.spentYesterday,
            delta: dashRes.value.delta,
            insight: dashRes.value.insight,
            owedToYou: dashRes.value.owedToYou ?? calcOwedToYou,
            youOwe: dashRes.value.youOwe ?? calcYouOwe,
          };
          if (dashRes.value.currency) nextState.currencySymbol = dashRes.value.currency;
        } else {
          nextState.dashboardData = {
            spentToday: 0,
            spentYesterday: 0,
            delta: '+0%',
            insight: '',
            owedToYou: calcOwedToYou,
            youOwe: calcYouOwe,
          };
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
        api.getDashboardSummary().catch(() => null),
        api.getExpenses().catch(() => ({ success: false, expenses: [] })),
        api.getContacts().catch(() => ({ success: false, contacts: [] })),
        api.getProjects().catch(() => ({ success: false, projects: [] })),
      ]);

      set((state) => {
        const nextExpenses = expRes && expRes.success && expRes.expenses && expRes.expenses.length > 0
          ? mergeExpenses(
              expRes.expenses.map((e: any) => ({
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
              state.expenses
            )
          : state.expenses;

        const nextContacts = contactRes && contactRes.success && contactRes.contacts
          ? mergeContacts(contactRes.contacts, state.contacts)
          : state.contacts;

        const nextProjects = projRes && projRes.success && projRes.projects
          ? mergeProjects(projRes.projects, state.clientProjects)
          : state.clientProjects;

        AsyncStorage.setItem('@capitrack_expenses', JSON.stringify(nextExpenses)).catch(() => {});
        AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(nextContacts)).catch(() => {});
        AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(nextProjects)).catch(() => {});

        const calcOwedToYou = nextContacts.reduce((sum, c) => (c.netBalance > 0 ? sum + c.netBalance : sum), 0);
        const calcYouOwe = nextContacts.reduce((sum, c) => (c.netBalance < 0 ? sum + Math.abs(c.netBalance) : sum), 0);

        return {
          dashboardData: dashRes && dashRes.success ? {
            spentToday: dashRes.spentToday,
            spentYesterday: dashRes.spentYesterday,
            delta: dashRes.delta,
            insight: dashRes.insight,
            owedToYou: dashRes.owedToYou ?? calcOwedToYou,
            youOwe: dashRes.youOwe ?? calcYouOwe,
          } : (state.dashboardData ? {
            ...state.dashboardData,
            owedToYou: calcOwedToYou,
            youOwe: calcYouOwe,
          } : {
            spentToday: 0,
            spentYesterday: 0,
            delta: '+0%',
            insight: '',
            owedToYou: calcOwedToYou,
            youOwe: calcYouOwe,
          }),
          expenses: nextExpenses,
          contacts: nextContacts,
          clientProjects: nextProjects,
        };
      });
    } catch {}
  },
});
