/**
 * Advanced Tax Service - Main Module
 * Serviço de análise tributária avançada e personalizada
 */

import { type TaxAnalysis, TaxRegimeType } from '@/shared/types/ai';
import { taxService } from '../taxService';
import { logger, toErrorContext } from '../logger';

// Import dos módulos refatorados
import type {
  BusinessProfile,
  ComprehensiveTaxAnalysisResult,
  TaxOptimizationPlan,
  TaxScenario,
} from './types';
import { generateTaxScenarios } from './scenarios';
import { createOptimizationPlan } from './optimization';
import { generateTaxForecast } from './forecast';

/**
 * Serviço de análise tributária avançada com suporte a múltiplos regimes fiscais
 * 
 * @remarks
 * Este serviço oferece análises tributárias completas incluindo:
 * - Análise do regime atual
 * - Comparação com regimes alternativos
 * - Planos de otimização fiscal
 * - Projeções de economia
 * - Recomendações estratégicas
 */
class AdvancedTaxService {
  private readonly businessProfiles: Map<string, BusinessProfile> = new Map();
  private readonly optimizationPlans: Map<string, TaxOptimizationPlan> = new Map();

  /**
   * Realiza uma análise tributária completa e personalizada para um negócio
   * 
   * @param businessProfile - Perfil completo do negócio com dados fiscais e operacionais
   * @returns Resultado completo da análise incluindo cenários, otimizações e projeções
   * @throws Error se a análise falhar por dados inválidos ou problemas de cálculo
   * 
   * @example
   * ```typescript
   * const profile: BusinessProfile = {
   *   id: 'business-123',
   *   businessType: 'comercio',
   *   monthlyRevenue: 50000,
   *   employeeCount: 5,
   *   hasManufacturing: false,
   *   hasExports: false,
   *   hasImports: false,
   *   location: { state: 'SP', city: 'São Paulo' },
   *   mainActivities: ['Comércio varejista'],
   *   seasonality: 'medium'
   * };
   * 
   * const analysis = await advancedTaxService.performComprehensiveTaxAnalysis(profile);
   * console.log(`Regime atual: ${analysis.currentAnalysis.regime}`);
   * console.log(`Cenários analisados: ${analysis.scenarios.length}`);
   * ```
   * 
   * @remarks
   * A análise inclui:
   * 1. Avaliação do regime atual (Simples, Presumido ou Real)
   * 2. Geração de cenários alternativos com diferentes regimes
   * 3. Plano de otimização se houver oportunidade de economia
   * 4. Projeção financeira para 12 meses
   * 5. Recomendações estratégicas personalizadas
   */
  async performComprehensiveTaxAnalysis(
    businessProfile: BusinessProfile
  ): Promise<ComprehensiveTaxAnalysisResult> {
    try {
      const startTime = Date.now();

      // 1. Análise do regime atual
      const currentAnalysis = await this.analyzeCurrentRegime(businessProfile);

      // 2. Cenários alternativos
      const scenarios = await generateTaxScenarios(businessProfile);

      // 3. Plano de otimização (se houver oportunidade)
      const currentRegime = this.getCurrentRegime(businessProfile);
      const optimizationPlan = await createOptimizationPlan(
        businessProfile,
        currentRegime,
        scenarios
      );

      // Salva o plano se foi criado
      if (optimizationPlan) {
        this.optimizationPlans.set(optimizationPlan.id, optimizationPlan);
      }

      // 4. Projeções futuras
      const forecast = await generateTaxForecast(businessProfile, currentRegime);

      // 5. Recomendações estratégicas
      const strategicRecommendations = this.generateStrategicRecommendations(
        businessProfile,
        scenarios,
        forecast
      );

      const duration = Date.now() - startTime;
      logger.trackAIUsage('comprehensive_tax_analysis', duration, true, {
        businessId: businessProfile.id,
        currentRegime,
        potentialSavings: optimizationPlan?.potentialSavingsAnnual || 0,
      });

      return {
        currentAnalysis,
        scenarios,
        optimizationPlan,
        forecast,
        strategicRecommendations,
      };
    } catch (error) {
      logger.trackAIError('comprehensive_tax_analysis', toErrorContext(error), {
        businessProfileId: businessProfile.id,
        businessType: businessProfile.businessType
      });
      throw new Error('Erro ao realizar análise tributária abrangente');
    }
  }

