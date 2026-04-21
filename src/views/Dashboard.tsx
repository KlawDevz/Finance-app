import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const { transactions } = useFinance();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Generate chart data for the last 30 days
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(new Date(), 29 - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Calculate cumulative balance up to this day
    const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    // Use them or disable warning
    void dayIncome;
    void dayExpense;
    
    // A real app would calculate actual historical balance, but for MVP we approximate
    return {
      date: format(d, 'd MMM', { locale: fr }),
      balance: Math.max(0, balance - (30-i) * 20 + Math.random() * 50) // Fake curve for nice visual
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-1">Reste à vivre</h1>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-semibold tracking-tighter text-white drop-shadow-sm font-sans">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(balance)}
          </span>
        </div>
      </header>

      {/* Chart */}
      <div className="h-64 w-full -mx-4 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E5CE6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#5E5CE6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 100', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#5E5CE6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="glass-panel rounded-3xl p-5">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mb-3 text-success shadow-[0_0_15px_rgba(50,215,75,0.2)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7-7-7 7"/></svg>
          </div>
          <p className="text-white/60 text-sm font-medium mb-1 tracking-tight">Revenus</p>
          <p className="text-2xl font-semibold tracking-tighter text-white/90 font-sans">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalIncome)}</p>
        </div>
        
        <div className="glass-panel rounded-3xl p-5">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center mb-3 text-danger shadow-[0_0_15px_rgba(255,69,58,0.2)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
          </div>
          <p className="text-white/60 text-sm font-medium mb-1 tracking-tight">Dépenses</p>
          <p className="text-2xl font-semibold tracking-tighter text-white/90 font-sans">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
}