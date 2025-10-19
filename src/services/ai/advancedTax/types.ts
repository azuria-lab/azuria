/**
 * Advanced Tax Service - Type Definitions
 * Tipos e interfaces para análise tributária avançada
 */

import type { TaxRegimeType } from '@/shared/types/ai';

/**
 * Perfil completo do negócio para análise tributária
 * 
 * Contém todas as informações necessárias para análise tributária avançada,
 * simulação de cenários e recomendação de regime fiscal ideal.
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   id: 'biz_123',
 *   businessType: 'comercio',
 *   monthlyRevenue: 150000.00,
 *   employeeCount: 8,
 *   hasManufacturing: false,
 *   hasExports: false,
 *   hasImports: true,
 *   location: {
 *     state: 'SP',
 *     city: 'São Paulo'
 *   },
 *   mainActivities: [
 *     'Comércio varejista de eletrônicos',
 *     'Assistência técnica especializada'
 *   ],
 *   seasonality: 'high'  // Black Friday, Natal
 * };
 * ```
 */
export interface BusinessProfile {
  /**
   * Identificador único do negócio
   * @example 'biz_123'
   */
  id: string;

  /**
   * Tipo de atividade principal
   * - comercio: Compra e venda de mercadorias
   * - industria: Produção/transformação
   * - servicos: Prestação de serviços
   * - misto: Combinação de atividades
   * @example 'comercio'
   */
  businessType: 'comercio' | 'industria' | 'servicos' | 'misto';

  /**
   * Faturamento médio mensal (R$)
   * @example 150000.00
   */
  monthlyRevenue: number;

  /**
   * Quantidade de funcionários
   * @example 8
   */
  employeeCount: number;

  /**
   * Indica se possui atividade industrial/produção
   * @example false
   */
  hasManufacturing: boolean;

  /**
   * Indica se realiza exportações
   * @example false
   */
  hasExports: boolean;

  /**
   * Indica se realiza importações
   * @example true
   */
  hasImports: boolean;

  /**
   * Localização do estabelecimento
   * Importante para cálculo de ICMS e ISS
   */
  location: {
    /**
     * Sigla do estado (UF)
     * @example 'SP'
     */
    state: string;

    /**
     * Nome da cidade
     * @example 'São Paulo'
     */
    city: string;
  };

  /**
   * Lista de atividades exercidas (CNAEs)
   * @example ['Comércio varejista de eletrônicos', 'Assistência técnica']
   */
  mainActivities: string[];

  /**
   * Nível de sazonalidade do faturamento
   * - high: Grande variação mensal (> 30%)
   * - medium: Variação moderada (10-30%)
   * - low: Faturamento estável (< 10%)
   * @example 'high'
   */
  seasonality: 'high' | 'medium' | 'low';
}

/**
 * Plano de otimização tributária personalizado
 * 
 * Roadmap detalhado para migração de regime fiscal ou implementação
 * de estratégias de economia tributária.
 * 
 * @example
 * ```typescript
 * const plan: TaxOptimizationPlan = {
 *   id: 'plan_456',
 *   businessId: 'biz_123',
 *   currentRegime: 'lucro_presumido',
 *   recommendedRegime: 'simples_nacional',
 *   potentialSavingsAnnual: 48000.00,  // R$ 48k/ano
 *   implementationSteps: [
 *     {
 *       step: 1,
 *       description: 'Verificar enquadramento no Simples Nacional',
 *       deadline: '2024-11-30',
 *       responsible: 'Contador',
 *       documents: ['Certidão Negativa de Débitos', 'Faturamento últimos 12 meses']
 *     },
 *     {
 *       step: 2,
 *       description: 'Solicitar opção pelo Simples Nacional',
 *       deadline: '2025-01-31',
 *       responsible: 'Contador',
 *       documents: ['Formulário de opção', 'CNPJ', 'Inscrição Estadual']
 *     }
 *   ],
 *   risks: [
 *     'Aumento de faturamento pode desenquadrar do Simples',
 *     'Necessário manter controle rigoroso de receitas'
 *   ],
 *   benefits: [
 *     'Redução de 32% na carga tributária',
 *     'Simplificação de obrigações acessórias',
 *     'Unificação de tributos em guia única'
 *   ],
 *   timeline: '3 meses',
 *   createdAt: new Date('2024-10-19')
 * };
 * ```
 */
