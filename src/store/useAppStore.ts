import { create } from 'zustand';
import { AppState } from './types';
import { createUserSlice } from './slices/userSlice';
import { createUiSlice } from './slices/uiSlice';
import { createExpenseSlice, computeDayGroup } from './slices/expenseSlice';
import { createLedgerSlice } from './slices/ledgerSlice';
import { createSyncSlice } from './slices/syncSlice';

export const useAppStore = create<AppState>((...a) => ({
  ...createUserSlice(...a),
  ...createUiSlice(...a),
  ...createExpenseSlice(...a),
  ...createLedgerSlice(...a),
  ...createSyncSlice(...a),
}));

export { computeDayGroup };
export type { AppState };

// Backward compatibility aliases
export const usePaisaStore = useAppStore;
export type PaisaState = AppState;
