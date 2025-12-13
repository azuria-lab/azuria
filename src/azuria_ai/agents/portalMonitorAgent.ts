/**
 * Portal Monitor Agent - Agente Autônomo de Monitoramento de Licitações
 *
 * Este agente é responsável por:
 * - Monitoramento contínuo de portais de licitação (24/7)
 * - Detecção automática de novos editais
 * - Análise de relevância baseada em perfil do usuário
 * - Alertas inteligentes em tempo real
 * - Extração automática de dados dos editais
 * - Estimativa de probabilidade de vitória
 *
 * @module azuria_ai/agents/portalMonitorAgent
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Supabase Helper (para tabelas sem tipagem)
// ============================================================================

// Helper para operações em tabelas não tipadas
const untypedFrom = (table: string) => supabase.from(table as never) as ReturnType<typeof supabase.from>;

// ============================================================================
// Constants
// ============================================================================

/** Intervalo de monitoramento (ms) */
const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutos

/** Timeout para requisições (ms) */
const REQUEST_TIMEOUT = 30000; // 30s

/** Máximo de editais por execução */
const MAX_EDITAIS_PER_RUN = 50;

/** Confiança mínima para alertar */
const MIN_ALERT_CONFIDENCE = 0.6;

// ============================================================================
// Types
// ============================================================================

/** Portal de licitação */
export interface LicitacaoPortal {
  /** ID único do portal */
  id: string;
  /** Nome do portal */
  name: string;
  /** URL base */
  baseUrl: string;
  /** Tipo de portal */
  type: 'comprasnet' | 'bll' | 'licitacoes-e' | 'municipal' | 'estadual' | 'custom';
  /** Se está ativo */
  enabled: boolean;
  /** Credenciais (se necessário) */
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
  };
  /** Última sincronização */
  lastSyncAt?: number;
  /** Configurações de scraping */
  scraping?: {
    selectors: {
      editalList: string;
      editalItem: string;
      numero: string;
      orgao: string;
      objeto: string;
      dataAbertura: string;
      modalidade: string;
    };
    paginationSelector?: string;
    maxPages?: number;
  };
}

/** Perfil de interesse do usuário */
export interface UserInterestProfile {
  /** ID do usuário */
  userId: string;
  /** Palavras-chave de interesse */
  keywords: string[];
  /** Modalidades de interesse */
  modalidades?: string[];
  /** Órgãos de interesse */
  orgaos?: string[];
  /** Faixa de valor (min, max) */
  valorRange?: {
    min?: number;
    max?: number;
  };
  /** Estados de interesse */
  estados?: string[];
  /** Cidades de interesse */
  cidades?: string[];
  /** Categoria de produtos/serviços */
  categorias?: string[];
  /** Nível de experiência da empresa */
  experienceLevel?: 'iniciante' | 'intermediario' | 'avancado';
  /** Certificações que possui */
  certificacoes?: string[];
}

/** Edital detectado */
export interface DetectedEdital {
  /** ID único */
  id: string;
  /** Portal de origem */
  portalId: string;
  /** Número do edital */
  numero: string;
  /** Órgão licitante */
  orgao: string;
  /** Objeto da licitação */
  objeto: string;
  /** Modalidade */
  modalidade: string;
  /** Data de abertura */
  dataAbertura: Date;
  /** Data limite para proposta */
  dataLimite?: Date;
  /** Valor estimado */
  valorEstimado?: number;
  /** URL do edital */
  url: string;
  /** Status */
  status: 'novo' | 'analisado' | 'interessante' | 'ignorado';
  /** Score de relevância (0-1) */
  relevanceScore: number;
  /** Probabilidade de vitória estimada (0-1) */
  winProbability?: number;
  /** Razões da relevância */
  relevanceReasons: string[];
  /** Detectado em */
  detectedAt: number;
  /** Dados completos extraídos */
  fullData?: Record<string, unknown>;
}

/** Alerta gerado */
export interface GeneratedAlert {
  /** ID do alerta */
  id: string;
  /** ID do edital */
  editalId: string;
  /** ID do usuário */
  userId: string;
  /** Tipo de alerta */
  type: 'novo_edital' | 'prazo_proximo' | 'alta_relevancia' | 'baixa_concorrencia';
  /** Título */
  title: string;
  /** Mensagem */
  message: string;
  /** Urgência */
  urgency: 'low' | 'medium' | 'high' | 'critical';
  /** Se foi lido */
  read: boolean;
  /** Ações sugeridas */
  suggestedActions: Array<{
    type: 'download_edital' | 'calcular_bdi' | 'preparar_proposta' | 'consultar_legislacao';
    label: string;
    data?: { url?: string; editalId?: string; query?: string };
  }>;
  /** Criado em */
  createdAt: number;
}

