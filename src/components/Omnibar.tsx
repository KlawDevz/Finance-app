import { useState, useEffect } from 'react';
import { Command, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export function Omnibar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm">
      <div 
        className="fixed inset-0 z-[-1]" 
        onClick={onClose}
      />
      <div className={cn(
        "w-full max-w-2xl transform overflow-hidden rounded-3xl",
        "bg-[#111111] border border-white/10 shadow-2xl transition-all",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Command className="w-5 h-5 text-white/50 mr-3" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-xl text-white placeholder-white/30 outline-none font-mono"
            placeholder="Ex: 15€ Starbucks café hier..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {inputValue && (
            <button className="p-1 hover:bg-white/10 rounded-full transition-colors group">
              <Sparkles className="w-5 h-5 text-primary group-hover:text-primary/80" />
            </button>
          )}
        </div>
        
        {inputValue && (
          <div className="p-4 bg-white/[0.02]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50 flex items-center gap-2">
                Appuyez sur <kbd className="px-2 py-1 bg-white/10 rounded-md text-white/70 font-mono text-xs">Entrée</kbd> pour valider
              </span>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-white/70 font-mono">15.00 €</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-white/70">☕ Café</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}