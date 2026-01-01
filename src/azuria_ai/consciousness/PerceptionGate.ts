/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PERCEPTION GATE - Filtro de Entrada de Eventos
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * O PerceptionGate é a primeira camada do Núcleo. Ele:
 * - Recebe TODOS os eventos do sistema
 * - Filtra ruído (eventos irrelevantes)
 * - Classifica relevância
 * - Identifica o papel alvo (ADMIN/USER/SYSTEM)
 * - Calcula prioridade
 * - Normaliza eventos para processamento
 */

import type {
  CognitiveRole,
  EventCategory,
  EventPriority,
  NormalizedEvent,
} from './types';
import { getGlobalState, getUserRole, getCurrentActivity } from './GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Evento bruto de entrada */
export interface RawEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
  source?: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

/** Resultado da percepção */
export interface PerceptionResult {
  /** Se o evento deve ser processado */
  shouldProcess: boolean;
  /** Razão se não deve processar */
  rejectionReason?: string;
  /** Evento normalizado (se deve processar) */
  normalizedEvent?: NormalizedEvent;
  /** Score de relevância (0-1) */
  relevanceScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Mapeamento de tipos de evento para categorias */
const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  // Cálculos
  'calc:started': 'calculation',
  'calc:updated': 'calculation',
  'calc:completed': 'calculation',
  'calc:error': 'calculation',
  'user:calculation': 'calculation',
  
  // Navegação
  'user:navigation': 'navigation',
  'screen:changed': 'navigation',
  
  // Interações
  'user:action': 'interaction',
  'user:input': 'interaction',
  'user:click': 'interaction',
  'ui:actionClicked': 'interaction',
  
  // Insights
  'insight:generated': 'insight',
  'ai:predictive-insight': 'insight',
  'ai:recommended-action': 'insight',
  'ai:pattern-detected': 'insight',
  'ai:anomaly-detected': 'insight',
  'ai:forecast-generated': 'insight',
  
  // Alertas
  'ai:governance-alert': 'alert',
  'ai:risk-alert': 'alert',
  'notification:alert': 'alert',
  'agent:margin-risk': 'alert',
  'agent:loss-predicted': 'alert',
  
  // Governança
  'governance:violation': 'governance',
  'governance:policy-check': 'governance',
  'ai:consistency-warning': 'governance',
  
  // Sistema
  'system:init': 'system',
  'system:shutdown': 'system',
  'ai:core-sync': 'system',
  'ai:state-changed': 'system',
  'ai:mind-snapshot': 'system',
  'ai:system-health-updated': 'system',
  
  // IA
  'ai:memory-updated': 'ai',
  'ai:evolution-score-updated': 'ai',
  'ai:model-confidence': 'ai',
  'ai:signal-quality': 'ai',
  
  // Erros
  'user:error': 'error',
  'system:error': 'error',
  'ai:internal-drift': 'error',
};

/** Eventos que devem ir para ADMIN */
const ADMIN_EVENTS: Set<string> = new Set([
  'governance:violation',
  'ai:governance-alert',
  'ai:consistency-warning',
  'ai:internal-drift',
  'ai:system-health-updated',
  'ai:mind-snapshot',
  'ai:evolution-score-updated',
  'system:error',
]);

/** Eventos internos do sistema (não para UI) */
const SYSTEM_ONLY_EVENTS: Set<string> = new Set([
  'system:init',
  'system:shutdown',
  'ai:core-sync',
  'ai:state-changed',
  'ai:memory-updated',
  'ai:signal-quality',
  'ai:model-confidence',
]);

/** Eventos de ruído (ignorar) */
const NOISE_EVENTS: Set<string> = new Set([
  'heartbeat',
  'ping',
  'pong',
  'debug:log',
  'trace:*',
]);

