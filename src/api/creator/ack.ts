import type { NextApiRequest, NextApiResponse } from 'next';
import { updateAlertStatus, logAdminAction } from '../../server/creatorStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-admin'] !== 'true') {
    res.status(401).end('unauthorized');
    return;
  }

  const { id, action, adminId } = JSON.parse(req.body || '{}');
  if (!id || !action) return res.status(400).end('missing id/action');

  const status =
    action === 'ack'
      ? 'acknowledged'
      : action === 'resolve'
      ? 'resolved'
      : action === 'ignore'
      ? 'ignored'
      : 'new';
  const updated = updateAlertStatus(id, status as any);
  logAdminAction({ adminId: adminId || 'admin', action, details: { id } });
  res.status(200).json({ ok: true, alert: updated });
}

