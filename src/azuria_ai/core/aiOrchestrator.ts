/**
 * AI Orchestrator - "Modo Deus"
 *
 * Roteador central que coordena toda a inteligência artificial da Azuria.
 * Processa eventos reativos e decide quando gerar insights automáticos.
 */

import type { Agent } from './agents';
import { type AzuriaEvent, emitEvent, on } from './eventBus';
import type { CalcData } from '../hooks/useCalcWatcher';
import {
  handleBidEvent,
  handleDiscountEvent,
  handleFeesEvent,
  handleICMSEvent,
  handleRiskEvent,
  handleScenarioEvent,
  handleSTEvent,
  handleTaxEvent,
} from './calculatorHandlers';
import {
  handleScreenChangedEvent,
  handleScreenDataUpdatedEvent,
} from './screenContextHandlers';

export interface OrchestratorRequest {
  id: string;
  userId: string;
  message: string;
  context?: any;
  timestamp: number;
}

export interface OrchestratorResponse {
  requestId: string;
  response: string;
  agentsUsed: string[];
  functionsCalled?: string[];
  confidence: number;
  timestamp: number;
}

export interface ConversationContext {
  userId: string;
  history: Array<{
    request: OrchestratorRequest;
    response: OrchestratorResponse;
  }>;
  currentState: any;
}

export interface InsightConfig {
  minMargin?: number; // Margem mínima para alertar
  maxMargin?: number; // Margem máxima para sugerir otimização
  minPrice?: number; // Preço mínimo aceitável
  enableAutoInsights?: boolean; // Se deve gerar insights automaticamente
}

// Contextos de conversação por usuário
const conversationContexts: Map<string, ConversationContext> = new Map();

// Configuração de insights
let insightConfig: InsightConfig = {
  minMargin: 10, // 10% margem mínima
  maxMargin: 50, // 50% margem máxima
  minPrice: 0,
  enableAutoInsights: true,
};

/**
 * Inicializa o orchestrator e registra listeners de eventos
 */
export function initializeOrchestrator(config?: InsightConfig): void {
  if (config) {
    insightConfig = { ...insightConfig, ...config };
  }

  // Registrar listener para eventos de cálculo básico
  on('calc:completed', handleCalculationEvent);
  on('calc:updated', handleCalculationUpdateEvent);
  on('calc:started', handleCalculationStartEvent);

  // Registrar listeners para calculadora avançada
  on('scenario:updated', handleScenarioEvent);
  on('fees:updated', handleFeesEvent);

  // Registrar listeners para calculadora tributária
  on('tax:updated', handleTaxEvent);
  on('icms:updated', handleICMSEvent);
  on('st:updated', handleSTEvent);

  // Registrar listeners para calculadora de licitações
  on('bid:updated', handleBidEvent);
  on('risk:updated', handleRiskEvent);
  on('discount:updated', handleDiscountEvent);

  // Registrar listeners para contexto de tela
  on('screen:changed', handleScreenChangedEvent);
  on('screen:dataUpdated', handleScreenDataUpdatedEvent);
}

/**
 * Processa evento de início de cálculo
 */
async function handleCalculationStartEvent(event: AzuriaEvent): Promise<void> {
  // TODO: Preparar contexto para análise
  console.log('Calculation started:', event);
}

/**
 * Processa evento de atualização de cálculo (inputs mudaram)
 */
async function handleCalculationUpdateEvent(event: AzuriaEvent): Promise<void> {
  const calcData = event.payload as CalcData;

  // TODO: Analisar se deve dar feedback em tempo real
  // Por exemplo, se margem está muito baixa enquanto usuário digita

  if (
    calcData.margemLucro !== undefined &&
    calcData.margemLucro < (insightConfig.minMargin || 10)
  ) {
    // Gerar insight de alerta
    generateInsight({
      type: 'warning',
      message: `Margem de lucro muito baixa (${calcData.margemLucro}%). Recomendamos pelo menos ${insightConfig.minMargin}%.`,
      data: calcData,
      action: 'adjust_margin',
    });
  }
}

/**
 * Processa evento de cálculo completado
 * Decide se deve gerar insight automático
 */
