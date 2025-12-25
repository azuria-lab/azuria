import { emitEvent } from '../core/eventBus';
import { applyAction, executeActionSafely } from './safeActionEngine';
import { validateActionAgainstPolicy } from './policyEngine';
import { detectGovernanceViolations, registerDecision } from './governanceEngine';
import { validateRecommendation } from './consciousOrchestrator';
import { detectContradictions, explainDecision, generateRationale, validateLogic } from './coherenceEngine';
import { getPersonalityProfile } from './personalityEngine';

type AnyState = Record<string, unknown>;

interface UnifiedState {
  contextual: AnyState;
  cognitive: AnyState;
  social: AnyState;
  temporal: AnyState;
  meta: AnyState;
  operational: AnyState;
  opportunity: AnyState;
  risk: AnyState;
  evolution: AnyState;
  consistency: AnyState;
  lastEvents: Array<{ tipo: string; timestamp: number }>;
  lastRecommendation?: string;
  confidence?: number;
  healthScore?: number;
  systemHealthScore?: number;
  mindSnapshot?: AnyState;
  confidenceMap?: Record<string, number>;
  personalityRiskAttitude?: string;
  opportunityBias?: number;
  decisionStyle?: string;
}

const unifiedState: UnifiedState = {
  contextual: {},
  cognitive: {},
  social: {},
  temporal: {},
  meta: {},
  operational: {},
  opportunity: {},
  risk: {},
  evolution: {},
  consistency: {},
  lastEvents: [],
};

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function getGlobalState(): UnifiedState {
  return { ...unifiedState, lastEvents: [...unifiedState.lastEvents] };
}

export function updateGlobalState(delta: Partial<UnifiedState>) {
  Object.assign(unifiedState, delta);
  emitEvent('ai:core-sync', { state: getGlobalState() }, { source: 'integratedCoreEngine', priority: 6 });
}

export function routeEvent(event: { tipo: string; payload: Record<string, unknown>; timestamp: number }) {
  unifiedState.lastEvents.push({ tipo: event.tipo, timestamp: event.timestamp });
  if (unifiedState.lastEvents.length > 50) {unifiedState.lastEvents.shift();}
  emitEvent('ai:core-sync', { state: getGlobalState() }, { source: 'integratedCoreEngine', priority: 6 });
}

export function computeUnifiedInference() {
  const operationalData = unifiedState.operational as { globalConfidence?: number } | undefined;
  const evolutionData = unifiedState.evolution as { evolutionScore?: number } | undefined;
  const globalConfidence = typeof operationalData?.globalConfidence === 'number' ? operationalData.globalConfidence : 0;
  const evolutionScore = typeof evolutionData?.evolutionScore === 'number' ? evolutionData.evolutionScore : 0;
  const confidence = clamp(
    0.5 +
      globalConfidence * 0.2 +
      evolutionScore * 0.2
  );
  unifiedState.confidence = confidence;
  emitEvent('ai:core-sync', { state: getGlobalState() }, { source: 'integratedCoreEngine', priority: 6 });
  return { confidence };
}

function applyPersonality() {
  const personality = getPersonalityProfile();
  unifiedState.personalityRiskAttitude = personality.riskAttitude;
  unifiedState.opportunityBias = personality.opportunityBias;
  unifiedState.decisionStyle = [
    personality.toneStyle.strategic ? 'estratégico' : '',
    personality.toneStyle.concise ? 'conciso' : '',
    personality.toneStyle.friendly ? 'acolhedor' : '',
  ]
    .filter(Boolean)
    .join(' / ');
  emitEvent('ai:core-sync', { state: getGlobalState() }, { source: 'integratedCoreEngine', priority: 5 });
}

export function generateUnifiedRecommendation() {
  const recommendation = unifiedState.temporal?.trend
    ? `Aja sobre tendência: ${unifiedState.temporal.trend}`
    : 'Monitore contexto atual';
  unifiedState.lastRecommendation = recommendation;
  emitEvent('ai:core-sync', { state: getGlobalState(), recommendation }, { source: 'integratedCoreEngine', priority: 6 });
  return recommendation;
}

export function synchronizeTemporalConsistency() {
  // Placeholder: in real impl, align temporal signals with current context
  emitEvent('ai:core-sync', { state: getGlobalState(), sync: 'temporal' }, { source: 'integratedCoreEngine', priority: 5 });
}

