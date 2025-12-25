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

interface InsightData {
  message?: string;
  data?: {
    price?: number;
    cost?: number;
    impact?: unknown;
  };
  severity?: string;
  scope?: string;
}

interface Recommendation {
  action?: string;
}

interface PricingSuggestion {
  price?: number;
  cost?: number;
}

interface FiscalAdvice {
  tax?: number;
}

interface UXAdjustment {
  tone?: string;
}

function flagInvalid(reason: string): ValidationResult {
  emitEvent('ai:decision-invalid', { reason }, { source: 'cognitiveGovernanceEngine', priority: 8 });
  return { valid: false, reason };
}

function emitValid(message?: string): ValidationResult {
  emitEvent('ai:decision-valid', { message }, { source: 'cognitiveGovernanceEngine', priority: 5 });
  return { valid: true, message };
}

export function validateInsight(insight: InsightData | Record<string, unknown>): ValidationResult {
  const insightData = insight as InsightData;
  if (!insightData?.message) {return flagInvalid('missing_message');}
  if (insightData?.data?.price && insightData?.data?.cost && insightData.data.price < insightData.data.cost) {
    return flagInvalid('price_below_cost_without_justification');
  }
  return emitValid();
}

export function validateRecommendation(rec: Recommendation | Record<string, unknown>): ValidationResult {
  const recommendation = rec as Recommendation;
  if (!recommendation?.action) {return flagInvalid('missing_action');}
  if (recommendation.action === 'fraud' || recommendation.action === 'bypass_rules') {return flagInvalid('illegal_recommendation');}
  return emitValid();
}

export function validatePricingSuggestion(suggestion: PricingSuggestion | Record<string, unknown>): ValidationResult {
  const pricing = suggestion as PricingSuggestion;
  if (pricing?.price !== undefined && (pricing.price < (pricing.cost || 0))) {
    return flagInvalid('pricing_below_cost');
  }
  if (pricing?.price !== undefined && (pricing.price > (pricing.cost || 0) * 10)) {
    return flagInvalid('pricing_inflated');
  }
  return emitValid();
}

export function validateFiscalAdvice(advice: FiscalAdvice | Record<string, unknown>): ValidationResult {
  const fiscal = advice as FiscalAdvice;
  if (governanceRules.fiscal.forbidIncorrectTaxes && fiscal?.tax !== undefined && fiscal.tax < 0) {
    return flagInvalid('invalid_tax');
  }
  return emitValid();
}

export function validateUXAdjustment(adjustment: UXAdjustment | Record<string, unknown>): ValidationResult {
  const ux = adjustment as UXAdjustment;
  if (governanceRules.ux.forbidAlarmism && ux?.tone === 'alarmist') {
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

export function downgradeSeverityIfNeeded(insight: InsightData | Record<string, unknown>): InsightData | Record<string, unknown> {
  const insightData = insight as InsightData;
  if (insightData?.severity === 'critical' && !insightData?.data?.impact) {
    emitEvent('ai:decision-corrected', { reason: 'downgrade', from: 'critical', to: 'high' }, { source: 'cognitiveGovernanceEngine', priority: 5 });
    return { ...insight, severity: 'high' };
  }
  return insight;
}

export function blockIfOutsideScope(insight: InsightData | Record<string, unknown>): ValidationResult {
  const insightData = insight as InsightData;
  if (insightData?.scope && insightData.scope !== 'pricing' && insightData.scope !== 'tax' && insightData.scope !== 'ux') {
    emitEvent('ai:unsafe-output-blocked', { reason: 'outside_scope' }, { source: 'cognitiveGovernanceEngine', priority: 9 });
    return { valid: false, blocked: true, reason: 'outside_scope' };
  }
  return { valid: true };
}

