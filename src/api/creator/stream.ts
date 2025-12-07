import type { NextApiRequest, NextApiResponse } from 'next';
import { registerClient, unregisterClient } from '../../server/sseManager';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Checagem mínima de admin (placeholder). Ajustar para auth real.
  if (req.headers['x-admin'] !== 'true') {
    res.status(401).end('unauthorized');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const id = registerClient(res);
  req.on('close', () => unregisterClient(id));
}

