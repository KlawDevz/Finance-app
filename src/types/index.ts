export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
}

export interface Subscription {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  billingDay: number;
}

export interface Transaction {
  id: string;
  amount: number;
  title: string;
  categoryId: string;
  date: string;
  type: TransactionType;
  tags?: string[];
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#FF9F0A' },
  { id: 'transport', name: 'Transport', emoji: '🚗', color: '#0A84FF' },
  { id: 'housing', name: 'Housing', emoji: '🏠', color: '#5E5CE6' },
  { id: 'utilities', name: 'Utilities', emoji: '⚡', color: '#FFD60A' },
  { id: 'shopping', name: 'Shopping', emoji: '🛒', color: '#FF453A' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎮', color: '#BF5AF2' },
  { id: 'software', name: 'Software/Cloud', emoji: '💻', color: '#64D2FF' },
  { id: 'health', name: 'Health', emoji: '💊', color: '#FF375F' },
  { id: 'income', name: 'Income', emoji: '💰', color: '#32D74B' },
];