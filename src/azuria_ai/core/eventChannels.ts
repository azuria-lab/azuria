/**
 * Event Channels - Canais separados para isolamento de eventos
 * 
 * O Modo Deus opera em dois níveis:
 * - admin:* → Inteligência Estratégica (Dashboard do Criador)
 * - user:* → Inteligência Operacional (Co-Piloto do usuário)
 * - system:* → Eventos internos do sistema
 * 
 * Isso garante isolamento de segurança e permite evolução independente.
 */

// ============================================================================
// Channel Definitions
// ============================================================================

/**
 * Canais disponíveis no sistema
 */
export const EVENT_CHANNELS = {
  /** Canal para inteligência estratégica (ADMIN) */
  ADMIN: 'admin',
  /** Canal para inteligência operacional (USER) */
  USER: 'user',
  /** Canal para eventos internos do sistema */
  SYSTEM: 'system',
  /** Canal legado para compatibilidade */
  AI: 'ai',
} as const;

export type EventChannel = (typeof EVENT_CHANNELS)[keyof typeof EVENT_CHANNELS];

// ============================================================================
// Admin Channel Events (Inteligência Estratégica)
// ============================================================================

export type AdminEventType =
  | 'admin:creator-alert'
  | 'admin:creator-insight'
  | 'admin:creator-recommendation'
  | 'admin:creator-roadmap'
  | 'admin:governance-alert'
  | 'admin:governance-violation'
  | 'admin:tech-debt-detected'
  | 'admin:performance-issue'
  | 'admin:security-alert'
  | 'admin:evolution-report'
  | 'admin:system-health'
  | 'admin:audit-log'
  | 'admin:anomaly-detected'
  | 'admin:config-change';

// ============================================================================
// User Channel Events (Inteligência Operacional - Co-Piloto)
// ============================================================================

export type UserEventType =
  | 'user:suggestion'
  | 'user:hint'
  | 'user:explanation'
  | 'user:warning'
  | 'user:opportunity'
  | 'user:calculation-insight'
  | 'user:bidding-analysis'
  | 'user:tax-advice'
  | 'user:pricing-suggestion'
  | 'user:context-updated'
  | 'user:skill-level-detected'
  | 'user:feedback-requested'
  | 'user:proactive-assist'
  | 'user:tutorial-step'
  | 'user:error-help';

// ============================================================================
// System Channel Events (Internos)
// ============================================================================

export type SystemEventType =
  | 'system:tick'
  | 'system:heartbeat'
  | 'system:startup'
  | 'system:shutdown'
  | 'system:config-loaded'
  | 'system:cache-cleared'
  | 'system:connection-status'
  | 'system:error'
  | 'system:metric-collected';

// ============================================================================
// Channel Event Type Union
// ============================================================================

export type ChanneledEventType = AdminEventType | UserEventType | SystemEventType;

// ============================================================================
// Channel Guards
// ============================================================================

/**
 * Verifica se um tipo de evento pertence ao canal admin
 */
export function isAdminEvent(eventType: string): eventType is AdminEventType {
  return eventType.startsWith('admin:');
}

/**
 * Verifica se um tipo de evento pertence ao canal user
 */
export function isUserEvent(eventType: string): eventType is UserEventType {
  return eventType.startsWith('user:');
}

/**
 * Verifica se um tipo de evento pertence ao canal system
 */
export function isSystemEvent(eventType: string): eventType is SystemEventType {
  return eventType.startsWith('system:');
}

/**
 * Extrai o canal de um tipo de evento
 */
export function getEventChannel(eventType: string): EventChannel | null {
  if (isAdminEvent(eventType)) {
    return EVENT_CHANNELS.ADMIN;
  }
  if (isUserEvent(eventType)) {
    return EVENT_CHANNELS.USER;
  }
  if (isSystemEvent(eventType)) {
    return EVENT_CHANNELS.SYSTEM;
  }
  if (eventType.startsWith('ai:')) {
    return EVENT_CHANNELS.AI;
  }
  return null;
}

/**
 * Valida se um handler pode receber eventos de um canal
 * Usado para prevenir vazamento de eventos admin para user
 */
export function canReceiveFromChannel(
  listenerChannel: EventChannel,
  eventChannel: EventChannel
): boolean {
  // Sistema pode receber de qualquer canal
  if (listenerChannel === EVENT_CHANNELS.SYSTEM) {
    return true;
  }
  
  // Admin pode receber de admin e system
  if (listenerChannel === EVENT_CHANNELS.ADMIN) {
    return eventChannel === EVENT_CHANNELS.ADMIN || eventChannel === EVENT_CHANNELS.SYSTEM;
  }
  
  // User pode receber apenas de user e system
  if (listenerChannel === EVENT_CHANNELS.USER) {
    return eventChannel === EVENT_CHANNELS.USER || eventChannel === EVENT_CHANNELS.SYSTEM;
  }
  
  // AI legado pode receber de AI
  if (listenerChannel === EVENT_CHANNELS.AI) {
    return eventChannel === EVENT_CHANNELS.AI;
  }
  
  return false;
}

// ============================================================================
// Channel Statistics
// ============================================================================

interface ChannelStats {
  eventCount: number;
  lastEventAt: number | null;
  subscriberCount: number;
}

const channelStats: Map<EventChannel, ChannelStats> = new Map([
  [EVENT_CHANNELS.ADMIN, { eventCount: 0, lastEventAt: null, subscriberCount: 0 }],
  [EVENT_CHANNELS.USER, { eventCount: 0, lastEventAt: null, subscriberCount: 0 }],
  [EVENT_CHANNELS.SYSTEM, { eventCount: 0, lastEventAt: null, subscriberCount: 0 }],
  [EVENT_CHANNELS.AI, { eventCount: 0, lastEventAt: null, subscriberCount: 0 }],
]);

/**
 * Incrementa contador de eventos para um canal
 */
export function recordChannelEvent(channel: EventChannel): void {
  const stats = channelStats.get(channel);
  if (stats) {
    stats.eventCount++;
    stats.lastEventAt = Date.now();
  }
}

/**
 * Incrementa contador de subscribers para um canal
 */
export function recordChannelSubscriber(channel: EventChannel, delta: number): void {
  const stats = channelStats.get(channel);
  if (stats) {
    stats.subscriberCount += delta;
  }
}

/**
 * Retorna estatísticas de todos os canais
 */
export function getChannelStats(): Record<EventChannel, ChannelStats> {
  return Object.fromEntries(channelStats) as Record<EventChannel, ChannelStats>;
}

/**
 * Reseta estatísticas (para testes)
 * @internal
 */
export function _resetChannelStats(): void {
  for (const stats of channelStats.values()) {
    stats.eventCount = 0;
    stats.lastEventAt = null;
    stats.subscriberCount = 0;
  }
}