export interface TaxOptimizationPlan {
  /**
   * Identificador único do plano
   * @example 'plan_456'
   */
  id: string;

  /**
   * ID do negócio ao qual o plano se refere
   * @example 'biz_123'
   */
  businessId: string;

  /**
   * Regime tributário atual
   * @example 'lucro_presumido'
   */
  currentRegime: TaxRegimeType;

  /**
   * Regime tributário recomendado
   * @example 'simples_nacional'
   */
  recommendedRegime: TaxRegimeType;

  /**
   * Economia anual estimada com a mudança (R$)
   * @example 48000.00
   */
  potentialSavingsAnnual: number;

  /**
   * Passos sequenciais para implementação
   * Cada step inclui descrição, prazo, responsável e documentos necessários
   */
  implementationSteps: Array<{
    /**
     * Número do passo (ordem de execução)
     * @example 1
     */
    step: number;

    /**
     * Descrição da ação a ser tomada
     * @example 'Verificar enquadramento no Simples Nacional'
     */
    description: string;

    /**
     * Data limite para conclusão (ISO 8601)
     * @example '2024-11-30'
     */
    deadline: string;

    /**
     * Pessoa ou departamento responsável
     * @example 'Contador'
     */
    responsible: string;

    /**
     * Documentos necessários para o passo
     * @example ['Certidão Negativa de Débitos', 'Faturamento últimos 12 meses']
     */
    documents: string[];
  }>;

  /**
   * Riscos e pontos de atenção
   * @example ['Aumento de faturamento pode desenquadrar do Simples']
   */
  risks: string[];

  /**
   * Benefícios esperados da otimização
   * @example ['Redução de 32% na carga tributária']
   */
  benefits: string[];

  /**
   * Prazo estimado para implementação completa
   * @example '3 meses'
   */
  timeline: string;

  /**
   * Data de criação do plano
   * @example new Date('2024-10-19')
   */
  createdAt: Date;
}

/**
 * Cenário tributário simulado
 * 
 * Representa uma simulação completa de um regime fiscal específico,
 * incluindo custos, viabilidade e trade-offs.
 * 
 * @example
 * ```typescript
 * const scenario: TaxScenario = {
 *   regime: 'simples_nacional',
 *   annualTax: 216000.00,     // R$ 216k/ano
 *   monthlyTax: 18000.00,     // R$ 18k/mês
 *   effectiveRate: 12.0,      // 12% sobre faturamento
 *   pros: [
 *     '✅ Menor carga tributária (12% vs 16.33%)',
 *     '✅ Guia única de pagamento (DAS)',
 *     '✅ Simplificação de obrigações acessórias',
 *     '✅ Dispensa de escrita contábil formal'
 *   ],
 *   cons: [
 *     '❌ Limite de R$ 4.8M de faturamento anual',
 *     '❌ Restrições para alguns CNAEs',
 *     '❌ Não permite compensar créditos de ICMS/PIS/COFINS'
 *   ],
 *   requirements: [
 *     'Faturamento anual ≤ R$ 4.800.000',
 *     'Sem débitos com INSS e fazendas',
 *     'CNAE permitido no Simples',
 *     'Não ter sócio no exterior'
 *   ],
 *   viability: 'viable'
 * };
 * ```
 */
export interface TaxScenario {
  /**
   * Regime tributário simulado
   * @example 'simples_nacional'
   */
  regime: TaxRegimeType;

