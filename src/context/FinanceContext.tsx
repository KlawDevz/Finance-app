import { type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { type Subscription, type Transaction, type Category } from '../types';

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

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useFinance = () => {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray(), []) || [];

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    await db.transactions.add(newTransaction);
  };

  const deleteTransaction = async (id: string) => {
    await db.transactions.delete(id);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };
    await db.categories.add(newCategory);
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
  };

  const addSubscription = async (sub: Omit<Subscription, 'id'>) => {
    const newSub: any = {
      ...sub,
      id: uuidv4(),
    };
    await db.subscriptions.add(newSub);
  };

  const deleteSubscription = async (id: string) => {
    await db.subscriptions.delete(id);
  };

  const clearData = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")) {
      await db.transactions.clear();
      await db.categories.clear();
      await db.subscriptions.clear();
      await db.categories.bulkAdd(defaultCategories);
    }
  };

  return {
    transactions,
    categories,
    subscriptions,
    addTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addSubscription,
    deleteSubscription,
    clearData,
  };
};