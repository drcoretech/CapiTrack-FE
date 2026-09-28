import { AppCategory, Expense, Person } from '../types';

export const INITIAL_CATEGORIES: AppCategory[] = [
  { id: 'Food', name: 'Food', icon: '🍔', isDefault: true, enabled: true },
  { id: 'Travel', name: 'Travel', icon: '🚕', isDefault: true, enabled: true },
  { id: 'Grocery', name: 'Grocery', icon: '🛒', isDefault: true, enabled: true },
  { id: 'Fun', name: 'Fun', icon: '🎬', isDefault: true, enabled: true },
  { id: 'Health', name: 'Health', icon: '💊', isDefault: true, enabled: true },
  { id: 'Shopping', name: 'Shopping', icon: '🛍️', isDefault: true, enabled: true },
  { id: 'Bills', name: 'Bills', icon: '💡', isDefault: true, enabled: true },
  { id: 'Custom', name: 'Custom', icon: '➕', isDefault: true, enabled: true },
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_CONTACTS: Person[] = [
  {
    id: 'p1',
    name: 'Akssh',
    initial: 'A',
    lastDate: '3 Sep',
    netBalance: 1400,
    status: 'pending',
    transactions: [
      {
        id: 't1',
        note: 'Lent in cash',
        date: '3 Sep 2026',
        amount: 1400,
        direction: 'LENT',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Anurag',
    initial: 'A',
    lastDate: '10 Sep',
    netBalance: 850,
    status: 'pending',
    transactions: [
      {
        id: 't2',
        note: 'Weekend lunch split',
        date: '10 Sep 2026',
        amount: 850,
        direction: 'LENT',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Sahil',
    initial: 'S',
    lastDate: '1 Sep',
    netBalance: -900,
    status: 'pending',
    transactions: [
      {
        id: 't3',
        note: 'Borrowed for cab',
        date: '1 Sep 2026',
        amount: 900,
        direction: 'BORROWED',
      },
    ],
  },
];
