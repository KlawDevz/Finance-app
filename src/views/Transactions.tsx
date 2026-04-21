import { useFinance } from '../context/FinanceContext';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';

export function Transactions() {
  const { transactions, categories } = useFinance();

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
      
      {sortedDates.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p>Aucune transaction pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date} className="space-y-4">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider sticky top-0 bg-black/80 backdrop-blur-md py-2 z-10">
                {getDayLabel(date)}
              </h2>
              
              <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                {groupedTransactions[date].map((t, index) => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  return (
                    <div 
                      key={t.id} 
                      className={cn(
                        "flex items-center justify-between p-4 bg-transparent",
                        index !== groupedTransactions[date].length - 1 && "border-b border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat?.color || '#8E8E93'}20`, color: cat?.color || '#8E8E93' }}
                        >
                          {cat?.emoji || '❔'}
                        </div>
                        <div>
                          <p className="font-semibold">{t.title}</p>
                          <p className="text-xs text-muted">{cat?.name || 'Inconnu'}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "font-bold",
                        t.type === 'expense' ? "text-primary" : "text-success"
                      )}>
                        {t.type === 'expense' ? '-' : '+'}
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}