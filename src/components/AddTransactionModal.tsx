import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<'expense' | 'income'>('expense');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title) return;

    addTransaction({
      amount: parseFloat(amount),
      title,
      categoryId,
      date: new Date(date).toISOString(),
      type,
    });
    
    setAmount('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div 
        className="w-full max-w-md glass-panel p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">New Transaction</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'}`}
            onClick={() => { setType('expense'); setCategoryId('food'); }}
          >
            Expense
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'}`}
            onClick={() => { setType('income'); setCategoryId('income'); }}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-muted">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full glass-input py-4 pl-10 pr-4 text-3xl font-semibold placeholder:text-white/20"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input p-4 text-lg"
              placeholder="e.g. Uber Eats"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full glass-input p-4 text-base appearance-none bg-background/50"
              >
                {CATEGORIES.filter(c => type === 'expense' ? c.id !== 'income' : c.id === 'income').map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-background text-primary">
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input p-4 text-base [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-primary text-black font-semibold py-4 rounded-xl text-lg hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};