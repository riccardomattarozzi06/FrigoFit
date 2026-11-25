import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  hasSessionData: boolean;
  onResetAll: () => void;
}

export function Header({ hasSessionData, onResetAll }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 rounded"
        >
          FrigoFit
        </a>

        <nav
          aria-label="Navigazione principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#scansione"
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-emerald-500/70 transition-colors whitespace-nowrap shrink-0"
          >
            Ingredienti
          </a>
          <a
            href="#obiettivi"
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-emerald-500/70 transition-colors whitespace-nowrap shrink-0"
          >
            Obiettivi
          </a>
          <a
            href="#ricetta"
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-emerald-500/70 transition-colors whitespace-nowrap shrink-0"
          >
            Ricetta
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onResetAll}
            disabled={!hasSessionData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Nuova scansione</span>
          </button>
        </div>
      </div>
    </header>
  );
}
