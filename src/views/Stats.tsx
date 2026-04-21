import { useFinance } from '../context/FinanceContext';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Stats() {
  const { transactions, categories } = useFinance();

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>

      {data.length === 0 ? (
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
      )}
    </div>
  );
}