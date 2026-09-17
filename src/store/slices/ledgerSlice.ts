import { StateCreator } from 'zustand';
import { AppState, LedgerSlice } from '../types';
import { Person } from '../../types';
import { api } from '../../services/api';
import { INITIAL_CONTACTS } from '../initialData';

export const createLedgerSlice: StateCreator<AppState, [], [], LedgerSlice> = (set, get) => ({
  contacts: INITIAL_CONTACTS,

  addLedgerEntry: async (personName, amount, direction, note) => {
    const trimmedName = personName.trim() || 'Friend';
    const netDelta = direction === 'LENT' ? amount : -amount;
    const todayStr = 'Today';

    const newTxn = {
      id: 'txn_' + Date.now(),
      note: note || (direction === 'LENT' ? 'Lent' : 'Borrowed'),
      date: todayStr,
      amount,
      direction,
    };

    set((state) => {
      const existingIndex = state.contacts.findIndex(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingIndex >= 0) {
        const updated = [...state.contacts];
        const contact = updated[existingIndex];
        const newBalance = contact.netBalance + netDelta;
        updated[existingIndex] = {
          ...contact,
          netBalance: newBalance,
          lastDate: todayStr,
          status: newBalance === 0 ? 'settled' : 'pending',
          transactions: [newTxn, ...contact.transactions],
        };
        return { contacts: updated, activeModal: null };
      } else {
        const newContact: Person = {
          id: 'p_' + Date.now(),
          name: trimmedName,
          initial: trimmedName[0].toUpperCase(),
          lastDate: todayStr,
          netBalance: netDelta,
          status: netDelta === 0 ? 'settled' : 'pending',
          transactions: [newTxn],
        };
        return { contacts: [newContact, ...state.contacts], activeModal: null };
      }
    });

    try {
      await api.addTransaction({
        personName: trimmedName,
        amount,
        type: direction,
        note,
      });
      get().refreshDashboard();
    } catch {}
  },

  loadPersonDetail: async (personId) => {
    try {
      const res = await api.getContactDetail(personId);
      if (res.success && res.person) {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === personId
              ? {
                  ...c,
                  netBalance: res.person.netBalance,
                  status: res.person.status,
                  transactions: res.transactions as any,
                }
              : c
          ),
        }));
      }
    } catch {}
  },

  settlePerson: async (personId) => {
    set((state) => ({
      contacts: state.contacts.map((contact) => {
        if (contact.id === personId) {
          const settlementTxn = {
            id: 'txn_' + Date.now(),
            note: 'Settled full balance',
            date: 'Today',
            amount: Math.abs(contact.netBalance),
            direction: 'SETTLED' as const,
          };
          return {
            ...contact,
            netBalance: 0,
            status: 'settled' as const,
            transactions: [settlementTxn, ...contact.transactions],
          };
        }
        return contact;
      }),
    }));

    try {
      await api.settleContact(personId);
      get().refreshDashboard();
    } catch {}
  },
});
