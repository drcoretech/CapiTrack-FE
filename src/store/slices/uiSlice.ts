import { StateCreator } from 'zustand';
import { AppState, UiSlice } from '../types';

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set, get) => ({
  activeTab: 'home',
  activeModal: null,
  selectedPersonId: null,
  editingExpense: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (modal, personId) => {
    set({ activeModal: modal, selectedPersonId: personId || null });
    if (modal === 'person_detail' && personId) {
      get().loadPersonDetail(personId);
    }
  },

  closeModal: () => set({ activeModal: null, selectedPersonId: null }),

  setEditingExpense: (expense) =>
    set({
      editingExpense: expense,
      activeModal: expense ? 'edit_expense' : null,
    }),
});
