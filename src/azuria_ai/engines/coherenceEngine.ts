import { emitEvent } from '../core/eventBus';
import { logInternalInsight } from '../logs/internalInsights';

interface State {
  risk?: { level?: string };
  opportunity?: { signal?: string };
  temporal?: { trend?: string };
  evolution?: { evolutionScore?: number };
  [key: string]: unknown;
}

export function validateLogic(state: State | Record<string, unknown>) {
  const contradictions = detectContradictions(state);
  if (contradictions.length) {
    emitEvent('ai:contradiction-detected', { contradictions }, { source: 'coherenceEngine', priority: 7 });
  }
  return contradictions.length === 0;
}

export function detectContradictions(state: State | Record<string, unknown>): string[] {
  const issues: string[] = [];
  const stateData = state as State;
  
  const riskLevel = stateData?.risk?.level;
  const opportunitySignal = stateData?.opportunity?.signal;
  if (riskLevel === 'high' && opportunitySignal === 'strong') {
    issues.push('Risco alto coexistindo com oportunidade forte');
  }
  
  const temporalTrend = stateData?.temporal?.trend;
  const evolutionScore = stateData?.evolution?.evolutionScore;
  if (temporalTrend === 'decline' && typeof evolutionScore === 'number' && evolutionScore > 0.8) {
    issues.push('Tendência de queda vs evolução alta');
  }
  return issues;
}

export function generateRationale(event: { tipo: string; payload: Record<string, unknown> }) {
  const rationale = {
    reason: `Evento ${event.tipo} processado.`,
    factors: Object.keys(event.payload || {}).slice(0, 4),
    confidence: 0.65,
    inconsistenciesFound: [],
  };
  logInternalInsight(rationale);
  emitEvent('ai:internal-insight', rationale, { source: 'coherenceEngine', priority: 5 });
  return rationale;
}

export function stabilizeIntentFlow(_state: State | Record<string, unknown>) {
  // Placeholder: in real impl, reweight intents
  const coherence = 0.7;
  emitEvent('ai:coherence-warning', { coherence }, { source: 'coherenceEngine', priority: 5 });
  return coherence;
}

interface Decision {
  message?: string;
  values?: {
    confidence?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function explainDecision(decision: Decision | Record<string, unknown>) {
  const decisionData = decision as Decision;
  const confidenceValue = decisionData?.values?.confidence;
  const explanation = {
    reason: typeof decisionData?.message === 'string' ? decisionData.message : 'Decisão emitida.',
    factors: Object.keys(decisionData?.values || {}),
    confidence: typeof confidenceValue === 'number' ? confidenceValue : 0.6,
    inconsistenciesFound: [] as string[],
  };
  emitEvent('ai:explainable-decision', explanation, { source: 'coherenceEngine', priority: 5 });
  logInternalInsight(explanation);
  return explanation;
}

