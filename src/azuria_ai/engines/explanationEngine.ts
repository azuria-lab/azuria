/**
 * ExplanationEngine - Motor de Explicações Contextuais
 *
 * Este engine é responsável por:
 * - Gerar explicações adaptadas ao nível do usuário
 * - Explicar cálculos passo-a-passo
 * - Fornecer contexto sobre conceitos fiscais/de precificação
 * - Adaptar linguagem e profundidade baseado no skill level
 *
 * @module azuria_ai/engines/explanationEngine
 */

import type {
  CreateSuggestionInput,
  SkillLevel,
  UserContext,
} from '../types/operational';
import { eventBus } from '../core/eventBus';

// ============================================================================
// Constants
// ============================================================================

/** Níveis de detalhe de explicação */
export type ExplanationDepth = 'minimal' | 'standard' | 'detailed' | 'expert';

/** Categorias de explicação */
export type ExplanationCategory =
  | 'calculation'
  | 'concept'
  | 'tax'
  | 'pricing'
  | 'bidding'
  | 'margin'
  | 'markup'
  | 'error'
  | 'tip';

// ============================================================================
// Types
// ============================================================================

/** Passo de uma explicação */
export interface ExplanationStep {
  /** Ordem do passo */
  order: number;
  /** Título do passo */
  title: string;
  /** Descrição detalhada */
  description: string;
  /** Fórmula (se aplicável) */
  formula?: string;
  /** Valores de exemplo */
  example?: {
    input: Record<string, number | string>;
    output: number | string;
    calculation?: string;
  };
  /** Dica relacionada */
  tip?: string;
}

/** Explicação completa */
export interface Explanation {
  /** ID único */
  id: string;
  /** Categoria */
  category: ExplanationCategory;
  /** Título */
  title: string;
  /** Resumo (para nível minimal) */
  summary: string;
  /** Explicação completa */
  fullText: string;
  /** Passos detalhados */
  steps?: ExplanationStep[];
  /** Conceitos relacionados */
  relatedConcepts?: string[];
  /** Links para documentação */
  learnMoreLinks?: { label: string; url: string }[];
  /** Nível de profundidade gerado */
  depth: ExplanationDepth;
  /** Contexto que gerou */
  context?: {
    screen?: string;
    trigger?: string;
    values?: Record<string, unknown>;
  };
  /** Timestamp */
  createdAt: number;
}

/** Input para geração de explicação */
export interface ExplanationRequest {
  /** Categoria do que explicar */
  category: ExplanationCategory;
  /** Tópico específico */
  topic: string;
  /** Valores para exemplificar */
  values?: Record<string, number | string>;
  /** Forçar profundidade específica */
  forceDepth?: ExplanationDepth;
  /** Tela onde foi solicitado */
  screen?: string;
}

/** Template de explicação */
interface ExplanationTemplate {
  category: ExplanationCategory;
  topic: string;
  title: string;
  templates: {
    minimal: string;
    standard: string;
    detailed: string;
    expert: string;
  };
  steps?: Omit<ExplanationStep, 'order'>[];
  relatedConcepts?: string[];
}

// ============================================================================
// Explanation Templates
// ============================================================================

