import { supabase } from '../integrations/supabase/client';

type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'ignored';

export interface CreatorAlert {
  id: string;
  type: 'alert' | 'insight' | 'recommendation' | 'roadmap';
  area?: string;
  severity?: string;
  message: string;
  payload?: any;
  originEngine?: string;
  confidence?: number;
  suggestedAction?: string;
  status: AlertStatus;
  created_at: string | null;
  updated_at: string | null;
}

export async function insertAlert(data: Partial<CreatorAlert>): Promise<CreatorAlert> {
  const payload = {
    type: data.type || 'alert',
    area: data.area,
    severity: data.severity || 'medium',
    message: data.message || data.payload?.message || 'Alert',
    payload: data.payload || null,
    status: data.status || 'new',
    originEngine: data.originEngine || data.payload?.originEngine || null,
    confidence: data.confidence ?? data.payload?.confidence ?? null,
    suggestedAction: data.suggestedAction || data.payload?.suggestedAction || null,
  };

  const { data: rows, error } = await supabase.from('creator_alerts').insert(payload).select().limit(1);
  if (error) throw error;
  return rows?.[0] as CreatorAlert;
}

export async function listAlerts({ limit = 50 } = {}): Promise<CreatorAlert[]> {
  const { data, error } = await supabase
    .from('creator_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as CreatorAlert[]) || [];
}

export async function updateAlertStatus(id: string, status: AlertStatus) {
  const { data, error } = await supabase
    .from('creator_alerts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .limit(1);
  if (error) throw error;
  return data?.[0] as CreatorAlert | undefined;
}

export async function logAdminAction(entry: { adminId: string; action: string; details?: any }) {
  const { error } = await supabase
    .from('admin_actions')
    .insert({
      admin_id: entry.adminId,
      action: entry.action,
      details: entry.details || null,
    });
  if (error) throw error;
}

