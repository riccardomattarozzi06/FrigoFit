import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Plus, X, Check } from 'lucide-react';
import type { IngredientItem, IngredientOrigin } from '../types';

interface IngredientTagsProps {
  ingredients: IngredientItem[];
  isAnalyzing: boolean;
  onAddIngredient: (name: string, origin?: IngredientOrigin) => void;
  onUpdateIngredient: (id: string, newName: string) => void;
  onRemoveIngredient: (id: string) => void;
}

const PANTRY_STAPLES = [
  'Olio EVO',
  'Sale e pepe',
  'Aglio',
  'Limone',
  'Spezie miste',
  'Salsa di soia',
];

export function IngredientTags({
  ingredients,
  isAnalyzing,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
}: IngredientTagsProps) {
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = newItemName.trim();
    if (!cleaned) return;
    onAddIngredient(cleaned, 'dispensa');
    setNewItemName('');
  };

  const startEditing = (item: IngredientItem) => {
    setEditingId(item.id);
    setEditingValue(item.name);
  };

  const commitEdit = (id: string) => {
    const cleaned = editingValue.trim();
    if (cleaned) {
      onUpdateIngredient(id, cleaned);
    }
    setEditingId(null);
    setEditingValue('');
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingValue('');
    }
  };

  const existingNormalized = new Set(ingredients.map((i) => i.name.trim().toLowerCase()));

  return (
    <div className="space-y-3.5 pt-5 border-t border-slate-100">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-slate-900">
          Ingredienti disponibili
        </h3>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {ingredients.length} {ingredients.length === 1 ? 'alimento' : 'alimenti'}
        </span>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          <div className="h-8 w-28 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      ) : ingredients.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((item) => {
            const isEditing = editingId === item.id;
            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500 bg-white px-2 py-1"
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => commitEdit(item.id)}
                    onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                    autoFocus
                    aria-label="Modifica nome ingrediente"
                    className="w-32 text-sm text-slate-900 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commitEdit(item.id);
                    }}
                    aria-label="Conferma modifica"
                    className="p-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`inline-flex items-center gap-1.5 rounded-lg border pl-2.5 pr-1.5 py-1 text-sm transition-colors ${
                  item.origin === 'foto'
                    ? 'border-emerald-200 bg-emerald-50/60 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  title="Clicca per modificare il nome"
                  className="text-left font-medium hover:text-emerald-700 transition-colors cursor-text focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(item.id)}
                  aria-label={`Rimuovi ${item.name}`}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Nessun ingrediente ancora inserito. Carica una foto qui sopra oppure aggiungili a mano.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Aggiungi ingrediente (es. uova, zucchine, olio EVO...)"
          aria-label="Aggiungi ingrediente manualmente"
          className="flex-1 min-w-0 h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-shadow"
        />
        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-slate-200 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Aggiungi</span>
        </button>
      </form>

      <div className="space-y-1.5">
        <p className="text-xs text-slate-500">Aggiunta rapida dispensa:</p>
        <div className="flex flex-wrap gap-1.5">
          {PANTRY_STAPLES.map((staple) => {
            const alreadyAdded = existingNormalized.has(staple.toLowerCase());
            return (
              <button
                key={staple}
                type="button"
                disabled={alreadyAdded}
                onClick={() => onAddIngredient(staple, 'dispensa')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                  alreadyAdded
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 cursor-pointer'
                }`}
              >
                {alreadyAdded ? `✓ ${staple}` : `+ ${staple}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