const EXPLANATION_TEMPLATES: ExplanationTemplate[] = [
  // Markup vs Margem
  {
    category: 'concept',
    topic: 'markup-vs-margin',
    title: 'Markup vs Margem de Lucro',
    templates: {
      minimal: 'Markup é sobre o custo, margem é sobre a venda.',
      standard:
        'Markup é a porcentagem adicionada ao custo para formar o preço. Margem é a porcentagem do lucro em relação ao preço de venda.',
      detailed:
        'O Markup é calculado sobre o custo do produto e representa quanto você adiciona ao custo para chegar ao preço de venda. Já a Margem de Lucro é calculada sobre o preço de venda e mostra qual porcentagem do preço final é lucro. Por exemplo: um produto de R$100 vendido por R$150 tem markup de 50% (50/100) mas margem de 33,33% (50/150).',
      expert:
        'O Markup (multiplicador) é aplicado ao custo para derivar o preço de venda: Preço = Custo × (1 + Markup%). A Margem representa a proporção do lucro bruto sobre a receita: Margem = (Preço - Custo) / Preço. A relação matemática entre eles é: Margem = Markup / (1 + Markup) e Markup = Margem / (1 - Margem). Em precificação estratégica, a margem é preferida para análise de rentabilidade, enquanto o markup é mais prático para formação de preços.',
    },
    steps: [
      {
        title: 'Entenda o Custo Base',
        description: 'O custo é o valor que você pagou pelo produto ou serviço.',
        formula: 'Custo = Valor de Compra + Custos Adicionais',
      },
      {
        title: 'Calcule o Markup',
        description: 'Markup é quanto você adiciona percentualmente ao custo.',
        formula: 'Markup = ((Preço - Custo) / Custo) × 100',
        example: {
          input: { custo: 100, preco: 150 },
          output: '50%',
          calculation: '((150 - 100) / 100) × 100 = 50%',
        },
      },
      {
        title: 'Calcule a Margem',
        description: 'Margem é quanto do preço final é lucro.',
        formula: 'Margem = ((Preço - Custo) / Preço) × 100',
        example: {
          input: { custo: 100, preco: 150 },
          output: '33,33%',
          calculation: '((150 - 100) / 150) × 100 = 33,33%',
        },
      },
    ],
    relatedConcepts: ['lucro-bruto', 'ponto-equilibrio', 'precificacao'],
  },

  // Cálculo de Preço de Venda
  {
    category: 'calculation',
    topic: 'selling-price',
    title: 'Como Calcular o Preço de Venda',
    templates: {
      minimal: 'Preço = Custo ÷ (1 - Despesas% - Margem%)',
      standard:
        'O preço de venda é calculado dividindo o custo pelo fator que considera todas as despesas e a margem desejada.',
      detailed:
        'Para calcular o preço de venda ideal, você precisa considerar: 1) O custo do produto/serviço, 2) As despesas variáveis (impostos, comissões, taxas), 3) As despesas fixas rateadas, 4) A margem de lucro desejada. A fórmula completa divide o custo pela soma de todos os fatores subtraída de 100%.',
      expert:
        'A formação de preço de venda pelo método do Markup Divisor utiliza: PV = Custo / (1 - (DV% + DF% + ML%)), onde DV = Despesas Variáveis, DF = Despesas Fixas (rateadas) e ML = Margem de Lucro. Este método garante que, após todas as deduções, reste exatamente a margem desejada. Alternativamente, pode-se usar o Markup Multiplicador: PV = Custo × (1 / (1 - Soma%)). Para análise de sensibilidade, considere o impacto de cada variável no preço final.',
    },
    steps: [
      {
        title: 'Identifique o Custo',
        description:
          'Some todos os custos diretos do produto (compra, frete, etc.).',
        tip: 'Não esqueça custos ocultos como embalagem e perdas.',
      },
      {
        title: 'Liste as Despesas Variáveis',
        description:
          'Impostos sobre venda (ICMS, PIS, COFINS), comissões, taxas de cartão.',
        example: {
          input: { icms: 18, pis_cofins: 3.65, comissao: 5 },
          output: '26,65%',
          calculation: '18 + 3.65 + 5 = 26,65%',
        },
      },
      {
        title: 'Calcule Despesas Fixas Rateadas',
        description:
          'Divida as despesas fixas mensais pela receita esperada.',
        formula: 'DF% = (Despesas Fixas / Receita Esperada) × 100',
      },
      {
        title: 'Defina a Margem Desejada',
        description: 'Quanto de lucro líquido você quer ter em cada venda.',
        tip: 'Considere o mercado e a concorrência ao definir.',
      },
      {
        title: 'Aplique a Fórmula',
        description: 'Divida o custo pelo divisor calculado.',
        formula: 'Preço = Custo ÷ (1 - DV% - DF% - ML%)',
        example: {
          input: { custo: 50, dv: 0.27, df: 0.15, ml: 0.1 },
          output: 'R$ 104,17',
          calculation: '50 ÷ (1 - 0.27 - 0.15 - 0.10) = 50 ÷ 0.48 = R$ 104,17',
        },
      },
    ],
    relatedConcepts: ['markup-vs-margin', 'impostos', 'ponto-equilibrio'],
  },

  // Impostos sobre Venda
  {
    category: 'tax',
    topic: 'sales-taxes',
    title: 'Impostos sobre Vendas no Brasil',
    templates: {
      minimal: 'Principais: ICMS, PIS, COFINS, ISS (serviços).',
      standard:
        'Os principais impostos sobre vendas são: ICMS (estadual, 7-18%), PIS (0,65-1,65%), COFINS (3-7,6%), e ISS para serviços (2-5%). O regime tributário define as alíquotas.',
      detailed:
        'No Brasil, a tributação sobre vendas varia conforme o regime: Simples Nacional (DAS unificado de 4-19%), Lucro Presumido (PIS 0,65% + COFINS 3% + ICMS/ISS), Lucro Real (PIS 1,65% + COFINS 7,6% não-cumulativos + ICMS/ISS). O ICMS varia por estado e tipo de operação. Para serviços, aplica-se ISS municipal no lugar do ICMS.',
      expert:
        'A matriz tributária brasileira para vendas inclui: 1) ICMS - Imposto estadual sobre circulação, com alíquotas internas (17-20%) e interestaduais (7-12%), sujeito a substituição tributária e diferencial de alíquota. 2) PIS/COFINS - Contribuições federais em regime cumulativo (0,65%+3%) ou não-cumulativo (1,65%+7,6%) com direito a créditos. 3) ISS - Municipal para serviços (2-5%). 4) IPI - Para indústrias. No Simples Nacional, há unificação via DAS com alíquotas progressivas por faixa de faturamento. A escolha do regime tributário impacta significativamente a carga fiscal e deve considerar margem, volume e tipo de operação.',
    },
    relatedConcepts: ['simples-nacional', 'lucro-presumido', 'icms-st'],
  },

  // Ponto de Equilíbrio
  {
    category: 'pricing',
    topic: 'break-even',
    title: 'Ponto de Equilíbrio',
    templates: {
      minimal: 'É quando receita = custos totais (lucro zero).',
      standard:
        'O ponto de equilíbrio é o momento em que sua receita cobre exatamente todos os custos. Acima dele, você tem lucro; abaixo, prejuízo.',
      detailed:
        'O Ponto de Equilíbrio (Break-even Point) pode ser calculado em unidades ou em valor. Em unidades: PE = Custos Fixos ÷ (Preço - Custo Variável Unitário). Em valor: PE = Custos Fixos ÷ Margem de Contribuição%. É essencial para saber quantas unidades ou quanto precisa vender para começar a ter lucro.',
      expert:
        'O Break-even Analysis considera três variáveis interdependentes: Custos Fixos (CF), Margem de Contribuição Unitária (MCU = P - CVu) e Volume. PE(un) = CF / MCU e PE(R$) = CF / MC%. A análise pode ser expandida para múltiplos produtos usando média ponderada das margens. O conceito se estende para: Break-even Financeiro (considera depreciação), Break-even Econômico (inclui custo de oportunidade) e Break-even de Caixa (foco em fluxo). A sensibilidade do PE a variações de preço e custo é crucial para decisões estratégicas.',
    },
    steps: [
      {
        title: 'Identifique Custos Fixos',
        description:
          'Custos que não variam com a quantidade vendida (aluguel, salários fixos, etc.).',
      },
      {
        title: 'Calcule Margem de Contribuição',
        description: 'Quanto cada unidade vendida contribui para pagar os fixos.',
        formula: 'MC = Preço de Venda - Custo Variável Unitário',
      },
      {
        title: 'Aplique a Fórmula',
        description: 'Divida os custos fixos pela margem de contribuição.',
        formula: 'PE (unidades) = Custos Fixos ÷ Margem de Contribuição',
        example: {
          input: { custos_fixos: 10000, preco: 100, custo_var: 60 },
          output: '250 unidades',
          calculation: '10.000 ÷ (100 - 60) = 10.000 ÷ 40 = 250 unidades',
        },
      },
    ],
    relatedConcepts: ['margem-contribuicao', 'custos-fixos', 'custos-variaveis'],
  },

  // Licitação - Tipos
  {
    category: 'bidding',
    topic: 'bidding-types',
    title: 'Tipos de Licitação',
    templates: {
      minimal: 'Pregão, Concorrência, Tomada de Preços, Convite, Leilão.',
      standard:
        'As principais modalidades são: Pregão (mais comum, menor preço), Concorrência (grandes valores), Tomada de Preços (cadastrados), Convite (até 3 convidados), Leilão (venda de bens).',
      detailed:
        'A Lei 14.133/2021 (Nova Lei de Licitações) define: 1) Pregão - obrigatório para bens/serviços comuns, presencial ou eletrônico; 2) Concorrência - qualquer valor, ampla participação; 3) Concurso - seleção de trabalho técnico/artístico; 4) Leilão - alienação de bens; 5) Diálogo Competitivo - soluções inovadoras. O critério de julgamento pode ser menor preço, maior desconto, melhor técnica ou técnica e preço.',
      expert:
        'A Lei 14.133/2021 modernizou o framework de contratações públicas, substituindo as Leis 8.666/93 e 10.520/02. Principais mudanças: 1) Portal Nacional de Contratações Públicas (PNCP) para publicidade; 2) Fase preparatória robusta com ETP e mapa de riscos; 3) Inversão de fases (habilitação após julgamento) como regra; 4) Matriz de riscos obrigatória em contratos complexos; 5) Seguro-garantia até 30% em obras; 6) Contratação integrada/semi-integrada regulamentada. Os critérios de julgamento incluem: menor preço, maior desconto, melhor técnica ou conteúdo artístico, técnica e preço, maior lance (leilão) e maior retorno econômico. A sanção por inexecução pode atingir declaração de inidoneidade por até 6 anos.',
    },
    relatedConcepts: ['pregao-eletronico', 'habilitacao', 'proposta-tecnica'],
  },

  // BDI - Licitações
  {
    category: 'bidding',
    topic: 'bdi-calculation',
    title: 'BDI - Bonificação e Despesas Indiretas',
    templates: {
      minimal: 'BDI é o percentual que cobre custos indiretos e lucro em licitações.',
      standard:
        'O BDI (Bonificação e Despesas Indiretas) é aplicado sobre custos diretos para formar o preço em licitações. Inclui administração central, seguros, garantias, riscos, tributos e lucro.',
      detailed:
        'O BDI é calculado pela fórmula: BDI = [(1+AC+S+R+G) × (1+DF) × (1+L) / (1-I)] - 1, onde: AC = Administração Central, S = Seguros, R = Riscos, G = Garantias, DF = Despesas Financeiras, L = Lucro, I = Impostos (ISS, PIS, COFINS, CPRB). O TCU recomenda faixas: obras 20-25%, serviços 25-30%, fornecimento 15-20%.',
      expert:
        'O BDI conforme Acórdão TCU 2622/2013 deve ser calculado analiticamente: BDI = {[(1+AC+S+R+G) × (1+DF) × (1+L)] / (1-I)} - 1. Componentes: AC (Administração Central): 3-5,5% para obras, até 8% para serviços; S (Seguros): 0,5-1%; R (Riscos): 0,5-1,5% (análise específica); G (Garantias): 0,5-1%; DF (Despesas Financeiras): baseado no prazo e taxas; L (Lucro): 5-8% (mercado); I (Impostos): ISS (2-5%), PIS (0,65%), COFINS (3%), CPRB se aplicável. O SINAPI e SICRO fornecem referências. Vedado incluir no BDI: IRPJ, CSLL (tributos sobre lucro), custos que devem estar na composição de preços. Para consórcios, redução proporcional de AC.',
    },
    steps: [
      {
        title: 'Calcule Custos Indiretos',
        description: 'Some: Administração Central + Seguros + Riscos + Garantias.',
        formula: 'CI = AC + S + R + G',
      },
      {
        title: 'Adicione Despesas Financeiras',
        description: 'Considere prazo de pagamento e capital de giro.',
      },
      {
        title: 'Defina o Lucro',
        description: 'Margem de lucro desejada (geralmente 5-8%).',
      },
      {
        title: 'Calcule Impostos',
        description: 'ISS + PIS + COFINS (e CPRB se desonerado).',
      },
      {
        title: 'Aplique a Fórmula TCU',
        description: 'Use a fórmula oficial do Tribunal de Contas.',
        formula: 'BDI = [(1+CI) × (1+DF) × (1+L) / (1-I)] - 1',
        example: {
          input: { ci: 0.08, df: 0.01, l: 0.07, i: 0.0865 },
          output: '27,5%',
          calculation:
            '[(1+0,08) × (1+0,01) × (1+0,07) / (1-0,0865)] - 1 = 27,5%',
        },
      },
    ],
    relatedConcepts: ['sinapi', 'sicro', 'composicao-custos'],
  },

  // Erro comum: Margem sobre Preço vs Custo
  {
    category: 'error',
    topic: 'margin-calculation-error',
    title: 'Erro Comum: Aplicar Margem sobre o Custo',
    templates: {
      minimal: 'Margem é sobre o preço, não sobre o custo!',
      standard:
        'Um erro comum é calcular margem sobre o custo. Se você quer 30% de margem, não basta multiplicar o custo por 1,3. A margem é calculada sobre o preço de venda.',
      detailed:
        'Se seu custo é R$100 e você quer 30% de margem, multiplicar por 1,3 (dando R$130) resulta em apenas 23% de margem real! O correto é: Preço = Custo ÷ (1 - Margem) = 100 ÷ 0,70 = R$142,86. Assim, (142,86 - 100) / 142,86 = 30% de margem.',
      expert:
        'A confusão entre markup e margem é um dos erros mais custosos em precificação. Matematicamente: se M = margem desejada, então Preço = Custo / (1 - M). Aplicar Custo × (1 + M) produz um markup de M%, não uma margem de M%. A diferença cresce exponencialmente: para 50% pretendido, o erro é de 17 pontos percentuais (33,3% real vs 50% desejado). Em operações de alto volume, esse erro pode significar milhões em lucro não realizado.',
    },
    relatedConcepts: ['markup-vs-margin', 'selling-price'],
  },
];

