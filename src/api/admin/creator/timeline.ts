import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';

const now = Date.now();
const mockTimeline = [
  { type: 'alert', message: 'Alerta de teste acknowledged', created_at: now - 60 * 1000 },
  { type: 'insight', message: 'IA sugere revisar latência do Marketplace Sync', created_at: now - 5 * 60 * 1000 },
  { type: 'pattern', message: 'Aumento de erros 5xx no gateway (padrão detectado)', created_at: now - 15 * 60 * 1000 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;
  res.status(200).json({ timeline: mockTimeline });
}


