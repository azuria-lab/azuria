import React, { useCallback, useEffect, useState } from 'react';
import { useCreatorStream } from '../../azuria_ai/hooks/useCreatorStream';
import { ADMIN_UID_FRONT } from '../../config/admin';

export function EvolutionPanel() {
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/admin/creator/evolution', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => {
        setEvents(r.events || []);
        setSnapshots(r.snapshots || []);
      })
      .catch(() => {});
  }, []);

  const onEvent = useCallback((ev: Record<string, unknown>) => {
    setEvents((prev) => [{ type: 'stream', payload: ev, created_at: Date.now() }, ...prev].slice(0, 50));
  }, []);

  useCreatorStream((ev) => {
    if (ev && ev.pattern) {return onEvent({ type: 'pattern', payload: ev });}
    if (ev && ev.insight) {return onEvent({ type: 'insight', payload: ev });}
    return onEvent(ev);
  });

  return (
    <div className="p-3 rounded border border-purple-200 bg-purple-50 space-y-3">
      <div className="text-sm font-semibold">Evolução do Sistema</div>
      <div className="space-y-2 text-sm max-h-72 overflow-y-auto">
        {events.map((e, idx) => {
          const createdAt = typeof e.created_at === 'number' ? e.created_at : Date.now();
          const type = typeof e.type === 'string' ? e.type : 'evolution';
          return (
            <div key={idx} className="p-2 rounded border border-purple-100 bg-white">
              <div className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</div>
              <div className="font-semibold">{type}</div>
              <div className="text-xs">{JSON.stringify(e.payload)}</div>
            </div>
          );
        })}
        {events.length === 0 && <div className="text-xs text-gray-500">Sem eventos</div>}
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-600 mb-1">Snapshots</div>
        <div className="text-xs text-gray-700 max-h-32 overflow-y-auto space-y-1">
          {snapshots.map((s: Record<string, unknown>, idx: number) => (
            <pre key={idx} className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap text-[11px]">
              {JSON.stringify(s, null, 2)}
            </pre>
          ))}
          {snapshots.length === 0 && <div className="text-xs text-gray-500">Sem snapshots</div>}
        </div>
      </div>
    </div>
  );
}

