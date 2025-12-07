import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';
import { supabase } from '../../../integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) {return;}

  const { data, error } = await supabase
    .from('creator_health')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {return res.status(500).json({ error: error.message });}

  // Se houver múltiplos registros por módulo, devolvemos ordenados; o front pode usar o mais recente.
  res.status(200).json({ modules: data || [] });
}



