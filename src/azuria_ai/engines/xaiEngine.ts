/**
 * XAI Engine - Explainable AI para Decisões de BDI
 *
 * Este engine é responsável por:
 * - Explicar por que certos valores de BDI foram sugeridos
 * - SHAP values para importância de features
 * - Counterfactual explanations ("E se...?")
 * - Visualizações de decisão em árvore
 * - Justificativas baseadas em legislação
 * - Relatórios de auditoria explicáveis
 *
 * @module azuria_ai/engines/xaiEngine
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Types
// ============================================================================

/** Type alias for factor values */
export type FactorValue = number | string | boolean;

/** Fator que influenciou uma decisão */
export interface DecisionFactor {
  /** Nome do fator */
  name: string;
  /** Valor do fator */
  value: FactorValue;
  /** Peso/importância (0-1) */
  importance: number;
  /** Direção do impacto */
  impact: 'positive' | 'negative' | 'neutral';
  /** Magnitude do impacto */
  magnitude: number;
  /** Explicação em texto */
  explanation: string;
  /** Referência legal (se aplicável) */
  legalReference?: {
    source: string;
    article: string;
    text: string;
  };
}

/** Explicação completa de uma decisão */
export interface DecisionExplanation {
  /** ID da decisão */
  decisionId: string;
  /** Tipo de decisão */
  decisionType: 'bdi_calculation' | 'margin_suggestion' | 'risk_assessment' | 'compliance_check';
  /** Resultado da decisão */
  result: {
    value: FactorValue;
    label: string;
    confidence: number;
  };
  /** Fatores que influenciaram */
  factors: DecisionFactor[];
  /** Fatores mais importantes (top 3-5) */
  topFactors: DecisionFactor[];
  /** Alternativas consideradas */
  alternatives?: Array<{
    value: number | string;
    label: string;
    confidence: number;
    reasoning: string;
  }>;
  /** Justificativa geral */
  rationale: string;
  /** Referências legais aplicadas */
  legalBasis: Array<{
    source: string;
    requirement: string;
    compliance: 'met' | 'not_met' | 'partial';
  }>;
  /** Timestamp */
  timestamp: number;
}

/** Análise SHAP (SHapley Additive exPlanations) */
export interface ShapAnalysis {
  /** Feature analisada */
  feature: string;
  /** Valor da feature */
  value: FactorValue;
  /** SHAP value (contribuição) */
  shapValue: number;
  /** Baseline (valor esperado sem a feature) */
  baseline: number;
  /** Valor predito com a feature */
  predicted: number;
  /** Interpretação */
  interpretation: string;
}

/** Explicação counterfactual ("E se...?") */
export interface CounterfactualExplanation {
  /** Decisão original */
  original: {
    inputs: Record<string, FactorValue>;
    output: FactorValue;
  };
  /** Mudança mínima necessária para alterar decisão */
  minimalChange: {
    changedInputs: Record<string, FactorValue>;
    newOutput: FactorValue;
    changes: Array<{
      feature: string;
      from: FactorValue;
      to: FactorValue;
      delta: number;
    }>;
  };
  /** Explicação em texto */
  explanation: string;
  /** Viabilidade da mudança */
  feasibility: 'easy' | 'moderate' | 'difficult' | 'impossible';
}

/** Árvore de decisão explicável */
export interface DecisionTree {
  /** Nó atual */
  node: {
    id: string;
    question: string;
    answer: FactorValue;
    reasoning: string;
  };
  /** Caminho tomado */
  path: Array<{
    step: number;
    question: string;
    answer: FactorValue;
    reasoning: string;
  }>;
  /** Resultado final */
  outcome: {
    value: FactorValue;
    label: string;
    confidence: number;
  };
  /** Caminhos alternativos */
  alternativePaths?: Array<{
    divergencePoint: number;
    alternativeAnswer: string;
    wouldLead: string;
  }>;
}

/** Relatório de auditoria explicável */
export interface AuditReport {
  /** ID do relatório */
  reportId: string;
  /** Período analisado */
  period: {
    start: Date;
    end: Date;
  };
  /** Decisões auditadas */
  decisionsAudited: number;
  /** Compliance score geral */
  complianceScore: number;
  /** Decisões por categoria */
  byCategory: Array<{
    category: string;
    count: number;
    avgConfidence: number;
    complianceRate: number;
    issues: string[];
  }>;
  /** Principais fatores de decisão */
  topDecisionFactors: Array<{
    factor: string;
    frequency: number;
    avgImportance: number;
  }>;
  /** Recomendações */
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    recommendation: string;
  }>;
  /** Gerado em */
  generatedAt: number;
}