export function harmonizeConflicts() {
  const consistencyData = unifiedState.consistency as { conflicts?: unknown[] } | undefined;
  const conflicts = Array.isArray(consistencyData?.conflicts) ? consistencyData.conflicts : [];
  if (conflicts.length > 0) {
    unifiedState.healthScore = clamp((unifiedState.healthScore || 0.6) - 0.1 * conflicts.length);
  } else {
    unifiedState.healthScore = clamp((unifiedState.healthScore || 0.7) + 0.05);
  }
  emitEvent('ai:core-sync', { state: getGlobalState(), harmonized: true }, { source: 'integratedCoreEngine', priority: 5 });
}

export function runSelfEvolutionStep() {
  const health = unifiedState.healthScore ?? 0.7;
  const evolutionData = unifiedState.evolution as { evolutionScore?: number } | undefined;
  const evo = typeof evolutionData?.evolutionScore === 'number' ? evolutionData.evolutionScore : 0.6;
  const newScore = clamp((health + evo) / 2);
  unifiedState.healthScore = newScore;
  unifiedState.systemHealthScore = newScore;
  emitEvent('ai:core-sync', { state: getGlobalState(), evolutionScore: newScore }, { source: 'integratedCoreEngine', priority: 5 });
}

export function runCoherenceCheck(state: Record<string, unknown>) {
  const ok = validateLogic(state);
  const contradictions = detectContradictions(state);
  const rationale = generateRationale({ tipo: 'core-sync', payload: state });
  return { ok, contradictions, rationale };
}

interface CognitiveSnapshot {
  state?: Record<string, unknown>;
  confidenceMap?: Record<string, number>;
  healthScore?: number;
  [key: string]: unknown;
}

export function updateCognitiveMap(snapshot: CognitiveSnapshot | Record<string, unknown>) {
  const snapshotData = snapshot as CognitiveSnapshot;
  unifiedState.mindSnapshot = snapshotData?.state as AnyState | undefined;
  unifiedState.confidenceMap = snapshotData?.confidenceMap as Record<string, number> | undefined;
  if (typeof snapshotData?.healthScore === 'number') {
    unifiedState.healthScore = snapshotData.healthScore;
    unifiedState.systemHealthScore = snapshotData.healthScore;
  }
  emitEvent('ai:core-sync', { state: getGlobalState(), snapshot }, { source: 'integratedCoreEngine', priority: 7 });
}

interface Action {
  type?: string;
  [key: string]: unknown;
}

interface ActionContext {
  intent?: string;
  [key: string]: unknown;
}

export function runSafeActionPipeline(action: Action | Record<string, unknown>, context: ActionContext | Record<string, unknown>) {
  const policyCheck = validateActionAgainstPolicy(action);
  const safeResult = executeActionSafely(action, context);
  const allowed = policyCheck.allowed && safeResult.approved;
  const decision = allowed
    ? applyAction(action)
    : { success: false, reason: policyCheck.reason || safeResult.reason };

  const contextData = context as ActionContext | undefined;
  const actionData = action as Action;
  const intentValue = typeof contextData?.intent === 'string' ? { type: contextData.intent } : undefined;
  const actionType = typeof actionData?.type === 'string' ? actionData.type : 'unknown';
  
  registerDecision({
    intent: intentValue,
    action,
    policy: {
      forbiddenActions: policyCheck.allowed ? [] : [{ type: actionType }],
    },
    risk: {
      level: safeResult.riskLevel || 'medium',
      score: safeResult.riskLevel === 'high' ? 0.8 : safeResult.riskLevel === 'medium' ? 0.5 : 0.2,
    },
    decision,
  });

  const forbiddenActions = getForbidden(policyCheck as unknown as { forbiddenActions?: string[]; [key: string]: unknown });
  const forbiddenActionsTyped = Array.isArray(forbiddenActions) 
    ? forbiddenActions.filter((type): type is string => typeof type === 'string').map((type) => ({ type }))
    : [];
  detectGovernanceViolations({ 
    action, 
    policy: { 
      forbiddenActions: forbiddenActionsTyped
    } 
  });

  const validated = validateRecommendation({
    type: allowed ? 'insight' : 'warning',
    severity: allowed ? 'medium' : 'high',
    message: allowed ? 'Ação aprovada e executada com segurança.' : 'Ação bloqueada pela política.',
    values: { allowed },
  });

  explainDecision(validated);

  return { allowed, decision, validated };
}

function getForbidden(policy: { forbiddenActions?: string[]; [key: string]: unknown } | { allowed: boolean; reason?: string; [key: string]: unknown }) {
  if ('forbiddenActions' in policy) {
    return policy.forbiddenActions || [];
  }
  return [];
}

export const _internals = {
  unifiedState,
};

// Inicializar personalidade na carga do módulo
applyPersonality();

