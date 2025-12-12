import { emitEvent } from '../core/eventBus';
import { logPredictive } from '../logs/modeDeus_internal.log';

export type RiskLevel = 'safe' | 'alert' | 'critical';

export interface PredictiveInsight {
  message: string;
  predictiveScore: number;
  riskLevel: RiskLevel;
  suggestedActions: string[];
  context: any;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function evaluateRiskLevel(margem?: number, custo?: number, preco?: number): RiskLevel {
  if (margem !== undefined && margem < 0) {return 'critical';}
  if (margem !== undefined && margem < 10) {return 'alert';}
  if (custo !== undefined && preco !== undefined && custo >= preco) {return 'critical';}
  return 'safe';
}

export function generatePredictiveInsight(context: any = {}): (PredictiveInsight & { id: string }) | null {
  const margem = context?.margemLucro ?? context?.payload?.margemLucro;
  const preco = context?.precoVenda ?? context?.payload?.precoVenda;
  const custo = context?.custoProduto ?? context?.payload?.custoProduto;
  const custosOper = context?.custoOperacional ?? context?.payload?.custoOperacional;
  const taxasMarketplace = context?.taxasMarketplace ?? context?.payload?.taxasMarketplace;

  const riskLevel = evaluateRiskLevel(margem, custo, preco);

  const signals: string[] = [];
  if (margem !== undefined) {
    if (margem < 10) {signals.push('queda_margem_prevista');}
    if (margem >= 25) {signals.push('margem_otima');}
  }
  if (custosOper && preco) {
    const impacto = (custosOper / preco) * 100;
    if (impacto > 30) {signals.push('aumento_custo_operacional');}
  }
  if (taxasMarketplace && taxasMarketplace > 20) {
    signals.push('impacto_marketplace');
  }
  if (custo !== undefined && preco !== undefined && custo >= preco) {
    signals.push('risco_prejuizo');
  }

  const predictiveScore = clampScore(0.3 + signals.length * 0.15);
  const suggestedActions: string[] = [];

  if (signals.includes('queda_margem_prevista')) {
    suggestedActions.push('Ajustar preço para recompor margem');
  }
  if (signals.includes('aumento_custo_operacional')) {
    suggestedActions.push('Negociar frete ou repassar custo');
  }
  if (signals.includes('risco_prejuizo')) {
    suggestedActions.push('Rever custos ou aumentar preço imediatamente');
  }
  if (signals.includes('impacto_marketplace')) {
    suggestedActions.push('Comparar marketplaces ou ajustar comissão');
  }
  if (signals.includes('margem_otima')) {
    suggestedActions.push('Explorar promoção controlada para ganho de volume');
  }

  if (signals.length === 0) {
    return null;
  }

  const insight: PredictiveInsight & { id: string } = {
    id: `predict-${Date.now()}-${Math.random()}`,
    message: 'Insight preditivo gerado a partir do contexto atual.',
    predictiveScore,
    riskLevel,
    suggestedActions,
    context,
  };

  emitEvent(
    'ai:predictive-insight',
    {
      ...insight,
      type: 'forecast',
    },
    { source: 'predictiveInsightEngine', priority: 7 }
  );

  logPredictive(insight);

  // Também expor via canal padrão de insight para UI
  emitEvent(
    'insight:generated',
    {
      type: 'forecast',
      severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'alert' ? 'high' : 'low',
      message: insight.message,
      suggestion: suggestedActions[0],
      values: { predictiveScore },
      sourceModule: 'predictiveInsightEngine',
      id: insight.id,
    },
    { source: 'predictiveInsightEngine', priority: 6 }
  );

  return insight;
}

