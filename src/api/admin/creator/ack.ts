import type { NextApiRequest, NextApiResponse } from 'next';
import { logAdminAction, updateAlertStatus } from '../../../server/creatorStore';
import { requireAdmin } from '../../../azuria_ai/core/adminGuard';
import { notifySSE } from '../../../server/sseManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {return res.status(405).end();}
  if (!requireAdmin(req, res)) {return;}

  const { id, action, adminId } = JSON.parse(req.body || '{}');
  if (!id || !action) {return res.status(400).end('missing id/action');}

  const status =
    action === 'ack'
      ? 'acknowledged'
      : action === 'resolve'
      ? 'resolved'
      : action === 'ignore'
      ? 'ignored'
      : 'new';

  try {
    const updated = await updateAlertStatus(id, status as any);
    await logAdminAction({ adminId: adminId || 'admin', action, details: { id, status } });
    // Emitir evento SSE para clientes conectados
    notifySSE({
      channel: 'admin.creator',
      event: 'alert_ack',
      data: { id, status, action, adminId: adminId || 'admin' },
    });
    res.status(200).json({ ok: true, alert: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to ack alert' });
  }
}

