import { useFinance } from '../context/FinanceContext';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useState } from 'react';
import { endOfMonth, getDate, subMonths, isSameMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, Edit2, Check, X } from 'lucide-react';

export function Stats() {
  const { transactions, categories, budgets, setBudget } = useFinance();
  const [activeTab, setActiveTab] = useState<'stats' | 'comparison' | 'budgets'>('stats');
  
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState<string>('');

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Calculate total per category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for chart
  const data = Object.entries(categoryTotals)
    .map(([id, value]) => {
      const cat = categories.find(c => c.id === id);
      return {
        id,
        name: cat?.name || 'Inconnu',
        value,
        color: cat?.color || '#8E8E93',
        emoji: cat?.emoji || '❔'
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by highest expense

  // Comparison Data
  const currentMonthExpenses = expenses.filter(t => isSameMonth(new Date(t.date), new Date()));
  const lastMonthExpenses = expenses.filter(t => isSameMonth(new Date(t.date), subMonths(new Date(), 1)));

  const comparisonData = categories.map(cat => {
    const currentTotal = currentMonthExpenses.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
    const lastTotal = lastMonthExpenses.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
    return {
      name: cat.name,
      current: currentTotal,
      last: lastTotal,
      emoji: cat.emoji
    };
  }).filter(item => item.current > 0 || item.last > 0);

  // Logique Pacing Budgétaire
  const today = new Date();
  const daysInMonth = getDate(endOfMonth(today));
  const currentDay = getDate(today);
  const monthProgress = currentDay / daysInMonth; // e.g., 0.5 on the 15th
  const daysRemaining = daysInMonth - currentDay;

  // Budgets view data
  const budgetData = categories.map(cat => {
    const spent = categoryTotals[cat.id] || 0;
    const budgetObj = budgets.find(b => b.categoryId === cat.id);
    const limit = budgetObj?.amount || 0;
    
    // Si pas de limite, on ne l'affiche pas dans la liste principale des budgets (sauf si dépenses)
    if (limit === 0 && spent === 0) return null;

    let percentage = 0;
    if (limit > 0) {
       percentage = Math.min((spent / limit) * 100, 100);
    }
    
    let statusColor = '#32D74B'; // Vert (Safe)
    if (percentage >= 100) statusColor = '#FF453A'; // Rouge (Depassé)
    else if (percentage >= 80) statusColor = '#FF9F0A'; // Orange (Attention)

    // Calcul Pacing
    let pacingMessage = '';
    let pacingState = 'good'; // good, warning, bad
    
    if (limit > 0) {
      const currentRate = spent / currentDay; // dépenses par jour
      const projectedTotal = spent + (currentRate * daysRemaining);

      if (spent > limit) {
         pacingMessage = 'Budget dépassé !';
         pacingState = 'bad';
      } else if (projectedTotal > limit) {
         // À quel jour on dépasse ?
         const daysToOver = Math.floor((limit - spent) / currentRate);
         pacingMessage = `À ce rythme, dépassement dans ${daysToOver} jour${daysToOver > 1 ? 's' : ''}`;
         pacingState = 'warning';
      } else {
         pacingMessage = 'Dans les clous';
         pacingState = 'good';
      }
    }

    return {
      ...cat,
      spent,
      limit,
      percentage,
      statusColor,
      pacingMessage,
      pacingState,
      hasBudget: limit > 0
    };
  }).filter(Boolean) as Array<any>;

  const handleSaveBudget = async (categoryId: string) => {
    await setBudget(categoryId, Number(editBudgetAmount) || 0);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analyse</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-2xl w-full">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'stats' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50'}`}
        >
          Stats
        </button>
        <button 
          onClick={() => setActiveTab('comparison')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'comparison' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50'}`}
        >
          Comparatif
        </button>
        <button 
          onClick={() => setActiveTab('budgets')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'budgets' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50'}`}
        >
          Budgets
        </button>
      </div>

      {activeTab === 'stats' ? (
        data.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p>Pas assez de données pour les statistiques.</p>
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))}
                    contentStyle={{ backgroundColor: '#1C1C1E', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-muted text-xs font-medium">Total Dépenses</span>
                <span className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalExpenses)}
                </span>
              </div>
            </div>

            {/* Top Categories */}
            <div>
              <h2 className="text-xl font-bold mb-4">Top Catégories</h2>
              <div className="bg-white/5 rounded-3xl p-2 border border-white/5">
                {data.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/5">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.value)}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${(item.value / totalExpenses) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      ) : activeTab === 'comparison' ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Ce mois-ci vs Mois dernier</h2>
          {comparisonData.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <p>Pas de données pour la comparaison.</p>
            </div>
          ) : (
            <div className="h-80 w-full bg-white/5 rounded-3xl p-4 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="emoji" tick={{ fill: '#ffffff50' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#ffffff50' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    formatter={(value: any) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="current" name="Ce mois" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="last" name="Mois dernier" fill="#8E8E93" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        /* Budgets View */
        <div>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">Suivi des Budgets</h2>
             <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-md">
               {daysRemaining} jours restants
             </span>
          </div>
          
          <div className="bg-white/5 rounded-3xl p-2 border border-white/5 space-y-2">
            {budgetData.map(budget => (
              <div key={budget.id} className="p-3 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/5">
                      {budget.emoji}
                    </div>
                    <div>
                      <span className="font-semibold block">{budget.name}</span>
                      {budget.hasBudget && (
                         <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${
                           budget.pacingState === 'bad' ? 'bg-danger/20 text-danger' :
                           budget.pacingState === 'warning' ? 'bg-warning/20 text-warning' :
                           'bg-success/20 text-success'
                         }`}>
                           {budget.pacingMessage}
                         </span>
                      )}
                    </div>
                  </div>
                  
                  {editingBudget === budget.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={editBudgetAmount}
                        onChange={(e) => setEditBudgetAmount(e.target.value)}
                        className="w-20 bg-black/50 border border-white/10 rounded-md px-2 py-1 text-sm outline-none focus:border-accent text-right"
                        autoFocus
                      />
                      <button onClick={() => handleSaveBudget(budget.id)} className="text-success p-1"><Check size={16}/></button>
                      <button onClick={() => setEditingBudget(null)} className="text-danger p-1"><X size={16}/></button>
                    </div>
                  ) : (
                    <div className="text-right flex items-center gap-2 group">
                      <div>
                        <span className="font-bold block text-sm">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(budget.spent)}</span>
                        <span className="text-xs text-white/50">
                          {budget.hasBudget ? `/ ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(budget.limit)}` : 'Pas de limite'}
                        </span>
                      </div>
                      <button 
                        onClick={() => { setEditingBudget(budget.id); setEditBudgetAmount(budget.limit > 0 ? budget.limit.toString() : ''); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/50 hover:text-white"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                {budget.hasBudget && (
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-2 relative">
                    {/* Ligne indiquant où on "devrait" être aujourd'hui */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                      style={{ left: `${monthProgress * 100}%` }}
                    />
                    <motion.div 
                      className="h-full rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${budget.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ backgroundColor: budget.statusColor }}
                    />
                  </div>
                )}
              </div>
            ))}

            {categories.filter(c => !budgetData.find(b => b.id === c.id)).length > 0 && (
               <div className="pt-4 px-2">
                 <p className="text-xs text-white/40 mb-2">Autres catégories</p>
                 <div className="flex flex-wrap gap-2">
                    {categories.filter(c => !budgetData.find(b => b.id === c.id)).map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setEditingBudget(cat.id); setEditBudgetAmount(''); }}
                        className="flex items-center gap-1 text-xs bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:bg-white/10"
                      >
                        <Plus size={12} /> {cat.emoji} {cat.name}
                      </button>
                    ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}