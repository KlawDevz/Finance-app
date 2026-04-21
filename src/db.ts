import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Category, Account, Subscription } from './types';
import { defaultCategories } from './context/FinanceContext';

const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  accounts: EntityTable<Account, 'id'>;
  subscriptions: EntityTable<Subscription, 'id'>;
};

db.version(2).stores({
  transactions: 'id, title, amount, categoryId, type, date, accountId',
  categories: 'id, name, emoji, color',
  accounts: 'id, name, balance, icon',
  subscriptions: 'id, title, amount, categoryId, billingDay'
}).upgrade(tx => {
  // Add default account ID to existing transactions
  return tx.table('transactions').toCollection().modify(transaction => {
    if (!transaction.accountId) transaction.accountId = 'default';
  });
});

db.version(1).stores({
  transactions: 'id, title, amount, categoryId, type, date',
  categories: 'id, name, emoji, color' 
});

// Populate default categories and account
db.on('populate', () => {
  db.categories.bulkAdd(defaultCategories);
  db.accounts.add({
    id: 'default',
    name: 'Compte Courant',
    balance: 0,
    icon: '💳'
  });
});

export { db };
