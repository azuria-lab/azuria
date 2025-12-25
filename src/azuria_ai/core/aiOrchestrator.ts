/**
 * AI Orchestrator - "Modo Deus"
 *
 * Roteador central que coordena toda a inteligência artificial da Azuria.
 * Processa eventos reativos e decide quando gerar insights automáticos.
 */

import type { Agent } from './agents';
import { type AzuriaEvent, emitEvent, on } from './eventBus';
import type { CalcData } from '../hooks/useCalcWatcher';
import { detectIntent, predictNextStep } from '../engines/userIntentEngine';
import { generatePredictiveInsight } from '../engines/predictiveInsightEngine';
import { dispatchAction } from '../engines/autonomousActionsEngine';
import {
  detectAnomalies,
  detectPatterns,
  generateForecast,
  updateMemory as updateCognitiveMemory,
} from '../engines/cognitiveEngine';
import {
  adaptInterface,
  inferEmotion,
  inferIntent as inferSocialIntent,
  updateUserModel,
} from '../engines/socialEngine';
import { adjustPlan, executePlan, generatePlan, setGoal } from '../engines/metaPlannerEngine';
import { updateState } from '../engines/operationalStateEngine';
import { analyzeAndAdjust, runEvolutionCycle } from '../engines/continuousImprovementEngine';
import { runConsistencyCheck } from '../engines/consistencyEngine';
import {
  computeTrends,
  detectTemporalAnomaly,
  predictFutureState,
  recordTemporalEvent,
} from '../engines/temporalEngine';
import { processSocialPresence } from '../engines/socialPresenceEngine';
import { proposeAdaptiveUX } from '../engines/adaptiveUXEngine';
import { analyzeRevenueOpportunity } from '../engines/revenueIntelligenceEngine';
import { runPaywallExperiment } from '../engines/smartPaywallEngine';
import { rewriteWithBrandVoice } from '../engines/brandVoiceEngine';
import {
  getEmotionState,
  inferUserEmotion,
  respondWithConfidenceBoost,
  respondWithEmpathy,
  respondWithEncouragement,
  respondWithReassurance,
  respondWithSimplification,
} from '../engines/affectiveEngine';
import { analyzeBehavior } from '../engines/behaviorEngine';
import {
  blockIfOutsideScope,
  correctIfUnsafe,
  downgradeSeverityIfNeeded,
  validateInsight,
} from '../engines/cognitiveGovernanceEngine';
import { recordDecision, recordInsightHistory } from '../engines/decisionAuditEngine';
import { enforceEthics } from '../engines/ethicalGuardEngine';
import { applySafetyBreak, checkCriticalBoundaries, detectRunawayBehavior } from '../engines/safetyLimitsEngine';
import { updateCognitiveMap } from '../engines/integratedCoreEngine';
import {
  emitTruthAlert,
  ensureTruthAfterAction,
  ensureTruthBeforeAction,
} from '../engines/truthEngine';
import {
  predictFailure as predictStabilityFailure,
} from '../engines/stabilityEngine';
import { processMetaLayers } from '../engines/metaLayerEngine';
import { CreatorEngine } from '../engines/creatorEngine';
import { initCreatorListener } from '../../server/creatorListener';
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
  context?: Record<string, unknown>;
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
  currentState: Record<string, unknown>;
}

export interface InsightConfig {
  minMargin?: number; // Margem mínima para alertar
  maxMargin?: number; // Margem máxima para sugerir otimização
  minPrice?: number; // Preço mínimo aceitável
  enableAutoInsights?: boolean; // Se deve gerar insights automaticamente
}

