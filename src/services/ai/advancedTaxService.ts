import { TaxAnalysis, TaxRegimeType } from '@/shared/types/ai';
import { taxService } from './taxService';
import { logger } from './logger';

interface BusinessProfile {
  id: string;
  businessType: 'comercio' | 'industria' | 'servicos' | 'misto';
  monthlyRevenue: number;
  employeeCount: number;
  hasManufacturing: boolean;
  hasExports: boolean;
  hasImports: boolean;
  location: {
    state: string;
    city: string;
  };
  mainActivities: string[];
  seasonality: 'high' | 'medium' | 'low';
}

interface TaxOptimizationPlan {
  id: string;
  businessId: string;
  currentRegime: TaxRegimeType;
  recommendedRegime: TaxRegimeType;
  potentialSavingsAnnual: number;
  implementationSteps: Array<{
    step: number;
    description: string;
    deadline: string;
    responsible: string;
    documents: string[];
  }>;
  risks: string[];
  benefits: string[];
  timeline: string;
  createdAt: Date;
}

interface TaxScenario {
  regime: TaxRegimeType;
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  pros: string[];
  cons: string[];
  requirements: string[];
  viability: 'viable' | 'not_viable' | 'requires_analysis';
}

interface TaxForecast {
  period: '3_months' | '6_months' | '12_months';
  scenarios: {
    conservative: { revenue: number; taxes: number; };
    realistic: { revenue: number; taxes: number; };
    optimistic: { revenue: number; taxes: number; };
  };
  insights: string[];
  recommendations: string[];
}

class AdvancedTaxService {
  private businessProfiles: Map<string, BusinessProfile> = new Map();
  private optimizationPlans: Map<string, TaxOptimizationPlan> = new Map();

