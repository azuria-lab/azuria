/**
 * AdvancedAnalytics Engine - Motor de Analytics Avançado com ML
 *
 * Este engine é responsável por:
 * - Análise avançada de dados com técnicas de ML
 * - Reconhecimento de padrões complexos
 * - Detecção de anomalias e tendências
 * - Insights preditivos para admin
 * - Clustering e segmentação de usuários
 * - Análise de performance e otimizações
 *
 * @module azuria_ai/engines/analysisEngine
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Constants
// ============================================================================

/** Tamanho mínimo da janela para análise temporal */
const MIN_WINDOW_SIZE = 7; // dias

/** Threshold para detecção de anomalias (desvios padrão) */
const ANOMALY_THRESHOLD = 2.5;

/** Máximo de clusters para segmentação */
const _MAX_CLUSTERS = 10;

/** Intervalo de análise automática (ms) */
const AUTO_ANALYSIS_INTERVAL = 3600000; // 1 hora

/** Máximo de insights armazenados */
const MAX_INSIGHTS_STORED = 100;

// ============================================================================
// Types
// ============================================================================

/** Tipo de análise disponível */
export type AnalysisType =
  | 'trend' // Análise de tendências
  | 'anomaly' // Detecção de anomalias
  | 'pattern' // Reconhecimento de padrões
  | 'clustering' // Segmentação de usuários
  | 'prediction' // Previsões futuras
  | 'correlation' // Correlações entre variáveis
  | 'performance' // Análise de performance
  | 'optimization'; // Oportunidades de otimização

/** Prioridade do insight */
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

/** Confiança do insight */
export type InsightConfidence = 'low' | 'medium' | 'high';

/** Direção da tendência */
export type TrendDirection = 'up' | 'down' | 'stable';

/** Severidade (para anomalias e outros) */
export type Severity = 'low' | 'medium' | 'high';

/** Insight gerado pela análise */
export interface AnalysisInsight {
  /** ID único */
  id: string;
  /** Tipo de análise que gerou */
  type: AnalysisType;
  /** Título do insight */
  title: string;
  /** Descrição detalhada */
  description: string;
  /** Prioridade */
  priority: InsightPriority;
  /** Confiança */
  confidence: InsightConfidence;
  /** Métricas relacionadas */
  metrics: Record<string, number>;
  /** Timestamp da análise */
  timestamp: number;
  /** Recomendações de ação */
  recommendations?: string[];
  /** Dados brutos para referência */
  rawData?: unknown;
}

/** Resultado de análise de tendência */
export interface TrendAnalysis {
  /** Direção da tendência */
  direction: TrendDirection;
  /** Taxa de crescimento (%) */
  growthRate: number;
  /** Confiança da tendência */
  confidence: number;
  /** Projeção futura (próximos N períodos) */
  forecast?: number[];
}

/** Anomalia detectada */
export interface Anomaly {
  /** Timestamp da anomalia */
  timestamp: number;
  /** Valor esperado */
  expected: number;
  /** Valor observado */
  observed: number;
  /** Desvio em relação ao esperado */
  deviation: number;
  /** Severidade */
  severity: Severity;
  /** Possíveis causas */
  possibleCauses?: string[];
}

/** Cluster de usuários */
export interface UserCluster {
  /** ID do cluster */
  id: string;
  /** Nome do cluster */
  name: string;
  /** Descrição */
  description: string;
  /** Número de usuários */
  size: number;
  /** Características do cluster */
  characteristics: Record<string, number>;
  /** Centróide (média das características) */
  centroid: number[];
}

/** Configuração do engine */
export interface AnalysisEngineConfig {
  /** Se análise automática está habilitada */
  autoAnalysisEnabled: boolean;
  /** Intervalo de análise automática (ms) */
  autoAnalysisInterval: number;
  /** Tipos de análise habilitados */
  enabledAnalysisTypes: AnalysisType[];
  /** Threshold de anomalia */
  anomalyThreshold: number;
  /** Tamanho da janela temporal (dias) */
  windowSize: number;
}

/** Estado do engine */
interface AnalysisEngineState {
  initialized: boolean;
  config: AnalysisEngineConfig;
  insights: AnalysisInsight[];
  lastAnalysisAt: Record<AnalysisType, number>;
  autoAnalysisTimer: NodeJS.Timeout | null;
}

