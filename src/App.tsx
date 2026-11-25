import { useState } from 'react';
import { Header } from './components/Header';
import { PhotoUploadZone } from './components/PhotoUploadZone';
import { IngredientTags } from './components/IngredientTags';
import { TargetControls } from './components/TargetControls';
import { RecipeOutput } from './components/RecipeOutput';
import { prepareImageForAnalysis } from './utils/image';
import type {
  GeneratedRecipe,
  ImageAnalysisResponse,
  ImageSourceType,
  IngredientItem,
  IngredientOrigin,
  RecipeFilter,
} from './types';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<ImageSourceType | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [maxCalories, setMaxCalories] = useState<number>(500);
  const [portions, setPortions] = useState<number>(1);
  const [activeFilters, setActiveFilters] = useState<RecipeFilter[]>([]);

  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previousTitles, setPreviousTitles] = useState<string[]>([]);

  const handleFileSelected = async (file: File) => {
    setAnalysisError(null);
    setAnalysisSummary(null);
    setSourceType(null);
    setIsAnalyzing(true);

    try {
      const prepared = await prepareImageForAnalysis(file);
      setPreviewUrl(prepared.previewUrl);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: prepared.base64,
          mimeType: prepared.mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la scansione della foto.');
      }

      const result = data as ImageAnalysisResponse;
      setSourceType(result.sourceType);
      setAnalysisSummary(result.summary);

      if (!result.hasFood || !Array.isArray(result.ingredients) || result.ingredients.length === 0) {
        setAnalysisError(
          result.summary ||
            'Non ho individuato alimenti commestibili in questa immagine. Prova con una foto più nitida del frigo o dello scontrino, oppure aggiungi gli ingredienti manualmente.',
        );
        return;
      }

      // Merge newly detected ingredients while keeping manually added pantry staples
      setIngredients((prev) => {
        const manualItems = prev.filter((item) => item.origin === 'dispensa');
        const manualNames = new Set(manualItems.map((i) => i.name.trim().toLowerCase()));
        const detectedItems: IngredientItem[] = [];
        const seen = new Set<string>();

        for (const item of result.ingredients) {
          const cleanName = item.name.trim();
          const key = cleanName.toLowerCase();
          if (!cleanName || seen.has(key) || manualNames.has(key)) continue;
          seen.add(key);
          detectedItems.push({
            id: createId(),
            name: cleanName,
            origin: 'foto',
          });
        }

        return [...detectedItems, ...manualItems];
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Impossibile analizzare la foto. Riprova tra poco.';
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearPhoto = () => {
    setPreviewUrl(null);
    setAnalysisSummary(null);
    setSourceType(null);
    setAnalysisError(null);
    setIngredients((prev) => prev.filter((item) => item.origin !== 'foto'));
  };

  const handleAddIngredient = (name: string, origin: IngredientOrigin = 'dispensa') => {
    const cleaned = name.trim();
    if (!cleaned) return;
    setIngredients((prev) => {
      const exists = prev.some(
        (item) => item.name.trim().toLowerCase() === cleaned.toLowerCase(),
      );
      if (exists) return prev;
      return [...prev, { id: createId(), name: cleaned, origin }];
    });
  };

  const handleUpdateIngredient = (id: string, newName: string) => {
    const cleaned = newName.trim();
    if (!cleaned) return;
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: cleaned } : item)),
    );
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFilter = (filter: RecipeFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter],
    );
  };

  const runRecipeGeneration = async (isRegenerate: boolean) => {
    if (ingredients.length === 0) return;

    setGenerationError(null);
    setIsGenerating(true);

    const titlesToAvoid = isRegenerate
      ? Array.from(new Set([...previousTitles, ...(recipe?.title ? [recipe.title] : [])]))
      : [];

    if (!isRegenerate) {
      setPreviousTitles([]);
    } else if (recipe?.title) {
      setPreviousTitles(titlesToAvoid);
    }

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.map((i) => ({ name: i.name, origin: i.origin })),
          maxCaloriesPerPortion: maxCalories,
          portions,
          filters: activeFilters,
          previousTitles: titlesToAvoid,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la generazione della ricetta.');
      }

      setRecipe(data as GeneratedRecipe);

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('ricetta')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Errore imprevisto durante la generazione della ricetta.';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetAll = () => {
    setPreviewUrl(null);
    setAnalysisSummary(null);
    setSourceType(null);
    setAnalysisError(null);
    setIngredients([]);
    setMaxCalories(500);
    setPortions(1);
    setActiveFilters([]);
    setRecipe(null);
    setGenerationError(null);
    setPreviousTitles([]);
  };

  const hasSessionData =
    Boolean(previewUrl) ||
    ingredients.length > 0 ||
    Boolean(recipe) ||
    activeFilters.length > 0 ||
    maxCalories !== 500 ||
    portions !== 1;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header hasSessionData={hasSessionData} onResetAll={handleResetAll} />

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Ricette anti-spreco calibrate sulle tue calorie
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Scansiona il frigorifero o lo scontrino, fissa il tuo limite calorico e ottieni
            dosi esatte al grammo senza sprechi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <section
            aria-label="Configurazione ingredienti e target calorico"
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5"
          >
            <PhotoUploadZone
              previewUrl={previewUrl}
              isAnalyzing={isAnalyzing}
              analysisSummary={analysisSummary}
              sourceType={sourceType}
              analysisError={analysisError}
              onFileSelected={handleFileSelected}
              onClearPhoto={handleClearPhoto}
            />

            <IngredientTags
              ingredients={ingredients}
              isAnalyzing={isAnalyzing}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />

            <TargetControls
              maxCalories={maxCalories}
              onChangeMaxCalories={setMaxCalories}
              portions={portions}
              onChangePortions={setPortions}
              activeFilters={activeFilters}
              onToggleFilter={handleToggleFilter}
              onGenerate={() => runRecipeGeneration(false)}
              isGenerating={isGenerating}
              canGenerate={ingredients.length > 0 && !isAnalyzing}
            />
          </section>

          <div className="lg:col-span-7">
            <RecipeOutput
              recipe={recipe}
              isGenerating={isGenerating}
              error={generationError}
              maxCalories={maxCalories}
              onRegenerate={() => runRecipeGeneration(true)}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white mt-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>FrigoFit · Cucina anti-spreco e controllo calorico</span>
          <span>Valori nutrizionali stimati per porzione a scopo informativo</span>
        </div>
      </footer>
    </div>
  );
}
