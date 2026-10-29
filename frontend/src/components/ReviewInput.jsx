import React from 'react';
import { Send, Loader2, FileEdit, CheckCircle2, XCircle, ShieldAlert, SplitSquareVertical } from 'lucide-react';

const EXAMPLES = {
  pos: "El hotel superó todas nuestras expectativas, las habitaciones muy amplias y el personal muy atento y educado.",
  neg: "Pésima atención en recepción, la habitación olía a humedad, no nos cambiaron las sábanas y no volvería jamás.",
  negation: "El servicio no fue bueno, la comida no tenía sabor y definitivamente no lo recomiendo.",
  mixed: "Las instalaciones y la piscina son hermosas, aunque el wifi no funcionaba bien en la habitación."
};

export default function ReviewInput({ text, setText, onAnalyze, loading }) {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onAnalyze();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="review-textarea" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-indigo-400" />
          <span>Ingreso de Reseña Hotelera:</span>
        </label>
        <span className="text-xs text-slate-500 font-mono">
          {text.length} caracteres
        </span>
      </div>

      <textarea
        id="review-textarea"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ejemplo: Las instalaciones del hotel superaron nuestras expectativas, la habitación amplia y el personal muy atento..."
        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none leading-relaxed"
      />

      {/* Botones de prueba predefinidos con iconografía sobria */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400">
          Casos de prueba predeterminados:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setText(EXAMPLES.pos)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-emerald-700/60 hover:text-emerald-300 hover:bg-emerald-950/30 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Favorable (Positiva)</span>
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.neg)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-rose-700/60 hover:text-rose-300 hover:bg-rose-950/30 transition flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Desfavorable (Negativa)</span>
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.negation)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-indigo-600/60 hover:text-indigo-300 hover:bg-indigo-950/30 transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Con Negaciones ("no me gustó...")</span>
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.mixed)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-amber-600/60 hover:text-amber-300 hover:bg-amber-950/30 transition flex items-center gap-1.5"
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-amber-400" />
            <span>Polaridad Mixta</span>
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500 hidden sm:block">
          Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">Enter</kbd>
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Analizar Sentimiento</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
