import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Loader2, Sparkles } from 'lucide-react';

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

export default function BatchAnalysis() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'positive', 'negative'

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        // Separar por líneas y limpiar comillas comunes de CSV
        const lines = content
          .split('\n')
          .map((line) => line.replace(/^"|"$/g, '').trim())
          .filter((line) => line.length > 5 && !line.toLowerCase().startsWith('review') && !line.toLowerCase().startsWith('texto'));
        setInputText(lines.join('\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSamples = () => {
    setInputText(SAMPLE_BATCH.join('\n'));
  };

  const handleRunBatch = async () => {
    setError(null);
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    if (lines.length === 0) {
      setError('Por favor ingresa al menos una reseña por línea.');
      return;
    }

    if (lines.length > 500) {
      setError('Límite máximo de 500 reseñas por lote para esta prueba.');
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
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setBatchResult(data);
    } catch (err) {
      setError(err.message || 'Error al procesar el lote en el backend');
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
    link.setAttribute('download', `sentix_predicciones_lote_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Encabezado y subida */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Análisis Masivo por Lote (Batch & CSV)</h2>
              <p className="text-xs text-slate-400">
                Carga un archivo CSV/TXT o pega múltiples reseñas (una por línea) para clasificación masiva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800 hover:bg-indigo-900/60 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cargar 10 Reseñas de Ejemplo</span>
          </button>
        </div>

        {/* Input Textarea & File drop */}
        <div className="space-y-3">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pega aquí reseñas una por renglón...&#10;Excelente servicio y comida deliciosa.&#10;No me gustó la habitación, olía mal."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Subir Archivo (.csv, .txt)</span>
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
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Clasificando Lote...</span>
                </>
              ) : (
                <span>Ejecutar Análisis del Lote</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Resultados de la predicción por lote */}
      {batchResult && (
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Resumen del Procesamiento
              </h3>
              <p className="text-xs text-slate-400">
                Total procesadas: <strong className="text-white">{batchResult.total_reviews}</strong> reseñas
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/50 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Resultados a CSV</span>
            </button>
          </div>

          {/* Distribución Global */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Positivas</span>
                <p className="text-2xl font-bold text-emerald-400">{batchResult.positive_count}</p>
              </div>
              <span className="text-xl font-bold text-emerald-300">
                {(batchResult.positive_ratio * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Negativas</span>
                <p className="text-2xl font-bold text-rose-400">{batchResult.negative_count}</p>
              </div>
              <span className="text-xl font-bold text-rose-300">
                {(batchResult.negative_ratio * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Barra de Proporción */}
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${batchResult.positive_ratio * 100}%` }}
              title={`Positivas: ${(batchResult.positive_ratio * 100).toFixed(1)}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${batchResult.negative_ratio * 100}%` }}
              title={`Negativas: ${(batchResult.negative_ratio * 100).toFixed(1)}%`}
            />
          </div>

          {/* Filtros de la tabla */}
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs text-slate-400">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({batchResult.results.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('positive')}
              className={`text-xs px-2.5 py-1 rounded-lg transition ${
                filter === 'positive'
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Positivas ({batchResult.positive_count})
            </button>
            <button
              type="button"
              onClick={() => setFilter('negative')}
              className={`text-xs px-2.5 py-1 rounded-lg transition ${
                filter === 'negative'
                  ? 'bg-rose-700 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Negativas ({batchResult.negative_count})
            </button>
          </div>

          {/* Tabla de Resultados */}
          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/90 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Reseña</th>
                  <th className="py-2.5 px-3">Sentimiento</th>
                  <th className="py-2.5 px-3 text-right">Confianza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredResults.map((item) => (
                  <tr key={item.index} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.index}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">{item.text}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px] ${
                          item.sentiment_class === 1
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
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
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
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
