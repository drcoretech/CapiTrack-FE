import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, LedgerSlice } from '../types';
import { Person, ClientProject } from '../../types';
import { api } from '../../services/api';
import { markEntityDeleted } from './syncSlice';

export const createLedgerSlice: StateCreator<AppState, [], [], LedgerSlice> = (set, get) => ({
  contacts: [],
  clientProjects: [],

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
        const nextList = [newContact, ...state.contacts];
        AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(nextList)).catch(() => {});
        return { contacts: nextList, activeModal: null };
      }
    });

    AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(get().contacts)).catch(() => {});

    try {
      const res = await api.addTransaction({
        personName: trimmedName,
        amount,
        type: direction,
        note,
      });
      if (res && res.success && res.person) {
        set((state) => {
          const updated = state.contacts.map((c) => {
            if (c.name.toLowerCase() === trimmedName.toLowerCase()) {
              return {
                ...c,
                id: res.person.id || c.id,
                netBalance: res.person.netBalance !== undefined ? res.person.netBalance : c.netBalance,
                status: res.person.status || c.status,
              };
            }
            return c;
          });
          AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(updated)).catch(() => {});
          return { contacts: updated };
        });
      }
      get().refreshDashboard();
    } catch {}
  },

  updateLedgerEntry: async (personId, txnId, updates) => {
    const contacts = get().contacts;
    const targetContact = contacts.find((c) => c.id === personId);
    if (!targetContact) return;

    const currentTxns = targetContact.transactions || [];
    const updatedTxns = currentTxns.map((t) => {
      if (t.id === txnId) {
        return {
          ...t,
          amount: updates.amount !== undefined ? updates.amount : t.amount,
          direction: (updates.direction !== undefined ? updates.direction : t.direction) as any,
          note: updates.note !== undefined ? updates.note : t.note,
          date: updates.date !== undefined ? updates.date : t.date,
        };
      }
      return t;
    });

    const newNetBalance = updatedTxns.reduce((sum, t) => {
      if (t.direction === 'LENT') return sum + t.amount;
      if (t.direction === 'BORROWED') return sum - t.amount;
      return sum;
    }, 0);

    const updatedContactName = updates.personName?.trim() || targetContact.name;

    const nextContacts = contacts.map((c) => {
      if (c.id === personId) {
        return {
          ...c,
          name: updatedContactName,
          initial: updatedContactName[0].toUpperCase(),
          netBalance: newNetBalance,
          status: (newNetBalance === 0 ? 'settled' : 'pending') as 'settled' | 'pending',
          transactions: updatedTxns,
        };
      }
      return c;
    });

    set({
      contacts: nextContacts,
      editingLedgerTxn: null,
      activeModal: null,
    });

    AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(nextContacts)).catch(() => {});
    get().refreshDashboard();
  },

  deleteLedgerEntry: async (personId, txnId) => {
    const contacts = get().contacts;
    const targetContact = contacts.find((c) => c.id === personId);
    if (!targetContact) return;

    const currentTxns = targetContact.transactions || [];
    const remainingTxns = currentTxns.filter((t) => t.id !== txnId);

    markEntityDeleted(txnId);

    let nextContacts: Person[];
    if (remainingTxns.length === 0) {
      markEntityDeleted(personId);
      if (targetContact.name) markEntityDeleted(targetContact.name);
      nextContacts = contacts.filter((c) => c.id !== personId);
    } else {
      const newNetBalance = remainingTxns.reduce((sum, t) => {
        if (t.direction === 'LENT') return sum + t.amount;
        if (t.direction === 'BORROWED') return sum - t.amount;
        return sum;
      }, 0);

      nextContacts = contacts.map((c) => {
        if (c.id === personId) {
          return {
            ...c,
            netBalance: newNetBalance,
            status: (newNetBalance === 0 ? 'settled' : 'pending') as 'settled' | 'pending',
            transactions: remainingTxns,
          };
        }
        return c;
      });
    }

    set({
      contacts: nextContacts,
      editingLedgerTxn: null,
      activeModal: null,
    });

    AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(nextContacts)).catch(() => {});
    get().refreshDashboard();
  },

  deletePerson: async (personId, personName) => {
    const contacts = get().contacts;
    const target = contacts.find(
      (c) => c.id === personId || (personName && c.name.toLowerCase() === personName.toLowerCase())
    );
    const finalId = target?.id || personId;
    const finalName = target?.name || personName || '';

    markEntityDeleted(finalId);
    if (finalName) markEntityDeleted(finalName);
    if (target?.transactions && Array.isArray(target.transactions)) {
      target.transactions.forEach((t) => t?.id && markEntityDeleted(t.id));
    }

    const nextContacts = contacts.filter(
      (c) => c.id !== finalId && (!finalName || c.name.toLowerCase() !== finalName.toLowerCase())
    );
    set({
      contacts: nextContacts,
      editingLedgerTxn: null,
      selectedPersonId: null,
      activeModal: null,
    });

    AsyncStorage.setItem('@capitrack_contacts', JSON.stringify(nextContacts)).catch(() => {});

    try {
      await api.deleteContact(finalId, finalName);
      get().refreshDashboard();
    } catch (err) {
      console.warn('Delete contact API failed, preserved locally:', err);
    }
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

  addClientProject: async (projectData, initialPayment = 0, addToIncome = false, paymentDate?: string) => {
    const now = new Date();
    const dateStr = paymentDate || now.toISOString();
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
      createdAt: paymentDate || now.toISOString(),
      notes: projectData.notes?.trim() || '',
    };

    set((state) => {
      const updated = [newProject, ...state.clientProjects];
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated, activeModal: null };
    });

    try {
      const res = await api.createProject(projectData, initialPayment, addToIncome, paymentDate);
      if (res.success && res.project) {
        set((state) => {
          const mergedProject: ClientProject = {
            ...res.project,
            createdAt: paymentDate || res.project.createdAt || newProject.createdAt,
            payments: (res.project.payments || []).map((p, idx) => {
              if (idx === 0 && paymentDate) {
                return { ...p, date: paymentDate };
              }
              return p;
            }),
          };
          const replaced = state.clientProjects.map((p) =>
            p.id === newProject.id ? mergedProject : p
          );
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(replaced)).catch(() => {});
          return { clientProjects: replaced };
        });
      }
    } catch {}
  },

  addProjectPayment: async (projectId, amount, note = '', method = 'UPI', addToIncome = false, paymentDate?: string) => {
    const now = new Date();
    const dateStr = paymentDate || now.toISOString();
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

    try {
      const res = await api.addProjectPayment(projectId, amount, note, method, addToIncome, paymentDate);
      if (res.success && res.project) {
        set((state) => {
          const mergedProject: ClientProject = {
            ...res.project,
            payments: (res.project.payments || []).map((p) => {
              if (p.note === (note || `${method} Payment`) && paymentDate) {
                return { ...p, date: paymentDate };
              }
              return p;
            }),
          };
          const synced = state.clientProjects.map((p) =>
            p.id === projectId ? mergedProject : p
          );
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(synced)).catch(() => {});
          return { clientProjects: synced };
        });
      }
    } catch {}
  },

  updateClientProject: async (projectId, updates) => {
    set((state) => {
      const updated = state.clientProjects.map((p) => {
        if (p.id !== projectId) return p;
        const totalValue = updates.totalValue !== undefined ? updates.totalValue : p.totalValue;
        const totalPaid = (p.payments || []).reduce((sum, item) => sum + item.amount, 0);
        const newStatus: ClientProject['status'] =
          totalPaid >= totalValue ? 'completed' : totalPaid > 0 ? 'payment_pending' : 'in_progress';
        return {
          ...p,
          ...updates,
          totalValue,
          status: newStatus,
        };
      });
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated };
    });

    try {
      const res = await api.updateProject(projectId, updates);
      if (res.success && res.project) {
        set((state) => {
          const synced = state.clientProjects.map((p) =>
            p.id === projectId ? { ...res.project, ...updates } : p
          );
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(synced)).catch(() => {});
          return { clientProjects: synced };
        });
      }
    } catch (err) {
      console.warn('Update project API failed, preserved locally:', err);
    }
  },

  updateProjectPayment: async (projectId, paymentId, updates) => {
    set((state) => {
      const updated = state.clientProjects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedPayments = (p.payments || []).map((pay) => {
          if (pay.id !== paymentId) return pay;
          return { ...pay, ...updates };
        });
        const totalPaid = updatedPayments.reduce((sum, item) => sum + item.amount, 0);
        const newStatus: ClientProject['status'] =
          totalPaid >= p.totalValue ? 'completed' : totalPaid > 0 ? 'payment_pending' : 'in_progress';
        return {
          ...p,
          payments: updatedPayments,
          status: newStatus,
        };
      });
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated };
    });

    try {
      const res = await api.updateProjectPayment(projectId, paymentId, updates);
      if (res.success && res.project) {
        set((state) => {
          const synced = state.clientProjects.map((p) =>
            p.id === projectId ? res.project : p
          );
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(synced)).catch(() => {});
          return { clientProjects: synced };
        });
      }
    } catch (err) {
      console.warn('Update payment API failed, preserved locally:', err);
    }
  },

  deleteProjectPayment: async (projectId, paymentId) => {
    set((state) => {
      const updated = state.clientProjects.map((p) => {
        if (p.id !== projectId) return p;
        const updatedPayments = (p.payments || []).filter((pay) => pay.id !== paymentId);
        const totalPaid = updatedPayments.reduce((sum, item) => sum + item.amount, 0);
        const newStatus: ClientProject['status'] =
          totalPaid >= p.totalValue ? 'completed' : totalPaid > 0 ? 'payment_pending' : 'in_progress';
        return {
          ...p,
          payments: updatedPayments,
          status: newStatus,
        };
      });
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated };
    });

    try {
      const res = await api.deleteProjectPayment(projectId, paymentId);
      if (res.success && res.project) {
        set((state) => {
          const synced = state.clientProjects.map((p) =>
            p.id === projectId ? res.project : p
          );
          AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(synced)).catch(() => {});
          return { clientProjects: synced };
        });
      }
    } catch (err) {
      console.warn('Delete payment API failed, preserved locally:', err);
    }
  },

  deleteClientProject: async (projectId) => {
    markEntityDeleted(projectId);
    set((state) => {
      const updated = state.clientProjects.filter((p) => p.id !== projectId);
      AsyncStorage.setItem('@capitrack_client_projects', JSON.stringify(updated)).catch(() => {});
      return { clientProjects: updated, activeModal: null, selectedProjectId: null };
    });

    try {
      await api.deleteProject(projectId);
    } catch {}
  },
});
