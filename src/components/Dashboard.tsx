import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { format, subDays, isSameDay } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { transactions, balance, totalIncome, totalExpense, getCategory } = useFinance();

  const balanceData = useMemo(() => {
    const data = [];
    let currentBalance = 0; // Starting from 0 for the mock view, ideally should calculate from history
    
    // Generate last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), date));
      
      const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      currentBalance += (dayIncome - dayExpense);
      
      data.push({
        date: format(date, 'MMM dd'),
        balance: currentBalance,
      });
    }
    return data;
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([id, value]) => ({
        name: getCategory(id)?.name || 'Unknown',
        value,
        color: getCategory(id)?.color || '#8E8E93',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, getCategory]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-panel p-6 sm:p-8 col-span-1 md:col-span-3 lg:col-span-1">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Total Balance</h2>
          <div className="text-4xl sm:text-5xl font-mono tracking-tight font-medium mb-8">
            {formatCurrency(balance)}
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">Income</div>
              <div className="text-success font-mono font-medium">{formatCurrency(totalIncome)}</div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">Expenses</div>
              <div className="text-primary font-mono font-medium">{formatCurrency(totalExpense)}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 h-[300px] col-span-1 md:col-span-2">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Cash Flow</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5E5CE6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5E5CE6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8E8E93', fontSize: 12 }}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8E8E93', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
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
      </div>

      <div className="glass-panel p-6 h-[350px]">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Spending by Category</h2>
        <div className="flex h-full pb-8">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 flex flex-col justify-center gap-3 overflow-y-auto pr-2">
            {expenseByCategory.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-primary">{item.name}</span>
                </div>
                <span className="text-sm font-mono text-muted">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};