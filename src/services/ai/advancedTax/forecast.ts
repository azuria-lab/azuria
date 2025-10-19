/**
 * Advanced Tax Service - Tax Forecasting
 * Projeções tributárias futuras baseadas em cenários de crescimento
 */

import type { BusinessProfile, TaxForecast } from './types';
import { TaxRegimeType } from '@/shared/types/ai';
import { getCurrentTaxRate } from './calculations';

/**
 * Taxas de crescimento para cada cenário
 */
const GROWTH_RATES = {
  conservative: 1.05, // 5% crescimento
  realistic: 1.15,    // 15% crescimento
  optimistic: 1.30,   // 30% crescimento
} as const;

/**
 * Limites de faturamento para regimes tributários
 */
const REGIME_LIMITS = {
  SIMPLES_NACIONAL: 4_800_000,
  LUCRO_PRESUMIDO: 78_000_000,
} as const;

/**
 * Gera projeção tributária para os próximos 12 meses
 * 
 * Cria projeções financeiras e tributárias considerando três cenários de crescimento
 * (conservador, realista, otimista) e fornece insights e recomendações baseadas
 * nas projeções.
 * 
 * @param businessProfile - Perfil completo do negócio incluindo faturamento atual
 * @param currentRegime - Regime tributário atual da empresa
 * @returns Projeção completa incluindo cenários, insights e recomendações
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   monthlyRevenue: 100000, // R$ 100k/mês = R$ 1.2M/ano
 *   seasonality: 'medium',
 *   hasExports: false,
 *   // ...
 * };
 * 
 * const forecast = await generateTaxForecast(
 *   profile,
 *   TaxRegimeType.SIMPLES_NACIONAL
 * );
 * 
 * console.log('Projeções para 12 meses:');
 * console.log(`Conservador (5%): R$ ${forecast.scenarios.conservative.revenue.toFixed(2)}`);
 * console.log(`  Impostos: R$ ${forecast.scenarios.conservative.taxes.toFixed(2)}`);
 * console.log(`Realista (15%): R$ ${forecast.scenarios.realistic.revenue.toFixed(2)}`);
 * console.log(`  Impostos: R$ ${forecast.scenarios.realistic.taxes.toFixed(2)}`);
 * console.log(`Otimista (30%): R$ ${forecast.scenarios.optimistic.revenue.toFixed(2)}`);
 * console.log(`  Impostos: R$ ${forecast.scenarios.optimistic.taxes.toFixed(2)}`);
 * 
 * // Alertas e insights
 * forecast.insights.forEach(insight => console.log(insight));
 * 
 * // Recomendações
 * console.log('\nRecomendações:');
 * forecast.recommendations.forEach(rec => console.log(rec));
 * ```
 * 
 * @remarks
 * **Cenários de crescimento**:
 * - **Conservador**: +5% no faturamento anual
 * - **Realista**: +15% no faturamento anual
 * - **Otimista**: +30% no faturamento anual
 * 
 * **Cálculos realizados**:
 * - Projeta faturamento anual para cada cenário
 * - Aplica taxa tributária atual ao faturamento projetado
 * - Identifica possíveis mudanças de regime necessárias
 * - Calcula variação da carga tributária
 * 
 * **Insights gerados**:
 * - Alerta se ultrapassar limite do Simples Nacional (R$ 4.8M)
 * - Alerta se ultrapassar limite do Lucro Presumido (R$ 78M)
 * - Identifica variações significativas na carga tributária (> 2%)
 * 
 * **Recomendações**:
 * - Monitoramento de crescimento
 * - Reserva de recursos para investimentos fiscais
 * - Reavaliação semestral do regime
 * - Recomendações específicas por perfil (sazonalidade, exportação, etc.)
 */
