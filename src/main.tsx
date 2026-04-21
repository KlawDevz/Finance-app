import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Stats } from './views/Stats';
import { Settings } from './views/Settings';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <FinanceProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'settings' && <Settings />}
      </Layout>
    </FinanceProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);