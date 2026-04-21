import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Category, Subscription, Budget } from './types';
import { defaultCategories } from './context/FinanceContext';

const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  subscriptions: EntityTable<Subscription, 'id'>;
  budgets: EntityTable<Budget, 'id'>;
};

db.version(3).stores({
  transactions: 'id, title, amount, categoryId, type, date',
  categories: 'id, name, emoji, color',
  subscriptions: 'id, title, amount, categoryId, billingDay',
  budgets: 'id, categoryId, amount'
});

db.version(2).stores({
  transactions: 'id, title, amount, categoryId, type, date',
  categories: 'id, name, emoji, color',
  subscriptions: 'id, title, amount, categoryId, billingDay'
});

db.version(1).stores({
  transactions: 'id, title, amount, categoryId, type, date',
  categories: 'id, name, emoji, color' 
});

// Populate default categories
db.on('populate', () => {
  db.categories.bulkAdd(defaultCategories);
});

export { db };
