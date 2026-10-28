import React from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

const EXAMPLES = {
  pos: "El hotel superó todas nuestras expectativas, las habitaciones muy amplias y el personal muy atento y educado.",
  neg: "Pésima atención en recepción, la habitación olía a humedad, no nos cambiaron las sábanas y no volvería jamás.",
  negation: "El servicio no fue bueno, la comida no tenía sabor y definitivamente no lo recomiendo.",
  mixed: "Las instalaciones y la piscina son hermosas, aunque el wifi no funcionaba bien en la habitación."
};

export default function ReviewInput({ text, setText, onAnalyze, loading, error }) {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onAnalyze();
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="review-textarea" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>✍️</span> Escribe o pega una reseña de hotel:
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
        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
      />

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Botones de ejemplo rápido */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>O prueba un caso de ejemplo:</span>
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setText(EXAMPLES.pos)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/50 transition"
          >
            🟢 Positiva (Excelente)
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.neg)}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50 transition"
          >
            🔴 Negativa (Pésima)
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.negation)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/50 transition"
          >
            ⚡ Con Negaciones ("no me gustó...")
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLES.mixed)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/50 transition"
          >
            🟡 Mixta ("buena pero...")
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500 hidden sm:block">
          Presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd>
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analizando...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Analizar Sentimiento</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
