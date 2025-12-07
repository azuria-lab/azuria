import type { NextApiRequest, NextApiResponse } from 'next';
import { listEvolutionEvents, listEvolutionSnapshots } from '../../server/evolutionStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin'] !== 'true') {
    res.status(401).end('unauthorized');
    return;
  }

  const limit = parseInt((req.query.limit as string) || '50', 10);
  res.status(200).json({
    events: listEvolutionEvents(limit),
    snapshots: listEvolutionSnapshots(10),
  });
}

