import React from 'react';

export function ModuleHealthMap({ modules = [] as Record<string, unknown>[] }) {
  return (
    <div className="p-3 rounded border border-green-200 bg-green-50">
      <div className="text-sm font-semibold mb-2">Saúde dos módulos</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {modules.map((m, idx) => (
          <div key={idx} className="p-2 rounded border border-gray-200 bg-white flex justify-between">
            <span>{m.name}</span>
            <span className={m.health === 'critical' ? 'text-red-600' : 'text-green-600'}>{m.health}</span>
          </div>
        ))}
        {modules.length === 0 && <div className="text-xs text-gray-500">Sem dados</div>}
      </div>
    </div>
  );
}

