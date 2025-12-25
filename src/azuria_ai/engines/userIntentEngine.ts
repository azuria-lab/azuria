import { emitEvent } from '../core/eventBus';
import { logConflict, logOpportunity, logRisk } from '../logs/modeDeus_internal';

export type IntentCategory =
  | 'pricing'
  | 'risk'
  | 'freight'
  | 'tax'
  | 'opportunity'
  | 'error'
  | 'request_action';

export interface IntentResult {
  category: IntentCategory;
  intentConfidence: number;
  signals: string[];
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

interface Payload {
  margemLucro?: number;
  custoOperacional?: number;
  precoVenda?: number;
  taxasMarketplace?: number;
  impostos?: unknown;
  aliquotaICMS?: unknown;
  frete?: unknown;
  erro?: unknown;
  error?: unknown;
  acaoSolicitada?: unknown;
  requestAction?: unknown;
  [key: string]: unknown;
}

function detectRiskOrOpportunity(payload: Payload | Record<string, unknown>) {
  const alerts: { risk?: string; opportunity?: string } = {};

  if (payload?.margemLucro !== undefined) {
    if (payload.margemLucro < 0) {
      alerts.risk = 'lucro_negativo';
    } else if (payload.margemLucro < 10) {
      alerts.risk = 'margem_critica';
    } else if (payload.margemLucro >= 25) {
      alerts.opportunity = 'margem_otima';
    }
  }

  if (payload?.custoOperacional && payload?.precoVenda) {
    const impactoFrete =
      ((payload.custoOperacional || 0) / (payload.precoVenda || 1)) * 100;
    if (impactoFrete > 35) {
      alerts.risk = alerts.risk || 'frete_excessivo';
    }
  }

  if (payload?.taxasMarketplace && payload.taxasMarketplace > 20) {
    alerts.risk = alerts.risk || 'taxa_marketplace_alta';
  }

  return alerts;
}

export function detectIntent(event: Payload | { payload?: Payload } | Record<string, unknown>, context: Record<string, unknown> = {}): IntentResult {
  const payload = event?.payload || event || {};
  const signals: string[] = [];
  let category: IntentCategory = 'pricing';

  const alerts = detectRiskOrOpportunity(payload);

  if (alerts.risk) {
    category = 'risk';
    signals.push(alerts.risk);
    emitEvent('ai:detected-risk', { alert: alerts.risk, payload }, { source: 'userIntentEngine' });
    logRisk({ alert: alerts.risk, payload, context });
  } else if (alerts.opportunity) {
    category = 'opportunity';
    signals.push(alerts.opportunity);
    emitEvent('ai:detected-opportunity', { alert: alerts.opportunity, payload }, { source: 'userIntentEngine' });
    logOpportunity({ alert: alerts.opportunity, payload, context });
  }

  if (payload?.impostos || payload?.aliquotaICMS) {
    category = 'tax';
    signals.push('tax_context');
  }

  if (payload?.frete || payload?.custoOperacional) {
    signals.push('freight_context');
  }

  if (payload?.erro || payload?.error) {
    category = 'error';
    signals.push('error_signal');
  }

  if (payload?.acaoSolicitada || payload?.requestAction) {
    category = 'request_action';
    signals.push('user_requested_action');
  }

  const confidenceBase = signals.length / 5;
  const intentConfidence = clampConfidence(confidenceBase + (alerts.risk || alerts.opportunity ? 0.2 : 0));

  return { category, intentConfidence, signals };
}

interface NextStepContext {
  margemLucro?: number;
  precoVenda?: number;
  custoProduto?: number;
  payload?: Payload;
  [key: string]: unknown;
}

export function predictNextStep(context: NextStepContext | Record<string, unknown> = {}): { nextStep: string; intentConfidence: number } {
  // Heurística simples baseada em margem e custo
  const margem = context?.margemLucro ?? context?.payload?.margemLucro;
  const preco = context?.precoVenda ?? context?.payload?.precoVenda;
  const custo = context?.custoProduto ?? context?.payload?.custoProduto;

  let nextStep = 'monitor';
  const signals: string[] = [];

  if (margem !== undefined && margem < 10) {
    nextStep = 'ajustar_preco';
    signals.push('margem_baixa');
  } else if (custo !== undefined && preco !== undefined && custo >= preco) {
    nextStep = 'rever_custos';
    signals.push('prejuizo');
  } else if (margem !== undefined && margem >= 25) {
    nextStep = 'explorar_oferta';
    signals.push('alta_margem');
  }

  const confidence = clampConfidence(0.4 + signals.length * 0.2);
  return { nextStep, intentConfidence: confidence };
}

export const intentCategories: IntentCategory[] = [
  'pricing',
  'risk',
  'freight',
  'tax',
  'opportunity',
  'error',
  'request_action',
];

export function logConflictSignal(details: Record<string, unknown>) {
  logConflict(details);
}