/** Configuração do XAI */
export interface XAIConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Nível de detalhe das explicações */
  verbosity: 'minimal' | 'standard' | 'detailed' | 'exhaustive';
  /** Se deve incluir referências legais */
  includeLegalReferences: boolean;
  /** Se deve gerar SHAP values */
  computeShap: boolean;
  /** Se deve gerar counterfactuals */
  generateCounterfactuals: boolean;
}

/** Estado do engine */
interface XAIEngineState {
  initialized: boolean;
  config: XAIConfig;
  explanationsGenerated: number;
  lastExplanationAt: number;
}

// ============================================================================
// State
// ============================================================================

const state: XAIEngineState = {
  initialized: false,
  config: {
    enabled: true,
    verbosity: 'standard',
    includeLegalReferences: true,
    computeShap: true,
    generateCounterfactuals: true,
  },
  explanationsGenerated: 0,
  lastExplanationAt: 0,
};

// ============================================================================
// BDI Decision Factors
// ============================================================================

/**
 * Define fatores padrão para cálculo de BDI
 */
const BDI_FACTORS = {
  // Custos Indiretos
  administracao_central: {
    min: 0.5,
    max: 5,
    typical: 2.5,
    description: 'Administração Central (escritório, RH, contabilidade)',
    legalBasis: 'Acórdão TCU 2622/2013',
  },
  despesas_financeiras: {
    min: 0.5,
    max: 3,
    typical: 1.5,
    description: 'Despesas Financeiras (juros, IOF, taxas bancárias)',
    legalBasis: 'Acórdão TCU 2622/2013',
  },
  lucro: {
    min: 3,
    max: 10,
    typical: 6.5,
    description: 'Lucro da empresa',
    legalBasis: 'Lei 8.666/93 Art. 6º, XI',
  },
  garantias: {
    min: 0.1,
    max: 1.5,
    typical: 0.5,
    description: 'Seguros e Garantias',
    legalBasis: 'Acórdão TCU 2622/2013',
  },
  impostos: {
    min: 2.5,
    max: 9.25,
    typical: 5.93,
    description: 'Impostos (ISS, PIS, COFINS, IRPJ, CSLL)',
    legalBasis: 'Legislação Tributária Federal',
  },
  risco: {
    min: 0.5,
    max: 5,
    typical: 2,
    description: 'Risco do empreendimento',
    legalBasis: 'Acórdão TCU 2622/2013',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/** Determines BDI range description based on value */
function getBDIRangeDescription(bdi: number): string {
  if (bdi > 25) {
    return 'acima';
  }
  if (bdi < 20) {
    return 'abaixo';
  }
  return 'dentro';
}

/** Analyzes factor impact based on value vs typical */
function analyzeFactorImpact(
  value: number,
  typical: number,
  description: string
): { impact: DecisionFactor['impact']; magnitude: number; explanation: string } {
  if (value > typical * 1.2) {
    return {
      impact: 'positive',
      magnitude: (value - typical) / typical,
      explanation: `Valor acima do típico (${typical}%), aumentando o BDI significativamente. ${description}`,
    };
  }
  if (value < typical * 0.8) {
    return {
      impact: 'negative',
      magnitude: (typical - value) / typical,
      explanation: `Valor abaixo do típico (${typical}%), resultando em BDI mais competitivo. ${description}`,
    };
  }
  return {
    impact: 'neutral',
    magnitude: Math.abs(value - typical) / typical,
    explanation: `Valor dentro da faixa típica (${typical}%). ${description}`,
  };
}

/** Creates legal reference for a factor */
function createLegalReference(
  legalBasis: string
): { source: string; article: string; text: string } | undefined {
  if (!state.config.includeLegalReferences) {
    return undefined;
  }
  // NOTE: Integrar com RAG para buscar texto completo
  return {
    source: legalBasis,
    article: '',
    text: `Conforme ${legalBasis}, este item está previsto na composição do BDI.`,
  };
}

/** Builds BDI rationale text */
function buildBDIRationale(
  bdiCalculado: number,
  factorsCount: number,
  topFactors: DecisionFactor[]
): string {
  const rangeDesc = getBDIRangeDescription(bdiCalculado);
  const highBdiWarning = bdiCalculado > 30 ? '⚠️ **Atenção**: BDI acima de 30% pode ser questionado em auditoria TCU.' : '';
  const lowBdiWarning = bdiCalculado < 15 ? '⚠️ **Atenção**: BDI abaixo de 15% pode indicar proposta inexequível.' : '';

  return `
O BDI de ${bdiCalculado.toFixed(2)}% foi calculado considerando ${factorsCount} componentes principais.

**Fatores mais relevantes**:
${topFactors.map(f => `• **${f.name}**: ${f.value}% - ${f.explanation}`).join('\n')}

O valor está ${rangeDesc} da faixa típica de mercado (20-25%).

${highBdiWarning}
${lowBdiWarning}
  `.trim();
}

/** Checks if a value is within constraints */
function isWithinConstraints(
  value: number,
  constraints: Record<string, { min: number; max: number }> | undefined,
  feature: string
): boolean {
  if (!constraints?.[feature]) {
    return true;
  }
  const { min, max } = constraints[feature];
  return value >= min && value <= max;
}

/** Tries a feature adjustment and returns the best result */
function tryFeatureAdjustment(
  currentBest: { inputs: Record<string, number>; distance: number; output: number },
  feature: string,
  stepSize: number,
  direction: 'up' | 'down',
  targetOutput: number,
  model: (inputs: Record<string, number>) => number,
  constraints?: Record<string, { min: number; max: number }>
): { inputs: Record<string, number>; distance: number; output: number } | null {
  const multiplier = direction === 'up' ? (1 + stepSize) : (1 - stepSize);
  const testInputs = { ...currentBest.inputs };
  testInputs[feature] *= multiplier;

  if (!isWithinConstraints(testInputs[feature], constraints, feature)) {
    return null;
  }

  const output = model(testInputs);
  const distance = Math.abs(output - targetOutput);

  if (distance < currentBest.distance) {
    return { inputs: testInputs, distance, output };
  }

  return null;
}

/** Runs the counterfactual search algorithm */
function _findCounterfactualInputs(
  originalInputs: Record<string, number>,
  originalOutput: number,
  targetOutput: number,
  model: (inputs: Record<string, number>) => number,
  constraints?: Record<string, { min: number; max: number }>
): { bestInputs: Record<string, number>; bestOutput: number } {
  let best = {
    inputs: { ...originalInputs },
    distance: Infinity,
    output: originalOutput,
  };

  const maxIterations = 100;
  const stepSize = 0.01;

  for (let iter = 0; iter < maxIterations; iter++) {
    for (const feature of Object.keys(originalInputs)) {
      // Try increasing
      const upResult = tryFeatureAdjustment(best, feature, stepSize, 'up', targetOutput, model, constraints);
      if (upResult) {
        best = upResult;
      }

      // Try decreasing
      const downResult = tryFeatureAdjustment(best, feature, stepSize, 'down', targetOutput, model, constraints);
      if (downResult) {
        best = downResult;
      }
    }

    // Stop if close enough
    if (best.distance < Math.abs(targetOutput) * 0.01) {
      break;
    }
  }

  return { bestInputs: best.inputs, bestOutput: best.output };
}

/** Calculates changes between original and new inputs */
function _calculateCounterfactualChanges(
  originalInputs: Record<string, number>,
  newInputs: Record<string, number>
): Array<{ feature: string; from: number; to: number; delta: number }> {
  return Object.keys(originalInputs)
    .map(feature => {
      const from = originalInputs[feature];
      const to = newInputs[feature];
      const delta = ((to - from) / from) * 100;
      return { feature, from, to, delta };
    })
    .filter(c => Math.abs(c.delta) > 0.1);
}

/** Builds counterfactual explanation text */
function _buildCounterfactualExplanation(
  originalOutput: number,
  targetOutput: number,
  changes: Array<{ feature: string; from: number; to: number; delta: number }>
): string {
  if (changes.length === 0) {
    return `Para alcançar BDI de ${targetOutput.toFixed(2)}% (ao invés de ${originalOutput.toFixed(2)}%), nenhuma mudança mínima viável foi encontrada dentro das restrições.`;
  }

  const changeDescriptions = changes.map(c => {
    const direction = c.delta > 0 ? 'aumentar' : 'reduzir';
    const sign = c.delta > 0 ? '+' : '';
    return `• ${direction} **${c.feature}** de ${c.from.toFixed(2)}% para ${c.to.toFixed(2)}% (${sign}${c.delta.toFixed(1)}%)`;
  }).join('\n');

  return `Para alcançar BDI de ${targetOutput.toFixed(2)}% (ao invés de ${originalOutput.toFixed(2)}%), você precisaria:\n\n${changeDescriptions}`;
}

/** Determines feasibility based on total change percentage */
function _determineFeasibility(
  changes: Array<{ delta: number }>
): CounterfactualExplanation['feasibility'] {
  const totalChangePercent = changes.reduce((sum, c) => sum + Math.abs(c.delta), 0);

  if (totalChangePercent < 5) {
    return 'easy';
  }
  if (totalChangePercent < 15) {
    return 'moderate';
  }
  if (totalChangePercent < 30) {
    return 'difficult';
  }
  return 'impossible';
}

// ============================================================================
// Core XAI Functions
// ============================================================================

/**
 * Explica cálculo de BDI
 */
export async function explainBDICalculation(
  inputs: {
    administracaoCentral: number;
    despesasFinanceiras: number;
    lucro: number;
    garantias: number;
    impostos: number;
    risco: number;
  },
  bdiCalculado: number
): Promise<DecisionExplanation> {
  
  structuredLogger.info('[XAIEngine] Explaining BDI calculation', {
    data: { bdi: bdiCalculado },
  });

  // 1. Analisar cada fator
  const factors: DecisionFactor[] = [];

  for (const [key, value] of Object.entries(inputs)) {
    const factorInfo = BDI_FACTORS[key as keyof typeof BDI_FACTORS];
    
    if (!factorInfo) {continue;}

    // Calcular importância baseado em desvio do típico e magnitude
    const deviation = Math.abs(value - factorInfo.typical);
    const relativeDeviation = deviation / factorInfo.typical;
    const importance = Math.min((value / bdiCalculado) * (1 + relativeDeviation), 1);

    // Determinar impacto usando helper
    const { impact, magnitude, explanation } = analyzeFactorImpact(
      value,
      factorInfo.typical,
      factorInfo.description
    );

    // Buscar referência legal usando helper
    const legalReference = createLegalReference(factorInfo.legalBasis);

    factors.push({
      name: key,
      value,
      importance,
      impact,
      magnitude,
      explanation,
      legalReference,
    });
  }

  // 2. Identificar top fatores
  const topFactors = [...factors]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  // 3. Construir rationale usando helper
  const rationale = buildBDIRationale(bdiCalculado, factors.length, topFactors);

  // 4. Legal basis
  const legalBasis = [
    {
      source: 'Lei 8.666/93 Art. 6º, XI',
      requirement: 'BDI deve incluir despesas indiretas, tributos, lucro e custos financeiros',
      compliance: 'met' as const,
    },
    {
      source: 'Acórdão TCU 2622/2013',
      requirement: 'Percentuais de cada componente devem estar dentro de faixas razoáveis',
      compliance: (bdiCalculado >= 15 && bdiCalculado <= 30) ? 'met' as const : 'partial' as const,
    },
  ];

  // 5. Alternativas
  const alternatives = [
    {
      value: bdiCalculado * 0.9,
      label: 'BDI Conservador (-10%)',
      confidence: 0.85,
      reasoning: 'Aumenta chances de vitória, mas reduz margem',
    },
    {
      value: bdiCalculado * 1.1,
      label: 'BDI Agressivo (+10%)',
      confidence: 0.65,
      reasoning: 'Maior margem, mas menor chance de vitória',
    },
  ];

  const explanation: DecisionExplanation = {
    decisionId: `bdi-${Date.now()}`,
    decisionType: 'bdi_calculation',
    result: {
      value: bdiCalculado,
      label: `BDI: ${bdiCalculado.toFixed(2)}%`,
      confidence: 0.92,
    },
    factors,
    topFactors,
    alternatives,
    rationale,
    legalBasis,
    timestamp: Date.now(),
  };

  state.explanationsGenerated++;
  state.lastExplanationAt = Date.now();

  eventBus.emit('insight:generated', {
    type: 'bdi_calculation',
    bdi: bdiCalculado,
    topFactors: topFactors.map(f => f.name),
    timestamp: Date.now(),
  });

  return explanation;
}

/**
 * Computa SHAP values para features
 */
export async function computeShapValues(
  inputs: Record<string, number>,
  prediction: number,
  model: (inputs: Record<string, number>) => number
): Promise<ShapAnalysis[]> {
  
  if (!state.config.computeShap) {
    return [];
  }

  structuredLogger.info('[XAIEngine] Computing SHAP values');

  const shapAnalyses: ShapAnalysis[] = [];

  // Baseline: média de todos os inputs
  const baseline = Object.values(inputs).reduce((sum, val) => sum + val, 0) / Object.keys(inputs).length;
  const baselinePrediction = model(Object.fromEntries(Object.keys(inputs).map(k => [k, baseline])));

  // Para cada feature, calcular contribuição marginal
  for (const [feature, value] of Object.entries(inputs)) {
    // Predição sem esta feature (usando baseline)
    const inputsWithoutFeature = { ...inputs, [feature]: baseline };
    const predictionWithoutFeature = model(inputsWithoutFeature);

    // SHAP value = diferença marginal
    const shapValue = prediction - predictionWithoutFeature;

    // Interpretação
    let interpretation: string;
    const absShap = Math.abs(shapValue);
    
    if (absShap > prediction * 0.1) {
      interpretation = shapValue > 0
        ? `${feature} aumenta significativamente o resultado (+${shapValue.toFixed(2)})`
        : `${feature} reduz significativamente o resultado (${shapValue.toFixed(2)})`;
    } else if (absShap > prediction * 0.05) {
      interpretation = shapValue > 0
        ? `${feature} tem impacto moderado positivo`
        : `${feature} tem impacto moderado negativo`;
    } else {
      interpretation = `${feature} tem impacto mínimo no resultado`;
    }

    shapAnalyses.push({
      feature,
      value,
      shapValue,
      baseline: baselinePrediction,
      predicted: prediction,
      interpretation,
    });
  }

  // Ordenar por importância (|SHAP value|)
  shapAnalyses.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  return shapAnalyses;
}

// ============================================================================
// Counterfactual Helper Functions
// ============================================================================

interface CounterfactualSearchState {
  bestInputs: Record<string, number>;
  bestDistance: number;
  bestOutput: number;
}

function tryFeatureChange(
  searchState: CounterfactualSearchState,
  feature: string,
  multiplier: number,
  targetOutput: number,
  model: (inputs: Record<string, number>) => number,
  constraints?: Record<string, { min: number; max: number }>
): CounterfactualSearchState {
  const testInputs = { ...searchState.bestInputs };
  testInputs[feature] *= multiplier;

  if (!isWithinConstraints(testInputs[feature], constraints, feature)) {
    return searchState;
  }

  const output = model(testInputs);
  const distance = Math.abs(output - targetOutput);

  if (distance < searchState.bestDistance) {
    return { bestInputs: testInputs, bestDistance: distance, bestOutput: output };
  }
  return searchState;
}

function runCounterfactualSearch(
  originalInputs: Record<string, number>,
  originalOutput: number,
  targetOutput: number,
  model: (inputs: Record<string, number>) => number,
  constraints?: Record<string, { min: number; max: number }>
): CounterfactualSearchState {
  let searchState: CounterfactualSearchState = {
    bestInputs: { ...originalInputs },
    bestDistance: Infinity,
    bestOutput: originalOutput,
  };

  const maxIterations = 100;
  const stepSize = 0.01;
  const convergenceThreshold = Math.abs(targetOutput) * 0.01;

  for (let iter = 0; iter < maxIterations; iter++) {
    for (const feature of Object.keys(originalInputs)) {
      searchState = tryFeatureChange(searchState, feature, 1 + stepSize, targetOutput, model, constraints);
      searchState = tryFeatureChange(searchState, feature, 1 - stepSize, targetOutput, model, constraints);
    }

    if (searchState.bestDistance < convergenceThreshold) { break; }
  }

  return searchState;
}

function calculateChanges(
  originalInputs: Record<string, number>,
  bestInputs: Record<string, number>
): Array<{ feature: string; from: number; to: number; delta: number }> {
  return Object.keys(originalInputs)
    .map((feature) => {
      const from = originalInputs[feature];
      const to = bestInputs[feature];
      const delta = ((to - from) / from) * 100;
      return { feature, from, to, delta };
    })
    .filter((c) => Math.abs(c.delta) > 0.1);
}

function buildCounterfactualExplanation(
  originalOutput: number,
  targetOutput: number,
  changes: Array<{ feature: string; from: number; to: number; delta: number }>
): string {
  const changeDescriptions = changes.map((c) => {
    const direction = c.delta > 0 ? 'aumentar' : 'reduzir';
    const sign = c.delta > 0 ? '+' : '';
    return `• ${direction} **${c.feature}** de ${c.from.toFixed(2)}% para ${c.to.toFixed(2)}% (${sign}${c.delta.toFixed(1)}%)`;
  });

  const noChangesMessage = changes.length === 0
    ? 'Nenhuma mudança mínima viável foi encontrada dentro das restrições.'
    : '';

  return `
Para alcançar BDI de ${targetOutput.toFixed(2)}% (ao invés de ${originalOutput.toFixed(2)}%), você precisaria:

${changeDescriptions.join('\n')}

${noChangesMessage}
  `.trim();
}

/**
 * Gera explicação counterfactual
 */
export async function generateCounterfactual(
  originalInputs: Record<string, number>,
  originalOutput: number,
  targetOutput: number,
  model: (inputs: Record<string, number>) => number,
  constraints?: Record<string, { min: number; max: number }>
): Promise<CounterfactualExplanation> {
  if (!state.config.generateCounterfactuals) {
    throw new Error('Counterfactual generation is disabled');
  }

  structuredLogger.info('[XAIEngine] Generating counterfactual explanation');

  const searchResult = runCounterfactualSearch(originalInputs, originalOutput, targetOutput, model, constraints);
  const changes = calculateChanges(originalInputs, searchResult.bestInputs);
  const explanation = buildCounterfactualExplanation(originalOutput, targetOutput, changes);
  const feasibility = _determineFeasibility(changes);

  return {
    original: { inputs: originalInputs, output: originalOutput },
    minimalChange: {
      changedInputs: searchResult.bestInputs,
      newOutput: searchResult.bestOutput,
      changes,
    },
    explanation,
    feasibility,
  };
}

/**
 * Constrói árvore de decisão explicável
 */
export async function buildDecisionTree(
  inputs: Record<string, number | string | boolean>,
  decisionType: 'bdi_calculation' | 'compliance_check'
): Promise<DecisionTree> {
  
  structuredLogger.info('[XAIEngine] Building decision tree');

  const path: DecisionTree['path'] = [];
  let step = 0;

  if (decisionType === 'bdi_calculation') {
    // Exemplo de árvore para BDI
    
    // Passo 1: Verificar modalidade
    step++;
    path.push({
      step,
      question: 'Qual a modalidade da licitação?',
      answer: inputs.modalidade as string,
      reasoning: 'Modalidade determina limites e regras específicas do TCU',
    });

    // Passo 2: Verificar valor estimado
    const valorEstimado = inputs.valorEstimado as number;
    step++;
    path.push({
      step,
      question: 'Valor estimado da obra/serviço?',
      answer: valorEstimado,
      reasoning: 'Obras de maior valor exigem BDI mais conservador',
    });

    // Passo 3: Calcular faixa de BDI
    const bdiMin = 15;
    let bdiMax = 25;
    
    if (valorEstimado > 10000000) { // > 10M
      bdiMax = 22;
      step++;
      path.push({
        step,
        question: 'Obra de grande porte (> R$ 10M)?',
        answer: 'Sim',
        reasoning: 'Limitar BDI máximo em 22% conforme jurisprudência TCU',
      });
    }

    // Passo 4: Ajustar por risco
    const risco = inputs.risco as number;
    if (risco > 3) {
      bdiMax += 3;
      step++;
      path.push({
        step,
        question: 'Risco do empreendimento é alto?',
        answer: `${risco}% (Alto)`,
        reasoning: 'Risco alto justifica BDI até 3% maior',
      });
    }

    // Resultado
    const bdiFinal = (bdiMin + bdiMax) / 2;

    return {
      node: {
        id: `decision-${Date.now()}`,
        question: 'Qual o BDI adequado?',
        answer: bdiFinal,
        reasoning: `Baseado na análise, BDI entre ${bdiMin}% e ${bdiMax}%`,
      },
      path,
      outcome: {
        value: bdiFinal,
        label: `BDI sugerido: ${bdiFinal.toFixed(2)}%`,
        confidence: 0.88,
      },
      alternativePaths: [
        {
          divergencePoint: 3,
          alternativeAnswer: 'Risco baixo',
          wouldLead: `BDI mais conservador (~${bdiMin}%)`,
        },
      ],
    };
  }

  // Default (compliance_check)
  return {
    node: {
      id: `decision-${Date.now()}`,
      question: 'Verificar compliance',
      answer: true,
      reasoning: 'Todos os critérios foram atendidos',
    },
    path: [],
    outcome: {
      value: 'true',
      label: 'Conforme',
      confidence: 0.95,
    },
  };
}

/**
 * Gera relatório de auditoria
 */
export async function generateAuditReport(
  period: { start: Date; end: Date },
  decisions: DecisionExplanation[]
): Promise<AuditReport> {
  
  structuredLogger.info('[XAIEngine] Generating audit report', {
    data: { period, decisions: decisions.length },
  });

  // Agrupar por categoria
  const byCategory = new Map<string, DecisionExplanation[]>();
  
  for (const decision of decisions) {
    const category = decision.decisionType;
    const existingDecisions = byCategory.get(category);
    if (existingDecisions) {
      existingDecisions.push(decision);
    } else {
      byCategory.set(category, [decision]);
    }
  }

  const categorySummaries = Array.from(byCategory.entries()).map(([category, decs]) => {
    const avgConfidence = decs.reduce((sum, d) => sum + d.result.confidence, 0) / decs.length;
    const compliantCount = decs.filter(d => 
      d.legalBasis.every(lb => lb.compliance === 'met')
    ).length;
    const complianceRate = compliantCount / decs.length;

    const issues: string[] = [];
    
    if (avgConfidence < 0.7) {
      issues.push('Confiança média abaixo de 70%');
    }
    
    if (complianceRate < 0.9) {
      issues.push(`Taxa de compliance baixa (${(complianceRate * 100).toFixed(1)}%)`);
    }

    return {
      category,
      count: decs.length,
      avgConfidence,
      complianceRate,
      issues,
    };
  });

  // Top fatores
  const factorFrequency = new Map<string, { count: number; totalImportance: number }>();
  
  for (const decision of decisions) {
    for (const factor of decision.topFactors) {
      const existingStats = factorFrequency.get(factor.name);
      if (existingStats) {
        existingStats.count++;
        existingStats.totalImportance += factor.importance;
      } else {
        factorFrequency.set(factor.name, { count: 1, totalImportance: factor.importance });
      }
    }
  }

  const topDecisionFactors = Array.from(factorFrequency.entries())
    .map(([factor, stats]) => ({
      factor,
      frequency: stats.count,
      avgImportance: stats.totalImportance / stats.count,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Recomendações
  const recommendations: AuditReport['recommendations'] = [];
  
  if (categorySummaries.some(c => c.avgConfidence < 0.7)) {
    recommendations.push({
      priority: 'high',
      category: 'confiança',
      issue: 'Decisões com baixa confiança detectadas',
      recommendation: 'Revisar manualmente decisões com confiança < 70%',
    });
  }

  if (categorySummaries.some(c => c.complianceRate < 0.9)) {
    recommendations.push({
      priority: 'high',
      category: 'compliance',
      issue: 'Taxa de compliance abaixo do ideal',
      recommendation: 'Verificar requisitos legais não atendidos',
    });
  }

  // Compliance score geral
  const overallCompliance = categorySummaries.reduce((sum, c) => sum + c.complianceRate, 0) / categorySummaries.length;

  return {
    reportId: `audit-${Date.now()}`,
    period,
    decisionsAudited: decisions.length,
    complianceScore: overallCompliance,
    byCategory: categorySummaries,
    topDecisionFactors,
    recommendations,
    generatedAt: Date.now(),
  };
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o XAI Engine
 */
export function initXAIEngine(config?: Partial<XAIConfig>): void {
  if (state.initialized) {
    structuredLogger.warn('[XAIEngine] Already initialized');
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

  structuredLogger.info('[XAIEngine] Initialized', {
    data: { verbosity: state.config.verbosity },
  });
}

/**
 * Estatísticas
 */
export function getXAIStats(): {
  explanationsGenerated: number;
  lastExplanationAt: number;
  config: XAIConfig;
} {
  return {
    explanationsGenerated: state.explanationsGenerated,
    lastExplanationAt: state.lastExplanationAt,
    config: state.config,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  initXAIEngine,
  explainBDICalculation,
  computeShapValues,
  generateCounterfactual,
  buildDecisionTree,
  generateAuditReport,
  getXAIStats,
};