/** Estatísticas de monitoramento */
export interface MonitorStats {
  /** Total de portais monitorados */
  portaisMonitorados: number;
  /** Total de editais detectados */
  editaisDetectados: number;
  /** Editais relevantes */
  editaisRelevantes: number;
  /** Alertas gerados */
  alertasGerados: number;
  /** Última execução */
  lastRunAt: number;
  /** Próxima execução */
  nextRunAt: number;
  /** Se está rodando */
  isRunning: boolean;
  /** Erros recentes */
  recentErrors: Array<{
    portalId: string;
    error: string;
    timestamp: number;
  }>;
}

/** Configuração do agente */
export interface PortalMonitorConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Intervalo de monitoramento (ms) */
  interval: number;
  /** Se deve auto-analisar editais */
  autoAnalyze: boolean;
  /** Se deve gerar alertas automaticamente */
  autoAlert: boolean;
  /** Se deve fazer scraping de portais */
  enableScraping: boolean;
  /** Portais a monitorar */
  portals: LicitacaoPortal[];
  /** Timeout */
  timeout: number;
}

/** Licitação retornada pela API ComprasNet */
interface ComprasNetLicitacao {
  numeroLicitacao: string;
  orgao?: { nome?: string };
  objeto?: string;
  modalidade?: { descricao?: string };
  dataAbertura: string;
  valorEstimado?: number;
}

/** Row de alerta do banco de dados */
interface AlertRow {
  id: string;
  edital_id: string;
  user_id: string;
  type: GeneratedAlert['type'];
  title: string;
  message: string;
  urgency: GeneratedAlert['urgency'];
  read: boolean;
  suggested_actions: GeneratedAlert['suggestedActions'];
  created_at: string;
}

/** Estado do agente */
interface AgentState {
  initialized: boolean;
  running: boolean;
  config: PortalMonitorConfig;
  stats: MonitorStats;
  intervalId?: NodeJS.Timeout;
  currentRun?: {
    startedAt: number;
    portalsProcessed: number;
    editaisFound: number;
  };
}

// ============================================================================
// State
// ============================================================================

const state: AgentState = {
  initialized: false,
  running: false,
  config: {
    enabled: true,
    interval: MONITOR_INTERVAL,
    autoAnalyze: true,
    autoAlert: true,
    enableScraping: true,
    portals: [],
    timeout: REQUEST_TIMEOUT,
  },
  stats: {
    portaisMonitorados: 0,
    editaisDetectados: 0,
    editaisRelevantes: 0,
    alertasGerados: 0,
    lastRunAt: 0,
    nextRunAt: 0,
    isRunning: false,
    recentErrors: [],
  },
};

// ============================================================================
// Portal Scrapers
// ============================================================================

/**
 * Scraper genérico usando seletores CSS
 */