async function handleCalculationEvent(event: AzuriaEvent): Promise<void> {
  if (!insightConfig.enableAutoInsights) {
    return;
  }

  const calcData = event.payload as CalcData;

  // Avaliar o cálculo e decidir se deve gerar insight
  const shouldGenerateInsight = await evaluateCalculation(calcData);

  if (shouldGenerateInsight.generate) {
    generateInsight(shouldGenerateInsight.insight);
  }
}

/**
 * Avalia um cálculo e decide se deve gerar insight
 * Implementa lógica inteligente de análise
 */
async function evaluateCalculation(calcData: CalcData): Promise<{
  generate: boolean;
  insight?: any;
}> {
  const insights: any[] = [];

  // ===== ANÁLISE DE MARGEM DE LUCRO =====
  if (calcData.margemLucro !== undefined) {
    // Margem crítica (< 10%)
    if (calcData.margemLucro < (insightConfig.minMargin || 10)) {
      const precoSugerido = calcData.custoProduto
        ? calcData.custoProduto * (1 + (insightConfig.minMargin || 10) / 100)
        : null;

      insights.push({
        type: 'warning',
        severity: 'high',
        message: `⚠️ Margem de ${calcData.margemLucro.toFixed(
          1
        )}% está muito baixa! Recomendamos pelo menos ${
          insightConfig.minMargin
        }% para cobrir custos operacionais.`,
        data: calcData,
        action: 'increase_margin',
        priority: 'high',
        recommendations: [
          {
            label: 'Aumentar preço',
            value: precoSugerido,
            description: `Sugerimos R$ ${precoSugerido?.toFixed(
              2
            )} para margem de ${insightConfig.minMargin}%`,
          },
          {
            label: 'Reduzir custos',
            description: 'Busque fornecedores mais competitivos',
          },
        ],
      });
    }
    // Margem baixa (10-15%)
    else if (calcData.margemLucro >= 10 && calcData.margemLucro < 15) {
      insights.push({
        type: 'info',
        severity: 'medium',
        message: `💡 Margem de ${calcData.margemLucro.toFixed(
          1
        )}% está no limite. Considere otimizar para aumentar rentabilidade.`,
        data: calcData,
        action: 'optimize_margin',
        priority: 'medium',
        recommendations: [
          {
            label: 'Otimizar preço',
            description:
              'Pequeno ajuste pode aumentar lucro significativamente',
          },
        ],
      });
    }
    // Margem boa (15-20%)
    else if (calcData.margemLucro >= 15 && calcData.margemLucro <= 20) {
      insights.push({
        type: 'success',
        severity: 'low',
        message: `✅ Margem de ${calcData.margemLucro.toFixed(
          1
        )}% está saudável! Preço competitivo e lucrativo.`,
        data: calcData,
        action: 'maintain',
        priority: 'low',
      });
    }
    // Margem muito alta (> 50%)
    else if (calcData.margemLucro > (insightConfig.maxMargin || 50)) {
      insights.push({
        type: 'suggestion',
        severity: 'medium',
        message: `💰 Margem de ${calcData.margemLucro.toFixed(
          1
        )}% está muito alta. Você pode ser mais competitivo e vender mais.`,
        data: calcData,
        action: 'optimize_competitiveness',
        priority: 'medium',
        recommendations: [
          {
            label: 'Reduzir preço estrategicamente',
            description: 'Aumente volume de vendas mantendo boa margem',
          },
        ],
      });
    }
  }

  // ===== ANÁLISE DE CUSTO VS PREÇO =====
  if (
    calcData.precoVenda !== undefined &&
    calcData.custoProduto !== undefined
  ) {
    // Custo maior ou igual ao preço (CRÍTICO!)
    if (calcData.custoProduto >= calcData.precoVenda) {
      insights.push({
        type: 'warning',
        severity: 'critical',
        message: `🚨 ALERTA CRÍTICO! Custo (R$ ${calcData.custoProduto.toFixed(
          2
        )}) é maior que o preço de venda (R$ ${calcData.precoVenda.toFixed(
          2
        )}). Você terá PREJUÍZO!`,
        data: calcData,
        action: 'fix_pricing',
        priority: 'critical',
        recommendations: [
          {
            label: 'Aumentar preço imediatamente',
            value: calcData.custoProduto * 1.15,
            description: `Preço mínimo: R$ ${(
              calcData.custoProduto * 1.15
            ).toFixed(2)}`,
          },
          {
            label: 'Renegociar com fornecedor',
            description: 'Busque reduzir o custo do produto',
          },
        ],
      });
    }
    // Markup muito baixo (< 20%)
    else {
      const markup =
        ((calcData.precoVenda - calcData.custoProduto) /
          calcData.custoProduto) *
        100;

      if (markup < 20) {
        insights.push({
          type: 'warning',
          severity: 'high',
          message: `⚠️ Markup de apenas ${markup.toFixed(
            1
          )}% pode não cobrir custos operacionais, impostos e despesas.`,
          data: calcData,
          action: 'review_costs',
          priority: 'high',
          recommendations: [
            {
              label: 'Revisar todos os custos',
              description: 'Considere frete, impostos, comissões e operacional',
            },
            {
              label: 'Aumentar markup',
              description: 'Recomendamos pelo menos 30% de markup',
            },
          ],
        });
      }
    }
  }

  // ===== ANÁLISE DE FRETE =====
  if (
    calcData.precoVenda &&
    calcData.custoProduto &&
    calcData.custoOperacional
  ) {
    const lucroBase = calcData.precoVenda - calcData.custoProduto;
    const percentualFrete = (calcData.custoOperacional / lucroBase) * 100;

    if (percentualFrete > 35) {
      insights.push({
        type: 'warning',
        severity: 'medium',
        message: `📦 Frete/custos operacionais (${percentualFrete.toFixed(
          1
        )}%) estão consumindo muito do seu lucro!`,
        data: calcData,
        action: 'optimize_shipping',
        priority: 'medium',
        recommendations: [
          {
            label: 'Negociar frete',
            description: 'Busque transportadoras mais econômicas',
          },
          {
            label: 'Repassar custo',
            description: 'Considere cobrar frete separadamente',
          },
        ],
      });
    }
  }

  // ===== ANÁLISE DE TAXAS DE MARKETPLACE =====
  if (
    calcData.taxasMarketplace !== undefined &&
    calcData.taxasMarketplace > 0
  ) {
    const lucroBase =
      calcData.precoVenda && calcData.custoProduto
        ? calcData.precoVenda - calcData.custoProduto
        : 0;

    if (lucroBase > 0) {
      const impactoTaxas =
        (calcData.taxasMarketplace / 100) * (calcData.precoVenda || 0);
      const percentualImpacto = (impactoTaxas / lucroBase) * 100;

      // Taxas muito altas (> 20%)
      if (calcData.taxasMarketplace > 20) {
        insights.push({
          type: 'info',
          severity: 'medium',
          message: `🏪 Taxas de marketplace (${calcData.taxasMarketplace}%) são significativas. Considere outros canais de venda.`,
          data: calcData,
          action: 'compare_marketplaces',
          priority: 'medium',
          recommendations: [
            {
              label: 'Comparar marketplaces',
              description: 'Veja se outros canais têm taxas menores',
            },
            {
              label: 'Venda direta',
              description: 'Considere loja própria para maior margem',
            },
          ],
        });
      }

      // Taxas consumindo muito do lucro (> 40%)
      if (percentualImpacto > 40) {
        insights.push({
          type: 'warning',
          severity: 'high',
          message: `💸 Taxas do marketplace estão consumindo ${percentualImpacto.toFixed(
            1
          )}% do seu lucro!`,
          data: calcData,
          action: 'review_marketplace_strategy',
          priority: 'high',
          recommendations: [
            {
              label: 'Ajustar preço',
              description: 'Aumente o preço para compensar as taxas',
            },
            {
              label: 'Mudar de canal',
              description: 'Avalie canais com taxas menores',
            },
          ],
        });
      }
    }
  }

  // ===== ANÁLISE DE IMPOSTOS =====
  if (calcData.impostos !== undefined && calcData.impostos > 0) {
    const impactoImpostos = calcData.precoVenda
      ? (calcData.impostos / 100) * calcData.precoVenda
      : 0;

    if (calcData.impostos > 30) {
      insights.push({
        type: 'info',
        severity: 'low',
        message: `📊 Carga tributária de ${calcData.impostos}% é alta. Certifique-se de que está incluída no preço.`,
        data: calcData,
        action: 'review_taxes',
        priority: 'low',
        recommendations: [
          {
            label: 'Consultar contador',
            description: 'Verifique se há regime tributário mais vantajoso',
          },
        ],
      });
    }
  }

  // ===== INSIGHTS POSITIVOS =====
  // Se margem está boa e não há problemas críticos
  if (
    calcData.margemLucro &&
    calcData.margemLucro >= 20 &&
    calcData.margemLucro <= 35
  ) {
    const problemasGraves = insights.filter(
      i => i.severity === 'critical' || i.severity === 'high'
    );

    if (problemasGraves.length === 0) {
      insights.push({
        type: 'success',
        severity: 'low',
        message: `🎯 Excelente! Margem de ${calcData.margemLucro.toFixed(
          1
        )}% está ideal. Preço competitivo e lucrativo.`,
        data: calcData,
        action: 'celebrate',
        priority: 'low',
      });
    }
  }

  // Retornar o insight de maior prioridade
  if (insights.length > 0) {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    insights.sort(
      (a, b) => priorityOrder[b.severity] - priorityOrder[a.severity]
    );

    return {
      generate: true,
      insight: insights[0],
    };
  }

  return { generate: false };
}

