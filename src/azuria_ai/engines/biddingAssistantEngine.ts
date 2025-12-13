/**
 * BiddingAssistantEngine - Motor de Assistência para Licitações
 *
 * Este engine é responsável por:
 * - Auxiliar no cálculo de BDI
 * - Validar propostas de licitação
 * - Sugerir otimizações de preço
 * - Alertar sobre riscos em propostas
 * - Verificar conformidade com TCU/legislação
 *
 * @module azuria_ai/engines/biddingAssistantEngine
 */

import type {
  CreateSuggestionInput,
  UserContext,
} from '../types/operational';
import { eventBus } from '../core/eventBus';

// ============================================================================
// Constants
// ============================================================================

/** Faixas de BDI recomendadas pelo TCU */
const BDI_RANGES = {
  obras: { min: 20, max: 25, default: 22.5 },
  servicos: { min: 25, max: 30, default: 27.5 },
  fornecimento: { min: 15, max: 20, default: 17.5 },
  consultoria: { min: 30, max: 40, default: 35 },
} as const;

/** Componentes do BDI e faixas TCU */
const BDI_COMPONENTS = {
  administracaoCentral: { min: 3, max: 5.5, label: 'Administração Central (AC)' },
  seguros: { min: 0.5, max: 1, label: 'Seguros (S)' },
  riscos: { min: 0.5, max: 1.5, label: 'Riscos (R)' },
  garantias: { min: 0.5, max: 1, label: 'Garantias (G)' },
  despesasFinanceiras: { min: 0.5, max: 1.5, label: 'Despesas Financeiras (DF)' },
  lucro: { min: 5, max: 8, label: 'Lucro (L)' },
} as const;

/** Tributos padrão para BDI */
const BDI_TAXES = {
  iss: { min: 2, max: 5, default: 5, label: 'ISS' },
  pis: { value: 0.65, label: 'PIS' },
  cofins: { value: 3, label: 'COFINS' },
  cprb: { value: 4.5, label: 'CPRB (se desonerado)' },
} as const;

// ============================================================================
// Types
// ============================================================================

/** Tipo de licitação/contrato */
export type BiddingType = 'obras' | 'servicos' | 'fornecimento' | 'consultoria';

/** Modalidade de licitação */
export type BiddingModality =
  | 'pregao-eletronico'
  | 'pregao-presencial'
  | 'concorrencia'
  | 'tomada-precos'
  | 'convite'
  | 'dispensa'
  | 'inexigibilidade'
  | 'dialogo-competitivo';

/** Componentes do BDI */
export interface BDIComponents {
  administracaoCentral: number;
  seguros: number;
  riscos: number;
  garantias: number;
  despesasFinanceiras: number;
  lucro: number;
  /** Tributos */
  tributos: {
    iss: number;
    pis: number;
    cofins: number;
    cprb?: number;
  };
}

/** Resultado do cálculo de BDI */
export interface BDIResult {
  /** BDI calculado (%) */
  bdi: number;
  /** BDI em formato multiplicador */
  multiplicador: number;
  /** Se está dentro da faixa TCU */
  dentroFaixaTCU: boolean;
  /** Faixa TCU para o tipo */
  faixaTCU: { min: number; max: number };
  /** Componentes usados */
  componentes: BDIComponents;
  /** Detalhamento do cálculo */
  detalhamento: {
    somaIndiretos: number;
    fatorIndiretos: number;
    fatorDF: number;
    fatorLucro: number;
    fatorTributos: number;
    totalTributos: number;
  };
  /** Alertas gerados */
  alertas: BiddingAlert[];
}

/** Dados de uma proposta */
export interface BiddingProposal {
  /** Tipo de contrato */
  tipo: BiddingType;
  /** Modalidade */
  modalidade?: BiddingModality;
  /** Custo direto total */
  custoDirecto: number;
  /** BDI aplicado (%) */
  bdiAplicado: number;
  /** Preço final proposto */
  precoFinal: number;
  /** Valor de referência (se disponível) */
  valorReferencia?: number;
  /** Prazo do contrato (meses) */
  prazoMeses?: number;
  /** Componentes do BDI (se detalhados) */
  componentesBDI?: Partial<BDIComponents>;
}

