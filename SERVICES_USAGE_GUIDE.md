# 📚 Guia de Uso dos Services - Azuria AI

**Versão**: 2.0  
**Data**: 19/10/2025  
**Última Atualização**: Fase 5 - Refatoração Completa

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Advanced Tax Service](#advanced-tax-service)
3. [Smart Pricing Service](#smart-pricing-service)
4. [Advanced Competitor Service](#advanced-competitor-service)
5. [Logger Service](#logger-service)
6. [Padrões e Best Practices](#padrões-e-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Os services da Azuria AI foram **completamente refatorados** na Fase 4, resultando em:
- ✅ **19 módulos organizados** (anteriormente 3 arquivos monolíticos)
- ✅ **100% type-safe** - Zero tipos `any` não-justificados
- ✅ **JSDoc completo** - IntelliSense rico em toda a aplicação
- ✅ **Modular** - Importação granular e tree-shaking otimizado

### Arquitetura dos Services

```
src/services/ai/
├── advancedTax/         # 6 módulos (714 linhas → modular)
│   ├── types.ts         # Interfaces e tipos
│   ├── calculations.ts  # Cálculos de alíquotas
│   ├── scenarios.ts     # Geração de cenários
│   ├── optimization.ts  # Planos de otimização
│   ├── forecast.ts      # Projeções fiscais
│   └── index.ts         # Classe principal
├── smartPricing/        # 7 módulos (512 linhas → modular)
│   ├── types.ts
│   ├── analysis.ts      # Análises de mercado
│   ├── calculation.ts   # Cálculos de preço
│   ├── recommendation.ts
│   ├── impact.ts
│   └── index.ts
├── advancedCompetitor/  # 6 módulos (502 linhas → modular)
│   ├── types.ts
│   ├── monitoring.ts    # Monitoramento de preços
│   ├── detection.ts     # Detecção de mudanças
│   ├── statistics.ts    # Estatísticas
│   ├── trends.ts
│   └── index.ts
└── logger.ts            # Logging centralizado
```

---

## 🏛️ Advanced Tax Service

### 📖 Descrição

Serviço de análise tributária avançada que compara regimes fiscais (Simples Nacional, Lucro Presumido, Lucro Real) e sugere otimizações.

### 🚀 Quick Start

```typescript
import { advancedTaxService } from '@/services/ai/advancedTax';
import type { BusinessProfile } from '@/services/ai/advancedTax/types';

// 1. Criar perfil do negócio
const businessProfile: BusinessProfile = {
  id: 'business-001',
  businessType: 'comercio',
  monthlyRevenue: 50000,
  employeeCount: 5,
  hasManufacturing: false,
  hasExports: false,
  hasImports: false,
  location: { 
    state: 'SP', 
    city: 'São Paulo' 
  },
  mainActivities: ['Comércio varejista de eletrônicos'],
  seasonality: 'medium'
};

// 2. Realizar análise completa
const analysis = await advancedTaxService.performComprehensiveTaxAnalysis(
  businessProfile
);

// 3. Usar os resultados
console.log(`Regime atual: ${analysis.currentAnalysis.regime}`);
console.log(`Alíquota atual: ${analysis.currentAnalysis.effectiveRate}%`);

if (analysis.optimizationPlan) {
  console.log(`💰 Economia potencial: R$ ${analysis.optimizationPlan.annualSavings.toLocaleString('pt-BR')}`);
  console.log(`📋 Recomendação: Migrar para ${analysis.optimizationPlan.targetRegime}`);
}
```

### 📦 Módulos Disponíveis

#### 1. `calculations.ts` - Cálculos de Alíquotas

```typescript
import { 
  getSimplesToRate, 
  getLucroPresumidoRate, 
  getLucroRealRate,
  getCurrentTaxRate,
  calculatePotentialSavings
} from '@/services/ai/advancedTax/calculations';

// Calcular alíquota do Simples Nacional
const simplesToRate = getSimplesToRate(profile, 600000); // 600k anual
console.log(`Simples: ${simplesToRate}%`);

// Calcular economia potencial
const savings = calculatePotentialSavings(
  profile,
  TaxRegimeType.LUCRO_PRESUMIDO,  // Atual
  TaxRegimeType.SIMPLES_NACIONAL   // Proposto
);
console.log(`Economia anual: R$ ${savings}`);
```

#### 2. `scenarios.ts` - Geração de Cenários

```typescript
import { generateTaxScenarios } from '@/services/ai/advancedTax/scenarios';

const scenarios = await generateTaxScenarios(businessProfile);

scenarios.forEach(scenario => {
  console.log(`
    Regime: ${scenario.regime}
    Alíquota: ${scenario.effectiveRate}%
    Imposto Anual: R$ ${scenario.annualTax.toLocaleString('pt-BR')}
    Prós: ${scenario.pros.join(', ')}
    Contras: ${scenario.cons.join(', ')}
  `);
});
```

#### 3. `optimization.ts` - Planos de Otimização

```typescript
import { createOptimizationPlan } from '@/services/ai/advancedTax/optimization';

const plan = await createOptimizationPlan(
  businessProfile,
  TaxRegimeType.LUCRO_PRESUMIDO,
  scenarios
);

if (plan) {
  console.log(`
    🎯 Regime alvo: ${plan.targetRegime}
    💰 Economia anual: R$ ${plan.annualSavings}
    ⏱️ Implementação: ${plan.timeline} meses
    ⚠️ Riscos: ${plan.risks.join(', ')}
  `);
  
  plan.actionSteps.forEach((step, idx) => {
    console.log(`${idx + 1}. ${step}`);
  });
}
```

#### 4. `forecast.ts` - Projeções Fiscais

```typescript
import { generateTaxForecast } from '@/services/ai/advancedTax/forecast';

const forecast = await generateTaxForecast(
  businessProfile,
  TaxRegimeType.SIMPLES_NACIONAL
);

forecast.monthlyProjections.forEach((month, idx) => {
  console.log(`
    Mês ${idx + 1}:
    Receita: R$ ${month.revenue}
    Imposto: R$ ${month.tax}
    Líquido: R$ ${month.netIncome}
  `);
});

console.log(`
  📊 Resumo Anual:
  Receita: R$ ${forecast.summary.totalRevenue}
  Impostos: R$ ${forecast.summary.totalTax}
  Líquido: R$ ${forecast.summary.totalNet}
  Alíquota Efetiva: ${forecast.summary.effectiveRate}%
`);
```

### 🎯 Casos de Uso Comuns

#### Caso 1: Validar Regime Atual

```typescript
// Verificar se o regime atual é o mais vantajoso
async function validateCurrentRegime(profile: BusinessProfile) {
  const analysis = await advancedTaxService.performComprehensiveTaxAnalysis(profile);
  
  if (analysis.optimizationPlan) {
    const savings = analysis.optimizationPlan.annualSavings;
    const percentage = (savings / (profile.monthlyRevenue * 12)) * 100;
    
    if (percentage > 5) {
      return {
        needsChange: true,
        message: `Você pode economizar ${percentage.toFixed(1)}% mudando para ${analysis.optimizationPlan.targetRegime}`,
        savings: savings
      };
    }
  }
  
  return {
    needsChange: false,
    message: 'Seu regime atual é o mais vantajoso!'
  };
}
```

#### Caso 2: Comparar Todos os Regimes

```typescript
// Criar tabela comparativa de todos os regimes
async function compareAllRegimes(profile: BusinessProfile) {
  const scenarios = await generateTaxScenarios(profile);
  
  const comparison = scenarios.map(scenario => ({
    regime: scenario.regime,
    aliquota: `${scenario.effectiveRate}%`,
    impostoAnual: `R$ ${scenario.annualTax.toLocaleString('pt-BR')}`,
    vantagens: scenario.pros.length,
    desvantagens: scenario.cons.length,
    recomendado: scenario.annualTax === Math.min(...scenarios.map(s => s.annualTax))
  }));
  
  return comparison.sort((a, b) => 
    parseFloat(a.impostoAnual.replace(/[R$.,]/g, '')) - 
    parseFloat(b.impostoAnual.replace(/[R$.,]/g, ''))
  );
}
```

#### Caso 3: Projeção de Crescimento

```typescript
// Simular impacto do crescimento no regime tributário
async function projectGrowthImpact(
  profile: BusinessProfile,
  growthRate: number, // Ex: 0.2 para 20%
  months: number = 12
) {
  const projections = [];
  
  for (let month = 1; month <= months; month++) {
    const adjustedProfile = {
      ...profile,
      monthlyRevenue: profile.monthlyRevenue * Math.pow(1 + growthRate/12, month)
    };
    
    const forecast = await generateTaxForecast(
      adjustedProfile,
      getCurrentRegime(adjustedProfile)
    );
    
    projections.push({
      month,
      revenue: adjustedProfile.monthlyRevenue,
      tax: forecast.summary.totalTax / 12,
      effectiveRate: forecast.summary.effectiveRate
    });
  }
  
  return projections;
}
```

### ⚠️ Tratamento de Erros

```typescript
try {
  const analysis = await advancedTaxService.performComprehensiveTaxAnalysis(profile);
  // Sucesso
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('dados inválidos')) {
      // Validar campos do BusinessProfile
      console.error('Perfil incompleto:', error);
    } else if (error.message.includes('regime não suportado')) {
      // Regime desconhecido
      console.error('Regime inválido:', error);
    } else {
      // Erro genérico
      console.error('Erro na análise:', error);
    }
  }
}
```

---

## 💰 Smart Pricing Service

### 📖 Descrição

Serviço de precificação inteligente que analisa mercado, concorrência, sazonalidade e elasticidade de demanda para sugerir preços ótimos.

### 🚀 Quick Start

```typescript
import { smartPricingService } from '@/services/ai/smartPricing';
import type { SmartPricingInput } from '@/services/ai/smartPricing/types';

// 1. Definir input
const input: SmartPricingInput = {
  productName: 'Smartphone XYZ Pro',
  costPrice: 800,
  desiredMargin: 0.3,  // 30%
  taxRate: 0.15,       // 15%
  category: 'Eletrônicos',
  targetAudience: 'premium',
  competitors: [
    { productName: 'Modelo A', price: 1200, platform: 'mercadolivre' },
    { productName: 'Modelo B', price: 1100, platform: 'amazon' }
  ],
  seasonalTrends: {
    currentMonth: 11, // Novembro
    isHighSeason: true // Black Friday
  },
  historicalSales: {
    averageMonthlyVolume: 50,
    peakVolume: 120,
    minVolume: 20
  }
};

// 2. Obter recomendação
const recommendation = await smartPricingService.analyzePricing(input);

// 3. Usar resultado
console.log(`
  💡 Preço Recomendado: R$ ${recommendation.recommendedPrice.toLocaleString('pt-BR')}
  📊 Confiança: ${(recommendation.confidence * 100).toFixed(0)}%
  📈 Faixa: R$ ${recommendation.priceRange.min} - R$ ${recommendation.priceRange.max}
  
  Razões:
  ${recommendation.reasoning.map((r, i) => `${i+1}. ${r}`).join('\n  ')}
`);
```

### 📦 Módulos Disponíveis

#### 1. `analysis.ts` - Análises de Mercado

```typescript
import { 
  performBasicAnalysis,
  analyzeCompetition,
  analyzeMarketFactors,
  analyzeVolumeElasticity
} from '@/services/ai/smartPricing/analysis';

// Análise básica de custo e margem
const basicAnalysis = performBasicAnalysis(input);
console.log(`Preço base: R$ ${basicAnalysis.basePrice}`);
console.log(`Markup: ${basicAnalysis.markupPercentage}%`);

// Análise de concorrência
const competitorAnalysis = analyzeCompetition(input.competitors);
console.log(`Preço médio concorrentes: R$ ${competitorAnalysis.averagePrice}`);
console.log(`Posição sugerida: ${competitorAnalysis.positioningAdvice}`);

// Análise de fatores de mercado
const marketAnalysis = analyzeMarketFactors(input);
console.log(`Multiplicador sazonal: ${marketAnalysis.seasonalityMultiplier}`);
console.log(`Multiplicador categoria: ${marketAnalysis.categoryMultiplier}`);

// Análise de volume e elasticidade
const volumeAnalysis = analyzeVolumeElasticity(input);
console.log(`Score de volume: ${volumeAnalysis.volumeScore}`);
console.log(`Elasticidade: ${volumeAnalysis.elasticityFactor}`);
```

#### 2. `calculation.ts` - Cálculos de Preço

```typescript
import { 
  roundToNicePrice,
  calculateFinalPrice,
  adjustPriceForCompetition
} from '@/services/ai/smartPricing/calculation';

// Arredondar para preço atrativo
const rawPrice = 1247.83;
const nicePrice = roundToNicePrice(rawPrice);
console.log(`${rawPrice} → ${nicePrice}`); // 1250

// Calcular preço com multiplicadores
const finalPrice = calculateFinalPrice(
  basePrice,
  marketAnalysis,
  volumeAnalysis
);

// Ajustar por concorrência
const adjusted = adjustPriceForCompetition(finalPrice, competitorAnalysis);
console.log(`Preço ajustado: R$ ${adjusted.price}`);
console.log(`Confiança: ${adjusted.confidence * 100}%`);
```

#### 3. `impact.ts` - Análise de Impacto

```typescript
import { analyzePriceImpact } from '@/services/ai/smartPricing/impact';

// Analisar impacto de mudança de preço
const impact = analyzePriceImpact(input, 1200, 1500);

console.log(`
  📊 Impacto da Alteração de Preço
  
  Receita:
  - Antes: R$ ${impact.revenueImpact.before}
  - Depois: R$ ${impact.revenueImpact.after}
  - Mudança: ${impact.revenueImpact.changePercent}%
  
  Volume:
  - Antes: ${impact.volumeImpact.before} unidades
  - Depois: ${impact.volumeImpact.after} unidades
  - Mudança: ${impact.volumeImpact.changePercent}%
  
  Margem:
  - Antes: ${impact.marginImpact.before}%
  - Depois: ${impact.marginImpact.after}%
  
  Recomendação: ${impact.recommendation}
  Risco: ${impact.riskLevel}
`);
```

### 🎯 Casos de Uso Comuns

#### Caso 1: Precificação Dinâmica por Temporada

```typescript
async function dynamicPricingBySeason(
  baseInput: SmartPricingInput,
  month: number
) {
  const isHighSeason = [11, 12, 5, 6].includes(month); // Nov, Dez, Mai, Jun
  
  const input = {
    ...baseInput,
    seasonalTrends: {
      currentMonth: month,
      isHighSeason
    }
  };
  
  const recommendation = await smartPricingService.analyzePricing(input);
  
  return {
    month,
    price: recommendation.recommendedPrice,
    expectedVolume: estimateVolume(recommendation, isHighSeason),
    expectedRevenue: recommendation.recommendedPrice * estimateVolume(recommendation, isHighSeason)
  };
}
```

#### Caso 2: A/B Testing de Preços

```typescript
async function abTestPrices(
  input: SmartPricingInput,
  priceA: number,
  priceB: number
) {
  const impactA = analyzePriceImpact(input, input.costPrice * 1.3, priceA);
  const impactB = analyzePriceImpact(input, input.costPrice * 1.3, priceB);
  
  return {
    priceA: {
      price: priceA,
      projectedRevenue: impactA.revenueImpact.after,
      riskLevel: impactA.riskLevel
    },
    priceB: {
      price: priceB,
      projectedRevenue: impactB.revenueImpact.after,
      riskLevel: impactB.riskLevel
    },
    recommendation: impactA.revenueImpact.after > impactB.revenueImpact.after 
      ? 'Use Price A' 
      : 'Use Price B'
  };
}
```

#### Caso 3: Monitor de Concorrência

```typescript
async function monitorCompetitorPricing(
  productId: string,
  currentPrice: number
) {
  // Buscar preços dos concorrentes (mockado aqui)
  const competitors = await fetchCompetitorPrices(productId);
  
  const competitorAnalysis = analyzeCompetition(competitors);
  
  const alerts = [];
  
  if (currentPrice > competitorAnalysis.highestPrice) {
    alerts.push({
      type: 'warning',
      message: 'Seu preço está acima de todos os concorrentes'
    });
  }
  
  if (currentPrice < competitorAnalysis.lowestPrice * 0.9) {
    alerts.push({
      type: 'danger',
      message: 'Preço muito abaixo do mercado - possível perda de margem'
    });
  }
  
  return {
    currentPrice,
    marketAverage: competitorAnalysis.averagePrice,
    position: competitorAnalysis.positioningAdvice,
    alerts
  };
}
```

---

## 🔍 Advanced Competitor Service

### 📖 Descrição

Serviço de monitoramento e análise de concorrência com detecção de mudanças de preços e alertas automáticos.

### 🚀 Quick Start

```typescript
import { advancedCompetitorService } from '@/services/ai/advancedCompetitor';

// 1. Criar regra de monitoramento
const rule = advancedCompetitorService.createMonitoringRule({
  productName: 'Notebook Dell XPS',
  platforms: ['mercadolivre', 'amazon', 'magazineluiza'],
  thresholds: {
    priceDropPercent: 5,    // Alerta se cair 5%
    priceIncreasePercent: 10 // Alerta se subir 10%
  },
  frequency: 'daily'
});

// 2. Executar monitoramento
const results = await advancedCompetitorService.runMonitoringCycle([rule]);

// 3. Processar alertas
results.forEach(result => {
  console.log(`Produto: ${result.productName}`);
  result.alerts.forEach(alert => {
    console.log(`⚠️ ${alert.type}: ${alert.message}`);
    console.log(`Preço: ${alert.oldPrice} → ${alert.newPrice}`);
  });
});
```

### 📦 Módulos Disponíveis

#### 1. `monitoring.ts` - Regras de Monitoramento

```typescript
import { 
  createMonitoringRule,
  executeMonitoringCycle
} from '@/services/ai/advancedCompetitor/monitoring';

// Criar regra customizada
const rule = createMonitoringRule({
  productName: 'iPhone 15 Pro',
  platforms: ['mercadolivre', 'amazon'],
  thresholds: {
    priceDropPercent: 3,
    priceIncreasePercent: 15
  },
  frequency: 'hourly'
});

// Executar ciclo de monitoramento
const cycle = await executeMonitoringCycle([rule]);
console.log(`Verificações: ${cycle.rulesChecked}`);
console.log(`Alertas: ${cycle.alertsGenerated}`);
```

#### 2. `detection.ts` - Detecção de Mudanças

```typescript
import { 
  detectPriceChanges,
  generateAlerts
} from '@/services/ai/advancedCompetitor/detection';

// Detectar mudanças nos últimos 7 dias
const changes = detectPriceChanges(
  priceHistory,
  7 // dias
);

changes.forEach(change => {
  console.log(`
    ${change.competitor}:
    ${change.oldPrice} → ${change.newPrice}
    Mudança: ${change.changePercent}%
    Tipo: ${change.changeType}
  `);
});

// Gerar alertas baseados nas mudanças
const alerts = generateAlerts(changes, rule.thresholds);
```

#### 3. `statistics.ts` - Estatísticas

```typescript
import { 
  calculatePriceStatistics,
  calculateMarketShare,
  analyzeVolatility
} from '@/services/ai/advancedCompetitor/statistics';

// Estatísticas de preço
const stats = calculatePriceStatistics(competitors);
console.log(`
  Média: R$ ${stats.average}
  Mediana: R$ ${stats.median}
  Desvio padrão: R$ ${stats.standardDeviation}
  Faixa: R$ ${stats.min} - R$ ${stats.max}
`);

// Market share
const marketShare = calculateMarketShare(competitors);
marketShare.forEach(({ platform, share }) => {
  console.log(`${platform}: ${share}%`);
});

// Volatilidade
const volatility = analyzeVolatility(priceHistory);
console.log(`Volatilidade: ${volatility.level}`);
console.log(`Risco: ${volatility.risk}`);
```

### 🎯 Casos de Uso Comuns

#### Caso 1: Dashboard de Monitoramento

```typescript
async function buildCompetitorDashboard(productId: string) {
  const history = await fetchPriceHistory(productId);
  const current = await fetchCurrentPrices(productId);
  
  const stats = calculatePriceStatistics(current);
  const changes = detectPriceChanges(history, 30);
  const volatility = analyzeVolatility(history);
  
  return {
    overview: {
      avgPrice: stats.average,
      priceRange: { min: stats.min, max: stats.max },
      competitors: current.length
    },
    recentChanges: changes.slice(0, 10),
    marketCondition: {
      volatility: volatility.level,
      trend: volatility.trend
    },
    recommendations: generateRecommendations(stats, volatility)
  };
}
```

---

## 📝 Logger Service

### 📖 Descrição

Sistema de logging centralizado e type-safe com suporte a múltiplos níveis e integração com Application Insights.

### 🚀 Quick Start

```typescript
import { logger, toErrorContext } from '@/services/ai/logger';

// Logs simples
logger.info('Usuário fez login', { userId: '123', timestamp: new Date() });
logger.warn('Taxa de API próxima do limite', { usage: 0.95 });
logger.error('Falha ao processar pagamento', { orderId: 'abc-123' });
logger.debug('Cache hit', { key: 'user:123', ttl: 300 });

// Error handling com type safety
try {
  await riskyOperation();
} catch (error) {
  logger.trackAIError('operation_name', toErrorContext(error), {
    userId: currentUser.id,
    context: 'checkout'
  });
}

// Tracking de uso da IA
logger.trackAIUsage('tax_analysis', 1250, true, {
  regime: 'simples',
  savings: 5000
});
```

### 📦 Funções Disponíveis

```typescript
// Logging básico
logger.info(message: string, data?: LogData): void
logger.warn(message: string, data?: LogData): void
logger.error(message: string, data?: LogData): void
logger.debug(message: string, data?: LogData): void

// Tracking especializado
logger.trackAIUsage(
  action: string,
  duration: number,
  success: boolean,
  metadata?: LogData
): void

logger.trackAIError(
  action: string,
  error: Error | ErrorContext,
  context?: LogData
): void

// Consulta de logs
logger.getRecentLogs(limit?: number): LogEntry[]
logger.getLogsByLevel(level: 'info' | 'warn' | 'error' | 'debug'): LogEntry[]
logger.clearLogs(): void
```

### 🎯 Padrões de Uso

```typescript
// ✅ BOM: Type-safe error handling
try {
  await operation();
} catch (error) {
  logger.trackAIError('operation', toErrorContext(error), { userId });
}

// ❌ RUIM: Usar any
catch (error: any) {
  logger.error(error); // Não compile
}

// ✅ BOM: Structured logging
logger.info('User action', {
  action: 'purchase',
  userId: '123',
  amount: 99.90
});

// ❌ RUIM: Unstructured
logger.info('User 123 purchased for 99.90'); // Difícil de consultar
```

---

## 🎯 Padrões e Best Practices

### 1. Imports Modulares

```typescript
// ✅ BOM: Importar apenas o necessário
import { getSimplesToRate } from '@/services/ai/advancedTax/calculations';
import type { BusinessProfile } from '@/services/ai/advancedTax/types';

// ❌ EVITAR: Import do index quando não necessário
import { advancedTaxService } from '@/services/ai/advancedTax';
// (use apenas quando precisar da classe completa)
```

### 2. Type Safety

```typescript
// ✅ BOM: Sempre tipar inputs
const profile: BusinessProfile = {
  id: '123',
  businessType: 'comercio',
  // ... todos os campos obrigatórios
};

// ❌ RUIM: Objetos parciais
const profile = {
  businessType: 'comercio'
}; // Faltam campos obrigatórios
```

### 3. Error Handling

```typescript
// ✅ BOM: Sempre usar toErrorContext
import { toErrorContext } from '@/services/ai/logger';

try {
  await service.operation();
} catch (error) {
  logger.trackAIError('operation', toErrorContext(error), context);
  throw new Error('Mensagem amigável para usuário');
}

// ❌ RUIM: Catch sem type safety
catch (error: any) { ... }
```

### 4. Performance

```typescript
// ✅ BOM: Carregar apenas o necessário
import { roundToNicePrice } from '@/services/ai/smartPricing/calculation';

// ❌ RUIM: Importar service inteiro
import { smartPricingService } from '@/services/ai/smartPricing';
// (quando só precisa de uma função)
```

### 5. Testes

```typescript
// ✅ BOM: Testar funções puras isoladamente
import { calculatePotentialSavings } from '@/services/ai/advancedTax/calculations';

test('calcula economia corretamente', () => {
  const savings = calculatePotentialSavings(mockProfile, 'presumido', 'simples');
  expect(savings).toBeGreaterThan(0);
});

// ❌ RUIM: Testar apenas a classe principal
// (mais difícil de isolar problemas)
```

---

## 🔧 Troubleshooting

### Problema: Type errors em BusinessProfile

```typescript
// ❌ Erro: Property 'mainActivities' is missing
const profile: BusinessProfile = {
  id: '123',
  businessType: 'comercio',
  // ...
};

// ✅ Solução: Adicionar todos os campos obrigatórios
const profile: BusinessProfile = {
  id: '123',
  businessType: 'comercio',
  mainActivities: ['Comércio varejista'], // ← Adicionar
  seasonality: 'medium',                  // ← Adicionar
  // ...
};
```

### Problema: Errors não tipados

```typescript
// ❌ Erro: Argument of type 'unknown' is not assignable
logger.trackAIError('action', error, context);

// ✅ Solução: Usar toErrorContext
import { toErrorContext } from '@/services/ai/logger';
logger.trackAIError('action', toErrorContext(error), context);
```

### Problema: Import path não funciona

```typescript
// ❌ Erro: Cannot find module
import { calculations } from '@/services/ai/advancedTax/calculations';

// ✅ Solução: Usar named imports
import { getSimplesToRate } from '@/services/ai/advancedTax/calculations';
```

### Problema: IntelliSense não mostra JSDoc

```typescript
// Causa: TypeScript não está processando os arquivos
// Solução: Rodar type-check
npm run type-check

// Ou reiniciar o TypeScript Server no VS Code
// Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📚 Recursos Adicionais

### Documentação Técnica

- [ADVANCEDTAX_REFATORADO.md](./ADVANCEDTAX_REFATORADO.md) - Detalhes do refatoramento
- [SMARTPRICING_REFATORADO.md](./SMARTPRICING_REFATORADO.md) - Arquitetura do pricing
- [ADVANCEDCOMPETITOR_REFATORADO.md](./ADVANCEDCOMPETITOR_REFATORADO.md) - Sistema de monitoramento
- [FASE5_REMOCAO_ANY_COMPLETO.md](./FASE5_REMOCAO_ANY_COMPLETO.md) - Type safety improvements

### Exemplos Completos

Veja `src/__tests__/` para exemplos de uso em testes unitários.

### Suporte

Para dúvidas ou problemas:
1. Consulte o JSDoc inline (hover sobre funções)
2. Verifique os exemplos neste guia
3. Leia a documentação técnica dos módulos
4. Abra uma issue no repositório

---

**Última Atualização**: 19/10/2025 - Fase 5 Completa  
**Versão dos Services**: 2.0 (Pós-refatoração)  
**Status**: ✅ Produção