/**
 * Gera um insight e emite evento para exibição
 * Inclui recomendações e ações sugeridas
 */
function generateInsight(insight: any): void {
  // Preparar dados completos do insight
  const insightData = {
    type: insight.type,
    severity: insight.severity || 'medium',
    message: insight.message,
    action: insight.action,
    priority: insight.priority || 'medium',
    recommendations: insight.recommendations || [],
    data: insight.data,
    timestamp: Date.now(),
  };

  // Emitir evento de insight gerado para toasts
  emitEvent('insight:generated', insightData, {
    source: 'aiOrchestrator',
    priority: 10,
    metadata: {
      type: insight.type,
      action: insight.action,
      severity: insight.severity,
    },
  });

  // Log para debug
  console.log('🤖 Insight gerado:', {
    type: insight.type,
    severity: insight.severity,
    message: insight.message,
    recommendations: insight.recommendations?.length || 0,
  });
}

/**
 * Processa uma requisição do usuário (entrada principal do Modo Deus)
 */
export async function processRequest(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  // TODO: Implementar lógica de orquestração completa
  // TODO: Analisar intenção do usuário
  // TODO: Rotear para agentes apropriados
  // TODO: Agregar respostas

  return {
    requestId: request.id,
    response: 'Orquestrador ainda em desenvolvimento',
    agentsUsed: [],
    confidence: 0,
    timestamp: Date.now(),
  };
}

