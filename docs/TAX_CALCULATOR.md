# 💰 Calculadora Tributária - Documentação Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Regimes Tributários](#regimes-tributários)
- [Cálculos de Impostos](#cálculos-de-impostos)
- [Análise Comparativa](#análise-comparativa)
- [Guia de Uso](#guia-de-uso)
- [Exemplos Práticos](#exemplos-práticos)
- [API e Integração](#api-e-integração)

---

## 🎯 Visão Geral

A **Calculadora Tributária** é uma ferramenta especializada para análise fiscal e tributária de produtos e serviços no Brasil. Permite comparar diferentes regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real) e calcular automaticamente todos os impostos aplicáveis.

### Características Principais

- ✅ **3 Regimes Tributários** completos (Simples, Presumido, Real)
- ✅ **Cálculo automático de impostos** (ICMS, PIS, COFINS, IRPJ, CSLL, ISS)
- ✅ **Análise comparativa** de economias entre regimes
- ✅ **Recomendação inteligente** do melhor regime para seu negócio
- ✅ **Suporte a produtos e serviços**
- ✅ **Anexos do Simples Nacional** (I, II, III, IV, V, VI)
- ✅ **Tabelas progressivas** por faturamento
- ✅ **Exportação de relatórios** fiscais

### Diferencial

Enquanto a Calculadora Avançada foca nas taxas de marketplace, a Calculadora Tributária é especializada em:

- Análise fiscal completa do negócio
- Comparação entre diferentes regimes
- Planejamento tributário estratégico
- Economia fiscal documentada
- Compliance tributário

---

## 🏛️ Regimes Tributários

### 1. Simples Nacional

**Descrição:**  
Regime tributário simplificado para micro e pequenas empresas com faturamento até R$ 4,8 milhões/ano.

**Vantagens:**
- ✅ Tributação unificada (uma única guia)
- ✅ Alíquotas reduzidas
- ✅ Menos burocracia
- ✅ Isenções de alguns impostos

**Desvantagens:**
- ❌ Limite de faturamento
- ❌ Restrições de atividades
- ❌ Não gera crédito de ICMS/PIS/COFINS

**Anexos do Simples:**

#### Anexo I - Comércio

```typescript
const anexo1Ranges = [
  { upTo: 180000,   rate: 4.00,  deduction: 0 },
  { upTo: 360000,   rate: 7.30,  deduction: 5940 },
  { upTo: 720000,   rate: 9.50,  deduction: 13860 },
  { upTo: 1800000,  rate: 10.70, deduction: 22500 },
  { upTo: 3600000,  rate: 14.30, deduction: 87300 },
  { upTo: 4800000,  rate: 19.00, deduction: 378000 }
];
```

**Aplicável a:** Revenda de mercadorias

**Composição:**
- IRPJ: 5.5%
- CSLL: 3.5%
- COFINS: 12.74%
- PIS/PASEP: 2.76%
- CPP: 41.5%
- ICMS: 34%

#### Anexo II - Indústria

```typescript
const anexo2Ranges = [
  { upTo: 180000,   rate: 4.50,  deduction: 0 },
  { upTo: 360000,   rate: 7.80,  deduction: 5940 },
  { upTo: 720000,   rate: 10.00, deduction: 13860 },
  { upTo: 1800000,  rate: 11.20, deduction: 22500 },
  { upTo: 3600000,  rate: 14.70, deduction: 85500 },
  { upTo: 4800000,  rate: 30.00, deduction: 720000 }
];
```

**Aplicável a:** Fabricação e industrialização de produtos

#### Anexo III - Serviços (parte 1)

```typescript
const anexo3Ranges = [
  { upTo: 180000,   rate: 6.00,  deduction: 0 },
  { upTo: 360000,   rate: 11.20, deduction: 9360 },
  { upTo: 720000,   rate: 13.50, deduction: 17640 },
  { upTo: 1800000,  rate: 16.00, deduction: 35640 },
  { upTo: 3600000,  rate: 21.00, deduction: 125640 },
  { upTo: 4800000,  rate: 33.00, deduction: 648000 }
];
```

**Aplicável a:** Prestação de serviços (instalações, reparos, manutenção)

#### Anexo IV - Serviços (parte 2)

```typescript
const anexo4Ranges = [
  { upTo: 180000,   rate: 4.50,  deduction: 0 },
  { upTo: 360000,   rate: 9.00,  deduction: 8100 },
  { upTo: 720000,   rate: 10.20, deduction: 12420 },
  { upTo: 1800000,  rate: 14.00, deduction: 39780 },
  { upTo: 3600000,  rate: 22.00, deduction: 183780 },
  { upTo: 4800000,  rate: 33.00, deduction: 828000 }
];
```

**Aplicável a:** Construção civil, vigilância, limpeza, obras

#### Anexo V - Serviços especializados

```typescript
const anexo5Ranges = [
  { upTo: 180000,   rate: 15.50, deduction: 0 },
  { upTo: 360000,   rate: 18.00, deduction: 4500 },
  { upTo: 720000,   rate: 19.50, deduction: 9900 },
  { upTo: 1800000,  rate: 20.50, deduction: 17100 },
  { upTo: 3600000,  rate: 23.00, deduction: 62100 },
  { upTo: 4800000,  rate: 30.50, deduction: 540000 }
];
```

**Aplicável a:** Serviços intelectuais (advocacia, contabilidade, medicina, engenharia)

#### Anexo VI - Cessão de mão de obra

Não implementado (anexo específico para terceirização)

### 2. Lucro Presumido

**Descrição:**  
Regime para empresas com faturamento até R$ 78 milhões/ano. O lucro é presumido por lei (geralmente 8% ou 32%).

**Vantagens:**
- ✅ Limite de faturamento maior
- ✅ Menos obrigações acessórias
- ✅ Alíquotas fixas e previsíveis
- ✅ Gera crédito de ICMS/PIS/COFINS

**Desvantagens:**
- ❌ Tributação sobre faturamento (não sobre lucro real)
- ❌ Pode ser mais caro para margens baixas
- ❌ Menos flexibilidade

**Impostos Calculados:**

```typescript
interface LucroPresumidoTaxes {
  // Federais
  PIS: 0.65,        // % sobre faturamento
  COFINS: 3.00,     // % sobre faturamento
  IRPJ: 15.00,      // % sobre lucro presumido (8-32% do faturamento)
  CSLL: 9.00,       // % sobre lucro presumido
  
  // Estaduais
  ICMS: 12.00,      // % sobre faturamento (varia por estado)
  ICMS_ST: 2.00,    // Substituição Tributária
  
  // Municipais
  ISS: 2.00-5.00    // % sobre faturamento (serviços)
}
```

**Percentuais de Presunção:**

| Atividade | Presunção |
|-----------|-----------|
| Comércio e Indústria | 8% |
| Serviços gerais | 32% |
| Transporte de cargas | 8% |
| Transporte de passageiros | 16% |
| Serviços hospitalares | 8% |
| Serviços profissionais | 32% |

### 3. Lucro Real

**Descrição:**  
Regime obrigatório para empresas com faturamento acima de R$ 78 milhões/ano ou atividades específicas (bancos, seguros, etc.). Tributa sobre o lucro efetivo.

**Vantagens:**
- ✅ Tributação sobre lucro real
- ✅ Vantajoso para margens baixas ou prejuízo
- ✅ Compensação de prejuízos fiscais
- ✅ Créditos de ICMS/PIS/COFINS aproveitáveis

**Desvantagens:**
- ❌ Muitas obrigações acessórias
- ❌ Complexidade contábil alta
- ❌ Custos contábeis elevados

**Impostos Calculados:**

```typescript
interface LucroRealTaxes {
  // Federais (não-cumulativo)
  PIS: 1.65,        // % sobre faturamento
  COFINS: 7.60,     // % sobre faturamento
  IRPJ: 15.00,      // % sobre lucro real
  IRPJ_Add: 10.00,  // % sobre lucro acima de R$ 20k/mês
  CSLL: 9.00,       // % sobre lucro real
  
  // Estaduais
  ICMS: 12.00,      // % sobre faturamento
  ICMS_ST: 2.00,
  
  // Municipais
  ISS: 2.00-5.00    // % sobre faturamento (serviços)
}
```

---

## 🧮 Cálculos de Impostos

### Fórmula Geral - Simples Nacional

```typescript
// 1. Calcular receita bruta dos últimos 12 meses
const receitaBrutaAnual = calcularReceitaUltimos12Meses();

// 2. Encontrar a faixa de faturamento
const faixa = encontrarFaixa(receitaBrutaAnual, anexo);

// 3. Calcular alíquota efetiva
const aliquotaEfetiva = ((receitaBrutaAnual × faixa.rate) - faixa.deduction) / receitaBrutaAnual;

// 4. Calcular imposto do mês
const impostoMes = faturamentoMes × aliquotaEfetiva;
```

**Exemplo Prático - Anexo I:**

Dados:
- Receita bruta anual: R$ 500.000,00
- Faturamento do mês: R$ 50.000,00

Cálculo:
```
Faixa: R$ 360.001 até R$ 720.000 (9.50% - R$ 13.860)
Alíquota Efetiva = ((500.000 × 0.095) - 13.860) / 500.000
Alíquota Efetiva = (47.500 - 13.860) / 500.000
Alíquota Efetiva = 33.640 / 500.000
Alíquota Efetiva = 6.73%

Imposto do Mês = 50.000 × 0.0673
Imposto do Mês = R$ 3.365,00
```

### Fórmula Geral - Lucro Presumido

```typescript
// 1. Calcular impostos federais não-cumulativos
const pis = faturamento × 0.0065;
const cofins = faturamento × 0.0300;

// 2. Calcular base de cálculo do IRPJ/CSLL
const lucroPresumido = faturamento × percentualPresuncao; // 8% ou 32%

// 3. Calcular IRPJ
const irpj = lucroPresumido × 0.15;
const irpjAdicional = lucroPresumido > 20000 ? (lucroPresumido - 20000) × 0.10 : 0;

// 4. Calcular CSLL
const csll = lucroPresumido × 0.09;

// 5. Calcular ICMS (se aplicável)
const icms = faturamento × 0.12;

// 6. Total de impostos
const totalImpostos = pis + cofins + irpj + irpjAdicional + csll + icms;
```

**Exemplo Prático - Comércio:**

Dados:
- Faturamento mensal: R$ 100.000,00
- Atividade: Comércio (presunção 8%)

Cálculo:
```
PIS = 100.000 × 0.65% = R$ 650,00
COFINS = 100.000 × 3% = R$ 3.000,00
Lucro Presumido = 100.000 × 8% = R$ 8.000,00
IRPJ = 8.000 × 15% = R$ 1.200,00
CSLL = 8.000 × 9% = R$ 720,00
ICMS = 100.000 × 12% = R$ 12.000,00

Total = R$ 17.570,00 (17.57%)
```

### Fórmula Geral - Lucro Real

```typescript
// 1. Calcular impostos não-cumulativos
const pis = faturamento × 0.0165;
const cofins = faturamento × 0.0760;

// 2. Calcular lucro real
const lucroReal = calcularLucroContabil(); // Receitas - Despesas

// 3. Calcular IRPJ
const irpj = lucroReal × 0.15;
const irpjAdicional = lucroReal > 20000 ? (lucroReal - 20000) × 0.10 : 0;

// 4. Calcular CSLL
const csll = lucroReal × 0.09;

// 5. Calcular ICMS
const icms = faturamento × 0.12;

// 6. Total de impostos
const totalImpostos = pis + cofins + irpj + irpjAdicional + csll + icms;
```

**Exemplo Prático - Lucro de 10%:**

Dados:
- Faturamento mensal: R$ 100.000,00
- Lucro real: R$ 10.000,00 (10%)

Cálculo:
```
PIS = 100.000 × 1.65% = R$ 1.650,00
COFINS = 100.000 × 7.60% = R$ 7.600,00
IRPJ = 10.000 × 15% = R$ 1.500,00
CSLL = 10.000 × 9% = R$ 900,00
ICMS = 100.000 × 12% = R$ 12.000,00

Total = R$ 23.650,00 (23.65%)
```

---

## 📊 Análise Comparativa

### Comparação Automática

A calculadora compara automaticamente os 3 regimes e mostra:

```typescript
interface RegimeComparison {
  simples: {
    totalTax: number;
    effectiveRate: number;
    annexo: string;
  };
  presumido: {
    totalTax: number;
    effectiveRate: number;
    presuncao: number;
  };
  real: {
    totalTax: number;
    effectiveRate: number;
    lucroReal: number;
  };
  recommendation: 'simples' | 'presumido' | 'real';
  savings: number; // Economia ao trocar
}
```

### Exemplo de Comparação

**Cenário:**
- Faturamento mensal: R$ 80.000,00
- Faturamento anual: R$ 960.000,00
- Atividade: Comércio
- Lucro real: 15%

**Resultado:**

| Regime | Imposto Mensal | Taxa Efetiva | Economia vs Atual |
|--------|----------------|--------------|-------------------|
| **Simples (Anexo I)** | R$ 7.760,00 | 9.70% | - |
| Lucro Presumido | R$ 14.056,00 | 17.57% | -R$ 6.296 |
| Lucro Real | R$ 20.605,00 | 25.76% | -R$ 12.845 |

**Recomendação:** ✅ **Simples Nacional (Anexo I)**

**Análise:**
- Economia de R$ 6.296/mês vs Lucro Presumido
- Economia de R$ 12.845/mês vs Lucro Real
- Economia anual: R$ 75.552 vs Presumido
- Economia anual: R$ 154.140 vs Real

---

## 📖 Guia de Uso

### Fluxo Básico

**1. Acessar a calculadora:**
```
/calculadora-tributaria (ou aba "Análise Tributária" na Calculadora Avançada)
```

**2. Informar dados do negócio:**
- Faturamento mensal
- Faturamento anual (últimos 12 meses)
- Tipo de atividade (comércio, indústria, serviço)
- Categoria específica (se serviço)

**3. Informar dados de custos (opcional):**
- Custos operacionais
- Despesas dedutíveis
- Para cálculo preciso do Lucro Real

**4. Visualizar comparação:**
- Tabela comparativa dos 3 regimes
- Gráfico de barras com impostos
- Recomendação inteligente
- Economia potencial

**5. Análise detalhada:**
- Clique em cada regime para ver breakdown
- Visualize todos os impostos separadamente
- Entenda a composição da carga tributária

### Casos de Uso

#### Caso 1: Loja de Roupas (Comércio)

**Dados:**
- Faturamento mensal: R$ 50.000
- Faturamento anual: R$ 600.000
- Atividade: Comércio (revenda)

**Análise:**
- Simples Nacional Anexo I: 9.5%
- Lucro Presumido: 17.57%
- Lucro Real (10% margem): 23.65%

**Recomendação:** Simples Nacional (economia de R$ 4.035/mês vs Presumido)

#### Caso 2: Escritório de Advocacia (Serviços)

**Dados:**
- Faturamento mensal: R$ 30.000
- Faturamento anual: R$ 360.000
- Atividade: Serviços advocatícios

**Análise:**
- Simples Nacional Anexo V: 18% (alto para serviços intelectuais)
- Lucro Presumido (32%): 21.65%
- Lucro Real (40% margem): 19.25%

**Recomendação:** Lucro Real (se margem > 35%) ou Presumido

#### Caso 3: Indústria de Móveis

**Dados:**
- Faturamento mensal: R$ 200.000
- Faturamento anual: R$ 2.400.000
- Atividade: Fabricação

**Análise:**
- Simples Nacional Anexo II: 14.7% (faixa 4)
- Lucro Presumido: 17.57%
- Lucro Real (8% margem): 21.5%

**Recomendação:** Simples Nacional (se enquadrado) ou Presumido

---

## 💡 Exemplos Práticos

### Exemplo 1: Mudança de Regime

```typescript
// Empresa atualmente no Lucro Presumido
const empresaAtual = {
  regime: 'presumido',
  faturamentoMensal: 100000,
  faturamentoAnual: 1200000,
  atividade: 'comercio'
};

// Calcular nos 3 regimes
const analise = calcularComparacao(empresaAtual);

console.log('Regime Atual (Presumido):', analise.presumido.totalTax);
console.log('Se migrar para Simples:', analise.simples.totalTax);
console.log('Economia anual:', (analise.presumido.totalTax - analise.simples.totalTax) * 12);

/*
Resultado:
Regime Atual (Presumido): R$ 17.570,00
Se migrar para Simples: R$ 10.700,00
Economia anual: R$ 82.440,00
*/
```

### Exemplo 2: Planejamento Tributário

```typescript
// Simular crescimento do negócio
const cenarios = [
  { faturamentoAnual: 360000, descricao: 'Ano 1' },
  { faturamentoAnual: 720000, descricao: 'Ano 2' },
  { faturamentoAnual: 1800000, descricao: 'Ano 3' },
  { faturamentoAnual: 3600000, descricao: 'Ano 4' }
];

cenarios.forEach(cenario => {
  const analise = calcularSimples(cenario.faturamentoAnual, 'anexo1');
  console.log(`${cenario.descricao}: ${analise.effectiveRate.toFixed(2)}% de impostos`);
});

/*
Resultado:
Ano 1: 7.30% de impostos (Faixa 2)
Ano 2: 9.50% de impostos (Faixa 3)
Ano 3: 10.70% de impostos (Faixa 4)
Ano 4: 14.30% de impostos (Faixa 5)
*/
```

### Exemplo 3: Breakdown Detalhado

```typescript
// Ver composição dos impostos no Lucro Presumido
const breakdown = calcularLucroPresumidoDetalhado({
  faturamento: 150000,
  atividade: 'comercio'
});

console.log('Breakdown de Impostos:');
console.log('PIS:', formatCurrency(breakdown.pis));
console.log('COFINS:', formatCurrency(breakdown.cofins));
console.log('IRPJ:', formatCurrency(breakdown.irpj));
console.log('CSLL:', formatCurrency(breakdown.csll));
console.log('ICMS:', formatCurrency(breakdown.icms));
console.log('Total:', formatCurrency(breakdown.total));

/*
Resultado:
Breakdown de Impostos:
PIS: R$ 975,00
COFINS: R$ 4.500,00
IRPJ: R$ 1.800,00
CSLL: R$ 1.080,00
ICMS: R$ 18.000,00
Total: R$ 26.355,00
*/
```

---

## 🔌 API e Integração

### Hook Principal

```typescript
import { useTaxCalculator } from '@/hooks/useTaxCalculator';

function MyComponent() {
  const {
    calculateTaxes,
    compareRegimes,
    isLoading,
    result
  } = useTaxCalculator();
  
  const handleAnalyze = () => {
    compareRegimes({
      faturamentoMensal: 80000,
      faturamentoAnual: 960000,
      atividade: 'comercio',
      lucroReal: 15 // percentual
    });
  };
  
  return (
    <>
      {result && (
        <div>
          <h3>Melhor regime: {result.recommendation}</h3>
          <p>Economia: {formatCurrency(result.savings)}/mês</p>
        </div>
      )}
    </>
  );
}
```

### Serviço de Cálculo Tributário

```typescript
import { TaxCalculationService } from '@/services/TaxCalculationService';

// Calcular Simples Nacional
const simples = TaxCalculationService.calculateSimples({
  faturamentoAnual: 500000,
  faturamentoMensal: 50000,
  anexo: 'I'
});

// Calcular Lucro Presumido
const presumido = TaxCalculationService.calculatePresumido({
  faturamento: 100000,
  atividade: 'comercio'
});

// Calcular Lucro Real
const real = TaxCalculationService.calculateReal({
  faturamento: 100000,
  lucroReal: 10000 // lucro contábil
});

// Comparar todos
const comparison = TaxCalculationService.compareAll({
  faturamentoMensal: 80000,
  faturamentoAnual: 960000,
  atividade: 'comercio',
  lucroRealPercentual: 15
});

console.log(`Recomendação: ${comparison.recommendation}`);
console.log(`Economia: R$ ${comparison.savings.toFixed(2)}/mês`);
```

---

## 🎓 Dicas e Boas Práticas

### Para Escolher o Regime

1. **Simples Nacional:**
   - Ideal se faturamento < R$ 4.8M/ano
   - Melhor para comércio e indústria
   - Menos burocracia

2. **Lucro Presumido:**
   - Considere se margem > 20% (comércio) ou > 50% (serviços)
   - Bom para faturamento entre R$ 4.8M e R$ 78M
   - Menos obrigações que Lucro Real

3. **Lucro Real:**
   - Obrigatório se faturamento > R$ 78M/ano
   - Vantajoso para margens baixas (< 10%)
   - Permite compensar prejuízos

### Alertas Importantes

⚠️ **Trocas de regime:** Só podem ser feitas no início do ano  
⚠️ **Simples Nacional:** Verificar se atividade é permitida  
⚠️ **Lucro Real:** Exige contabilidade completa  
⚠️ **ISS:** Varia por município (2% a 5%)

---

## 🔗 Links Relacionados

- [Calculadora Avançada](./ADVANCED_CALCULATOR.md)
- [Sistema de Marketplace](./MARKETPLACE.md)
- [Receita Federal - Simples Nacional](http://www8.receita.fazenda.gov.br/SimplesNacional/)
- [Portal do Simples Nacional](http://www.portaldosimples.com.br/)

---

## 📞 Suporte

Precisa de ajuda fiscal? Entre em contato:

- 📧 Email: fiscal@azuria.app
- 💬 Discord: [Comunidade Azuria](https://discord.com/invite/azuria)
- 🤝 Consulte seu contador

⚠️ **Aviso Legal:** Esta calculadora é uma ferramenta de apoio. Sempre consulte um contador qualificado para decisões fiscais definitivas.

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
