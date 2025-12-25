/**
 * Proactive Analysis Functions
 *
 * Funções de análise proativa para o aiOrchestrator.
 * Avaliam contexto e geram insights de forma autônoma.
 */

import { getContext } from './contextStore';

interface ProactiveInsight {
  type: string;
  severity: string;
  message: string;
  sourceModule: string;
}

export interface ProactiveAnalysisResult {
  shouldGenerateInsight: boolean;
  insights: ProactiveInsight[];
}

/**
 * Avalia regras proativas com base no contexto atual
 * Chamada pelo proactiveEngine
 */
export async function evaluateProactiveRules(): Promise<ProactiveAnalysisResult> {
  const insights: ProactiveInsight[] = [];

  // Dashboard - Tendências perigosas
  const dashboardInsights = await evaluateDashboardProactive();
  insights.push(...dashboardInsights);

  // Histórico - Padrões de erro
  const historyInsights = await evaluateHistoryProactive();
  insights.push(...historyInsights);

  // Lote Inteligente - Problemas estruturais
  const lotInsights = await evaluateLotProactive();
  insights.push(...lotInsights);

  // IA de Precificação - Sugestões ignoradas
  const pricingInsights = await evaluatePricingAIProactive();
  insights.push(...pricingInsights);

  // Analytics - Comportamento anormal
  const analyticsInsights = await evaluateAnalyticsProactive();
  insights.push(...analyticsInsights);

  // Marketplace - Taxas anormais
  const marketplaceInsights = await evaluateMarketplaceProactive();
  insights.push(...marketplaceInsights);

  return {
    shouldGenerateInsight: insights.length > 0,
    insights: insights.filter(i => i !== null),
  };
}

/**
 * Avalia regras proativas do Dashboard
 */
async function evaluateDashboardProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('dashboard');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];
  const data = context.data as Record<string, unknown> | undefined;

  // Verificar queda de lucro
  const variacaoLucroValue = data?.variacaoLucro;
  if (typeof variacaoLucroValue === 'number' && variacaoLucroValue < -10) {
    insights.push({
      type: 'proactive',
      severity: 'high',
      message: `Lucro caiu ${Math.abs(variacaoLucroValue).toFixed(1)}% recentemente. Revise custos e precificação.`,
      sourceModule: 'dashboard',
    });
  }

  // Verificar tempo economizado alto
  const tempoEconomizadoValue = data?.tempoEconomizado;
  if (typeof tempoEconomizadoValue === 'number' && tempoEconomizadoValue > 300) {
    insights.push({
      type: 'proactive',
      severity: 'low',
      message: `Você economizou ${(tempoEconomizadoValue / 60).toFixed(0)} horas com a IA. Continue usando automações.`,
      sourceModule: 'dashboard',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Histórico
 */
async function evaluateHistoryProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('history');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];

  // TODO: Implementar detecção de padrões repetidos
  // Verificar erros recorrentes de margem baixa

  return insights;
}

/**
 * Avalia regras proativas do Lote Inteligente
 */
async function evaluateLotProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('smart_lot');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];
  const data = context.data as Record<string, unknown> | undefined;

  // Verificar produtos críticos
  const produtosCriticosValue = data?.produtosCriticos;
  const totalProdutosValue = data?.totalProdutos;
  
  if (
    typeof produtosCriticosValue === 'number' && 
    typeof totalProdutosValue === 'number' && 
    totalProdutosValue > 0
  ) {
    const percentual = (produtosCriticosValue / totalProdutosValue) * 100;

    if (percentual > 30) {
      insights.push({
        type: 'proactive',
        severity: 'high',
        message: `${percentual.toFixed(0)}% dos produtos no lote têm margem crítica. Otimização em massa recomendada.`,
        sourceModule: 'smart_lot',
      });
    }
  }

  return insights;
}

/**
 * Avalia regras proativas da IA de Precificação
 */
async function evaluatePricingAIProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('pricing_ai');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];
  const data = context.data as Record<string, unknown> | undefined;

  // Verificar sugestões pendentes
  const sugestoesPendentesValue = data?.sugestoesPendentes;
  if (typeof sugestoesPendentesValue === 'number' && sugestoesPendentesValue > 5) {
    insights.push({
      type: 'proactive',
      severity: 'medium',
      message: `${sugestoesPendentesValue} sugestões de precificação aguardando revisão. Aplicá-las pode aumentar margem.`,
      sourceModule: 'pricing_ai',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Analytics
 */
async function evaluateAnalyticsProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('analytics');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];
  const data = context.data as Record<string, unknown> | undefined;

  // Verificar queda abrupta
  const quedaDiariaValue = data?.quedaDiaria;
  if (typeof quedaDiariaValue === 'number' && quedaDiariaValue > 15) {
    insights.push({
      type: 'proactive',
      severity: 'critical',
      message: `Queda abrupta de ${quedaDiariaValue.toFixed(1)}% na margem hoje. Ação imediata necessária.`,
      sourceModule: 'analytics',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Marketplace
 */
async function evaluateMarketplaceProactive(): Promise<ProactiveInsight[]> {
  const context = getContext('marketplace');
  if (!context) {return [];}

  const insights: ProactiveInsight[] = [];
  const data = context.data as Record<string, unknown> | undefined;

  // Verificar taxas altas
  const taxaAtualValue = data?.taxaAtual;
  if (typeof taxaAtualValue === 'number' && taxaAtualValue > 20) {
    insights.push({
      type: 'proactive',
      severity: 'high',
      message: `Taxa de marketplace de ${taxaAtualValue.toFixed(1)}% está impactando significativamente o lucro.`,
      sourceModule: 'marketplace',
    });
  }

  return insights;
}
