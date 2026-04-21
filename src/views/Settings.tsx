import { useState } from 'react';
import { useFinance, defaultCategories } from '../context/FinanceContext';
import { Download, Trash2, Plus, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import { db } from '../db';
import 'dexie-export-import';

export function Settings() {
  const { categories, addCategory, deleteCategory, clearData, subscriptions, addSubscription, deleteSubscription } = useFinance();
  const [activeTab, setActiveTab] = useState<'general' | 'subscriptions'>('general');
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#5E5CE6');
  const [showAddCat, setShowAddCat] = useState(false);

  // Subscription state
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [newSubDay, setNewSubDay] = useState('1');
  const [newSubCategory, setNewSubCategory] = useState(categories[0]?.id || '');

  const handleExport = async () => {
    try {
      const blob = await db.export({ prettyJson: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export database:', error);
      alert('Erreur lors de l\'exportation de la base de données.');
    }
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory({ name: newCatName.trim(), emoji: newCatEmoji, color: newCatColor });
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  const handleAddSubscription = () => {
    if (newSubTitle.trim() && newSubAmount && newSubDay && newSubCategory) {
      addSubscription({
        title: newSubTitle.trim(),
        amount: parseFloat(newSubAmount),
        billingDay: parseInt(newSubDay, 10),
        categoryId: newSubCategory
      });
      setNewSubTitle('');
      setNewSubAmount('');
      setShowAddSub(false);
    }
  };

  const isDefaultCategory = (id: string) => defaultCategories.some(c => c.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Réglages</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-2xl w-full">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'general' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50'}`}
        >
          Général
        </button>
        <button 
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'subscriptions' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50'}`}
        >
          Abonnements
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Categories Management */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Catégories</h2>
          <button 
            onClick={() => setShowAddCat(!showAddCat)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <Plus size={18} />
          </button>
        </div>

        {showAddCat && (
          <div className="bg-white/5 rounded-3xl p-4 mb-4 border border-white/5 space-y-4 animate-in fade-in zoom-in-95">
            <input 
              type="text" 
              placeholder="Nom (ex: Abonnements)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
            />
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Emoji"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                maxLength={2}
                className="w-16 bg-black/50 border border-white/10 rounded-xl text-center text-xl outline-none focus:border-accent transition-colors"
              />
              <input 
                type="color" 
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="flex-1 h-12 rounded-xl cursor-pointer bg-transparent"
              />
            </div>
            <button 
              onClick={handleAddCategory}
              className="w-full py-3 bg-accent text-white rounded-xl font-bold"
            >
              Ajouter
            </button>
          </div>
        )}

        <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5">
          {categories.map((cat, index) => (
            <div 
              key={cat.id} 
              className={cn(
                "flex items-center justify-between p-4",
                index !== categories.length - 1 && "border-b border-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.emoji}
                </div>
                <span className="font-medium">{cat.name}</span>
              </div>
              {!isDefaultCategory(cat.id) && (
                <button 
                  onClick={() => deleteCategory(cat.id)}
                  className="text-danger p-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Data Management */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Données</h2>
        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 active:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={20} className="text-accent" />
              <span className="font-medium">Exporter en JSON</span>
            </div>
          </button>

          <button 
            onClick={clearData}
            className="w-full flex items-center justify-between p-4 bg-danger/10 rounded-2xl border border-danger/20 active:bg-danger/20 transition-colors"
          >
            <div className="flex items-center gap-3 text-danger">
              <Trash2 size={20} />
              <span className="font-medium">Effacer toutes les données</span>
            </div>
          </button>
        </div>
      </section>

      <div className="text-center text-muted text-xs pt-8">
        <p>Finance App MVP - Build for iOS</p>
        <p>Made by KlawDevz</p>
      </div>
        </>
      ) : (
        /* Subscriptions Management */
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Abonnements Récurrents</h2>
            <button 
              onClick={() => setShowAddSub(!showAddSub)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <Plus size={18} />
            </button>
          </div>

          {showAddSub && (
            <div className="bg-white/5 rounded-3xl p-4 mb-4 border border-white/5 space-y-4 animate-in fade-in zoom-in-95">
              <input 
                type="text" 
                placeholder="Titre (ex: Netflix, Loyer)"
                value={newSubTitle}
                onChange={(e) => setNewSubTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
              />
              <div className="flex gap-4">
                <input 
                  type="number" 
                  placeholder="Montant"
                  value={newSubAmount}
                  onChange={(e) => setNewSubAmount(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                />
                <input 
                  type="number" 
                  min="1" max="31"
                  placeholder="Jour"
                  value={newSubDay}
                  onChange={(e) => setNewSubDay(e.target.value)}
                  className="w-24 bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-center"
                />
              </div>
              <select
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              <button 
                onClick={handleAddSubscription}
                className="w-full py-3 bg-accent text-white rounded-xl font-bold"
              >
                Ajouter
              </button>
            </div>
          )}

          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="text-center py-10 text-white/50">Aucun abonnement configuré</div>
            ) : (
              subscriptions.sort((a, b) => a.billingDay - b.billingDay).map((sub) => {
                const cat = categories.find(c => c.id === sub.categoryId) || categories[0];
                return (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/10">
                        {cat?.emoji || '🔄'}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{sub.title}</div>
                        <div className="text-xs text-white/50 flex items-center gap-1">
                          <Calendar size={12} /> Le {sub.billingDay} du mois
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-bold font-sans">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sub.amount)}
                      </div>
                      <button 
                        onClick={() => deleteSubscription(sub.id)}
                        className="text-danger/70 hover:text-danger p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
}