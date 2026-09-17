import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, ExpenseSlice, PendingNudge } from '../types';
import { Expense, AppCategory } from '../../types';
import { api } from '../../services/api';
import { INITIAL_CATEGORIES, INITIAL_EXPENSES } from '../initialData';

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
  expenses: INITIAL_EXPENSES,
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
    // Only prevent rapid duplicate events (same amount & merchant within 5 seconds)
    const isDuplicate = currentQueue.some(
      (n) =>
        n.amount === newNudge.amount &&
        n.merchant === newNudge.merchant &&
        Math.abs((newNudge.createdAt || Date.now()) - (n.createdAt || 0)) < 5000
    );
    const updatedQueue = isDuplicate ? currentQueue : [...currentQueue, newNudge];

    set({
      pendingNudges: updatedQueue,
      pendingNudge: updatedQueue[0] || null,
    });

    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(updatedQueue)).catch(() => {});
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

    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(remainingQueue)).catch(() => {});
    AsyncStorage.removeItem('@capitrack_pending_nudge').catch(() => {});

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
    } catch {}
  },

  dismissNudge: () => {
    const queue = get().pendingNudges || [];
    const remainingQueue = queue.slice(1);
    set({
      pendingNudges: remainingQueue,
      pendingNudge: remainingQueue[0] || null,
    });
    AsyncStorage.setItem('@capitrack_pending_nudges', JSON.stringify(remainingQueue)).catch(() => {});
    AsyncStorage.removeItem('@capitrack_pending_nudge').catch(() => {});
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
          expenses: state.expenses.map((e) => (e.id === tempId ? { ...e, id: res.expense.id } : e)),
        }));
      }
      get().refreshDashboard();
    } catch {}
  },

  updateExpense: async (id, updates) => {
    const prevExpenses = get().expenses;
    const target = prevExpenses.find((e) => e.id === id);
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

    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? updatedExpense : e)),
      editingExpense: null,
      activeModal: null,
    }));

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
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
      editingExpense: null,
      activeModal: null,
    }));

    try {
      await api.deleteExpense(id);
      get().refreshDashboard();
    } catch (err) {
      console.warn('Delete expense error:', err);
    }
  },
});
