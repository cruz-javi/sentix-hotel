import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, type = 'info', title, message, details }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-800',
      buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
      accentBorder: 'border-rose-900/60',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800',
      buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
      accentBorder: 'border-amber-900/60',
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      accentBorder: 'border-emerald-900/60',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-400" />,
      badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-800',
      buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white',
      accentBorder: 'border-blue-900/60',
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md bg-slate-900 border ${current.accentBorder} rounded-2xl shadow-2xl p-6 space-y-4 relative transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex-shrink-0">
            {current.icon}
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {details && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 max-h-32 overflow-y-auto">
            {details}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${current.buttonClass}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

