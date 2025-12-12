/**
 * NLPProcessorEngine - Motor de Processamento de Linguagem Natural
 * Modo Deus - Fase 5: NLP e Predição
 *
 * Responsabilidades:
 * - Extrair intenção de texto do usuário
 * - Detectar entidades (valores, percentuais, tipos)
 * - Classificar sentimento e urgência
 * - Sugerir correções e completar frases
 * - Normalizar entrada de dados
 *
 * @module azuria_ai/engines/nlpProcessorEngine
 */

import { eventBus } from '../events/eventBus';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Intenções que podem ser detectadas
 */
export type UserIntent =
  | 'calculate_price' // Quer calcular preço de venda
  | 'calculate_markup' // Quer calcular markup
  | 'calculate_margin' // Quer calcular margem
  | 'calculate_bdi' // Quer calcular BDI
  | 'understand_concept' // Quer entender um conceito
  | 'compare_values' // Quer comparar valores
  | 'get_help' // Precisa de ajuda
  | 'navigate' // Quer navegar para algum lugar
  | 'export_data' // Quer exportar dados
  | 'configure' // Quer configurar algo
  | 'unknown'; // Não identificado

/**
 * Tipos de entidades extraídas
 */
export type EntityType =
  | 'currency' // Valor monetário (R$ 100,00)
  | 'percentage' // Percentual (25%)
  | 'number' // Número genérico
  | 'calculator_type' // Tipo de calculadora
  | 'concept' // Conceito (markup, margem, BDI)
  | 'action' // Ação (calcular, exportar, etc)
  | 'time_reference' // Referência temporal
  | 'comparison'; // Comparação (maior, menor, igual)

/**
 * Entidade extraída do texto
 */
