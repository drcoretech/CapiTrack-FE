import { StateCreator } from 'zustand';
import { AppState, UiSlice } from '../types';

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set, get) => ({
  activeTab: 'home',
  activeModal: null,
  selectedPersonId: null,
  selectedProjectId: null,
  selectedSplitBillId: null,
  selectedGroupId: null,
  qrModalData: null,
  ledgerSubTab: 'personal',
  insightsSubTab: 'personal',
  editingExpense: null,
  editingLedgerTxn: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLedgerSubTab: (tab) => set({ ledgerSubTab: tab }),
  setInsightsSubTab: (tab) => set({ insightsSubTab: tab }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  openModal: (modal, entityId) => {
    if (modal === 'project_detail') {
      set({ activeModal: modal, selectedProjectId: entityId || null, selectedPersonId: null, selectedSplitBillId: null, selectedGroupId: null });
    } else if (modal === 'split_detail') {
      set({ activeModal: modal, selectedSplitBillId: entityId || null, selectedPersonId: null, selectedProjectId: null, selectedGroupId: null });
    } else if (modal === 'group_detail') {
      set({ activeModal: modal, selectedGroupId: entityId || null, selectedPersonId: null, selectedProjectId: null, selectedSplitBillId: null });
    } else {
      set({ activeModal: modal, selectedPersonId: entityId || null, selectedProjectId: null, selectedSplitBillId: null, selectedGroupId: null });
      if (modal === 'person_detail' && entityId) {
        get().loadPersonDetail(entityId);
      }
    }
  },

  closeModal: () =>
    set({
      activeModal: null,
      selectedPersonId: null,
      selectedProjectId: null,
      selectedSplitBillId: null,
      selectedGroupId: null,
      qrModalData: null,
      editingLedgerTxn: null,
    }),

  setQrModalData: (data) => set({ qrModalData: data, activeModal: data ? 'upi_qr' : null }),

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
