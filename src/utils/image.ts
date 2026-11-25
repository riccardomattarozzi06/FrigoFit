export interface PreparedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;

/**
 * Compresses and resizes user-uploaded fridge/receipt photos on the client
 * so large smartphone photos upload rapidly while keeping receipt text legible.
 */
export async function prepareImageForAnalysis(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Seleziona un file immagine valido (JPG, PNG o WebP).');
  }

  const dataUrl = await readFileAsDataUrl(file);

  try {
    const img = await loadImage(dataUrl);
    const { width, height } = calculateScaledDimensions(img.width, img.height, MAX_DIMENSION);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas non disponibile');
    }

    ctx.drawImage(img, 0, 0, width, height);
    const outputMime = 'image/jpeg';
    const compressedUrl = canvas.toDataURL(outputMime, JPEG_QUALITY);
    const base64 = compressedUrl.split(',')[1] ?? '';

    if (!base64) {
      throw new Error('Impossibile elaborare immagine');
    }

    return {
      base64,
      mimeType: outputMime,
      previewUrl: compressedUrl,
    };
  } catch {
    // Fallback to original dataUrl if canvas decoding fails
    const base64 = dataUrl.split(',')[1] ?? '';
    return {
      base64,
      mimeType: file.type || 'image/jpeg',
      previewUrl: dataUrl,
    };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Errore nella lettura del file.'));
      }
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Impossibile decodificare immagine.'));
    img.src = src;
  });
}

function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number,
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }
  const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight);
  return {
    width: Math.max(1, Math.round(originalWidth * ratio)),
    height: Math.max(1, Math.round(originalHeight * ratio)),
  };
}
