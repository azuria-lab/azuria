import { emitEvent } from '../core/eventBus';

interface TruthCheckResult {
  ok: boolean;
  contradictions?: string[];
  details?: Record<string, unknown>;
}

function emitTruthAlert(severity: 'info' | 'warning' | 'critical', details: Record<string, unknown>) {
  emitEvent('ai:truth-alert', { severity, details }, { source: 'truthEngine', priority: severity === 'critical' ? 9 : 6 });
}

interface CoherenceState {
  pricing?: {
    price?: number;
    [key: string]: unknown;
  };
  inventory?: {
    stock?: number;
    [key: string]: unknown;
  };
  operational?: {
    load?: number;
    [key: string]: unknown;
  };
  reality?: {
    version?: string;
    [key: string]: unknown;
  };
  perceived?: {
    version?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function checkLogicalCoherence(state: CoherenceState | Record<string, unknown>): TruthCheckResult {
  const contradictions = detectContradictions(state).contradictions;
  const ok = contradictions.length === 0;
  if (!ok) {emitTruthAlert('warning', { contradictions });}
  return { ok, contradictions };
}

export function detectContradictions(state: CoherenceState | Record<string, unknown>): TruthCheckResult {
  const stateData = state as CoherenceState;
  const contradictions: string[] = [];
  const priceValue = stateData?.pricing?.price;
  if (typeof priceValue === 'number' && priceValue < 0) {contradictions.push('Preço negativo detectado');}
  const stockValue = stateData?.inventory?.stock;
  if (typeof stockValue === 'number' && stockValue < 0) {contradictions.push('Estoque negativo');}
  return { ok: contradictions.length === 0, contradictions };
}

export function validateRealityModel(reality: CoherenceState['reality'], perceived: CoherenceState['perceived']): TruthCheckResult {
  const diff: string[] = [];
  if (reality && perceived && reality.version !== perceived.version) {diff.push('Versão de realidade divergente');}
  const ok = diff.length === 0;
  if (!ok) {emitTruthAlert('warning', { diff });}
  return { ok, contradictions: diff };
}

export function auditStateConsistency(state: CoherenceState | Record<string, unknown>): TruthCheckResult {
  const stateData = state as CoherenceState;
  const issues: string[] = [];
  const loadValue = stateData?.operational?.load;
  if (typeof loadValue === 'number' && loadValue > 1) {issues.push('Load acima de 1');}
  const ok = issues.length === 0;
  if (!ok) {emitTruthAlert('critical', { issues });}
  return { ok, contradictions: issues };
}

export function ensureTruthBeforeAction(context: CoherenceState | Record<string, unknown>): boolean {
  const check = checkLogicalCoherence(context);
  if (!check.ok) {return false;}
  const audit = auditStateConsistency(context);
  return audit.ok;
}

export function ensureTruthAfterAction(context: CoherenceState | Record<string, unknown>): boolean {
  const validation = validateRealityModel(context?.reality, context?.perceived);
  return validation.ok;
}

export { emitTruthAlert };

