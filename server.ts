import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_NAME = 'gemini-2.5-flash';
const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentParameters,
  maxRetries = 2,
): Promise<GenerateContentResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable =
        message.includes('503') ||
        message.includes('500') ||
        message.includes('UNAVAILABLE') ||
        message.includes('INTERNAL');
      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);

  if (raw === 'MISSING_API_KEY') {
    return {
      status: 500,
      message:
        'Chiave API Gemini non configurata. Imposta GEMINI_API_KEY nel pannello Secrets prima di continuare.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      message:
        'Chiave API Gemini non valida o senza permessi. Verifica GEMINI_API_KEY nel pannello Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message:
        'Limite di richieste raggiunto temporaneamente. Attendi qualche secondo e riprova.',
    };
  }
  return {
    status: 500,
    message:
      'Si è verificato un problema durante comunicazione con il servizio AI. Riprova tra poco.',
  };
}

const imageAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    hasFood: {
      type: Type.BOOLEAN,
      description:
        'True se immagine mostra cibo, bevande commestibili, frigo, dispensa o uno scontrino alimentare.',
    },
    sourceType: {
      type: Type.STRING,
      description: 'Uno tra: "frigo", "dispensa", "scontrino", "altro".',
    },
    summary: {
      type: Type.STRING,
      description:
        'Breve frase in italiano naturale che descrive cosa si vede (es. "Ho riconosciuto 7 alimenti dal tuo frigo"). Se hasFood è false, spiega educatamente perché.',
    },
    ingredients: {
      type: Type.ARRAY,
      description: 'Elenco di tutti gli ingredienti commestibili individuati in italiano.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description:
              'Nome pulito e conciso ingrediente in italiano (es. "Petto di pollo", "Zucchine", "Yogurt greco 0%", "Pomodorini"). Evita marche o codici scontrino.',
          },
          category: {
            type: Type.STRING,
            description:
              'Categoria alimentare (es. "Proteine", "Verdure", "Latticini", "Carboidrati", "Frutta", "Condimenti").',
          },
        },
        required: ['name', 'category'],
      },
    },
  },
  required: ['hasFood', 'sourceType', 'summary', 'ingredients'],
};

const recipeGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Titolo invitante e chiaro della ricetta in italiano.',
    },
    subtitle: {
      type: Type.STRING,
      description: 'Breve descrizione di 1 frase sul profilo nutrizionale e sul gusto del piatto.',
    },
    prepMinutes: {
      type: Type.INTEGER,
      description: 'Minuti di preparazione.',
    },
    cookMinutes: {
      type: Type.INTEGER,
      description: 'Minuti di cottura (0 se senza cottura).',
    },
    portions: {
      type: Type.INTEGER,
      description: 'Numero di porzioni esattamente come richiesto.',
    },
    caloriesPerPortion: {
      type: Type.INTEGER,
      description:
        'Calorie totali reali per 1 porzione in base alle grammature calibrate. DEVE essere <= maxCaloriesTarget.',
    },
    maxCaloriesTarget: {
      type: Type.INTEGER,
      description: 'Il limite calorico massimo per porzione impostato.',
    },
    macrosPerPortion: {
      type: Type.OBJECT,
      properties: {
        proteinGrams: { type: Type.INTEGER, description: 'Grammi di proteine per porzione.' },
        carbsGrams: { type: Type.INTEGER, description: 'Grammi di carboidrati per porzione.' },
        fatGrams: { type: Type.INTEGER, description: 'Grammi di grassi per porzione.' },
        fiberGrams: { type: Type.INTEGER, description: 'Grammi di fibre per porzione.' },
      },
      required: ['proteinGrams', 'carbsGrams', 'fatGrams', 'fiberGrams'],
    },
    ingredients: {
      type: Type.ARRAY,
      description:
        'Solo gli ingredienti selezionati per il piatto, con grammature calibrate al grammo per rispettare il tetto calorico.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Nome ingrediente in italiano.',
          },
          gramsPerPortion: {
            type: Type.INTEGER,
            description: 'Peso esatto in grammi per 1 porzione.',
          },
          totalGrams: {
            type: Type.INTEGER,
            description: 'Peso totale in grammi per tutte le porzioni (gramsPerPortion * portions).',
          },
          householdMeasure: {
            type: Type.STRING,
            description:
              'Misura pratica equivalente (es. "1 cucchiaino raso", "1 filetto medio", "2 cucchiai").',
          },
          fromPhoto: {
            type: Type.BOOLEAN,
            description:
              'True se proviene dagli ingredienti caricati/inseriti utente, false se è un condimento base di dispensa aggiunto per completare la ricetta.',
          },
          kcalContribution: {
            type: Type.INTEGER,
            description: 'Apporto calorico approssimativo di questo ingrediente per 1 porzione.',
          },
        },
        required: [
          'name',
          'gramsPerPortion',
          'totalGrams',
          'householdMeasure',
          'fromPhoto',
          'kcalContribution',
        ],
      },
    },
    steps: {
      type: Type.ARRAY,
      description: 'Passaggi di preparazione numerati logicamente, concisi e chiari in italiano.',
      items: {
        type: Type.STRING,
      },
    },
    chefNutritionistTip: {
      type: Type.STRING,
      description:
        'Consiglio pratico dello chef/nutrizionista in italiano su come aggiungere ~100 kcal pulite oppure aumentare ulteriormente la quota proteica.',
    },
    antiWasteNote: {
      type: Type.STRING,
      description:
        'Nota anti-spreco concisa su eventuali ingredienti non usati nella ricetta o su come conservare il piatto.',
    },
    filterWarning: {
      type: Type.STRING,
      description:
        'Eventuale avviso breve se un filtro dietetico era in conflitto con alcuni ingredienti disponibili e come è stato gestito (stringa vuota se nessun conflitto).',
    },
  },
  required: [
    'title',
    'subtitle',
    'prepMinutes',
    'cookMinutes',
    'portions',
    'caloriesPerPortion',
    'maxCaloriesTarget',
    'macrosPerPortion',
    'ingredients',
    'steps',
    'chefNutritionistTip',
    'antiWasteNote',
    'filterWarning',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/analyze-image', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body as {
        imageBase64?: string;
        mimeType?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Immagine mancante o non valida.' });
        return;
      }

      const safeMime =
        typeof mimeType === 'string' && mimeType.startsWith('image/')
          ? mimeType
          : 'image/jpeg';

      const ai = getAiClient();
      const response = await generateWithRetry(ai, {
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: safeMime,
                data: imageBase64,
              },
            },
            {
              text: [
                'Analizza questa immagine in italiano.',
                'Potrebbe essere la foto di un frigorifero aperto, di una dispensa oppure di uno scontrino della spesa.',
                'Estrai tutti gli ingredienti alimentari commestibili riconoscibili con nomi italiani chiari, puliti e specifici (es. "Petto di pollo", "Uova", "Yogurt greco", "Spinaci", "Parmigiano Reggiano", "Olio extravergine di oliva").',
                'Se è uno scontrino, interpreta le abbreviazioni commerciali trasformandole in nomi di alimenti chiari ed escludi voci non alimentari (es. sacchetti, detersivi, sconti, totali).',
                'Non duplicare lo stesso ingrediente.',
                'Se immagine non contiene alcun cibo, frigo, dispensa o scontrino alimentare, imposta hasFood su false e restituisci una lista vuota con un messaggio cortese in italiano.',
              ].join(' '),
            },
          ],
        },
        config: {
          systemInstruction:
            'Sei un assistente alimentare esperto in riconoscimento visivo di alimenti e lettura di scontrini italiani. Rispondi esclusivamente in JSON conforme allo schema.',
          responseMimeType: 'application/json',
          responseSchema: imageAnalysisSchema,
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      console.error('Errore /api/analyze-image:', err);
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/generate-recipe', async (req: Request, res: Response) => {
    try {
      const {
        ingredients,
        maxCaloriesPerPortion,
        portions,
        filters,
        previousTitles,
      } = req.body as {
        ingredients?: Array<{ name: string; origin: string }>;
        maxCaloriesPerPortion?: number;
        portions?: number;
        filters?: string[];
        previousTitles?: string[];
      };

      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        res.status(400).json({
          error: 'Inserisci almeno un ingrediente prima di generare la ricetta.',
        });
        return;
      }

      const safeCalories = Math.min(1200, Math.max(200, Number(maxCaloriesPerPortion) || 500));
      const safePortions = Math.min(4, Math.max(1, Math.round(Number(portions) || 1)));
      const safeFilters = Array.isArray(filters) ? filters : [];
      const safePrevious = Array.isArray(previousTitles) ? previousTitles : [];

      const photoItems = ingredients
        .filter((item) => item.origin === 'foto')
        .map((item) => item.name.trim())
        .filter(Boolean);
      const pantryItems = ingredients
        .filter((item) => item.origin !== 'foto')
        .map((item) => item.name.trim())
        .filter(Boolean);

      const promptLines = [
        `Crea UNA ricetta bilanciata, gustosa e anti-spreco in italiano.`,
        `VINCOLO CALORICO ASSOLUTO: ogni porzione DEVE avere al massimo ${safeCalories} kcal (ideale tra ${Math.max(180, safeCalories - 45)} e ${safeCalories} kcal, MAI superiore a ${safeCalories} kcal).`,
        `NUMERO DI PORZIONI: ${safePortions}.`,
        `INGREDIENTI RILEVATI DA FOTO/FRIGO: ${photoItems.length > 0 ? photoItems.join(', ') : 'Nessuno'}.`,
        `INGREDIENTI DI DISPENSA AGGIUNTI DALL'UTENTE: ${pantryItems.length > 0 ? pantryItems.join(', ') : 'Nessuno'}.`,
        `FILTRI ATTIVI: ${safeFilters.length > 0 ? safeFilters.join(', ') : 'Nessun filtro specifico'}.`,
      ];

      if (safePrevious.length > 0) {
        promptLines.push(
          `RIGENERAZIONE: Proponi una ricetta COMPLETAMENTE DIVERSA per formato, tecnica o abbinamento rispetto a queste già proposte: ${safePrevious.join(' | ')}.`,
        );
      }

      promptLines.push(
        'REGOLE DI DOSAGGIO E CUCINA:',
        '1. NON mescolare tutti gli ingredienti alla cieca. Seleziona solo un sottoinsieme armonioso che funzioni bene insieme dal punto di vista gastronomico.',
        '2. Calcola e calibra dinamicamente il peso esatto in GRAMMI di ogni ingrediente per 1 porzione (e il totale moltiplicato per il numero di porzioni) in modo che la somma delle kcal di tutti gli ingredienti sia rigorosamente <= maxCaloriesTarget.',
        '3. Assicurati che la somma di kcalContribution degli ingredienti coincida con caloriesPerPortion, e che i macro siano matematicamente coerenti (proteine*4 + carboidrati*4 + grassi*9 ≈ caloriesPerPortion).',
        '4. Rispetta tutti i filtri attivi (es. se "Senza cottura" non usare fornelli/forno/friggitrice; se "Friggitrice ad aria" usa cottura in air fryer; se "Pronto in meno di 15 min" prepMinutes + cookMinutes <= 15; se "Alto contenuto proteico" privilegia proteine magre; se "Vegano"/"Vegetariano"/"Senza Glutine"/"Senza Lattosio" escludi gli ingredienti incompatibili e spiega in filterWarning se hai escluso qualcosa).',
        '5. Segna fromPhoto = true per gli ingredienti presenti nella lista utente, e fromPhoto = false solo per condimenti essenziali di base (es. acqua, sale, pepe, erbe aromatiche o un cucchiaino di olio se indispensabile).',
      );

      const ai = getAiClient();
      const response = await generateWithRetry(ai, {
        model: MODEL_NAME,
        contents: promptLines.join('\n'),
        config: {
          systemInstruction:
            'Sei uno chef italiano ed esperto nutrizionista sportivo specializzato in cucina anti-spreco ad alta precisione calorica. Calcoli le grammature al grammo con rigore matematico. Rispondi esclusivamente in JSON valido conforme allo schema.',
          responseMimeType: 'application/json',
          responseSchema: recipeGenerationSchema,
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      // Enforce strict consistency on portion totals & calorie cap sanity
      if (parsed && typeof parsed === 'object') {
        parsed.maxCaloriesTarget = safeCalories;
        parsed.portions = safePortions;
      }

      res.json(parsed);
    } catch (err) {
      console.error('Errore /api/generate-recipe:', err);
      const mapped = mapGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FrigoFit server in ascolto su http://localhost:${PORT}`);
  });
}

startServer();
