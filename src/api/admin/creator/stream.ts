import type { NextApiRequest, NextApiResponse } from 'next';
import { registerClient, unregisterClient } from '../../../server/sseManager';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) {return;}

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const id = registerClient(res);
  req.on('close', () => unregisterClient(id));
}