export async function generateTaxForecast(
  businessProfile: BusinessProfile,
  currentRegime: TaxRegimeType
): Promise<TaxForecast> {
  const currentMonthlyRevenue = businessProfile.monthlyRevenue;
  const currentRate = getCurrentTaxRate(businessProfile, currentRegime);

  // Cenários de crescimento
  const scenarios = {
    conservative: {
      revenue: currentMonthlyRevenue * 12 * GROWTH_RATES.conservative,
      taxes: 0,
    },
    realistic: {
      revenue: currentMonthlyRevenue * 12 * GROWTH_RATES.realistic,
      taxes: 0,
    },
    optimistic: {
      revenue: currentMonthlyRevenue * 12 * GROWTH_RATES.optimistic,
      taxes: 0,
    },
  };

  // Calcula impostos para cada cenário
  scenarios.conservative.taxes = scenarios.conservative.revenue * (currentRate / 100);
  scenarios.realistic.taxes = scenarios.realistic.revenue * (currentRate / 100);
  scenarios.optimistic.taxes = scenarios.optimistic.revenue * (currentRate / 100);

  const insights = generateForecastInsights(businessProfile, scenarios);
  const recommendations = generateForecastRecommendations(businessProfile, scenarios);

  return {
    period: '12_months',
    scenarios,
    insights,
    recommendations,
  };
}

/**
 * Gera insights estratégicos baseados nas projeções tributárias
 * 
 * Analisa os cenários projetados e identifica alertas críticos sobre
 * limites de regime, necessidade de migração e variações significativas
 * na carga tributária.
 * 
 * @param businessProfile - Perfil do negócio incluindo faturamento atual
 * @param scenarios - Cenários projetados (conservador, realista, otimista)
 * @returns Array com insights formatados e alertas importantes
 * 
 * @example
 * ```typescript
 * const scenarios = {
 *   conservative: { revenue: 5040000, taxes: 302400 },  // R$ 5.04M
 *   realistic: { revenue: 5520000, taxes: 331200 },     // R$ 5.52M
 *   optimistic: { revenue: 6240000, taxes: 374400 }     // R$ 6.24M
 * };
 * 
 * const profile: BusinessProfile = {
 *   monthlyRevenue: 400000, // R$ 4.8M/ano atualmente
 *   // ...
 * };
 * 
 * const insights = generateForecastInsights(profile, scenarios);
 * insights.forEach(insight => console.log(insight));
 * // Output pode incluir:
 * // ⚠️ No cenário otimista, você ultrapassará o limite do Simples Nacional
 * // 📊 A carga tributária pode variar significativamente com o crescimento
 * ```
 * 
 * @remarks
 * **Alertas gerados**:
 * 
 * **1. Limite do Simples Nacional** (R$ 4.8M):
 * - Dispara se cenário otimista ultrapassar o limite
 * - Empresa atualmente está no Simples
 * - ⚠️ "No cenário otimista, você ultrapassará o limite do Simples Nacional"
 * 
 * **2. Limite do Lucro Presumido** (R$ 78M):
 * - Dispara se cenário realista ultrapassar o limite
 * - Empresa atualmente está no Lucro Presumido
 * - ⚠️ "No cenário realista, precisará migrar para Lucro Real"
 * 
 * **3. Variação da carga tributária** (> 2%):
 * - Compara taxa efetiva entre cenários conservador e otimista
 * - Se diferença > 2 pontos percentuais
 * - 📊 "A carga tributária pode variar significativamente com o crescimento"
 * 
 * **Lógica de detecção**:
 * - Compara faturamento projetado com limites legais
 * - Considera apenas cenários onde empresa está abaixo do limite atualmente
 * - Calcula taxa efetiva: `(impostos / faturamento) * 100`
 */
export function generateForecastInsights(
  businessProfile: BusinessProfile,
  scenarios: {
    conservative: { revenue: number; taxes: number };
    realistic: { revenue: number; taxes: number };
    optimistic: { revenue: number; taxes: number };
  }
): string[] {
  const insights: string[] = [];
  const currentAnnualRevenue = businessProfile.monthlyRevenue * 12;

  // Alerta sobre ultrapassar limite do Simples Nacional
  if (
    scenarios.optimistic.revenue > REGIME_LIMITS.SIMPLES_NACIONAL &&
    currentAnnualRevenue <= REGIME_LIMITS.SIMPLES_NACIONAL
  ) {
    insights.push('⚠️ No cenário otimista, você ultrapassará o limite do Simples Nacional');
  }

  // Alerta sobre necessidade de migrar para Lucro Real
  if (
    scenarios.realistic.revenue > REGIME_LIMITS.LUCRO_PRESUMIDO &&
    currentAnnualRevenue <= REGIME_LIMITS.LUCRO_PRESUMIDO
  ) {
    insights.push('⚠️ No cenário realista, precisará migrar para Lucro Real');
  }

  // Análise de variação da carga tributária
  const conservativeTaxRate = (scenarios.conservative.taxes / scenarios.conservative.revenue) * 100;
  const optimisticTaxRate = (scenarios.optimistic.taxes / scenarios.optimistic.revenue) * 100;

  if (Math.abs(conservativeTaxRate - optimisticTaxRate) > 2) {
    insights.push('📊 A carga tributária pode variar significativamente com o crescimento');
  }

  return insights;
}

