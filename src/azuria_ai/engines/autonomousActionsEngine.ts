import { emitEvent } from '../core/eventBus';
import { logOpportunity, logRisk } from '../logs/modeDeus_internal';

export type RecommendedAction =
  | 'recomendar_preco'
  | 'sugerir_frete'
  | 'trocar_marketplace'
  | 'analisar_impostos'
  | 'propor_margem';

export interface AutonomousDecision {
  shouldAct: boolean;
  action: RecommendedAction | null;
  reason?: string;
}

export interface ActionContext {
  margemLucro?: number;
  custoProduto?: number;
  precoVenda?: number;
  custoOperacional?: number;
  taxasMarketplace?: number;
  impostos?: unknown;
  aliquotaICMS?: unknown;
  payload?: {
    margemLucro?: number;
    custoProduto?: number;
    precoVenda?: number;
    custoOperacional?: number;
    taxasMarketplace?: number;
  };
  [key: string]: unknown;
}

function chooseAction(context: ActionContext): RecommendedAction | null {
  const margem = context?.margemLucro ?? context?.payload?.margemLucro;
  const custo = context?.custoProduto ?? context?.payload?.custoProduto;
  const preco = context?.precoVenda ?? context?.payload?.precoVenda;
  const frete = context?.custoOperacional ?? context?.payload?.custoOperacional;
  const taxasMarketplace = context?.taxasMarketplace ?? context?.payload?.taxasMarketplace;

  if (margem !== undefined && margem < 10) {return 'recomendar_preco';}
  if (custo !== undefined && preco !== undefined && custo >= preco) {return 'propor_margem';}
  if (frete && preco && (frete / preco) * 100 > 30) {return 'sugerir_frete';}
  if (taxasMarketplace && taxasMarketplace > 20) {return 'trocar_marketplace';}
  if (context?.impostos || context?.aliquotaICMS) {return 'analisar_impostos';}

  return null;
}

export function shouldAct(context: ActionContext): AutonomousDecision {
  const action = chooseAction(context);
  return {
    shouldAct: Boolean(action),
    action,
    reason: action ? 'Regra heurística acionada' : undefined,
  };
}

export function getRecommendedAction(context: ActionContext): { action: RecommendedAction | null; details?: string } {
  const decision = shouldAct(context);
  if (!decision.action) {
    return { action: null };
  }

  const detailsMap: Record<RecommendedAction, string> = {
    recomendar_preco: 'Sugerir novo preço para recompor margem.',
    sugerir_frete: 'Sugerir ajuste de frete ou negociação.',
    trocar_marketplace: 'Comparar marketplaces e sugerir mudança.',
    analisar_impostos: 'Recomendar revisão de impostos aplicados.',
    propor_margem: 'Propor margem ideal para evitar prejuízo.',
  };

  return { action: decision.action, details: detailsMap[decision.action] };
}

export function dispatchAction(eventBus: typeof emitEvent, context: ActionContext) {
  const recommendation = getRecommendedAction(context);
  if (!recommendation.action) {return;}

  const payload = {
    action: recommendation.action,
    details: recommendation.details,
    context,
  };

  // Emitir evento não intrusivo para UI consumir
  eventBus('ai:recommended-action', payload, { source: 'autonomousActionsEngine', priority: 5 });

  // Registrar internamente
  if (recommendation.action === 'recomendar_preco' || recommendation.action === 'propor_margem') {
    logRisk({ action: recommendation.action, context });
  } else {
    logOpportunity({ action: recommendation.action, context });
  }
}

