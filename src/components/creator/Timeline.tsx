import React from 'react';

export function Timeline({ events = [] }: { events?: Record<string, unknown>[] }) {
  return (
    <div className="p-3 rounded border border-gray-200 bg-white">
      <div className="text-sm font-semibold mb-2">Timeline</div>
      <ul className="space-y-2 text-sm">
        {events.map((e, idx) => {
          const createdAt = typeof e.created_at === 'number' ? e.created_at : Date.now();
          const type = typeof e.type === 'string' ? e.type : (typeof e.event === 'string' ? e.event : 'event');
          const message = typeof e.message === 'string' ? e.message : '';
          return (
            <li key={idx} className="border-l-2 border-cyan-400 pl-2">
              <div className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</div>
              <div className="font-semibold">{type}</div>
              <div>{message}</div>
            </li>
          );
        })}
        {events.length === 0 && <li className="text-xs text-gray-500">Sem eventos</li>}
      </ul>
    </div>
  );
}

