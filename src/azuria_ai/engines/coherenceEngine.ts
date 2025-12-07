import { emitEvent } from '../core/eventBus';
import { logInternalInsight } from '../logs/internalInsights.log';

export function validateLogic(state: any) {
  const contradictions = detectContradictions(state);
  if (contradictions.length) {
    emitEvent('ai:contradiction-detected', { contradictions }, { source: 'coherenceEngine', priority: 7 });
  }
  return contradictions.length === 0;
}

export function detectContradictions(state: any): string[] {
  const issues: string[] = [];
  if (state?.risk?.level === 'high' && state?.opportunity?.signal === 'strong') {
    issues.push('Risco alto coexistindo com oportunidade forte');
  }
  if (state?.temporal?.trend === 'decline' && state?.evolution?.evolutionScore > 0.8) {
    issues.push('Tendência de queda vs evolução alta');
  }
  return issues;
}

export function generateRationale(event: { tipo: string; payload: any }) {
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

export function stabilizeIntentFlow(state: any) {
  // Placeholder: in real impl, reweight intents
  const coherence = 0.7;
  emitEvent('ai:coherence-warning', { coherence }, { source: 'coherenceEngine', priority: 5 });
  return coherence;
}

export function explainDecision(decision: any) {
  const explanation = {
    reason: decision?.message || 'Decisão emitida.',
    factors: Object.keys(decision?.values || {}),
    confidence: decision?.values?.confidence ?? 0.6,
    inconsistenciesFound: [],
  };
  emitEvent('ai:explainable-decision', explanation, { source: 'coherenceEngine', priority: 5 });
  logInternalInsight(explanation);
  return explanation;
}

