/**
 * ══════════════════════════════════════════════════════════════════════════════
 * RECORDING PERSISTENCE SERVICE - Persistência de Gravações no Supabase
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Serviço para salvar e carregar gravações de eventos do sistema cognitivo.
 * Integra com Supabase para persistência de longo prazo.
 *
 * @module observability/RecordingPersistence
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import type { EventRecording } from './EventReplay';
import type { EventType } from '../core/eventBus';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PersistedRecording {
  id: string;
  session_id: string;
  name: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  event_count: number;
  event_types: string[];
  status: 'recording' | 'completed' | 'archived';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersistedRecordingItem {
  id: string;
  recording_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  timestamp: string;
  relative_time_ms: number;
  sequence_number: number;
}

/** Severidade do alerta */
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface PersistedAlert {
  id: string;
  alert_id: string;
  rule_id: string;
  rule_name: string;
  severity: AlertSeverity;
  metric_name: string;
  metric_value: number;
  threshold: number;
  operator: string;
  message: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  triggered_at: string;
  created_at: string;
}

export interface PersistenceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECORDING PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Salva uma gravação no Supabase
 */
export async function saveRecording(
  recording: EventRecording,
  name?: string,
  description?: string
): Promise<PersistenceResult<string>> {
  try {
    // 1. Inserir metadata da gravação (tabela pode não existir no schema atual)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recordingData, error: recordingError } = await (supabase.from('event_recordings' as any) as any)
      .insert({
        session_id: recording.id,
        name: name || `Recording ${new Date(recording.startedAt).toLocaleString('pt-BR')}`,
        description: description || null,
        started_at: new Date(recording.startedAt).toISOString(),
        ended_at: recording.endedAt ? new Date(recording.endedAt).toISOString() : null,
        duration_ms: recording.endedAt ? recording.endedAt - recording.startedAt : null,
        event_count: recording.events.length,
        event_types: (recording.metadata?.eventTypes as string[]) || [],
        status: 'completed',
      })
      .select('id')
      .single();

    if (recordingError || !recordingData) {
      logger.error('[RecordingPersistence] Error saving recording:', recordingError);
      return { success: false, error: recordingError?.message || 'Failed to save recording' };
    }

    const recordingId = (recordingData as { id: string })?.id;
    if (!recordingId) {
      return { success: false, error: 'Failed to get recording ID' };
    }

    // 2. Inserir eventos em batches (max 100 por vez)
    const BATCH_SIZE = 100;
    const events = recording.events.map((event, index) => ({
      recording_id: recordingId,
      event_type: event.eventType,
      event_data: event.payload || {},
      timestamp: new Date(event.timestamp).toISOString(),
      relative_time_ms: event.timestamp - recording.startedAt,
      sequence_number: index,
    }));

    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase.from('event_recording_items' as any) as any)
        .insert(batch);

      if (itemsError) {
        logger.error('[RecordingPersistence] Error saving events batch:', itemsError);
        // Tentar deletar a gravação parcial
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('event_recordings' as any) as any).delete().eq('id', recordingId);
        return { success: false, error: itemsError.message };
      }
    }

    logger.info(`[RecordingPersistence] Saved recording ${recordingId} with ${events.length} events`);
    return { success: true, data: recordingId };
  } catch (error) {
    logger.error('[RecordingPersistence] Unexpected error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Carrega uma gravação do Supabase
 */
export async function loadRecording(
  recordingId: string
): Promise<PersistenceResult<EventRecording>> {
  try {
    // 1. Buscar metadata (tabela pode não existir no schema atual)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recording, error: recordingError } = await (supabase.from('event_recordings' as any) as any)
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError || !recording) {
      return { success: false, error: recordingError?.message || 'Recording not found' };
    }

    // 2. Buscar eventos ordenados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items, error: itemsError } = await (supabase.from('event_recording_items' as any) as any)
      .select('*')
      .eq('recording_id', recordingId)
      .order('sequence_number', { ascending: true });

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // 3. Converter para formato EventRecording
    const recordingData = recording as Record<string, unknown>;
    const startedAt = new Date(recordingData.started_at as string).getTime();
    const endedAt = recordingData.ended_at ? new Date(recordingData.ended_at as string).getTime() : Date.now();
    const eventRecording: EventRecording = {
      id: recordingData.session_id as string,
      name: (recordingData.name as string) || `Recording ${recordingData.session_id}`,
      startedAt,
      endedAt,
      duration: endedAt - startedAt,
      eventCount: (recordingData.event_count as number) || 0,
      events: ((items || []) as Array<Record<string, unknown>>).map((item) => ({
        id: String(item.id || ''),
        timestamp: new Date(item.timestamp as string).getTime(),
        relativeTime: (item.relative_time_ms as number) || 0,
        eventType: item.event_type as EventType,
        payload: item.event_data || {},
      })),
      metadata: {
        eventTypes: (recordingData.event_types as string[]) || [],
      },
    };

    return { success: true, data: eventRecording };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Lista gravações do Supabase
 */
export async function listRecordings(options?: {
  status?: 'recording' | 'completed' | 'archived';
  limit?: number;
  offset?: number;
}): Promise<PersistenceResult<PersistedRecording[]>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('event_recordings' as any) as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PersistedRecording[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Deleta uma gravação do Supabase
 */
export async function deleteRecording(
  recordingId: string
): Promise<PersistenceResult<void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('event_recordings' as any) as any)
      .delete()
      .eq('id', recordingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Arquiva uma gravação (soft delete)
 */
export async function archiveRecording(
  recordingId: string
): Promise<PersistenceResult<void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('event_recordings' as any) as any)
      .update({ status: 'archived' })
      .eq('id', recordingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALERT PERSISTENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Salva um alerta no histórico
 */
export async function saveAlert(alert: {
  alertId: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  metricName: string;
  metricValue: number;
  threshold: number;
  operator: string;
  message?: string;
}): Promise<PersistenceResult<string>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('cognitive_alerts_history' as any) as any)
      .insert({
        alert_id: alert.alertId,
        rule_id: alert.ruleId,
        rule_name: alert.ruleName,
        severity: alert.severity,
        metric_name: alert.metricName,
        metric_value: alert.metricValue,
        threshold: alert.threshold,
        operator: alert.operator,
        message: alert.message || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as { id: string })?.id || '' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Atualiza status de um alerta
 */
export async function updateAlertStatus(
  alertId: string,
  status: 'acknowledged' | 'resolved',
  userId?: string
): Promise<PersistenceResult<void>> {
  try {
    const updates: Record<string, unknown> = { status };

    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
      if (userId) {updates.acknowledged_by = userId;}
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('cognitive_alerts_history' as any) as any)
      .update(updates)
      .eq('alert_id', alertId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Lista histórico de alertas
 */
export async function listAlerts(options?: {
  status?: 'active' | 'acknowledged' | 'resolved';
  severity?: 'info' | 'warning' | 'critical';
  limit?: number;
  since?: Date;
}): Promise<PersistenceResult<PersistedAlert[]>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('cognitive_alerts_history' as any) as any)
      .select('*')
      .order('triggered_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.severity) {
      query = query.eq('severity', options.severity);
    }

    if (options?.since) {
      query = query.gte('triggered_at', options.since.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PersistedAlert[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Obtém estatísticas de alertas
 */
export async function getAlertStats(since?: Date): Promise<PersistenceResult<{
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: Record<string, number>;
}>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('cognitive_alerts_history' as any) as any)
      .select('status, severity');

    if (since) {
      query = query.gte('triggered_at', since.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const alerts = ((data || []) as Array<Record<string, unknown>>);
    const stats = {
      total: alerts.length,
      active: alerts.filter((a) => (a.status as string) === 'active').length,
      acknowledged: alerts.filter((a) => (a.status as string) === 'acknowledged').length,
      resolved: alerts.filter((a) => (a.status as string) === 'resolved').length,
      bySeverity: {
        info: alerts.filter((a) => (a.severity as string) === 'info').length,
        warning: alerts.filter((a) => (a.severity as string) === 'warning').length,
        critical: alerts.filter((a) => (a.severity as string) === 'critical').length,
      },
    };

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const RecordingPersistence = {
  saveRecording,
  loadRecording,
  listRecordings,
  deleteRecording,
  archiveRecording,
  saveAlert,
  updateAlertStatus,
  listAlerts,
  getAlertStats,
};

export default RecordingPersistence;
