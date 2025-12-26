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
      {alerts.map((a, idx) => {
        const alertId = typeof a.id === 'string' ? a.id : String(idx);
        const area = typeof a.area === 'string' ? a.area : 'ecosystem';
        const severity = typeof a.severity === 'string' ? a.severity : 'info';
        const message = typeof a.message === 'string' ? a.message : (typeof a.recommendation === 'string' ? a.recommendation : '');
        const recommendation = typeof a.recommendation === 'string' ? a.recommendation : undefined;
        return (
          <div key={alertId} className={`p-3 rounded border ${severity === 'critical' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex justify-between">
              <div>
                <strong>{area}</strong> • <span className="text-sm">{severity}</span>
                <p className="mt-1 text-sm">{message}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => ack(alertId, 'ack')} className="btn btn-sm">
                  Ack
                </button>
                <button onClick={() => ack(alertId, 'ignore')} className="btn btn-sm">
                  Ignorar
                </button>
              </div>
            </div>
            {recommendation && (
              <div className="mt-2 flex gap-2">
                <button onClick={() => ack(alertId, 'resolve')} className="btn btn-xs">
                  Aceitar
                </button>
                <button onClick={() => ack(alertId, 'ignore')} className="btn btn-xs">
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

