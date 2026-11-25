import { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Check,
  ChefHat,
  Utensils,
  Leaf,
  Scale,
  Camera,
} from 'lucide-react';
import type { GeneratedRecipe } from '../types';

interface RecipeOutputProps {
  recipe: GeneratedRecipe | null;
  isGenerating: boolean;
  error: string | null;
  maxCalories: number;
  onRegenerate: () => void;
}

export function RecipeOutput({
  recipe,
  isGenerating,
  error,
  maxCalories,
  onRegenerate,
}: RecipeOutputProps) {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  useEffect(() => {
    setCheckedSteps([]);
  }, [recipe?.title]);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    );
  };

  if (isGenerating) {
    return (
      <section
        id="ricetta"
        aria-live="polite"
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center gap-3 text-emerald-700">
          <span
            className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
          <p className="font-display font-semibold text-base">
            Calibro le dosi per restare sotto le {maxCalories} kcal...
          </p>
        </div>

        <div className="space-y-3" aria-hidden="true">
          <div className="h-7 w-2/3 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2" aria-hidden="true">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100" aria-hidden="true">
          <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-5/6 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100" aria-hidden="true">
          <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse" />
          <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="ricetta"
        role="alert"
        className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Impossibile generare la ricetta
            </h2>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Riprova</span>
          </button>
        </div>
      </section>
    );
  }

  if (!recipe) {
    return (
      <section
        id="ricetta"
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 flex flex-col justify-between min-h-[520px]"
      >
        <div className="space-y-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold tracking-wide text-emerald-700">
              Motore di dosaggio calorico
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Trasforma ciò che hai in frigo in un piatto su misura.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              FrigoFit non elenca ricette generiche: seleziona solo gli abbinamenti migliori e
              calcola le grammature esatte per rispettare il tuo limite calorico.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            <div className="py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  1. Scatta o carica lo scontrino
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Riconoscimento visivo automatico degli alimenti con modifica rapida.
                </p>
              </div>
            </div>

            <div className="py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  2. Imposta il tetto in kcal
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Ogni porzione viene calibrata al grammo per restare sotto il target scelto.
                </p>
              </div>
            </div>

            <div className="py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  3. Cucina senza sprechi
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Macro trasparenti, passaggi pratici e consigli nutrizionali personalizzati.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
          I risultati compariranno qui non appena generi la tua prima ricetta.
        </div>
      </section>
    );
  }

  const totalTime = recipe.prepMinutes + recipe.cookMinutes;
  const kcalRatio = Math.min(100, Math.round((recipe.caloriesPerPortion / recipe.maxCaloriesTarget) * 100));
  const isUnderOrAtTarget = recipe.caloriesPerPortion <= recipe.maxCaloriesTarget;

  const macroCalTotal =
    recipe.macrosPerPortion.proteinGrams * 4 +
    recipe.macrosPerPortion.carbsGrams * 4 +
    recipe.macrosPerPortion.fatGrams * 9;
  const safeMacroDenom = macroCalTotal > 0 ? macroCalTotal : 1;

  const proteinPct = Math.round(((recipe.macrosPerPortion.proteinGrams * 4) / safeMacroDenom) * 100);
  const carbsPct = Math.round(((recipe.macrosPerPortion.carbsGrams * 4) / safeMacroDenom) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  return (
    <section
      id="ricetta"
      className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-7"
    >
      {/* Recipe Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              {recipe.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {recipe.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Rigenera un'altra idea</span>
          </button>
        </div>

        {/* Clean Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span className="tabular-nums">Totale {totalTime} min</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Prep {recipe.prepMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {recipe.cookMinutes === 0 ? 'Senza cottura' : `Cottura ${recipe.cookMinutes} min`}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {recipe.portions} {recipe.portions === 1 ? 'porzione' : 'porzioni'}
          </span>
        </div>

        {/* Calorie Target Readout */}
        <div className="pt-2 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">
              Apporto energetico per porzione
            </span>
            <div className="font-mono tabular-nums text-sm">
              <span
                className={`text-lg font-bold ${
                  isUnderOrAtTarget ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {recipe.caloriesPerPortion} kcal
              </span>
              <span className="text-slate-400"> / {recipe.maxCaloriesTarget} kcal max</span>
            </div>
          </div>
          <div
            className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={recipe.caloriesPerPortion}
            aria-valuemin={0}
            aria-valuemax={recipe.maxCaloriesTarget}
            aria-label="Utilizzo budget calorico"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isUnderOrAtTarget ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${kcalRatio}%` }}
            />
          </div>
        </div>

        {recipe.filterWarning && recipe.filterWarning.trim().length > 0 && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-sm text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-snug">{recipe.filterWarning}</p>
          </div>
        )}
      </div>

      {/* Macro Breakdown */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Macronutrienti per porzione
          </h3>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            Fibre: {recipe.macrosPerPortion.fiberGrams} g
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-600">Proteine</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {recipe.macrosPerPortion.proteinGrams} g{' '}
                <span className="text-xs font-normal text-slate-400">({proteinPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, proteinPct)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-600">Carboidrati</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {recipe.macrosPerPortion.carbsGrams} g{' '}
                <span className="text-xs font-normal text-slate-400">({carbsPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${Math.min(100, carbsPct)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-600">Grassi</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {recipe.macrosPerPortion.fatGrams} g{' '}
                <span className="text-xs font-normal text-slate-400">({fatPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${Math.min(100, fatPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calibrated Ingredients */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Ingredienti calibrati
          </h3>
          <span className="text-xs text-slate-500">
            {recipe.portions > 1
              ? `Dosi per 1 porzione (e totale per ${recipe.portions})`
              : 'Dosi esatte per 1 porzione'}
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {recipe.ingredients.map((ing, idx) => (
            <li
              key={`${ing.name}-${idx}`}
              className="py-2.5 flex items-center justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold font-mono tabular-nums text-slate-900">
                    {ing.gramsPerPortion} g
                  </span>
                  <span className="font-medium text-slate-900">{ing.name}</span>
                  {ing.householdMeasure && (
                    <span className="text-xs text-slate-500">({ing.householdMeasure})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className={ing.fromPhoto ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    {ing.fromPhoto ? 'Dai tuoi ingredienti' : 'Dispensa base'}
                  </span>
                  {recipe.portions > 1 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Totale {recipe.portions} porz: {ing.totalGrams} g
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span className="font-mono text-xs tabular-nums text-slate-500 shrink-0">
                {ing.kcalContribution} kcal
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <h3 className="font-display text-sm font-semibold text-slate-900">
          Preparazione passo dopo passo
        </h3>

        <ol className="space-y-2.5">
          {recipe.steps.map((step, index) => {
            const done = checkedSteps.includes(index);
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => toggleStep(index)}
                  className={`w-full text-left flex items-start gap-3.5 p-3 rounded-xl transition-colors cursor-pointer ${
                    done ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-mono font-semibold tabular-nums flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={`text-sm leading-relaxed ${done ? 'line-through' : ''}`}>
                    {step}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Chef / Nutritionist Tip & Anti-Waste Note */}
      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-display font-semibold text-slate-900">
            <ChefHat className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Consiglio del nutrizionista</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{recipe.chefNutritionistTip}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-display font-semibold text-slate-900">
            <Leaf className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Nota anti-spreco</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{recipe.antiWasteNote}</p>
        </div>
      </div>
    </section>
  );
}
