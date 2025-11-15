/**
 * Bidding Module Types
 * 
 * Tipos e interfaces para o módulo completo de Licitações,
 * incluindo calculadora, dashboard e análises
 */

// ============================================
// ENUMS E CONSTANTES
// ============================================

/**
 * Tipos de licitação
 */
export enum BiddingType {
  PREGAO_ELETRONICO = 'pregao_eletronico',
  PREGAO_PRESENCIAL = 'pregao_presencial',
  CONCORRENCIA = 'concorrencia',
  TOMADA_PRECOS = 'tomada_precos',
  CONVITE = 'convite',
  CONCURSO = 'concurso',
  LEILAO = 'leilao',
  DIALOGO_COMPETITIVO = 'dialogo_competitivo',
  CREDENCIAMENTO = 'credenciamento',
  LICITACAO_PRIVADA = 'licitacao_privada', // Para licitações de empresas privadas
}

/**
 * Modalidades de julgamento
 */
export enum BiddingMode {
  MENOR_PRECO = 'menor_preco',
  MAIOR_DESCONTO = 'maior_desconto',
  MELHOR_TECNICA = 'melhor_tecnica',
  TECNICA_E_PRECO = 'tecnica_e_preco',
  MAIOR_LANCE = 'maior_lance',
  MAIOR_RETORNO_ECONOMICO = 'maior_retorno_economico',
}

/**
 * Status da licitação
 */
export enum BiddingStatus {
  RASCUNHO = 'rascunho',
  EM_ANALISE = 'em_analise',
  PROPOSTA_ENVIADA = 'proposta_enviada',
  EM_DISPUTA = 'em_disputa',
  VENCEDOR = 'vencedor',
  PERDEDOR = 'perdedor',
  DESCLASSIFICADO = 'desclassificado',
  CANCELADO = 'cancelado',
  DESERTO = 'deserto',
}

/**
 * Regimes tributários para licitação
 */
export enum BiddingTaxRegime {
  SIMPLES_NACIONAL = 'simples_nacional',
  LUCRO_PRESUMIDO = 'lucro_presumido',
  LUCRO_REAL = 'lucro_real',
  MEI = 'mei',
}

/**
 * Tipos de garantia
 */
export enum GuaranteeType {
  SEGURO_GARANTIA = 'seguro_garantia',
  CAUCAO_DINHEIRO = 'caucao_dinheiro',
  CAUCAO_TITULOS = 'caucao_titulos',
  FIANCA_BANCARIA = 'fianca_bancaria',
  NENHUMA = 'nenhuma',
}

/**
 * Nível de viabilidade
 */
export enum ViabilityLevel {
  INVIAVEL = 'inviavel',        // Margem < 0% ou < 2%
  CRITICO = 'critico',           // Margem 2-5%
  MODERADO = 'moderado',         // Margem 5-10%
  BOM = 'bom',                   // Margem 10-20%
  EXCELENTE = 'excelente',       // Margem > 20%
}

/**
 * Status macro (pipeline) da licitação dentro do Azúria
 */
export enum BiddingLifecycleStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  ARCHIVED = 'archived',
}

/**
 * Severidade de risco usada pelos alertas fiscais/jurídicos
 */
export enum BiddingRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Tipos de risco monitorados
 */
export enum BiddingRiskType {
  FINANCIAL = 'financial',
  FISCAL = 'fiscal',
  LEGAL = 'legal',
  OPERATIONAL = 'operational',
}

/**
 * Status de um item dentro do edital
 */
export enum BiddingItemStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
}

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Dados principais da licitação
 */
