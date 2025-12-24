import type { NextApiRequest, NextApiResponse } from 'next';
import { listAlerts } from '../../../server/creatorStore';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) {return;}
  const limit = parseInt((req.query.limit as string) || '50', 10);
  try {
    const data = await listAlerts({ limit });
    res.status(200).json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list alerts';
    res.status(500).json({ error: message });
  }
}