// ============================================================================
// State
// ============================================================================

interface EngineState {
  initialized: boolean;
  explanationsGenerated: number;
  lastExplanation: Explanation | null;
}

const state: EngineState = {
  initialized: false,
  explanationsGenerated: 0,
  lastExplanation: null,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o ExplanationEngine
 */
export function initExplanationEngine(): void {
  if (state.initialized) {return;}
  state.initialized = true;
  state.explanationsGenerated = 0;
}

/**
 * Encerra o ExplanationEngine
 */
export function shutdownExplanationEngine(): void {
  state.initialized = false;
  state.lastExplanation = null;
}

/**
 * Mapeia skill level para profundidade de explicação
 */
export function getDepthForSkillLevel(skillLevel: SkillLevel): ExplanationDepth {
  switch (skillLevel) {
    case 'beginner':
      return 'detailed';
    case 'intermediate':
      return 'standard';
    case 'advanced':
      return 'standard';
    case 'expert':
      return 'expert';
    default:
      return 'standard';
  }
}

/**
 * Gera uma explicação
 */
export function generateExplanation(
  request: ExplanationRequest,
  userContext?: UserContext
): Explanation | null {
  const template = EXPLANATION_TEMPLATES.find(
    (t) => t.category === request.category && t.topic === request.topic
  );

  if (!template) {
    // Tentar encontrar por categoria apenas
    const categoryTemplates = EXPLANATION_TEMPLATES.filter(
      (t) => t.category === request.category
    );
    if (categoryTemplates.length === 0) {
      return null;
    }
    // Usar o primeiro da categoria como fallback
    return generateFromTemplate(categoryTemplates[0], request, userContext);
  }

  return generateFromTemplate(template, request, userContext);
}

/**
 * Gera explicação a partir de template
 */
function generateFromTemplate(
  template: ExplanationTemplate,
  request: ExplanationRequest,
  userContext?: UserContext
): Explanation {
  const depth =
    request.forceDepth ??
    (userContext ? getDepthForSkillLevel(userContext.skillLevel) : 'standard');

  const fullText = interpolateValues(template.templates[depth], request.values);
  const summary = interpolateValues(template.templates.minimal, request.values);

  const explanation: Explanation = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    category: template.category,
    title: template.title,
    summary,
    fullText,
    steps: template.steps?.map((step, index) => ({
      ...step,
      order: index + 1,
      description: interpolateValues(step.description, request.values),
    })),
    relatedConcepts: template.relatedConcepts,
    depth,
    context: {
      screen: request.screen,
      trigger: 'user_request',
      values: request.values,
    },
    createdAt: Date.now(),
  };

  state.explanationsGenerated++;
  state.lastExplanation = explanation;

  // Emitir evento
  eventBus.emit('user:suggestion', {
    explanation,
    depth,
    timestamp: Date.now(),
    source: 'explanation-engine',
  });

  return explanation;
}