async function scrapePortalGeneric(portal: LicitacaoPortal): Promise<DetectedEdital[]> {
  if (!portal.scraping) {
    throw new Error('Portal scraping config not found');
  }

  try {
    // Nota: Em produção real, usar puppeteer/playwright para scraping
    // Por enquanto, simulamos a estrutura
    
    const response = await fetch(portal.baseUrl, {
      signal: AbortSignal.timeout(state.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Parsing real com DOMParser ou Cheerio - retorna array vazio (estrutura pronta)
    await response.text();
    
    structuredLogger.info('[PortalMonitor] Portal scraped', {
      data: { portalId: portal.id, portalName: portal.name },
    });

    return [];

  } catch (error) {
    structuredLogger.error(
      '[PortalMonitor] Error scraping portal',
      error instanceof Error ? error : new Error(String(error)),
      { data: { portalId: portal.id } }
    );
    throw error;
  }
}

/**
 * Scraper para ComprasNet (Portal Federal)
 */
async function scrapeComprasNet(): Promise<DetectedEdital[]> {
  try {
    // ComprasNet usa API REST
    const apiUrl = 'https://compras.dados.gov.br/licitacoes/v1/licitacoes.json';
    
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(state.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`ComprasNet API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Mapear para formato padronizado
    const editais: DetectedEdital[] = data._embedded?.licitacoes?.slice(0, MAX_EDITAIS_PER_RUN).map((lic: ComprasNetLicitacao) => ({
      id: `comprasnet-${lic.numeroLicitacao}`,
      portalId: 'comprasnet',
      numero: lic.numeroLicitacao,
      orgao: lic.orgao?.nome || 'Órgão não informado',
      objeto: lic.objeto || 'Objeto não informado',
      modalidade: lic.modalidade?.descricao || 'Não informado',
      dataAbertura: new Date(lic.dataAbertura),
      valorEstimado: lic.valorEstimado,
      url: `https://www.gov.br/compras/pt-br/acesso-a-informacao/licitacoes-e-contratos/avisos-de-licitacao/${lic.numeroLicitacao}`,
      status: 'novo' as const,
      relevanceScore: 0,
      relevanceReasons: [],
      detectedAt: Date.now(),
      fullData: lic as unknown as Record<string, unknown>,
    })) || [];

    structuredLogger.info('[PortalMonitor] ComprasNet scraped', {
      data: { editais: editais.length },
    });

    return editais;

  } catch (error) {
    structuredLogger.error(
      '[PortalMonitor] Error scraping ComprasNet',
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

/**
 * Scraper para BLL (Bolsa de Licitações e Leilões)
 */
async function scrapeBLL(): Promise<DetectedEdital[]> {
  try {
    // BLL tem API pública - integração pendente
    
    structuredLogger.info('[PortalMonitor] BLL scraping not implemented yet');
    return [];
    
  } catch (error) {
    structuredLogger.error(
      '[PortalMonitor] Error scraping BLL',
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

// ============================================================================
// Relevance Analysis
// ============================================================================

/**
 * Calcula score de relevância de um edital para um usuário
 */
async function calculateRelevance(
  edital: DetectedEdital,
  profile: UserInterestProfile
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];
  const weights = {
    keyword: 0.3,
    modalidade: 0.15,
    orgao: 0.1,
    valor: 0.2,
    localizacao: 0.15,
    categoria: 0.1,
  };

  // 1. Keywords no objeto
  const objetoLower = edital.objeto.toLowerCase();
  const matchedKeywords = profile.keywords.filter(kw => 
    objetoLower.includes(kw.toLowerCase())
  );
  
  if (matchedKeywords.length > 0) {
    const keywordScore = Math.min(matchedKeywords.length / profile.keywords.length, 1);
    score += keywordScore * weights.keyword;
    reasons.push(`Contém ${matchedKeywords.length} palavra(s)-chave: ${matchedKeywords.join(', ')}`);
  }

  // 2. Modalidade
  if (profile.modalidades?.includes(edital.modalidade)) {
    score += weights.modalidade;
    reasons.push(`Modalidade de interesse: ${edital.modalidade}`);
  }

  // 3. Órgão
  if (profile.orgaos?.some(org => edital.orgao.toLowerCase().includes(org.toLowerCase()))) {
    score += weights.orgao;
    reasons.push('Órgão de interesse');
  }

  // 4. Valor
  if (edital.valorEstimado && profile.valorRange) {
    const { min, max } = profile.valorRange;
    if (
      (!min || edital.valorEstimado >= min) &&
      (!max || edital.valorEstimado <= max)
    ) {
      score += weights.valor;
      reasons.push(`Valor dentro da faixa: R$ ${edital.valorEstimado.toLocaleString('pt-BR')}`);
    }
  }

  // 5. Categoria (usando RAG para classificação semântica)
  if (profile.categorias && profile.categorias.length > 0) {
    // Usar RAG para match semântico (pendente implementação)
    score += weights.categoria * 0.5; // Score parcial por enquanto
  }

  // Normalizar score (0-1)
  score = Math.min(score, 1);

  return { score, reasons };
}

/** Calcula ajuste de probabilidade baseado no nível de experiência */
function getExperienceBonus(level?: 'iniciante' | 'intermediario' | 'avancado'): number {
  const bonusMap: Record<string, number> = {
    avancado: 0.2,
    intermediario: 0.1,
    iniciante: 0,
  };
  return bonusMap[level ?? 'iniciante'] ?? 0;
}

/** Calcula ajuste baseado em certificações e categorias */
function getSpecializationBonus(profile: UserInterestProfile): number {
  let bonus = 0;
  if (profile.certificacoes && profile.certificacoes.length > 0) {
    bonus += 0.15;
  }
  if (profile.categorias && profile.categorias.length <= 3) {
    bonus += 0.1; // Especialização em poucas categorias aumenta chances
  }
  return bonus;
}

/** Calcula ajuste baseado no valor do edital vs faixa ideal */
function getValueFitBonus(valorEstimado: number | undefined, valorRange?: UserInterestProfile['valorRange']): number {
  if (!valorEstimado || !valorRange?.min || !valorRange?.max) {
    return 0;
  }
  const midRange = (valorRange.min + valorRange.max) / 2;
  const deviation = Math.abs(valorEstimado - midRange) / midRange;
  return deviation < 0.3 ? 0.1 : 0;
}

/**
 * Estima probabilidade de vitória em uma licitação
 */
async function estimateWinProbability(
  edital: DetectedEdital,
  profile: UserInterestProfile
): Promise<number> {
  let probability = 0.5; // Base neutra

  probability += getExperienceBonus(profile.experienceLevel);
  probability += getSpecializationBonus(profile);
  probability += getValueFitBonus(edital.valorEstimado, profile.valorRange);

  // Modalidade favorável (pregão é mais competitivo)
  if (profile.modalidades?.includes('pregão')) {
    probability -= 0.05;
  }

  // Normalizar (0-1)
  return Math.max(0, Math.min(probability, 1));
}

// ============================================================================
// Alert Generation
// ============================================================================

/**
 * Gera alerta para edital relevante
 */
async function generateAlert(
  edital: DetectedEdital,
  profile: UserInterestProfile
): Promise<GeneratedAlert> {
  
  // Determinar tipo e urgência
  let type: GeneratedAlert['type'] = 'novo_edital';
  let urgency: GeneratedAlert['urgency'] = 'medium';

  if (edital.relevanceScore >= 0.8) {
    type = 'alta_relevancia';
    urgency = 'high';
  }

  const diasAteAbertura = edital.dataAbertura 
    ? Math.ceil((edital.dataAbertura.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 999;

  if (diasAteAbertura <= 3) {
    type = 'prazo_proximo';
    urgency = 'critical';
  }

  // Construir mensagem
  const title = `Novo edital relevante: ${edital.numero}`;
  const message = `
${edital.orgao} publicou edital que pode interessar você!

📋 **Objeto**: ${edital.objeto.substring(0, 200)}${edital.objeto.length > 200 ? '...' : ''}

💰 **Valor Estimado**: ${edital.valorEstimado ? `R$ ${edital.valorEstimado.toLocaleString('pt-BR')}` : 'Não informado'}

🎯 **Relevância**: ${(edital.relevanceScore * 100).toFixed(0)}%

📅 **Abertura**: ${edital.dataAbertura.toLocaleDateString('pt-BR')}

${edital.winProbability ? `🏆 **Probabilidade de Vitória**: ${(edital.winProbability * 100).toFixed(0)}%\n` : ''}

**Por que é relevante**:
${edital.relevanceReasons.map(r => `• ${r}`).join('\n')}
`.trim();

  // Ações sugeridas - construir array com spread para evitar múltiplos push
  const needsBdi = edital.modalidade.toLowerCase().includes('pregão') || edital.objeto.toLowerCase().includes('obra');
  
  const suggestedActions: GeneratedAlert['suggestedActions'] = [
    {
      type: 'download_edital',
      label: 'Baixar Edital Completo',
      data: { url: edital.url },
    },
    ...(needsBdi ? [{
      type: 'calcular_bdi' as const,
      label: 'Calcular BDI',
      data: { editalId: edital.id },
    }] : []),
    {
      type: 'preparar_proposta',
      label: 'Iniciar Proposta',
      data: { editalId: edital.id },
    },
    {
      type: 'consultar_legislacao',
      label: 'Consultar Legislação',
      data: { query: `${edital.modalidade} ${edital.objeto}` },
    },
  ];

  const alert: GeneratedAlert = {
    id: `alert-${edital.id}-${Date.now()}`,
    editalId: edital.id,
    userId: profile.userId,
    type,
    title,
    message,
    urgency,
    read: false,
    suggestedActions,
    createdAt: Date.now(),
  };

  return alert;
}

/**
 * Obtém editais de um portal baseado no tipo
 */
async function scrapePortalByType(portal: LicitacaoPortal): Promise<DetectedEdital[]> {
  switch (portal.type) {
    case 'comprasnet':
      return scrapeComprasNet();
    case 'bll':
      return scrapeBLL();
    default:
      return portal.scraping ? scrapePortalGeneric(portal) : [];
  }
}

/**
 * Verifica se edital já existe no banco
 */
async function editalExists(numero: string, orgao: string): Promise<boolean> {
  const { data } = await untypedFrom('detected_editais')
    .select('id')
    .eq('numero', numero)
    .eq('orgao', orgao)
    .single();
  return Boolean(data);
}

/**
 * Salva alerta e emite evento
 */
async function saveAndEmitAlert(
  alert: GeneratedAlert,
  edital: DetectedEdital,
  score: number
): Promise<void> {
  await untypedFrom('alerts').insert({
    id: alert.id,
    edital_id: alert.editalId,
    user_id: alert.userId,
    type: alert.type,
    title: alert.title,
    message: alert.message,
    urgency: alert.urgency,
    read: alert.read,
    suggested_actions: alert.suggestedActions,
    created_at: new Date(alert.createdAt).toISOString(),
  });

  state.stats.alertasGerados++;

  eventBus.emit('notification:alert' as import('../core/eventBus').EventType, {
    alert,
    edital,
    timestamp: Date.now(),
  });

  structuredLogger.info('[PortalMonitor] Alert generated', {
    data: { alertId: alert.id, editalNumero: edital.numero, relevanceScore: score },
  });
}

/**
 * Salva edital no banco de dados
 */
async function saveEditalToDatabase(edital: DetectedEdital): Promise<void> {
  await untypedFrom('detected_editais').insert({
    id: edital.id,
    portal_id: edital.portalId,
    numero: edital.numero,
    orgao: edital.orgao,
    objeto: edital.objeto,
    modalidade: edital.modalidade,
    data_abertura: edital.dataAbertura.toISOString(),
    valor_estimado: edital.valorEstimado,
    url: edital.url,
    status: edital.status,
    relevance_score: edital.relevanceScore,
    win_probability: edital.winProbability,
    relevance_reasons: edital.relevanceReasons,
    detected_at: new Date(edital.detectedAt).toISOString(),
    full_data: edital.fullData,
  });
  state.stats.editaisDetectados++;
}

/**
 * Processa edital contra perfil de usuário
 */
async function processEditalForProfile(
  edital: DetectedEdital,
  profile: UserInterestProfile
): Promise<void> {
  const { score, reasons } = await calculateRelevance(edital, profile);
  edital.relevanceScore = score;
  edital.relevanceReasons = reasons;

  if (score < MIN_ALERT_CONFIDENCE) {
    return;
  }

  edital.winProbability = await estimateWinProbability(edital, profile);
  edital.status = 'interessante';
  state.stats.editaisRelevantes++;

  if (state.config.autoAlert) {
    const alert = await generateAlert(edital, profile);
    await saveAndEmitAlert(alert, edital, score);
  }
}

/**
 * Processa um único portal
 */
async function processPortal(
  portal: LicitacaoPortal,
  profiles: UserInterestProfile[]
): Promise<void> {
  if (state.currentRun) {
    state.currentRun.portalsProcessed++;
  }

  const editais = await scrapePortalByType(portal);
  if (state.currentRun) {
    state.currentRun.editaisFound += editais.length;
  }

  for (const edital of editais) {
    if (await editalExists(edital.numero, edital.orgao)) {
      continue;
    }

    for (const profile of profiles) {
      await processEditalForProfile(edital, profile);
    }

    await saveEditalToDatabase(edital);
  }

  await untypedFrom('portals')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', portal.id);
}

/**
 * Registra erro de processamento de portal
 */
function recordPortalError(portalId: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
  state.stats.recentErrors.push({
    portalId,
    error: errorMessage,
    timestamp: Date.now(),
  });

  if (state.stats.recentErrors.length > 10) {
    state.stats.recentErrors.shift();
  }

  structuredLogger.error(
    '[PortalMonitor] Error processing portal',
    error instanceof Error ? error : new Error(errorMessage),
    { data: { portalId } }
  );
}

// ============================================================================
// Main Monitoring Loop
// ============================================================================

/**
 * Executa uma rodada de monitoramento
 */
async function runMonitoringCycle(): Promise<void> {
  if (state.stats.isRunning) {
    structuredLogger.warn('[PortalMonitor] Cycle already running, skipping');
    return;
  }

  state.stats.isRunning = true;
  state.currentRun = {
    startedAt: Date.now(),
    portalsProcessed: 0,
    editaisFound: 0,
  };

  structuredLogger.info('[PortalMonitor] Starting monitoring cycle');

  try {
    const { data: profiles } = await untypedFrom('user_interest_profiles')
      .select('*')
      .eq('enabled', true);

    if (!profiles || profiles.length === 0) {
      structuredLogger.info('[PortalMonitor] No active user profiles found');
      return;
    }

    for (const portal of state.config.portals.filter(p => p.enabled)) {
      try {
        await processPortal(portal, profiles as UserInterestProfile[]);
      } catch (error) {
        recordPortalError(portal.id, error);
      }
    }

    state.stats.lastRunAt = Date.now();
    state.stats.nextRunAt = Date.now() + state.config.interval;

    eventBus.emit('user:calculation', {
      stats: state.stats,
      duration: Date.now() - state.currentRun.startedAt,
      timestamp: Date.now(),
    });

    structuredLogger.info('[PortalMonitor] Cycle completed', {
      data: {
        portalsProcessed: state.currentRun.portalsProcessed,
        editaisFound: state.currentRun.editaisFound,
        editaisRelevantes: state.stats.editaisRelevantes,
        alertasGerados: state.stats.alertasGerados,
      },
      durationMs: Date.now() - state.currentRun.startedAt,
    });
  } catch (error) {
    structuredLogger.error(
      '[PortalMonitor] Error in monitoring cycle',
      error instanceof Error ? error : new Error(String(error))
    );
  } finally {
    state.stats.isRunning = false;
    state.currentRun = undefined;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Inicia o agente de monitoramento
 */
export function startPortalMonitor(config?: Partial<PortalMonitorConfig>): void {
  if (state.running) {
    structuredLogger.warn('[PortalMonitor] Already running');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  if (!state.config.enabled) {
    structuredLogger.info('[PortalMonitor] Disabled in config');
    return;
  }

  // Executar imediatamente
  runMonitoringCycle();

  // Agendar próximas execuções
  state.intervalId = setInterval(() => {
    runMonitoringCycle();
  }, state.config.interval);

  state.running = true;
  state.initialized = true;

  eventBus.emit('system:init', {
    config: state.config,
    timestamp: Date.now(),
  });

  structuredLogger.info('[PortalMonitor] Agent started', {
    data: {
      interval: state.config.interval,
      portals: state.config.portals.length,
    },
  });
}

/**
 * Para o agente
 */
export function stopPortalMonitor(): void {
  if (!state.running) {
    return;
  }

  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = undefined;
  }

  state.running = false;

  eventBus.emit('system:shutdown', {
    timestamp: Date.now(),
  });

  structuredLogger.info('[PortalMonitor] Agent stopped');
}

/**
 * Força uma execução imediata
 */
export async function forceMonitoringRun(): Promise<void> {
  await runMonitoringCycle();
}

/**
 * Adiciona portal ao monitoramento
 */
export async function addPortal(portal: LicitacaoPortal): Promise<void> {
  state.config.portals.push(portal);
  state.stats.portaisMonitorados = state.config.portals.filter(p => p.enabled).length;

  // Salvar no banco
  await untypedFrom('portals').insert({
    id: portal.id,
    name: portal.name,
    base_url: portal.baseUrl,
    type: portal.type,
    enabled: portal.enabled,
    scraping: portal.scraping,
  });

  structuredLogger.info('[PortalMonitor] Portal added', {
    data: { portalId: portal.id, name: portal.name },
  });
}

/**
 * Remove portal
 */
export async function removePortal(portalId: string): Promise<void> {
  state.config.portals = state.config.portals.filter(p => p.id !== portalId);
  state.stats.portaisMonitorados = state.config.portals.filter(p => p.enabled).length;

  await untypedFrom('portals').delete().eq('id', portalId);

  structuredLogger.info('[PortalMonitor] Portal removed', { data: { portalId } });
}

/**
 * Estatísticas
 */
export function getPortalMonitorStats(): MonitorStats {
  return { ...state.stats };
}

/**
 * Busca alertas do usuário
 */
export async function getUserAlerts(userId: string, limit = 50): Promise<GeneratedAlert[]> {
  const { data } = await untypedFrom('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) {return [];}

  return data.map((row: AlertRow) => ({
    id: row.id,
    editalId: row.edital_id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    urgency: row.urgency,
    read: row.read,
    suggestedActions: row.suggested_actions,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

/**
 * Marca alerta como lido
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  await untypedFrom('alerts')
    .update({ read: true })
    .eq('id', alertId);
}

// ============================================================================
// Export
// ============================================================================

export default {
  startPortalMonitor,
  stopPortalMonitor,
  forceMonitoringRun,
  addPortal,
  removePortal,
  getPortalMonitorStats,
  getUserAlerts,
  markAlertAsRead,
};
