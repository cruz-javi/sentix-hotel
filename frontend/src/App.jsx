import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ReviewInput from './components/ReviewInput';
import SentimentResult from './components/SentimentResult';
import NlpPipelineView from './components/NlpPipelineView';
import MetricsDashboard from './components/MetricsDashboard';
import BatchAnalysis from './components/BatchAnalysis';
import FeedbackModal from './components/FeedbackModal';
import { MessageSquare, Layers, BarChart3, UploadCloud } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'pipeline', 'metrics', 'batch'
  const [reviewText, setReviewText] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [nlpSteps, setNlpSteps] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado del modal de feedback unificado
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: null,
  });

  const handleShowFeedback = ({ type = 'info', title, message, details = null }) => {
    setFeedbackModal({
      isOpen: true,
      type,
      title,
      message,
      details,
    });
  };

  const handleCloseFeedback = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAnalyze = async () => {
    const trimmed = reviewText.trim();
    if (!trimmed) {
      handleShowFeedback({
        type: 'warning',
        title: 'Texto Requerido',
        message: 'Por favor, introduce una reseña antes de solicitar la clasificación de sentimiento.',
      });
      return;
    }

    setLoading(true);

    try {
      const predictPromise = fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      const nlpPromise = fetch('/api/nlp-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      const [resPredict, resNlp] = await Promise.all([predictPromise, nlpPromise]);

      if (!resPredict.ok) {
        const errorJson = await resPredict.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Error en la solicitud HTTP ${resPredict.status}`);
      }

      const predictData = await resPredict.json();
      setPredictResult(predictData);

      if (resNlp.ok) {
        const nlpData = await resNlp.json();
        setNlpSteps(nlpData);
      }
    } catch (err) {
      handleShowFeedback({
        type: 'error',
        title: 'Error de Clasificación',
        message: err.message || 'No fue posible completar la inferencia con el backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Barra de Navegación */}
      <Navbar />

      {/* Contenido Principal (60% slate-950, 30% slate-900/slate-800, 10% indigo) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pestañas de Navegación Sobrias */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pipeline PLN Paso a Paso</span>
            {nlpSteps && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Análisis por Lote CSV</span>
          </button>
        </div>

        {/* Vista 1: Clasificador en Vivo */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ReviewInput
                  text={reviewText}
                  setText={setReviewText}
                  onAnalyze={handleAnalyze}
                  loading={loading}
                />
              </div>
              <div className="lg:col-span-5 h-full">
                <SentimentResult result={predictResult} />
              </div>
            </div>

            {nlpSteps && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Desglose Técnico de Procesamiento
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pipeline')}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Abrir Vista Completa de PLN →
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
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Reseña Activa</span>
                <p className="text-xs text-slate-300 font-mono">
                  {reviewText ? `"${reviewText}"` : 'Ninguna reseña analizada aún. Ingrese una en la pestaña del clasificador.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Cambiar Texto
              </button>
            </div>
            <NlpPipelineView nlpSteps={nlpSteps} loading={loading} />
          </div>
        )}

        {/* Vista 3: Métricas del Modelo */}
        {activeTab === 'metrics' && <MetricsDashboard onShowFeedback={handleShowFeedback} />}

        {/* Vista 4: Análisis por Lote CSV */}
        {activeTab === 'batch' && <BatchAnalysis onShowFeedback={handleShowFeedback} />}
      </main>

      {/* Modal Unificado de Feedback */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={handleCloseFeedback}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        details={feedbackModal.details}
      />

      {/* Pie de Página Profesional y Sobrio */}
      <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-400">
              Sentix-Hotel
            </p>
            <p className="text-[11px] text-slate-600">
              Plataforma de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
            <span>FastAPI REST API</span>
            <span>·</span>
            <span>Scikit-Learn TF-IDF</span>
            <span>·</span>
            <span>React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
