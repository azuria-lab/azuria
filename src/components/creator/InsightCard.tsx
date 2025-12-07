import React from 'react';

export function InsightCard({ insight }: { insight: any }) {
  return (
    <div className="p-3 rounded border border-blue-200 bg-blue-50">
      <div className="text-sm font-semibold">{insight.area || 'geral'}</div>
      <div className="text-sm mt-1">{insight.message || insight.recommendation}</div>
    </div>
  );
}

