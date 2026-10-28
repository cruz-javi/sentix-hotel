import React, { useEffect, useState } from 'react';
import { BarChart3, AlertOctagon, CheckCircle, TrendingUp, Info, RefreshCw } from 'lucide-react';

export default function MetricsDashboard() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/metrics');
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo cargar el reporte de métricas`);
      }
      const data = await res.json();
      setMetricsData(data);
    } catch (err) {
      setError(err.message || 'Error de conexión con el backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="glass p-12 rounded-2xl border border-slate-800 text-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
        <p className="text-sm text-slate-300">Cargando métricas y matriz de confusión del modelo...</p>
      </div>
    );
  }

  if (error || !metricsData) {
    return (
      <div className="glass p-8 rounded-2xl border border-rose-900/60 bg-rose-950/20 text-center py-12 space-y-3">
        <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-sm font-semibold text-rose-300">No se pudieron cargar las métricas</h3>
        <p className="text-xs text-rose-400/80">{error}</p>
        <button
          type="button"
          onClick={fetchMetrics}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { metrics, confusion_matrix, error_analysis_samples } = metricsData;
  const totalTest = confusion_matrix.true_negatives + confusion_matrix.false_positives + confusion_matrix.false_negatives + confusion_matrix.true_positives;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Evaluación y Rendimiento del Modelo</h2>
            <p className="text-xs text-slate-400">
              Evaluado sobre el conjunto de prueba independiente (894 reseñas nunca vistas en entrenamiento)
            </p>
          </div>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 font-mono">
          Modelo: <strong className="text-blue-400">{metricsData.model_name}</strong>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Accuracy Global</span>
          <div className="text-3xl font-black text-emerald-400">
            {(metrics.accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">860 aciertos de 894 reseñas</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">F1-Score (Macro)</span>
          <div className="text-3xl font-black text-blue-400">
            {(metrics.f1_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Balance armónico precisión / recall</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Precisión (Macro)</span>
          <div className="text-3xl font-black text-indigo-400">
            {(metrics.precision_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Fiabilidad al predecir una clase</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-medium text-slate-400">Recall / Sensibilidad</span>
          <div className="text-3xl font-black text-violet-400">
            {(metrics.recall_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Capacidad de capturar casos reales</p>
        </div>
      </div>

      {/* Matriz de Confusión y Desglose por Clase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matriz 2x2 Interactiva */}
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Matriz de Confusión (Test Set: {totalTest})
            </h3>
            <span className="text-[11px] text-slate-400">Verdaderos vs Predichos</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Verdadero Negativo */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-center">
              <span className="text-[11px] text-emerald-400 uppercase font-semibold block">Verdaderos Negativos (TN)</span>
              <span className="text-3xl font-black text-emerald-200 my-1 block">{confusion_matrix.true_negatives}</span>
              <p className="text-[10px] text-slate-400">Real: Negativo → Pred: Negativo</p>
            </div>

            {/* Falso Positivo */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-center">
              <span className="text-[11px] text-rose-400 uppercase font-semibold block">Falsos Positivos (FP)</span>
              <span className="text-3xl font-black text-rose-200 my-1 block">{confusion_matrix.false_positives}</span>
              <p className="text-[10px] text-slate-400">Error Tipo I (Alarma falsa)</p>
            </div>

            {/* Falso Negativo */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-center">
              <span className="text-[11px] text-amber-400 uppercase font-semibold block">Falsos Negativos (FN)</span>
              <span className="text-3xl font-black text-amber-200 my-1 block">{confusion_matrix.false_negatives}</span>
              <p className="text-[10px] text-slate-400">Error Tipo II (No detectado)</p>
            </div>

            {/* Verdadero Positivo */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-center">
              <span className="text-[11px] text-emerald-400 uppercase font-semibold block">Verdaderos Positivos (TP)</span>
              <span className="text-3xl font-black text-emerald-200 my-1 block">{confusion_matrix.true_positives}</span>
              <p className="text-[10px] text-slate-400">Real: Positivo → Pred: Positivo</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Solo <strong>34 errores en 894 predicciones</strong> (error rate de 3.8%), demostrando la alta efectividad del emparejamiento TF-IDF (1,2) + Regresión Logística.
            </span>
          </div>
        </div>

        {/* Métricas por Clase */}
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            Reporte Detallado por Clase
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Clase</th>
                  <th className="py-2.5 px-3 text-right">Precisión</th>
                  <th className="py-2.5 px-3 text-right">Recall</th>
                  <th className="py-2.5 px-3 text-right">F1-Score</th>
                  <th className="py-2.5 px-3 text-right">Muestras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-rose-300">Negativo</td>
                  <td className="py-2.5 px-3 text-right">{(metrics.classification_report.Negativo.precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">{(metrics.classification_report.Negativo.recall * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{(metrics.classification_report.Negativo['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{metrics.classification_report.Negativo.support}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-emerald-300">Positivo</td>
                  <td className="py-2.5 px-3 text-right">{(metrics.classification_report.Positivo.precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">{(metrics.classification_report.Positivo.recall * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{(metrics.classification_report.Positivo['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{metrics.classification_report.Positivo.support}</td>
                </tr>
                <tr className="bg-slate-900/50 font-sans">
                  <td className="py-2.5 px-3 font-bold text-slate-300">Promedio Macro</td>
                  <td className="py-2.5 px-3 text-right font-mono">{(metrics.classification_report['macro avg'].precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-mono">{(metrics.classification_report['macro avg'].recall * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-300">{(metrics.classification_report['macro avg']['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">{metrics.classification_report['macro avg'].support}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Configuración Centralizada (src/config.py):</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>N-gramas: (1, 2) [unigramas + bigramas]</li>
              <li>Vocabulario máximo: 5,000 rasgos TF-IDF</li>
              <li>Semilla reproducible: RANDOM_STATE = 42</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sección de Análisis de Errores (Requisito Docente) */}
      {error_analysis_samples && error_analysis_samples.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>🔍</span> Análisis de Errores en Producción
              </h3>
              <p className="text-xs text-slate-400">
                Casos difíciles donde el modelo erró la predicción debido a ambigüedad, ironía o quejas sutiles
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {error_analysis_samples.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800 font-semibold">
                      {item.error_type}
                    </span>
                    <span className="text-slate-400">Muestra #{item.sample_index}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">
                      Real: <strong className="text-emerald-400">{item.real_label}</strong>
                    </span>
                    <span className="text-slate-400">
                      Predicho: <strong className="text-rose-400">{item.predicted_label}</strong>
                    </span>
                    <span className="text-slate-400">
                      Probabilidad Positiva: <strong className="text-slate-200 font-mono">{(item.predicted_probability * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
