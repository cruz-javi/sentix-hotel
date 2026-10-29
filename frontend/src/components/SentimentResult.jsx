import React from 'react';
import { CheckCircle2, AlertTriangle, Scale, Target, Activity } from 'lucide-react';

export default function SentimentResult({ result }) {
  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 h-full p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center py-12 text-slate-500 space-y-3">
        <Scale className="w-10 h-10 opacity-30 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">En espera de reseña</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Ingresa un texto en el panel y selecciona "Analizar Sentimiento" para visualizar la estimación probabilística.
        </p>
      </div>
    );
  }

  const isPositive = result.sentiment_class === 1;
  const pPos = (result.probability_positive * 100).toFixed(1);
  const pNeg = (result.probability_negative * 100).toFixed(1);
  const confidence = (result.confidence * 100).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 h-full p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Resultado de Clasificación</span>
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            v{result.model_version}
          </span>
        </div>

        {/* Tarjeta principal de sentimiento */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          isPositive
            ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
            : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
        }`}>
          <div className="flex items-center space-x-3">
            {isPositive ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                Sentimiento Predicho
              </p>
              <h4 className="text-2xl font-bold tracking-tight">{result.sentiment_label}</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase">Confianza</span>
            <p className="text-xl font-bold text-slate-100 font-mono">{confidence}%</p>
          </div>
        </div>

        {/* Barras de probabilidad comparativas */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Probabilidad Positiva:
              </span>
              <span className="text-slate-200 font-mono">{pPos}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pPos}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Probabilidad Negativa:
              </span>
              <span className="text-slate-200 font-mono">{pNeg}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pNeg}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nota técnica de inferencia */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          Modelo: <strong className="text-slate-300 font-medium">LogisticRegression</strong>
        </span>
        <span>Umbral de decisión: <strong className="text-slate-300 font-mono">0.50</strong></span>
      </div>
    </div>
  );
}
