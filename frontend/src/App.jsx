import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ReviewInput from './components/ReviewInput';
import SentimentResult from './components/SentimentResult';
import NlpPipelineView from './components/NlpPipelineView';
import MetricsDashboard from './components/MetricsDashboard';
import BatchAnalysis from './components/BatchAnalysis';
import { MessageSquare, Layers, BarChart3, UploadCloud } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'pipeline', 'metrics', 'batch'
  const [reviewText, setReviewText] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [nlpSteps, setNlpSteps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = reviewText.trim();
    if (!trimmed) {
      setError('Por favor, escribe una reseña antes de analizar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Llamada a Inferencia
      const predictPromise = fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      // 2. Llamada a Explicabilidad PLN
      const nlpPromise = fetch('/api/nlp-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      const [resPredict, resNlp] = await Promise.all([predictPromise, nlpPromise]);

      if (!resPredict.ok) {
        const errorJson = await resPredict.json();
        throw new Error(errorJson.detail || 'Error al predecir sentimiento');
      }

      const predictData = await resPredict.json();
      setPredictResult(predictData);

      if (resNlp.ok) {
        const nlpData = await resNlp.json();
        setNlpSteps(nlpData);
      }
    } catch (err) {
      setError(err.message || 'Error al comunicarse con la API de Sentix-Hotel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Barra de Navegación */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-3 overflow-x-auto pb-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Clasificador en Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pipeline PLN Paso a Paso</span>
            {nlpSteps && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas del Modelo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Análisis por Lote CSV</span>
          </button>
        </div>

        {/* Vista 1: Clasificador en Vivo */}
        {activeTab === 'live' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ReviewInput
                  text={reviewText}
                  setText={setReviewText}
                  onAnalyze={handleAnalyze}
                  loading={loading}
                  error={error}
                />
              </div>
              <div className="lg:col-span-5 h-full">
                <SentimentResult result={predictResult} />
              </div>
            </div>

            {/* Vista previa rápida del pipeline debajo si ya se analizó */}
            {nlpSteps && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Desglose Rápido del Pipeline para esta Reseña
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pipeline')}
                    className="text-xs text-blue-400 hover:underline font-medium"
                  >
                    Ver Vista Completa de PLN →
                  </button>
                </div>
                <NlpPipelineView nlpSteps={nlpSteps} loading={loading} />
              </div>
            )}
          </div>
        )}

        {/* Vista 2: Pipeline PLN Paso a Paso */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="glass p-5 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-slate-400 block">Reseña bajo análisis:</span>
                <p className="text-sm text-slate-200 italic font-serif">
                  {reviewText ? `"${reviewText}"` : 'Ninguna reseña analizada aún. Ingresa una en el clasificador.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition"
              >
                Cambiar Reseña
              </button>
            </div>
            <NlpPipelineView nlpSteps={nlpSteps} loading={loading} />
          </div>
        )}

        {/* Vista 3: Métricas del Modelo */}
        {activeTab === 'metrics' && <MetricsDashboard />}

        {/* Vista 4: Análisis por Lote CSV */}
        {activeTab === 'batch' && <BatchAnalysis />}
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p>
              <strong>Sentix-Hotel</strong> · Proyecto Integrador de Tópicos Especiales y Programación Avanzada
            </p>
            <p className="text-[11px] text-slate-600">
              Equipo: Javier (9no), José, Gabriel · Docente: Ing. Tópicos
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>FastAPI 0.115</span>
            <span>·</span>
            <span>Scikit-Learn 1.6</span>
            <span>·</span>
            <span>React 18 + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
