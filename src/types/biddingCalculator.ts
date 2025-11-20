/**
 * Bidding Calculator Specific Types
 * 
 * Tipos auxiliares específicos para a calculadora de licitação
 * Complementam os types principais de bidding.ts
 */

import {
  BiddingCalculationResult,
  BiddingData,
  BiddingTaxRegime,
  BiddingType,
  GuaranteeType,
  ViabilityLevel,
} from './bidding';

/**
 * Estado inicial padrão para nova licitação
 */
export interface BiddingCalculatorDefaults {
  type: BiddingType;
  taxRegime: BiddingTaxRegime;
  guaranteeType: GuaranteeType;
  guaranteePercentage: number;
  adminCostPercentage: number;
  contingencyPercentage: number;
}

/**
 * Configuração de cenário de lucro
 */
export interface ProfitScenarioConfig {
  name: string;
  targetMargin: number; // Margem líquida desejada (%)
  description: string;
  color: string;
}

/**
 * Resultado de um cenário de precificação
 */
export interface ScenarioResult {
  name: string;
  targetMargin: number;
  suggestedPrice: number;
  totalCost: number;
  taxes: number;
  netProfit: number;
  netMargin: number;
  viability: ViabilityLevel;
  color: string;
}

/**
 * Análise de leilão invertido
 */
export interface ReverseAuctionAnalysis {
  competitorBid: number;
  yourBreakEven: number;
  difference: number;
  differencePercentage: number;
  isViable: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  emoji: string;
}

/**
 * Configuração completa da calculadora
 */
export interface BiddingCalculatorConfig {
  defaults: BiddingCalculatorDefaults;
  scenarios: ProfitScenarioConfig[];
  taxRates: Record<BiddingTaxRegime, number>;
  guaranteeCosts: Record<GuaranteeType, number>;
}

/**
 * Input form data para calculadora
 */
export interface BiddingCalculatorFormData {
  // Identificação
  title: string;
  organ?: string;
  biddingNumber?: string;
  
  // Tipo e regime
  type: BiddingType;
  taxRegime: BiddingTaxRegime;
  
  // Custos base
  unitCost: number;
  quantity: number;
  
  // Custos operacionais
  laborCost: number;
  logisticsCost: number;
  administrativeCost: number;
  
  // Garantias e taxas
  guaranteeType: GuaranteeType;
  guaranteePercentage: number;
  
  // Leilão invertido
  competitorBid?: number;
}

/**
 * Resultado completo da análise
 */
export interface BiddingAnalysisResult {
  bidding: BiddingData;
  calculation: BiddingCalculationResult;
  scenarios: ScenarioResult[];
  reverseAuction?: ReverseAuctionAnalysis;
  recommendations: string[];
}

/**
 * Defaults do sistema
 */
export const BIDDING_CALCULATOR_DEFAULTS: BiddingCalculatorDefaults = {
  type: BiddingType.PREGAO_ELETRONICO,
  taxRegime: BiddingTaxRegime.SIMPLES_NACIONAL,
  guaranteeType: GuaranteeType.SEGURO_GARANTIA,
  guaranteePercentage: 5,
  adminCostPercentage: 10,
  contingencyPercentage: 5,
};

/**
 * Cenários de lucro padrão
 */
export const DEFAULT_PROFIT_SCENARIOS: ProfitScenarioConfig[] = [
  {
    name: 'Lucro Alto',
    targetMargin: 30,
    description: 'Margem líquida de 30% - Ideal para licitações técnicas',
    color: 'green',
  },
  {
    name: 'Lucro Médio',
    targetMargin: 20,
    description: 'Margem líquida de 20% - Equilibrado',
    color: 'blue',
  },
  {
    name: 'Lucro Baixo (Competitivo)',
    targetMargin: 10,
    description: 'Margem líquida de 10% - Máximo competitivo',
    color: 'orange',
  },
];