/**
 * Analisa a intenção do usuário e determina quais agentes devem ser acionados
 */
export async function analyzeIntent(
  message: string,
  context?: any
): Promise<Agent[]> {
  // TODO: Implementar análise de intenção com IA
  // TODO: Usar embeddings ou classificação para identificar intenção
  // TODO: Retornar agentes relevantes

  return [];
}

/**
 * Coordena múltiplos agentes para resolver uma requisição complexa
 */
export async function coordinateAgents(
  agents: Agent[],
  request: OrchestratorRequest
): Promise<any> {
  // TODO: Implementar coordenação de múltiplos agentes
  // TODO: Executar agentes em paralelo ou sequencial conforme necessário
  // TODO: Agregar resultados

  return null;
}

/**
 * Obtém ou cria o contexto de conversação para um usuário
 */
export function getConversationContext(userId: string): ConversationContext {
  let context = conversationContexts.get(userId);

  if (!context) {
    context = {
      userId,
      history: [],
      currentState: {},
    };
    conversationContexts.set(userId, context);
  }

  return context;
}

/**
 * Atualiza o contexto de conversação
 */
export function updateConversationContext(
  userId: string,
  request: OrchestratorRequest,
  response: OrchestratorResponse
): void {
  const context = getConversationContext(userId);

  context.history.push({ request, response });

  // Limitar histórico a 20 interações
  if (context.history.length > 20) {
    context.history.shift();
  }

  conversationContexts.set(userId, context);
}

/**
 * Atualiza configuração de insights
 */
export function updateInsightConfig(config: Partial<InsightConfig>): void {
  insightConfig = { ...insightConfig, ...config };
}
