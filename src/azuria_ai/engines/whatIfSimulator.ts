/**
 * What-If Simulator - Simulador de Cenários para Licitações
 *
 * Este simulador é responsável por:
 * - Simulações Monte Carlo de variações de preço
 * - Análise de sensibilidade multi-dimensional
 * - Cenários What-If (e se X aumentar Y%?)
 * - Análise de risco e probabilidades
 * - Otimização de margem vs probabilidade de vitória
 * - Stress testing de propostas
 *
 * @module azuria_ai/engines/whatIfSimulator
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Constants
// ============================================================================

/** Número de simulações Monte Carlo */
const MONTE_CARLO_ITERATIONS = 10000;

/** Níveis de confiança para intervalos */
const CONFIDENCE_LEVELS = [0.68, 0.95, 0.99]; // 1σ, 2σ, 3σ

/** Número máximo de variáveis simultâneas */
const _MAX_VARIABLES = 20;

// ============================================================================
// Types
// ============================================================================

/** Variável de entrada para simulação */
export interface SimulationVariable {
  /** Nome da variável */
  name: string;
  /** Valor base */
  baseValue: number;
  /** Tipo de distribuição */
  distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal';
  /** Parâmetros da distribuição */
  params: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
    mode?: number; // Para triangular
  };
  /** Unidade */
  unit?: string;
  /** Correlação com outras variáveis */
  correlations?: Record<string, number>; // -1 a 1
}

/** Resultado de simulação Monte Carlo */
export interface MonteCarloResult {
  /** Variável simulada */
  variable: string;
  /** Estatísticas */
  stats: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
  /** Percentis */
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  /** Intervalos de confiança */
  confidenceIntervals: Array<{
    level: number; // 0.68, 0.95, 0.99
    lower: number;
    upper: number;
  }>;
  /** Histograma (bins) */
  histogram: Array<{
    binStart: number;
    binEnd: number;
    count: number;
    frequency: number;
  }>;
  /** Todas as amostras (se solicitado) */
  samples?: number[];
}

/** Cenário What-If */
export interface WhatIfScenario {
  /** ID do cenário */
  id: string;
  /** Nome descritivo */
  name: string;
  /** Descrição */
  description?: string;
  /** Mudanças nas variáveis */
  changes: Array<{
    variable: string;
    type: 'percentage' | 'absolute';
    value: number; // Ex: +10 (%) ou +1000 (absoluto)
  }>;
  /** Resultado calculado */
  result?: {
    totalCost: number;
    totalPrice: number;
    margin: number;
    marginPercent: number;
    bdi: number;
    delta: {
      cost: number;
      price: number;
      margin: number;
    };
  };
}

/** Análise de sensibilidade */
export interface SensitivityAnalysis {
  /** Variável analisada */
  variable: string;
  /** Impacto em outras variáveis */
  impacts: Array<{
    targetVariable: string;
    elasticity: number; // % mudança em target / % mudança em source
    correlation: number; // -1 a 1
    sensitivity: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  }>;
  /** Pontos de teste */
  testPoints: Array<{
    variationPercent: number; // Ex: -20%, -10%, 0%, +10%, +20%
    resultValue: number;
    resultDelta: number;
  }>;
}

/** Análise de risco */
export interface RiskAnalysis {
  /** Probabilidade de diferentes faixas de resultado */
  probabilityDistribution: Array<{
    outcome: string; // Ex: "Prejuízo", "Margem < 5%", "Margem > 10%"
    probability: number;
    range: { min: number; max: number };
  }>;
  /** VaR (Value at Risk) */
  valueAtRisk: {
    p95: number; // 95% de chance de perder no máximo isso
    p99: number;
  };
  /** Expected Shortfall (CVaR) */
  expectedShortfall: {
    p95: number; // Perda média no pior 5% dos casos
    p99: number;
  };
  /** Métricas de risco */
  metrics: {
    probabilityOfLoss: number; // Chance de prejuízo
    probabilityOfWinning: number; // Chance de vencer licitação
    sharpeRatio: number; // Retorno/Risco
    expectedValue: number;
  };
}

/** Otimização de margem */
export interface MarginOptimization {
  /** Margem ótima encontrada */
  optimalMargin: number;
  /** BDI correspondente */
  optimalBDI: number;
  /** Probabilidade de vitória */
  winProbability: number;
  /** Valor esperado */
  expectedValue: number;
  /** Curva de trade-off */
  tradeoffCurve: Array<{
    margin: number;
    bdi: number;
    winProb: number;
    expectedValue: number;
  }>;
  /** Recomendação */
  recommendation: {
    strategy: 'conservative' | 'balanced' | 'aggressive';
    reasoning: string[];
    risks: string[];
  };
}