  /**
   * Total de impostos anuais (R$)
   * @example 216000.00
   */
  annualTax: number;

  /**
   * Média mensal de impostos (R$)
   * @example 18000.00
   */
  monthlyTax: number;

  /**
   * Taxa efetiva sobre faturamento (%)
   * @example 12.0
   */
  effectiveRate: number;

  /**
   * Vantagens do regime
   * @example ['✅ Menor carga tributária', '✅ Guia única']
   */
  pros: string[];

  /**
   * Desvantagens e limitações
   * @example ['❌ Limite de R$ 4.8M/ano', '❌ Restrições CNAEs']
   */
  cons: string[];

  /**
   * Requisitos para enquadramento
   * @example ['Faturamento anual ≤ R$ 4.800.000', 'Sem débitos']
   */
  requirements: string[];

  /**
   * Viabilidade de implementação
   * - viable: Pode ser implementado imediatamente
   * - not_viable: Não atende requisitos
   * - requires_analysis: Necessita análise detalhada
   * @example 'viable'
   */
  viability: 'viable' | 'not_viable' | 'requires_analysis';
}

/**
 * Projeção tributária futura
 * 
 * Estima a carga tributária em diferentes cenários de crescimento,
 * auxiliando no planejamento financeiro e tributário.
 * 
 * @example
 * ```typescript
 * const forecast: TaxForecast = {
 *   period: '12_months',
 *   scenarios: {
 *     conservative: {
 *       revenue: 1800000.00,  // +0% crescimento
 *       taxes: 216000.00      // 12% taxa efetiva
 *     },
 *     realistic: {
 *       revenue: 2160000.00,  // +20% crescimento
 *       taxes: 259200.00      // 12% taxa efetiva
 *     },
 *     optimistic: {
 *       revenue: 2700000.00,  // +50% crescimento
 *       taxes: 324000.00      // 12% taxa efetiva
 *     }
 *   },
 *   insights: [
 *     '📈 Crescimento de 20% mantém viabilidade no Simples Nacional',
 *     '⚠️ Crescimento acima de 167% pode exigir mudança de regime',
 *     '💡 Taxa efetiva permanece estável em 12% nos 3 cenários'
 *   ],
 *   recommendations: [
 *     '✅ Manter regime atual até atingir R$ 4M de faturamento',
 *     '🔍 Monitorar faturamento mensal para evitar desenquadramento',
 *     '📊 Simular Lucro Presumido quando receita > R$ 3.5M'
 *   ]
 * };
 * ```
 */
export interface TaxForecast {
  /**
   * Período da projeção
   * @example '12_months'
   */
  period: '3_months' | '6_months' | '12_months';

  /**
   * Cenários de projeção com diferentes taxas de crescimento
   */
  scenarios: {
    /**
     * Cenário conservador (crescimento mínimo ou negativo)
     * @example { revenue: 1800000.00, taxes: 216000.00 }
     */
    conservative: {
      /**
       * Receita projetada (R$)
       * @example 1800000.00
       */
      revenue: number;

      /**
       * Impostos projetados (R$)
       * @example 216000.00
       */
      taxes: number;
    };

    /**
     * Cenário realista (crescimento moderado)
     * @example { revenue: 2160000.00, taxes: 259200.00 }
     */
    realistic: {
      /**
       * Receita projetada (R$)
       * @example 2160000.00
       */
      revenue: number;

      /**
       * Impostos projetados (R$)
       * @example 259200.00
       */
      taxes: number;
    };

    /**
     * Cenário otimista (crescimento acelerado)
     * @example { revenue: 2700000.00, taxes: 324000.00 }
     */
    optimistic: {
      /**
       * Receita projetada (R$)
       * @example 2700000.00
       */
      revenue: number;

      /**
       * Impostos projetados (R$)
       * @example 324000.00
       */
      taxes: number;
    };
  };

