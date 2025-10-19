/**
 * Advanced Tax Service - Tax Rate Calculations
 * Cálculos de alíquotas tributárias para diferentes regimes
 */

import type { BusinessProfile } from './types';
import { TaxRegimeType } from '@/shared/types/ai';

/**
 * Tabela de alíquotas do Simples Nacional por tipo de negócio e faixa de faturamento
 */
const SIMPLES_RATES = {
  comercio: {
    tier1: 4.0,  // Até R$ 180k
    tier2: 7.3,  // Até R$ 360k
    tier3: 9.5,  // Até R$ 720k
    tier4: 10.7, // Até R$ 1.8M
    tier5: 14.3  // Até R$ 3.6M
  },
  industria: {
    tier1: 4.5,
    tier2: 7.8,
    tier3: 10.0,
    tier4: 11.2,
    tier5: 14.7
  },
  servicos: {
    tier1: 6.0,
    tier2: 11.2,
    tier3: 13.5,
    tier4: 16.0,
    tier5: 21.0
  },
  misto: {
    tier1: 5.0,
    tier2: 9.0,
    tier3: 11.5,
    tier4: 13.5,
    tier5: 17.5
  }
} as const;

/**
 * Alíquotas base do Lucro Presumido por tipo de negócio
 */
const LUCRO_PRESUMIDO_RATES = {
  comercio: 11.33,
  industria: 11.33,
  servicos: 16.33,
  misto: 13.00
} as const;

/**
 * Calcula a alíquota efetiva do Simples Nacional baseada no faturamento anual
 * 
 * @param businessProfile - Perfil completo do negócio incluindo tipo e características
 * @param annualRevenue - Faturamento anual em reais (R$)
 * @returns Alíquota efetiva em porcentagem (ex: 4.0 para 4%)
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'comercio',
 *   monthlyRevenue: 15000,
 *   // ... outros campos
 * };
 * const rate = getSimplesToRate(profile, 180000); // 4.0%
 * ```
 * 
 * @remarks
 * - Tier 1 (até R$ 180k): Alíquotas mais baixas
 * - Tier 2 (até R$ 360k): Alíquotas intermediárias  
 * - Tier 3 (até R$ 720k): Alíquotas intermediárias-altas
 * - Tier 4 (até R$ 1.8M): Alíquotas altas
 * - Tier 5 (até R$ 3.6M): Alíquotas máximas
 */
export function getSimplesToRate(
  businessProfile: BusinessProfile,
  annualRevenue: number
): number {
  type BusinessType = keyof typeof SIMPLES_RATES;
  const businessRates = SIMPLES_RATES[businessProfile.businessType as BusinessType] || SIMPLES_RATES.comercio;

  if (annualRevenue <= 180000) {
    return businessRates.tier1;
  }
  if (annualRevenue <= 360000) {
    return businessRates.tier2;
  }
  if (annualRevenue <= 720000) {
    return businessRates.tier3;
  }
  if (annualRevenue <= 1800000) {
    return businessRates.tier4;
  }
  return businessRates.tier5;
}

/**
 * Calcula a alíquota do regime Lucro Presumido com ajustes regionais e setoriais
 * 
 * @param businessProfile - Perfil do negócio com informações fiscais
 * @returns Alíquota efetiva em porcentagem ajustada por incentivos
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'industria',
 *   hasExports: true, // 10% de redução
 *   location: { state: 'SP', city: 'São Paulo' },
 *   // ... outros campos
 * };
 * const rate = getLucroPresumidoRate(profile); // ~10.2% (11.33% - 10%)
 * ```
 * 
 * @remarks
 * Incentivos aplicados:
 * - Exportadores: -10% na alíquota
 * - Zona Franca de Manaus (ZFM): -20% na alíquota
 */
export function getLucroPresumidoRate(businessProfile: BusinessProfile): number {
  let rate = LUCRO_PRESUMIDO_RATES[businessProfile.businessType];

  // Ajustes baseados no perfil
  if (businessProfile.hasExports) {
    rate *= 0.9; // Redução de 10% para exportadores
  }

  if (businessProfile.location.state === 'ZFM') { // Zona Franca de Manaus
    rate *= 0.8; // Redução de 20%
  }

  return rate;
}

