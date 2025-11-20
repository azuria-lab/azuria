# 📋 MÓDULO DE LICITAÇÃO - IMPLEMENTAÇÃO COMPLETA

## 🎯 VISÃO GERAL

Módulo completo de gestão e precificação de licitações públicas e privadas integrado ao Azuria, incluindo calculadora avançada, dashboard analítico e sistema de documentos.

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1️⃣ Calculadora de Licitação (`/calculadora-licitacao`)

#### **Fórmula de Precificação por Divisor**
Garante margem líquida real através da fórmula:

```
Preço = Custo Total / (1 - Margem Líquida% - Imposto%)
```

**Vantagem**: A margem líquida desejada é GARANTIDA no resultado final.

#### **3 Cenários Automáticos**
1. **Lucro Alto (30%)**: Ideal para licitações técnicas ou de alto valor agregado
2. **Lucro Médio (20%)**: Equilibrado para a maioria dos casos
3. **Lucro Baixo/Competitivo (10%)**: Máximo de competitividade mantendo viabilidade

#### **Modo Leilão Invertido (Reverse Auction)**
- Campo "Lance Atual do Concorrente"
- Comparação automática com ponto de equilíbrio (break-even)
- Feedback visual com emojis:
  - 🟢 **Verde**: Lance seguro, pode competir
  - 🟡 **Amarelo**: Lance próximo ao limite, atenção
  - 🟠 **Laranja**: Lance arriscado, margem crítica
  - 🔴 **Vermelho**: Lance inviável, prejuízo garantido

#### **Cálculos com Precisão Decimal**
- Utiliza **Decimal.js** para evitar erros de arredondamento
- Importante para valores grandes e margens estreitas
- Garantia de precisão em cálculos fiscais

---

### 2️⃣ Dashboard de Licitações (`/dashboard-licitacoes`)

#### **Estatísticas Gerais**
- Total de projetos analisados
- Taxa de viabilidade (% de projetos viáveis)
- Margem média projetada
- Valor total em propostas

#### **Ciclo de Vida dos Projetos**
- Em Aberto
- Vencedor
- Perdedor
- Arquivado

#### **Projetos Recentes**
- Lista dos últimos 5 projetos
- Badge de viabilidade com cores
- Link direto para edição
- Margem líquida e prazo visíveis

#### **Ações Rápidas**
- Nova Análise (botão primário)
- Simulador de Cenários (em breve)
- Análise de Concorrência (em breve)
- Histórico de Editais (em breve)

---

### 3️⃣ Módulo de Documentos (`/documentos`)

#### **Status Atual**: Página básica criada

#### **Estrutura Preparada**:
- Certidões Negativas (CND)
- Documentos da Empresa
- Habilitação Técnica

#### **Próximos Passos**:
- Upload de arquivos (Supabase Storage)
- Sistema de alertas de vencimento
- Integração com tabela `documentos`

---

## 📂 ARQUITETURA DO MÓDULO

### **Estrutura de Arquivos**

```
src/
├── components/
│   └── bidding/
│       └── BiddingCalculator.tsx (820 linhas) ✅
│
├── pages/
│   ├── BiddingCalculatorPage.tsx (63 linhas) ✅
│   ├── BiddingDashboardPage.tsx (390 linhas) ✅
│   └── DocumentosPage.tsx (70 linhas) ✅
│
├── services/
│   └── bidding/
│       └── biddingCalculations.ts (611 linhas) ✅
│
├── hooks/
│   ├── useBiddingCalculator.ts ✅
│   └── useBiddingCenter.ts ✅
│
├── types/
│   ├── bidding.ts (747 linhas) ✅
│   └── biddingCalculator.ts (166 linhas) ✅
│
└── __tests__/
    └── unit/
        └── utils/
            └── biddingCalculations.test.ts (293 linhas) ✅

supabase/
└── migrations/
    └── 20250119_create_documentos_table.sql ✅
```

---

## 🔧 TECNOLOGIAS UTILIZADAS

### **Frontend**
- **React 18** + **TypeScript**: Base do componente
- **Framer Motion**: Animações suaves
- **Shadcn UI**: Componentes consistentes
- **Lucide Icons**: Ícones modernos
- **React Hook Form**: Gerenciamento de formulários

### **Cálculos**
- **Decimal.js**: Precisão decimal garantida
- Fórmulas validadas por testes unitários

### **Backend**
- **Supabase**: PostgreSQL + Storage
- **RLS Policies**: Segurança por usuário
- **Triggers**: Auditoria automática

### **Testes**
- **Vitest**: Framework de testes
- **15 casos de teste** implementados
- Cobertura de funções críticas

---

## 🧮 FÓRMULAS E CÁLCULOS

