# 🤖 AZURIA AI - ASSISTENTE INTELIGENTE DE PRECIFICAÇÃO

> **Status**: ✅ **IMPLEMENTADO E FUNCIONAL** (Beta)  
> **Data**: 20/01/2024  
> **Modelo**: Google Gemini 1.5 Pro (Free Tier)  
> **Custo**: R$ 0,00 (100% gratuito)

---

## 📋 ÍNDICE

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)

---

## 🎯 VISÃO GERAL

A **Azuria AI** é uma assistente virtual especializada em:

- 💰 **Precificação Inteligente**: Sugestões baseadas em custos, margens e competitividade
- 📊 **Análise Tributária**: Comparações entre regimes (Simples Nacional, Lucro Presumido, Lucro Real)
- 🎯 **Monitoramento de Concorrência**: Alertas de preços e tendências de mercado
- 📈 **Análise de Margens**: Identificação de oportunidades de otimização

### ✨ Diferenciais

- **Conversação Natural**: Interface de chat fluida e intuitiva
- **Respostas Rápidas**: ~2-3s de latência média
- **Zero Custo**: Modelo Gemini 1.5 Pro (Free Tier)
- **Modular**: Fácil trocar providers de IA
- **Contextual**: Mantém histórico da conversa

---

## 🏗️ ARQUITETURA

### **Diagrama de Componentes**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │  AzuriaPage.tsx  │         │ AzuriaChat.tsx   │    │
│  └────────┬─────────┘         └────────┬─────────┘    │
│           │                             │              │
│           └──────────┬──────────────────┘              │
│                      │                                 │
│           ┌──────────▼──────────┐                      │
│           │ useAzuriaChat Hook  │                      │
│           └──────────┬──────────┘                      │
│                      │                                 │
└──────────────────────┼─────────────────────────────────┘
                       │
                       │ Supabase Functions.invoke()
                       │
┌──────────────────────▼─────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         azuria-chat (Deno/TypeScript)            │  │
│  │  - Recebe mensagem do usuário                    │  │
│  │  - Prepara contexto e histórico                  │  │
│  │  - Chama Gemini API                              │  │
│  │  - Processa resposta                             │  │
│  │  - Salva log (ai_logs)                           │  │
│  └──────────────────┬───────────────────────────────┘  │
└────────────────────────┼───────────────────────────────┘
                         │
                         │ HTTPS POST
                         │
┌────────────────────────▼───────────────────────────────┐
│             GOOGLE GEMINI 1.5 PRO API                   │
└─────────────────────────────────────────────────────────┘
```

### **Services Modulares**

```typescript
src/services/ai/
├── chatService.ts          // Comunicação com Edge Function
├── pricingService.ts       // Cálculos de precificação
├── taxService.ts           // Análises tributárias
└── competitorService.ts    // Monitoramento (simulado)
```

---

## ⚙️ FUNCIONALIDADES

### 1. **Chat Inteligente**

- ✅ Interface de chat fluida com `react-markdown`
- ✅ Histórico persistente (localStorage)
- ✅ Indicador de "digitando" com animação
- ✅ Quick Actions (ações rápidas sugeridas)
- ✅ Badges por tipo de mensagem

### 2. **Precificação**

```typescript
// Exemplo de uso
import { getIdealSellingPrice } from '@/services/ai/pricingService';

const analysis = getIdealSellingPrice({
  item: myBiddingItem,
  desiredProfitMargin: 0.20, // 20%
  taxConfig: myTaxConfig,
  strategy: 'max_profit', // ou 'competitive'
});

console.log(analysis.suggestedPrice); // R$ 150.00
console.log(analysis.profitMargin); // 0.20
console.log(analysis.reasoning); // "Para maximizar lucro..."
```

### 3. **Análise Tributária**

```typescript
import { calculateTaxAnalysis } from '@/services/ai/taxService';

const taxAnalysis = calculateTaxAnalysis(10000, 'simples_nacional');

console.log(taxAnalysis.effective_rate); // 8.0%
console.log(taxAnalysis.tax_amount); // R$ 800.00
console.log(taxAnalysis.optimization_tips); // ["💡 Mantenha faturamento abaixo..."]
```

### 4. **Monitoramento de Concorrência** (Simulado)

```typescript
import { fetchCompetitorPrices } from '@/services/ai/competitorService';