export interface ExtractedEntity {
  type: EntityType;
  value: string;
  normalizedValue: string | number;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

/**
 * Resultado da análise de intenção
 */
export interface IntentAnalysis {
  intent: UserIntent;
  confidence: number;
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  suggestedAction?: string;
}

/**
 * Correção sugerida
 */
export interface TextCorrection {
  original: string;
  corrected: string;
  type: 'spelling' | 'format' | 'value' | 'concept';
  confidence: number;
}

/**
 * Completação sugerida
 */
export interface TextCompletion {
  partial: string;
  suggestions: string[];
  context?: string;
}

// =============================================================================
// PATTERNS & DICTIONARIES
// =============================================================================

/**
 * Padrões de intenção com palavras-chave
 */
const INTENT_PATTERNS: Record<UserIntent, RegExp[]> = {
  calculate_price: [
    /pre[cç]o\s*(de\s*)?(venda|final)/i,
    /calcul(ar|e|o)\s*(o\s*)?pre[cç]o/i,
    /quanto\s*(devo|posso)\s*(cobrar|vender)/i,
    /valor\s*(de\s*)?venda/i,
  ],
  calculate_markup: [
    /markup/i,
    /mark[\s-]?up/i,
    /multiplicador/i,
    /fator\s*(de\s*)?multiplica/i,
  ],
  calculate_margin: [
    /margem/i,
    /lucro/i,
    /lucratividade/i,
    /rentabilidade/i,
    /quanto\s*(vou\s*)?ganhar/i,
  ],
  calculate_bdi: [
    /bdi/i,
    /bonifica[çc][ãa]o/i,
    /despesas\s*indiretas/i,
    /licita[çc][ãa]o/i,
    /obra\s*p[úu]blica/i,
  ],
  understand_concept: [
    /o\s*que\s*[ée]/i,
    /como\s*funciona/i,
    /me\s*expli(que|ca)/i,
    /qual\s*(a\s*)?diferen[çc]a/i,
    /entender/i,
    /significado/i,
  ],
  compare_values: [
    /compar(ar|e)/i,
    /diferen[çc]a\s*entre/i,
    /(maior|menor|melhor|pior)/i,
    /versus|vs\.?/i,
  ],
  get_help: [
    /ajuda/i,
    /socorro/i,
    /n[ãa]o\s*(sei|entendo|consigo)/i,
    /como\s*(fa[çc]o|uso)/i,
    /preciso\s*(de\s*)?ajuda/i,
  ],
  navigate: [
    /ir\s*para/i,
    /abrir/i,
    /acessar/i,
    /onde\s*(fica|est[áa])/i,
    /mostrar/i,
  ],
  export_data: [
    /export(ar|e)/i,
    /baixar/i,
    /download/i,
    /salvar\s*(em|como)/i,
    /pdf|excel|csv/i,
  ],
  configure: [
    /configur(ar|e)/i,
    /ajust(ar|e)/i,
    /alter(ar|e)/i,
    /mud(ar|e)/i,
    /prefer[êe]ncia/i,
  ],
  unknown: [],
};

/**
 * Padrões para extração de entidades
 */
const ENTITY_PATTERNS: Record<EntityType, RegExp> = {
  currency: /R\$\s*[\d.,]+|[\d.,]+\s*reais?/gi,
  percentage: /[\d.,]+\s*%|[\d.,]+\s*por\s*cento/gi,
  number: /\b[\d.,]+\b/g,
  calculator_type: /markup|margem|bdi|pre[çc]o|custo|imposto|tributo/gi,
  concept: /markup|margem|lucro|bdi|custo|despesa|receita|faturamento/gi,
  action: /calcul(ar|e)|export(ar|e)|compar(ar|e)|entender|ajuda/gi,
  time_reference: /hoje|ontem|amanh[ãa]|semana|m[êe]s|ano|di[áa]rio/gi,
  comparison: /maior|menor|igual|melhor|pior|mais|menos/gi,
};

/**
 * Dicionário de correções comuns
 */
const CORRECTIONS: Record<string, string> = {
  margem: 'margem',
  marjem: 'margem',
  markap: 'markup',
  marcap: 'markup',
  markop: 'markup',
  preco: 'preço',
  preso: 'preço',
  cuato: 'custo',
  costo: 'custo',
  licitacao: 'licitação',
  licitaçao: 'licitação',
  porcentagem: 'porcentagem',
  porsentagem: 'porcentagem',
  calculo: 'cálculo',
  calculho: 'cálculo',
};

/**
 * Sinônimos para normalização
 */
const SYNONYMS: Record<string, string[]> = {
  margem: ['lucro', 'lucratividade', 'rentabilidade', 'ganho'],
  markup: ['multiplicador', 'fator', 'mark-up', 'mark up'],
  preço: ['valor', 'preço de venda', 'pvenda', 'pv'],
  custo: ['valor de custo', 'custo total', 'ct', 'gasto'],
  bdi: ['bonificação', 'despesas indiretas', 'b.d.i.'],
};

/**
 * Palavras que indicam sentimento negativo
 */
const NEGATIVE_WORDS = [
  'não', 'nunca', 'problema', 'erro', 'difícil', 'complicado',
  'confuso', 'frustrado', 'irritado', 'perdido', 'travado',
];

/**
 * Palavras que indicam urgência
 */
const URGENCY_WORDS = [
  'urgente', 'rápido', 'agora', 'imediato', 'logo', 'preciso',
  'necessário', 'importante', 'crítico', 'prazo',
];

// =============================================================================
// STATE
// =============================================================================

interface NLPState {
  initialized: boolean;
  customPatterns: Map<UserIntent, RegExp[]>;
  customCorrections: Map<string, string>;
  analysisHistory: IntentAnalysis[];
}

const state: NLPState = {
  initialized: false,
  customPatterns: new Map(),
  customCorrections: new Map(),
  analysisHistory: [],
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Inicializa o NLPProcessorEngine
 */
export function initNLPProcessor(): void {
  if (state.initialized) {return;}

  state.customPatterns.clear();
  state.customCorrections.clear();
  state.analysisHistory = [];
  state.initialized = true;

  console.log('[NLPProcessorEngine] Initialized');
}

/**
 * Adiciona padrões customizados de intenção
 */
export function addIntentPattern(intent: UserIntent, pattern: RegExp): void {
  const existing = state.customPatterns.get(intent) ?? [];
  existing.push(pattern);
  state.customPatterns.set(intent, existing);
}

/**
 * Adiciona correções customizadas
 */
export function addCorrection(wrong: string, correct: string): void {
  state.customCorrections.set(wrong.toLowerCase(), correct);
}

// =============================================================================
// INTENT DETECTION
// =============================================================================

/**
 * Analisa texto e detecta intenção
 */
export function analyzeText(text: string): IntentAnalysis {
  const normalizedText = normalizeText(text);

  // Detect intent
  const intent = detectIntent(normalizedText);

  // Extract entities
  const entities = extractEntities(normalizedText);

  // Analyze sentiment
  const sentiment = analyzeSentiment(normalizedText);

  // Detect urgency
  const urgency = detectUrgency(normalizedText);

  // Generate suggested action
  const suggestedAction = generateSuggestedAction(intent, entities);

  const analysis: IntentAnalysis = {
    intent: intent.intent,
    confidence: intent.confidence,
    entities,
    sentiment,
    urgency,
    suggestedAction,
  };

  // Store in history
  state.analysisHistory.unshift(analysis);
  if (state.analysisHistory.length > 100) {
    state.analysisHistory = state.analysisHistory.slice(0, 100);
  }

  // Emit event
  eventBus.emit({
    type: 'user:intent_detected',
    payload: {
      intent: analysis.intent,
      confidence: analysis.confidence,
      entities: analysis.entities.map((e) => e.type),
    },
  });

  return analysis;
}

/**
 * Detecta intenção do texto
 */
function detectIntent(text: string): { intent: UserIntent; confidence: number } {
  let bestIntent: UserIntent = 'unknown';
  let bestScore = 0;

  // Check built-in patterns
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent === 'unknown') {continue;}

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const score = calculatePatternScore(text, pattern);
        if (score > bestScore) {
          bestScore = score;
          bestIntent = intent as UserIntent;
        }
      }
    }
  }

  // Check custom patterns
  for (const [intent, patterns] of state.customPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        const score = calculatePatternScore(text, pattern);
        if (score > bestScore) {
          bestScore = score;
          bestIntent = intent;
        }
      }
    }
  }

  // Normalize confidence
  const confidence = Math.min(0.95, bestScore > 0 ? 0.5 + bestScore * 0.5 : 0.1);

  return { intent: bestIntent, confidence };
}

