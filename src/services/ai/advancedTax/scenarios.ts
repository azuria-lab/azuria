/**
 * Advanced Tax Service - Tax Scenarios Generation
 * Geração de cenários tributários simulados para diferentes regimes
 */

import { TaxRegimeType } from '@/shared/types/ai';
import type { BusinessProfile, TaxScenario } from './types';
import { getLucroPresumidoRate, getLucroRealRate, getSimplesToRate } from './calculations';

/**
 * Limites de faturamento anual para cada regime
 */
const ANNUAL_REVENUE_LIMITS = {
  SIMPLES_NACIONAL: 4_800_000, // R$ 4.8 milhões
  LUCRO_PRESUMIDO: 78_000_000,  // R$ 78 milhões
} as const;

/**
 * Gera todos os cenários tributários aplicáveis ao negócio
 * 
 * Cria cenários simulados para cada regime fiscal viável baseado no faturamento
 * e características do negócio. Avalia automaticamente a viabilidade de cada regime.
 * 
 * @param businessProfile - Perfil completo do negócio incluindo tipo, faturamento e características
 * @returns Array com cenários viáveis para Simples Nacional, Lucro Presumido e/ou Lucro Real
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'service',
 *   monthlyRevenue: 50000, // R$ 50k/mês = R$ 600k/ano
 *   // ... outros campos
 * };
 * 
 * const scenarios = await generateTaxScenarios(profile);
 * // Retorna 3 cenários:
 * // 1. Simples Nacional (viável - < R$ 4.8M)
 * // 2. Lucro Presumido (viável - < R$ 78M)
 * // 3. Lucro Real (sempre viável)
 * 
 * scenarios.forEach(s => {
 *   console.log(`${s.regime}: R$ ${s.annualTax.toFixed(2)}/ano`);
 *   console.log(`Taxa efetiva: ${s.effectiveRate}%`);
 * });
 * ```
 * 
 * @remarks
 * Regras de viabilidade:
 * - **Simples Nacional**: Apenas se faturamento anual ≤ R$ 4.8M
 * - **Lucro Presumido**: Apenas se faturamento anual ≤ R$ 78M
 * - **Lucro Real**: Sempre disponível (obrigatório se > R$ 78M)
 * 
 * Cada cenário inclui:
 * - Cálculos de impostos (anual e mensal)
 * - Taxa efetiva aplicada
 * - Prós e contras do regime
 * - Requisitos legais
 * - Status de viabilidade
 */
export async function generateTaxScenarios(
  businessProfile: BusinessProfile
): Promise<TaxScenario[]> {
  const scenarios: TaxScenario[] = [];
  const annualRevenue = businessProfile.monthlyRevenue * 12;

  // Simples Nacional (se aplicável)
  if (annualRevenue <= ANNUAL_REVENUE_LIMITS.SIMPLES_NACIONAL) {
    scenarios.push(await createSimplesToScenario(businessProfile));
  }

  // Lucro Presumido (se aplicável)
  if (annualRevenue <= ANNUAL_REVENUE_LIMITS.LUCRO_PRESUMIDO) {
    scenarios.push(await createLucroPresumidoScenario(businessProfile));
  }

  // Lucro Real (sempre aplicável)
  scenarios.push(await createLucroRealScenario(businessProfile));

  return scenarios;
}

/**
 * Cria cenário detalhado do Simples Nacional
 * 
 * Simula o regime Simples Nacional calculando impostos, taxa efetiva e
 * avaliando viabilidade com base no faturamento anual.
 * 
 * @param businessProfile - Perfil completo do negócio
 * @returns Cenário completo do Simples Nacional incluindo impostos, prós/contras e requisitos
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'commerce',
 *   monthlyRevenue: 80000, // R$ 80k/mês = R$ 960k/ano
 *   // ...
 * };
 * 
 * const scenario = await createSimplesToScenario(profile);
 * console.log(`Imposto anual: R$ ${scenario.annualTax.toFixed(2)}`);
 * console.log(`Taxa efetiva: ${scenario.effectiveRate}%`);
 * console.log(`Status: ${scenario.viability}`); // 'viable'
 * 
 * // Analisar benefícios
 * scenario.pros.forEach(pro => console.log(`✅ ${pro}`));
 * ```
 * 
 * @remarks
 * **Limites e Condições**:
 * - Faturamento anual máximo: R$ 4.8 milhões
 * - Taxa progressiva por faixa de faturamento
 * - Unifica 8 impostos em uma única guia (DAS)
 * 
 * **Benefícios principais**:
 * - Menor carga tributária (geralmente 4-15%)
 * - Simplificação extrema de obrigações
 * - Redução de custos contábeis
 * 
 * **Status de viabilidade**: Sempre retorna 'viable' se chamado corretamente
 * (a função só deve ser chamada quando faturamento ≤ R$ 4.8M)
 */
export async function createSimplesToScenario(
  businessProfile: BusinessProfile
): Promise<TaxScenario> {
  const annualRevenue = businessProfile.monthlyRevenue * 12;
  const rate = getSimplesToRate(businessProfile, annualRevenue);
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
      'Dispensa de livros fiscais complexos',
    ],
    cons: [
      'Limitação de faturamento anual',
      'Restrições para algumas atividades',
      'Menos flexibilidade para planejamento',
      'Dificuldade para créditos tributários',
    ],
    requirements: [
      'Faturamento anual até R$ 4,8 milhões',
      'Não exercer atividades impeditivas',
      'Não ter débitos com Receita Federal',
      'Não participar de outras empresas',
    ],
    viability: 'viable',
  };
}