### **1. Custo Total do Item**
```typescript
custoTotal = (
  custoUnitario +
  custoFabricacao +
  custoLogistica +
  custoAdministrativo +
  custoMaoDeObra +
  outrosCustos
) * quantidade
```

### **2. Impostos**
```typescript
// Simples Nacional
impostos = preço * alíquotaSN

// Lucro Presumido
impostos = preço * (PIS + COFINS + IRPJ + CSLL + ISS + ICMS)
```

### **3. Preço Sugerido (Fórmula Por Divisor)**
```typescript
preço = custoTotal / (1 - margemLiquida% - imposto%)
```

**Exemplo**:
- Custo: R$ 1.000,00
- Margem desejada: 20%
- Imposto: 8%
- Preço = 1.000 / (1 - 0,20 - 0,08) = R$ 1.388,89

**Validação**:
- Imposto: R$ 1.388,89 × 8% = R$ 111,11
- Lucro: R$ 1.388,89 - R$ 1.000 - R$ 111,11 = R$ 277,78
- Margem Real: R$ 277,78 / R$ 1.388,89 = **20%** ✅

### **4. Análise de Viabilidade**
```typescript
margemLiquida = (preço - custoTotal - impostos) / preço * 100

Níveis:
- EXCELENTE: > 20%
- BOM: 10% - 20%
- MODERADO: 5% - 10%
- CRÍTICO: 2% - 5%
- INVIÁVEL: < 2%
```

---

## 🚀 ROTAS CONFIGURADAS

```typescript
<Route path="/calculadora-licitacao" element={<BiddingCalculatorPage />} />
<Route path="/dashboard-licitacoes" element={<BiddingDashboardPage />} />
<Route path="/documentos" element={<DocumentosPage />} />
```

---

## 🎨 MENU DE NAVEGAÇÃO

```typescript
{
  to: "/dashboard-licitacoes",
  label: "Licitação",
  icon: <Gavel />,
  badge: "Novo",
  subLinks: [
    { to: "/dashboard-licitacoes", label: "Dashboard" },
    { to: "/calculadora-licitacao", label: "Calculadora" },
    { to: "/documentos", label: "Documentos" }
  ]
}
```

---

## ✅ TESTES IMPLEMENTADOS

### **Cobertura de Testes Unitários**
- ✅ Cálculo de custo total
- ✅ Cálculo de impostos (SN e LP)
- ✅ Fórmula por divisor
- ✅ Garantia de margem líquida
- ✅ Análise de viabilidade (5 níveis)
- ✅ Formatação de moeda
- ✅ Casos de uso reais

### **Executar Testes**
```bash
npm test
```

---

## 🔐 SEGURANÇA E DADOS

### **Supabase Setup**
```sql
-- Tabela de documentos
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tipo VARCHAR(50),
  numero VARCHAR(100),
  data_validade DATE,
  arquivo_url TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documentos FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 PRÓXIMAS FUNCIONALIDADES

### **Fase 2: Documentos Completos**
- Upload de arquivos (Supabase Storage)
- Alertas de vencimento (email/push)
- OCR para extração de dados
- Histórico de renovações

### **Fase 3: Inteligência**
- Leitura de edital com IA (Gemini Gratuito)
- Extração automática de requisitos
- Sugestões de estratégia
- Análise de risco

### **Fase 4: Crawler PNCP**
- Integração com API oficial do PNCP
- Busca automática de editais
- Notificações de oportunidades
- Histórico de resultados

---

## 📝 COMMITS RELACIONADOS

```bash
e06a157 - feat: adicionar rotas e navegacao do modulo de licitacao completo
a5936d4 - feat: adicionar rotas de licitacao no app.tsx
f9814e5 - feat: implementar modulo de licitacao completo
```

---

## 🎯 COMO USAR

### **1. Acessar Calculadora**
1. Clicar em "Licitação" no menu
2. Selecionar "Calculadora"
3. Preencher custos e dados do edital
4. Ver 3 cenários automáticos
5. (Opcional) Inserir lance do concorrente

### **2. Visualizar Dashboard**
1. Clicar em "Licitação" > "Dashboard"
2. Ver estatísticas gerais
3. Acessar projetos recentes
4. Criar nova análise

### **3. Gerenciar Documentos**
1. Clicar em "Licitação" > "Documentos"
2. (Em breve) Upload de certidões
3. (Em breve) Configurar alertas

---

## 🔗 REFERÊNCIAS

- **PNCP**: https://pncp.gov.br
- **Lei 14.133/2021**: Nova Lei de Licitações
- **Decreto 11.462/2023**: Regulamentação

---

**Desenvolvido por**: Equipe Azuria  
**Data**: Janeiro 2025  
**Versão**: 1.0.0