export interface BiddingData {
  id?: string;
  editalNumber: string;
  organ: string;
  type: BiddingType;
  mode: BiddingMode;
  openingDate: Date;
  editalLink?: string;
  description?: string;
  observations?: string;
  status: BiddingStatus;
  lifecycleStatus: BiddingLifecycleStatus;
  priority?: 'low' | 'medium' | 'high';
  deadline?: Date;
  estimatedValue?: number;
  responsible?: {
    name: string;
    email?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Anexos e documentos do edital
 */
export interface BiddingAttachment {
  id: string;
  name: string;
  type: 'edital' | 'planilha' | 'certidao' | 'outro';
  url?: string;
  sizeInBytes?: number;
  uploadedAt: Date;
  notes?: string;
}

/**
 * Requisitos e exigências fiscais/jurídicas
 */
export interface BiddingRequirement {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'fulfilled' | 'not_applicable';
  dueDate?: Date;
  attachmentId?: string;
}

/**
 * Item/Lote da licitação
 */
export interface BiddingItem {
  id?: string;
  itemNumber: string | number;
  description: string;
  quantity: number;
  unit: string;
  status?: BiddingItemStatus;
  
  // Custos base
  unitCost: number;
  manufacturingCost?: number;
  acquisitionCost?: number;
  
  // Custos operacionais
  logisticsCost?: number;
  transportCost?: number;
  storageCost?: number;
  installationCost?: number;
  
  // Custos administrativos
  administrativeCost?: number;
  laborCost?: number;
  
  // Outros
  otherCosts?: number;
  
  // Calculados
  totalCost?: number;
  totalCostWithTaxes?: number;
  score?: number; // usado em previsões
}

/**
 * Configuração de impostos
 */
export interface BiddingTaxConfig {
  regime: BiddingTaxRegime;
  
  // Impostos Federais
  pis: number;              // %
  cofins: number;           // %
  irpj: number;             // %
  csll: number;             // %
  
  // ICMS
  icms: number;             // %
  icmsOrigin?: string;
  icmsDestination?: string;
  
  // ISS (para serviços)
  iss?: number;             // %
  
  // Simples Nacional (alíquota total)
  simplesRate?: number;     // %
  
  // Encargos
  socialCharges?: number;   // %
  laborCharges?: number;    // %
}

/**
 * Configuração de garantias
 */
export interface BiddingGuarantee {
  type: GuaranteeType;
  percentage: number;       // % sobre o valor total
  value?: number;           // Valor calculado
  expirationDate?: Date;
  observations?: string;
}

/**
 * Estratégia de lance
 */
export interface BiddingStrategy {
  desiredMargin: number;               // % desejada
  minimumMargin: number;               // % mínima aceitável
  maximumDiscount: number;             // % máximo de desconto
  
  initialBid?: number;                 // Lance inicial
  minimumViableBid?: number;           // Lance mínimo viável
  breakEvenPrice?: number;             // Preço de equilíbrio
  
  competitiveAnalysis?: boolean;       // Analisar competitividade
  useAI?: boolean;                     // Usar IA para sugestões
}

/**
 * Resultado dos cálculos
 */
export interface BiddingCalculationResult {
  // Totais
  totalCost: number;
  totalTaxes: number;
  totalGuarantee: number;
  
  // Preços
  costWithTaxes: number;
  suggestedPrice: number;
  minimumPrice: number;
  breakEvenPrice: number;
  
  // Margens
  netProfit: number;
  profitMargin: number;              // %
  grossMargin: number;               // %
  
  // Viabilidade
  viability: ViabilityLevel;
  viabilityScore: number;            // 0-100
  
  // Análise
  warnings: string[];
  suggestions: string[];
  risks: string[];
}

/**
 * Simulação de cenário
 */
export interface BiddingScenario {
  id: string;
  name: string;
  margin: number;
  discount: number;
  price: number;
  profit: number;
  viability: ViabilityLevel;
}

/**
 * Entrada de concorrente adicionada manualmente ou importada
 */
export interface BiddingCompetitorEntry {
  id: string;
  name: string;
  lastKnownPrice: number;
  lastUpdate: Date;
  estimatedMargin?: number;
  status?: 'known' | 'suspected' | 'winner';
  notes?: string;
}

/**
 * Resultado de uma simulação de ranking/concorrência
 */
export interface BiddingCompetitionSimulation {
  simulationId: string;
  generatedAt: Date;
  basePrice: number;
  maximumAllowedPrice?: number;
  minimumCalculatedPrice: number;
  entries: Array<{
    competitorId?: string;
    label: string;
    price: number;
    differenceToYou: number;
    position: number;
    probability: number; // 0-1
    indicator: 'green' | 'yellow' | 'red';
  }>;
  recommendedAdjustment?: number;
  summary: {
    probablePosition: number;
    winProbability: number;
    commentary: string;
  };
}

/**
 * Alerta de risco fiscal/jurídico
 */
export interface BiddingRiskAlert {
  id: string;
  type: BiddingRiskType;
  level: BiddingRiskLevel;
  title: string;
  message: string;
  recommendation?: string;
  relatedItemId?: string;
  detectedAt: Date;
  resolved?: boolean;
}

/**
 * Registro de histórico/audit trail da licitação
 */
export interface BiddingHistoryRecord {
  id: string;
  biddingId: string;
  action: 'created' | 'updated' | 'status_changed' | 'attachment_added' | 'calculated' | 'exported' | 'note';
  description: string;
  performer?: string;
  timestamp: Date;
  payload?: Record<string, unknown>;
}

/**
 * Snapshot analítico para dashboards
 */
export interface BiddingAnalyticsSnapshot {
  generatedAt: Date;
  totalParticipated: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  totalValueParticipated: number;
  totalValueWon: number;
  averageMargin: number;
  estimatedSavings: number;
  lifecycleBreakdown: Record<BiddingLifecycleStatus, number>;
  topOrgans: Array<{ organ: string; count: number; value: number }>;
}

/**
 * Histórico de lances
 */
export interface BiddingBid {
  id: string;
  biddingId: string;
  timestamp: Date;
  value: number;
  discount: number;
  margin: number;
  isAutomatic: boolean;
  observations?: string;
}

/**
 * Licitação completa (para salvar/carregar)
 */
export interface Bidding {
  data: BiddingData;
  items: BiddingItem[];
  taxConfig: BiddingTaxConfig;
  guarantee?: BiddingGuarantee;
  strategy: BiddingStrategy;
  result?: BiddingCalculationResult;
  scenarios?: BiddingScenario[];
  bids?: BiddingBid[];
  attachments?: BiddingAttachment[];
  requirements?: BiddingRequirement[];
  competitors?: BiddingCompetitorEntry[];
  competitionSimulation?: BiddingCompetitionSimulation;
  riskAlerts?: BiddingRiskAlert[];
  history?: BiddingHistoryRecord[];
  analyticsSnapshot?: BiddingAnalyticsSnapshot;
}

/**
 * Dashboard de licitações - Estatísticas
 */
export interface BiddingStatistics {
  total: number;
  won: number;
  lost: number;
  inProgress: number;
  drafts: number;
  
  totalValue: number;
  averageMargin: number;
  winRate: number;                    // %
  
  byType: Record<BiddingType, number>;
  byMonth: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

/**
 * Filtros para listagem
 */
export interface BiddingFilters {
  status?: BiddingStatus[];
  type?: BiddingType[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  organ?: string;
}

/**
 * Filtros persistidos para o centro de licitações
 */
export interface BiddingStoreFilter {
  lifecycle?: BiddingLifecycleStatus[];
  status?: BiddingStatus[];
  search?: string;
  organ?: string;
}

/**
 * Comparação entre licitações
 */
export interface BiddingComparison {
  biddings: Bidding[];
  averageMargin: number;
  bestMargin: number;
  worstMargin: number;
  recommendations: string[];
}

/**
 * Resumo de um edital/projeto para listagens
 */
export interface BiddingProjectSummary {
  id: string;
  title: string;
  organ: string;
  lifecycleStatus: BiddingLifecycleStatus;
  deadline?: Date;
  nextStep?: string;
  totalItems: number;
  totalValue?: number;
  winProbability?: number;
}

/**
 * Projeto completo de licitação (dashboard)
 */
export interface BiddingProject {
  summary: BiddingProjectSummary;
  bidding: Bidding;
  attachments: BiddingAttachment[];
  requirements: BiddingRequirement[];
  history: BiddingHistoryRecord[];
  analytics?: BiddingAnalyticsSnapshot;
}

/**
 * Estimativa de frete inteligente
 */
export interface BiddingFreightEstimate {
  id: string;
  originZip: string;
  destinationZip: string;
  provider: string;
  serviceLevel: 'standard' | 'express' | 'dedicated';
  cost: number;
  transitTimeDays: number;
  notes?: string;
}

/**
 * Estado de estoque/fornecedor integrado
 */
export interface BiddingStockStatus {
  itemId: string;
  availableQuantity: number;
  reservedQuantity?: number;
  supplierSuggestions?: Array<{ supplier: string; unitCost: number; leadTimeDays: number }>;
  alert?: string;
}

/**
 * Recomendação gerada por IA
 */
export interface BiddingAIRecommendation {
  id: string;
  category: 'pricing' | 'margin' | 'risk' | 'strategy';
  message: string;
  suggestedAction?: string;
  impactEstimate?: 'low' | 'medium' | 'high';
  createdAt: Date;
}

/**
 * Dados para geração de PDF da proposta
 */
export interface BiddingPDFPayload {
  bidding: Bidding;
  companyInfo: {
    name: string;
    document: string;
    address?: string;
    contact?: string;
  };
  includeSignature?: boolean;
  notes?: string;
}

/**
 * Resultado de extração OCR/IA do edital
 */
export interface BiddingOCRExtractionResult {
  sourceFileId: string;
  extractedAt: Date;
  confidence: number;
  items: Array<Pick<BiddingItem, 'description' | 'quantity' | 'unit'>>;
  requirements: BiddingRequirement[];
  notes?: string;
}

/**
 * Replay de decisões tomadas durante a licitação
 */
export interface BiddingReplayEntry {
  id: string;
  timestamp: Date;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// ============================================
// TIPOS DE FORMULÁRIO (WIZARD)
// ============================================

/**
 * Estado do Wizard
 */
export interface BiddingWizardState {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  canProceed: boolean;
  data: Partial<Bidding>;
}

/**
 * Props do Wizard
 */
export interface BiddingWizardProps {
  onComplete: (bidding: Bidding) => void;
  onCancel: () => void;
  initialData?: Partial<Bidding>;
}

// ============================================
// TIPOS DE EXPORT/IMPORT
// ============================================

/**
 * Formato de exportação
 */
export interface BiddingExport {
  bidding: Bidding;
  exportDate: Date;
  format: 'pdf' | 'excel' | 'json';
  includeCalculations: boolean;
  includeCharts: boolean;
}

/**
 * Template de licitação
 */
export interface BiddingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  taxConfig: BiddingTaxConfig;
  defaultMargin: number;
  isPublic: boolean;
  createdBy?: string;
  usageCount: number;
}

// ============================================
// TIPOS DE INTEGRAÇÕES (FUTURO)
// ============================================

/**
 * Integração com PNCP (Portal Nacional de Contratações Públicas)
 */
export interface PNCPIntegration {
  enabled: boolean;
  apiKey?: string;
  autoImport: boolean;
  filters: {
    organs?: string[];
    states?: string[];
    categories?: string[];
    minValue?: number;
    maxValue?: number;
  };
}

/**
 * Notificação de licitação
 */
export interface BiddingNotification {
  id: string;
  biddingId: string;
  type: 'deadline' | 'status_change' | 'new_bid' | 'winner' | 'alert';
  message: string;
  read: boolean;
  createdAt: Date;
}

// ============================================
// HOOKS E CONTEXTO
// ============================================

/**
 * Retorno do hook useBiddingCalculator
 */
export interface UseBiddingCalculator {
  bidding: Partial<Bidding>;
  result: BiddingCalculationResult | null;
  scenarios: BiddingScenario[];
  
  // Actions
  updateData: (data: Partial<BiddingData>) => void;
  addItem: (item: BiddingItem) => void;
  updateItem: (index: number, item: Partial<BiddingItem>) => void;
  removeItem: (index: number) => void;
  updateTaxConfig: (config: Partial<BiddingTaxConfig>) => void;
  updateGuarantee: (guarantee: Partial<BiddingGuarantee>) => void;
  updateStrategy: (strategy: Partial<BiddingStrategy>) => void;
  
  // Calculations
  calculate: () => void;
  recalculate: () => void;
  simulateScenarios: (margins: number[]) => void;
  simulateDiscount: (discountPercentage: number) => BiddingScenario;
  
  // Utils
  isValid: boolean;
  canCalculate: boolean;
  errors: Record<string, string>;
  
  // Persistence
  save: () => Promise<void>;
  load: (id: string) => Promise<void>;
  reset: () => void;
}

/**
 * Cartões do dashboard por macro status
 */
export interface BiddingLifecycleCard {
  status: BiddingLifecycleStatus;
  count: number;
  totalValue: number;
}

/**
 * Hook do centro de licitações (dashboard)
 */
export interface UseBiddingCenter {
  projects: BiddingProject[];
  selectedProject: BiddingProject | null;
  filters: BiddingStoreFilter;
  statistics: BiddingStatistics;
  lifecycleCards: BiddingLifecycleCard[];
  analyticsSummary: BiddingAnalyticsSnapshot | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  updateFilters: (changes: Partial<BiddingStoreFilter>) => void;
  resetFilters: () => void;
  selectProject: (projectId: string) => Promise<void>;
  saveProject: (project: BiddingProject) => Promise<BiddingProject>;
  deleteProject: (projectId: string) => Promise<void>;
  updateLifecycle: (projectId: string, lifecycle: BiddingLifecycleStatus) => Promise<void>;
  resetMockData: () => Promise<void>;
}
