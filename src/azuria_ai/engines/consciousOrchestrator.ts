import { emitEvent } from '../core/eventBus';
import { getConsciousLogs, logCoherence, logContradiction, logGovernance, logJustification } from '../logs/modeDeus_conscious';
import { getGlobalState } from './integratedCoreEngine';

interface AssessmentResult {
  coherenceScore: number;
  trustLevel: 'low' | 'medium' | 'high';
  contradictions: string[];
  reasoning: string;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function getTrustLevel(score: number): 'low' | 'medium' | 'high' {
  if (score > 0.75) { return 'high'; }
  if (score > 0.5) { return 'medium'; }
  return 'low';
}

export function assessGlobalState(): AssessmentResult {
  const _state = getGlobalState();
  const contradictions = detectContradictions();
  const coherenceScore = generateCoherenceScore(contradictions);
  const trustLevel = getTrustLevel(coherenceScore);
  const reasoning = justifyDecision(contradictions, coherenceScore);
  logCoherence({ coherenceScore, trustLevel });
  emitEvent(
    'ai:decision-validated',
    { coherenceScore, trustLevel, reasoning },
    { source: 'consciousOrchestrator', priority: 6 }
  );
  return { coherenceScore, trustLevel, contradictions, reasoning };
}

export function detectContradictions(): string[] {
  const state = getGlobalState();
  const issues: string[] = [];
  if (state.risk?.level === 'high' && state.opportunity?.signal === 'strong') {
    issues.push('Risco alto coexistindo com oportunidade forte');
  }
  if (state.temporal?.trend === 'decline' && state.evolution?.evolutionScore > 0.8) {
    issues.push('Tendência de queda vs. evolução alta');
  }
  if (issues.length) {
    logContradiction({ issues, state });
    emitEvent('ai:coherence-warning', { issues }, { source: 'consciousOrchestrator', priority: 7 });
  }
  return issues;
}

export function generateCoherenceScore(contradictions: string[]): number {
  const base = 0.8;
  const penalty = contradictions.length * 0.15;
  const score = clamp(base - penalty, 0, 1);
  return score;
}

export function predictSystemRisk(): number {
  const state = getGlobalState();
  const risk = clamp(
    (state.risk?.level === 'high' ? 0.7 : 0.3) +
      (state.consistency?.drift ? 0.2 : 0) +
      (state.operational?.load || 0) * 0.2 -
      (state.healthScore || 0.1) * 0.3,
    0,
    1
  );
  emitEvent('ai:governance-alert', { risk }, { source: 'consciousOrchestrator', priority: 7 });
  return risk;
}

export function justifyDecision(issues: string[], coherenceScore: number): string {
  const reasoning =
    issues.length === 0
      ? 'Sem contradições relevantes. Recomendação liberada.'
      : `Foram detectadas contradições: ${issues.join('; ')}. Score: ${coherenceScore.toFixed(2)}`;
  logJustification({ reasoning, issues, coherenceScore });
  return reasoning;
}

export function harmonizeEngines() {
  const state = getGlobalState();
  const aligned = {
    opportunity: state.opportunity,
    risk: state.risk,
    temporal: state.temporal,
  };
  logGovernance({ aligned });
}

interface Recommendation {
  action?: string;
  [key: string]: unknown;
}

export function validateRecommendation(rec: Recommendation | Record<string, unknown>) {
  const assessment = assessGlobalState();
  const risk = predictSystemRisk();
  const allowed = assessment.coherenceScore > 0.4 && risk < 0.7;
  const finalRec = allowed
    ? { ...rec, validatedBy: 'ConsciousLayer', trust: assessment.trustLevel }
    : {
        type: 'warning',
        severity: 'high',
        message: 'Insight bloqueado por inconsistência. Revise sinais.',
        validatedBy: 'ConsciousLayer',
        trust: 'low',
      };
  logGovernance({ recommendation: finalRec, allowed });
  return finalRec;
}

export function getGlobalReasoningTrace() {
  return getConsciousLogs();
}

