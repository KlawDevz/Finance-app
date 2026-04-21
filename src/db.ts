import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Category } from './types';
import { defaultCategories } from './context/FinanceContext';

const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

db.version(1).stores({
  transactions: 'id, title, amount, categoryId, type, date',
  categories: 'id, name, emoji, color' 
});

// Populate default categories
db.on('populate', () => {
  db.categories.bulkAdd(defaultCategories);
});

export { db };
