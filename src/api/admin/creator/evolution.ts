import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';
import { supabase } from '../../../integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) {return;}

  const limit = parseInt((req.query.limit as string) || '50', 10);

  const { data: events, error: eventsError } = await supabase
    .from('creator_evolution_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (eventsError) {return res.status(500).json({ error: eventsError.message });}

  const { data: snapshots, error: snapsError } = await supabase
    .from('creator_evolution_snapshots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (snapsError) {return res.status(500).json({ error: snapsError.message });}

  res.status(200).json({
    events: events || [],
    snapshots: snapshots || [],
  });
}


