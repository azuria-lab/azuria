import { emitEvent } from '../core/eventBus';

interface TruthCheckResult {
  ok: boolean;
  contradictions?: string[];
  details?: any;
}

function emitTruthAlert(severity: 'info' | 'warning' | 'critical', details: any) {
  emitEvent('ai:truth-alert', { severity, details }, { source: 'truthEngine', priority: severity === 'critical' ? 9 : 6 });
}

export function checkLogicalCoherence(state: any): TruthCheckResult {
  const contradictions = detectContradictions(state).contradictions;
  const ok = contradictions.length === 0;
  if (!ok) {emitTruthAlert('warning', { contradictions });}
  return { ok, contradictions };
}

export function detectContradictions(state: any): TruthCheckResult {
  const contradictions: string[] = [];
  if (state?.pricing?.price < 0) {contradictions.push('Preço negativo detectado');}
  if (state?.inventory?.stock && state.inventory.stock < 0) {contradictions.push('Estoque negativo');}
  return { ok: contradictions.length === 0, contradictions };
}

export function validateRealityModel(reality: any, perceived: any): TruthCheckResult {
  const diff: string[] = [];
  if (reality && perceived && reality.version !== perceived.version) {diff.push('Versão de realidade divergente');}
  const ok = diff.length === 0;
  if (!ok) {emitTruthAlert('warning', { diff });}
  return { ok, contradictions: diff };
}

export function auditStateConsistency(state: any): TruthCheckResult {
  const issues: string[] = [];
  if (state?.operational?.load > 1) {issues.push('Load acima de 1');}
  const ok = issues.length === 0;
  if (!ok) {emitTruthAlert('critical', { issues });}
  return { ok, contradictions: issues };
}

export function ensureTruthBeforeAction(context: any): boolean {
  const check = checkLogicalCoherence(context);
  if (!check.ok) {return false;}
  const audit = auditStateConsistency(context);
  return audit.ok;
}

export function ensureTruthAfterAction(context: any): boolean {
  const validation = validateRealityModel(context?.reality, context?.perceived);
  return validation.ok;
}

export { emitTruthAlert };

