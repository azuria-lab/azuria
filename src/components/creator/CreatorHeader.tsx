import React from 'react';

export function CreatorHeader({ counters = { critical: 0, high: 0 } }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg shadow">
      <div>
        <h1 className="text-xl font-bold">Painel do Criador</h1>
        <p className="text-sm text-slate-200">Insights avançados e alertas estruturais</p>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="px-3 py-1 rounded bg-red-500/20 border border-red-400 text-red-100">Críticos: {counters.critical}</div>
        <div className="px-3 py-1 rounded bg-yellow-500/20 border border-yellow-400 text-yellow-100">Altos: {counters.high}</div>
      </div>
    </div>
  );
}