/** Configuração do simulador */
export interface SimulatorConfig {
  /** Número de iterações Monte Carlo */
  iterations: number;
  /** Seed para reprodutibilidade */
  seed?: number;
  /** Se deve retornar todas as amostras */
  returnSamples: boolean;
  /** Número de bins no histograma */
  histogramBins: number;
  /** Níveis de confiança */
  confidenceLevels: number[];
}

/** Estado do simulador */
interface SimulatorState {
  initialized: boolean;
  config: SimulatorConfig;
  simulationsRun: number;
  lastSimulationAt: number;
}

// ============================================================================
// State
// ============================================================================

const state: SimulatorState = {
  initialized: false,
  config: {
    iterations: MONTE_CARLO_ITERATIONS,
    returnSamples: false,
    histogramBins: 50,
    confidenceLevels: CONFIDENCE_LEVELS,
  },
  simulationsRun: 0,
  lastSimulationAt: 0,
};

// ============================================================================
// Random Number Generation
// ============================================================================

/**
 * Gerador de números aleatórios com seed (para reprodutibilidade)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    // Linear Congruential Generator (LCG)
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  normal(mean: number = 0, stdDev: number = 1): number {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  uniform(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  triangular(min: number, mode: number, max: number): number {
    const u = this.next();
    const fc = (mode - min) / (max - min);
    
    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  lognormal(mean: number, stdDev: number): number {
    const normal = this.normal(mean, stdDev);
    return Math.exp(normal);
  }
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Calcula média
 */
function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calcula mediana
 */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calcula desvio padrão
 */
function stdDev(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = mean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calcula percentil
 */
function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calcula skewness (assimetria)
 */
function skewness(values: number[]): number {
  const avg = mean(values);
  const std = stdDev(values);
  const n = values.length;
  
  const sumCubedDeviations = values.reduce((sum, val) => {
    return sum + Math.pow((val - avg) / std, 3);
  }, 0);
  
  return (n / ((n - 1) * (n - 2))) * sumCubedDeviations;
}

/**
 * Calcula kurtosis (curtose)
 */
function kurtosis(values: number[]): number {
  const avg = mean(values);
  const std = stdDev(values);
  const n = values.length;
  
  const sumQuarticDeviations = values.reduce((sum, val) => {
    return sum + Math.pow((val - avg) / std, 4);
  }, 0);
  
  return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sumQuarticDeviations - 
         (3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3)));
}

/**
 * Calcula correlação de Pearson
 */
function _correlation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error('Arrays must have same length');
  }

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Cria histograma
 */
function createHistogram(values: number[], bins: number): MonteCarloResult['histogram'] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;
  
  const histogram: MonteCarloResult['histogram'] = [];
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    
    histogram.push({
      binStart,
      binEnd,
      count,
      frequency: count / values.length,
    });
  }
  
  return histogram;
}

// ============================================================================
// Monte Carlo Simulation
// ============================================================================

/**
 * Executa simulação Monte Carlo
 */
