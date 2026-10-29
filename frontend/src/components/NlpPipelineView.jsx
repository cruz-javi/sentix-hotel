import React from 'react';
import { Layers, ArrowDown, CheckCircle2, ShieldCheck, Cpu, Filter, Type } from 'lucide-react';

const NEGATION_WORDS = new Set(['no', 'nunca', 'jamas', 'tampoco', 'sin', 'nada', 'nadie', 'ni']);

export default function NlpPipelineView({ nlpSteps, loading }) {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center py-16 space-y-3">
        <Cpu className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-200">Procesando fases del pipeline de PLN</h3>
        <p className="text-xs text-slate-400">Normalizando, tokenizando y aplicando transformaciones morfológicas.</p>
      </div>
    );
  }

  if (!nlpSteps) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center py-16 text-slate-500 space-y-3">
        <Layers className="w-10 h-10 opacity-30 mx-auto text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300">Sin datos de PLN disponibles</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Ingresa una reseña y presiona "Analizar Sentimiento" para visualizar el desglose técnico en cada fase del preprocesamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Pipeline de Procesamiento de Lenguaje Natural</h2>
            <p className="text-xs text-slate-400">
              Desglose secuencial del texto previo a la vectorización numérica
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          Morfología: {nlpSteps.active_morphology}
        </span>
      </div>

      <div className="space-y-4">
        {/* Etapa 1: Normalización */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-indigo-400" /> Fase 1: Normalización de Caracteres
            </span>
            <span className="text-[11px] text-slate-400">Conversión a minúsculas y eliminación de ruido</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">Texto Original</span>
              <p className="text-slate-300 break-words">{nlpSteps.original_text}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-indigo-400 block mb-1 uppercase font-semibold">Texto Normalizado</span>
              <p className="text-slate-200 break-words">{nlpSteps.normalized_text}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-2">
          <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
        </div>

        {/* Etapa 2: Tokenización */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Fase 2: Tokenización Léxica
            </span>
            <span className="text-xs text-slate-400">
              Tokens generados: <strong className="text-slate-200 font-mono">{nlpSteps.tokens.length}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Segmentación en unidades léxicas independientes:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 rounded-lg bg-slate-900 border border-slate-800">
            {nlpSteps.tokens.map((token, idx) => (
              <span
                key={idx}
                className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/80"
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center -my-2">
          <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
        </div>

        {/* Etapa 3: Filtrado de Stop Words */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Fase 3: Filtrado de Palabras Vacías
            </span>
            <span className="text-xs text-slate-400">
              Tokens filtrados: <strong className="text-slate-200 font-mono">{nlpSteps.tokens_no_stopwords.length}</strong>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Criterio de Dominio:</strong> Se eliminaron palabras funcionales no discriminantes, reteniendo estrictamente los términos de polaridad negativa (etiquetados abajo) para preservar la semántica del juicio del huésped.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 rounded-lg bg-slate-900 border border-slate-800">
            {nlpSteps.tokens_no_stopwords.map((token, idx) => {
              const isNegation = NEGATION_WORDS.has(token.toLowerCase());
              return (
                <span
                  key={idx}
                  className={`text-xs font-mono px-2 py-0.5 rounded border transition ${
                    isNegation
                      ? 'bg-amber-950/40 text-amber-300 border-amber-700/80 font-semibold'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                  }`}
                  title={isNegation ? 'Término de negación preservado' : 'Token analizado'}
                >
                  {isNegation ? `[NEG] ${token}` : token}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center -my-2">
          <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
        </div>

        {/* Etapa 4: Morfología y Representación TF-IDF */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Fase 4: Reducción Morfológica y Texto Vectorizable
            </span>
            <span className="text-[11px] text-slate-400">Matriz TF-IDF (1-gramas + 2-gramas)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">
                Tokens Procesados Finales:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {nlpSteps.lemmatized_tokens.map((token, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">
                Cadena Formateada Suministrada al Vectorizador:
              </span>
              <p className="text-indigo-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 break-words">
                "{nlpSteps.final_processed_text}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
