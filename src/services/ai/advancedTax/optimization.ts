/**
 * Advanced Tax Service - Tax Optimization Plans
 * Criação de planos de otimização tributária personalizados
 */

import { TaxRegimeType } from '@/shared/types/ai';
import type { BusinessProfile, TaxOptimizationPlan, TaxScenario } from './types';

/**
 * Economia mínima anual para justificar mudança de regime (R$)
 */
const MINIMUM_SAVINGS_THRESHOLD = 5000;

/**
 * Cria plano de otimização tributária personalizado
 * 
 * Analisa cenários alternativos e cria um plano detalhado de migração para
 * o regime tributário mais vantajoso, incluindo passos de implementação,
 * riscos, benefícios e timeline.
 * 
 * @param businessProfile - Perfil completo do negócio
 * @param currentRegime - Regime tributário atual da empresa
 * @param scenarios - Todos os cenários tributários calculados
 * @returns Plano de otimização completo ou undefined se não houver oportunidade
 * 
 * @example
 * ```typescript
 * const profile: BusinessProfile = { id: '123', /* ... */ };
 * const scenarios = await generateTaxScenarios(profile);
 * 
 * const plan = await createOptimizationPlan(
 *   profile,
 *   TaxRegimeType.LUCRO_PRESUMIDO, // Regime atual
 *   scenarios
 * );
 * 
 * if (plan) {
 *   console.log(`Economia anual: R$ ${plan.potentialSavingsAnnual.toFixed(2)}`);
 *   console.log(`Mudar de ${plan.currentRegime} para ${plan.recommendedRegime}`);
 *   console.log(`Timeline: ${plan.timeline}`);
 *   
 *   // Passos de implementação
 *   plan.implementationSteps.forEach(step => {
 *     console.log(`${step.step}. ${step.description} (${step.deadline})`);
 *   });
 * } else {
 *   console.log('Regime atual já é o mais vantajoso');
 * }
 * ```
 * 
 * @remarks
 * **Critérios para criar plano**:
 * - Deve existir regime alternativo viável
 * - Economia anual mínima: R$ 5.000,00
 * - Regime alternativo deve ter menor carga tributária
 * 
 * **O que o plano inclui**:
 * - 📋 Passos detalhados de implementação (4+ steps)
 * - ⚠️ Riscos identificados (mudança de legislação, carência, etc.)
 * - ✅ Benefícios quantificados (economia, redução de taxa, etc.)
 * - 📅 Timeline realista (geralmente mudança só em janeiro)
 * 
 * **Retorna undefined quando**:
 * - Regime atual já é o melhor
 * - Economia potencial < R$ 5.000/ano
 * - Nenhum regime alternativo é viável
 * - Cenário atual não encontrado nos scenarios
 */
export async function createOptimizationPlan(
  businessProfile: BusinessProfile,
  currentRegime: TaxRegimeType,
  scenarios: TaxScenario[]
): Promise<TaxOptimizationPlan | undefined> {
  const currentScenario = scenarios.find(s => s.regime === currentRegime);

  if (!currentScenario) {
    return undefined;
  }

  // Encontra o melhor regime alternativo
  const viableAlternatives = scenarios.filter(
    s =>
      s.regime !== currentRegime &&
      s.viability === 'viable' &&
      s.annualTax < currentScenario.annualTax
  );

  if (viableAlternatives.length === 0) {
    return undefined;
  }

  const bestAlternative = viableAlternatives.reduce((best, scenario) =>
    scenario.annualTax < best.annualTax ? scenario : best,
    viableAlternatives[0]
  );

  const potentialSavings = currentScenario.annualTax - bestAlternative.annualTax;

  // Só cria plano se a economia for significativa
  if (potentialSavings < MINIMUM_SAVINGS_THRESHOLD) {
    return undefined;
  }

  const planId = `tax_plan_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  return {
    id: planId,
    businessId: businessProfile.id,
    currentRegime,
    recommendedRegime: bestAlternative.regime,
    potentialSavingsAnnual: potentialSavings,
    implementationSteps: generateImplementationSteps(currentRegime, bestAlternative.regime),
    risks: identifyImplementationRisks(currentRegime, bestAlternative.regime),
    benefits: identifyImplementationBenefits(potentialSavings, bestAlternative),
    timeline: calculateImplementationTimeline(currentRegime, bestAlternative.regime),
    createdAt: new Date(),
  };
}

