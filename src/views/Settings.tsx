import { useState } from 'react';
import { useFinance, defaultCategories } from '../context/FinanceContext';
import { Download, Trash2, Plus } from 'lucide-react';
import { cn } from '../utils/cn';

export function Settings() {
  const { categories, addCategory, deleteCategory, clearData, transactions } = useFinance();
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#5E5CE6');
  const [showAddCat, setShowAddCat] = useState(false);

  const handleExport = () => {
    const data = {
      transactions,
      categories
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCategory({ name: newCatName.trim(), emoji: newCatEmoji, color: newCatColor });
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  const isDefaultCategory = (id: string) => defaultCategories.some(c => c.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-3xl font-bold tracking-tight">Réglages</h1>

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
    </div>
  );
}