// ============================================================================
// State
// ============================================================================

const state: AnalysisEngineState = {
  initialized: false,
  config: {
    autoAnalysisEnabled: true,
    autoAnalysisInterval: AUTO_ANALYSIS_INTERVAL,
    enabledAnalysisTypes: ['trend', 'anomaly', 'pattern', 'performance'],
    anomalyThreshold: ANOMALY_THRESHOLD,
    windowSize: MIN_WINDOW_SIZE,
  },
  insights: [],
  lastAnalysisAt: {} as Record<AnalysisType, number>,
  autoAnalysisTimer: null,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calcula média de um array de números
 */
function mean(values: number[]): number {
  if (values.length === 0) {return 0;}
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calcula desvio padrão de um array
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) {return 0;}
  const avg = mean(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Calcula correlação de Pearson entre duas séries
 */
function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {return 0;}

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Regressão linear simples (retorna slope e intercept)
 */
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) {return { slope: 0, intercept: mean(values) };}

  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += Math.pow(x[i] - meanX, 2);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
}

/**
 * Gera ID único para insight
 */
function generateInsightId(): string {
  return `insight-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// Analysis Helper Functions
// ============================================================================

/**
 * Determina a direção da tendência baseado na taxa de crescimento
 */
function determineTrendDirection(growthRate: number): TrendDirection {
  if (Math.abs(growthRate) <= 1) {
    return 'stable';
  }
  return growthRate > 0 ? 'up' : 'down';
}

/**
 * Mapeia direção para título de tendência
 */
function getTrendTitle(direction: TrendDirection): string {
  const titles: Record<TrendDirection, string> = {
    up: 'Crescente',
    down: 'Decrescente',
    stable: 'Estável',
  };
  return `Tendência ${titles[direction]}`;
}

/**
 * Determina prioridade baseado na taxa de crescimento
 */
function getTrendPriority(growthRate: number): InsightPriority {
  const absRate = Math.abs(growthRate);
  if (absRate > 10) {return 'high';}
  if (absRate > 5) {return 'medium';}
  return 'low';
}

/**
 * Determina confiança baseado no valor
 */
function getConfidenceLevel(confidence: number): InsightConfidence {
  if (confidence > 0.8) {return 'high';}
  if (confidence > 0.5) {return 'medium';}
  return 'low';
}

/**
 * Obtém recomendações baseadas na direção
 */
function getTrendRecommendations(direction: TrendDirection): string[] {
  const recommendations: Record<TrendDirection, string[]> = {
    down: ['Investigar causas da queda', 'Considerar ações corretivas'],
    up: ['Capitalizar momentum', 'Preparar infraestrutura para crescimento'],
    stable: ['Monitorar estabilidade'],
  };
  return recommendations[direction];
}

/**
 * Determina severidade da anomalia baseado no desvio
 */
function getAnomalySeverity(deviation: number, threshold: number): Severity {
  if (deviation > threshold * 2) {return 'high';}
  if (deviation > threshold * 1.5) {return 'medium';}
  return 'low';
}

/**
 * Determina prioridade do insight de anomalia
 */
function getAnomalyPriority(anomalies: Anomaly[]): InsightPriority {
  if (anomalies.some((a) => a.severity === 'high')) {return 'critical';}
  if (anomalies.length > 3) {return 'high';}
  return 'medium';
}

/**
 * Determina força da correlação
 */
function getCorrelationStrength(corr: number): string {
  const absCorr = Math.abs(corr);
  if (absCorr > 0.7) {return 'forte';}
  if (absCorr > 0.4) {return 'moderada';}
  return 'fraca';
}

/**
 * Determina prioridade baseado na correlação
 */
function getCorrelationPriority(corr: number): InsightPriority {
  const absCorr = Math.abs(corr);
  if (absCorr > 0.7) {return 'high';}
  if (absCorr > 0.4) {return 'medium';}
  return 'low';
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analisa tendência em uma série temporal
 */
export function analyzeTrend(
  values: number[],
  _labels?: string[]
): TrendAnalysis & { insight: AnalysisInsight } {
  if (values.length < MIN_WINDOW_SIZE) {
    throw new Error(`Mínimo de ${MIN_WINDOW_SIZE} pontos necessários para análise de tendência`);
  }

  const { slope, intercept } = linearRegression(values);
  const avgValue = mean(values);

  // Calcular taxa de crescimento
  const growthRate = avgValue === 0 ? 0 : (slope / avgValue) * 100;

  // Determinar direção usando helper function
  const direction = determineTrendDirection(growthRate);

  // Calcular R² (coeficiente de determinação) como confiança
  const predicted = values.map((_, i) => slope * i + intercept);
  const residuals = values.map((v, i) => v - predicted[i]);
  const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
  const ssTot = values.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(1, rSquared));

  // Projeção futura (próximos 7 períodos)
  const forecast = Array.from({ length: 7 }, (_, i) => slope * (values.length + i) + intercept);

  // Criar insight usando helper functions
  const insight: AnalysisInsight = {
    id: generateInsightId(),
    type: 'trend',
    title: getTrendTitle(direction),
    description: `Taxa de crescimento de ${growthRate.toFixed(2)}% detectada nos últimos ${values.length} períodos`,
    priority: getTrendPriority(growthRate),
    confidence: getConfidenceLevel(confidence),
    metrics: {
      growthRate,
      confidence,
      avgValue,
      currentValue: values.at(-1) ?? 0,
      projectedValue: forecast[6],
    },
    timestamp: Date.now(),
    recommendations: getTrendRecommendations(direction),
  };

  structuredLogger.info('[AnalysisEngine] Trend analysis completed', {
    data: { direction, growthRate, confidence },
  });

  return { direction, growthRate, confidence, forecast, insight };
}

/**
 * Detecta anomalias em uma série temporal
 */
export function detectAnomalies(
  values: number[],
  threshold: number = ANOMALY_THRESHOLD
): { anomalies: Anomaly[]; insight: AnalysisInsight } {
  if (values.length < MIN_WINDOW_SIZE) {
    throw new Error(`Mínimo de ${MIN_WINDOW_SIZE} pontos necessários para detecção de anomalias`);
  }

  const avg = mean(values);
  const std = standardDeviation(values);

  const anomalies: Anomaly[] = [];

  values.forEach((value, index) => {
    const deviation = Math.abs((value - avg) / std);

    if (deviation > threshold) {
      const severity = getAnomalySeverity(deviation, threshold);

      anomalies.push({
        timestamp: Date.now() - (values.length - index - 1) * 86400000, // Aproximado
        expected: avg,
        observed: value,
        deviation,
        severity,
        possibleCauses: ['Evento excepcional', 'Erro de medição', 'Mudança estrutural'],
      });
    }
  });

  const insight: AnalysisInsight = {
    id: generateInsightId(),
    type: 'anomaly',
    title: `${anomalies.length} Anomalia(s) Detectada(s)`,
    description: `Detectadas ${anomalies.length} anomalias em ${values.length} pontos de dados`,
    priority: getAnomalyPriority(anomalies),
    confidence: std > 0 ? 'high' : 'medium',
    metrics: {
      totalAnomalies: anomalies.length,
      avgDeviation: mean(anomalies.map((a) => a.deviation)),
      highSeverityCount: anomalies.filter((a) => a.severity === 'high').length,
    },
    timestamp: Date.now(),
    recommendations: anomalies.length > 0 ? ['Investigar anomalias', 'Verificar dados'] : [],
    rawData: anomalies,
  };

  structuredLogger.info('[AnalysisEngine] Anomaly detection completed', {
    data: {
      anomalyCount: anomalies.length,
      highSeverity: anomalies.filter((a) => a.severity === 'high').length,
    },
  });

  return { anomalies, insight };
}

/**
 * Analisa correlação entre duas métricas
 */
export function analyzeCorrelation(
  metric1: number[],
  metric2: number[],
  metric1Name: string = 'Métrica 1',
  metric2Name: string = 'Métrica 2'
): { correlation: number; insight: AnalysisInsight } {
  if (metric1.length !== metric2.length || metric1.length < MIN_WINDOW_SIZE) {
    throw new Error('Métricas devem ter mesmo tamanho e mínimo de pontos');
  }

  const corr = correlation(metric1, metric2);
  const strength = getCorrelationStrength(corr);
  const direction = corr > 0 ? 'positiva' : 'negativa';

  const insight: AnalysisInsight = {
    id: generateInsightId(),
    type: 'correlation',
    title: `Correlação ${strength} ${direction}`,
    description: `${metric1Name} e ${metric2Name} apresentam correlação ${strength} ${direction} (r=${corr.toFixed(3)})`,
    priority: getCorrelationPriority(corr),
    confidence: 'high',
    metrics: {
      correlation: corr,
      absCorrelation: Math.abs(corr),
    },
    timestamp: Date.now(),
    recommendations:
      Math.abs(corr) > 0.7
        ? [`Explorar relação entre ${metric1Name} e ${metric2Name}`, 'Considerar ações coordenadas']
        : [],
  };

  structuredLogger.info('[AnalysisEngine] Correlation analysis completed', {
    data: {
      metric1Name,
      metric2Name,
      correlation: corr,
    },
  });

  return { correlation: corr, insight };
}

/**
 * Segmenta usuários em clusters (K-means simplificado)
 */
export function clusterUsers(
  userData: Array<{ userId: string; features: number[] }>,
  k: number = 3
): { clusters: UserCluster[]; insight: AnalysisInsight } {
  if (userData.length < k) {
    throw new Error(`Mínimo de ${k} usuários necessários para clustering`);
  }

  // Implementação simplificada de K-means
  const numFeatures = userData[0].features.length;

  // Inicializar centróides aleatoriamente
  let centroids = userData.slice(0, k).map((u) => [...u.features]);

  // Iterações de K-means (máximo 10)
  for (let iter = 0; iter < 10; iter++) {
    // Atribuir cada ponto ao centróide mais próximo
    const assignments = userData.map((user) => {
      const distances = centroids.map((centroid) => {
        return Math.sqrt(
          user.features.reduce((sum, val, i) => sum + Math.pow(val - centroid[i], 2), 0)
        );
      });
      return distances.indexOf(Math.min(...distances));
    });

    // Recalcular centróides
    const newCentroids = centroids.map((_, clusterIdx) => {
      const clusterPoints = userData.filter((_, i) => assignments[i] === clusterIdx);
      if (clusterPoints.length === 0) {return centroids[clusterIdx];}

      return Array.from({ length: numFeatures }, (_, featureIdx) => {
        return mean(clusterPoints.map((p) => p.features[featureIdx]));
      });
    });

    centroids = newCentroids;
  }

  // Criar clusters
  const assignments = userData.map((user) => {
    const distances = centroids.map((centroid) => {
      return Math.sqrt(
        user.features.reduce((sum, val, i) => sum + Math.pow(val - centroid[i], 2), 0)
      );
    });
    return distances.indexOf(Math.min(...distances));
  });

  const clusters: UserCluster[] = centroids.map((centroid, idx) => {
    const clusterUsers = userData.filter((_, i) => assignments[i] === idx);
    return {
      id: `cluster-${idx}`,
      name: `Segmento ${idx + 1}`,
      description: `Cluster de ${clusterUsers.length} usuários`,
      size: clusterUsers.length,
      characteristics: Object.fromEntries(centroid.map((val, i) => [`feature_${i}`, val])),
      centroid,
    };
  });

  const insight: AnalysisInsight = {
    id: generateInsightId(),
    type: 'clustering',
    title: `Usuários Segmentados em ${k} Clusters`,
    description: `${userData.length} usuários segmentados em ${k} grupos distintos`,
    priority: 'medium',
    confidence: 'medium',
    metrics: {
      totalUsers: userData.length,
      numClusters: k,
      avgClusterSize: mean(clusters.map((c) => c.size)),
    },
    timestamp: Date.now(),
    recommendations: ['Personalizar experiência por segmento', 'Analisar características únicas'],
    rawData: clusters,
  };

  structuredLogger.info('[AnalysisEngine] Clustering completed', {
    data: {
      totalUsers: userData.length,
      numClusters: k,
    },
  });

  return { clusters, insight };
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o AnalysisEngine
 */
export function initAnalysisEngine(config?: Partial<AnalysisEngineConfig>): void {
  if (state.initialized) {
    structuredLogger.warn('[AnalysisEngine] Already initialized');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  // Inicializar timestamps de última análise
  state.config.enabledAnalysisTypes.forEach((type) => {
    state.lastAnalysisAt[type] = 0;
  });

  // Iniciar análise automática se habilitado
  if (state.config.autoAnalysisEnabled) {
    startAutoAnalysis();
  }

  state.initialized = true;

  eventBus.emit('system:init', {
    config: state.config,
    timestamp: Date.now(),
  });

  structuredLogger.info('[AnalysisEngine] Initialized', {
    data: {
      autoAnalysisEnabled: state.config.autoAnalysisEnabled,
      enabledTypes: state.config.enabledAnalysisTypes,
    },
  });
}

/**
 * Inicia análise automática periódica
 */
function startAutoAnalysis(): void {
  if (state.autoAnalysisTimer) {
    clearInterval(state.autoAnalysisTimer);
  }

  state.autoAnalysisTimer = setInterval(() => {
    structuredLogger.debug('[AnalysisEngine] Running auto-analysis');
    eventBus.emit('data:updated', {
      timestamp: Date.now(),
      source: 'analysis-engine',
    });
  }, state.config.autoAnalysisInterval);
}

/**
 * Adiciona insight à lista
 */
export function addInsight(insight: AnalysisInsight): void {
  state.insights.unshift(insight);

  // Manter apenas os últimos N insights
  if (state.insights.length > MAX_INSIGHTS_STORED) {
    state.insights = state.insights.slice(0, MAX_INSIGHTS_STORED);
  }

  // Emitir evento
  eventBus.emit('insight:generated', {
    insight,
    timestamp: Date.now(),
  });

  structuredLogger.info('[AnalysisEngine] Insight added', {
    data: {
      type: insight.type,
      priority: insight.priority,
    },
  });
}

/**
 * Obtém insights recentes
 */
export function getRecentInsights(count: number = 10): AnalysisInsight[] {
  return state.insights.slice(0, count);
}

/**
 * Obtém insights por tipo
 */
export function getInsightsByType(type: AnalysisType): AnalysisInsight[] {
  return state.insights.filter((i) => i.type === type);
}

/**
 * Limpa insights antigos
 */
export function clearOldInsights(olderThanDays: number = 30): void {
  const threshold = Date.now() - olderThanDays * 86400000;
  const before = state.insights.length;
  state.insights = state.insights.filter((i) => i.timestamp > threshold);
  const removed = before - state.insights.length;

  structuredLogger.info('[AnalysisEngine] Old insights cleared', {
    data: {
      removed,
      remaining: state.insights.length,
    },
  });
}

/**
 * Para análise automática
 */
export function stopAutoAnalysis(): void {
  if (state.autoAnalysisTimer) {
    clearInterval(state.autoAnalysisTimer);
    state.autoAnalysisTimer = null;
    structuredLogger.info('[AnalysisEngine] Auto-analysis stopped');
  }
}

/**
 * Obtém estado atual do engine
 */
export function getAnalysisEngineState(): {
  initialized: boolean;
  config: AnalysisEngineConfig;
  insightCount: number;
  lastAnalysis: Record<AnalysisType, number>;
} {
  return {
    initialized: state.initialized,
    config: state.config,
    insightCount: state.insights.length,
    lastAnalysis: state.lastAnalysisAt,
  };
}

/**
 * Shutdown do engine
 */
export function shutdownAnalysisEngine(): void {
  stopAutoAnalysis();
  state.initialized = false;
  state.insights = [];
  state.lastAnalysisAt = {} as Record<AnalysisType, number>;

  eventBus.emit('system:shutdown', {
    timestamp: Date.now(),
  });

  structuredLogger.info('[AnalysisEngine] Shut down');
}

// ============================================================================
// Export
// ============================================================================

export default {
  initAnalysisEngine,
  analyzeTrend,
  detectAnomalies,
  analyzeCorrelation,
  clusterUsers,
  addInsight,
  getRecentInsights,
  getInsightsByType,
  clearOldInsights,
  getAnalysisEngineState,
  stopAutoAnalysis,
  shutdownAnalysisEngine,
};
