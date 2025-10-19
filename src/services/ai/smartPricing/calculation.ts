/**
 * Calculation Module
 * Handles price calculations, rounding, and adjustments
 */

import { CompetitorAnalysisResult, MarketAnalysisResult, VolumeAnalysisResult } from './types';

/**
 * Arredonda preço para valores práticos e psicologicamente atrativos
 * 
 * @param price - Preço bruto calculado
 * @returns Preço arredondado de forma inteligente
 * 
 * @example
 * ```typescript
 * roundToNicePrice(9.73);    // 9.73 (mantém centavos)
 * roundToNicePrice(47.8);    // 47.8 (arredonda para décimo)
 * roundToNicePrice(247.3);   // 247 (arredonda para inteiro)
 * roundToNicePrice(1847);    // 1850 (arredonda para dezena)
 * ```
 * 
 * @remarks
 * Estratégia de arredondamento:
 * - < R$ 10: Mantém centavos (precisão de R$ 0.01)
 * - R$ 10-100: Arredonda para décimos (R$ 0.10)
 * - R$ 100-1000: Arredonda para inteiros (R$ 1.00)
 * - > R$ 1000: Arredonda para dezenas (R$ 10.00)
 */
export function roundToNicePrice(price: number): number {
  if (price < 10) {
    return Math.round(price * 100) / 100;
  } else if (price < 100) {
    return Math.round(price * 10) / 10;
  } else if (price < 1000) {
    return Math.round(price);
  } else {
    return Math.round(price / 10) * 10;
  }
}

/**
 * Calcula o preço final aplicando todos os multiplicadores de mercado e volume
 * 
 * @param basePrice - Preço base antes dos ajustes
 * @param marketAnalysis - Análise de mercado com multiplicadores sazonais e de categoria
 * @param volumeAnalysis - Análise de volume com elasticidade e demanda
 * @returns Preço final ajustado por todos os fatores
 * 
 * @example
 * ```typescript
 * const basePrice = 100;
 * const marketAnalysis = {
 *   seasonalityMultiplier: 1.2,  // Alta temporada (+20%)
 *   audienceMultiplier: 1.1,      // Público premium (+10%)
 *   categoryMultiplier: 1.0,      // Categoria normal
 *   // ...
 * };
 * const volumeAnalysis = {
 *   volumeScore: 0.95,           // Alto volume (-5%)
 *   elasticityFactor: 1.05,      // Baixa elasticidade (+5%)
 *   // ...
 * };
 * 
 * const finalPrice = calculateFinalPrice(basePrice, marketAnalysis, volumeAnalysis);
 * // Resultado: 100 * 1.2 * 1.1 * 1.0 * 0.95 * 1.05 ≈ 131.67
 * ```
 * 
 * @remarks
 * Multiplicadores aplicados em ordem:
 * 1. Sazonalidade (alta/baixa temporada)
 * 2. Perfil do público-alvo
 * 3. Categoria do produto
 * 4. Volume de vendas esperado
 * 5. Elasticidade de demanda
 */
export function calculateFinalPrice(
  basePrice: number,
  marketAnalysis: MarketAnalysisResult,
  volumeAnalysis: VolumeAnalysisResult
): number {
  let finalPrice = basePrice;
  
  finalPrice *= marketAnalysis.seasonalityMultiplier;
  finalPrice *= marketAnalysis.audienceMultiplier;
  finalPrice *= marketAnalysis.categoryMultiplier;
  finalPrice *= volumeAnalysis.volumeScore;
  finalPrice *= volumeAnalysis.elasticityFactor;

  return finalPrice;
}

/**
 * Adjusts price based on competition
 */
export function adjustPriceForCompetition(
  basePrice: number,
  competitorAnalysis: CompetitorAnalysisResult
): { price: number; confidence: number } {
  let finalPrice = basePrice;
  let confidence = 0.7;

  if (competitorAnalysis.competitors.length > 0) {
    const competitorAvg = competitorAnalysis.averagePrice;
    
    if (basePrice > competitorAvg * 1.2) {
      finalPrice = competitorAvg * 1.1;
      confidence = 0.6;
    } else if (basePrice < competitorAvg * 0.8) {
      finalPrice = competitorAvg * 0.9;
      confidence = 0.8;
    } else {
      confidence = 0.9;
    }
  }

  return { price: finalPrice, confidence };
}

/**
 * Calculates margin percentage
 */
export function calculateMargin(price: number, costPrice: number): number {
  return ((price - costPrice) / price * 100);
}

/**
 * Gets position description relative to competitors
 */
export function getPositionDescription(price: number, avgCompetitor: number): string {
  const diff = ((price - avgCompetitor) / avgCompetitor * 100);
  
  if (diff > 10) {
    return `${diff.toFixed(0)}% acima da média (posição premium)`;
  }
  if (diff < -10) {
    return `${Math.abs(diff).toFixed(0)}% abaixo da média (posição competitiva)`;
  }
  return 'Alinhado com a média do mercado';
}

/**
 * Estimates price elasticity for a category
 */
export function getElasticity(category?: string): number {
  const elasticityMap: Record<string, number> = {
    eletronicos: -1.5,
    moda: -0.8,
    default: -1.2
  };
  
  return elasticityMap[category || 'default'];
}
