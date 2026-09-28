import { StateCreator } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, SplitSlice } from '../types';
import { SplitBill, SplitParticipant } from '../../types';
import { api } from '../../services/api';

const STORAGE_KEY = '@capitrack_split_bills';

export const createSplitSlice: StateCreator<AppState, [], [], SplitSlice> = (set, get) => ({
  splitBills: [],
  activeSplitFilter: 'ALL',

  setActiveSplitFilter: (filter) => set({ activeSplitFilter: filter }),

  addSplitBill: async (billData, syncWithLedger = true) => {
    const newBill: SplitBill = {
      ...billData,
      id: 'split_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      status: billData.participants.every((p) => p.isPaid) ? 'SETTLED' : 'PENDING',
    };

    const nextBills = [newBill, ...get().splitBills];
    set({ splitBills: nextBills, activeModal: null });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBills)).catch(() => {});

    // Sync with Ledger so contacts tab automatically tracks balances
    if (syncWithLedger) {
      const userPaid = newBill.paidBy.isCurrentUser;
      const payerName = newBill.paidBy.name;

      if (userPaid) {
        // Others owe the current user
        newBill.participants.forEach((p) => {
          if (!p.isCurrentUser && !p.isPaid && p.amount > 0) {
            get().addLedgerEntry(
              p.name,
              p.amount,
              'LENT',
              `Split: ${newBill.title}`
            );
          }
        });
      } else {
        // User owes the payer
        const myPart = newBill.participants.find((p) => p.isCurrentUser);
        if (myPart && !myPart.isPaid && myPart.amount > 0) {
          get().addLedgerEntry(
            payerName,
            myPart.amount,
            'BORROWED',
            `Split: ${newBill.title}`
          );
        }
      }
    }

    try {
      await api.createSplitBill?.(newBill);
    } catch (err) {
      console.warn('Split bill backend sync failed, preserved locally:', err);
    }
  },

  settleSplitParticipant: async (billId, participantId) => {
    const bills = get().splitBills;
    const nextBills = bills.map((bill) => {
      if (bill.id !== billId) return bill;

      const updatedParticipants = bill.participants.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            isPaid: true,
            paidAt: new Date().toISOString(),
          };
        }
        return p;
      });

      const allPaid = updatedParticipants.every((p) => p.isPaid);
      return {
        ...bill,
        participants: updatedParticipants,
        status: allPaid ? ('SETTLED' as const) : ('PENDING' as const),
      };
    });

    set({ splitBills: nextBills });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBills)).catch(() => {});

    try {
      await api.settleSplitParticipant?.(billId, participantId);
    } catch (err) {
      console.warn('Settle split API call failed:', err);
    }
  },

  deleteSplitBill: async (billId) => {
    const nextBills = get().splitBills.filter((b) => b.id !== billId);
    set({ splitBills: nextBills, activeModal: null, selectedSplitBillId: null });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBills)).catch(() => {});

    try {
      await api.deleteSplitBill?.(billId);
    } catch (err) {
      console.warn('Delete split bill API call failed:', err);
    }
  },

  updateSplitBill: async (billId, updates) => {
    const nextBills = get().splitBills.map((b) => {
      if (b.id !== billId) return b;
      const merged = { ...b, ...updates };
      merged.status = merged.participants.every((p) => p.isPaid) ? 'SETTLED' : 'PENDING';
      return merged;
    });

    set({ splitBills: nextBills });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBills)).catch(() => {});

    try {
      await api.updateSplitBill?.(billId, updates);
    } catch (err) {
      console.warn('Update split bill API call failed:', err);
    }
  },
});