export async function runMonteCarloSimulation(
  variables: SimulationVariable[],
  formula: (values: Record<string, number>) => number,
  config?: Partial<SimulatorConfig>
): Promise<MonteCarloResult> {
  
  const simConfig = { ...state.config, ...config };
  const rng = new SeededRandom(simConfig.seed);
  const samples: number[] = [];

  structuredLogger.info('[WhatIfSimulator] Starting Monte Carlo simulation', {
    data: {
      variables: variables.length,
      iterations: simConfig.iterations,
    },
  });

  // Executar iterações
  for (let i = 0; i < simConfig.iterations; i++) {
    const values: Record<string, number> = {};
    
    // Gerar valor para cada variável
    for (const variable of variables) {
      let value: number;
      
      switch (variable.distribution) {
        case 'normal':
          value = rng.normal(
            variable.params.mean ?? variable.baseValue,
            variable.params.stdDev ?? variable.baseValue * 0.1
          );
          break;
        
        case 'uniform':
          value = rng.uniform(
            variable.params.min ?? variable.baseValue * 0.8,
            variable.params.max ?? variable.baseValue * 1.2
          );
          break;
        
        case 'triangular':
          value = rng.triangular(
            variable.params.min ?? variable.baseValue * 0.8,
            variable.params.mode ?? variable.baseValue,
            variable.params.max ?? variable.baseValue * 1.2
          );
          break;
        
        case 'lognormal':
          value = rng.lognormal(
            Math.log(variable.baseValue),
            variable.params.stdDev ?? 0.2
          );
          break;
        
        default:
          value = variable.baseValue;
      }
      
      values[variable.name] = value;
    }
    
    // Calcular resultado usando a fórmula
    const result = formula(values);
    samples.push(result);
  }

  // Calcular estatísticas
  const sortedSamples = [...samples].sort((a, b) => a - b);
  const avg = mean(samples);
  const std = stdDev(samples);
  
  const result: MonteCarloResult = {
    variable: 'result',
    stats: {
      mean: avg,
      median: median(samples),
      stdDev: std,
      min: sortedSamples[0],
      max: sortedSamples.at(-1) ?? sortedSamples[0],
      variance: std * std,
      skewness: skewness(samples),
      kurtosis: kurtosis(samples),
    },
    percentiles: {
      p5: percentile(samples, 5),
      p10: percentile(samples, 10),
      p25: percentile(samples, 25),
      p50: percentile(samples, 50),
      p75: percentile(samples, 75),
      p90: percentile(samples, 90),
      p95: percentile(samples, 95),
    },
    confidenceIntervals: simConfig.confidenceLevels.map(level => ({
      level,
      lower: avg - level * std,
      upper: avg + level * std,
    })),
    histogram: createHistogram(samples, simConfig.histogramBins),
    samples: simConfig.returnSamples ? samples : undefined,
  };

  state.simulationsRun++;
  state.lastSimulationAt = Date.now();

  eventBus.emit('user:calculation', {
    iterations: simConfig.iterations,
    mean: avg,
    stdDev: std,
    timestamp: Date.now(),
  });

  structuredLogger.info('[WhatIfSimulator] Monte Carlo completed', {
    data: {
      iterations: simConfig.iterations,
      mean: avg,
      stdDev: std,
      duration: Date.now() - state.lastSimulationAt,
    },
  });

  return result;
}

// ============================================================================
// What-If Analysis
// ============================================================================

/**
 * Executa análise What-If
 */
export async function analyzeWhatIfScenarios(
  baseValues: Record<string, number>,
  scenarios: WhatIfScenario[],
  calculator: (values: Record<string, number>) => {
    totalCost: number;
    totalPrice: number;
    margin: number;
    bdi: number;
  }
): Promise<WhatIfScenario[]> {
  
  structuredLogger.info('[WhatIfSimulator] Analyzing What-If scenarios', {
    data: {
      scenarios: scenarios.length,
    },
  });

  const results: WhatIfScenario[] = [];

  // Calcular baseline
  const baseline = calculator(baseValues);

  // Para cada cenário
  for (const scenario of scenarios) {
    const modifiedValues = { ...baseValues };
    
    // Aplicar mudanças
    for (const change of scenario.changes) {
      const currentValue = baseValues[change.variable];
      
      if (change.type === 'percentage') {
        modifiedValues[change.variable] = currentValue * (1 + change.value / 100);
      } else {
        modifiedValues[change.variable] = currentValue + change.value;
      }
    }
    
    // Calcular resultado
    const result = calculator(modifiedValues);
    
    results.push({
      ...scenario,
      result: {
        ...result,
        marginPercent: (result.margin / result.totalCost) * 100,
        delta: {
          cost: result.totalCost - baseline.totalCost,
          price: result.totalPrice - baseline.totalPrice,
          margin: result.margin - baseline.margin,
        },
      },
    });
  }

  eventBus.emit('user:calculation', {
    scenarios: results.length,
    timestamp: Date.now(),
  });

  return results;
}

// ============================================================================
// Sensitivity Analysis
// ============================================================================

/**
 * Executa análise de sensibilidade
 */