  /**
   * Análise tributária completa e personalizada
   */
  async performComprehensiveTaxAnalysis(
    businessProfile: BusinessProfile
  ): Promise<{
    currentAnalysis: TaxAnalysis;
    scenarios: TaxScenario[];
    optimizationPlan?: TaxOptimizationPlan;
    forecast: TaxForecast;
    strategicRecommendations: string[];
  }> {
    try {
      const startTime = Date.now();

      // 1. Análise do regime atual
      const currentAnalysis = await this.analyzeCurrentRegime(businessProfile);

      // 2. Cenários alternativos
      const scenarios = await this.generateTaxScenarios(businessProfile);

      // 3. Plano de otimização (se houver oportunidade)
      const optimizationPlan = await this.createOptimizationPlan(businessProfile, scenarios);

      // 4. Projeções futuras
      const forecast = await this.generateTaxForecast(businessProfile);

      // 5. Recomendações estratégicas
      const strategicRecommendations = this.generateStrategicRecommendations(
        businessProfile,
        scenarios,
        forecast
      );

      const duration = Date.now() - startTime;
      logger.trackAIUsage('comprehensive_tax_analysis', duration, true, {
        businessId: businessProfile.id,
        currentRegime: this.getCurrentRegime(businessProfile),
        potentialSavings: optimizationPlan?.potentialSavingsAnnual || 0
      });

      return {
        currentAnalysis,
        scenarios,
        optimizationPlan,
        forecast,
        strategicRecommendations
      };

    } catch (error) {
      logger.trackAIError('comprehensive_tax_analysis', error, businessProfile);
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
      hasManufacturing: businessProfile.hasManufacturing
    });
  }

  /**
   * Determina o regime tributário atual baseado no perfil
   */
  private getCurrentRegime(businessProfile: BusinessProfile): TaxRegimeType {
    const annualRevenue = businessProfile.monthlyRevenue * 12;
    
    // Lógica simplificada para determinar regime atual
    if (annualRevenue <= 4800000) {
      return TaxRegimeType.SIMPLES_NACIONAL;
    } else if (annualRevenue <= 78000000) {
      return TaxRegimeType.LUCRO_PRESUMIDO;
    } else {
      return TaxRegimeType.LUCRO_REAL;
    }
  }

  /**
   * Gera cenários de diferentes regimes tributários
   */
  private async generateTaxScenarios(businessProfile: BusinessProfile): Promise<TaxScenario[]> {
    const scenarios: TaxScenario[] = [];
    const annualRevenue = businessProfile.monthlyRevenue * 12;

    // Simples Nacional
    if (annualRevenue <= 4800000) {
      scenarios.push(await this.createSimplesToScenario(businessProfile));
    }

    // Lucro Presumido
    if (annualRevenue <= 78000000) {
      scenarios.push(await this.createLucroPresumidoScenario(businessProfile));
    }

    // Lucro Real
    scenarios.push(await this.createLucroRealScenario(businessProfile));

    return scenarios;
  }

  /**
   * Cria cenário do Simples Nacional
   */
  private async createSimplesToScenario(businessProfile: BusinessProfile): Promise<TaxScenario> {
    const annualRevenue = businessProfile.monthlyRevenue * 12;
    const rate = this.getSimplesToRate(businessProfile, annualRevenue);
    const annualTax = annualRevenue * (rate / 100);

    return {
      regime: TaxRegimeType.SIMPLES_NACIONAL,
      annualTax,
      monthlyTax: annualTax / 12,
      effectiveRate: rate,
      pros: [
        'Menor carga tributária geral',
        'Simplificação de obrigações acessórias',
        'Unificação dos impostos em uma guia',
        'Menos burocracia fiscal',
        'Dispensa de livros fiscais complexos'
      ],
      cons: [
        'Limitação de faturamento anual',
        'Restrições para algumas atividades',
        'Menos flexibilidade para planejamento',
        'Dificuldade para créditos tributários'
      ],
      requirements: [
        'Faturamento anual até R$ 4,8 milhões',
        'Não exercer atividades impeditivas',
        'Não ter débitos com Receita Federal',
        'Não participar de outras empresas'
      ],
      viability: 'viable'
    };
  }

  /**
   * Cria cenário do Lucro Presumido
   */
  private async createLucroPresumidoScenario(businessProfile: BusinessProfile): Promise<TaxScenario> {
    const annualRevenue = businessProfile.monthlyRevenue * 12;
    const rate = this.getLucroPresumidoRate(businessProfile);
    const annualTax = annualRevenue * (rate / 100);

    return {
      regime: TaxRegimeType.LUCRO_PRESUMIDO,
      annualTax,
      monthlyTax: annualTax / 12,
      effectiveRate: rate,
      pros: [
        'Apuração trimestral',
        'Simplicidade no cálculo',
        'Menor controle fiscal',
        'Boa opção para margens altas',
        'Flexibilidade para distribuição de lucros'
      ],
      cons: [
        'Tributação sobre receita bruta',
        'Sem aproveitamento de prejuízos',
        'Limitado para empresas com gastos altos',
        'Menos incentivos fiscais'
      ],
      requirements: [
        'Faturamento anual até R$ 78 milhões',
        'Manter documentação fiscal adequada',
        'Apuração trimestral obrigatória',
        'Controle de limites de presumição'
      ],
      viability: annualRevenue <= 78000000 ? 'viable' : 'not_viable'
    };
  }

  /**
   * Cria cenário do Lucro Real
   */
  private async createLucroRealScenario(businessProfile: BusinessProfile): Promise<TaxScenario> {
    const annualRevenue = businessProfile.monthlyRevenue * 12;
    const rate = this.getLucroRealRate(businessProfile);
    const annualTax = annualRevenue * (rate / 100);

    return {
      regime: TaxRegimeType.LUCRO_REAL,
      annualTax,
      monthlyTax: annualTax / 12,
      effectiveRate: rate,
      pros: [
        'Tributação sobre lucro efetivo',
        'Aproveitamento de prejuízos fiscais',
        'Máximo de incentivos fiscais',
        'Créditos tributários amplos',
        'Flexibilidade para planejamento'
      ],
      cons: [
        'Maior complexidade operacional',
        'Mais obrigações acessórias',
        'Custos de compliance maiores',
        'Exige estrutura fiscal robusta'
      ],
      requirements: [
        'Escrituração completa (LALUR)',
        'Controles fiscais rigorosos',
        'Apuração mensal ou anual',
        'Obrigatório para receita > R$ 78 milhões'
      ],
      viability: 'viable'
    };
  }

  /**
   * Calcula alíquota do Simples Nacional
   */
  private getSimplesToRate(businessProfile: BusinessProfile, annualRevenue: number): number {
    // Alíquotas simplificadas baseadas no anexo e faturamento
    const rates = {
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
      }
    };

    const businessRates = rates[businessProfile.businessType] || rates.comercio;

    if (annualRevenue <= 180000) {return businessRates.tier1;}
    if (annualRevenue <= 360000) {return businessRates.tier2;}
    if (annualRevenue <= 720000) {return businessRates.tier3;}
    if (annualRevenue <= 1800000) {return businessRates.tier4;}
    return businessRates.tier5;
  }

  /**
   * Calcula alíquota do Lucro Presumido
   */
  private getLucroPresumidoRate(businessProfile: BusinessProfile): number {
    const baseRates = {
      comercio: 11.33,
      industria: 11.33,
      servicos: 16.33
    };

    let rate = baseRates[businessProfile.businessType] || baseRates.comercio;

    // Ajustes baseados no perfil
    if (businessProfile.hasExports) {
      rate *= 0.9; // Redução para exportadores
    }

    if (businessProfile.location.state === 'ZFM') { // Zona Franca de Manaus
      rate *= 0.8;
    }

    return rate;
  }

  /**
   * Calcula alíquota do Lucro Real
   */
  private getLucroRealRate(businessProfile: BusinessProfile): number {
    // Taxa base estimada considerando IRPJ, CSLL, PIS, COFINS
    let baseRate = 15.0;

    if (businessProfile.businessType === 'servicos') {
      baseRate = 18.0; // Maior por causa do ISS
    }

    // Ajustes baseados no perfil
    if (businessProfile.hasManufacturing) {
      baseRate *= 0.95; // Créditos industriais
    }

    if (businessProfile.hasExports) {
      baseRate *= 0.85; // Benefícios para exportação
    }

    return baseRate;
  }

  /**
   * Cria plano de otimização tributária
   */
  private async createOptimizationPlan(
    businessProfile: BusinessProfile,
    scenarios: TaxScenario[]
  ): Promise<TaxOptimizationPlan | undefined> {
    const currentRegime = this.getCurrentRegime(businessProfile);
    const currentScenario = scenarios.find(s => s.regime === currentRegime);
    
    if (!currentScenario) {return undefined;}

    // Encontra o melhor regime alternativo
    const viableAlternatives = scenarios.filter(s => 
      s.regime !== currentRegime && 
      s.viability === 'viable' &&
      s.annualTax < currentScenario.annualTax
    );

    if (viableAlternatives.length === 0) {return undefined;}

    const bestAlternative = viableAlternatives.reduce((best, scenario) => 
      scenario.annualTax < best.annualTax ? scenario : best
    );

    const potentialSavings = currentScenario.annualTax - bestAlternative.annualTax;

    // Só cria plano se a economia for significativa (> R$ 5.000/ano)
    if (potentialSavings < 5000) {return undefined;}

    const planId = `tax_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const plan: TaxOptimizationPlan = {
      id: planId,
      businessId: businessProfile.id,
      currentRegime: currentRegime as TaxRegimeType,
      recommendedRegime: bestAlternative.regime,
      potentialSavingsAnnual: potentialSavings,
      implementationSteps: this.generateImplementationSteps(currentRegime, bestAlternative.regime),
      risks: this.identifyImplementationRisks(currentRegime, bestAlternative.regime),
      benefits: this.identifyImplementationBenefits(potentialSavings, bestAlternative),
      timeline: this.calculateImplementationTimeline(currentRegime, bestAlternative.regime),
      createdAt: new Date()
    };

    this.optimizationPlans.set(planId, plan);
    return plan;
  }

  /**
   * Gera passos de implementação
   */
  private generateImplementationSteps(
    currentRegime: TaxRegimeType,
    targetRegime: TaxRegimeType
  ): Array<{
    step: number;
    description: string;
    deadline: string;
    responsible: string;
    documents: string[];
  }> {
    const baseSteps = [
      {
        step: 1,
        description: 'Análise detalhada da viabilidade com contador',
        deadline: '15 dias',
        responsible: 'Contador/Consultor fiscal',
        documents: ['Balancetes últimos 12 meses', 'DRE detalhada', 'Relatório de atividades']
      },
      {
        step: 2,
        description: 'Regularização de pendências fiscais',
        deadline: '30 dias',
        responsible: 'Setor fiscal',
        documents: ['Certidões negativas', 'Quitação de débitos', 'Regularização cadastral']
      },
      {
        step: 3,
        description: 'Ajuste de processos internos',
        deadline: '45 dias',
        responsible: 'Equipe interna',
        documents: ['Novos procedimentos', 'Treinamento equipe', 'Sistemas atualizados']
      }
    ];

    if (targetRegime === TaxRegimeType.SIMPLES_NACIONAL) {
      baseSteps.push({
        step: 4,
        description: 'Solicitação de opção pelo Simples Nacional',
        deadline: 'Janeiro do ano seguinte',
        responsible: 'Contador',
        documents: ['Formulário de opção', 'Documentos societários', 'Termo de opção']
      });
    }

    return baseSteps;
  }

  /**
   * Identifica riscos da implementação
   */
  private identifyImplementationRisks(currentRegime: TaxRegimeType, targetRegime: TaxRegimeType): string[] {
    const risks: string[] = [
      'Período de carência para mudança (geralmente 1 ano)',
      'Possível aumento de obrigações acessórias',
      'Necessidade de adequação de sistemas',
      'Risco de mudanças na legislação'
    ];

    if (targetRegime === TaxRegimeType.SIMPLES_NACIONAL) {
      risks.push('Limitação de faturamento futuro');
      risks.push('Restrições para algumas atividades');
    }

    if (targetRegime === TaxRegimeType.LUCRO_REAL) {
      risks.push('Maior complexidade operacional');
      risks.push('Necessidade de estrutura fiscal mais robusta');
    }

    return risks;
  }

  /**
   * Identifica benefícios da implementação
   */
  private identifyImplementationBenefits(
    savings: number,
    targetScenario: TaxScenario
  ): string[] {
    const benefits: string[] = [
      `Economia anual de R$ ${savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Redução da carga tributária para ${targetScenario.effectiveRate.toFixed(2)}%`,
      'Melhoria do fluxo de caixa',
      'Recursos liberados para investimento'
    ];

    benefits.push(...targetScenario.pros);

    return benefits;
  }

  /**
   * Calcula timeline de implementação
   */
  private calculateImplementationTimeline(currentRegime: TaxRegimeType, targetRegime: TaxRegimeType): string {
    // A maioria das mudanças de regime só pode ser feita no início do ano
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    if (now.getMonth() < 11) { // Antes de dezembro
      return `Implementação em janeiro de ${nextYear} (${12 - now.getMonth()} meses para preparação)`;
    } else {
      return `Implementação em janeiro de ${nextYear + 1} (preparação durante ${currentYear + 1})`;
    }
  }

  /**
   * Gera projeções tributárias
   */
  private async generateTaxForecast(businessProfile: BusinessProfile): Promise<TaxForecast> {
    const currentMonthlyRevenue = businessProfile.monthlyRevenue;
    const currentRegime = this.getCurrentRegime(businessProfile);
    const currentRate = this.getCurrentTaxRate(businessProfile, currentRegime);

    // Cenários de crescimento
    const scenarios = {
      conservative: {
        revenue: currentMonthlyRevenue * 12 * 1.05, // 5% crescimento
        taxes: 0
      },
      realistic: {
        revenue: currentMonthlyRevenue * 12 * 1.15, // 15% crescimento
        taxes: 0
      },
      optimistic: {
        revenue: currentMonthlyRevenue * 12 * 1.30, // 30% crescimento
        taxes: 0
      }
    };

    // Calcula impostos para cada cenário
    scenarios.conservative.taxes = scenarios.conservative.revenue * (currentRate / 100);
    scenarios.realistic.taxes = scenarios.realistic.revenue * (currentRate / 100);
    scenarios.optimistic.taxes = scenarios.optimistic.revenue * (currentRate / 100);

    const insights = this.generateForecastInsights(businessProfile, scenarios);
    const recommendations = this.generateForecastRecommendations(businessProfile, scenarios);

    return {
      period: '12_months',
      scenarios,
      insights,
      recommendations
    };
  }

  /**
   * Obtém taxa tributária atual
   */
  private getCurrentTaxRate(businessProfile: BusinessProfile, regime: TaxRegimeType): number {
    switch (regime) {
      case TaxRegimeType.SIMPLES_NACIONAL:
        return this.getSimplesToRate(businessProfile, businessProfile.monthlyRevenue * 12);
      case TaxRegimeType.LUCRO_PRESUMIDO:
        return this.getLucroPresumidoRate(businessProfile);
      case TaxRegimeType.LUCRO_REAL:
        return this.getLucroRealRate(businessProfile);
      default:
        return 15.0;
    }
  }

  /**
   * Gera insights das projeções
   */
  private generateForecastInsights(
    businessProfile: BusinessProfile,
    scenarios: any
  ): string[] {
    const insights: string[] = [];
    const currentAnnualRevenue = businessProfile.monthlyRevenue * 12;

    if (scenarios.optimistic.revenue > 4800000 && currentAnnualRevenue <= 4800000) {
      insights.push('⚠️ No cenário otimista, você ultrapassará o limite do Simples Nacional');
    }

    if (scenarios.realistic.revenue > 78000000 && currentAnnualRevenue <= 78000000) {
      insights.push('⚠️ No cenário realista, precisará migrar para Lucro Real');
    }

    const conservativeTaxRate = (scenarios.conservative.taxes / scenarios.conservative.revenue) * 100;
    const optimisticTaxRate = (scenarios.optimistic.taxes / scenarios.optimistic.revenue) * 100;

    if (Math.abs(conservativeTaxRate - optimisticTaxRate) > 2) {
      insights.push('📊 A carga tributária pode variar significativamente com o crescimento');
    }

    return insights;
  }

  /**
   * Gera recomendações das projeções
   */
  private generateForecastRecommendations(
    businessProfile: BusinessProfile,
    scenarios: any
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push('📈 Monitore o crescimento para não ultrapassar limites de regime');
    recommendations.push('💰 Reserve recursos para investimentos que reduzam carga tributária');
    recommendations.push('📊 Reavalie o regime tributário semestralmente');

    if (businessProfile.seasonality === 'high') {
      recommendations.push('🗓️ Considere planejamento tributário específico para sazonalidade');
    }

    if (businessProfile.hasExports || businessProfile.hasImports) {
      recommendations.push('🌍 Explore incentivos fiscais para comércio exterior');
    }

    return recommendations;
  }

  /**
   * Gera recomendações estratégicas
   */
  private generateStrategicRecommendations(
    businessProfile: BusinessProfile,
    scenarios: TaxScenario[],
    forecast: TaxForecast
  ): string[] {
    const recommendations: string[] = [];

    // Recomendação baseada no melhor cenário
    const bestScenario = scenarios.reduce((best, scenario) => 
      scenario.annualTax < best.annualTax ? scenario : best
    );

    if (bestScenario.regime !== this.getCurrentRegime(businessProfile)) {
      recommendations.push(
        `🎯 Considere migrar para ${bestScenario.regime} - economia de R$ ${(scenarios.find(s => s.regime === this.getCurrentRegime(businessProfile))!.annualTax - bestScenario.annualTax).toLocaleString('pt-BR')}/ano`
      );
    }

    // Recomendações baseadas no perfil
    if (businessProfile.employeeCount > 20 && !businessProfile.hasManufacturing) {
      recommendations.push('👥 Avalie benefícios fiscais para contratação de jovens aprendizes');
    }

    if (businessProfile.businessType === 'industria') {
      recommendations.push('🏭 Explore incentivos fiscais regionais para indústria');
    }

    if (businessProfile.monthlyRevenue > 100000) {
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

export const advancedTaxService = new AdvancedTaxService();