/**
 * Calcula score de match do padrão
 */
function calculatePatternScore(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  if (!matches) {return 0;}

  // Score based on match length relative to text length
  // Filter out undefined/null matches before reducing
  const matchLength = matches
    .filter((m): m is string => m !== undefined && m !== null)
    .reduce((sum, m) => sum + m.length, 0);
  return Math.min(1, matchLength / (text.length * 0.5));
}

// =============================================================================
// ENTITY EXTRACTION
// =============================================================================

/**
 * Extrai entidades do texto
 */
export function extractEntities(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  for (const [type, pattern] of Object.entries(ENTITY_PATTERNS)) {
    // Reset regex lastIndex
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const entity: ExtractedEntity = {
        type: type as EntityType,
        value: match[0],
        normalizedValue: normalizeEntityValue(type as EntityType, match[0]),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.8,
      };

      // Avoid duplicates
      const isDuplicate = entities.some(
        (e) =>
          e.startIndex === entity.startIndex && e.endIndex === entity.endIndex
      );

      if (!isDuplicate) {
        entities.push(entity);
      }
    }
  }

  // Sort by position
  return entities.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Normaliza valor da entidade
 */
function normalizeEntityValue(
  type: EntityType,
  value: string
): string | number {
  switch (type) {
    case 'currency': {
      // R$ 1.234,56 -> 1234.56
      const cleaned = value
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      return parseFloat(cleaned) || 0;
    }
    case 'percentage': {
      // 25% or 25 por cento -> 25
      const cleaned = value.replace(/[%\s]/g, '').replace(/por\s*cento/i, '');
      return parseFloat(cleaned.replace(',', '.')) || 0;
    }
    case 'number': {
      return parseFloat(value.replace(',', '.')) || 0;
    }
    default:
      return value.toLowerCase().trim();
  }
}

// =============================================================================
// SENTIMENT & URGENCY
// =============================================================================

/**
 * Analisa sentimento do texto
 */
export function analyzeSentiment(
  text: string
): 'positive' | 'neutral' | 'negative' {
  const words = text.toLowerCase().split(/\s+/);

  let negativeCount = 0;
  let positiveCount = 0;

  for (const word of words) {
    if (NEGATIVE_WORDS.some((nw) => word.includes(nw))) {
      negativeCount++;
    }
    // Simple positive detection
    if (['obrigado', 'perfeito', 'ótimo', 'bom', 'legal', 'funciona'].some((pw) => word.includes(pw))) {
      positiveCount++;
    }
  }

  if (negativeCount > positiveCount && negativeCount >= 1) {return 'negative';}
  if (positiveCount > negativeCount && positiveCount >= 1) {return 'positive';}
  return 'neutral';
}