const competitors = await fetchCompetitorPrices('Produto X');
// Retorna dados simulados (versão beta)
// Futuro: integração com ScraperAPI, Bright Data, etc.
```

---

## 📂 ESTRUTURA DE ARQUIVOS

```
azuria/
├── src/
│   ├── pages/
│   │   └── AzuriaPage.tsx                  # Página principal
│   ├── components/
│   │   └── ai/
│   │       ├── AzuriaChat.tsx              # Componente de chat
│   │       └── AzuriaAvatar.tsx            # Avatar animado
│   ├── hooks/
│   │   └── useAzuriaChat.ts                # Hook do chat
│   ├── services/
│   │   └── ai/
│   │       ├── chatService.ts              # Serviço de chat
│   │       ├── pricingService.ts           # Precificação
│   │       ├── taxService.ts               # Tributação
│   │       └── competitorService.ts        # Concorrência
│   └── types/
│       └── azuriaAI.ts                     # Types/Interfaces
├── supabase/
│   ├── functions/
│   │   └── azuria-chat/
│   │       └── index.ts                    # Edge Function
│   └── migrations/
│       └── 20240120_create_ai_logs.sql     # Tabela de logs
└── AZURIA_AI_IMPLEMENTATION.md             # Esta documentação
```

---

## 🔧 CONFIGURAÇÃO

### **1. Configurar Gemini API Key**

1. Acesse: https://aistudio.google.com/app/apikey
2. Gere uma API Key gratuita
3. No Supabase Dashboard → Edge Functions → Secrets:

```bash
GEMINI_API_KEY=sua_chave_aqui
```

### **2. Deploy da Edge Function**

```bash
supabase functions deploy azuria-chat
```

### **3. Executar Migration**

```bash
supabase db push
```

ou manualmente no SQL Editor:

```sql
-- Colar conteúdo de supabase/migrations/20240120_create_ai_logs.sql
```

### **4. Testar**

1. Acesse: `http://localhost:5173/azuria`
2. Envie uma mensagem: "Sugira um preço para meu produto"
3. Aguarde resposta da Azuria

---

## 🚀 COMO USAR

### **1. Página Dedicada**

```
/azuria
```

### **2. Chat Standalone (Futuro)**

```tsx
import { AzuriaChat } from '@/components/ai/AzuriaChat';

<AzuriaChat className="h-[500px]" />
```

### **3. Avatar (Futuro - Floating Widget)**

```tsx
import { AzuriaAvatar } from '@/components/ai/AzuriaAvatar';

<AzuriaAvatar
  size="large"
  isThinking={true}
  emotion="excited"
/>
```

---

## 📚 API REFERENCE

### **Edge Function: azuria-chat**

**Endpoint**: `supabase.functions.invoke('azuria-chat')`

**Request Body**:

```typescript
{
  message: string;
  context: {
    user_id: string;
    session_id: string;
    user_preferences?: {
      tax_regime?: string;
      target_margin?: number;
    };
  };
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response**:

```typescript
{
  message: string;
  type: 'text' | 'pricing_suggestion' | 'tax_analysis' | 'competitor_alert';
  context: 'general' | 'pricing' | 'tax' | 'competitor';
  suggestions?: string[];
  quick_actions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
}
```

---

## 🗺️ ROADMAP

### **Fase 1: MVP** ✅ CONCLUÍDO

- [x] Arquitetura modular
- [x] Integração com Gemini 1.5 Pro
- [x] Interface de chat
- [x] Serviços de precificação e tributação
- [x] Logging de interações
- [x] Rota e navegação

### **Fase 2: Melhorias de UX** 🚧 EM ANDAMENTO

- [ ] Floating widget (chat minimizado)
- [ ] Voice input (comando por voz)
- [ ] Sugestões contextuais automáticas
- [ ] Temas personalizados para avatar

### **Fase 3: Integrações Reais** 📋 PLANEJADO

- [ ] API de web scraping (ScraperAPI/Bright Data)
- [ ] Integração com Mercado Livre API
- [ ] Integração com marketplaces B2B
- [ ] Dashboard de análise competitiva

### **Fase 4: Inteligência Avançada** 🔮 FUTURO

- [ ] Predições de preços com ML
- [ ] Análise de sentimento de reviews
- [ ] Recomendações proativas
- [ ] Multi-idioma

---

## 🛡️ SEGURANÇA

### **Boas Práticas Implementadas**

1. ✅ **API Key no Backend**: Gemini key nunca exposta no frontend
2. ✅ **Autenticação Obrigatória**: Requer `Authorization` header
3. ✅ **RLS no Supabase**: Usuários só veem seus próprios logs
4. ✅ **Rate Limiting** (implícito no Gemini Free Tier)
5. ✅ **Input Sanitization** (Gemini Safety Settings)

### **Limites do Free Tier**

- 15 requisições/minuto
- 1.500 requisições/dia
- 1.5M tokens/dia

> 💡 Para produção em escala, considerar Gemini Pro pago ou Claude Sonnet.

---

## 🐛 TROUBLESHOOTING

### **Erro: "Gemini API Error"**

- ✅ Verificar se `GEMINI_API_KEY` está configurada
- ✅ Verificar se key não expirou
- ✅ Verificar limites do Free Tier

### **Erro: "Não autorizado"**

- ✅ Verificar se usuário está logado
- ✅ Verificar se `Authorization` header está presente

### **Chat não responde**

- ✅ Verificar console do navegador (erros JS)
- ✅ Verificar logs da Edge Function: `supabase functions logs azuria-chat`
- ✅ Verificar network tab (request/response)

---

## 📞 SUPORTE

- **Documentação**: Este arquivo
- **Issues**: GitHub Issues (quando criado)
- **Email**: [seu-email@azuria.com]

---

## 📝 LICENÇA

Propriedade da **Azuria Precificação Inteligente**.  
Todos os direitos reservados © 2024

---

**🚀 A Azuria AI está pronta para revolucionar sua precificação!** 🎉