/**
 * Gera passos detalhados de implementação para mudança de regime
 * 
 * Cria um roadmap sequencial com prazos, responsáveis e documentos necessários
 * para migrar do regime atual para o regime recomendado.
 * 
 * @param currentRegime - Regime tributário atual
 * @param targetRegime - Regime tributário alvo
 * @returns Array com passos sequenciais incluindo prazos e documentação necessária
 * 
 * @example
 * ```typescript
 * const steps = generateImplementationSteps(
 *   TaxRegimeType.LUCRO_PRESUMIDO,
 *   TaxRegimeType.SIMPLES_NACIONAL
 * );
 * 
 * steps.forEach(step => {
 *   console.log(`\nPasso ${step.step}: ${step.description}`);
 *   console.log(`Prazo: ${step.deadline}`);
 *   console.log(`Responsável: ${step.responsible}`);
 *   console.log(`Documentos: ${step.documents.join(', ')}`);
 * });
 * ```
 * 
 * @remarks
 * **Passos padrão** (todos os regimes):
 * 1. **Análise de viabilidade** (15 dias)
 *    - Balancetes últimos 12 meses
 *    - DRE detalhada
 *    - Relatório de atividades
 * 
 * 2. **Regularização fiscal** (30 dias)
 *    - Certidões negativas
 *    - Quitação de débitos
 *    - Regularização cadastral
 * 
 * 3. **Ajuste de processos** (45 dias)
 *    - Novos procedimentos
 *    - Treinamento da equipe
 *    - Sistemas atualizados
 * 
 * **Passos específicos**:
 * - Para **Simples Nacional**: Adiciona step de solicitação de opção (janeiro)
 * - Para outros regimes: Passos padrão aplicam-se
 * 
 * **Timeline**: Mudanças de regime geralmente só ocorrem em janeiro do ano seguinte
 */
export function generateImplementationSteps(
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
      documents: ['Balancetes últimos 12 meses', 'DRE detalhada', 'Relatório de atividades'],
    },
    {
      step: 2,
      description: 'Regularização de pendências fiscais',
      deadline: '30 dias',
      responsible: 'Setor fiscal',
      documents: ['Certidões negativas', 'Quitação de débitos', 'Regularização cadastral'],
    },
    {
      step: 3,
      description: 'Ajuste de processos internos',
      deadline: '45 dias',
      responsible: 'Equipe interna',
      documents: ['Novos procedimentos', 'Treinamento equipe', 'Sistemas atualizados'],
    },
  ];

  if (targetRegime === TaxRegimeType.SIMPLES_NACIONAL) {
    baseSteps.push({
      step: 4,
      description: 'Solicitação de opção pelo Simples Nacional',
      deadline: 'Janeiro do ano seguinte',
      responsible: 'Contador',
      documents: ['Formulário de opção', 'Documentos societários', 'Termo de opção'],
    });
  }

  return baseSteps;
}

/**
 * Identifica riscos da mudança de regime tributário
 * 
 * Lista os principais riscos e desafios associados à migração para
 * um novo regime fiscal, incluindo riscos gerais e específicos do regime alvo.
 * 
 * @param currentRegime - Regime tributário atual
 * @param targetRegime - Regime tributário alvo
 * @returns Array com descrição dos riscos identificados
 * 
 * @example
 * ```typescript
 * const risks = identifyImplementationRisks(
 *   TaxRegimeType.LUCRO_PRESUMIDO,
 *   TaxRegimeType.LUCRO_REAL
 * );
 * 
 * console.log('⚠️ Riscos da mudança:');
 * risks.forEach((risk, i) => {
 *   console.log(`${i + 1}. ${risk}`);
 * });
 * // Output:
 * // 1. Período de carência para mudança (geralmente 1 ano)
 * // 2. Maior complexidade operacional
 * // 3. Necessidade de estrutura fiscal mais robusta
 * // ...
 * ```
 * 
 * @remarks
 * **Riscos comuns** (todos os regimes):
 * - Período de carência de 1 ano
 * - Possível aumento de obrigações acessórias
 * - Necessidade de adequação de sistemas
 * - Risco de mudanças na legislação
 * 
 * **Riscos específicos**:
 * 
 * **Simples Nacional**:
 * - Limitação de faturamento futuro (teto R$ 4.8M)
 * - Restrições para algumas atividades
 * 
 * **Lucro Real**:
 * - Maior complexidade operacional
 * - Necessidade de estrutura fiscal robusta
 * - Custos mais altos de compliance
 */