  /**
   * Análises e observações sobre as projeções
   * @example ['📈 Crescimento de 20% mantém viabilidade']
   */
  insights: string[];

  /**
   * Recomendações estratégicas baseadas nas projeções
   * @example ['✅ Manter regime atual até R$ 4M']
   */
  recommendations: string[];
}

/**
 * Resultado completo da análise tributária avançada
 * 
 * Agrega todos os componentes da análise: situação atual, simulação
 * de cenários, plano de otimização e projeções futuras.
 * 
 * @example
 * ```typescript
 * const result: ComprehensiveTaxAnalysisResult = {
 *   currentAnalysis: {
 *     regime: 'lucro_presumido',
 *     effectiveTaxRate: 16.33,
 *     monthlyTax: 24495.00,
 *     annualTax: 293940.00,
 *     breakdown: {
 *       irpj: 3600.00,
 *       csll: 3240.00,
 *       pis: 990.00,
 *       cofins: 4560.00,
 *       icms: 12105.00
 *     }
 *   },
 *   scenarios: [
 *     {
 *       regime: 'simples_nacional',
 *       annualTax: 216000.00,
 *       effectiveRate: 12.0,
 *       viability: 'viable',
 *       // ...
 *     },
 *     {
 *       regime: 'lucro_real',
 *       annualTax: 310000.00,
 *       effectiveRate: 17.2,
 *       viability: 'requires_analysis',
 *       // ...
 *     }
 *   ],
 *   optimizationPlan: {
 *     currentRegime: 'lucro_presumido',
 *     recommendedRegime: 'simples_nacional',
 *     potentialSavingsAnnual: 77940.00,  // R$ 77.9k economia
 *     // ...
 *   },
 *   forecast: {
 *     period: '12_months',
 *     scenarios: {
 *       conservative: { revenue: 1800000, taxes: 216000 },
 *       realistic: { revenue: 2160000, taxes: 259200 },
 *       optimistic: { revenue: 2700000, taxes: 324000 }
 *     },
 *     // ...
 *   },
 *   strategicRecommendations: [
 *     '🎯 AÇÃO PRIORITÁRIA: Migrar para Simples Nacional até 31/01',
 *     '💰 ECONOMIA ESTIMADA: R$ 77.940/ano (26.5% redução)',
 *     '📅 PRAZO: Implementação completa em 3 meses',
 *     '⚠️ ATENÇÃO: Monitorar limite de R$ 4.8M/ano',
 *     '🔍 PRÓXIMO PASSO: Agendar reunião com contador'
 *   ]
 * };
 * ```
 */
export interface ComprehensiveTaxAnalysisResult {
  /**
   * Análise do regime tributário atual
   * Importado de @/shared/types/ai
   */
  currentAnalysis: import('@/shared/types/ai').TaxAnalysis;

  /**
   * Simulações de diferentes regimes tributários
   * Array com 2-3 cenários (geralmente Simples, Presumido, Real)
   * @example [{ regime: 'simples_nacional', annualTax: 216000, ... }]
   */
  scenarios: TaxScenario[];

  /**
   * Plano de otimização tributária (opcional)
   * Só é gerado se houver oportunidade de economia significativa (> 10%)
   */
  optimizationPlan?: TaxOptimizationPlan;

  /**
   * Projeções tributárias futuras
   * Estimativas para 3, 6 ou 12 meses em 3 cenários de crescimento
   */
  forecast: TaxForecast;

  /**
   * Recomendações estratégicas de alto nível
   * 
   * Incluem:
   * - Ações prioritárias
   * - Economia estimada
   * - Prazos e milestones
   * - Alertas importantes
   * - Próximos passos
   * 
   * @example [
   *   '🎯 AÇÃO: Migrar para Simples Nacional',
   *   '💰 ECONOMIA: R$ 77.940/ano',
   *   '⚠️ ATENÇÃO: Monitorar limite'
   * ]
   */
  strategicRecommendations: string[];
}

