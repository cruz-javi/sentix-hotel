import React from 'react';
import { Layers, ArrowDown, Check, ShieldCheck, Cpu, Filter, Type } from 'lucide-react';

const NEGATION_WORDS = new Set(['no', 'nunca', 'jamas', 'tampoco', 'sin', 'nada', 'nadie', 'ni']);

export default function NlpPipelineView({ nlpSteps, loading }) {
  if (loading) {
    return (
      <div className="glass p-8 rounded-2xl border border-slate-800 text-center py-16 space-y-3">
        <Cpu className="w-10 h-10 animate-spin text-blue-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-200">Desglosando etapas del pipeline de PLN...</h3>
        <p className="text-xs text-slate-400">Normalizando, tokenizando y aplicando lematización morfológica.</p>
      </div>
    );
  }

  if (!nlpSteps) {
    return (
      <div className="glass p-8 rounded-2xl border border-slate-800 text-center py-16 text-slate-500 space-y-3">
        <Layers className="w-12 h-12 opacity-30 mx-auto text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">Sin datos de PLN disponibles</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Ingresa una reseña arriba y haz clic en "Analizar Sentimiento" para inspeccionar las 4 etapas del pipeline en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pipeline de Procesamiento de Lenguaje Natural (PLN)</h2>
              <p className="text-xs text-slate-400">
                Inspección interactiva requerida: Deconstrucción paso a paso del texto antes del clasificador
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            Morfología activa: {nlpSteps.active_morphology}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Etapa 1: Texto Original y Normalización */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Type className="w-4 h-4" /> Paso 1: Normalización de Caracteres
            </span>
            <span className="text-xs text-slate-500">Minúsculas, remoción de signos y tildes conservadas</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block mb-1 uppercase font-sans font-bold">Texto Original:</span>
              <p className="text-slate-300 break-words font-sans">{nlpSteps.original_text}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40">
              <span className="text-[10px] text-blue-400 block mb-1 uppercase font-sans font-bold">Texto Normalizado:</span>
              <p className="text-blue-200 break-words font-sans">{nlpSteps.normalized_text}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-3">
          <ArrowDown className="w-4 h-4 text-slate-600" />
        </div>

        {/* Etapa 2: Tokenización */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-4 h-4" /> Paso 2: Tokenización Léxica
            </span>
            <span className="text-xs text-slate-500">
              Total tokens: <strong className="text-slate-300 font-mono">{nlpSteps.tokens.length}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            División de la secuencia en unidades mínimas de significado (tokens alfanuméricos en español):
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            {nlpSteps.tokens.map((token, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 transition"
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center -my-3">
          <ArrowDown className="w-4 h-4 text-slate-600" />
        </div>

        {/* Etapa 3: Filtrado de Stop Words con Negación */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-4 h-4" /> Paso 3: Stop Words y Retención de Negaciones
            </span>
            <span className="text-xs text-slate-500">
              Restantes: <strong className="text-slate-300 font-mono">{nlpSteps.tokens_no_stopwords.length}</strong> tokens
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Regla Clave de Negocio / NLP:</strong> Se removieron artículos y preposiciones vacías, pero se <strong>retuvieron las palabras de negación</strong> (resaltadas en amarillo) para evitar invertir el sentido semántico (ej. "no volvería" vs "volvería").
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            {nlpSteps.tokens_no_stopwords.map((token, idx) => {
              const isNegation = NEGATION_WORDS.has(token.toLowerCase());
              return (
                <span
                  key={idx}
                  className={`text-xs font-mono px-2 py-0.5 rounded border transition ${
                    isNegation
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isNegation ? 'Palabra de negación retenida estratégicamente' : 'Token relevante'}
                >
                  {isNegation ? `⚡ ${token}` : token}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center -my-3">
          <ArrowDown className="w-4 h-4 text-slate-600" />
        </div>

        {/* Etapa 4: Morfología y Representación Final */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Check className="w-4 h-4" /> Paso 4: Reducción Morfológica y Texto Final para TF-IDF
            </span>
            <span className="text-xs text-slate-500">Vectorizador Unigramas + Bigramas (1, 2)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-500 block mb-1 uppercase font-sans font-bold">
              Tokens Lematizados / Procesados:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto mb-3">
              {nlpSteps.lemmatized_tokens.map((token, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60"
                >
                  {token}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block mb-1 uppercase font-sans font-bold">
              Cadena Final entregada a scikit-learn (TfidfVectorizer):
            </span>
            <p className="text-emerald-300 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-words">
              "{nlpSteps.final_processed_text}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
