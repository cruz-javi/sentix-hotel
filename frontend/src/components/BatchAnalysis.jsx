import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Loader2, Sparkles, Filter } from 'lucide-react';

const SAMPLE_BATCH = [
  "El hotel es maravilloso, las habitaciones tienen vista al mar y el servicio es de primera.",
  "Pésima experiencia, la habitación estaba sucia, no había agua caliente y el trato fue grosero.",
  "La comida del restaurante buffet estaba deliciosa, mucha variedad y los camareros muy amables.",
  "No me gustó para nada, aire acondicionado descompuesto, mucho ruido y no nos dieron solución.",
  "Excelente ubicación cerca de la playa, piscina limpia y camas muy cómodas.",
  "El wifi nunca funcionó, el baño tenía olor desagradable y el check-in demoró más de una hora.",
  "Desayuno espectacular, personal atento y las instalaciones impecables. Volveremos sin dudarlo.",
  "No lo recomiendo, cobran por todo y la atención al cliente deja muchísimo que desear.",
  "Instalaciones modernas, gimnasio bien equipado y un ambiente muy tranquilo para descansar.",
  "La habitación no coincidía con las fotos, sábanas manchadas y no hubo disculpas del encargado."
];

export default function BatchAnalysis({ onShowFeedback }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const lines = content
          .split('\n')
          .map((line) => line.replace(/^"|"$/g, '').trim())
          .filter((line) => line.length > 5 && !line.toLowerCase().startsWith('review') && !line.toLowerCase().startsWith('texto'));
        setInputText(lines.join('\n'));
        if (onShowFeedback) {
          onShowFeedback({
            type: 'info',
            title: 'Archivo Cargado',
            message: `Se han extraído ${lines.length} reseñas válidas del archivo seleccionado.`,
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSamples = () => {
    setInputText(SAMPLE_BATCH.join('\n'));
  };

  const handleRunBatch = async () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    if (lines.length === 0) {
      if (onShowFeedback) {
        onShowFeedback({
          type: 'warning',
          title: 'Texto Insuficiente',
          message: 'Por favor ingresa al menos una reseña (mínimo una línea con más de 3 caracteres).',
        });
      }
      return;
    }

    if (lines.length > 500) {
      if (onShowFeedback) {
        onShowFeedback({
          type: 'warning',
          title: 'Límite Excedido',
          message: 'El procesador en lote admite hasta 500 reseñas por ejecución en esta versión.',
        });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/predict-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: lines }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error de servidor HTTP ${res.status}`);
      }

      const data = await res.json();
      setBatchResult(data);
      if (onShowFeedback) {
        onShowFeedback({
          type: 'success',
          title: 'Procesamiento Exitoso',
          message: `Se han clasificado ${data.total_reviews} reseñas (${data.positive_count} positivas, ${data.negative_count} negativas).`,
        });
      }
    } catch (err) {
      if (onShowFeedback) {
        onShowFeedback({
          type: 'error',
          title: 'Error de Inferencia por Lote',
          message: err.message || 'No se pudo comunicar con el servidor para la predicción en lote.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!batchResult) return;
    const header = 'id,texto,sentimiento,probabilidad_positiva,probabilidad_negativa\n';
    const rows = batchResult.results
      .map(
        (item) =>
          `${item.index},"${item.text.replace(/"/g, '""')}",${item.sentiment_label},${item.probability_positive},${item.probability_negative}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentix_predicciones_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowFeedback) {
      onShowFeedback({
        type: 'info',
        title: 'Descarga Iniciada',
        message: 'El archivo CSV estructurado con las predicciones ha sido generado y descargado.',
      });
    }
  };

  const filteredResults = batchResult
    ? batchResult.results.filter((item) => {
        if (filter === 'positive') return item.sentiment_class === 1;
        if (filter === 'negative') return item.sentiment_class === 0;
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Carga y controles */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Clasificación Masiva por Lote</h2>
              <p className="text-xs text-slate-400">
                Procesamiento vectorial por lotes mediante archivo CSV o pegado multilínea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cargar 10 Muestras de Prueba</span>
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ingrese una reseña por línea...&#10;Excelente servicio y atención de primera.&#10;La habitación no estaba limpia y la comida fría."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <label className="cursor-pointer text-xs px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importar Archivo (.csv, .txt)</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleRunBatch}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando Lote...</span>
                </>
              ) : (
                <span>Ejecutar Clasificación Masiva</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados de predicción por lote */}
      {batchResult && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Distribución del Lote Procesado
              </h3>
              <p className="text-xs text-slate-400">
                Total evaluado: <strong className="text-slate-100 font-mono">{batchResult.total_reviews}</strong> registros
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exportar Predicciones a CSV</span>
            </button>
          </div>

          {/* Métricas del lote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Reseñas Favorables</span>
                <p className="text-xl font-bold text-emerald-400 font-mono">{batchResult.positive_count}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {(batchResult.positive_ratio * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Reseñas Desfavorables</span>
                <p className="text-xl font-bold text-rose-400 font-mono">{batchResult.negative_count}</p>
              </div>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {(batchResult.negative_ratio * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Barra de proporción */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${batchResult.positive_ratio * 100}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${batchResult.negative_ratio * 100}%` }}
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2 pt-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({batchResult.results.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('positive')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === 'positive'
                  ? 'bg-slate-700 text-emerald-300 font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Positivas ({batchResult.positive_count})
            </button>
            <button
              type="button"
              onClick={() => setFilter('negative')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === 'negative'
                  ? 'bg-slate-700 text-rose-300 font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Negativas ({batchResult.negative_count})
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto max-h-80 rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/90 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Texto Extraído</th>
                  <th className="py-2 px-3">Predicción</th>
                  <th className="py-2 px-3 text-right">Confianza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredResults.map((item) => (
                  <tr key={item.index} className="hover:bg-slate-900/60 transition">
                    <td className="py-2 px-3 font-mono text-slate-500">{item.index}</td>
                    <td className="py-2 px-3 text-slate-300 max-w-md truncate">{item.text}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.sentiment_class === 1
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/80'
                            : 'bg-rose-950/40 text-rose-300 border border-rose-800/80'
                        }`}
                      >
                        {item.sentiment_class === 1 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                        )}
                        {item.sentiment_label}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
