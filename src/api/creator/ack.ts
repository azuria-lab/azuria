import type { NextApiRequest, NextApiResponse } from 'next';
import { logAdminAction, updateAlertStatus } from '../../server/creatorStore';
import { requireAdmin } from '../../azuria_ai/core/adminGuard';
import { notifySSE } from '../../server/sseManager';
import { validateEnum, validateRequestBody, validateUUID } from '../validation';

// Ações permitidas
const ALLOWED_ACTIONS = ['ack', 'resolve', 'ignore'] as const;
type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) {return;}

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    
    // Validação robusta dos inputs
    const validation = validateRequestBody(body, [
      { field: 'id', type: 'string', options: { minLength: 1, maxLength: 100 } },
      { field: 'action', type: 'string', options: { minLength: 1, maxLength: 20 } },
      { field: 'adminId', type: 'string', options: { required: false, maxLength: 100 } },
    ]);

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    const { id, action, adminId } = validation.data as { id: string; action: string; adminId?: string };
    
    // Validar ID como string não-vazia (pode ser UUID ou outro formato)
    const idValidation = validateUUID(id, { required: false });
    if (!idValidation.valid && (!id || id.length < 1)) {
      return res.status(400).json({ error: 'Invalid alert ID format' });
    }
    
    // Validar action como enum
    const actionValidation = validateEnum(action, [...ALLOWED_ACTIONS]);
    if (!actionValidation.valid) {
      return res.status(400).json({ 
        error: `Invalid action. Must be one of: ${ALLOWED_ACTIONS.join(', ')}` 
      });
    }

    let status = 'new';
    if (action === 'ack') {
      status = 'acknowledged';
    } else if (action === 'resolve') {
      status = 'resolved';
    } else if (action === 'ignore') {
      status = 'ignored';
    }
        
    const sanitizedAdminId = adminId || 'admin';
    const updated = await updateAlertStatus(id, status as any);
    await logAdminAction({ adminId: sanitizedAdminId, action: action as AllowedAction, details: { id, status } });
    
    // Notificar outros clientes SSE
    notifySSE({
      channel: 'admin.creator',
      event: 'alert_ack',
      data: { id, status, action, adminId: sanitizedAdminId },
    });
    
    res.status(200).json({ ok: true, alert: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update alert';
    res.status(500).json({ error: errorMessage });
  }
}

