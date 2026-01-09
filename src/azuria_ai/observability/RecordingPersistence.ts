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
    // 1. Inserir metadata da gravação
    const { data: recordingData, error: recordingError } = await supabase
      .from('event_recordings')
      .insert({
        session_id: recording.id,
        name: name || `Recording ${new Date(recording.startTime).toLocaleString('pt-BR')}`,
        description: description || null,
        started_at: new Date(recording.startTime).toISOString(),
        ended_at: recording.endTime ? new Date(recording.endTime).toISOString() : null,
        duration_ms: recording.endTime ? recording.endTime - recording.startTime : null,
        event_count: recording.events.length,
        event_types: recording.eventTypes,
        status: 'completed',
      })
      .select('id')
      .single();

    if (recordingError) {
      logger.error('[RecordingPersistence] Error saving recording:', recordingError);
      return { success: false, error: recordingError.message };
    }

    const recordingId = recordingData.id;

    // 2. Inserir eventos em batches (max 100 por vez)
    const BATCH_SIZE = 100;
    const events = recording.events.map((event, index) => ({
      recording_id: recordingId,
      event_type: event.type,
      event_data: event.data || {},
      timestamp: new Date(event.timestamp).toISOString(),
      relative_time_ms: event.timestamp - recording.startTime,
      sequence_number: index,
    }));

    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      const { error: itemsError } = await supabase
        .from('event_recording_items')
        .insert(batch);

      if (itemsError) {
        logger.error('[RecordingPersistence] Error saving events batch:', itemsError);
        // Tentar deletar a gravação parcial
        await supabase.from('event_recordings').delete().eq('id', recordingId);
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
    // 1. Buscar metadata
    const { data: recording, error: recordingError } = await supabase
      .from('event_recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError || !recording) {
      return { success: false, error: recordingError?.message || 'Recording not found' };
    }

    // 2. Buscar eventos ordenados
    const { data: items, error: itemsError } = await supabase
      .from('event_recording_items')
      .select('*')
      .eq('recording_id', recordingId)
      .order('sequence_number', { ascending: true });

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // 3. Converter para formato EventRecording
    const eventRecording: EventRecording = {
      id: recording.session_id,
      startTime: new Date(recording.started_at).getTime(),
      endTime: recording.ended_at ? new Date(recording.ended_at).getTime() : undefined,
      events: (items || []).map((item) => ({
        type: item.event_type,
        data: item.event_data as Record<string, unknown>,
        timestamp: new Date(item.timestamp).getTime(),
      })),
      eventTypes: recording.event_types || [],
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
    let query = supabase
      .from('event_recordings')
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
    const { error } = await supabase
      .from('event_recordings')
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
    const { error } = await supabase
      .from('event_recordings')
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
    const { data, error } = await supabase
      .from('cognitive_alerts_history')
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

    return { success: true, data: data.id };
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

    const { error } = await supabase
      .from('cognitive_alerts_history')
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
    let query = supabase
      .from('cognitive_alerts_history')
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
    let query = supabase
      .from('cognitive_alerts_history')
      .select('status, severity');

    if (since) {
      query = query.gte('triggered_at', since.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const alerts = data || [];
    const stats = {
      total: alerts.length,
      active: alerts.filter((a) => a.status === 'active').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      bySeverity: {
        info: alerts.filter((a) => a.severity === 'info').length,
        warning: alerts.filter((a) => a.severity === 'warning').length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
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
