import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Transaction, Category } from '../types';
import { CATEGORIES } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Some mock data for the preview
const MOCK_DATA: Transaction[] = [
  { id: '1', amount: 3200, title: 'Salary', categoryId: 'income', date: new Date().toISOString(), type: 'income' },
  { id: '2', amount: 15.50, title: 'Uber Eats', categoryId: 'food', date: new Date().toISOString(), type: 'expense' },
  { id: '3', amount: 45.00, title: 'AWS Cloud', categoryId: 'software', date: new Date(Date.now() - 86400000).toISOString(), type: 'expense' },
  { id: '4', amount: 120.00, title: 'Groceries', categoryId: 'shopping', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'expense' },
];

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_DATA;
      }
    }
    return MOCK_DATA;
  });

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getCategory = (id: string) => CATEGORIES.find(c => c.id === id);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      getCategory,
      balance,
      totalIncome,
      totalExpense
    }}>
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