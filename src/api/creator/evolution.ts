import type { NextApiRequest, NextApiResponse } from 'next';
import { listEvolutionEvents, listEvolutionSnapshots } from '../../server/evolutionStore';
import { requireAdmin } from '../../azuria_ai/core/adminGuard';
import { validateNumber } from '../validation';

// Limites para prevenir abuse
const MIN_LIMIT = 1;
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 50;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) {return;}

  // Validar e sanitizar o parâmetro limit
  const limitParam = req.query.limit;
  const limitValue = Array.isArray(limitParam) ? limitParam[0] : limitParam;
  
  const validation = validateNumber(limitValue, { 
    required: false, 
    min: MIN_LIMIT, 
    max: MAX_LIMIT 
  });

  const limit = validation.valid && typeof validation.sanitized === 'number'
    ? Math.floor(validation.sanitized) // Garantir inteiro
    : DEFAULT_LIMIT;

  res.status(200).json({
    events: listEvolutionEvents(limit),
    snapshots: listEvolutionSnapshots(Math.min(10, limit)),
  });
}