export async function analyzeSensitivity(
  baseValues: Record<string, number>,
  targetVariable: string,
  testVariables: string[],
  calculator: (values: Record<string, number>) => number,
  variationPercent: number[] = [-20, -10, -5, 0, 5, 10, 20]
): Promise<SensitivityAnalysis[]> {
  
  structuredLogger.info('[WhatIfSimulator] Analyzing sensitivity', {
    data: {
      targetVariable,
      testVariables: testVariables.length,
    },
  });

  const results: SensitivityAnalysis[] = [];
  const baselineResult = calculator(baseValues);

  for (const variable of testVariables) {
    const testPoints: SensitivityAnalysis['testPoints'] = [];
    
    // Testar diferentes variações
    for (const variation of variationPercent) {
      const modifiedValues = { ...baseValues };
      modifiedValues[variable] = baseValues[variable] * (1 + variation / 100);
      
      const result = calculator(modifiedValues);
      const delta = result - baselineResult;
      
      testPoints.push({
        variationPercent: variation,
        resultValue: result,
        resultDelta: delta,
      });
    }
    
    // Calcular elasticidade (usando pontos +10% e -10%)
    const plus10 = testPoints.find(p => p.variationPercent === 10);
    const minus10 = testPoints.find(p => p.variationPercent === -10);
    
    let elasticity = 0;
    if (plus10 && minus10) {
      const deltaPercent = ((plus10.resultValue - minus10.resultValue) / baselineResult) / 0.2; // 20% variation
      elasticity = deltaPercent;
    }
    
    // Classificar sensibilidade
    const absElasticity = Math.abs(elasticity);
    let sensitivity: SensitivityAnalysis['impacts'][0]['sensitivity'];
    
    if (absElasticity > 2) {
      sensitivity = 'very_high';
    } else if (absElasticity > 1) {
      sensitivity = 'high';
    } else if (absElasticity > 0.5) {
      sensitivity = 'medium';
    } else if (absElasticity > 0.1) {
      sensitivity = 'low';
    } else {
      sensitivity = 'very_low';
    }
    
    results.push({
      variable,
      impacts: [{
        targetVariable,
        elasticity,
        correlation: elasticity > 0 ? 1 : -1, // Simplificado
        sensitivity,
      }],
      testPoints,
    });
  }

  eventBus.emit('user:calculation', {
    variables: results.length,
    timestamp: Date.now(),
  });

  return results;
}

// ============================================================================
// Risk Analysis
// ============================================================================

/**
 * Executa análise de risco
 */
export async function analyzeRisk(
  monteCarlo: MonteCarloResult,
  competitorPrices?: number[]
): Promise<RiskAnalysis> {
  
  const samples = monteCarlo.samples || [];
  if (samples.length === 0) {
    throw new Error('Monte Carlo samples are required for risk analysis');
  }

  const sortedSamples = [...samples].sort((a, b) => a - b);
  const sampleMean = monteCarlo.stats.mean;
  
  // Probabilidade de prejuízo (preço < custo)
  const lossCount = samples.filter(s => s < 0).length;
  const probabilityOfLoss = lossCount / samples.length;
  
  // VaR e CVaR
  const var95 = percentile(samples, 5);
  const var99 = percentile(samples, 1);
  
  const worst5Percent = sortedSamples.slice(0, Math.floor(samples.length * 0.05));
  const worst1Percent = sortedSamples.slice(0, Math.floor(samples.length * 0.01));
  
  const cvar95 = mean(worst5Percent);
  const cvar99 = mean(worst1Percent);
  
  // Probabilidade de vencer (se temos preços dos concorrentes)
  let probabilityOfWinning = 0.5; // Default
  
  if (competitorPrices && competitorPrices.length > 0) {
    const avgCompetitorPrice = mean(competitorPrices);
    const winsCount = samples.filter(s => s < avgCompetitorPrice).length;
    probabilityOfWinning = winsCount / samples.length;
  }
  
  // Sharpe Ratio (simplificado)
  const riskFreeRate = 0; // Assumindo 0 para simplificar
  const excessReturn = sampleMean - riskFreeRate;
  const sharpeRatio = excessReturn / monteCarlo.stats.stdDev;
  
  // Distribuição de probabilidades
  const probabilityDistribution: RiskAnalysis['probabilityDistribution'] = [
    {
      outcome: 'Prejuízo',
      probability: probabilityOfLoss,
      range: { min: sortedSamples[0], max: 0 },
    },
    {
      outcome: 'Margem < 5%',
      probability: samples.filter(s => s > 0 && s < sampleMean * 0.05).length / samples.length,
      range: { min: 0, max: sampleMean * 0.05 },
    },
    {
      outcome: 'Margem 5-10%',
      probability: samples.filter(s => s >= sampleMean * 0.05 && s < sampleMean * 0.1).length / samples.length,
      range: { min: sampleMean * 0.05, max: sampleMean * 0.1 },
    },
    {
      outcome: 'Margem > 10%',
      probability: samples.filter(s => s >= sampleMean * 0.1).length / samples.length,
      range: { min: sampleMean * 0.1, max: sortedSamples.at(-1) ?? sortedSamples[0] },
    },
  ];

  const result: RiskAnalysis = {
    probabilityDistribution,
    valueAtRisk: {
      p95: var95,
      p99: var99,
    },
    expectedShortfall: {
      p95: cvar95,
      p99: cvar99,
    },
    metrics: {
      probabilityOfLoss,
      probabilityOfWinning,
      sharpeRatio,
      expectedValue: sampleMean,
    },
  };

  structuredLogger.info('[WhatIfSimulator] Risk analysis completed', {
    data: {
      probabilityOfLoss,
      probabilityOfWinning,
      sharpeRatio,
    },
  });

  return result;
}

