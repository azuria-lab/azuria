/**
 * Proactive Analysis Functions
 *
 * Funções de análise proativa para o aiOrchestrator.
 * Avaliam contexto e geram insights de forma autônoma.
 */

import { getContext, getCurrentScreen } from './contextStore';
import { getEventHistory } from './eventBus';

export interface ProactiveAnalysisResult {
  shouldGenerateInsight: boolean;
  insights: any[];
}

/**
 * Avalia regras proativas com base no contexto atual
 * Chamada pelo proactiveEngine
 */
export async function evaluateProactiveRules(): Promise<ProactiveAnalysisResult> {
  const insights: any[] = [];
  const currentScreen = getCurrentScreen();

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
async function evaluateDashboardProactive(): Promise<any[]> {
  const context = getContext('dashboard');
  if (!context) {return [];}

  const insights: any[] = [];

  // Verificar queda de lucro
  if (
    context.data?.variacaoLucro !== undefined &&
    context.data.variacaoLucro < -10
  ) {
    insights.push({
      type: 'proactive',
      severity: 'high',
      message: `Lucro caiu ${Math.abs(context.data.variacaoLucro).toFixed(
        1
      )}% recentemente. Revise custos e precificação.`,
      sourceModule: 'dashboard',
    });
  }

  // Verificar tempo economizado alto
  if (
    context.data?.tempoEconomizado !== undefined &&
    context.data.tempoEconomizado > 300
  ) {
    insights.push({
      type: 'proactive',
      severity: 'low',
      message: `Você economizou ${(context.data.tempoEconomizado / 60).toFixed(
        0
      )} horas com a IA. Continue usando automações.`,
      sourceModule: 'dashboard',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Histórico
 */
async function evaluateHistoryProactive(): Promise<any[]> {
  const context = getContext('history');
  if (!context) {return [];}

  const insights: any[] = [];

  // TODO: Implementar detecção de padrões repetidos
  // Verificar erros recorrentes de margem baixa

  return insights;
}

/**
 * Avalia regras proativas do Lote Inteligente
 */
async function evaluateLotProactive(): Promise<any[]> {
  const context = getContext('smart_lot');
  if (!context) {return [];}

  const insights: any[] = [];

  // Verificar produtos críticos
  if (context.data?.produtosCriticos && context.data?.totalProdutos) {
    const percentual =
      (context.data.produtosCriticos / context.data.totalProdutos) * 100;

    if (percentual > 30) {
      insights.push({
        type: 'proactive',
        severity: 'high',
        message: `${percentual.toFixed(
          0
        )}% dos produtos no lote têm margem crítica. Otimização em massa recomendada.`,
        sourceModule: 'smart_lot',
      });
    }
  }

  return insights;
}

/**
 * Avalia regras proativas da IA de Precificação
 */
async function evaluatePricingAIProactive(): Promise<any[]> {
  const context = getContext('pricing_ai');
  if (!context) {return [];}

  const insights: any[] = [];

  // Verificar sugestões pendentes
  if (context.data?.sugestoesPendentes && context.data.sugestoesPendentes > 5) {
    insights.push({
      type: 'proactive',
      severity: 'medium',
      message: `${context.data.sugestoesPendentes} sugestões de precificação aguardando revisão. Aplicá-las pode aumentar margem.`,
      sourceModule: 'pricing_ai',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Analytics
 */
async function evaluateAnalyticsProactive(): Promise<any[]> {
  const context = getContext('analytics');
  if (!context) {return [];}

  const insights: any[] = [];

  // Verificar queda abrupta
  if (
    context.data?.quedaDiaria !== undefined &&
    context.data.quedaDiaria > 15
  ) {
    insights.push({
      type: 'proactive',
      severity: 'critical',
      message: `Queda abrupta de ${context.data.quedaDiaria.toFixed(
        1
      )}% na margem hoje. Ação imediata necessária.`,
      sourceModule: 'analytics',
    });
  }

  return insights;
}

/**
 * Avalia regras proativas do Marketplace
 */
async function evaluateMarketplaceProactive(): Promise<any[]> {
  const context = getContext('marketplace');
  if (!context) {return [];}

  const insights: any[] = [];

  // Verificar taxas altas
  if (context.data?.taxaAtual !== undefined && context.data.taxaAtual > 20) {
    insights.push({
      type: 'proactive',
      severity: 'high',
      message: `Taxa de marketplace de ${context.data.taxaAtual.toFixed(
        1
      )}% está impactando significativamente o lucro.`,
      sourceModule: 'marketplace',
    });
  }

  return insights;
}
