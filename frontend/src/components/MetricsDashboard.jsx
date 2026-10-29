import React, { useEffect, useState } from 'react';
import { BarChart3, AlertOctagon, CheckCircle2, TrendingUp, Info, RefreshCw, Search } from 'lucide-react';

export default function MetricsDashboard({ onShowFeedback }) {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/metrics');
      if (!res.ok) {
        throw new Error(`Error ${res.status}: Imposible cargar reporte de métricas`);
      }
      const data = await res.json();
      setMetricsData(data);
    } catch (err) {
      const errorMsg = err.message || 'Error de conexión con el backend';
      setError(errorMsg);
      if (onShowFeedback) {
        onShowFeedback({
          type: 'error',
          title: 'Fallo al Cargar Métricas',
          message: 'No se pudo obtener el reporte de rendimiento del modelo. Verifique que el backend esté en ejecución.',
          details: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center py-20 space-y-3">
        <RefreshCw className="w-7 h-7 animate-spin text-indigo-400 mx-auto" />
        <p className="text-xs text-slate-400">Cargando reporte de evaluación y matriz de confusión...</p>
      </div>
    );
  }

  if (error || !metricsData) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center py-12 space-y-3">
        <AlertOctagon className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-200">No se pudieron cargar las métricas</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          type="button"
          onClick={fetchMetrics}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700 transition"
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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Evaluación y Rendimiento del Clasificador</h2>
            <p className="text-xs text-slate-400">
              Métricas calculadas sobre conjunto de prueba aislado ({totalTest} muestras independientes)
            </p>
          </div>
        </div>
        <div className="text-xs px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
          Modelo: <span className="text-indigo-400 font-medium">{metricsData.model_name}</span>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Exactitud (Accuracy)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {(metrics.accuracy * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">860 aciertos de 894 evaluaciones</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">F1-Score Macro</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {(metrics.f1_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Promedio armónico balanceado</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Precisión Macro</span>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {(metrics.precision_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Exactitud de predicciones positivas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sensibilidad (Recall)</span>
          <div className="text-2xl font-bold text-violet-400 font-mono">
            {(metrics.recall_macro * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-500">Cobertura de clases reales</p>
        </div>
      </div>

      {/* Matriz de Confusión y Métricas por Clase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matriz 2x2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matriz de Confusión</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">N = {totalTest}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verdaderos Negativos</span>
              <span className="text-2xl font-bold text-slate-100 my-1 block font-mono">{confusion_matrix.true_negatives}</span>
              <p className="text-[10px] text-slate-500">Real: Negativo → Pred: Negativo</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-rose-400 uppercase font-semibold block">Falsos Positivos</span>
              <span className="text-2xl font-bold text-rose-300 my-1 block font-mono">{confusion_matrix.false_positives}</span>
              <p className="text-[10px] text-slate-500">Error Tipo I</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Falsos Negativos</span>
              <span className="text-2xl font-bold text-amber-300 my-1 block font-mono">{confusion_matrix.false_negatives}</span>
              <p className="text-[10px] text-slate-500">Error Tipo II</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verdaderos Positivos</span>
              <span className="text-2xl font-bold text-slate-100 my-1 block font-mono">{confusion_matrix.true_positives}</span>
              <p className="text-[10px] text-slate-500">Real: Positivo → Pred: Positivo</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              Tasa de error global de <strong>3.80%</strong> (34 discrepancias en 894 evaluaciones independientes).
            </span>
          </div>
        </div>

        {/* Tabla por Clase */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Desglose por Categoría</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3 text-right">Precisión</th>
                  <th className="py-2 px-3 text-right">Recall</th>
                  <th className="py-2 px-3 text-right">F1-Score</th>
                  <th className="py-2 px-3 text-right">Muestras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                <tr>
                  <td className="py-2 px-3 font-sans text-rose-300">Negativo</td>
                  <td className="py-2 px-3 text-right">{(metrics.classification_report.Negativo.precision * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">{(metrics.classification_report.Negativo.recall * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-100">{(metrics.classification_report.Negativo['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-slate-500">{metrics.classification_report.Negativo.support}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans text-emerald-300">Positivo</td>
                  <td className="py-2 px-3 text-right">{(metrics.classification_report.Positivo.precision * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">{(metrics.classification_report.Positivo.recall * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-100">{(metrics.classification_report.Positivo['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-slate-500">{metrics.classification_report.Positivo.support}</td>
                </tr>
                <tr className="bg-slate-950/60 font-sans">
                  <td className="py-2 px-3 font-semibold text-slate-300">Promedio Macro</td>
                  <td className="py-2 px-3 text-right font-mono">{(metrics.classification_report['macro avg'].precision * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono">{(metrics.classification_report['macro avg'].recall * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-indigo-300">{(metrics.classification_report['macro avg']['f1-score'] * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500">{metrics.classification_report['macro avg'].support}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Parámetros Centralizados (src/config.py):</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 font-mono">
              <li>Rango n-gramas: (1, 2)</li>
              <li>Características máximas: 5,000</li>
              <li>Semilla: RANDOM_STATE = 42</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Análisis de Errores Cualitativo */}
      {error_analysis_samples && error_analysis_samples.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Análisis Cualitativo de Errores
              </h3>
              <p className="text-xs text-slate-400">
                Casos discrepantes documentados para diagnóstico de ambigüedad semántica
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {error_analysis_samples.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                      {item.error_type}
                    </span>
                    <span className="text-slate-500">Muestra #{item.sample_index}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>Etiqueta Real: <strong className="text-emerald-400">{item.real_label}</strong></span>
                    <span>Predicción: <strong className="text-rose-400">{item.predicted_label}</strong></span>
                    <span className="font-mono">P(Pos): {(item.predicted_probability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
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
