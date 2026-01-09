/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE ALERTS - Sistema de Alertas Inteligentes
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de alertas baseado em thresholds de métricas do sistema cognitivo.
 * Monitora métricas e dispara alertas quando limites são excedidos.
 *
 * @module azuria_ai/observability/CognitiveAlerts
 */

import { getCounter, getGauge, getPercentile } from './CognitiveMetrics';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Severidade do alerta */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/** Operador de comparação */
export type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';

/** Definição de regra de alerta */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: string;
  metricType: 'counter' | 'gauge' | 'percentile';
  percentile?: number;
  operator: ComparisonOperator;
  threshold: number;
  severity: AlertSeverity;
  cooldownMs: number;
  tags?: Record<string, string>;
}

/** Alerta disparado */
export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

/** Configuração do sistema de alertas */
export interface AlertsConfig {
  enabled: boolean;
  checkIntervalMs: number;
  maxAlerts: number;
  onAlert?: (alert: TriggeredAlert) => void;
  onResolve?: (alert: TriggeredAlert) => void;
}

/** Estado do sistema de alertas */
export interface AlertsState {
  rules: Map<string, AlertRule>;
  activeAlerts: Map<string, TriggeredAlert>;
  alertHistory: TriggeredAlert[];
  lastCheck: number;
  lastTriggered: Map<string, number>; // Para cooldown
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: AlertsConfig = {
  enabled: true,
  checkIntervalMs: 5000,
  maxAlerts: 100,
};

let config: AlertsConfig = { ...DEFAULT_CONFIG };
let checkInterval: ReturnType<typeof setInterval> | null = null;

const state: AlertsState = {
  rules: new Map(),
  activeAlerts: new Map(),
  alertHistory: [],
  lastCheck: 0,
  lastTriggered: new Map(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS
// ═══════════════════════════════════════════════════════════════════════════════

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function compare(value: number, operator: ComparisonOperator, threshold: number): boolean {
  switch (operator) {
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'eq':
      return value === threshold;
    case 'neq':
      return value !== threshold;
    default:
      return false;
  }
}

function getMetricValue(rule: AlertRule): number {
  switch (rule.metricType) {
    case 'counter':
      return getCounter(rule.metric, rule.tags ?? {});
    case 'gauge':
      return getGauge(rule.metric, rule.tags ?? {});
    case 'percentile':
      return getPercentile(rule.metric, rule.percentile ?? 50, rule.tags ?? {});
    default:
      return 0;
  }
}

function formatOperator(operator: ComparisonOperator): string {
  const operatorMap: Record<ComparisonOperator, string> = {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    eq: '==',
    neq: '!=',
  };
  return operatorMap[operator] ?? operator;
}

// Helper para obter função de log baseada na severidade
function getLogFunction(severity: AlertSeverity): typeof console.info {
  if (severity === 'critical' || severity === 'error') {
    // eslint-disable-next-line no-console
    return console.error;
  }
  if (severity === 'warning') {
    // eslint-disable-next-line no-console
    return console.warn;
  }
  // eslint-disable-next-line no-console
  return console.info;
}

// Helper para criar alerta
function createAlert(rule: AlertRule, value: number, now: number): TriggeredAlert {
  return {
    id: generateAlertId(),
    ruleId: rule.id,
    ruleName: rule.name,
    severity: rule.severity,
    message: `${rule.name}: ${rule.metric} ${formatOperator(rule.operator)} ${rule.threshold} (atual: ${value.toFixed(2)})`,
    currentValue: value,
    threshold: rule.threshold,
    timestamp: now,
    acknowledged: false,
  };
}

// Helper para processar novo alerta
function processNewAlert(ruleId: string, rule: AlertRule, value: number, now: number): void {
  const alert = createAlert(rule, value, now);

  state.activeAlerts.set(ruleId, alert);
  state.alertHistory.push(alert);
  state.lastTriggered.set(ruleId, now);

  // Limitar histórico
  if (state.alertHistory.length > config.maxAlerts) {
    state.alertHistory.shift();
  }

  // Callback e log
  config.onAlert?.(alert);
  const logFn = getLogFunction(rule.severity);
  logFn(`[CognitiveAlerts] ${alert.message}`);
}

// Helper para resolver alerta ativo
function resolveActiveAlert(ruleId: string, rule: AlertRule): void {
  const activeAlert = state.activeAlerts.get(ruleId);
  if (activeAlert) {
    state.activeAlerts.delete(ruleId);
    config.onResolve?.(activeAlert);
    // eslint-disable-next-line no-console
    console.info(`[CognitiveAlerts] Resolved: ${rule.name}`);
  }
}

function checkRules(): void {
  if (!config.enabled) {return;}

  const now = Date.now();
  state.lastCheck = now;

  for (const [ruleId, rule] of state.rules) {
    if (!rule.enabled) {continue;}

    // Verificar cooldown
    const lastTriggered = state.lastTriggered.get(ruleId) ?? 0;
    if (now - lastTriggered < rule.cooldownMs) {continue;}

    const value = getMetricValue(rule);
    const triggered = compare(value, rule.operator, rule.threshold);

    if (triggered && !state.activeAlerts.has(ruleId)) {
      processNewAlert(ruleId, rule, value, now);
    } else if (!triggered) {
      resolveActiveAlert(ruleId, rule);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o sistema de alertas
 */
export function initAlerts(userConfig?: Partial<AlertsConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };

  // Parar intervalo anterior
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  // Iniciar verificação periódica
  if (config.enabled) {
    checkInterval = setInterval(checkRules, config.checkIntervalMs);
  }

  // eslint-disable-next-line no-console
  console.log('[CognitiveAlerts] Initialized', config);
}

/**
 * Desliga o sistema de alertas
 */
export function shutdownAlerts(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  // eslint-disable-next-line no-console
  console.log('[CognitiveAlerts] Shutdown');
}

/**
 * Adiciona uma regra de alerta
 */
export function addAlertRule(rule: AlertRule): void {
  state.rules.set(rule.id, rule);
}

/**
 * Remove uma regra de alerta
 */
export function removeAlertRule(ruleId: string): boolean {
  state.activeAlerts.delete(ruleId);
  return state.rules.delete(ruleId);
}

/**
 * Atualiza uma regra de alerta
 */
export function updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
  const existing = state.rules.get(ruleId);
  if (!existing) {return false;}

  state.rules.set(ruleId, { ...existing, ...updates });
  return true;
}

/**
 * Habilita/desabilita uma regra
 */
export function toggleAlertRule(ruleId: string, enabled: boolean): boolean {
  return updateAlertRule(ruleId, { enabled });
}

/**
 * Obtém todas as regras
 */
export function getAlertRules(): AlertRule[] {
  return Array.from(state.rules.values());
}

/**
 * Obtém alertas ativos
 */
export function getActiveAlerts(): TriggeredAlert[] {
  return Array.from(state.activeAlerts.values());
}

/**
 * Obtém histórico de alertas
 */
export function getAlertHistory(): TriggeredAlert[] {
  return [...state.alertHistory];
}

/**
 * Reconhece um alerta
 */
export function acknowledgeAlert(alertId: string): boolean {
  for (const alert of state.activeAlerts.values()) {
    if (alert.id === alertId) {
      alert.acknowledged = true;
      return true;
    }
  }
  return false;
}

/**
 * Reconhece todos os alertas
 */
export function acknowledgeAllAlerts(): void {
  for (const alert of state.activeAlerts.values()) {
    alert.acknowledged = true;
  }
}

/**
 * Força verificação das regras
 */
export function checkAlertsNow(): void {
  checkRules();
}

/**
 * Limpa histórico de alertas
 */
export function clearAlertHistory(): void {
  state.alertHistory.length = 0;
}

/**
 * Limpa alertas ativos
 */
export function clearActiveAlerts(): void {
  state.activeAlerts.clear();
}

/**
 * Obtém estatísticas de alertas
 */
export function getAlertStats(): {
  totalRules: number;
  enabledRules: number;
  activeAlerts: number;
  totalAlerts: number;
  bySeverity: Record<AlertSeverity, number>;
} {
  const rules = Array.from(state.rules.values());
  const activeAlerts = Array.from(state.activeAlerts.values());

  return {
    totalRules: rules.length,
    enabledRules: rules.filter((r) => r.enabled).length,
    activeAlerts: activeAlerts.length,
    totalAlerts: state.alertHistory.length,
    bySeverity: {
      info: activeAlerts.filter((a) => a.severity === 'info').length,
      warning: activeAlerts.filter((a) => a.severity === 'warning').length,
      error: activeAlerts.filter((a) => a.severity === 'error').length,
      critical: activeAlerts.filter((a) => a.severity === 'critical').length,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGRAS PRÉ-DEFINIDAS
// ═══════════════════════════════════════════════════════════════════════════════

/** Regras padrão do sistema */
export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'nucleus-errors-high',
    name: 'Erros do Nucleus Altos',
    description: 'Muitos erros no CentralNucleus',
    enabled: true,
    metric: 'nucleus.error',
    metricType: 'counter',
    operator: 'gt',
    threshold: 10,
    severity: 'error',
    cooldownMs: 60000, // 1 minuto
  },
  {
    id: 'events-dropped-high',
    name: 'Eventos Descartados',
    description: 'Muitos eventos descartados',
    enabled: true,
    metric: 'events.dropped',
    metricType: 'counter',
    operator: 'gt',
    threshold: 50,
    severity: 'warning',
    cooldownMs: 30000,
  },
  {
    id: 'governance-blocked-high',
    name: 'Muitas Emissões Bloqueadas',
    description: 'Taxa alta de bloqueios de governança',
    enabled: true,
    metric: 'governance.emission.blocked',
    metricType: 'counter',
    operator: 'gt',
    threshold: 20,
    severity: 'warning',
    cooldownMs: 60000,
  },
  {
    id: 'memory-sync-failed',
    name: 'Falha de Sync de Memória',
    description: 'Sincronização de memória falhando',
    enabled: true,
    metric: 'memory.sync.failed',
    metricType: 'counter',
    operator: 'gt',
    threshold: 3,
    severity: 'error',
    cooldownMs: 120000, // 2 minutos
  },
  {
    id: 'events-processing-slow',
    name: 'Processamento Lento',
    description: 'Eventos sendo processados lentamente (p95)',
    enabled: true,
    metric: 'events.processing.duration',
    metricType: 'percentile',
    percentile: 95,
    operator: 'gt',
    threshold: 500, // 500ms
    severity: 'warning',
    cooldownMs: 60000,
  },
];

/**
 * Carrega regras padrão
 */
export function loadDefaultRules(): void {
  for (const rule of DEFAULT_ALERT_RULES) {
    addAlertRule(rule);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const CognitiveAlerts = {
  init: initAlerts,
  shutdown: shutdownAlerts,
  addRule: addAlertRule,
  removeRule: removeAlertRule,
  updateRule: updateAlertRule,
  toggleRule: toggleAlertRule,
  getRules: getAlertRules,
  getActive: getActiveAlerts,
  getHistory: getAlertHistory,
  acknowledge: acknowledgeAlert,
  acknowledgeAll: acknowledgeAllAlerts,
  check: checkAlertsNow,
  clearHistory: clearAlertHistory,
  clearActive: clearActiveAlerts,
  getStats: getAlertStats,
  loadDefaults: loadDefaultRules,
};

export default CognitiveAlerts;
