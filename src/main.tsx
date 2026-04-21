import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Stats } from './views/Stats';
import { Settings } from './views/Settings';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const pageVariants = {
    initial: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
    in: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    out: { opacity: 0, scale: 1.04, filter: 'blur(8px)' }
  };

  const pageTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1.5
  };

  return (
    <FinanceProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            {activeTab === 'home' && <Dashboard />}
            {activeTab === 'transactions' && <Transactions />}
            {activeTab === 'stats' && <Stats />}
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </FinanceProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);