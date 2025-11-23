# 🏛️ Licitações - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Dashboard de Licitações](#dashboard-de-licitações)
3. [Calculadora de Licitação](#calculadora-de-licitação)
4. [Gestão de Documentos](#gestão-de-documentos)
5. [Análise de Viabilidade](#análise-de-viabilidade)
6. [Ciclo de Vida](#ciclo-de-vida)
7. [Fluxos Principais](#fluxos-principais)

---

## 🎯 Visão Geral

O **Módulo de Licitações** do Azuria é uma solução completa para gestão e precificação de licitações públicas e privadas, incluindo calculadora avançada, dashboard analítico e sistema de documentos.

### Funcionalidades Principais

- ✅ Calculadora de licitação com fórmula por divisor
- ✅ Dashboard completo com estatísticas
- ✅ Gestão de documentos
- ✅ Análise de viabilidade automática
- ✅ Acompanhamento de ciclo de vida
- ✅ Modo leilão invertido
- ✅ 3 cenários automáticos (Alto, Médio, Baixo lucro)

**Acesso:** `/dashboard-licitacoes` e `/calculadora-licitacao`

---

## 📊 Dashboard de Licitações

### Estatísticas Gerais

- Total de projetos analisados
- Taxa de viabilidade (% de projetos viáveis)
- Margem média projetada
- Valor total em propostas
- Taxa de vitória
- Projetos por tipo
- Projetos por mês

### Ciclo de Vida dos Projetos

Distribuição dos projetos por fase:
- Rascunhos
- Em análise
- Em andamento
- Ganhos
- Perdidos

### Cards de Ciclo de Vida

Visualização clara do status de cada projeto com indicadores visuais.

---

## 🧮 Calculadora de Licitação

### Fórmula de Precificação por Divisor

Garante margem líquida real através da fórmula:

```
Preço = Custo Total / (1 - Margem Líquida% - Imposto%)
```

**Vantagem:** A margem líquida desejada é GARANTIDA no resultado final.

### 3 Cenários Automáticos

1. **Lucro Alto (30%):** Ideal para licitações técnicas ou de alto valor agregado
2. **Lucro Médio (20%):** Equilibrado para a maioria dos casos
3. **Lucro Baixo/Competitivo (10%):** Máximo de competitividade mantendo viabilidade

### Modo Leilão Invertido (Reverse Auction)

- Campo "Lance Atual do Concorrente"
- Comparação automática com ponto de equilíbrio (break-even)
- Feedback visual com emojis:
  - 🟢 **Verde:** Lance seguro, pode competir
  - 🟡 **Amarelo:** Lance próximo ao limite, atenção
  - 🟠 **Laranja:** Lance arriscado, margem crítica
  - 🔴 **Vermelho:** Lance inviável, prejuízo garantido

### Tipos de Licitação Suportados

- Pregão Eletrônico
- Pregão Presencial
- Concorrência
- Tomada de Preços
- Licitação Privada

### Cálculos com Precisão Decimal

- Utiliza **Decimal.js** para evitar erros de arredondamento
- Importante para valores grandes e margens estreitas
- Garantia de precisão em cálculos fiscais

---

## 📄 Gestão de Documentos

### Upload Centralizado

- Armazenamento seguro de certidões e documentos
- Suporte a múltiplos formatos
- Organização por categoria

### Alertas de Vencimento

- Notificações automáticas para renovação
- Configuração de alertas personalizados
- Status em tempo real

### Status dos Documentos

- ✅ Válidos
- ⚠️ Vencendo
- ❌ Vencidos

**Acesso:** `/documentos`

---

## ✅ Análise de Viabilidade

### Indicadores de Risco

- **Excelente:** Margem > 25%
- **Bom:** Margem 15-25%
- **Moderado:** Margem 10-15%
- **Crítico:** Margem 5-10%
- **Inviável:** Margem < 5%

### Cálculo Automático

- Análise de margem
- Análise de custos
- Análise de impostos
- Análise de garantias

---

## 🔄 Ciclo de Vida

### Fases do Processo

1. **Rascunho:** Projeto em criação
2. **Em Análise:** Sendo analisado
3. **Em Andamento:** Proposta enviada
4. **Ganho:** Projeto ganho
5. **Perdido:** Projeto perdido

### Acompanhamento

- Histórico completo de mudanças
- Notificações de atualizações
- Timeline de eventos

---

## 🔄 Fluxos Principais

### Fluxo 1: Criar Nova Licitação

1. Acesse `/calculadora-licitacao`
2. Preencha dados do projeto
3. Adicione itens
4. Configure impostos
5. Escolha estratégia
6. Calcule
7. Salve projeto

### Fluxo 2: Analisar Viabilidade

1. Acesse dashboard
2. Selecione projeto
3. Visualize análise de viabilidade
4. Ajuste se necessário
5. Salve alterações

### Fluxo 3: Gerenciar Documentos

1. Acesse `/documentos`
2. Faça upload de documentos
3. Configure alertas
4. Acompanhe vencimentos

---

## 📚 Referências

- [README Principal](../README.md)
- [Módulo de Licitação - Implementação](./MODULO_LICITACAO_IMPLEMENTACAO.md)

---

**Fim da Documentação**

