import type { ChangeEvent } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import type { DietFilter, RecipeFilter, TimeToolFilter } from '../types';

interface TargetControlsProps {
  maxCalories: number;
  onChangeMaxCalories: (value: number) => void;
  portions: number;
  onChangePortions: (value: number) => void;
  activeFilters: RecipeFilter[];
  onToggleFilter: (filter: RecipeFilter) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const DIET_FILTERS: DietFilter[] = [
  'Alto contenuto proteico',
  'Low Carb',
  'Vegetariano',
  'Vegano',
  'Senza Glutine',
  'Senza Lattosio',
];

const TIME_TOOL_FILTERS: TimeToolFilter[] = [
  'Pronto in meno di 15 min',
  'Friggitrice ad aria',
  'Senza cottura',
];

export function TargetControls({
  maxCalories,
  onChangeMaxCalories,
  portions,
  onChangePortions,
  activeFilters,
  onToggleFilter,
  onGenerate,
  isGenerating,
  canGenerate,
}: TargetControlsProps) {
  const sliderPercent = ((maxCalories - 200) / (1200 - 200)) * 100;

  const handleNumericChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    onChangeMaxCalories(raw);
  };

  const handleNumericBlur = () => {
    const clamped = Math.min(1200, Math.max(200, Math.round(maxCalories / 10) * 10 || 500));
    onChangeMaxCalories(clamped);
  };

  return (
    <div id="obiettivi" className="space-y-6 pt-5 border-t border-slate-100">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              2. Target calorico e porzioni
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Le grammature saranno calibrate per non superare questo limite.
            </p>
          </div>
        </div>

        <div className="pt-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="calorie-number" className="text-sm font-medium text-slate-700">
              Calorie max per porzione
            </label>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-emerald-500 focus-within:bg-white">
              <input
                id="calorie-number"
                type="number"
                min={200}
                max={1200}
                step={50}
                value={maxCalories}
                onChange={handleNumericChange}
                onBlur={handleNumericBlur}
                className="w-16 text-right font-mono text-base font-semibold tabular-nums text-slate-900 bg-transparent focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-500">kcal</span>
            </div>
          </div>

          <input
            type="range"
            min={200}
            max={1200}
            step={50}
            value={Math.min(1200, Math.max(200, maxCalories))}
            onChange={(e) => onChangeMaxCalories(Number(e.target.value))}
            aria-label="Selettore calorie massime per porzione"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderPercent}%, #e2e8f0 ${sliderPercent}%, #e2e8f0 100%)`,
            }}
            className="w-full frigofit-slider"
          />

          <div className="flex justify-between text-xs font-mono tabular-nums text-slate-400">
            <span>200 kcal</span>
            <span>700 kcal</span>
            <span>1200 kcal</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-700">Numero di porzioni</span>
          <div
            role="group"
            aria-label="Seleziona numero di porzioni"
            className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200/80"
          >
            {[1, 2, 3, 4].map((count) => {
              const active = portions === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangePortions(count)}
                  aria-pressed={active}
                  className={`min-w-[40px] h-8 px-3 rounded-md text-sm font-mono font-semibold tabular-nums transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-5 border-t border-slate-100">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            3. Preferenze e strumenti
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Dieta</p>
          <div className="flex flex-wrap gap-2">
            {DIET_FILTERS.map((filter) => {
              const active = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[34px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                    active
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Tempo e strumenti</p>
          <div className="flex flex-wrap gap-2">
            {TIME_TOOL_FILTERS.map((filter) => {
              const active = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[34px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                    active
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-display font-semibold text-base hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-45 disabled:pointer-events-none transition-all cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          {isGenerating ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Calibrazione in corso...</span>
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" aria-hidden="true" />
              <span>Genera Ricetta su Misura</span>
            </>
          )}
        </button>
        {!canGenerate && !isGenerating && (
          <p className="mt-2 text-xs text-center text-slate-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Carica una foto o aggiungi almeno 1 ingrediente per iniziare.</span>
          </p>
        )}
      </div>
    </div>
  );
}