// ============================================================================
// Margin Optimization
// ============================================================================

/**
 * Otimiza margem para maximizar valor esperado
 */
export async function optimizeMargin(
  baseCost: number,
  competitorPrices: number[],
  marginRange: { min: number; max: number; step: number }
): Promise<MarginOptimization> {
  
  structuredLogger.info('[WhatIfSimulator] Optimizing margin');

  const tradeoffCurve: MarginOptimization['tradeoffCurve'] = [];
  let bestMargin = marginRange.min;
  let bestExpectedValue = -Infinity;

  // Testar diferentes margens
  for (let margin = marginRange.min; margin <= marginRange.max; margin += marginRange.step) {
    const price = baseCost * (1 + margin / 100);
    
    // Calcular probabilidade de vencer
    const winsCount = competitorPrices.filter(cp => price < cp).length;
    const winProb = winsCount / competitorPrices.length;
    
    // Valor esperado = Probabilidade * Margem
    const expectedValue = winProb * (price - baseCost);
    
    // BDI estimado
    const bdi = margin;
    
    tradeoffCurve.push({
      margin,
      bdi,
      winProb,
      expectedValue,
    });
    
    if (expectedValue > bestExpectedValue) {
      bestExpectedValue = expectedValue;
      bestMargin = margin;
    }
  }

  const optimal = tradeoffCurve.find(t => t.margin === bestMargin);
  if (!optimal) {
    throw new Error(`Could not find optimal margin ${bestMargin} in tradeoff curve`);
  }

  // Determinar estratégia
  let strategy: MarginOptimization['recommendation']['strategy'];
  let reasoning: string[];
  let risks: string[];

  if (optimal.winProb > 0.7) {
    strategy = 'aggressive';
    reasoning = [
      'Alta probabilidade de vitória permite margem maior',
      'Concorrentes têm preços significativamente mais altos',
      'Oportunidade de maximizar lucro mantendo competitividade',
    ];
    risks = [
      'Concorrente pode ajustar preço de última hora',
      'Margem alta pode chamar atenção em auditoria',
    ];
  } else if (optimal.winProb > 0.4) {
    strategy = 'balanced';
    reasoning = [
      'Probabilidade moderada requer equilíbrio entre lucro e competitividade',
      'Margem permite flexibilidade em negociação',
      'Risco controlado com retorno adequado',
    ];
    risks = [
      'Concorrência acirrada',
      'Pode ser necessário ajuste fino antes do envio',
    ];
  } else {
    strategy = 'conservative';
    reasoning = [
      'Concorrência muito forte exige preço agressivo',
      'Priorizar vitória sobre margem neste caso',
      'Construir relacionamento com órgão para futuras licitações',
    ];
    risks = [
      'Margem baixa pode resultar em prejuízo se houver imprevistos',
      'Difícil justificar valores muito baixos',
    ];
  }

  const result: MarginOptimization = {
    optimalMargin: bestMargin,
    optimalBDI: optimal.bdi,
    winProbability: optimal.winProb,
    expectedValue: bestExpectedValue,
    tradeoffCurve,
    recommendation: {
      strategy,
      reasoning,
      risks,
    },
  };

  eventBus.emit('user:calculation', {
    optimalMargin: bestMargin,
    winProbability: optimal.winProb,
    timestamp: Date.now(),
  });

  structuredLogger.info('[WhatIfSimulator] Margin optimization completed', {
    data: {
      optimalMargin: bestMargin,
      winProbability: optimal.winProb,
      strategy,
    },
  });

  return result;
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o simulador
 */
export function initWhatIfSimulator(config?: Partial<SimulatorConfig>): void {
  if (state.initialized) {
    structuredLogger.warn('[WhatIfSimulator] Already initialized');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  state.initialized = true;

  eventBus.emit('system:init', {
    config: state.config,
    timestamp: Date.now(),
  });

  structuredLogger.info('[WhatIfSimulator] Initialized');
}

/**
 * Estatísticas
 */
export function getSimulatorStats(): {
  simulationsRun: number;
  lastSimulationAt: number;
  config: SimulatorConfig;
} {
  return {
    simulationsRun: state.simulationsRun,
    lastSimulationAt: state.lastSimulationAt,
    config: state.config,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  initWhatIfSimulator,
  runMonteCarloSimulation,
  analyzeWhatIfScenarios,
  analyzeSensitivity,
  analyzeRisk,
  optimizeMargin,
  getSimulatorStats,
};
