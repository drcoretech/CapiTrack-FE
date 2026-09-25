import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, ExpenseSlice, PendingNudge } from '../types';
import { Expense, AppCategory } from '../../types';
import { api } from '../../services/api';
import { INITIAL_CATEGORIES, INITIAL_EXPENSES } from '../initialData';
import { markEntityDeleted } from './syncSlice';

export const computeDayGroup = (dateInput?: string | Date): 'Today' | 'Yesterday' | string => {
  if (!dateInput) return 'Today';
  const target = new Date(dateInput);
  if (isNaN(target.getTime())) return 'Today';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  if (targetDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (targetDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return target.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
};

export const createExpenseSlice: StateCreator<AppState, [], [], ExpenseSlice> = (set, get) => ({
  expenses: [],
  categories: INITIAL_CATEGORIES,
  pendingNudge: null,
  pendingNudges: [],

  triggerNudge: (data) => {
    if (!get().autoCaptureEnabled) {
      return;
    }
    const newNudge: PendingNudge = {
      ...data,
      id: data.id || ('nudge_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
      timestamp: data.timestamp || 'Just now',
      createdAt: data.createdAt || Date.now(),
    };
    const currentQueue = get().pendingNudges || [];

    // Check for existing pending nudge for same amount within 15 seconds
    const existingIdx = currentQueue.findIndex(
      (n) =>
        Math.abs(n.amount - newNudge.amount) < 0.01 &&
        Math.abs((newNudge.createdAt || Date.now()) - (n.createdAt || 0)) < 15000
    );

    let updatedQueue: PendingNudge[];
    if (existingIdx >= 0) {
      // If the existing nudge was from Bank SMS and the new one is from a UPI app (PhonePe/GPay/Paytm),
      // seamlessly upgrade the payee and sourceApp without creating a duplicate!
      if (currentQueue[existingIdx].sourceApp === 'Bank SMS' && newNudge.sourceApp !== 'Bank SMS') {
        const upgraded = [...currentQueue];
        upgraded[existingIdx] = {
          ...upgraded[existingIdx],
          merchant: newNudge.merchant,
          sourceApp: newNudge.sourceApp,
          suggestedCategory: newNudge.suggestedCategory,
        };
        updatedQueue = upgraded;
      } else {
        // Drop duplicate identical payment event
        return;
      }
    } else {
      updatedQueue = [...currentQueue, newNudge].slice(-10);
    }

    set({
      pendingNudges: updatedQueue,
      pendingNudge: updatedQueue[0] || null,
    });

    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(updatedQueue)).catch(() => { });
  },

  saveNudgeExpense: async (category, customNote) => {
    const queue = get().pendingNudges || [];
    const nudge = queue[0] || get().pendingNudge;
    if (!nudge) return;

    const matchedCategory = get().categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.id.toLowerCase() === category.toLowerCase()
    );

    const tempId = 'exp_' + Date.now();
    const newExpense: Expense = {
      id: tempId,
      amount: nudge.amount,
      category,
      icon: matchedCategory?.icon || '💸',
      note: customNote || nudge.merchant || `${nudge.sourceApp} Payment`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayGroup: 'Today',
      createdAt: new Date().toISOString(),
    };

    const remainingQueue = queue.slice(1);

    set((state) => ({
      pendingNudges: remainingQueue,
      pendingNudge: remainingQueue[0] || null,
      expenses: [newExpense, ...state.expenses],
      dashboardData: state.dashboardData
        ? {
          ...state.dashboardData,
          spentToday: (state.dashboardData.spentToday || 0) + nudge.amount,
        }
        : null,
    }));

    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(remainingQueue)).catch(() => { });
    AsyncStorage.removeItem('@capitrack_pending_nudge').catch(() => { });

    try {
      const res = await api.createExpense({
        amount: nudge.amount,
        category,
        note: newExpense.note,
        source: 'notification_capture',
      });

      if (res.success && res.expense) {
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === tempId ? { ...e, id: res.expense.id } : e)),
        }));
      }
    } catch { }
  },

  dismissNudge: () => {
    const queue = get().pendingNudges || [];
    const remainingQueue = queue.slice(1);
    set({
      pendingNudges: remainingQueue,
      pendingNudge: remainingQueue[0] || null,
    });
    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(remainingQueue)).catch(() => { });
    AsyncStorage.removeItem('@capitrack_pending_nudge').catch(() => { });
  },

  toggleCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      ),
    }));
  },

  addCategory: (name: string, icon: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newCat: AppCategory = {
      id: 'cat_' + Date.now(),
      name: trimmed,
      icon: icon || '🏷️',
      isDefault: false,
      enabled: true,
    };
    set((state) => ({
      categories: [...state.categories, newCat],
    }));
  },

  addExpense: async (amount, category, note, customDate) => {
    const matchedCategory = get().categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.id.toLowerCase() === category.toLowerCase()
    );

    const expenseDate = customDate ? new Date(customDate) : new Date();
    const dayGroup = computeDayGroup(expenseDate);
    const timeStr = expenseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const tempId = 'exp_' + Date.now();
    const newExpense: Expense = {
      id: tempId,
      amount,
      category,
      icon: matchedCategory?.icon || '💸',
      note: note || (category + ' expense'),
      time: timeStr,
      dayGroup,
      date: expenseDate.toISOString(),
      createdAt: expenseDate.toISOString(),
    };

    set((state) => ({
      expenses: [newExpense, ...state.expenses],
      activeModal: null,
      dashboardData: state.dashboardData && dayGroup === 'Today'
        ? {
          ...state.dashboardData,
          spentToday: (state.dashboardData.spentToday || 0) + amount,
        }
        : state.dashboardData,
    }));

    try {
      const res = await api.createExpense({
        amount,
        category,
        note: newExpense.note,
        date: expenseDate.toISOString(),
        time: timeStr,
      });

      if (res.success && res.expense) {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === tempId ? { ...e, id: res.expense.id, date: res.expense.date || e.date } : e
          ),
        }));
      }
      get().refreshDashboard();
    } catch (err) {
      console.warn('Backend createExpense failed, expense saved locally:', err);
    }
  },

  updateExpense: async (id, updates) => {
    const prevExpenses = get().expenses;
    const target = prevExpenses.find((e) => e.id === id || (e as any)._id === id);
    if (!target) return;

    const updatedDate = updates.date ? updates.date : (target.date || target.createdAt);
    const updatedDayGroup = updates.date ? computeDayGroup(updates.date) : target.dayGroup;
    const matchedCategory = updates.category
      ? get().categories.find((c) => c.name.toLowerCase() === updates.category!.toLowerCase())
      : null;

    const updatedExpense: Expense = {
      ...target,
      ...updates,
      icon: matchedCategory?.icon || target.icon,
      date: updatedDate,
      dayGroup: updatedDayGroup,
    };

    const nextExpenses = prevExpenses.map((e) =>
      (e.id === id || (e as any)._id === id) ? updatedExpense : e
    );

    set({
      expenses: nextExpenses,
      editingExpense: null,
      activeModal: null,
    });

    AsyncStorage.setItem('@capitrack_expenses', JSON.stringify(nextExpenses)).catch(() => {});

    try {
      await api.updateExpense(id, {
        amount: updates.amount,
        category: updates.category,
        note: updates.note,
        date: updates.date,
        icon: updatedExpense.icon,
      });
      get().refreshDashboard();
    } catch (err) {
      console.warn('Update expense error:', err);
    }
  },

  deleteExpense: async (id) => {
    const nextExpenses = get().expenses.filter(
      (e) => e.id !== id && (e as any)._id !== id
    );

    set({
      expenses: nextExpenses,
      editingExpense: null,
      activeModal: null,
    });

    markEntityDeleted(id);
    AsyncStorage.setItem('@capitrack_expenses', JSON.stringify(nextExpenses)).catch(() => {});

    try {
      await api.deleteExpense(id);
      get().refreshDashboard();
    } catch (err) {
      console.warn('Delete expense error:', err);
    }
  },
});
