export type IngredientOrigin = 'foto' | 'dispensa';

export interface IngredientItem {
  id: string;
  name: string;
  origin: IngredientOrigin;
}

export type ImageSourceType = 'frigo' | 'dispensa' | 'scontrino' | 'altro';

export interface ImageAnalysisResponse {
  hasFood: boolean;
  sourceType: ImageSourceType;
  summary: string;
  ingredients: Array<{
    name: string;
    category: string;
  }>;
}

export type DietFilter =
  | 'Alto contenuto proteico'
  | 'Low Carb'
  | 'Vegetariano'
  | 'Vegano'
  | 'Senza Glutine'
  | 'Senza Lattosio';

export type TimeToolFilter =
  | 'Pronto in meno di 15 min'
  | 'Friggitrice ad aria'
  | 'Senza cottura';

export type RecipeFilter = DietFilter | TimeToolFilter;

export interface RecipeIngredient {
  name: string;
  gramsPerPortion: number;
  totalGrams: number;
  householdMeasure: string;
  fromPhoto: boolean;
  kcalContribution: number;
}

export interface RecipeMacros {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface GeneratedRecipe {
  title: string;
  subtitle: string;
  prepMinutes: number;
  cookMinutes: number;
  portions: number;
  caloriesPerPortion: number;
  maxCaloriesTarget: number;
  macrosPerPortion: RecipeMacros;
  ingredients: RecipeIngredient[];
  steps: string[];
  chefNutritionistTip: string;
  antiWasteNote: string;
  filterWarning?: string;
}

export interface GenerateRecipePayload {
  ingredients: Array<{ name: string; origin: IngredientOrigin }>;
  maxCaloriesPerPortion: number;
  portions: number;
  filters: RecipeFilter[];
  previousTitles?: string[];
}
