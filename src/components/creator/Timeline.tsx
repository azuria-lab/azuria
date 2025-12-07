import React from 'react';

export function Timeline({ events = [] }: { events?: any[] }) {
  return (
    <div className="p-3 rounded border border-gray-200 bg-white">
      <div className="text-sm font-semibold mb-2">Timeline</div>
      <ul className="space-y-2 text-sm">
        {events.map((e, idx) => (
          <li key={idx} className="border-l-2 border-cyan-400 pl-2">
            <div className="text-xs text-gray-500">{new Date(e.created_at || Date.now()).toLocaleString()}</div>
            <div className="font-semibold">{e.type || e.event}</div>
            <div>{e.message}</div>
          </li>
        ))}
        {events.length === 0 && <li className="text-xs text-gray-500">Sem eventos</li>}
      </ul>
    </div>
  );
}

