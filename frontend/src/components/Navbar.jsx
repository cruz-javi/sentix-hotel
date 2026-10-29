import React, { useEffect, useState } from 'react';
import { Hotel, ExternalLink, Activity } from 'lucide-react';

export default function Navbar() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'healthy', 'error', 'checking'

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (data.status === 'healthy' && data.model_loaded) {
          setApiStatus('healthy');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        setApiStatus('error');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Sentix-Hotel
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
                React + Vite
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Minería de Opinión y PLN en Reseñas de Hospedaje en Español
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
            apiStatus === 'healthy'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : apiStatus === 'checking'
              ? 'bg-slate-800/80 border-slate-700 text-slate-400'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              apiStatus === 'healthy' ? 'bg-emerald-400' : apiStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-rose-400'
            }`} />
            <span>
              {apiStatus === 'healthy' ? 'API Conectada · Modelo Activo' : apiStatus === 'checking' ? 'Conectando...' : 'API Desconectada'}
            </span>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>Swagger API</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
