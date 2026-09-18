import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, LedgerSlice } from '../types';
import { Person, ClientProject } from '../../types';
import { api } from '../../services/api';
import { INITIAL_CONTACTS } from '../initialData';

const INITIAL_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: 'proj_kemlite',
    clientName: 'Kemlite',
    clientPhone: '+919822012345',
    projectTitle: 'Corporate Website Redesign',
    totalValue: 12000,
    payments: [
      {
        id: 'pay_kemlite_1',
        amount: 6000,
        date: '18 Sep 2026',
        note: 'Advance milestone payment (50%)',
        method: 'Bank Transfer',
        recordedAsIncome: true,
      },
    ],
    status: 'payment_pending',
    createdAt: new Date().toISOString(),
    notes: 'Kemlite industrial corporate portal redesign with product showcase.',
  },
  {
    id: 'proj_audiology',
    clientName: 'Audiology Clinic',
    clientPhone: '+919822054321',
    projectTitle: 'Hearing Care Clinic Portal',
    totalValue: 5000,
    payments: [
      {
        id: 'pay_audiology_1',
        amount: 5000,
        date: '15 Sep 2026',
        note: 'Final settlement payment received via UPI',
        method: 'UPI',
        recordedAsIncome: true,
      },
    ],
    status: 'completed',
    createdAt: new Date().toISOString(),
    notes: 'Single-page responsive clinic website with appointment booking.',
  },
];

export const createLedgerSlice: StateCreator<AppState, [], [], LedgerSlice> = (set, get) => ({
  contacts: INITIAL_CONTACTS,
  clientProjects: INITIAL_CLIENT_PROJECTS,

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

  addClientProject: async (projectData, initialPayment = 0, addToIncome = false) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const initialPayments =
      initialPayment > 0
        ? [
            {
              id: 'pay_' + Date.now(),
              amount: initialPayment,
              date: dateStr,
              note: 'Advance payment',
              method: 'UPI' as const,
              recordedAsIncome: addToIncome,
            },
          ]
        : [];

    const totalPaid = initialPayment;
    const status: ClientProject['status'] =
      totalPaid >= projectData.totalValue
        ? 'completed'
        : totalPaid > 0
        ? 'payment_pending'
        : 'in_progress';

    const newProject: ClientProject = {
      id: 'proj_' + Date.now(),
      clientName: projectData.clientName.trim(),
      clientPhone: projectData.clientPhone?.trim() || '',
      projectTitle: projectData.projectTitle.trim(),
      totalValue: projectData.totalValue,
      payments: initialPayments,
      status,
      createdAt: now.toISOString(),
      notes: projectData.notes?.trim() || '',
    };

    set((state) => {
      const updated = [newProject, ...state.clientProjects];
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated, activeModal: null };
    });
  },

  addProjectPayment: async (projectId, amount, note = '', method = 'UPI', addToIncome = false) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const newPay = {
      id: 'pay_' + Date.now(),
      amount,
      date: dateStr,
      note: note || `${method} Payment`,
      method,
      recordedAsIncome: addToIncome,
    };

    set((state) => {
      const updated = state.clientProjects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedPayments = [newPay, ...p.payments];
        const totalPaid = updatedPayments.reduce((sum, item) => sum + item.amount, 0);
        const newStatus: ClientProject['status'] =
          totalPaid >= p.totalValue ? 'completed' : 'payment_pending';
        return {
          ...p,
          payments: updatedPayments,
          status: newStatus,
        };
      });

      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated };
    });
  },

  deleteClientProject: async (projectId) => {
    set((state) => {
      const updated = state.clientProjects.filter((p) => p.id !== projectId);
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated, activeModal: null, selectedProjectId: null };
    });
  },
});