/**
 * Detecta urgência do texto
 */
export function detectUrgency(text: string): 'low' | 'medium' | 'high' {
  const words = text.toLowerCase().split(/\s+/);

  let urgencyScore = 0;

  for (const word of words) {
    if (URGENCY_WORDS.some((uw) => word.includes(uw))) {
      urgencyScore++;
    }
  }

  // Check for punctuation (multiple ? or !)
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;

  if (exclamations >= 2 || urgencyScore >= 2) {return 'high';}
  if (urgencyScore >= 1 || questions >= 2) {return 'medium';}
  return 'low';
}

// =============================================================================
// TEXT PROCESSING
// =============================================================================

/**
 * Normaliza texto para processamento
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents for matching
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Corrige texto com base no dicionário
 */
export function correctText(text: string): TextCorrection[] {
  const corrections: TextCorrection[] = [];
  const words = text.split(/\s+/);

  for (const word of words) {
    const lower = word.toLowerCase();

    // Check custom corrections first
    if (state.customCorrections.has(lower)) {
      corrections.push({
        original: word,
        corrected: state.customCorrections.get(lower)!,
        type: 'spelling',
        confidence: 0.9,
      });
      continue;
    }

    // Check built-in corrections
    if (CORRECTIONS[lower]) {
      corrections.push({
        original: word,
        corrected: CORRECTIONS[lower],
        type: 'spelling',
        confidence: 0.85,
      });
    }
  }

  return corrections;
}

/**
 * Sugere completações para texto parcial
 */
export function suggestCompletions(partial: string): TextCompletion {
  const lower = partial.toLowerCase().trim();
  const suggestions: string[] = [];

  // Common completions based on context
  const completionMap: Record<string, string[]> = {
    'calcular': ['preço de venda', 'markup', 'margem', 'BDI'],
    'quanto': ['devo cobrar', 'é o markup', 'é a margem'],
    'como': ['calcular preço', 'funciona o markup', 'usar a calculadora'],
    'qual': ['a diferença entre markup e margem', 'o melhor markup', 'a margem ideal'],
    'o que': ['é markup', 'é margem', 'é BDI', 'são despesas indiretas'],
    'preciso': ['calcular', 'de ajuda', 'entender'],
    'exportar': ['para PDF', 'para Excel', 'dados'],
  };

  // Find matching prefix
  for (const [prefix, completions] of Object.entries(completionMap)) {
    if (lower.startsWith(prefix) || prefix.startsWith(lower)) {
      suggestions.push(...completions.map((c) => `${prefix} ${c}`));
    }
  }

  // Limit and dedupe
  const unique = [...new Set(suggestions)].slice(0, 5);

  return {
    partial,
    suggestions: unique,
  };
}

/**
 * Normaliza entrada de valor (input de formulário)
 */
export function normalizeValueInput(input: string): {
  value: number;
  type: 'currency' | 'percentage' | 'number';
  formatted: string;
} {
  // Detect type
  const hasCurrency = /R\$|reais?/i.test(input);
  const hasPercent = /%|por\s*cento/i.test(input);

  // Clean and parse
  let cleaned = input
    .replace(/[R$%\s]/gi, '')
    .replace(/por\s*cento/gi, '')
    .trim();

  // Handle Brazilian number format (1.234,56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }

  const value = parseFloat(cleaned) || 0;

  const type = hasCurrency ? 'currency' : hasPercent ? 'percentage' : 'number';

  // Format output
  let formatted: string;
  if (type === 'currency') {
    formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  } else if (type === 'percentage') {
    formatted = `${value.toFixed(2)}%`;
  } else {
    formatted = value.toLocaleString('pt-BR');
  }

  return { value, type, formatted };
}

// =============================================================================
// ACTION SUGGESTION
// =============================================================================

/**
 * Gera ação sugerida baseada na intenção
 */