export function identifyImplementationRisks(
  currentRegime: TaxRegimeType,
  targetRegime: TaxRegimeType
): string[] {
  const risks: string[] = [
    'Período de carência para mudança (geralmente 1 ano)',
    'Possível aumento de obrigações acessórias',
    'Necessidade de adequação de sistemas',
    'Risco de mudanças na legislação',
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
 * Identifica benefícios quantificados da mudança de regime
 * 
 * Lista todos os benefícios da migração, incluindo economia financeira,
 * redução de carga tributária e vantagens operacionais do regime alvo.
 * 
 * @param savings - Economia anual total em reais
 * @param targetScenario - Cenário completo do regime tributário alvo
 * @returns Array com descrição dos benefícios identificados
 * 
 * @example
 * ```typescript
 * const targetScenario: TaxScenario = {
 *   regime: TaxRegimeType.SIMPLES_NACIONAL,
 *   annualTax: 48000,
 *   effectiveRate: 6.0,
 *   pros: ['Menor carga tributária', 'Simplificação'],
 *   // ...
 * };
 * 
 * const benefits = identifyImplementationBenefits(
 *   15000, // R$ 15k de economia
 *   targetScenario
 * );
 * 
 * console.log('✅ Benefícios:');
 * benefits.forEach(benefit => console.log(`  - ${benefit}`));
 * // Output:
 * // - Economia anual de R$ 15,000.00
 * // - Redução da carga tributária para 6.00%
 * // - Melhoria do fluxo de caixa
 * // - Recursos liberados para investimento
 * // - Menor carga tributária geral
 * // - Simplificação de obrigações
 * ```
 * 
 * @remarks
 * **Benefícios financeiros** (sempre incluídos):
 * - Economia anual formatada em R$
 * - Redução percentual da carga tributária
 * - Melhoria do fluxo de caixa
 * - Recursos liberados para investimento
 * 
 * **Benefícios operacionais**:
 * Inclui automaticamente todos os `pros` do regime alvo, que podem ser:
 * - Simplificação de processos
 * - Menos obrigações acessórias
 * - Maior flexibilidade fiscal
 * - Acesso a incentivos específicos
 */
export function identifyImplementationBenefits(
  savings: number,
  targetScenario: TaxScenario
): string[] {
  const benefits: string[] = [
    `Economia anual de R$ ${savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `Redução da carga tributária para ${targetScenario.effectiveRate.toFixed(2)}%`,
    'Melhoria do fluxo de caixa',
    'Recursos liberados para investimento',
  ];

  benefits.push(...targetScenario.pros);

  return benefits;
}

/**
 * Calcula timeline realista de implementação da mudança de regime
 * 
 * Determina quando a mudança pode ser efetivada considerando que alterações
 * de regime tributário geralmente só são permitidas em janeiro do ano seguinte.
 * 
 * @param _currentRegime - Regime tributário atual (não usado atualmente)
 * @param _targetRegime - Regime tributário alvo (não usado atualmente)
 * @returns String descritiva com o mês/ano de implementação e tempo de preparação
 * 
 * @example
 * ```typescript
 * // Em maio de 2025
 * const timeline1 = calculateImplementationTimeline(
 *   TaxRegimeType.LUCRO_PRESUMIDO,
 *   TaxRegimeType.SIMPLES_NACIONAL
 * );
 * console.log(timeline1);
 * // "Implementação em janeiro de 2026 (7 meses para preparação)"
 * 
 * // Em dezembro de 2025
 * const timeline2 = calculateImplementationTimeline(
 *   TaxRegimeType.LUCRO_REAL,
 *   TaxRegimeType.LUCRO_PRESUMIDO
 * );
 * console.log(timeline2);
 * // "Implementação em janeiro de 2027 (preparação durante 2026)"
 * ```
 * 
 * @remarks
 * **Regra geral**: Mudança de regime só pode ocorrer em **janeiro**
 * 
 * **Cálculo do timeline**:
 * - Se antes de **dezembro**: Implementação em janeiro do ano seguinte
 * - Se em **dezembro**: Implementação pulada para janeiro do ano +2
 *   (para dar tempo adequado de preparação)
 * 
 * **Tempo de preparação**:
 * - Mostra quantos meses faltam até a implementação
 * - Se em dezembro, sugere "preparação durante [ano seguinte]"
 * 
 * **Observação**: Os parâmetros de regime não são usados atualmente,
 * mas estão na assinatura para futuras regras específicas por regime.
 */
export function calculateImplementationTimeline(
  _currentRegime: TaxRegimeType,
  _targetRegime: TaxRegimeType
): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;

  if (now.getMonth() < 11) {
    // Antes de dezembro
    return `Implementação em janeiro de ${nextYear} (${12 - now.getMonth()} meses para preparação)`;
  }

  return `Implementação em janeiro de ${nextYear + 1} (preparação durante ${nextYear})`;
}
