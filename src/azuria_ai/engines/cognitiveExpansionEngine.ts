import { emitEvent } from '../core/eventBus';
import {
  EvolutionInsight,
  EvolutionLearning,
  EvolutionMemory,
  EvolutionPattern,
  EvolutionQuery,
} from '../events/evolutionEvents';
import {
  addEvolutionEvent,
  addEvolutionSnapshot,
} from '../../server/evolutionStore';

type HistoryEvent = { tipo: string; payload: unknown; timestamp: number };

let historyBuffer: HistoryEvent[] = [];

function recordHistory(ev: HistoryEvent) {
  historyBuffer.push(ev);
  if (historyBuffer.length > 200) {
    historyBuffer.shift();
  }
}

export function registerPattern(pattern: EvolutionPattern) {
  emitEvent('ai:evolution-pattern', pattern, {
    source: 'cognitiveExpansionEngine',
    priority: 5,
  });
  addEvolutionEvent('pattern', pattern);
}

export function registerDecision(decision: {
  action: string;
  accepted: boolean;
  context?: unknown;
}) {
  emitEvent(
    'ai:evolution-memory',
    {
      key: decision.action,
      value: decision.accepted,
      reason: 'human-decision',
    },
    { source: 'cognitiveExpansionEngine', priority: 4 }
  );
  addEvolutionEvent('memory', {
    key: decision.action,
    value: decision.accepted,
    reason: 'human-decision',
  });
}

export function analyzeHistory(events: HistoryEvent[]) {
  historyBuffer = events.slice(-200);
  const freq = events.length;
  emitEvent(
    'ai:evolution-learning',
    {
      source: 'history',
      concept: 'event-volume',
      confidence: Math.min(1, freq / 500),
    },
    { source: 'cognitiveExpansionEngine', priority: 3 }
  );
  addEvolutionEvent('learning', {
    source: 'history',
    concept: 'event-volume',
    confidence: Math.min(1, freq / 500),
  });
}

export function generateInsights(): EvolutionInsight[] {
  const insight: EvolutionInsight = {
    insight: 'Sistema mantém padrão estável de uso.',
    relevance: 0.5,
    recommendedAction: 'Monitorar evolução',
  };
  emitEvent('ai:evolution-insight', insight, {
    source: 'cognitiveExpansionEngine',
    priority: 4,
  });
  addEvolutionEvent('insight', insight);
  return [insight];
}

export function identifyTrends(): EvolutionPattern[] {
  const pattern: EvolutionPattern = {
    pattern: 'Admin aceita recomendações de alto impacto',
    frequency: 3,
    impact: 0.8,
    details: { window: '7d' },
  };
  registerPattern(pattern);
  return [pattern];
}

export function emitSnapshot() {
  const snapshot = {
    historySize: historyBuffer.length,
    lastEvents: historyBuffer.slice(-5),
  };
  addEvolutionSnapshot(snapshot);
  emitEvent(
    'ai:evolution-insight',
    {
      insight: 'Snapshot gerado',
      relevance: 0.3,
      recommendedAction: 'Revisar no painel',
    },
    { source: 'cognitiveExpansionEngine', priority: 3 }
  );
  return snapshot;
}

export function handleQuery(q: EvolutionQuery) {
  emitEvent('ai:evolution-query', q, {
    source: 'cognitiveExpansionEngine',
    priority: 2,
  });
  addEvolutionEvent('query', q);
}

export function captureMemory(m: EvolutionMemory) {
  emitEvent('ai:evolution-memory', m, {
    source: 'cognitiveExpansionEngine',
    priority: 3,
  });
  addEvolutionEvent('memory', m);
}

// Export recordHistory for tests
export { recordHistory };
