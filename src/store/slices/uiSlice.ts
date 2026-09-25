import { StateCreator } from 'zustand';
import { AppState, UiSlice } from '../types';

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set, get) => ({
  activeTab: 'home',
  activeModal: null,
  selectedPersonId: null,
  selectedProjectId: null,
  ledgerSubTab: 'personal',
  insightsSubTab: 'personal',
  editingExpense: null,
  editingLedgerTxn: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLedgerSubTab: (tab) => set({ ledgerSubTab: tab }),
  setInsightsSubTab: (tab) => set({ insightsSubTab: tab }),

  openModal: (modal, entityId) => {
    if (modal === 'project_detail') {
      set({ activeModal: modal, selectedProjectId: entityId || null, selectedPersonId: null });
    } else {
      set({ activeModal: modal, selectedPersonId: entityId || null, selectedProjectId: null });
      if (modal === 'person_detail' && entityId) {
        get().loadPersonDetail(entityId);
      }
    }
  },

  closeModal: () => set({ activeModal: null, selectedPersonId: null, selectedProjectId: null, editingLedgerTxn: null }),

  setEditingExpense: (expense) =>
    set({
      editingExpense: expense,
      activeModal: expense ? 'edit_expense' : null,
    }),

  setEditingLedgerTxn: (data) =>
    set({
      editingLedgerTxn: data,
      activeModal: data ? 'edit_ledger_entry' : null,
    }),

  authInitialMode: 'signup',
  setAuthInitialMode: (mode) => set({ authInitialMode: mode }),
});