/** Parameter interface for generateInsight function */
interface GenerateInsightParam {
  message?: string;
  userState?: unknown;
  data?: { userState?: unknown };
  state?: { load?: unknown; actionsPerMinute?: unknown };
  contradictions?: unknown;
  loops?: unknown;
  actions?: unknown[];
  eventLog?: unknown[];
  userHistory?: unknown[];
  brandTone?: string;
  signals?: unknown;
  metrics?: unknown;
  context?: unknown;
  goals?: unknown;
  risks?: unknown;
  scenarios?: unknown;
  intent?: unknown;
  reality?: unknown;
  type?: string;
  severity?: string;
  persona?: unknown;
  action?: string;
  priority?: string;
  recommendations?: unknown[];
  flowData?: unknown;
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
const creator = new CreatorEngine();

// Timer de loop temporal (permite cleanup)
let temporalLoopTimer: ReturnType<typeof setInterval> | null = null;
let isOrchestratorInitialized = false;

// IDs das subscriptions para cleanup
const subscriptionIds: string[] = [];

/**
 * Inicializa o orchestrator e registra listeners de eventos
 */
export function initializeOrchestrator(config?: InsightConfig): void {
  // Prevenir múltiplas inicializações (silencioso - é comportamento esperado)
  if (isOrchestratorInitialized) {
    return;
  }

  if (config) {
    insightConfig = { ...insightConfig, ...config };
  }

  try {
    initCreatorListener();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Creator listener init failed (ignored in client env):', err);
  }

  // Registrar listener para eventos de cálculo básico
  subscriptionIds.push(
    on('calc:completed', handleCalculationEvent),
    on('calc:updated', handleCalculationUpdateEvent),
    on('calc:started', handleCalculationStartEvent),

    // Registrar listeners para calculadora avançada
    on('scenario:updated', handleScenarioEvent),
    on('fees:updated', handleFeesEvent),

    // Registrar listeners para calculadora tributária
    on('tax:updated', handleTaxEvent),
    on('icms:updated', handleICMSEvent),
    on('st:updated', handleSTEvent),

    // Registrar listeners para calculadora de licitações
    on('bid:updated', handleBidEvent),
    on('risk:updated', handleRiskEvent),
    on('discount:updated', handleDiscountEvent),

    // Registrar listeners para contexto de tela
    on('screen:changed', handleScreenChangedEvent),
    on('screen:dataUpdated', handleScreenDataUpdatedEvent),

    // Eventos da inteligência expandida
    on('ai:predictive-insight', handlePredictiveInsightEvent),
    on('ai:detected-risk', handleIntentSignalEvent),
    on('ai:detected-opportunity', handleIntentSignalEvent),
    on('ai:mind-snapshot', handleMindSnapshot),
    on('ai:reality-updated', handleRealityEvent),
    on('ai:truth-alert', handleTruthAlert),
    on('ai:stability-alert', handleStabilityAlert),
    on('system:tick', () => creator.runSystemScan())
  );

  // Meta-planner: iniciar objetivo default
  const defaultGoal = {
    id: 'meta-improve-precision',
    objective: 'melhorar precisão e reduzir falsos positivos',
    targetMetric: 'false_positive_rate',
    targetValue: 0.1,
  };
  setGoal(defaultGoal);
  generatePlan(defaultGoal);
  executePlan();

  // Loop temporal (polling leve) - com referência para cleanup
  temporalLoopTimer = setInterval(() => {
    runTemporalAnalysis('global', { heartbeat: true });
    runEvolutionCycle();
  }, 30000);

  isOrchestratorInitialized = true;
  // eslint-disable-next-line no-console
  console.log('[aiOrchestrator] Initialized successfully');
}

/**
 * Desliga o orchestrator e limpa recursos
 * Deve ser chamado antes de reinicializar ou ao desmontar o app
 */
export function shutdownOrchestrator(): void {
  if (!isOrchestratorInitialized) {
    return;
  }

  // Limpar timer do loop temporal
  if (temporalLoopTimer) {
    clearInterval(temporalLoopTimer);
    temporalLoopTimer = null;
  }

  // Remover todas as subscriptions de eventos
  subscriptionIds.forEach(_id => {
    // Unsubscribe each event listener
    // Note: EventBus should provide unsubscribe functionality
  });
  subscriptionIds.length = 0;

  isOrchestratorInitialized = false;
  // eslint-disable-next-line no-console
  console.log('[aiOrchestrator] Shutdown complete');
}

/**
 * Verifica se o orchestrator está inicializado
 */
export function isOrchestratorRunning(): boolean {
  return isOrchestratorInitialized;
}

/**
 * Processa evento de início de cálculo
 */
async function handleCalculationStartEvent(event: AzuriaEvent): Promise<void> {
  // Preparar contexto para análise
  const context = {
    timestamp: Date.now(),
    eventType: event.tipo,
    source: event.source,
  };
  // eslint-disable-next-line no-console
  console.log('Calculation started:', event, context);
}

/**
 * Processa evento de atualização de cálculo (inputs mudaram)
 */
async function handleCalculationUpdateEvent(event: AzuriaEvent): Promise<void> {
  const calcData = event.payload as CalcData;

  // Analisar se deve dar feedback em tempo real
  // Exemplo: verificar margem enquanto usuário digita
  const shouldProvideFeedback = calcData.margemLucro !== undefined;

  if (
    shouldProvideFeedback &&
    calcData.margemLucro < (insightConfig.minMargin || 10)
  ) {
    // Gerar insight de alerta
    generateInsight({
      type: 'warning',
      message: `Margem de lucro muito baixa (${calcData.margemLucro}%). Recomendamos pelo menos ${insightConfig.minMargin}%.`,
      data: calcData as unknown as { userState?: unknown },
      action: 'adjust_margin',
    });
  }

  handleIntentAndPrediction(event, calcData);
  updateCognitiveMemory('calc', calcData, event.source);
  detectPatterns();
  detectAnomalies();
  updateUserModel({ tipo: event.tipo, metadata: event.metadata, context: event.payload });
  updateState({ load: Math.min(1, Math.random() * 0.6 + 0.2) });
  runConsistencyCheck();
  analyzeAndAdjust();
  runTemporalAnalysis('calculation', event.payload);
  processSocialPresence(event);
  proposeAdaptiveUX({ intent: 'pricing', frequentPaths: ['calculadora', 'dashboard'] });
  analyzeRevenueOpportunity({ sessions: 5, clicks: 50, errors: 1, timeSpent: 600, paywallViews: 2, plan: 'free' });
  runPaywallExperiment('free', Math.floor(Math.random() * 3));
}

/**
 * Processa evento de cálculo completado
 * Decide se deve gerar insight automático
 */
async function handleCalculationEvent(event: AzuriaEvent): Promise<void> {
  if (!insightConfig.enableAutoInsights) {
    return;
  }

  analyzeBehavior({
    eventLog: event.payload?.events,
    flowData: event.payload?.flow,
    userState: event.payload?.userState,
    userHistory: event.payload?.history,
  });

  const calcData = event.payload as CalcData;

  handleIntentAndPrediction(event, calcData);
  updateCognitiveMemory('calc', calcData, event.source);
  detectPatterns();
  detectAnomalies();
  updateUserModel({ tipo: event.tipo, metadata: event.metadata, context: event.payload });
  updateState({ load: Math.min(1, Math.random() * 0.6 + 0.2) });
  runConsistencyCheck();
  analyzeAndAdjust();
  runTemporalAnalysis('calculation', event.payload);
  processSocialPresence(event);
  proposeAdaptiveUX({ intent: 'pricing', frequentPaths: ['calculadora', 'dashboard'] });
  analyzeRevenueOpportunity({ sessions: 8, clicks: 80, errors: 0, timeSpent: 800, paywallViews: 3, plan: 'free' });
  runPaywallExperiment('free', Math.floor(Math.random() * 3));

  // Avaliar o cálculo e decidir se deve gerar insight
  const shouldGenerateInsight = await evaluateCalculation(calcData);

  if (shouldGenerateInsight.generate) {
    generateInsight(shouldGenerateInsight.insight);
  }
}

function handleIntentAndPrediction(event: AzuriaEvent, calcData: CalcData) {
  const intent = detectIntent(event, calcData);
  const prediction = generatePredictiveInsight({ ...calcData, event });
  const socialIntent = inferSocialIntent({ tipo: event.tipo, context: event.payload });
  const emotion = inferEmotion({ tipo: event.tipo, metadata: event.metadata });
  analyzeBehavior({
    eventLog: [event.payload],
    flowData: event.payload?.flow,
    userState: event.payload?.userState,
    userHistory: event.payload?.history,
  });

  if (prediction) {
    emitEvent(
      'ui:displayInsight',
      { insightId: prediction.id, type: 'forecast' },
      { source: 'aiOrchestrator', priority: 6 }
    );
    updateCognitiveMemory('prediction', prediction, 'predictiveInsightEngine');
  }

  if (intent.intentConfidence >= 0.4) {
    const nextStep = predictNextStep(calcData);
    updateCognitiveMemory('intent', intent, 'userIntentEngine');
    emitEvent(
      'ai:recommended-action',
      {
        intentCategory: intent.category,
        intentConfidence: intent.intentConfidence,
        nextStep: nextStep.nextStep,
        context: calcData,
        socialIntent,
        emotion,
      },
      { source: 'aiOrchestrator', priority: 5 }
    );

    // Disparar ações autônomas seguras (apenas sugestão)
    dispatchAction(emitEvent, calcData as Record<string, unknown> as import('../engines/autonomousActionsEngine').ActionContext);
  }

  // Gerar previsões cognitivas adicionais
  generateForecast();

  // Adaptar interface conforme modelo social
  const adaptation = adaptInterface();
  emitEvent(
    'ui:adaptive-interface-changed',
    { adaptation },
    { source: 'aiOrchestrator', priority: 4 }
  );

  // Meta-planner feedback loop baseado em confiança global
  const feedbackScore = Math.max(0, Math.min(1, intent.intentConfidence || 0.5));
  adjustPlan(feedbackScore);
}

function runTemporalAnalysis(scope: 'user' | 'calculation' | 'session' | 'global', payload: Record<string, unknown>) {
  recordTemporalEvent(scope, 'event', payload);
  const trend = computeTrends(scope);
  const prediction = predictFutureState(scope);
  const anomaly = detectTemporalAnomaly(scope);

  // Log trends and predictions for monitoring
  if (trend || prediction) {
    // eslint-disable-next-line no-console
    console.debug('Temporal analysis:', { scope, trend, prediction });
  }

  if (anomaly) {
    emitEvent(
      'insight:generated',
      {
        type: 'warning',
        severity: 'critical',
        message: 'Padrão quebrado detectado — risco de inconsistência futura.',
        sourceModule: 'temporalEngine',
      },
      { source: 'aiOrchestrator', priority: 9 }
    );
  }
}

function handlePredictiveInsightEvent(event: AzuriaEvent) {
  // Bridge para UI já ocorre via emit no engine; aqui apenas garante prioridade
  emitEvent(
    'ui:displayInsight',
    { insightId: event.payload?.id, type: 'forecast' },
    { source: 'aiOrchestrator', priority: 7 }
  );
}

function handleIntentSignalEvent(event: AzuriaEvent) {
  // Apenas registrar/intensificar prioridade se necessário
  emitEvent(
    'ui:displayInsight',
    { insightId: event.payload?.id, alert: event.payload?.alert },
    { source: 'aiOrchestrator', priority: 4 }
  );
}

// ===== HELPER FUNCTIONS FOR evaluateCalculation =====
type InsightData = Record<string, unknown>;

function evaluateMargemLucro(calcData: CalcData): InsightData | null {
  if (calcData.margemLucro === undefined) {
    return null;
  }

  const minMargin = insightConfig.minMargin || 10;
  const maxMargin = insightConfig.maxMargin || 50;
  const margem = calcData.margemLucro;

  if (margem < minMargin) {
    const precoSugerido = calcData.custoProduto
      ? calcData.custoProduto * (1 + minMargin / 100)
      : null;
    return {
      type: 'warning',
      severity: 'high',
      message: `⚠️ Margem de ${margem.toFixed(1)}% está muito baixa! Recomendamos pelo menos ${minMargin}% para cobrir custos operacionais.`,
      data: calcData,
      action: 'increase_margin',
      priority: 'high',
      recommendations: [
        { label: 'Aumentar preço', value: precoSugerido, description: `Sugerimos R$ ${precoSugerido?.toFixed(2)} para margem de ${minMargin}%` },
        { label: 'Reduzir custos', description: 'Busque fornecedores mais competitivos' },
      ],
    };
  }

  if (margem >= 10 && margem < 15) {
    return {
      type: 'info',
      severity: 'medium',
      message: `💡 Margem de ${margem.toFixed(1)}% está no limite. Considere otimizar para aumentar rentabilidade.`,
      data: calcData,
      action: 'optimize_margin',
      priority: 'medium',
      recommendations: [{ label: 'Otimizar preço', description: 'Pequeno ajuste pode aumentar lucro significativamente' }],
    };
  }

  if (margem >= 15 && margem <= 20) {
    return {
      type: 'success',
      severity: 'low',
      message: `✅ Margem de ${margem.toFixed(1)}% está saudável! Preço competitivo e lucrativo.`,
      data: calcData,
      action: 'maintain',
      priority: 'low',
    };
  }

  if (margem > maxMargin) {
    return {
      type: 'suggestion',
      severity: 'medium',
      message: `💰 Margem de ${margem.toFixed(1)}% está muito alta. Você pode ser mais competitivo e vender mais.`,
      data: calcData,
      action: 'optimize_competitiveness',
      priority: 'medium',
      recommendations: [{ label: 'Reduzir preço estrategicamente', description: 'Aumente volume de vendas mantendo boa margem' }],
    };
  }

  return null;
}

function evaluateCustoVsPreco(calcData: CalcData): InsightData[] {
  const insights: InsightData[] = [];
  if (calcData.precoVenda === undefined || calcData.custoProduto === undefined) {
    return insights;
  }

  if (calcData.custoProduto >= calcData.precoVenda) {
    insights.push({
      type: 'warning',
      severity: 'critical',
      message: `🚨 ALERTA CRÍTICO! Custo (R$ ${calcData.custoProduto.toFixed(2)}) é maior que o preço de venda (R$ ${calcData.precoVenda.toFixed(2)}). Você terá PREJUÍZO!`,
      data: calcData,
      action: 'fix_pricing',
      priority: 'critical',
      recommendations: [
        { label: 'Aumentar preço imediatamente', value: calcData.custoProduto * 1.15, description: `Preço mínimo: R$ ${(calcData.custoProduto * 1.15).toFixed(2)}` },
        { label: 'Renegociar com fornecedor', description: 'Busque reduzir o custo do produto' },
      ],
    });
  } else {
    const markup = ((calcData.precoVenda - calcData.custoProduto) / calcData.custoProduto) * 100;
    if (markup < 20) {
      insights.push({
        type: 'warning',
        severity: 'high',
        message: `⚠️ Markup de apenas ${markup.toFixed(1)}% pode não cobrir custos operacionais, impostos e despesas.`,
        data: calcData,
        action: 'review_costs',
        priority: 'high',
        recommendations: [
          { label: 'Revisar todos os custos', description: 'Considere frete, impostos, comissões e operacional' },
          { label: 'Aumentar markup', description: 'Recomendamos pelo menos 30% de markup' },
        ],
      });
    }
  }

  return insights;
}

function evaluateFrete(calcData: CalcData): InsightData | null {
  if (!calcData.precoVenda || !calcData.custoProduto || !calcData.custoOperacional) {
    return null;
  }

  const lucroBase = calcData.precoVenda - calcData.custoProduto;
  const percentualFrete = (calcData.custoOperacional / lucroBase) * 100;

  if (percentualFrete > 35) {
    return {
      type: 'warning',
      severity: 'medium',
      message: `📦 Frete/custos operacionais (${percentualFrete.toFixed(1)}%) estão consumindo muito do seu lucro!`,
      data: calcData,
      action: 'optimize_shipping',
      priority: 'medium',
      recommendations: [
        { label: 'Negociar frete', description: 'Busque transportadoras mais econômicas' },
        { label: 'Repassar custo', description: 'Considere cobrar frete separadamente' },
      ],
    };
  }

  return null;
}

function evaluateTaxasMarketplace(calcData: CalcData): InsightData[] {
  const insights: InsightData[] = [];
  if (calcData.taxasMarketplace === undefined || calcData.taxasMarketplace <= 0) {
    return insights;
  }

  const lucroBase = calcData.precoVenda && calcData.custoProduto ? calcData.precoVenda - calcData.custoProduto : 0;
  if (lucroBase <= 0) {
    return insights;
  }

  const impactoTaxas = (calcData.taxasMarketplace / 100) * (calcData.precoVenda || 0);
  const percentualImpacto = (impactoTaxas / lucroBase) * 100;

  if (calcData.taxasMarketplace > 20) {
    insights.push({
      type: 'info',
      severity: 'medium',
      message: `🏪 Taxas de marketplace (${calcData.taxasMarketplace}%) são significativas. Considere outros canais de venda.`,
      data: calcData,
      action: 'compare_marketplaces',
      priority: 'medium',
      recommendations: [
        { label: 'Comparar marketplaces', description: 'Veja se outros canais têm taxas menores' },
        { label: 'Venda direta', description: 'Considere loja própria para maior margem' },
      ],
    });
  }

  if (percentualImpacto > 40) {
    insights.push({
      type: 'warning',
      severity: 'high',
      message: `💸 Taxas do marketplace estão consumindo ${percentualImpacto.toFixed(1)}% do seu lucro!`,
      data: calcData,
      action: 'review_marketplace_strategy',
      priority: 'high',
      recommendations: [
        { label: 'Ajustar preço', description: 'Aumente o preço para compensar as taxas' },
        { label: 'Mudar de canal', description: 'Avalie canais com taxas menores' },
      ],
    });
  }

  return insights;
}

function evaluateImpostos(calcData: CalcData): InsightData | null {
  if (calcData.impostos === undefined || calcData.impostos <= 0) {
    return null;
  }

  const impactoImpostos = calcData.precoVenda ? (calcData.impostos / 100) * calcData.precoVenda : 0;
  if (calcData.impostos > 30 && impactoImpostos > 0) {
    return {
      type: 'info',
      message: `📊 Carga tributária de ${calcData.impostos}% é alta. Certifique-se de que está incluída no preço.`,
      severity: 'low',
      data: calcData,
      action: 'review_taxes',
      priority: 'low',
      recommendations: [{ label: 'Consultar contador', description: 'Verifique se há regime tributário mais vantajoso' }],
    };
  }

  return null;
}

function evaluatePositiveInsight(calcData: CalcData, existingInsights: InsightData[]): InsightData | null {
  if (!calcData.margemLucro || calcData.margemLucro < 20 || calcData.margemLucro > 35) {
    return null;
  }

  const problemasGraves = existingInsights.filter(
    i => i.severity === 'critical' || i.severity === 'high'
  );

  if (problemasGraves.length === 0) {
    return {
      type: 'success',
      severity: 'low',
      message: `🎯 Excelente! Margem de ${calcData.margemLucro.toFixed(1)}% está ideal. Preço competitivo e lucrativo.`,
      data: calcData,
      action: 'celebrate',
      priority: 'low',
    };
  }

  return null;
}

function consolidateInsights(insights: InsightData[]): { generate: boolean; insight?: InsightData } {
  if (insights.length === 0) {
    return { generate: false };
  }

  const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  insights.sort((a, b) => (priorityOrder[b.severity as string] || 0) - (priorityOrder[a.severity as string] || 0));

  return { generate: true, insight: insights[0] };
}

/**
 * Avalia um cálculo e decide se deve gerar insight
 * Implementa lógica inteligente de análise
 */
async function evaluateCalculation(calcData: CalcData): Promise<{
  generate: boolean;
  insight?: InsightData;
}> {
  const insights: InsightData[] = [];

  // Evaluate margin
  const marginInsight = evaluateMargemLucro(calcData);
  if (marginInsight) {
    insights.push(marginInsight);
  }

  // Evaluate cost vs price
  insights.push(...evaluateCustoVsPreco(calcData));

  // Evaluate shipping
  const freteInsight = evaluateFrete(calcData);
  if (freteInsight) {
    insights.push(freteInsight);
  }

  // Evaluate marketplace fees
  insights.push(...evaluateTaxasMarketplace(calcData));

  // Evaluate taxes
  const taxInsight = evaluateImpostos(calcData);
  if (taxInsight) {
    insights.push(taxInsight);
  }

  // Evaluate positive insight
  const positiveInsight = evaluatePositiveInsight(calcData, insights);
  if (positiveInsight) {
    insights.push(positiveInsight);
  }

  return consolidateInsights(insights);
}


/**
 * Gera um insight e emite evento para exibição
 * Inclui recomendações e ações sugeridas
 */
function generateInsight(insight: GenerateInsightParam): void {
  const metaSnapshot = processMetaLayers({
    signals: insight?.signals,
    metrics: insight?.metrics,
    context: insight?.context,
    goals: insight?.goals,
    risks: insight?.risks,
    scenarios: insight?.scenarios,
    intent: insight?.intent,
    target: 'insight',
  });
  
  // Use metaSnapshot for logging
  // eslint-disable-next-line no-console
  console.debug('Meta snapshot:', metaSnapshot);
  
  // Preparar dados completos do insight
  const tone = (insight.brandTone || 'padrao') as import('../engines/brandVoiceEngine').ToneProfileKey;
  const refinedMessage = rewriteWithBrandVoice(insight.message ?? '', tone);
  const userStateValue = insight.userState || insight.data?.userState;
  if (userStateValue && typeof userStateValue === 'object' && userStateValue !== null) {
    inferUserEmotion(userStateValue as Record<string, unknown>, { payload: insight as Record<string, unknown> });
  }
  const preStability = predictStabilityFailure({ load: insight?.state?.load, contradictions: insight?.contradictions, loopsDetected: insight?.loops });
  if (preStability.risk >= 0.8) {
    emitEvent('ai:stability-alert', { severity: 'critical', riskLevel: preStability.risk, details: { stage: 'pre-insight' } }, { source: 'aiOrchestrator', priority: 10 });
    return;
  }
  if (!ensureTruthBeforeAction({ context: insight, state: insight.data })) {
    emitTruthAlert('critical', { reason: 'pre-check-failed', insight });
    return;
  }
  const emotionState = getEmotionState();
  // Governance validation
  const scopeCheck = blockIfOutsideScope(insight);
  if (scopeCheck.blocked === true || scopeCheck.valid === false) {
    emitEvent('ai:unsafe-output-blocked', { insight, reason: scopeCheck.reason }, { source: 'aiOrchestrator', priority: 10 });
    recordDecision({ insight, status: 'blocked', reason: scopeCheck.reason });
    return;
  }
  const ethics = enforceEthics(insight);
  if (ethics.blocked) {
    return;
  }
  checkCriticalBoundaries({ load: insight?.state?.load as number, actionsPerMinute: insight?.state?.actionsPerMinute as number });
  if (detectRunawayBehavior(insight?.actions || [])) {
    applySafetyBreak({ reason: 'runaway_behavior', state: insight?.state });
    return;
  }
  const postStability = predictStabilityFailure({ load: insight?.state?.load, contradictions: insight?.contradictions, loopsDetected: insight?.loops });
  if (postStability.risk >= 0.8) {
    emitEvent('ai:stability-alert', { severity: 'critical', riskLevel: postStability.risk, details: { stage: 'post-insight' } }, { source: 'aiOrchestrator', priority: 10 });
    return;
  }
  const validated = validateInsight(insight);
  let safeMessage = refinedMessage;
  if (!validated.valid) {
    safeMessage = correctIfUnsafe(refinedMessage);
  }
  const postTruthOk = ensureTruthAfterAction({ reality: insight?.reality, perceived: insight?.data });
  if (!postTruthOk) {
    emitTruthAlert('warning', { reason: 'post-check-failed', insight });
  }
  const downgraded = downgradeSeverityIfNeeded(insight);
  if (validated.corrected) {
    emitEvent('ai:decision-corrected', { insight }, { source: 'aiOrchestrator', priority: 7 });
  }
  if (insight?.eventLog || insight?.flowData || insight?.userHistory) {
    const behaviorSignals: import('../engines/behaviorEngine').BehaviorSignals = {
      eventLog: Array.isArray(insight.eventLog) ? (insight.eventLog as unknown[]) as import('../engines/behaviorEngine').EventLogEntry[] : undefined,
      flowData: (insight.flowData as unknown) as import('../engines/behaviorEngine').FlowData | undefined,
      userState: (insight.userState as unknown) as import('../engines/behaviorEngine').UserState | undefined,
      userHistory: Array.isArray(insight.userHistory) ? (insight.userHistory as unknown[]) as import('../engines/behaviorEngine').UserHistoryEntry[] : undefined,
    };
    analyzeBehavior(behaviorSignals);
  }
  let affectiveMessage: string | undefined;
  const emotionType = emotionState.type;
  const persona = typeof insight.persona === 'string' ? insight.persona : undefined;
  if (emotionType && persona) {
    switch (emotionType) {
      case 'frustration':
        affectiveMessage = respondWithSimplification({ persona });
        break;
      case 'hesitation':
        affectiveMessage = respondWithEncouragement({ persona });
        break;
      case 'confidence':
        affectiveMessage = respondWithConfidenceBoost({ persona });
        break;
      case 'confusion':
        affectiveMessage = respondWithReassurance({ persona });
        break;
      case 'achievement':
        affectiveMessage = respondWithEmpathy({ persona });
        break;
      default:
        break;
    }
  }
  const insightData = {
    type: insight.type,
    severity: downgraded.severity || insight.severity || 'medium',
    message: safeMessage,
    refinedMessage: safeMessage,
    brandTone: tone,
    persona: insight.persona,
    emotion: emotionState.type,
    emotionConfidence: emotionState.confidence,
    affectiveMessage,
    action: insight.action,
    priority: insight.priority || 'medium',
    recommendations: insight.recommendations || [],
    data: insight.data,
    timestamp: Date.now(),
  };

  recordInsightHistory(insightData);

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
  // eslint-disable-next-line no-console
  console.log('🤖 Insight gerado:', {
    type: insight.type,
    severity: insight.severity,
    message: insight.message,
    recommendations: insight.recommendations?.length || 0,
  });
}

function handleMindSnapshot(event: AzuriaEvent) {
  updateCognitiveMap(event.payload);
  resolveGlobalConflict(event.payload?.anomalies || []);
  assignDecisionAuthority(event.payload?.confidenceMap);
  broadcastUnifiedContext(event.payload);
}

function resolveGlobalConflict(conflicts: Record<string, unknown>[]) {
  if (conflicts && conflicts.length > 0) {
    emitEvent('ai:mind-warning', { conflicts }, { source: 'aiOrchestrator', priority: 7 });
  }
}

function assignDecisionAuthority(confidenceMap?: Record<string, number>) {
  if (!confidenceMap) {return;}
  const sorted = Object.entries(confidenceMap).sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const leader = sorted[0]?.[0];
  if (leader) {
    emitEvent('ai:governance-alert', { message: `Prioridade dada a ${leader}`, severity: 'info' }, { source: 'aiOrchestrator', priority: 4 });
  }
}

function broadcastUnifiedContext(snapshot: Record<string, unknown>) {
  emitEvent('ai:core-sync', { snapshot }, { source: 'aiOrchestrator', priority: 4 });
}

function handleRealityEvent(event: AzuriaEvent) {
  // Stub: Update reality model based on event
  // eslint-disable-next-line no-console
  console.debug('Reality event received:', event.payload);
}

function handleTruthAlert(event: AzuriaEvent) {
  recordDecision({ tipo: 'truth-alert', payload: event.payload });
}

function handleStabilityAlert(event: AzuriaEvent) {
  recordDecision({ tipo: 'stability-alert', payload: event.payload });
}

// Exposição da pipeline meta-layer em chamadas críticas
export function runMetaPipeline(input: Record<string, unknown>) {
  return processMetaLayers(input);
}

/**
 * Processa uma requisição do usuário (entrada principal do Modo Deus)
 */
export async function processRequest(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  // Implementar lógica de orquestração completa
  // Context and intention analysis prepared for future implementation
  const _context = request.context;
  // _context is prefixed with underscore to indicate it's intentionally unused

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
  _message: string,
  _context?: Record<string, unknown>
): Promise<Agent[]> {
  // Implementar análise de intenção com IA
  // Intent type and confidence prepared for future implementation
  
  // Retornar agentes relevantes
  return [];
}

/**
 * Coordena múltiplos agentes para resolver uma requisição complexa
 */
export async function coordinateAgents(
  agents: Agent[],
  request: OrchestratorRequest
): Promise<Record<string, unknown>> {
  // Implementar coordenação de múltiplos agentes
  const { context } = request;
  
  // Executar agentes em paralelo ou sequencial conforme necessário
  const results: Record<string, unknown>[] = [];
  
  // Agregar resultados
  return { results, context, agentCount: agents.length };
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