/**
 * Calcula a alíquota do regime Lucro Real com ajustes por setor e atividade
 * 
 * @param businessProfile - Perfil do negócio com detalhes operacionais
 * @returns Alíquota efetiva estimada incluindo IRPJ, CSLL, PIS e COFINS
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'industria',
 *   hasManufacturing: true, // -5% créditos industriais
 *   hasExports: true,       // -15% benefícios exportação
 *   // ... outros campos
 * };
 * const rate = getLucroRealRate(profile); // ~12.1% (15% * 0.95 * 0.85)
 * ```
 * 
 * @remarks
 * Taxa base:
 * - Comércio/Indústria: 15% (IRPJ 9% + CSLL 6%)
 * - Serviços: 18% (inclui ISS adicional)
 * 
 * Incentivos:
 * - Manufatura: -5% (créditos industriais)
 * - Exportação: -15% (benefícios fiscais)
 */
export function getLucroRealRate(businessProfile: BusinessProfile): number {
  // Taxa base estimada considerando IRPJ, CSLL, PIS, COFINS
  let baseRate = 15;

  if (businessProfile.businessType === 'servicos') {
    baseRate = 18; // Maior por causa do ISS
  }

  // Ajustes baseados no perfil
  if (businessProfile.hasManufacturing) {
    baseRate *= 0.95; // Créditos industriais (5% de redução)
  }

  if (businessProfile.hasExports) {
    baseRate *= 0.85; // Benefícios para exportação (15% de redução)
  }

  return baseRate;
}

/**
 * Obtém a alíquota tributária atual do negócio baseada no regime fiscal escolhido
 * 
 * @param businessProfile - Perfil completo do negócio
 * @param regime - Regime tributário atual (Simples, Presumido ou Real)
 * @returns Alíquota efetiva em porcentagem
 * 
 * @example
 * ```typescript
 * const rate = getCurrentTaxRate(profile, TaxRegimeType.SIMPLES_NACIONAL);
 * console.log(`Alíquota atual: ${rate}%`);
 * ```
 * 
 * @remarks
 * Esta função é um wrapper que delega para as funções específicas de cada regime,
 * aplicando automaticamente os cálculos e ajustes apropriados.
 */
export function getCurrentTaxRate(
  businessProfile: BusinessProfile,
  regime: TaxRegimeType
): number {
  const annualRevenue = businessProfile.monthlyRevenue * 12;

  switch (regime) {
    case TaxRegimeType.SIMPLES_NACIONAL:
      return getSimplesToRate(businessProfile, annualRevenue);
    case TaxRegimeType.LUCRO_PRESUMIDO:
      return getLucroPresumidoRate(businessProfile);
    case TaxRegimeType.LUCRO_REAL:
      return getLucroRealRate(businessProfile);
    default:
      return 15; // Taxa padrão conservadora
  }
}

/**
 * Calcula a economia anual potencial ao trocar de regime tributário
 * 
 * @param businessProfile - Perfil do negócio usado para cálculos
 * @param currentRegime - Regime tributário atual
 * @param targetRegime - Regime tributário proposto para comparação
 * @returns Economia anual em reais (R$), ou 0 se não houver economia
 * 
 * @example
 * ```typescript
 * const savings = calculatePotentialSavings(
 *   profile,
 *   TaxRegimeType.LUCRO_PRESUMIDO,
 *   TaxRegimeType.SIMPLES_NACIONAL
 * );
 * 
 * if (savings > 0) {
 *   console.log(`Economia anual: R$ ${savings.toLocaleString('pt-BR')}`);
 *   console.log(`Economia mensal: R$ ${(savings/12).toLocaleString('pt-BR')}`);
 * }
 * ```
 * 
 * @remarks
 * - O cálculo considera o faturamento anual baseado no mensal
 * - Retorna sempre um valor >= 0 (nunca negativo)
 * - Inclui todos os ajustes e incentivos de cada regime
 */
export function calculatePotentialSavings(
  businessProfile: BusinessProfile,
  currentRegime: TaxRegimeType,
  targetRegime: TaxRegimeType
): number {
  const annualRevenue = businessProfile.monthlyRevenue * 12;
  const currentRate = getCurrentTaxRate(businessProfile, currentRegime);
  const targetRate = getCurrentTaxRate(businessProfile, targetRegime);

  const currentTax = annualRevenue * (currentRate / 100);
  const targetTax = annualRevenue * (targetRate / 100);

  return Math.max(0, currentTax - targetTax);
}