function generateSuggestedAction(
  intent: UserIntent,
  entities: ExtractedEntity[]
): string | undefined {
  const actionMap: Record<UserIntent, string> = {
    calculate_price: 'navigate:/calculadoras/preco-venda',
    calculate_markup: 'navigate:/calculadoras/markup',
    calculate_margin: 'navigate:/calculadoras/margem',
    calculate_bdi: 'navigate:/calculadoras/bdi',
    understand_concept: 'show:explanation',
    compare_values: 'show:comparison',
    get_help: 'show:help',
    navigate: 'navigate:detected',
    export_data: 'action:export',
    configure: 'navigate:/configuracoes',
    unknown: undefined,
  };

  let action = actionMap[intent];

  // Enhance with entity context
  if (action && entities.length > 0) {
    const currencyEntity = entities.find((e) => e.type === 'currency');
    const percentEntity = entities.find((e) => e.type === 'percentage');

    if (currencyEntity && intent.startsWith('calculate')) {
      action += `?custo=${currencyEntity.normalizedValue}`;
    }
    if (percentEntity && intent.startsWith('calculate')) {
      action += `${action.includes('?') ? '&' : '?'}taxa=${percentEntity.normalizedValue}`;
    }
  }

  return action;
}

/**
 * Obtém sinônimos de um termo
 */
export function getSynonyms(term: string): string[] {
  const lower = term.toLowerCase();

  // Check if term is a key
  if (SYNONYMS[lower]) {
    return SYNONYMS[lower];
  }

  // Check if term is a synonym value
  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (values.some((v) => v.toLowerCase() === lower)) {
      return [key, ...values.filter((v) => v.toLowerCase() !== lower)];
    }
  }

  return [];
}

/**
 * Verifica se dois termos são sinônimos
 */
export function areSynonyms(term1: string, term2: string): boolean {
  const lower1 = term1.toLowerCase();
  const lower2 = term2.toLowerCase();

  if (lower1 === lower2) {return true;}

  const synonyms1 = getSynonyms(lower1);
  const synonyms2 = getSynonyms(lower2);

  return (
    synonyms1.some((s) => s.toLowerCase() === lower2) ||
    synonyms2.some((s) => s.toLowerCase() === lower1)
  );
}

// =============================================================================
// HISTORY & STATS
// =============================================================================

/**
 * Retorna histórico de análises
 */
export function getAnalysisHistory(): IntentAnalysis[] {
  return [...state.analysisHistory];
}

/**
 * Retorna estatísticas de NLP
 */
export function getNLPStats(): {
  totalAnalyses: number;
  intentDistribution: Record<UserIntent, number>;
  avgConfidence: number;
  sentimentDistribution: Record<string, number>;
} {
  const intentDist: Record<UserIntent, number> = {
    calculate_price: 0,
    calculate_markup: 0,
    calculate_margin: 0,
    calculate_bdi: 0,
    understand_concept: 0,
    compare_values: 0,
    get_help: 0,
    navigate: 0,
    export_data: 0,
    configure: 0,
    unknown: 0,
  };

  const sentimentDist: Record<string, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  let confidenceSum = 0;

  for (const analysis of state.analysisHistory) {
    intentDist[analysis.intent]++;
    sentimentDist[analysis.sentiment]++;
    confidenceSum += analysis.confidence;
  }

  return {
    totalAnalyses: state.analysisHistory.length,
    intentDistribution: intentDist,
    avgConfidence:
      state.analysisHistory.length > 0
        ? confidenceSum / state.analysisHistory.length
        : 0,
    sentimentDistribution: sentimentDist,
  };
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Limpa histórico de análises
 */
export function clearAnalysisHistory(): void {
  state.analysisHistory = [];
}

/**
 * Reseta o engine
 */
export function resetNLPProcessor(): void {
  state.initialized = false;
  state.customPatterns.clear();
  state.customCorrections.clear();
  state.analysisHistory = [];
}

// =============================================================================
// EXPORTS
// =============================================================================

export const nlpProcessor = {
  init: initNLPProcessor,
  analyze: analyzeText,
  extractEntities,
  analyzeSentiment,
  detectUrgency,
  normalizeText,
  correctText,
  suggestCompletions,
  normalizeValue: normalizeValueInput,
  getSynonyms,
  areSynonyms,
  addPattern: addIntentPattern,
  addCorrection,
  getHistory: getAnalysisHistory,
  getStats: getNLPStats,
  clearHistory: clearAnalysisHistory,
  reset: resetNLPProcessor,
};

export default nlpProcessor;
