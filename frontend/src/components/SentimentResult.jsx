import React from 'react';
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export default function SentimentResult({ result }) {
  if (!result) {
    return (
      <div className="glass h-full p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-center items-center text-center py-12 text-slate-500 space-y-3">
        <Scale className="w-12 h-12 opacity-40 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">Esperando reseña...</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Escribe una reseña y haz clic en "Analizar Sentimiento" para ver la predicción en tiempo real.
        </p>
      </div>
    );
  }

  const isPositive = result.sentiment_class === 1;
  const pPos = (result.probability_positive * 100).toFixed(1);
  const pNeg = (result.probability_negative * 100).toFixed(1);
  const confidence = (result.confidence * 100).toFixed(1);

  return (
    <div className="glass h-full p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>🎯</span> Resultado de Clasificación
        </h3>

        {/* Tarjeta principal de sentimiento */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          isPositive
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center space-x-3">
            {isPositive ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium">Sentimiento Predicho</p>
              <h4 className="text-2xl font-black tracking-tight">{result.sentiment_label}</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Confianza</span>
            <p className="text-xl font-bold text-slate-100">{confidence}%</p>
          </div>
        </div>

        {/* Barras de probabilidad comparativas */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-400 flex items-center gap-1">🟢 Probabilidad Positiva:</span>
            <span className="text-slate-200 font-semibold">{pPos}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${pPos}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-medium pt-2">
            <span className="text-rose-400 flex items-center gap-1">🔴 Probabilidad Negativa:</span>
            <span className="text-slate-200 font-semibold">{pNeg}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${pNeg}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nota técnica de producción */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Modelo: <strong className="text-slate-200">LogisticRegression (TF-IDF)</strong></span>
        <span>Umbral: <strong className="text-slate-200">0.50</strong></span>
      </div>
    </div>
  );
}