/** Resultado da análise de proposta */
export interface ProposalAnalysis {
  /** Se a proposta é válida */
  valida: boolean;
  /** Score de competitividade (0-100) */
  scoreCompetitividade: number;
  /** Score de risco (0-100, menor = melhor) */
  scoreRisco: number;
  /** BDI implícito calculado */
  bdiImplicito: number;
  /** Comparação com referência */
  comparacaoReferencia?: {
    percentualDiferenca: number;
    status: 'abaixo' | 'dentro' | 'acima';
  };
  /** Alertas */
  alertas: BiddingAlert[];
  /** Sugestões de melhoria */
  sugestoes: string[];
}

/** Alerta de licitação */
export interface BiddingAlert {
  /** Tipo de alerta */
  tipo: 'info' | 'warning' | 'error' | 'success';
  /** Código do alerta */
  codigo: string;
  /** Mensagem */
  mensagem: string;
  /** Detalhe */
  detalhe?: string;
  /** Referência legal */
  referenciaLegal?: string;
}

/** Mapeia tipo de alerta para tipo de sugestão */
function mapAlertTipoToType(tipo: BiddingAlert['tipo']): 'warning' | 'hint' {
  return tipo === 'error' ? 'warning' : 'hint';
}

/** Mapeia tipo de alerta para prioridade */
function mapAlertTipoToPriority(tipo: BiddingAlert['tipo']): 'high' | 'medium' | 'low' {
  switch (tipo) {
    case 'error':
      return 'high';
    case 'warning':
      return 'medium';
    default:
      return 'low';
  }
}

/** Configuração de cálculo */
export interface BiddingConfig {
  /** Usar CPRB (desoneração) */
  usarCPRB: boolean;
  /** Alíquota ISS do município */
  aliquotaISS: number;
  /** Tipo padrão */
  tipoPadrao: BiddingType;
}

// ============================================================================
// State
// ============================================================================

interface EngineState {
  initialized: boolean;
  config: BiddingConfig;
  calculationsPerformed: number;
  lastResult: BDIResult | null;
}

