import React from 'react';

export function HealthMap({ modules = [] as Record<string, unknown>[] }) {
  return (
    <div className="p-3 rounded border border-emerald-200 bg-emerald-50">
      <div className="text-sm font-semibold mb-2">Health Map</div>
      <div className="space-y-2 text-sm">
        {modules.map((m, idx) => {
          const name = typeof m.name === 'string' ? m.name : 'Unknown';
          const trust = typeof m.trust === 'number' ? m.trust : 0;
          return (
            <div key={idx} className="flex justify-between p-2 rounded bg-white border border-gray-200">
              <span>{name}</span>
              <span className={trust > 0.7 ? 'text-emerald-600' : 'text-amber-600'}>{Math.round(trust * 100)}%</span>
            </div>
          );
        })}
        {modules.length === 0 && <div className="text-xs text-gray-500">Sem dados</div>}
      </div>
    </div>
  );
}

