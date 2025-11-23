# 🧠 Azuria AI - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Chat da IA](#chat-da-ia)
3. [Precificação Inteligente](#precificação-inteligente)
4. [Análise Competitiva IA](#análise-competitiva-ia)
5. [Análise Tributária IA](#análise-tributária-ia)
6. [Insights de Mercado](#insights-de-mercado)
7. [Previsão de Demanda](#previsão-de-demanda)
8. [Análise de Sazonalidade](#análise-de-sazonalidade)
9. [Lote Inteligente + IA](#lote-inteligente--ia)
10. [Limites e Custos](#limites-e-custos)
11. [Integração](#integração)
12. [Prompts e Modelos](#prompts-e-modelos)
13. [Workflows](#workflows)
14. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

O **Azuria AI** é um sistema completo de Inteligência Artificial integrado à plataforma Azuria, oferecendo assistência inteligente em precificação, análise tributária, monitoramento competitivo e estratégia de negócio.

### Características Principais

- ✅ **Chat interativo** com assistente virtual especializada
- ✅ **Precificação inteligente** baseada em Machine Learning
- ✅ **Análise competitiva** automatizada
- ✅ **Otimização tributária** com recomendações personalizadas
- ✅ **Insights de mercado** e tendências
- ✅ **Previsão de demanda** preditiva
- ✅ **Análise de sazonalidade** para otimização

### Modelos de IA Utilizados

- **GPT-3.5:** Plano Essencial (50 consultas/mês)
- **GPT-4:** Planos PRO e Enterprise (ilimitado)

### Acesso

- **Hub Unificado:** `/azuria-ia`
- **Botão Flutuante:** Disponível em todas as páginas
- **Integração:** Em calculadoras, dashboard e marketplace

---

## 💬 Chat da IA

### Visão Geral

O **Chat da IA** é um assistente virtual especializada em precificação e impostos brasileiros, disponível via interface de chat interativa.

### Funcionalidades

#### Sistema de Sessões
- Sessões persistentes por usuário
- Histórico de conversas salvo
- Contexto mantido entre mensagens
- Recuperação de sessões anteriores

#### Contexto do Usuário
- Tipo de negócio (comércio, serviços, indústria)
- Histórico de cálculos
- Preferências de resposta
- Nível de detalhe desejado

#### Sugestões Rápidas
- Sugestões contextuais baseadas na conversa
- Ações rápidas (abrir calculadora, análise, etc.)
- Perguntas frequentes
- Exemplos práticos

#### Detecção de Intenção
O sistema detecta automaticamente a intenção do usuário:

- **Precificação:** "preço", "precificar", "cobrar", "vender", "margem"
- **Impostos:** "imposto", "tributo", "simples", "lucro presumido", "alíquota"
- **Concorrência:** "concorrência", "competidor", "mercado livre", "shopee"
- **Marketplace:** "marketplace", "e-commerce", "loja", "venda online"

#### Ações Contextuais
- Abrir calculadora específica
- Executar análise
- Mostrar relatórios
- Sugerir otimizações

### Uso

```typescript
// Exemplo de uso do chat
import { chatService } from '@/services/ai/chatService';

// Criar sessão
const session = await chatService.createSession(userId, {
  businessType: 'comercio',
  preferences: {
    language: 'pt-BR',
    responseStyle: 'friendly',
    detailLevel: 'detailed'
  }
});

// Enviar mensagem
const response = await chatService.sendMessage(sessionId, {
  message: 'Como calcular o preço de um produto?',
  context: AIContext.PRICING
});
```

### Limites

| Plano | Consultas/mês | Rate Limit |
|-------|---------------|------------|
| Free | 0 | - |
| Essencial | 50 | 5/min |
| PRO | Ilimitado | 20/min |
| Enterprise | Ilimitado | 50/min |

---

## 💰 Precificação Inteligente

### Visão Geral

O **Motor de Precificação Inteligente** utiliza Machine Learning para sugerir preços ideais baseados em múltiplos fatores.

### Funcionalidades

#### Análise Completa
1. **Análise Básica:**
   - Cálculo de custos
   - Análise de impostos
   - Cálculo de margem

2. **Análise de Concorrência:**
   - Busca automática de preços
   - Comparação com mercado
   - Posicionamento competitivo

3. **Análise de Mercado:**
   - Tendências de mercado
   - Sazonalidade
   - Elasticidade de preço

4. **Análise de Volume:**
   - Impacto de volume nas vendas
   - Elasticidade de demanda
   - Otimização de margem

#### Sugestões de Preço
- **Preço Recomendado:** Baseado em análise completa
- **Preço Competitivo:** 15% de margem
- **Preço Premium:** 40% de margem
- **Preço Mínimo:** 5% de margem

#### Nível de Confiança
- **50%:** Margem muito baixa (<10%)
- **80%:** Margem adequada (10-20%)
- **95%:** Margem ideal (20-40%)

### Uso

```typescript
// Exemplo de uso
import { smartPricingService } from '@/services/ai/smartPricingService';

const recommendation = await smartPricingService.analyzeSmartPricing({
  productName: 'Smartphone Samsung',
  costPrice: 800,
  currentPrice: 1200,
  targetMargin: 30,
  taxRate: 18,
  marketplace: 'mercadolivre',
  category: 'eletronicos'
});

console.log(recommendation.recommendedPrice); // Preço sugerido
console.log(recommendation.confidence); // Nível de confiança
console.log(recommendation.reasoning); // Explicação
```

---

## 🔍 Análise Competitiva IA

### Visão Geral

Sistema de **monitoramento e análise inteligente** de concorrentes com alertas automáticos.

### Funcionalidades

#### Busca Automática
- Busca de preços em múltiplas fontes
- Atualização automática
- Score de confiança dos dados

#### Análise de Tendências
- Identificação de tendências de preço
- Padrões de variação
- Previsão de mudanças

#### Alertas
- **Preço muito alto:** >20% acima do menor concorrente
- **Preço muito baixo:** <10% do menor concorrente
- **Mudança de preço:** Alteração significativa detectada

#### Posicionamento
- Posição no ranking de preços
- Comparação com média do mercado
- Sugestões de ajuste

### Uso

```typescript
// Exemplo de uso
import { fetchCompetitorPrices, analyzeCompetitorAlerts } from '@/services/ai/competitorService';

// Buscar preços
const competitors = await fetchCompetitorPrices('Smartphone Samsung');

// Analisar alertas
const alerts = analyzeCompetitorAlerts(ourPrice, competitors);

alerts.forEach(alert => {
  console.log(alert.type); // Tipo de alerta
  console.log(alert.message); // Mensagem
  console.log(alert.severity); // Severidade
});
```

---

## 📋 Análise Tributária IA

### Visão Geral

Sistema de **otimização fiscal inteligente** com análise completa de regimes tributários e recomendações personalizadas.

### Funcionalidades

#### Análise Completa
1. **Análise do Regime Atual:**
   - Cálculo de impostos
   - Alíquota efetiva
   - Carga tributária

2. **Cenários Alternativos:**
   - Simulação de outros regimes
   - Comparação de custos
   - Análise de viabilidade

3. **Plano de Otimização:**
   - Recomendações personalizadas
   - Economia potencial
   - Passos para implementação

4. **Projeções Futuras:**
   - Previsão de impostos
   - Análise de tendências
   - Planejamento fiscal

#### Regimes Suportados
- **Simples Nacional**
- **Lucro Presumido**
- **Lucro Real**

### Uso

```typescript
// Exemplo de uso
import { advancedTaxService } from '@/services/ai/advancedTaxService';

const analysis = await advancedTaxService.performComprehensiveTaxAnalysis({
  id: 'business-1',
  revenue: 500000,
  currentRegime: 'simples_nacional',
  businessType: 'comercio',
  employees: 5
});

console.log(analysis.currentAnalysis); // Análise atual
console.log(analysis.scenarios); // Cenários alternativos
console.log(analysis.optimizationPlan); // Plano de otimização
console.log(analysis.forecast); // Projeções
```

---

## 📊 Insights de Mercado

### Visão Geral

Sistema de **análise de tendências e oportunidades** de mercado.

### Funcionalidades

- Análise de tendências
- Identificação de oportunidades
- Previsão de demanda
- Análise de sazonalidade
- Recomendações personalizadas

---

## 📈 Previsão de Demanda

### Visão Geral

Sistema de **análise preditiva** de vendas e demanda.

### Funcionalidades

- Previsão de demanda por produto
- Análise de padrões históricos
- Projeções futuras
- Alertas de variações

---

## 🌡️ Análise de Sazonalidade

### Visão Geral

Sistema de **identificação de padrões sazonais** para otimização de preços.

### Funcionalidades

- Identificação de padrões sazonais
- Análise de variações mensais
- Recomendações de ajuste de preço
- Previsão de sazonalidade futura

---

## 📦 Lote Inteligente + IA

### Visão Geral

Sistema de **precificação em lote** com análise competitiva e IA.

### Funcionalidades

- Importação de planilhas (CSV, Excel)
- Análise competitiva automática por categoria
- Sugestões de preço baseadas em IA para cada produto
- Simulação de cenários em massa
- Exportação de resultados

---

## 🔢 Limites e Custos

### Limites por Plano

| Plano | Consultas IA/mês | Modelo | Rate Limit |
|-------|------------------|--------|------------|
| Free | 0 | - | - |
| Essencial | 50 | GPT-3.5 | 5/min |
| PRO | Ilimitado | GPT-4 | 20/min |
| Enterprise | Ilimitado | GPT-4 | 50/min |

### Custos

- **Essencial:** Incluído (50 consultas/mês)
- **PRO:** Incluído (ilimitado)
- **Enterprise:** Incluído (ilimitado)

### Rate Limits

- **Essencial:** 5 requisições por minuto
- **PRO:** 20 requisições por minuto
- **Enterprise:** 50 requisições por minuto

---

## 🔗 Integração

### Botão Flutuante

O botão flutuante da IA está disponível em todas as páginas da plataforma.

### Calculadoras

As calculadoras incluem sugestões de IA durante os cálculos.

### Dashboard

O dashboard exibe insights e recomendações da IA.

### Marketplace

O marketplace inclui análise competitiva automática.

---

## 📝 Prompts e Modelos

### Modelos Utilizados

- **GPT-3.5:** Para planos Essencial
- **GPT-4:** Para planos PRO e Enterprise

### Prompts Principais

Os prompts são otimizados para:
- Contexto brasileiro (impostos, marketplaces)
- Linguagem natural em português
- Respostas práticas e acionáveis
- Personalização por tipo de negócio

---

## 🔄 Workflows

### Workflow de Precificação

1. Usuário solicita análise
2. Sistema coleta dados (custo, impostos, marketplace)
3. Busca preços da concorrência
4. Analisa mercado e sazonalidade
5. Gera recomendação com confiança
6. Apresenta resultado ao usuário

### Workflow de Análise Tributária

1. Usuário fornece dados do negócio
2. Sistema analisa regime atual
3. Gera cenários alternativos
4. Calcula economia potencial
5. Cria plano de otimização
6. Apresenta recomendações

---

## 💡 Exemplos de Uso

### Exemplo 1: Precificação de Produto

```
Usuário: "Quanto devo cobrar por um produto que custa R$ 100?"

IA: "Baseado no custo de R$ 100, impostos de 18% e margem desejada de 30%, 
sugiro o preço de R$ 152,17. Isso garante uma margem líquida de 30% após 
impostos e taxas."
```

### Exemplo 2: Análise Tributária

```
Usuário: "Qual o melhor regime tributário para meu negócio?"

IA: "Analisando seu faturamento de R$ 500.000/ano, recomendo o Simples Nacional 
com alíquota efetiva de 8,5%. Isso representa uma economia de R$ 15.000/ano 
comparado ao Lucro Presumido."
```

### Exemplo 3: Análise Competitiva

```
Usuário: "Como está meu preço comparado à concorrência?"

IA: "Seu preço de R$ 120 está 15% acima da média do mercado (R$ 104). 
Recomendo ajustar para R$ 110 para manter competitividade sem perder margem."
```

---

## 📚 Referências

- [README Principal](../README.md)
- [Planos e Assinatura](./PLANOS_E_ASSINATURA.md)
- [APIs e Endpoints](./APIS_E_ENDPOINTS.md)

---

**Fim da Documentação**

