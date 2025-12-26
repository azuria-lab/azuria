import React from 'react';

export function InsightCard({ insight }: { insight: Record<string, unknown> }) {
  const area = typeof insight.area === 'string' ? insight.area : 'geral';
  const message = typeof insight.message === 'string' ? insight.message : (typeof insight.recommendation === 'string' ? insight.recommendation : '');
  return (
    <div className="p-3 rounded border border-blue-200 bg-blue-50">
      <div className="text-sm font-semibold">{area}</div>
      <div className="text-sm mt-1">{message}</div>
    </div>
  );
}

