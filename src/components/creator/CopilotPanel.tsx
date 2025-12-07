import React, { useState } from 'react';
import { ADMIN_UID_FRONT } from '../../config/admin';

type CopilotResponse = {
  summary?: string;
  recommendations?: string[];
  actions?: { label: string; action: string }[];
  answer?: string;
  question?: string;
};

export function CopilotPanel() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<CopilotResponse | null>(null);

  const ask = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/creator/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'x-admin': 'true', 'x-admin-uid': ADMIN_UID_FRONT },
        body: question || '',
      });
      const data = await r.json();
      setResp(data);
    } catch (e) {
      setResp({ summary: 'Erro ao consultar copiloto.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded border border-slate-200 bg-white space-y-3">
      <div className="text-sm font-semibold">Copiloto do Admin</div>
      <div className="space-y-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          placeholder="Pergunte algo: status, riscos, sugestões..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={ask}
          disabled={loading}
          className="px-3 py-1 rounded bg-slate-900 text-white text-sm disabled:opacity-60"
        >
          {loading ? 'Consultando...' : 'Perguntar'}
        </button>
      </div>

      {resp && (
        <div className="space-y-2 text-sm">
          {resp.summary && <div className="text-slate-700">{resp.summary}</div>}
          {resp.answer && (
            <div className="p-2 border rounded bg-slate-50">
              <div className="text-xs text-slate-500 mb-1">Resposta:</div>
              <div>{resp.answer}</div>
            </div>
          )}
          {resp.recommendations && resp.recommendations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Recomendações:</div>
              <ul className="list-disc ml-4 space-y-1">
                {resp.recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {resp.actions && resp.actions.length > 0 && (
            <div className="text-xs text-slate-600">
              Ações sugeridas: {resp.actions.map((a) => a.label).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


