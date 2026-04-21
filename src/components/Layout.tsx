import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ScrollText, PieChart, Settings, Plus, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useFinance } from '../context/FinanceContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-primary overflow-hidden font-sans pb-24 relative">
      {/* Background Vibrancy Mesh/Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] bg-indigo-900/40 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] left-[10%] w-[80vw] h-[80vw] bg-blue-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Main Content Area */}
      <main className="h-full overflow-y-auto px-4 pt-12 relative z-10">
        {children}
      </main>

      {/* Glassmorphism Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/[0.01] backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)] z-40 pb-safe before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:to-white/[0.02] before:pointer-events-none">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-6 relative">
          
          <NavIcon 
            icon={<Home />} 
            label="Home" 
            isActive={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavIcon 
            icon={<ScrollText />} 
            label="Transactions" 
            isActive={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')} 
          />

          {/* FAB Placeholder for spacing */}
          <div className="w-16" /> 

          <NavIcon 
            icon={<PieChart />} 
            label="Stats" 
            isActive={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
          <NavIcon 
            icon={<Settings />} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />

          {/* Floating Action Button (FAB) */}
          <div className="absolute left-1/2 -top-8 -translate-x-1/2">
            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                "w-[68px] h-[68px] rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/20",
                "transition-all duration-300 active:scale-95",
                isModalOpen && "rotate-45 bg-gradient-to-br from-neutral-800 to-neutral-900 border-white/10 shadow-none"
              )}
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              {isModalOpen ? <X size={32} className="text-white relative z-10" /> : <Plus size={36} className="text-white drop-shadow-md relative z-10" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10 rounded-t-[2.5rem] z-50 overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <AddTransactionModal onClose={() => setIsModalOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavIcon = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center w-12 gap-1 transition-colors",
      isActive ? "text-primary" : "text-muted"
    )}
  >
    <div className={cn("transition-transform duration-300", isActive && "scale-110")}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
    </div>
    <span className="text-[10px] font-medium tracking-tight">{label}</span>
  </button>
);

// Add Transaction Modal Content
function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('0');
  const [step, setStep] = useState<'numpad' | 'category' | 'account'>('numpad');
  const [selectedCategory, setSelectedCategory] = useState<{id: string, type: 'income' | 'expense'} | null>(null);
  const { categories, accounts, addTransaction } = useFinance();

  const handleNumpadClick = (val: string) => {
    if (val === 'DEL') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === ',') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => prev === '0' ? val : prev + val);
    }
  };

  const handleCategorySelect = (categoryId: string, type: 'income' | 'expense') => {
    setSelectedCategory({ id: categoryId, type });
    if (accounts.length <= 1) {
      // If only one account (or none but default exists), auto select and save
      saveTransaction(categoryId, type, accounts[0]?.id || 'default');
    } else {
      setStep('account');
    }
  };

  const saveTransaction = (categoryId: string, type: 'income' | 'expense', accountId: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      addTransaction({
        amount: numAmount,
        title: categories.find(c => c.id === categoryId)?.name || 'Dépense',
        categoryId,
        type,
        accountId
      });
      onClose();
    }
  };

  const handleAccountSelect = (accountId: string) => {
    if (selectedCategory) {
      saveTransaction(selectedCategory.id, selectedCategory.type, accountId);
    }
  };

  const formattedAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(amount || '0'));

  return (
    <div className="flex flex-col h-[75vh] max-h-[800px]">
      <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-6" />
      
      <div className="flex-1 flex flex-col px-6 pb-8">
        {/* Amount Display */}
        <div className="flex flex-col items-center justify-center py-8">
          <span className="text-muted font-medium mb-2">Montant</span>
          <span className={cn(
            "text-6xl font-bold tracking-tighter transition-all duration-300",
            amount !== '0' ? "text-white" : "text-white/30"
          )}>
            {formattedAmount}
          </span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'numpad' ? (
              <motion.div 
                key="numpad"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="h-full flex flex-col"
              >
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'DEL'].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleNumpadClick(btn)}
                      className="bg-white/5 active:bg-white/10 rounded-2xl text-2xl font-medium transition-colors flex items-center justify-center"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => parseFloat(amount) > 0 && setStep('category')}
                  className={cn(
                    "mt-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300",
                    parseFloat(amount) > 0 
                      ? "bg-accent text-white shadow-[0_0_20px_rgba(94,92,230,0.3)]" 
                      : "bg-white/10 text-white/30 pointer-events-none"
                  )}
                >
                  Suivant
                </button>
              </motion.div>
            ) : step === 'category' ? (
              <motion.div 
                key="categories"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="h-full overflow-y-auto pb-6"
              >
                <h3 className="text-xl font-bold mb-4">Sélectionner une catégorie</h3>
                <div className="grid grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id, cat.name === 'Salaire' ? 'income' : 'expense')}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 active:bg-white/10 transition-colors"
                    >
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.emoji}
                      </div>
                      <span className="text-xs text-muted font-medium text-center truncate w-full">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="accounts"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="h-full overflow-y-auto pb-6"
              >
                <h3 className="text-xl font-bold mb-4">Sélectionner le compte</h3>
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleAccountSelect(acc.id)}
                      className="flex items-center w-full gap-4 p-4 rounded-2xl bg-white/5 active:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10">
                        {acc.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-lg">{acc.name}</div>
                        <div className="text-sm text-white/50">Solde: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(acc.balance)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}