const state: EngineState = {
  initialized: false,
  config: {
    usarCPRB: false,
    aliquotaISS: 5,
    tipoPadrao: 'servicos',
  },
  calculationsPerformed: 0,
  lastResult: null,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Inicializa o BiddingAssistantEngine
 */
export function initBiddingAssistant(config?: Partial<BiddingConfig>): void {
  if (state.initialized) {return;}

  if (config) {
    state.config = { ...state.config, ...config };
  }

  state.initialized = true;
  state.calculationsPerformed = 0;
}

/**
 * Encerra o BiddingAssistantEngine
 */
export function shutdownBiddingAssistant(): void {
  state.initialized = false;
  state.lastResult = null;
}

/**
 * Atualiza configuração
 */
export function updateBiddingConfig(config: Partial<BiddingConfig>): void {
  state.config = { ...state.config, ...config };
}

// ============================================================================
// BDI Calculation
// ============================================================================

/**
 * Calcula BDI usando fórmula TCU
 * BDI = [(1+AC+S+R+G) × (1+DF) × (1+L) / (1-I)] - 1
 */
export function calcularBDI(
  tipo: BiddingType,
  componentes?: Partial<BDIComponents>
): BDIResult {
  // Usar valores padrão ou fornecidos
  const comp: BDIComponents = {
    administracaoCentral: componentes?.administracaoCentral ?? 4,
    seguros: componentes?.seguros ?? 0.8,
    riscos: componentes?.riscos ?? 1,
    garantias: componentes?.garantias ?? 0.8,
    despesasFinanceiras: componentes?.despesasFinanceiras ?? 1,
    lucro: componentes?.lucro ?? 7,
    tributos: {
      iss: componentes?.tributos?.iss ?? state.config.aliquotaISS,
      pis: componentes?.tributos?.pis ?? BDI_TAXES.pis.value,
      cofins: componentes?.tributos?.cofins ?? BDI_TAXES.cofins.value,
      cprb: state.config.usarCPRB
        ? (componentes?.tributos?.cprb ?? BDI_TAXES.cprb.value)
        : undefined,
    },
  };

  // Converter para decimais
  const ac = comp.administracaoCentral / 100;
  const s = comp.seguros / 100;
  const r = comp.riscos / 100;
  const g = comp.garantias / 100;
  const df = comp.despesasFinanceiras / 100;
  const l = comp.lucro / 100;

  // Calcular total de tributos
  let totalTributos = comp.tributos.iss + comp.tributos.pis + comp.tributos.cofins;
  if (comp.tributos.cprb) {
    totalTributos += comp.tributos.cprb;
  }
  const i = totalTributos / 100;

  // Aplicar fórmula TCU
  const somaIndiretos = ac + s + r + g;
  const fatorIndiretos = 1 + somaIndiretos;
  const fatorDF = 1 + df;
  const fatorLucro = 1 + l;
  const fatorTributos = 1 - i;

  const bdi = ((fatorIndiretos * fatorDF * fatorLucro) / fatorTributos - 1) * 100;
  const multiplicador = 1 + bdi / 100;

  // Verificar faixa TCU
  const faixaTCU = BDI_RANGES[tipo];
  const dentroFaixaTCU = bdi >= faixaTCU.min && bdi <= faixaTCU.max;

  // Gerar alertas
  const alertas: BiddingAlert[] = [];

  if (bdi < faixaTCU.min) {
    alertas.push({
      tipo: 'warning',
      codigo: 'BDI_ABAIXO_FAIXA',
      mensagem: `BDI abaixo da faixa TCU para ${tipo}`,
      detalhe: `BDI de ${bdi.toFixed(2)}% está abaixo do mínimo de ${faixaTCU.min}%. Pode indicar inexequibilidade.`,
      referenciaLegal: 'Acórdão TCU 2622/2013',
    });
  }

  if (bdi > faixaTCU.max) {
    alertas.push({
      tipo: 'warning',
      codigo: 'BDI_ACIMA_FAIXA',
      mensagem: `BDI acima da faixa TCU para ${tipo}`,
      detalhe: `BDI de ${bdi.toFixed(2)}% está acima do máximo de ${faixaTCU.max}%. Pode ser questionado.`,
      referenciaLegal: 'Acórdão TCU 2622/2013',
    });
  }

  // Verificar componentes individuais
  for (const [key, value] of Object.entries(comp)) {
    if (key === 'tributos') {continue;}
    const compKey = key as keyof typeof BDI_COMPONENTS;
    const range = BDI_COMPONENTS[compKey];
    if (range && (value < range.min || value > range.max)) {
      alertas.push({
        tipo: 'info',
        codigo: `COMPONENTE_FORA_FAIXA_${key.toUpperCase()}`,
        mensagem: `${range.label} fora da faixa recomendada`,
        detalhe: `Valor de ${value}% está fora da faixa ${range.min}-${range.max}%`,
      });
    }
  }

  const result: BDIResult = {
    bdi,
    multiplicador,
    dentroFaixaTCU,
    faixaTCU,
    componentes: comp,
    detalhamento: {
      somaIndiretos: somaIndiretos * 100,
      fatorIndiretos,
      fatorDF,
      fatorLucro,
      fatorTributos,
      totalTributos,
    },
    alertas,
  };

  state.calculationsPerformed++;
  state.lastResult = result;

  // Emitir evento
  eventBus.emit('calc:completed', {
    calculatorType: 'bdi',
    success: true,
    result: { bdi, multiplicador, tipo },
    timestamp: Date.now(),
    source: 'bidding-assistant',
  });

  return result;
}

/**
 * Calcula BDI reverso a partir do preço final
 */
export function calcularBDIReverso(
  custoDirecto: number,
  precoFinal: number
): number {
  if (custoDirecto <= 0 || precoFinal <= 0) {return 0;}
  return ((precoFinal / custoDirecto) - 1) * 100;
}

/**
 * Calcula preço final a partir do custo e BDI
 */
export function calcularPrecoFinal(custoDirecto: number, bdi: number): number {
  return custoDirecto * (1 + bdi / 100);
}

/**
 * Calcula custo máximo para atingir preço alvo
 */
export function calcularCustoMaximo(precoAlvo: number, bdi: number): number {
  return precoAlvo / (1 + bdi / 100);
}

// ============================================================================
// Proposal Analysis Helper Types
// ============================================================================

/** Resultado da análise de referência */
interface ReferenceAnalysisResult {
  comparacao: ProposalAnalysis['comparacaoReferencia'];
  alertas: BiddingAlert[];
  sugestoes: string[];
}

/** Resultado do cálculo de scores */
interface ScoreCalculationResult {
  scoreCompetitividade: number;
  scoreRisco: number;
  sugestoes: string[];
}

// ============================================================================
// Proposal Analysis Helpers
// ============================================================================

/**
 * Verifica consistência entre BDI informado e calculado
 */
function verificarConsistenciaBDI(
  bdiImplicito: number,
  bdiAplicado: number
): BiddingAlert | null {
  const diferencaBDI = Math.abs(bdiImplicito - bdiAplicado);
  if (diferencaBDI > 0.5) {
    return {
      tipo: 'error',
      codigo: 'BDI_INCONSISTENTE',
      mensagem: 'BDI informado não confere com o calculado',
      detalhe: `BDI informado: ${bdiAplicado.toFixed(2)}%, BDI calculado: ${bdiImplicito.toFixed(2)}%`,
    };
  }
  return null;
}

/**
 * Verifica conformidade com faixa TCU
 */
function verificarFaixaTCU(
  bdiImplicito: number,
  faixaTCU: { min: number; max: number }
): { alertas: BiddingAlert[]; sugestoes: string[] } {
  const alertas: BiddingAlert[] = [];
  const sugestoes: string[] = [];

  if (bdiImplicito < faixaTCU.min * 0.8) {
    alertas.push({
      tipo: 'error',
      codigo: 'POSSIVEL_INEXEQUIBILIDADE',
      mensagem: 'Possível preço inexequível',
      detalhe: `BDI muito abaixo da faixa TCU pode indicar preço inexequível.`,
      referenciaLegal: 'Art. 59, Lei 14.133/2021',
    });
    sugestoes.push(
      'Revise os custos para garantir que cobrem todas as despesas.'
    );
  }

  if (bdiImplicito > faixaTCU.max * 1.2) {
    alertas.push({
      tipo: 'warning',
      codigo: 'BDI_ELEVADO',
      mensagem: 'BDI significativamente acima da faixa',
      detalhe: `Proposta pode perder competitividade ou ser questionada.`,
    });
    sugestoes.push(
      'Considere revisar os componentes do BDI para maior competitividade.'
    );
  }

  return { alertas, sugestoes };
}

/**
 * Compara proposta com valor de referência
 */
function compararComReferencia(
  precoFinal: number,
  valorReferencia: number | undefined
): ReferenceAnalysisResult {
  const alertas: BiddingAlert[] = [];
  const sugestoes: string[] = [];

  if (!valorReferencia || valorReferencia <= 0) {
    return { comparacao: undefined, alertas, sugestoes };
  }

  const percentualDiferenca =
    ((precoFinal - valorReferencia) / valorReferencia) * 100;

  if (percentualDiferenca > 0) {
    alertas.push({
      tipo: 'error',
      codigo: 'ACIMA_REFERENCIA',
      mensagem: 'Preço acima do valor de referência',
      detalhe: `Proposta ${percentualDiferenca.toFixed(2)}% acima da referência. Será desclassificada.`,
      referenciaLegal: 'Art. 59, §3°, Lei 14.133/2021',
    });
    return { comparacao: { percentualDiferenca, status: 'acima' }, alertas, sugestoes };
  }

  if (percentualDiferenca < -30) {
    alertas.push({
      tipo: 'warning',
      codigo: 'MUITO_ABAIXO_REFERENCIA',
      mensagem: 'Preço muito abaixo da referência',
      detalhe: `Proposta ${Math.abs(percentualDiferenca).toFixed(2)}% abaixo. Pode ser considerada inexequível.`,
    });
    sugestoes.push(
      'Prepare justificativa técnica para demonstrar exequibilidade.'
    );
    return { comparacao: { percentualDiferenca, status: 'abaixo' }, alertas, sugestoes };
  }

  // Dentro da faixa aceitável
  if (percentualDiferenca < -10) {
    alertas.push({
      tipo: 'success',
      codigo: 'BOA_COMPETITIVIDADE',
      mensagem: 'Boa posição competitiva',
      detalhe: `Proposta ${Math.abs(percentualDiferenca).toFixed(2)}% abaixo da referência com margem saudável.`,
    });
  }
  return { comparacao: { percentualDiferenca, status: 'dentro' }, alertas, sugestoes };
}

/**
 * Calcula scores de competitividade e risco
 */
function calcularScores(
  comparacaoReferencia: ProposalAnalysis['comparacaoReferencia'],
  bdiImplicito: number,
  faixaTCU: { min: number; max: number }
): ScoreCalculationResult {
  const sugestoes: string[] = [];
  let scoreCompetitividade = 50;
  let scoreRisco: number;

  // Ajustar competitividade baseado na comparação
  if (comparacaoReferencia?.status === 'abaixo') {
    scoreCompetitividade = Math.min(
      100,
      70 + Math.abs(comparacaoReferencia.percentualDiferenca)
    );
  } else if (comparacaoReferencia?.status === 'acima') {
    scoreCompetitividade = Math.max(
      0,
      30 - comparacaoReferencia.percentualDiferenca
    );
  }

  // Ajustar risco baseado no BDI
  if (bdiImplicito < faixaTCU.min) {
    scoreRisco = Math.min(100, 50 + (faixaTCU.min - bdiImplicito) * 5);
    sugestoes.push('Considere aumentar o BDI para cobrir riscos adequadamente.');
  } else if (bdiImplicito > faixaTCU.max) {
    scoreRisco = Math.min(100, 50 + (bdiImplicito - faixaTCU.max) * 3);
  } else {
    scoreRisco = 30; // Dentro da faixa = baixo risco
  }

  return { scoreCompetitividade, scoreRisco, sugestoes };
}

/**
 * Verifica se há erros críticos nos alertas
 */
function temErrosCriticos(alertas: BiddingAlert[]): boolean {
  return alertas.some(
    (a) =>
      a.tipo === 'error' &&
      (a.codigo === 'ACIMA_REFERENCIA' || a.codigo === 'POSSIVEL_INEXEQUIBILIDADE')
  );
}

// ============================================================================
// Proposal Analysis
// ============================================================================

/**
 * Analisa uma proposta de licitação
 */
export function analisarProposta(proposta: BiddingProposal): ProposalAnalysis {
  const alertas: BiddingAlert[] = [];
  const sugestoes: string[] = [];

  // Calcular BDI implícito
  const bdiImplicito = calcularBDIReverso(proposta.custoDirecto, proposta.precoFinal);
  const faixaTCU = BDI_RANGES[proposta.tipo];

  // Verificar consistência do BDI
  const alertaBDI = verificarConsistenciaBDI(bdiImplicito, proposta.bdiAplicado);
  if (alertaBDI) {
    alertas.push(alertaBDI);
  }

  // Verificar faixa TCU
  const analisesTCU = verificarFaixaTCU(bdiImplicito, faixaTCU);
  alertas.push(...analisesTCU.alertas);
  sugestoes.push(...analisesTCU.sugestoes);

  // Comparar com valor de referência
  const analisesReferencia = compararComReferencia(proposta.precoFinal, proposta.valorReferencia);
  alertas.push(...analisesReferencia.alertas);
  sugestoes.push(...analisesReferencia.sugestoes);

  // Calcular scores
  const scores = calcularScores(analisesReferencia.comparacao, bdiImplicito, faixaTCU);
  sugestoes.push(...scores.sugestoes);

  return {
    valida: !temErrosCriticos(alertas),
    scoreCompetitividade: scores.scoreCompetitividade,
    scoreRisco: scores.scoreRisco,
    bdiImplicito,
    comparacaoReferencia: analisesReferencia.comparacao,
    alertas,
    sugestoes,
  };
}

// ============================================================================
// Suggestions Generation
// ============================================================================

/**
 * Gera sugestões do Co-Piloto para licitações
 */
export function gerarSugestoesBidding(
  contexto: {
    tela: string;
    acao: string;
    dados?: Record<string, unknown>;
  },
  _userContext?: UserContext
): CreateSuggestionInput[] {
  const sugestoes: CreateSuggestionInput[] = [];

  // Sugestão ao iniciar cálculo de BDI
  if (contexto.tela === 'bdi-calculator' && contexto.acao === 'start') {
    sugestoes.push({
      type: 'hint',
      priority: 'medium',
      category: 'bidding',
      title: 'Dica: Faixas TCU',
      message:
        'O TCU recomenda BDI entre 20-25% para obras, 25-30% para serviços.',
      details:
        'Valores fora dessa faixa podem ser questionados. Prepare justificativa se necessário.',
      confidence: 0.9,
    });
  }

  // Sugestão ao ver BDI fora da faixa
  if (contexto.acao === 'bdi-calculated' && contexto.dados?.fora_faixa) {
    sugestoes.push({
      type: 'warning',
      priority: 'high',
      category: 'bidding',
      title: 'BDI Fora da Faixa TCU',
      message: 'Seu BDI está fora da faixa recomendada pelo TCU.',
      details:
        'Isso não impede a participação, mas pode gerar questionamentos. Tenha documentação de suporte.',
      context: {
        screen: contexto.tela,
        trigger: 'bdi_fora_faixa',
        data: contexto.dados,
      },
      confidence: 0.95,
    });
  }

  // Sugestão sobre desoneração
  if (contexto.acao === 'editing-taxes' && !state.config.usarCPRB) {
    sugestoes.push({
      type: 'opportunity',
      priority: 'low',
      category: 'bidding',
      title: 'Considere a Desoneração',
      message:
        'Sua empresa pode ser elegível à desoneração da folha (CPRB).',
      details:
        'Se aplicável, isso pode reduzir seus custos e aumentar competitividade. Consulte seu contador.',
      confidence: 0.6,
    });
  }

  return sugestoes;
}

/**
 * Converte análise em sugestões do Co-Piloto
 */
export function analysisToSuggestions(
  analysis: ProposalAnalysis
): CreateSuggestionInput[] {
  const suggestions: CreateSuggestionInput[] = [];

  for (const alerta of analysis.alertas) {
    suggestions.push({
      type: mapAlertTipoToType(alerta.tipo),
      priority: mapAlertTipoToPriority(alerta.tipo),
      category: 'bidding',
      title: alerta.mensagem,
      message: alerta.detalhe ?? alerta.mensagem,
      details: alerta.referenciaLegal
        ? `Referência: ${alerta.referenciaLegal}`
        : undefined,
      confidence: 0.9,
    });
  }

  for (const sugestao of analysis.sugestoes) {
    suggestions.push({
      type: 'optimization',
      priority: 'low',
      category: 'bidding',
      title: 'Sugestão de Melhoria',
      message: sugestao,
      confidence: 0.7,
    });
  }

  return suggestions;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Obtém faixas de BDI por tipo
 */
export function getFaixasBDI(): typeof BDI_RANGES {
  return { ...BDI_RANGES };
}

/**
 * Obtém componentes padrão do BDI
 */
export function getComponentesPadrao(): typeof BDI_COMPONENTS {
  return { ...BDI_COMPONENTS };
}

/**
 * Obtém tributos padrão
 */
export function getTributosPadrao(): typeof BDI_TAXES {
  return { ...BDI_TAXES };
}

/**
 * Obtém estatísticas do engine
 */
export function getBiddingStats(): {
  initialized: boolean;
  calculationsPerformed: number;
  lastBDI: number | null;
  config: BiddingConfig;
} {
  return {
    initialized: state.initialized,
    calculationsPerformed: state.calculationsPerformed,
    lastBDI: state.lastResult?.bdi ?? null,
    config: { ...state.config },
  };
}

// ============================================================================
// Exports
// ============================================================================

export const biddingAssistant = {
  init: initBiddingAssistant,
  shutdown: shutdownBiddingAssistant,
  updateConfig: updateBiddingConfig,
  calcularBDI,
  calcularBDIReverso,
  calcularPrecoFinal,
  calcularCustoMaximo,
  analisarProposta,
  gerarSugestoes: gerarSugestoesBidding,
  analysisToSuggestions,
  getFaixas: getFaixasBDI,
  getComponentes: getComponentesPadrao,
  getTributos: getTributosPadrao,
  getStats: getBiddingStats,
};

export default biddingAssistant;
