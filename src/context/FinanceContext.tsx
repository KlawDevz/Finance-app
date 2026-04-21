import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  amount: number;
  title: string;
  date: string; // ISO string
  categoryId: string;
  type: TransactionType;
};

export const defaultCategories: Category[] = [
  { id: '1', name: 'Courses', emoji: '🛒', color: '#FF9F0A' }, // iOS Orange
  { id: '2', name: 'Resto', emoji: '🍔', color: '#FF453A' }, // iOS Red
  { id: '3', name: 'Transport', emoji: '🚗', color: '#5E5CE6' }, // iOS Indigo
  { id: '4', name: 'Logement', emoji: '🏠', color: '#0A84FF' }, // iOS Blue
  { id: '5', name: 'Loisirs', emoji: '🎉', color: '#BF5AF2' }, // iOS Purple
  { id: '6', name: 'Tech', emoji: '⚡', color: '#32D74B' }, // iOS Green
  { id: '7', name: 'Santé', emoji: '💊', color: '#FF375F' }, // iOS Pink
  { id: '8', name: 'Salaire', emoji: '💰', color: '#30D158' },
];

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  clearData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: uuidv4(),
    amount: 3000,
    title: 'Salaire Avril',
    date: new Date().toISOString(),
    categoryId: '8',
    type: 'income',
  },
  {
    id: uuidv4(),
    amount: 54.2,
    title: 'Uber Eats',
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // hier
    categoryId: '2',
    type: 'expense',
  },
  {
    id: uuidv4(),
    amount: 120.5,
    title: 'Carrefour',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // avant-hier
    categoryId: '1',
    type: 'expense',
  },
  {
    id: uuidv4(),
    amount: 950,
    title: 'Loyer',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    categoryId: '4',
    type: 'expense',
  },
];

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finance_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
  }, [categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const clearData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")) {
      setTransactions([]);
      setCategories(defaultCategories);
      localStorage.removeItem('finance_transactions');
      localStorage.removeItem('finance_categories');
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        clearData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};