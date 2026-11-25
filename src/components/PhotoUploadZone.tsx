import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Camera, Upload, X, AlertCircle, RefreshCw, ImageIcon } from 'lucide-react';
import type { ImageSourceType } from '../types';

interface PhotoUploadZoneProps {
  previewUrl: string | null;
  isAnalyzing: boolean;
  analysisSummary: string | null;
  sourceType: ImageSourceType | null;
  analysisError: string | null;
  onFileSelected: (file: File) => void;
  onClearPhoto: () => void;
}

const SOURCE_LABELS: Record<ImageSourceType, string> = {
  frigo: 'Foto frigo',
  dispensa: 'Foto dispensa',
  scontrino: 'Scontrino spesa',
  altro: 'Immagine caricata',
};

export function PhotoUploadZone({
  previewUrl,
  isAnalyzing,
  analysisSummary,
  sourceType,
  analysisError,
  onFileSelected,
  onClearPhoto,
}: PhotoUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewLoadError(false);
      onFileSelected(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPreviewLoadError(false);
      onFileSelected(file);
    }
  };

  return (
    <div id="scansione" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            1. Scansiona frigo o scontrino
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Carica una foto del frigo aperto, della dispensa o dello scontrino.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Carica foto da dispositivo"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Scatta foto con fotocamera"
      />

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed transition-colors p-6 text-center ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
          }`}
        >
          <div className="mx-auto w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            Trascina qui la foto oppure scegli dal dispositivo
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Formati supportati: JPG, PNG, WebP · Analisi automatica immediata
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors min-h-[40px] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Carica foto</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <Camera className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Usa fotocamera</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="flex items-start gap-3.5">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
              {!previewLoadError ? (
                <img
                  src={previewUrl}
                  alt="Anteprima foto caricata per riconoscimento ingredienti"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewLoadError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {sourceType ? SOURCE_LABELS[sourceType] : 'Analisi immagine'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    title="Sostituisci foto"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Cambia</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClearPhoto}
                    disabled={isAnalyzing}
                    aria-label="Rimuovi foto caricata"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="mt-2 space-y-2" aria-live="polite">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <span
                      className="inline-block w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <span>Analizzo il tuo frigo e riconosco gli alimenti...</span>
                  </div>
                  <div className="h-2.5 w-3/4 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-slate-700 leading-snug">
                  {analysisSummary || 'Immagine pronta. Modifica gli ingredienti qui sotto se serve.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {analysisError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-sm text-amber-900"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-snug">{analysisError}</p>
        </div>
      )}
    </div>
  );
}
