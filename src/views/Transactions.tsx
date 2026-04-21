import { useFinance } from '../context/FinanceContext';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Trash2, Edit } from 'lucide-react';

export function Transactions() {
  const { transactions, categories, deleteTransactions } = useFinance();
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fuse = useMemo(() => new Fuse(transactions, {
    keys: ['title', 'amount', 'date', 'tags'],
    threshold: 0.3,
  }), [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!search) return transactions;
    
    // Quick regex for amount comparison like ">50" or "<100"
    const amountMatch = search.match(/^([><])(\d+)$/);
    if (amountMatch) {
      const operator = amountMatch[1];
      const value = Number(amountMatch[2]);
      return transactions.filter(t => operator === '>' ? t.amount > value : t.amount < value);
    }
    
    // Tag search like "#vacances"
    if (search.startsWith('#')) {
      const tag = search.slice(1).toLowerCase();
      return transactions.filter(t => t.tags?.some(tg => tg.toLowerCase().includes(tag)));
    }
    
    // Normal fuse search
    return fuse.search(search).map(result => result.item);
  }, [search, transactions, fuse]);

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
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

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Supprimer ${selectedIds.size} transaction(s) ?`)) {
      await deleteTransactions(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
          <button 
            onClick={() => {
              setIsEditing(!isEditing);
              setSelectedIds(new Set());
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
        
        {isEditing && selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-primary/20 text-primary px-4 py-3 rounded-2xl animate-in fade-in">
            <span className="font-semibold">{selectedIds.size} sélectionnée(s)</span>
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-bold"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        )}

        <input 
          type="text" 
          placeholder="Rechercher... (ex: >50, #vacances)" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md"
        />
      </div>
      
      {sortedDates.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p>{search ? 'Aucune transaction trouvée.' : 'Aucune transaction pour le moment.'}</p>
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
                      onClick={() => isEditing && toggleSelection(t.id)}
                      className={cn(
                        "flex items-center justify-between p-4 transition-colors cursor-pointer",
                        index !== groupedTransactions[date].length - 1 && "border-b border-white/5",
                        selectedIds.has(t.id) ? "bg-white/10" : "bg-transparent hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {isEditing && (
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            selectedIds.has(t.id) ? "border-primary bg-primary" : "border-white/30"
                          )}>
                            {selectedIds.has(t.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        )}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat?.color || '#8E8E93'}20`, color: cat?.color || '#8E8E93' }}
                        >
                          {cat?.emoji || '❔'}
                        </div>
                        <div>
                          <p className="font-semibold">{t.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted">{cat?.name || 'Inconnu'}</p>
                            {t.tags && t.tags.length > 0 && (
                              <div className="flex gap-1">
                                {t.tags.map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/70">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
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