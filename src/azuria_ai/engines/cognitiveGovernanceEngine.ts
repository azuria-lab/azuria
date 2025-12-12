import { emitEvent } from '../core/eventBus';
import { governanceRules } from '../policies/governanceRules';
import { rewriteWithBrandVoice } from './brandVoiceEngine';

interface ValidationResult {
  valid: boolean;
  corrected?: boolean;
  blocked?: boolean;
  message?: string;
  reason?: string;
  severity?: string;
}

function flagInvalid(reason: string): ValidationResult {
  emitEvent('ai:decision-invalid', { reason }, { source: 'cognitiveGovernanceEngine', priority: 8 });
  return { valid: false, reason };
}

function emitValid(message?: string): ValidationResult {
  emitEvent('ai:decision-valid', { message }, { source: 'cognitiveGovernanceEngine', priority: 5 });
  return { valid: true, message };
}

export function validateInsight(insight: any): ValidationResult {
  if (!insight?.message) {return flagInvalid('missing_message');}
  if (insight?.data?.price && insight?.data?.cost && insight.data.price < insight.data.cost) {
    return flagInvalid('price_below_cost_without_justification');
  }
  return emitValid();
}

export function validateRecommendation(rec: any): ValidationResult {
  if (!rec?.action) {return flagInvalid('missing_action');}
  if (rec?.action === 'fraud' || rec?.action === 'bypass_rules') {return flagInvalid('illegal_recommendation');}
  return emitValid();
}

export function validatePricingSuggestion(suggestion: any): ValidationResult {
  if (suggestion?.price < (suggestion?.cost || 0)) {
    return flagInvalid('pricing_below_cost');
  }
  if (suggestion?.price > (suggestion?.cost || 0) * 10) {
    return flagInvalid('pricing_inflated');
  }
  return emitValid();
}

export function validateFiscalAdvice(advice: any): ValidationResult {
  if (governanceRules.fiscal.forbidIncorrectTaxes && advice?.tax && advice.tax < 0) {
    return flagInvalid('invalid_tax');
  }
  return emitValid();
}

export function validateUXAdjustment(adjustment: any): ValidationResult {
  if (governanceRules.ux.forbidAlarmism && adjustment?.tone === 'alarmist') {
    return flagInvalid('alarmist_ux');
  }
  return emitValid();
}

export function correctIfUnsafe(text: string): string {
  const safe = rewriteWithBrandVoice(text.replace(/garantido/gi, 'provável'), 'padrao');
  emitEvent('ai:decision-corrected', { text: safe }, { source: 'cognitiveGovernanceEngine', priority: 6 });
  return safe;
}

export function rewriteToSafeFormat(text: string): string {
  const safe = rewriteWithBrandVoice(text, 'padrao');
  emitEvent('ai:decision-corrected', { text: safe }, { source: 'cognitiveGovernanceEngine', priority: 5 });
  return safe;
}

export function downgradeSeverityIfNeeded(insight: any): any {
  if (insight?.severity === 'critical' && !insight?.data?.impact) {
    emitEvent('ai:decision-corrected', { reason: 'downgrade', from: 'critical', to: 'high' }, { source: 'cognitiveGovernanceEngine', priority: 5 });
    return { ...insight, severity: 'high' };
  }
  return insight;
}

export function blockIfOutsideScope(insight: any): ValidationResult {
  if (insight?.scope && insight.scope !== 'pricing' && insight.scope !== 'tax' && insight.scope !== 'ux') {
    emitEvent('ai:unsafe-output-blocked', { reason: 'outside_scope' }, { source: 'cognitiveGovernanceEngine', priority: 9 });
    return { valid: false, blocked: true, reason: 'outside_scope' };
  }
  return { valid: true };
}

