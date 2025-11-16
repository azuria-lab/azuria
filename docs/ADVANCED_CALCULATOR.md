# 🚀 Calculadora Avançada - Documentação Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Fórmulas de Cálculo](#fórmulas-de-cálculo)
- [Guia de Uso](#guia-de-uso)
- [API e Integração](#api-e-integração)
- [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

A **Calculadora Avançada** é uma ferramenta profissional de precificação desenvolvida para vendedores que atuam em marketplaces e precisam de análises detalhadas de custos, margens e lucratividade.

### Características Principais

- ✅ **Wizard em 3 etapas** com interface guiada
- ✅ **Cálculo em tempo real** com painel lateral fixo
- ✅ **Suporte a múltiplos marketplaces** (Mercado Livre, Amazon, Shopee, Custom)
- ✅ **Análise de custos completa** (frete, embalagem, marketing, outros)
- ✅ **Simulação de cenários** (ajuste rápido de margens ±5%, ±10%)
- ✅ **Exportação em PDF** com relatório completo
- ✅ **Histórico de cálculos** (últimos 10 salvos)
- ✅ **Design premium** com animações e glassmorphism

### Diferencial

Enquanto a Calculadora Básica foca em cálculos simples de nota fiscal, a Calculadora Avançada é voltada para **vendedores profissionais** que precisam:

- Precificar produtos em múltiplos canais de venda
- Analisar viabilidade considerando todas as taxas e custos
- Comparar cenários de margem rapidamente
- Manter histórico e exportar relatórios
- Preparar análises para decisões estratégicas

---

## 🎨 Funcionalidades

### 1. Wizard em 3 Etapas

#### **Etapa 1: Dados do Produto**

Interface limpa para entrada dos dados básicos:

```typescript
interface ProductData {
  name: string;           // Nome do produto
  category: string;       // Categoria (Eletrônicos, Moda, Casa, etc.)
  cost: number;          // Custo do produto (R$)
}
```

**Categorias suportadas:**
- 📱 Eletrônicos
- 👕 Moda e Acessórios
- 🏠 Casa e Decoração
- 🏃 Esportes e Fitness
- 💄 Beleza e Cosméticos
- 🎮 Outros

**Recursos:**
- Preview em tempo real do que está sendo digitado
- Validação instantânea de campos obrigatórios
- Máscara de moeda para o campo de custo
- Animação suave entre etapas

#### **Etapa 2: Custos e Marketplace**

Tela mais complexa com múltiplos inputs organizados:

```typescript
interface CostsAndFees {
  // Margem
  targetMargin: number;   // Margem de lucro desejada (0-100%)
  
  // Marketplace
  marketplaceId: string;  // ID do marketplace selecionado
  marketplaceFee: number; // Taxa calculada automaticamente
  
  // Meio de pagamento
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  paymentFee: number;     // Taxa calculada automaticamente
  
  // Custos adicionais
  shipping: number;       // Frete (R$)
  packaging: number;      // Embalagem (R$)
  marketing: number;      // Marketing (R$)
  others: number;         // Outros custos (R$)
}
```

**Margem de Lucro:**
- Slider interativo (0-100%)
- Botões rápidos: 10%, 20%, 30%, 40%, 50%
- Visualização em tempo real no painel

**Marketplaces Integrados:**

| Marketplace | Taxa | Status |
|-------------|------|--------|
| Mercado Livre | 11% - 15% | ✅ Ativo |
| Amazon | 8% - 15% | ✅ Ativo |
| Shopee | 5% - 12% | ✅ Ativo |
| Custom | Configurável | ✅ Ativo |

**Meios de Pagamento:**

| Tipo | Taxa | Observação |
|------|------|------------|
| Cartão de Crédito | 2.5% | Taxa média |
| Cartão de Débito | 1.5% | Menor taxa |
| PIX | 0.5% | Mais econômico |
| Boleto | 3.0% | Maior taxa |

**Custos Adicionais:**
- Campo opcional para cada tipo de custo
- Máscara de moeda
- Soma automática no painel lateral

#### **Etapa 3: Resultado Final**

Visualização completa do cálculo com múltiplas ferramentas:

```typescript
interface CalculationResult {
  // Valores principais
  sellingPrice: number;      // Preço de venda sugerido
  netProfit: number;         // Lucro líquido (R$)
  totalMargin: number;       // Margem total (%)
  totalFees: number;         // Total de taxas (R$)
  
  // Breakdown detalhado
  breakdown: {
    cost: number;            // Custo base
    marketplaceFee: number;  // Taxa marketplace
    paymentFee: number;      // Taxa pagamento
    shipping: number;        // Frete
    packaging: number;       // Embalagem
    marketing: number;       // Marketing
    others: number;          // Outros
    profit: number;          // Lucro
  };
  
  // Metadata
  confidence: number;        // Confiança do cálculo (0-100)
  alerts: Alert[];          // Alertas e avisos
}
```

### 2. Painel Lateral em Tempo Real

Componente fixo que acompanha o scroll, mostrando:

```
┌─────────────────────────────┐
│   💰 Preço Sugerido         │
│   R$ 1.234,56               │
│   ────────────────────      │
│   📈 Lucro Líquido          │
│   R$ 456,78 (37%)           │
│   ────────────────────      │
│   📊 Total de Taxas         │
│   15.5%                     │
│   ────────────────────      │
│   ✅ Margem Saudável        │
└─────────────────────────────┘
```

**Características:**
- Atualização instantânea ao digitar
- Cores semânticas (verde=lucro, amarelo=custos, vermelho=prejuízo)
- Animação de números com `AnimatedNumber` component
- Indicador visual de margem saudável

### 3. Simulação de Cenários

Botões rápidos para testar diferentes margens:

```typescript
const scenarios = [
  { label: '-10%', adjustment: -10 },
  { label: '-5%',  adjustment: -5 },
  { label: '+5%',  adjustment: +5 },
  { label: '+10%', adjustment: +10 }
];
```

**Exemplo de uso:**
1. Calculou com margem de 30%
2. Clica em "+5%" → Recalcula instantaneamente com 35%
3. Compara os dois cenários
4. Escolhe o melhor

### 4. Exportação PDF

Geração de relatório profissional com:

**Estrutura do PDF:**
```
┌───────────────────────────────────┐
│  AZURIA                           │
│  Relatório de Precificação        │
├───────────────────────────────────┤
│  Produto: [Nome]                  │
│  Categoria: [Categoria]           │
│  Data: [DD/MM/YYYY HH:MM]         │
├───────────────────────────────────┤
│  COMPOSIÇÃO DO PREÇO              │
│                                   │
│  Custo do Produto: R$ X.XXX,XX    │
│  Taxa Marketplace: R$ XXX,XX      │
│  Taxa Pagamento:   R$ XX,XX       │
│  Frete:            R$ XX,XX       │
│  Embalagem:        R$ XX,XX       │
│  Marketing:        R$ XX,XX       │
│  Outros:           R$ XX,XX       │
│  ─────────────────────────        │
│  Lucro:            R$ XXX,XX      │
│                                   │
│  PREÇO FINAL: R$ X.XXX,XX         │
│  Margem: XX%                      │
└───────────────────────────────────┘
```

**Tecnologia:**
- Biblioteca: `jsPDF`
- Formato: A4
- Logo do Azuria
- Marca d'água (opcional para planos Premium)

### 5. Histórico de Cálculos

Sistema de persistência local dos últimos 10 cálculos:

```typescript
interface CalculationHistory {
  id: string;                  // UUID único
  timestamp: Date;             // Data/hora do cálculo
  productName: string;         // Nome do produto
  sellingPrice: number;        // Resultado
  margin: number;              // Margem aplicada
  marketplace: string;         // Marketplace usado
}
```

**Recursos:**
- Armazenamento em `localStorage`
- Botão "Carregar" para reaplicar cálculo anterior
- Ordenação por data (mais recente primeiro)
- Limite de 10 registros (FIFO)

### 6. Design Premium

**Sistema de Cores Semântico:**

```typescript
const colorScheme = {
  cost: 'orange',      // 🟠 Custos base
  fees: 'yellow',      // 🟡 Taxas e impostos
  profit: 'green',     // 🟢 Lucro
  loss: 'red',         // 🔴 Prejuízo
  neutral: 'gray'      // ⚪ Neutro
};
```

**Efeitos Visuais:**
- **Glassmorphism**: Cartões com backdrop-blur
- **Animações Framer Motion**: Transições suaves entre etapas
- **Tooltips**: Explicações contextuais em todos os campos
- **Skeleton Loading**: Durante cálculos
- **Progress Bar**: Indicação de progresso das etapas (33% → 66% → 100%)

---

## 🏗️ Arquitetura

### Estrutura de Componentes

```
AdvancedProCalculator
├── CalculatorWizard
│   ├── Step1: ProductInfo
│   │   ├── ProductNameInput
│   │   ├── CategorySelect
│   │   └── CostInput
│   ├── Step2: CostsAndFees
│   │   ├── MarginSlider
│   │   ├── MarketplaceSelect
│   │   ├── PaymentMethodSelect
│   │   └── AdditionalCostsInputs
│   └── Step3: Results
│       ├── CalculationSummary
│       ├── ScenarioSimulation
│       ├── ExportPDFButton
│       └── HistoryPanel
└── LiveCalculationPanel (Sidebar)
    ├── PriceSummary
    ├── ProfitIndicator
    ├── FeesBreakdown
    └── MarginHealthIndicator
```

### Fluxo de Dados

```typescript
// 1. Estado global do formulário
const [formData, setFormData] = useState<CalculatorFormData>({
  // Step 1
  name: '',
  category: '',
  cost: 0,
  // Step 2
  targetMargin: 30,
  marketplaceId: 'mercadolivre',
  paymentMethod: 'credit',
  shipping: 0,
  packaging: 0,
  marketing: 0,
  others: 0
});

// 2. Hook de cálculo
const { 
  result, 
  isLoading, 
  calculateAdvancedPrice 
} = useAdvancedCalculator();

// 3. Trigger de cálculo (onChange ou onClick)
const handleCalculate = () => {
  calculateAdvancedPrice(formData);
};

// 4. Resultado renderizado
{result && <CalculationSummary result={result} />}
```

### Serviços e Hooks

**Hook Principal: `useAdvancedCalculator`**

```typescript
export const useAdvancedCalculator = () => {
  const [result, setResult] = useState<AdvancedCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const calculateAdvancedPrice = async (params: CalculationParams) => {
    setIsLoading(true);
    
    // Validação
    const validation = ValidationService.validateAdvancedInputs(params);
    if (!validation.isValid) {
      toast.error(validation.errors.join(', '));
      return;
    }
    
    // Cálculo
    const result = await CalculationService.calculateAdvanced(params);
    setResult(result);
    
    // Salvar no histórico
    saveToHistory(result);
    
    setIsLoading(false);
  };
  
  return { result, isLoading, calculateAdvancedPrice };
};
```

**Serviço de Cálculo: `CalculationService`**

```typescript
export class CalculationService {
  static async calculateAdvanced(params: CalculationParams): Promise<AdvancedCalculationResult> {
    // 1. Custo base
    const baseCost = params.cost;
    
    // 2. Taxas
    const marketplaceFee = baseCost * (params.marketplaceFee / 100);
    const paymentFee = baseCost * (params.paymentFee / 100);
    
    // 3. Custos adicionais
    const additionalCosts = params.shipping + params.packaging + params.marketing + params.others;
    
    // 4. Custo total
    const totalCost = baseCost + marketplaceFee + paymentFee + additionalCosts;
    
    // 5. Preço de venda (com margem)
    const sellingPrice = totalCost / (1 - params.targetMargin / 100);
    
    // 6. Lucro
    const profit = sellingPrice - totalCost;
    const profitMargin = (profit / sellingPrice) * 100;
    
    return {
      sellingPrice,
      profit,
      profitMargin,
      totalCost,
      breakdown: {
        cost: baseCost,
        marketplaceFee,
        paymentFee,
        shipping: params.shipping,
        packaging: params.packaging,
        marketing: params.marketing,
        others: params.others,
        profit
      }
    };
  }
}
```

---

## 📐 Fórmulas de Cálculo

### Fórmula Principal

```
Preço de Venda = Custo Total / (1 - Margem Desejada)
```

### Detalhamento Passo a Passo

**Exemplo prático:**

Dados de entrada:
- Custo do produto: R$ 100,00
- Marketplace: Mercado Livre (11%)
- Pagamento: Cartão de Crédito (2.5%)
- Frete: R$ 15,00
- Embalagem: R$ 5,00
- Marketing: R$ 10,00
- Margem desejada: 30%

**Passo 1: Calcular taxas sobre o custo**

```
Taxa Marketplace = R$ 100,00 × 11% = R$ 11,00
Taxa Pagamento  = R$ 100,00 × 2.5% = R$ 2,50
```

**Passo 2: Somar todos os custos**

```
Custo Total = Custo Base + Taxas + Custos Adicionais
Custo Total = R$ 100,00 + R$ 11,00 + R$ 2,50 + R$ 15,00 + R$ 5,00 + R$ 10,00
Custo Total = R$ 143,50
```

**Passo 3: Calcular preço de venda**

```
Preço de Venda = R$ 143,50 / (1 - 0.30)
Preço de Venda = R$ 143,50 / 0.70
Preço de Venda = R$ 205,00
```

**Passo 4: Calcular lucro**

```
Lucro = Preço de Venda - Custo Total
Lucro = R$ 205,00 - R$ 143,50
Lucro = R$ 61,50

Margem Efetiva = (R$ 61,50 / R$ 205,00) × 100
Margem Efetiva = 30%
```

### Fórmulas Auxiliares

**Margem Bruta:**
```
Margem Bruta = (Preço Venda - Custo Base) / Preço Venda × 100
```

**Margem Líquida:**
```
Margem Líquida = (Lucro / Preço Venda) × 100
```

**ROI (Return on Investment):**
```
ROI = (Lucro / Custo Total) × 100
```

**Markup:**
```
Markup = (Preço Venda / Custo Base) × 100
```

---

## 📖 Guia de Uso

### Fluxo Básico

**1. Acessar a calculadora:**
```
/calculadora-avancada
```

**2. Preencher Etapa 1 - Produto:**
- Digite o nome do produto
- Selecione a categoria
- Informe o custo (R$)
- Clique em "Próximo"

**3. Preencher Etapa 2 - Custos:**
- Ajuste a margem desejada (slider ou botões rápidos)
- Selecione o marketplace
- Escolha o meio de pagamento
- Preencha custos adicionais (opcional)
- Observe o painel lateral atualizando em tempo real
- Clique em "Próximo"

**4. Visualizar Etapa 3 - Resultado:**
- Veja o preço sugerido em destaque
- Analise o breakdown de custos
- Teste cenários com os botões ±5%, ±10%
- Exporte o PDF se necessário
- Salve no histórico

### Casos de Uso

#### Caso 1: Vendedor Iniciante no Mercado Livre

**Problema:** "Preciso calcular o preço de um tênis que comprei por R$ 150,00"

**Solução:**
1. Nome: "Tênis Esportivo Nike"
2. Categoria: Esportes e Fitness
3. Custo: R$ 150,00
4. Marketplace: Mercado Livre (11%)
5. Pagamento: Cartão de Crédito (2.5%)
6. Frete: R$ 25,00
7. Margem: 30%

**Resultado:**
- Preço de Venda: R$ 286,43
- Lucro: R$ 86,43
- Margem Efetiva: 30%

#### Caso 2: Lojista com Múltiplos Custos

**Problema:** "Vendo eletrônicos com custos de marketing e embalagem especial"

**Solução:**
1. Nome: "Fone de Ouvido Bluetooth"
2. Categoria: Eletrônicos
3. Custo: R$ 80,00
4. Marketplace: Amazon (12%)
5. Pagamento: PIX (0.5%)
6. Frete: R$ 12,00
7. Embalagem: R$ 8,00
8. Marketing: R$ 15,00
9. Margem: 35%

**Resultado:**
- Preço de Venda: R$ 192,31
- Lucro: R$ 67,31
- Margem Efetiva: 35%

#### Caso 3: Comparação de Marketplaces

**Problema:** "Quero saber em qual marketplace tenho mais lucro"

**Solução:**
1. Faça o cálculo para Mercado Livre
2. Anote o resultado
3. Volte para Etapa 2
4. Troque para Amazon
5. Compare os resultados no painel

**Dica:** Use a funcionalidade de histórico para comparar lado a lado.

---

## 🔌 API e Integração

### Integração via Hook

```typescript
import { useAdvancedCalculator } from '@/hooks/useAdvancedCalculator';

function MyComponent() {
  const { result, isLoading, calculateAdvancedPrice } = useAdvancedCalculator();
  
  const handleSubmit = (formData) => {
    calculateAdvancedPrice({
      cost: formData.cost,
      targetMargin: formData.margin,
      marketplaceId: formData.marketplace,
      // ... outros parâmetros
    });
  };
  
  return (
    <>
      {isLoading && <LoadingSpinner />}
      {result && <ResultDisplay result={result} />}
    </>
  );
}
```

### Integração Direta com Serviço

```typescript
import { CalculationService } from '@/services/CalculationService';

// Cálculo direto (sem hook)
const result = await CalculationService.calculateAdvanced({
  cost: 100,
  targetMargin: 30,
  marketplaceFee: 11,
  paymentFee: 2.5,
  shipping: 15,
  packaging: 5,
  marketing: 10,
  others: 0
});

console.log(`Preço de venda: R$ ${result.sellingPrice.toFixed(2)}`);
```

### API de Validação

```typescript
import { ValidationService } from '@/services/ValidationService';

const validation = ValidationService.validateAdvancedInputs({
  cost: 100,
  targetMargin: 150  // Erro: margem não pode ser > 100%
});

if (!validation.isValid) {
  console.error(validation.errors);
  // ["Margem deve estar entre 0 e 100%"]
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Cálculo Completo

```typescript
const exampleCalculation = {
  // Produto
  name: "Camiseta Personalizada",
  category: "moda",
  cost: 35.00,
  
  // Marketplace e pagamento
  marketplaceId: "mercadolivre",
  marketplaceFee: 11,
  paymentMethod: "credit",
  paymentFee: 2.5,
  
  // Custos adicionais
  shipping: 12.00,
  packaging: 3.50,
  marketing: 5.00,
  others: 2.00,
  
  // Margem
  targetMargin: 35
};

// Executar cálculo
const result = await CalculationService.calculateAdvanced(exampleCalculation);

/*
Resultado esperado:
{
  sellingPrice: 121.54,
  profit: 42.54,
  profitMargin: 35,
  totalCost: 79.00,
  breakdown: {
    cost: 35.00,
    marketplaceFee: 3.85,
    paymentFee: 0.88,
    shipping: 12.00,
    packaging: 3.50,
    marketing: 5.00,
    others: 2.00,
    profit: 42.54
  }
}
*/
```

### Exemplo 2: Simulação de Cenários

```typescript
const baseParams = {
  cost: 100,
  marketplaceFee: 11,
  paymentFee: 2.5,
  shipping: 15,
  packaging: 5,
  marketing: 10
};

// Cenário 1: Margem conservadora (20%)
const conservative = await CalculationService.calculateAdvanced({
  ...baseParams,
  targetMargin: 20
});

// Cenário 2: Margem moderada (30%)
const moderate = await CalculationService.calculateAdvanced({
  ...baseParams,
  targetMargin: 30
});

// Cenário 3: Margem agressiva (40%)
const aggressive = await CalculationService.calculateAdvanced({
  ...baseParams,
  targetMargin: 40
});

console.log('Comparação de Cenários:');
console.log(`20%: R$ ${conservative.sellingPrice.toFixed(2)}`);
console.log(`30%: R$ ${moderate.sellingPrice.toFixed(2)}`);
console.log(`40%: R$ ${aggressive.sellingPrice.toFixed(2)}`);
```

### Exemplo 3: Comparação de Marketplaces

```typescript
const productData = {
  cost: 150,
  targetMargin: 30,
  paymentFee: 2.5,
  shipping: 20,
  packaging: 8,
  marketing: 12
};

const marketplaces = [
  { id: 'mercadolivre', name: 'Mercado Livre', fee: 11 },
  { id: 'amazon', name: 'Amazon', fee: 12 },
  { id: 'shopee', name: 'Shopee', fee: 7.5 }
];

const comparisons = await Promise.all(
  marketplaces.map(async (mp) => {
    const result = await CalculationService.calculateAdvanced({
      ...productData,
      marketplaceFee: mp.fee
    });
    
    return {
      marketplace: mp.name,
      sellingPrice: result.sellingPrice,
      profit: result.profit,
      profitMargin: result.profitMargin
    };
  })
);

console.table(comparisons);
```

---

## 🎓 Dicas e Boas Práticas

### Para Iniciantes

1. **Comece com margens conservadoras** (20-30%)
2. **Não esqueça dos custos ocultos** (embalagem, marketing)
3. **Use o histórico** para comparar produtos similares
4. **Teste cenários** antes de definir o preço final

### Para Avançados

1. **Considere sazonalidade** nos custos de marketing
2. **Negocie taxas** com marketplaces (volume alto)
3. **Otimize embalagens** para reduzir custos de frete
4. **Exporte relatórios** para análise financeira

### Alertas Importantes

⚠️ **Margem muito baixa** (< 10%): Produto pode não ser viável  
⚠️ **Muitas taxas** (> 20%): Considere marketplace alternativo  
⚠️ **Frete alto** (> 15% do custo): Negociar com transportadora  
⚠️ **Preço final muito alto**: Pode perder competitividade

---

## 🔗 Links Relacionados

- [Calculadora Básica](../README.md#-calculadora-básica)
- [Calculadora Tributária](./TAX_CALCULATOR.md)
- [Sistema de Marketplace](./MARKETPLACE.md)
- [Guia de Implementação](../ADVANCED_CALCULATOR_IMPLEMENTATION.md)
- [Guia Rápido](../ADVANCED_CALCULATOR_QUICK_GUIDE.md)

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: suporte@azuria.app
- 💬 Discord: [Comunidade Azuria](https://discord.com/invite/azuria)
- 📚 Documentação: [docs.azuria.app](https://docs.azuria.app)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
