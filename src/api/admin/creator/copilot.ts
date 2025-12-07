import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';

const cannedAnswer = {
  summary:
    'Sistema estável. 1 alerta acknowledged. Latência do Marketplace Sync levemente alta; erro 5xx no gateway monitorado.',
  recommendations: [
    'Revisar batch do Marketplace Sync (reduzir para 200 itens).',
    'Acompanhar erros 5xx no gateway; criar playbook automático se voltar a subir.',
    'Gerar snapshot pós-ajustes e comparar métricas de latência.',
  ],
  actions: [
    { label: 'Criar tarefa de melhoria', action: 'create_task' },
    { label: 'Abrir relatório PDF', action: 'export_pdf' },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  const question = (req.body && typeof req.body === 'string' ? req.body : '') || '';
  const answer =
    question.length > 0
      ? {
          ...cannedAnswer,
          answer: 'Resposta simulada: a IA analisou o estado atual e sugere focar no Marketplace Sync e erros 5xx.',
          question,
        }
      : cannedAnswer;

  res.status(200).json(answer);
}


