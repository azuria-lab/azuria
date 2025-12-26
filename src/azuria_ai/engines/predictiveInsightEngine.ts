import { emitEvent } from '../core/eventBus';
import { logPredictive } from '../logs/modeDeus_internal';

export type RiskLevel = 'safe' | 'alert' | 'critical';

export interface PredictiveInsight {
  message: string;
  predictiveScore: number;
  riskLevel: RiskLevel;
  suggestedActions: string[];
  context: Record<string, unknown>;
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

function mapRiskLevelToSeverity(riskLevel: RiskLevel): 'critical' | 'high' | 'low' {
  if (riskLevel === 'critical') {return 'critical';}
  if (riskLevel === 'alert') {return 'high';}
  return 'low';
}

interface ContextValues {
  margem?: number;
  preco?: number;
  custo?: number;
  custosOper?: number;
  taxasMarketplace?: number;
}

function extractContextValues(context: Record<string, unknown>): ContextValues {
  const payload = context?.payload as Record<string, unknown> | undefined;
  return {
    margem: (context?.margemLucro ?? payload?.margemLucro) as number | undefined,
    preco: (context?.precoVenda ?? payload?.precoVenda) as number | undefined,
    custo: (context?.custoProduto ?? payload?.custoProduto) as number | undefined,
    custosOper: (context?.custoOperacional ?? payload?.custoOperacional) as number | undefined,
    taxasMarketplace: (context?.taxasMarketplace ?? payload?.taxasMarketplace) as number | undefined,
  };
}

function collectSignals(values: ContextValues): string[] {
  const { margem, preco, custo, custosOper, taxasMarketplace } = values;
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
  return signals;
}

const signalToAction: Record<string, string> = {
  'queda_margem_prevista': 'Ajustar preço para recompor margem',
  'aumento_custo_operacional': 'Negociar frete ou repassar custo',
  'risco_prejuizo': 'Rever custos ou aumentar preço imediatamente',
  'impacto_marketplace': 'Comparar marketplaces ou ajustar comissão',
  'margem_otima': 'Explorar promoção controlada para ganho de volume',
};

function buildSuggestedActions(signals: string[]): string[] {
  return signals
    .map(signal => signalToAction[signal])
    .filter((action): action is string => action !== undefined);
}

export function generatePredictiveInsight(context: Record<string, unknown> = {}): (PredictiveInsight & { id: string }) | null {
  const values = extractContextValues(context);
  const { margem, preco, custo } = values;

  const riskLevel = evaluateRiskLevel(margem, custo, preco);
  const signals = collectSignals(values);

  if (signals.length === 0) {
    return null;
  }

  const predictiveScore = clampScore(0.3 + signals.length * 0.15);
  const suggestedActions = buildSuggestedActions(signals);

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

  logPredictive(insight as Record<string, unknown>);

  // Também expor via canal padrão de insight para UI
  emitEvent(
    'insight:generated',
    {
      type: 'forecast',
      severity: mapRiskLevelToSeverity(riskLevel),
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