/**
 * Interpola valores no texto
 */
function interpolateValues(
  text: string,
  values?: Record<string, number | string>
): string {
  if (!values) {return text;}

  let result = text;
  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(String.raw`\{${key}\}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * Obtém explicação rápida (apenas summary)
 */
export function getQuickExplanation(
  category: ExplanationCategory,
  topic: string
): string | null {
  const template = EXPLANATION_TEMPLATES.find(
    (t) => t.category === category && t.topic === topic
  );
  return template?.templates.minimal ?? null;
}

/**
 * Lista tópicos disponíveis por categoria
 */
export function getAvailableTopics(category?: ExplanationCategory): string[] {
  const templates = category
    ? EXPLANATION_TEMPLATES.filter((t) => t.category === category)
    : EXPLANATION_TEMPLATES;

  return templates.map((t) => t.topic);
}

/**
 * Lista categorias disponíveis
 */
export function getAvailableCategories(): ExplanationCategory[] {
  const categories = new Set<ExplanationCategory>();
  for (const template of EXPLANATION_TEMPLATES) {
    categories.add(template.category);
  }
  return Array.from(categories);
}

/**
 * Maps explanation category to suggestion category type
 */
function mapCategoryToType(category: string): 'calculation' | 'tax' | 'bidding' | 'general' {
  if (category === 'calculation' || category === 'pricing') {return 'calculation';}
  if (category === 'tax') {return 'tax';}
  if (category === 'bidding') {return 'bidding';}
  return 'general';
}

/**
 * Converte explicação em sugestão do Co-Piloto
 */
export function explanationToSuggestion(
  explanation: Explanation
): CreateSuggestionInput {
  return {
    type: 'explanation',
    priority: 'medium',
    category: mapCategoryToType(explanation.category),
    title: explanation.title,
    message: explanation.summary,
    details: explanation.fullText,
    context: explanation.context,
    confidence: 0.9,
  };
}

/**
 * Gera explicação para um erro
 */
export function explainError(
  errorType: string,
  errorMessage: string,
  userContext?: UserContext
): Explanation {
  const depth = userContext
    ? getDepthForSkillLevel(userContext.skillLevel)
    : 'standard';

  // Mapear erros comuns para explicações
  let title = 'Ocorreu um Erro';
  let summary = errorMessage;
  let fullText = errorMessage;
  let tip: string | undefined;

  if (errorType.includes('margin') || errorType.includes('margem')) {
    const template = EXPLANATION_TEMPLATES.find(
      (t) => t.topic === 'margin-calculation-error'
    );
    if (template) {
      title = template.title;
      summary = template.templates.minimal;
      fullText = template.templates[depth];
    }
  } else if (errorType.includes('value') || errorType.includes('valor')) {
    title = 'Valor Inválido';
    summary = 'O valor informado não é válido para este campo.';
    fullText =
      'Verifique se o valor está no formato correto. Use números positivos e, para decimais, use ponto ou vírgula conforme sua preferência.';
    tip = 'Exemplo: 100.50 ou 100,50';
  } else if (errorType.includes('negative') || errorType.includes('negativo')) {
    title = 'Valor Negativo';
    summary = 'Este campo não aceita valores negativos.';
    fullText =
      'Custos, preços e percentuais geralmente devem ser valores positivos. Verifique se você não digitou um sinal de menos acidentalmente.';
  } else if (errorType.includes('percent') || errorType.includes('100')) {
    title = 'Percentual Inválido';
    summary = 'O percentual informado está fora do intervalo válido.';
    fullText =
      'Percentuais de margem e despesas geralmente devem estar entre 0% e 100%. Valores acima de 100% resultariam em preços negativos ou inviáveis.';
    tip = 'Se sua margem + despesas > 100%, revise os valores.';
  }

  return {
    id: `exp_err_${Date.now()}`,
    category: 'error',
    title,
    summary,
    fullText,
    steps: tip
      ? [{ order: 1, title: 'Dica', description: tip }]
      : undefined,
    depth,
    context: {
      trigger: 'error',
      values: { errorType, errorMessage },
    },
    createdAt: Date.now(),
  };
}

/**
 * Obtém conceitos relacionados
 */
export function getRelatedConcepts(topic: string): string[] {
  const template = EXPLANATION_TEMPLATES.find((t) => t.topic === topic);
  return template?.relatedConcepts ?? [];
}

/**
 * Obtém estatísticas do engine
 */
export function getExplanationStats(): {
  initialized: boolean;
  explanationsGenerated: number;
  templatesAvailable: number;
  categoriesAvailable: number;
} {
  return {
    initialized: state.initialized,
    explanationsGenerated: state.explanationsGenerated,
    templatesAvailable: EXPLANATION_TEMPLATES.length,
    categoriesAvailable: getAvailableCategories().length,
  };
}

// ============================================================================
// Exports
// ============================================================================

export const explanationEngine = {
  init: initExplanationEngine,
  shutdown: shutdownExplanationEngine,
  generate: generateExplanation,
  getQuick: getQuickExplanation,
  explainError,
  toSuggestion: explanationToSuggestion,
  getTopics: getAvailableTopics,
  getCategories: getAvailableCategories,
  getRelated: getRelatedConcepts,
  getStats: getExplanationStats,
  getDepthForSkill: getDepthForSkillLevel,
};

export default explanationEngine;
