import React from 'react';

export function RoadmapEditor({ items = [] }: { items?: string[] }) {
  return (
    <div className="p-3 rounded border border-amber-200 bg-amber-50">
      <div className="text-sm font-semibold mb-2">Roadmap sugerido</div>
      <ul className="space-y-1 text-sm">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-amber-600">•</span>
            <span>{it}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-amber-700">Sem itens no momento.</li>}
      </ul>
    </div>
  );
}