  /**
   * Analisa o regime tributário atual
   */
  private async analyzeCurrentRegime(businessProfile: BusinessProfile): Promise<TaxAnalysis> {
    const currentRegime = this.getCurrentRegime(businessProfile);

    return await taxService.analyzeTaxOptimization({
      currentRegime,
      monthlyRevenue: businessProfile.monthlyRevenue,
      businessType: businessProfile.businessType,
      employeeCount: businessProfile.employeeCount,
      hasManufacturing: businessProfile.hasManufacturing,
    });
  }

  /**
   * Determina o regime tributário atual baseado no perfil
   */
  private getCurrentRegime(businessProfile: BusinessProfile): TaxRegimeType {
    const annualRevenue = businessProfile.monthlyRevenue * 12;

    // Lógica simplificada para determinar regime atual
    if (annualRevenue <= 4_800_000) {
      return TaxRegimeType.SIMPLES_NACIONAL;
    }

    if (annualRevenue <= 78_000_000) {
      return TaxRegimeType.LUCRO_PRESUMIDO;
    }

    return TaxRegimeType.LUCRO_REAL;
  }

  /**
   * Gera recomendações estratégicas personalizadas
   */
  private generateStrategicRecommendations(
    businessProfile: BusinessProfile,
    scenarios: TaxScenario[],
    _forecast: import('./types').TaxForecast
  ): string[] {
    const recommendations: string[] = [];

    // Recomendação baseada no melhor cenário
    const bestScenario = scenarios.reduce(
      (best, scenario) => (scenario.annualTax < best.annualTax ? scenario : best),
      scenarios[0]
    );

    const currentRegime = this.getCurrentRegime(businessProfile);
    if (bestScenario.regime !== currentRegime) {
      const currentScenario = scenarios.find(s => s.regime === currentRegime);
      if (currentScenario) {
        const savings = currentScenario.annualTax - bestScenario.annualTax;
        recommendations.push(
          `🎯 Considere migrar para ${bestScenario.regime} - economia de R$ ${savings.toLocaleString('pt-BR')}/ano`
        );
      }
    }

    // Recomendações baseadas no perfil
    if (businessProfile.employeeCount > 20 && !businessProfile.hasManufacturing) {
      recommendations.push('👥 Avalie benefícios fiscais para contratação de jovens aprendizes');
    }

    if (businessProfile.businessType === 'industria') {
      recommendations.push('🏭 Explore incentivos fiscais regionais para indústria');
    }

    if (businessProfile.monthlyRevenue > 100_000) {
      recommendations.push('📊 Considere consultoria especializada em planejamento tributário');
    }

    return recommendations;
  }

  /**
   * Obtém plano de otimização por ID
   */
  getOptimizationPlan(planId: string): TaxOptimizationPlan | undefined {
    return this.optimizationPlans.get(planId);
  }

  /**
   * Lista todos os planos de otimização
   */
  getAllOptimizationPlans(): TaxOptimizationPlan[] {
    return Array.from(this.optimizationPlans.values());
  }

  /**
   * Salva perfil empresarial
   */
  saveBusinessProfile(profile: BusinessProfile): void {
    this.businessProfiles.set(profile.id, profile);
    logger.info('Perfil empresarial salvo', { businessId: profile.id });
  }

  /**
   * Obtém perfil empresarial
   */
  getBusinessProfile(businessId: string): BusinessProfile | undefined {
    return this.businessProfiles.get(businessId);
  }
}

// Exporta instância singleton
export const advancedTaxService = new AdvancedTaxService();

// Re-exports dos tipos para facilitar imports
export type {
  BusinessProfile,
  TaxOptimizationPlan,
  TaxScenario,
  TaxForecast,
  ComprehensiveTaxAnalysisResult,
} from './types';