/**
 * Gera recomendações estratégicas baseadas nas projeções
 * 
 * Cria lista de ações recomendadas para otimizar a tributação considerando
 * o crescimento projetado e características específicas do negócio.
 * 
 * @param businessProfile - Perfil completo do negócio
 * @param _scenarios - Cenários projetados (não usado atualmente, reservado para futuro)
 * @returns Array com recomendações estratégicas e táticas
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   monthlyRevenue: 200000,
 *   seasonality: 'high',
 *   hasExports: true,
 *   hasImports: false,
 *   // ...
 * };
 * 
 * const scenarios = {
 *   conservative: { revenue: 2520000, taxes: 151200 },
 *   realistic: { revenue: 2760000, taxes: 165600 },
 *   optimistic: { revenue: 3120000, taxes: 187200 }
 * };
 * 
 * const recommendations = generateForecastRecommendations(profile, scenarios);
 * 
 * console.log('Recomendações estratégicas:');
 * recommendations.forEach((rec, i) => {
 *   console.log(`${i + 1}. ${rec}`);
 * });
 * // Output:
 * // 1. 📈 Monitore o crescimento para não ultrapassar limites de regime
 * // 2. 💰 Reserve recursos para investimentos que reduzam carga tributária
 * // 3. 📊 Reavalie o regime tributário semestralmente
 * // 4. 🗓️ Considere planejamento tributário específico para sazonalidade
 * // 5. 🌍 Explore incentivos fiscais para comércio exterior
 * ```
 * 
 * @remarks
 * **Recomendações padrão** (sempre incluídas):
 * 1. 📈 Monitoramento de crescimento vs. limites de regime
 * 2. 💰 Reserva de recursos para investimentos fiscais
 * 3. 📊 Reavaliação semestral do regime tributário
 * 
 * **Recomendações condicionais**:
 * 
 * **Se `seasonality === 'high'`**:
 * - 🗓️ Planejamento tributário específico para sazonalidade
 * - Útil para empresas com grande variação mensal/trimestral
 * - Exemplo: varejo em datas comemorativas
 * 
 * **Se `hasExports` ou `hasImports`**:
 * - 🌍 Incentivos fiscais para comércio exterior
 * - Drawback, isenções de importação
 * - Lucro Real com incentivos de exportação (-15%)
 * 
 * **Uso futuro de `_scenarios`**:
 * O parâmetro `_scenarios` está reservado para futuras implementações
 * de recomendações específicas baseadas nas projeções numéricas.
 */
export function generateForecastRecommendations(
  businessProfile: BusinessProfile,
  _scenarios: {
    conservative: { revenue: number; taxes: number };
    realistic: { revenue: number; taxes: number };
    optimistic: { revenue: number; taxes: number };
  }
): string[] {
  const recommendations: string[] = [];

  // Recomendações gerais
  recommendations.push('📈 Monitore o crescimento para não ultrapassar limites de regime');
  recommendations.push('💰 Reserve recursos para investimentos que reduzam carga tributária');
  recommendations.push('📊 Reavalie o regime tributário semestralmente');

  // Recomendações específicas por perfil
  if (businessProfile.seasonality === 'high') {
    recommendations.push('🗓️ Considere planejamento tributário específico para sazonalidade');
  }

  if (businessProfile.hasExports || businessProfile.hasImports) {
    recommendations.push('🌍 Explore incentivos fiscais para comércio exterior');
  }

  return recommendations;
}