/**
 * Cria cenário detalhado do Lucro Presumido
 * 
 * Simula o regime Lucro Presumido calculando impostos baseados em margem
 * presumida de lucro. Ideal para empresas com margens altas.
 * 
 * @param businessProfile - Perfil completo do negócio
 * @returns Cenário completo do Lucro Presumido incluindo impostos, prós/contras e viabilidade
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'service',
 *   monthlyRevenue: 500000, // R$ 500k/mês = R$ 6M/ano
 *   // ...
 * };
 * 
 * const scenario = await createLucroPresumidoScenario(profile);
 * console.log(`Imposto mensal: R$ ${scenario.monthlyTax.toFixed(2)}`);
 * console.log(`Taxa efetiva: ${scenario.effectiveRate}%`);
 * 
 * // Verificar se é viável
 * if (scenario.viability === 'viable') {
 *   console.log('✅ Regime aplicável para este faturamento');
 * }
 * ```
 * 
 * @remarks
 * **Limites e Condições**:
 * - Faturamento anual máximo: R$ 78 milhões
 * - Presume margem de lucro: 8% (comércio) ou 32% (serviços)
 * - Apuração trimestral (Mar, Jun, Set, Dez)
 * 
 * **Quando é vantajoso**:
 * - Margens de lucro reais acima da presumida
 * - Poucos custos dedutíveis
 * - Empresa não quer complexidade do Lucro Real
 * 
 * **Cálculo base**:
 * - Comércio: IR/CSLL sobre 8% da receita
 * - Serviços: IR/CSLL sobre 32% da receita
 * - PIS/COFINS: Regime cumulativo (3.65%)
 * 
 * **Viabilidade**: Retorna 'not_viable' se faturamento > R$ 78M
 */
export async function createLucroPresumidoScenario(
  businessProfile: BusinessProfile
): Promise<TaxScenario> {
  const annualRevenue = businessProfile.monthlyRevenue * 12;
  const rate = getLucroPresumidoRate(businessProfile);
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
      'Flexibilidade para distribuição de lucros',
    ],
    cons: [
      'Tributação sobre receita bruta',
      'Sem aproveitamento de prejuízos',
      'Limitado para empresas com gastos altos',
      'Menos incentivos fiscais',
    ],
    requirements: [
      'Faturamento anual até R$ 78 milhões',
      'Manter documentação fiscal adequada',
      'Apuração trimestral obrigatória',
      'Controle de limites de presumição',
    ],
    viability: annualRevenue <= ANNUAL_REVENUE_LIMITS.LUCRO_PRESUMIDO ? 'viable' : 'not_viable',
  };
}

/**
 * Cria cenário detalhado do Lucro Real
 * 
 * Simula o regime Lucro Real calculando impostos sobre o lucro efetivo.
 * Oferece máxima flexibilidade e incentivos fiscais.
 * 
 * @param businessProfile - Perfil completo do negócio
 * @returns Cenário completo do Lucro Real incluindo impostos, prós/contras e requisitos
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = {
 *   businessType: 'manufacturing',
 *   monthlyRevenue: 10000000, // R$ 10M/mês = R$ 120M/ano
 *   // ...
 * };
 * 
 * const scenario = await createLucroRealScenario(profile);
 * console.log(`Imposto anual: R$ ${scenario.annualTax.toFixed(2)}`);
 * 
 * // Verificar incentivos disponíveis
 * console.log('Incentivos aplicáveis:');
 * scenario.pros.forEach(pro => {
 *   if (pro.includes('incentivo')) console.log(`  - ${pro}`);
 * });
 * 
 * // Avaliar requisitos
 * console.log('\nRequisitos obrigatórios:');
 * scenario.requirements.forEach(req => console.log(`  ⚠️ ${req}`));
 * ```
 * 
 * @remarks
 * **Características principais**:
 * - Tributação sobre lucro contábil efetivo
 * - Apuração mensal ou anual (opção da empresa)
 * - Obrigatório para faturamento > R$ 78M
 * 
 * **Quando é vantajoso**:
 * - Margens de lucro baixas ou prejuízo
 * - Altos custos operacionais dedutíveis
 * - Acesso a incentivos fiscais (SUDENE, exportação, etc.)
 * - Compensação de prejuízos fiscais anteriores
 * 
 * **Incentivos disponíveis**:
 * - Manufatura: -5% na alíquota efetiva
 * - Exportação: -15% na alíquota efetiva
 * - Depreciação acelerada de ativos
 * - Juros sobre Capital Próprio (JCP)
 * 
 * **Complexidade**:
 * - Exige escrituração contábil completa (LALUR)
 * - Múltiplas obrigações acessórias (ECF, ECD, etc.)
 * - Requer estrutura fiscal e contábil robusta
 * 
 * **Viabilidade**: Sempre retorna 'viable' (disponível para todos)
 */
export async function createLucroRealScenario(
  businessProfile: BusinessProfile
): Promise<TaxScenario> {
  const annualRevenue = businessProfile.monthlyRevenue * 12;
  const rate = getLucroRealRate(businessProfile);
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
      'Flexibilidade para planejamento',
    ],
    cons: [
      'Maior complexidade operacional',
      'Mais obrigações acessórias',
      'Custos de compliance maiores',
      'Exige estrutura fiscal robusta',
    ],
    requirements: [
      'Escrituração completa (LALUR)',
      'Controles fiscais rigorosos',
      'Apuração mensal ou anual',
      'Obrigatório para receita > R$ 78 milhões',
    ],
    viability: 'viable',
  };
}
