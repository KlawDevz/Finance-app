import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Command } from 'lucide-react';
import { Omnibar } from './components/Omnibar';

const cashflowData = [
  { day: '01', amount: 3000 },
  { day: '05', amount: 2800 },
  { day: '10', amount: 2500 },
  { day: '15', amount: 2100 },
  { day: '20', amount: 1800 },
  { day: '25', amount: 1200 },
  { day: '30', amount: 950 },
];

const categoryData = [
  { name: 'Logement', amount: 1200, color: '#00FF9D' },
  { name: 'Alimentation', amount: 400, color: '#FF3366' },
  { name: 'Transport', amount: 150, color: '#A020F0' },
  { name: 'Loisirs', amount: 200, color: '#00BFFF' },
];

function App() {
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);

  // Cmd+K shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOmnibarOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>
          <p className="text-white/50 mt-1">Avril 2026</p>
        </div>
        <button 
          onClick={() => setIsOmnibarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Command className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter (Cmd+K)</span>
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex flex-col justify-between group">
          <div className="flex items-center gap-3 text-white/70 mb-4">
            <div className="p-2 rounded-xl bg-white/5"><Wallet className="w-5 h-5" /></div>
            <span>Solde Total</span>
          </div>
          <div className="text-4xl font-mono font-bold tracking-tighter">€ 12,450.00</div>
        </div>
        
        <div className="glass-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-24 h-24 text-primary" /></div>
          <div className="flex items-center gap-3 text-white/70 mb-4 relative z-10">
            <div className="p-2 rounded-xl bg-primary/20 text-primary"><TrendingUp className="w-5 h-5" /></div>
            <span>Revenus (Avril)</span>
          </div>
          <div className="text-3xl font-mono font-semibold text-primary relative z-10">+ € 3,200.00</div>
        </div>

        <div className="glass-card flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-24 h-24 text-accent" /></div>
          <div className="flex items-center gap-3 text-white/70 mb-4 relative z-10">
            <div className="p-2 rounded-xl bg-accent/20 text-accent"><TrendingDown className="w-5 h-5" /></div>
            <span>Dépenses (Avril)</span>
          </div>
          <div className="text-3xl font-mono font-semibold text-accent relative z-10">- € 1,950.00</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Graph */}
        <div className="glass-card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6 text-white/90">Cashflow (Évolution du solde)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF9D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00FF9D' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#00FF9D" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-6 text-white/90">Dépenses par catégorie</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 12}} width={90} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {
                    categoryData.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />
    </div>
  );
}

export default App;