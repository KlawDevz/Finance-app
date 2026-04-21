import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { format, isToday, isYesterday } from 'date-fns';

export const TransactionList: React.FC = () => {
  const { transactions, getCategory } = useFinance();

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-medium text-muted mb-4 border-b border-surfaceBorder pb-2">
            {formatDateLabel(date)}
          </h3>
          <div className="space-y-2">
            {dayTransactions.map((transaction) => {
              const category = getCategory(transaction.categoryId);
              if (!category) return null;

              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-surface border border-surfaceBorder shrink-0"
                      style={{ boxShadow: `0 0 20px ${category.color}15` }}
                    >
                      {category.emoji}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base sm:text-lg font-medium text-primary truncate">
                        {transaction.title}
                      </span>
                      <span className="text-xs sm:text-sm text-muted">
                        {category.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 pl-4">
                    <span className={`text-base sm:text-lg font-mono font-medium tracking-tight ${
                      transaction.type === 'expense' ? 'text-primary' : 'text-success'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No transactions yet.</p>
        </div>
      )}
    </div>
  );
};