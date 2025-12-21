/**
 * PatternLearningEngine - Motor de Aprendizado de Padrões
 * Modo Deus - Fase 4: Aprendizado e Feedback
 *
 * Responsabilidades:
 * - Detectar padrões de uso do usuário
 * - Aprender sequências de ações frequentes
 * - Identificar horários típicos de uso
 * - Detectar padrões de erro
 * - Persistir padrões no Supabase
 *
 * @module azuria_ai/engines/patternLearningEngine
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Tipos locais incompatíveis com schema Supabase - refatoração pendente

import { supabase } from '@/lib/supabase';
import { eventBus } from '../events/eventBus';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tipos de padrões que podem ser detectados
 */
export type PatternType =
  | 'navigation' // Sequências de navegação
  | 'calculation' // Tipos de cálculos frequentes
  | 'preference' // Preferências inferidas
  | 'timing' // Horários de uso
  | 'error_prone' // Áreas propensas a erro
  | 'feature_usage' // Uso de recursos
  | 'skill_progression'; // Progressão de habilidade

/**
 * Padrão detectado
 */
export interface DetectedPattern {
  id: string;
  type: PatternType;
  key: string; // Identificador único do padrão
  data: Record<string, unknown>;
  confidence: number; // 0-1
  occurrences: number;
  firstDetected: Date;
  lastDetected: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Sequência de ações para detecção de padrões
 */
interface ActionSequence {
  actions: string[];
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Estatísticas de padrões
 */
export interface PatternStats {
  totalPatterns: number;
  byType: Record<PatternType, number>;
  avgConfidence: number;
  mostFrequent: DetectedPattern[];
  recentlyDetected: DetectedPattern[];
}

// =============================================================================
// STATE
// =============================================================================

interface PatternState {
  initialized: boolean;
  userId: string | null;
  patterns: Map<string, DetectedPattern>; // key: type:patternKey
  actionBuffer: ActionSequence[];
  persistenceEnabled: boolean;
  learningEnabled: boolean;
  lastAnalysis: Date | null;
}

const state: PatternState = {
  initialized: false,
  userId: null,
  patterns: new Map(),
  actionBuffer: [],
  persistenceEnabled: false,
  learningEnabled: true,
  lastAnalysis: null,
};

// Configuration
const CONFIG = {
  minOccurrencesForPattern: 3,
  minConfidenceThreshold: 0.4,
  maxActionBufferSize: 100,
  sequenceWindowSize: 5, // Actions to consider for sequence patterns
  analysisInterval: 60000, // 1 minute
  maxPatternsPerType: 50,
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o PatternLearningEngine
 */
export async function initPatternLearning(userId?: string): Promise<void> {
  if (state.initialized && state.userId === userId) {
    return;
  }

  state.userId = userId ?? null;
  state.patterns.clear();
  state.actionBuffer = [];
  state.lastAnalysis = null;

  // Verifica persistência
  state.persistenceEnabled = await checkPersistenceAvailable();

  // Carrega padrões existentes
  if (state.persistenceEnabled && userId) {
    await loadPatterns(userId);
  }

  // Setup event listeners
  setupEventListeners();

  // Start periodic analysis
  startPeriodicAnalysis();

  state.initialized = true;

  // eslint-disable-next-line no-console
  console.log('[PatternLearningEngine] Initialized', {
    userId,
    persistenceEnabled: state.persistenceEnabled,
    existingPatterns: state.patterns.size,
  });
}

// Cache para evitar múltiplas verificações de persistência
let persistenceCheckCache: boolean | null = null;
let persistenceCheckPromise: Promise<boolean> | null = null;

// Desabilita persistência completamente (tabelas de IA não criadas ainda)
const AI_TABLES_DISABLED = false;

async function checkPersistenceAvailable(): Promise<boolean> {
  // Só tenta persistir se houver sessão autenticada
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    persistenceCheckCache = false;
    return false;
  }

  const currentUserId = session.data.session.user.id;
  if (state.userId && state.userId !== currentUserId) {
    state.userId = currentUserId;
  }
  if (!state.userId) {
    state.userId = currentUserId;
  }

  // Tabelas de IA ainda não criadas - desabilitar silenciosamente
  if (AI_TABLES_DISABLED) {
    persistenceCheckCache = false;
    return false;
  }

  // Retorna cache se já verificado
  if (persistenceCheckCache !== null) {
    return persistenceCheckCache;
  }

  // Se já existe uma verificação em andamento, aguarda ela
  if (persistenceCheckPromise !== null) {
    return persistenceCheckPromise;
  }

  // Cria Promise compartilhada para evitar múltiplas requisições simultâneas
  persistenceCheckPromise = (async () => {
    try {
      const { error } = await supabase
        .from('user_behavior_patterns')
        .select('id')
        .limit(1);

      if (error) {
        persistenceCheckCache = false;
        return false;
      }

      persistenceCheckCache = true;
      return true;
    } catch {
      // Erro de rede ou outro - desabilitar persistência silenciosamente
      persistenceCheckCache = false;
      return false;
    } finally {
      persistenceCheckPromise = null;
    }
  })();

  return persistenceCheckPromise;
}

async function loadPatterns(userId: string): Promise<void> {
  // Não tentar carregar se persistência não está disponível
  if (!state.persistenceEnabled) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('user_behavior_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('confidence', { ascending: false })
      .limit(200);

    if (error) {
      // Desabilitar persistência silenciosamente
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
      return;
    }

    if (data) {
      for (const row of data) {
        const pattern = mapDbToPattern(row);
        const key = `${pattern.type}:${pattern.key}`;
        state.patterns.set(key, pattern);
      }
    }
  } catch {
    // Silenciosamente usar padrões em memória
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

// =============================================================================
// ACTION RECORDING
// =============================================================================

/**
 * Registra uma ação do usuário para análise
 */
export function recordAction(
  action: string,
  context?: Record<string, unknown>
): void {
  if (!state.learningEnabled) {
    return;
  }

  const sequence: ActionSequence = {
    actions: [action],
    timestamp: new Date(),
    context,
  };

  state.actionBuffer.push(sequence);

  // Keep buffer bounded
  if (state.actionBuffer.length > CONFIG.maxActionBufferSize) {
    state.actionBuffer = state.actionBuffer.slice(-CONFIG.maxActionBufferSize);
  }

  // Immediate pattern checks for specific actions
  checkImmediatePatterns(action, context);
}

/**
 * Registra sequência de ações
 */
export function recordActionSequence(
  actions: string[],
  context?: Record<string, unknown>
): void {
  if (!state.learningEnabled || actions.length === 0) {
    return;
  }

  const sequence: ActionSequence = {
    actions,
    timestamp: new Date(),
    context,
  };

  state.actionBuffer.push(sequence);

  // Check for sequence patterns
  detectSequencePatterns(actions);
}

// =============================================================================
// PATTERN DETECTION
// =============================================================================

/**
 * Analisa buffer e detecta padrões
 */
export function analyzePatterns(): DetectedPattern[] {
  const newPatterns: DetectedPattern[] = [];

  // Detect navigation patterns
  const navPatterns = detectNavigationPatterns();
  newPatterns.push(...navPatterns);

  // Detect timing patterns
  const timingPatterns = detectTimingPatterns();
  newPatterns.push(...timingPatterns);

  // Detect calculation patterns
  const calcPatterns = detectCalculationPatterns();
  newPatterns.push(...calcPatterns);

  // Detect error patterns
  const errorPatterns = detectErrorPatterns();
  newPatterns.push(...errorPatterns);

  state.lastAnalysis = new Date();

  return newPatterns;
}

/**
 * Detecta padrões de navegação
 */
function detectNavigationPatterns(): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const navActions = state.actionBuffer.filter(s =>
    s.actions.some(a => a.startsWith('navigate:') || a.startsWith('view:'))
  );

  // Group by sequences
  const sequences = new Map<string, number>();

  for (let i = 0; i < navActions.length - 1; i++) {
    const current = navActions[i].actions[0];
    const next = navActions[i + 1].actions[0];
    const key = `${current}->${next}`;

    sequences.set(key, (sequences.get(key) ?? 0) + 1);
  }

  // Create patterns for frequent sequences
  for (const [sequence, count] of sequences) {
    if (count >= CONFIG.minOccurrencesForPattern) {
      const confidence = Math.min(0.95, count / 10);
      const pattern = createOrUpdatePattern(
        'navigation',
        sequence,
        {
          sequence,
          count,
        },
        confidence,
        count
      );

      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Detecta padrões de horário
 */
function detectTimingPatterns(): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Group actions by hour of day
  const hourCounts = new Map<number, number>();

  for (const seq of state.actionBuffer) {
    const hour = seq.timestamp.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }

  // Find peak hours
  const totalActions = state.actionBuffer.length;
  if (totalActions < 10) {
    return patterns;
  }

  const sortedHours = [...hourCounts.entries()].sort((a, b) => b[1] - a[1]);

  // Top 3 hours are considered patterns
  for (const [hour, count] of sortedHours.slice(0, 3)) {
    const percentage = count / totalActions;
    if (percentage >= 0.15) {
      // At least 15% of actions in this hour
      const timeOfDay = getTimeOfDay(hour);
      const confidence = Math.min(0.9, percentage * 2);

      const pattern = createOrUpdatePattern(
        'timing',
        `peak_hour_${hour}`,
        {
          hour,
          timeOfDay,
          percentage,
          actionCount: count,
        },
        confidence,
        count
      );

      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Detecta padrões de cálculo
 */
function detectCalculationPatterns(): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const calcActions = state.actionBuffer.filter(s =>
    s.actions.some(a => a.startsWith('calculate:'))
  );

  // Group by calculation type
  const calcTypes = new Map<
    string,
    { count: number; contexts: Record<string, unknown>[] }
  >();

  for (const seq of calcActions) {
    const calcAction = seq.actions.find(a => a.startsWith('calculate:'));
    if (!calcAction) {
      continue;
    }

    const calcType = calcAction.replace('calculate:', '');
    const existing = calcTypes.get(calcType) ?? { count: 0, contexts: [] };

    existing.count++;
    if (seq.context) {
      existing.contexts.push(seq.context);
    }

    calcTypes.set(calcType, existing);
  }

  // Create patterns for frequent calculations
  for (const [calcType, data] of calcTypes) {
    if (data.count >= CONFIG.minOccurrencesForPattern) {
      const confidence = Math.min(0.95, data.count / 15);

      const pattern = createOrUpdatePattern(
        'calculation',
        `frequent_${calcType}`,
        {
          calculationType: calcType,
          frequency: data.count,
          avgValues: analyzeContextValues(data.contexts),
        },
        confidence,
        data.count
      );

      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Detecta padrões de erro
 */
function detectErrorPatterns(): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const errorActions = state.actionBuffer.filter(s =>
    s.actions.some(a => a.startsWith('error:'))
  );

  // Group by error type
  const errorTypes = new Map<
    string,
    { count: number; contexts: Record<string, unknown>[] }
  >();

  for (const seq of errorActions) {
    const errorAction = seq.actions.find(a => a.startsWith('error:'));
    if (!errorAction) {
      continue;
    }

    const errorType = errorAction.replace('error:', '');
    const existing = errorTypes.get(errorType) ?? { count: 0, contexts: [] };

    existing.count++;
    if (seq.context) {
      existing.contexts.push(seq.context);
    }

    errorTypes.set(errorType, existing);
  }

  // Create patterns for frequent errors
  for (const [errorType, data] of errorTypes) {
    if (data.count >= 2) {
      // Lower threshold for errors
      const confidence = Math.min(0.9, data.count / 5);

      const pattern = createOrUpdatePattern(
        'error_prone',
        `frequent_${errorType}`,
        {
          errorType,
          frequency: data.count,
          commonContext: findCommonContext(data.contexts),
        },
        confidence,
        data.count
      );

      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Detecta padrões de sequência
 */
function detectSequencePatterns(actions: string[]): void {
  if (actions.length < 2) {
    return;
  }

  const key = actions.join('->');
  const existingKey = `feature_usage:${key}`;
  const existing = state.patterns.get(existingKey);

  if (existing) {
    existing.occurrences++;
    existing.confidence = Math.min(0.95, existing.occurrences / 10);
    existing.lastDetected = new Date();
  } else if (actions.length >= 2) {
    createOrUpdatePattern(
      'feature_usage',
      key,
      {
        sequence: actions,
        length: actions.length,
      },
      0.3,
      1
    );
  }
}

/**
 * Verifica padrões imediatos
 */
function checkImmediatePatterns(
  action: string,
  context?: Record<string, unknown>
): void {
  // Check for preference patterns
  if (action.startsWith('prefer:')) {
    const preference = action.replace('prefer:', '');
    createOrUpdatePattern(
      'preference',
      preference,
      {
        preference,
        value: context?.value,
      },
      0.7,
      1
    );
  }

  // Check for skill progression
  if (action.startsWith('skill:')) {
    const skill = action.replace('skill:', '');
    createOrUpdatePattern(
      'skill_progression',
      skill,
      {
        skill,
        level: context?.level,
      },
      0.8,
      1
    );
  }
}

// =============================================================================
// PATTERN ACCESS
// =============================================================================

/**
 * Retorna todos os padrões detectados
 */
export function getAllPatterns(): DetectedPattern[] {
  return [...state.patterns.values()];
}

/**
 * Retorna padrões por tipo
 */
export function getPatternsByType(type: PatternType): DetectedPattern[] {
  return [...state.patterns.values()].filter(p => p.type === type);
}

/**
 * Retorna padrões com alta confiança
 */
export function getHighConfidencePatterns(
  minConfidence: number = 0.7
): DetectedPattern[] {
  return [...state.patterns.values()]
    .filter(p => p.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Verifica se um padrão específico existe
 */
export function hasPattern(type: PatternType, key: string): boolean {
  return state.patterns.has(`${type}:${key}`);
}

/**
 * Retorna um padrão específico
 */
export function getPattern(
  type: PatternType,
  key: string
): DetectedPattern | null {
  return state.patterns.get(`${type}:${key}`) ?? null;
}

/**
 * Retorna estatísticas dos padrões
 */
export function getPatternStats(): PatternStats {
  const patterns = [...state.patterns.values()];

  const byType: Record<PatternType, number> = {
    navigation: 0,
    calculation: 0,
    preference: 0,
    timing: 0,
    error_prone: 0,
    feature_usage: 0,
    skill_progression: 0,
  };

  let confidenceSum = 0;

  for (const pattern of patterns) {
    byType[pattern.type]++;
    confidenceSum += pattern.confidence;
  }

  return {
    totalPatterns: patterns.length,
    byType,
    avgConfidence: patterns.length > 0 ? confidenceSum / patterns.length : 0,
    mostFrequent: patterns
      .toSorted((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5),
    recentlyDetected: patterns
      .toSorted((a, b) => b.lastDetected.getTime() - a.lastDetected.getTime())
      .slice(0, 5),
  };
}

// =============================================================================
// PATTERN QUERIES
// =============================================================================

/**
 * Retorna o horário típico de uso
 */
export function getTypicalUsageTime(): string | null {
  const timingPatterns = getPatternsByType('timing')
    .filter(p => p.key.startsWith('peak_hour_'))
    .sort((a, b) => b.confidence - a.confidence);

  if (timingPatterns.length === 0) {
    return null;
  }

  const topPattern = timingPatterns[0];
  return (topPattern.data as { timeOfDay?: string }).timeOfDay ?? null;
}

/**
 * Retorna calculadoras mais usadas
 */
export function getMostUsedCalculators(): string[] {
  return getPatternsByType('calculation')
    .filter(p => p.key.startsWith('frequent_'))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5)
    .map(p => (p.data as { calculationType?: string }).calculationType ?? '')
    .filter(Boolean);
}

/**
 * Retorna erros frequentes
 */
export function getFrequentErrors(): Array<{ type: string; count: number }> {
  return getPatternsByType('error_prone')
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5)
    .map(p => ({
      type: (p.data as { errorType?: string }).errorType ?? '',
      count: p.occurrences,
    }));
}

/**
 * Retorna preferências inferidas
 */
export function getInferredPreferences(): Record<string, unknown> {
  const prefs: Record<string, unknown> = {};

  for (const pattern of getPatternsByType('preference')) {
    if (pattern.confidence >= CONFIG.minConfidenceThreshold) {
      const data = pattern.data as { preference?: string; value?: unknown };
      if (data.preference) {
        prefs[data.preference] = data.value ?? true;
      }
    }
  }

  return prefs;
}

// =============================================================================
// HELPERS
// =============================================================================

function createOrUpdatePattern(
  type: PatternType,
  key: string,
  data: Record<string, unknown>,
  confidence: number,
  occurrences: number
): DetectedPattern {
  const fullKey = `${type}:${key}`;
  const existing = state.patterns.get(fullKey);

  if (existing) {
    existing.data = { ...existing.data, ...data };
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.occurrences += occurrences;
    existing.lastDetected = new Date();

    // Persist update
    if (state.persistenceEnabled && state.userId) {
      // eslint-disable-next-line no-console
      persistPattern(existing).catch(console.error);
    }

    return existing;
  }

  const pattern: DetectedPattern = {
    id: crypto.randomUUID(),
    type,
    key,
    data,
    confidence,
    occurrences,
    firstDetected: new Date(),
    lastDetected: new Date(),
  };

  state.patterns.set(fullKey, pattern);

  // Persist new pattern
  if (state.persistenceEnabled && state.userId) {
    // eslint-disable-next-line no-console
    persistPattern(pattern).catch(console.error);
  }

  // Emit event (event type not in EventType enum)
  // @ts-expect-error - user:preference_detected not defined in EventType
  eventBus.emit({
    type: 'user:preference_detected',
    payload: {
      patternType: type,
      patternKey: key,
      confidence,
    },
  });

  return pattern;
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 21) {
    return 'evening';
  }
  return 'night';
}

function analyzeContextValues(
  contexts: Record<string, unknown>[]
): Record<string, unknown> {
  if (contexts.length === 0) {
    return {};
  }

  // Find numeric fields and calculate averages
  const numericFields = new Map<string, number[]>();

  for (const ctx of contexts) {
    for (const [key, value] of Object.entries(ctx)) {
      if (typeof value === 'number') {
        const existing = numericFields.get(key) ?? [];
        existing.push(value);
        numericFields.set(key, existing);
      }
    }
  }

  const result: Record<string, unknown> = {};

  for (const [key, values] of numericFields) {
    result[key] = {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return result;
}

function findCommonContext(
  contexts: Record<string, unknown>[]
): Record<string, unknown> {
  if (contexts.length === 0) {
    return {};
  }

  // Find fields that appear in most contexts with same value
  const fieldCounts = new Map<string, Map<string, number>>();

  for (const ctx of contexts) {
    for (const [key, value] of Object.entries(ctx)) {
      const valueStr = JSON.stringify(value);
      const existing = fieldCounts.get(key) ?? new Map<string, number>();
      existing.set(valueStr, (existing.get(valueStr) ?? 0) + 1);
      fieldCounts.set(key, existing);
    }
  }

  const common: Record<string, unknown> = {};

  for (const [key, valueCounts] of fieldCounts) {
    const sorted = [...valueCounts.entries()].sort((a, b) => b[1] - a[1]);
    const [topValue, topCount] = sorted[0];

    if (topCount >= contexts.length * 0.5) {
      // Value appears in at least 50% of contexts
      common[key] = JSON.parse(topValue);
    }
  }

  return common;
}

async function persistPattern(pattern: DetectedPattern): Promise<void> {
  if (!state.userId || !state.persistenceEnabled) {
    return;
  }

  try {
    const { error } = await supabase.from('user_behavior_patterns').upsert(
      {
        user_id: state.userId,
        pattern_type: pattern.type as string,
        pattern_key: pattern.key,
        pattern_data: pattern.data,
        confidence: pattern.confidence,
        occurrences: pattern.occurrences,
        first_detected_at: pattern.firstDetected.toISOString(),
        last_detected_at: pattern.lastDetected.toISOString(),
        metadata: pattern.metadata ?? {},
      },
      {
        onConflict: 'user_id,pattern_type,pattern_key',
      }
    );

    // Se tabela não existe, desabilitar persistência silenciosamente
    if (error) {
      state.persistenceEnabled = false;
      persistenceCheckCache = false;
    }
  } catch {
    // Silenciosamente desabilitar persistência
    state.persistenceEnabled = false;
    persistenceCheckCache = false;
  }
}

function mapDbToPattern(row: Record<string, unknown>): DetectedPattern {
  return {
    id: row.id ? String(row.id as string | number) : '',
    type: row.pattern_type as PatternType,
    key: row.pattern_key ? String(row.pattern_key as string | number) : '',
    data: (row.pattern_data as Record<string, unknown>) ?? {},
    confidence: Number(row.confidence) || 0.5,
    occurrences: Number(row.occurrences) || 1,
    firstDetected: new Date(row.first_detected_at as string),
    lastDetected: new Date(row.last_detected_at as string),
    metadata: row.metadata as Record<string, unknown>,
  };
}

function setupEventListeners(): void {
  // Listen to user actions
  // @ts-expect-error - Event type mismatch
  eventBus.on('user:interacted', event => {
    recordAction(`interact:${event.payload.elementType}`, {
      action: event.payload.action,
      ...event.payload.metadata,
    });
  });

  // @ts-expect-error - Event type mismatch
  eventBus.on('user:navigated', event => {
    recordAction(`navigate:${event.payload.to}`, {
      from: event.payload.from,
    });
  });

  eventBus.on('user:calculation', event => {
    recordAction(`calculate:${event.payload.calculatorType}`, {
      inputs: event.payload.inputs,
      result: event.payload.result,
    });
  });

  eventBus.on('user:error', event => {
    recordAction(`error:${event.payload.errorType}`, {
      message: event.payload.message,
      context: event.payload.context,
    });
  });
}

let analysisInterval: ReturnType<typeof setInterval> | null = null;

function startPeriodicAnalysis(): void {
  if (analysisInterval) {
    clearInterval(analysisInterval);
  }

  analysisInterval = setInterval(() => {
    if (state.learningEnabled && state.actionBuffer.length > 10) {
      analyzePatterns();
    }
  }, CONFIG.analysisInterval);
}

// =============================================================================
// CONTROL
// =============================================================================

/**
 * Habilita/desabilita aprendizado
 */
export function setLearningEnabled(enabled: boolean): void {
  state.learningEnabled = enabled;
}

/**
 * Verifica se aprendizado está habilitado
 */
export function isLearningEnabled(): boolean {
  return state.learningEnabled;
}

/**
 * Limpa buffer de ações
 */
export function clearActionBuffer(): void {
  state.actionBuffer = [];
}

/**
 * Limpa todos os padrões
 */
export function clearPatterns(): void {
  state.patterns.clear();
}

/**
 * Reseta completamente o engine
 */
export function resetPatternLearning(): void {
  state.initialized = false;
  state.persistenceEnabled = false;
  persistenceCheckCache = null; // Reset cache de persistência
  persistenceCheckPromise = null; // Reset Promise compartilhada
  state.userId = null;
  state.patterns.clear();
  state.actionBuffer = [];
  state.lastAnalysis = null;

  if (analysisInterval) {
    clearInterval(analysisInterval);
    analysisInterval = null;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const patternLearning = {
  init: initPatternLearning,
  record: recordAction,
  recordSequence: recordActionSequence,
  analyze: analyzePatterns,
  getAll: getAllPatterns,
  getByType: getPatternsByType,
  getHighConfidence: getHighConfidencePatterns,
  has: hasPattern,
  get: getPattern,
  getStats: getPatternStats,
  getTypicalUsageTime,
  getMostUsedCalculators,
  getFrequentErrors,
  getInferredPreferences,
  setEnabled: setLearningEnabled,
  isEnabled: isLearningEnabled,
  clearBuffer: clearActionBuffer,
  clearPatterns,
  reset: resetPatternLearning,
};

export default patternLearning;
