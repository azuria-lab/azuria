import React, { useCallback, useEffect, useState } from 'react';
import { useCreatorStream } from '../../azuria_ai/hooks/useCreatorStream';
import { ADMIN_UID_FRONT } from '../../config/admin';

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);

  // carga inicial via API (fallback)
  useEffect(() => {
    fetch('/api/admin/creator/list', { headers: { 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT } })
      .then((r) => r.json())
      .then((r) => setAlerts(r.data || []))
      .catch(() => {});
  }, []);

  const onEvent = useCallback((ev: Record<string, unknown>) => {
    setAlerts((prev) => [ev, ...prev]);
  }, []);

  useCreatorStream(onEvent);

  const ack = async (id: string, action = 'ack') => {
    await fetch('/api/admin/creator/ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT },
      body: JSON.stringify({ id, action }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: action === 'ack' ? 'acknowledged' : action } : a)));
  };

  return (
    <div className="p-4 space-y-3">
      {alerts.map((a) => (
        <div key={a.id} className={`p-3 rounded border ${a.severity === 'critical' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
          <div className="flex justify-between">
            <div>
              <strong>{a.area || 'ecosystem'}</strong> • <span className="text-sm">{a.severity}</span>
              <p className="mt-1 text-sm">{a.message || a.recommendation}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => ack(a.id, 'ack')} className="btn btn-sm">
                Ack
              </button>
              <button onClick={() => ack(a.id, 'ignore')} className="btn btn-sm">
                Ignorar
              </button>
            </div>
          </div>
          {a.recommendation && (
            <div className="mt-2 flex gap-2">
              <button onClick={() => ack(a.id, 'resolve')} className="btn btn-xs">
                Aceitar
              </button>
              <button onClick={() => ack(a.id, 'ignore')} className="btn btn-xs">
                Rejeitar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