/** Prioridade base por categoria */
const CATEGORY_PRIORITY: Record<EventCategory, EventPriority> = {
  calculation: 'medium',
  navigation: 'low',
  interaction: 'low',
  insight: 'medium',
  alert: 'high',
  governance: 'high',
  system: 'background',
  ai: 'background',
  error: 'high',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera ID único para evento
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determina a categoria de um evento
 */
function categorizeEvent(eventType: string): EventCategory {
  // Verificar mapeamento direto
  if (EVENT_CATEGORY_MAP[eventType]) {
    return EVENT_CATEGORY_MAP[eventType];
  }
  
  // Inferir por prefixo
  const prefix = eventType.split(':')[0];
  
  switch (prefix) {
    case 'calc':
    case 'calculation':
      return 'calculation';
    case 'user':
      return 'interaction';
    case 'nav':
    case 'navigation':
    case 'screen':
      return 'navigation';
    case 'insight':
      return 'insight';
    case 'alert':
    case 'notification':
      return 'alert';
    case 'governance':
    case 'policy':
    case 'compliance':
      return 'governance';
    case 'system':
      return 'system';
    case 'ai':
      return 'ai';
    case 'error':
      return 'error';
    case 'agent':
      return 'alert'; // Agentes geralmente emitem alertas
    default:
      return 'system';
  }
}

/**
 * Determina o papel alvo de um evento
 */
function determineTargetRole(
  eventType: string,
  category: EventCategory
): CognitiveRole {
  // Eventos explicitamente para ADMIN
  if (ADMIN_EVENTS.has(eventType)) {
    return 'ADMIN';
  }
  
  // Eventos internos do sistema
  if (SYSTEM_ONLY_EVENTS.has(eventType)) {
    return 'SYSTEM';
  }
  
  // Por categoria
  switch (category) {
    case 'governance':
      return 'ADMIN';
    case 'system':
    case 'ai':
      return 'SYSTEM';
    case 'calculation':
    case 'interaction':
    case 'navigation':
    case 'insight':
    case 'alert':
    case 'error':
    default:
      return 'USER';
  }
}

/**
 * Calcula a prioridade de um evento
 */
function calculatePriority(
  eventType: string,
  category: EventCategory,
  payload: Record<string, unknown>,
  sourcePriority?: number
): EventPriority {
  // Se fonte especificou prioridade alta, respeitar
  if (sourcePriority !== undefined && sourcePriority >= 8) {
    return 'critical';
  }
  if (sourcePriority !== undefined && sourcePriority >= 6) {
    return 'high';
  }
  
  // Prioridade base da categoria
  let priority = CATEGORY_PRIORITY[category];
  
  // Ajustes por conteúdo do payload
  const severity = payload?.severity as string | undefined;
  if (severity === 'critical') {
    priority = 'critical';
  } else if (severity === 'high') {
    priority = priority === 'critical' ? 'critical' : 'high';
  }
  
  // Alertas de risco são sempre importantes
  if (eventType.includes('risk') || eventType.includes('loss')) {
    priority = priority === 'low' || priority === 'background' ? 'medium' : priority;
  }
  
  // Erros são importantes
  if (category === 'error') {
    priority = 'high';
  }
  
  return priority;
}

/**
 * Calcula score de relevância (0-1)
 */
function calculateRelevanceScore(
  category: EventCategory,
  priority: EventPriority,
  targetRole: CognitiveRole,
  currentUserRole: CognitiveRole,
  currentActivity: string
): number {
  let score = 0.5; // Base
  
  // Ajuste por prioridade
  switch (priority) {
    case 'critical': score += 0.4; break;
    case 'high': score += 0.25; break;
    case 'medium': score += 0.1; break;
    case 'low': score -= 0.1; break;
    case 'background': score -= 0.2; break;
  }
  
  // Ajuste por correspondência de papel
  if (targetRole === currentUserRole) {
    score += 0.1;
  } else if (targetRole === 'SYSTEM') {
    score -= 0.3; // Eventos de sistema são menos relevantes para UI
  }
  
  // Ajuste por contexto de atividade
  if (currentActivity === 'calculando' && category === 'calculation') {
    score += 0.2; // Muito relevante durante cálculo
  }
  if (currentActivity === 'idle' && category === 'navigation') {
    score -= 0.2; // Navegação é menos importante se usuário está idle
  }
  
  // Alertas e erros sempre têm relevância mínima
  if (category === 'alert' || category === 'error') {
    score = Math.max(score, 0.6);
  }
  
  // Normalizar para 0-1
  return Math.max(0, Math.min(1, score));
}

/**
 * Verifica se evento é ruído
 */
function isNoiseEvent(eventType: string): boolean {
  // Verificar lista direta
  if (NOISE_EVENTS.has(eventType)) {
    return true;
  }
  
  // Verificar padrões de ruído
  if (eventType.startsWith('trace:')) {
    return true;
  }
  if (eventType.startsWith('debug:')) {
    return true;
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERCEPTION GATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Processa um evento bruto através do PerceptionGate
 */
export function perceive(event: RawEvent): PerceptionResult {
  const state = getGlobalState();
  
  // 1. Verificar se é ruído
  if (isNoiseEvent(event.type)) {
    return {
      shouldProcess: false,
      rejectionReason: 'noise_event',
      relevanceScore: 0,
    };
  }
  
  // 2. Categorizar evento
  const category = categorizeEvent(event.type);
  
  // 3. Determinar papel alvo
  const targetRole = determineTargetRole(event.type, category);
  
  // 4. Calcular prioridade
  const priority = calculatePriority(
    event.type,
    category,
    event.payload ?? {},
    event.priority
  );
  
  // 5. Calcular relevância
  const currentUserRole = getUserRole();
  const currentActivity = getCurrentActivity();
  const relevanceScore = calculateRelevanceScore(
    category,
    priority,
    targetRole,
    currentUserRole,
    currentActivity
  );
  
  // 6. Decisão de processamento
  // Não processar eventos de ADMIN se usuário não é ADMIN
  if (targetRole === 'ADMIN' && currentUserRole !== 'ADMIN') {
    // Mas ainda permitir eventos críticos
    if (priority !== 'critical') {
      return {
        shouldProcess: false,
        rejectionReason: 'admin_only_event',
        relevanceScore,
      };
    }
  }
  
  // Não processar eventos com relevância muito baixa
  if (relevanceScore < 0.2 && priority === 'background') {
    return {
      shouldProcess: false,
      rejectionReason: 'low_relevance',
      relevanceScore,
    };
  }
  
  // 7. Normalizar evento
  const normalizedEvent: NormalizedEvent = {
    id: generateEventId(),
    type: event.type,
    category,
    payload: event.payload ?? {},
    timestamp: event.timestamp ?? Date.now(),
    source: event.source ?? 'unknown',
    priority,
    targetRole,
    metadata: event.metadata,
  };
  
  return {
    shouldProcess: true,
    normalizedEvent,
    relevanceScore,
  };
}

/**
 * Verifica rapidamente se um evento deve ser considerado
 * (versão leve para filtrar em volume alto)
 */
export function quickFilter(eventType: string): boolean {
  // Ruído: ignorar
  if (isNoiseEvent(eventType)) {
    return false;
  }
  
  // Sistema interno: passar para log mas não processar
  if (SYSTEM_ONLY_EVENTS.has(eventType)) {
    return false;
  }
  
  return true;
}

/**
 * Obtém a categoria de um tipo de evento
 */
export function getEventCategory(eventType: string): EventCategory {
  return categorizeEvent(eventType);
}

/**
 * Verifica se evento é para ADMIN
 */
export function isAdminEvent(eventType: string): boolean {
  return ADMIN_EVENTS.has(eventType) || eventType.startsWith('governance:');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const PerceptionGate = {
  perceive,
  quickFilter,
  getEventCategory,
  isAdminEvent,
};

export default PerceptionGate;

