# ConsciousnessCore - Sistema Cognitivo do Modo Deus 🧠

## Visão Geral

O `ConsciousnessCore` é o **núcleo central** do Modo Deus do Azuria. Ele implementa uma arquitetura cognitiva completa que:

- **Percebe** eventos do sistema através do `PerceptionGate`
- **Decide** como responder através do `DecisionEngine`
- **Controla** saídas através do `OutputGate`
- **Aprende** com feedback através do `FeedbackLearning`
- **Integra IA** através do `AIRouter` e `GeminiIntegration`

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    ConsciousnessCore                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   GlobalState                            │ │
│  │  - Identity (role, tier, skill)                         │ │
│  │  - CurrentMoment (screen, action, silence)              │ │
│  │  - CommunicationMemory (sent, blocked)                  │ │
│  │  - SystemHealth (score, errors, AI status)              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────┐    ┌──────▼──────┐    ┌────────────────────┐ │
│  │EventBridge │───▶│Perception   │───▶│DecisionEngine      │ │
│  │(eventos)   │    │Gate (filtro)│    │(regras + IA)       │ │
│  └────────────┘    └─────────────┘    └────────┬───────────┘ │
│                                                │              │
│  ┌────────────────────────────────────────────▼────────────┐ │
│  │                    OutputGate                            │ │
│  │  - Anti-spam (rate limit, semantic hash)                │ │
│  │  - Silêncio (topic block, global silence)               │ │
│  │  - TTL e priorização                                    │ │
│  └────────────────────────────────────────────┬────────────┘ │
│                                                │              │
│  ┌────────────────────────────────────────────▼────────────┐ │
│  │                 CommunicationMemory                      │ │
│  │  - Histórico de mensagens                               │ │
│  │  - Hash semântico para deduplicação                     │ │
│  │  - Feedback tracking                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
consciousness/
├── index.ts                    # Exports principais
├── types.ts                    # Tipos TypeScript
├── ConsciousnessCore.ts        # Núcleo central
├── GlobalState.ts              # Estado global
├── PerceptionGate.ts           # Filtro de relevância
├── DecisionEngine.ts           # Motor de decisões
├── OutputGate.ts               # Controle de saída
├── CommunicationMemory.ts      # Memória de comunicação
├── AIRouter.ts                 # Roteador de IA
├── EventBridge.ts              # Ponte com EventBus
├── EngineAdapter.ts            # Adaptadores de engines
├── ConsciousnessProvider.tsx   # Provider React
│
├── rules/                      # Regras de decisão
│   ├── index.ts
│   ├── calculationRules.ts     # Regras para cálculos
│   └── navigationRules.ts      # Regras para navegação
│
├── templates/                  # Templates de mensagens
│   ├── index.ts
│   └── MessageTemplates.ts     # Templates por contexto
│
├── persistence/                # Persistência
│   ├── index.ts
│   └── SupabasePersistence.ts  # Integração Supabase
│
├── learning/                   # Aprendizado
│   ├── index.ts
│   └── FeedbackLearning.ts     # Sistema de feedback
│
├── ai/                         # Integração IA
│   ├── index.ts
│   └── GeminiIntegration.ts    # Google Gemini
│
└── components/                 # Componentes React
    ├── index.ts
    ├── ConsciousnessToast.tsx  # Toast de mensagens
    ├── ConsciousnessStatus.tsx # Status do sistema
    └── AdminDashboard.tsx      # Dashboard ADMIN
```

## Uso Básico

### 1. Provider

```tsx
import { ConsciousnessProvider } from '@/azuria_ai/consciousness';

function App() {
  return (
    <ConsciousnessProvider autoInitialize>
      <YourApp />
      <ConsciousnessToast position="top-right" />
    </ConsciousnessProvider>
  );
}
```

### 2. Hook

```tsx
import { useConsciousnessContext } from '@/azuria_ai/consciousness';

function MyComponent() {
  const { 
    activeMessages, 
    send, 
    dismiss,
    userRole,
    silenced,
  } = useConsciousnessContext();

  // Enviar evento
  const handleCalculate = (data) => {
    send('calc:completed', data);
  };

  // Dispensar mensagem
  const handleDismiss = (messageId) => {
    dismiss(messageId);
  };

  return (
    // ...
  );
}
```

### 3. API Legada (Compatibilidade)

```tsx
// Continua funcionando
import { useModeDeus } from '@/azuria_ai';

function OldComponent() {
  const { 
    initialized, 
    processContext, 
    processNaturalInput 
  } = useModeDeus();
  
  // API antiga ainda funciona
}
```

## Fluxo de Eventos

```
1. Evento Gerado (calc:completed, user:navigation, etc.)
         │
         ▼
2. EventBridge intercepta
         │
         ▼
3. ConsciousnessCore.receiveEvent()
         │
         ▼
4. PerceptionGate.evaluate()
   - Filtra ruído
   - Classifica por papel (ADMIN/USER)
   - Verifica relevância
         │
         ▼
5. DecisionEngine.decide()
   - Consulta regras
   - Opcionalmente usa IA (Gemini)
   - Determina ação: emit, silence, delegate, escalate
         │
         ▼
6. OutputGate.attemptOutput()
   - Verifica rate limit
   - Verifica hash semântico
   - Verifica silêncio de tópico
   - Verifica silêncio global
         │
         ▼
7. Emissão para UI (se aprovado)
   - Atualiza CommunicationMemory
   - Notifica listeners
   - Persiste (opcional)
```

## Regras de Decisão

### Regras de Cálculo

| Regra | Condição | Ação |
|-------|----------|------|
| `calc_margin_critical` | Margem < 5% | Warning alta prioridade |
| `calc_margin_tight` | Margem 5-10% | Insight médio |
| `calc_markup_high` | Markup > 200% | Insight baixo |
| `calc_operational_high` | OPEX > 25% | Tip médio |
| `calc_success_healthy` | Margem 15-40% | Confirmação |
| `calc_input_changed` | Input alterado | Silêncio |

### Regras de Navegação

| Regra | Condição | Ação |
|-------|----------|------|
| `nav_first_visit` | Primeira visita | Tip contextual |
| `nav_quick_bounce` | Saída rápida | Oferecer ajuda |
| `nav_suggest_next_step` | Após cálculos | Sugerir salvar |

## Templates de Mensagens

Os templates são adaptados ao nível de skill do usuário:

```typescript
// Template de margem crítica
CALC_TEMPLATES.MARGIN_CRITICAL = {
  messages: {
    beginner: 'Atenção! Sua margem de lucro está em {{margin}}, o que é muito baixo...',
    intermediate: 'Margem de {{margin}} está abaixo do mínimo seguro (5%)...',
    advanced: 'Margem {{margin}} crítica. Break-even em risco...',
    expert: 'Margem {{margin}} - abaixo do threshold...',
  }
}
```

## Anti-Spam

O `OutputGate` implementa múltiplas camadas de proteção:

1. **Rate Limit por Papel**
   - USER: 3 mensagens/minuto
   - ADMIN: 10 mensagens/minuto

2. **Hash Semântico**
   - Evita mensagens idênticas em 5 minutos

3. **Bloqueio de Tópico**
   - Tópico dispensado fica bloqueado por 5 minutos

4. **Silêncio Global**
   - Usuário pode silenciar todas as mensagens

5. **Silêncio por Digitação**
   - Silencia durante input ativo

## Integração com IA

### Gemini Flash 2.5

O sistema usa **Gemini Flash 2.5** via Supabase Edge Function (recomendado) ou API direta (fallback).

**Configuração:**
- **Recomendado**: Via Supabase Edge Function (`azuria-chat`)
  - API Key segura armazenada nos Secrets do Supabase
  - Modelo: `gemini-2.5-flash`
  - Usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- **Fallback**: API direta (não recomendado em produção)
  - API Key via variável de ambiente: `VITE_GEMINI_API_KEY`
  - Modelo padrão: `gemini-2.5-flash`

```typescript
import { analyzeContext, generateResponse } from '@/azuria_ai/consciousness/ai';

// Análise de contexto
const result = await analyzeContext({
  screen: '/calculadora',
  calculationData: { margem: 5, custo: 100 },
  skillLevel: 'intermediate',
  role: 'USER',
});

// Resposta conversacional
const response = await generateResponse(
  'Como posso melhorar minha margem?',
  { screen: '/calculadora' }
);
```

### Fallback

Hierarquia de fallback:
1. **Gemini Flash 2.5** - Principal para todas as análises (rápidas e profundas)
2. **Regras locais** - Fallback quando IA externa não está disponível

## Persistência

```typescript
import { 
  initPersistence, 
  persistMessage,
  loadPreferences 
} from '@/azuria_ai/consciousness/persistence';

// Inicializar
initPersistence(SUPABASE_URL, SUPABASE_KEY, userId);

// Carregar preferências
const prefs = await loadPreferences();

// Mensagens são persistidas automaticamente
```

## Dashboard ADMIN

O `AdminDashboard` fornece:

- **Saúde do Sistema**: Score geral, erros, engines ativos
- **Taxa de Aceitação**: Feedback dos usuários
- **Decisões**: Emitidas vs silenciadas
- **Modelos de IA**: Status Gemini
- **Aprendizado**: Tópicos preferidos/evitados

## Métricas Disponíveis

```typescript
import { 
  getDecisionStats,
  getOutputStats,
  getLearningStats,
  getGeminiStats 
} from '@/azuria_ai/consciousness';

// Estatísticas de decisão
const decisions = getDecisionStats();
// { emit: 45, silence: 120, delegate: 5, escalate: 2 }

// Estatísticas de output
const output = getOutputStats();
// { totalEmitted: 45, totalSilenced: 120, silenceReasons: {...} }

// Estatísticas de aprendizado
const learning = getLearningStats();
// { totalFeedback: 200, acceptanceRate: 0.65, preferredTopics: [...] }
```

## Diferenciação ADMIN vs USER

| Aspecto | USER | ADMIN |
|---------|------|-------|
| Rate Limit | 3/min | 10/min |
| Detalhamento | Adaptativo | Completo |
| Alertas Sistema | Filtrados | Todos |
| Dashboard | Não | Sim |
| Escalação | Recebe | Trata |

## Configuração

```typescript
initConsciousness({
  userId: 'user-123',
  role: 'USER',
  tier: 'PRO',
  config: {
    enabled: true,
    debug: false,
    rateLimit: {
      maxUserInsightsPerMinute: 5,
      maxAdminInsightsPerMinute: 10,
      dismissCooldown: 30000,
    },
    silence: {
      defaultTopicBlockDuration: 300000, // 5 min
      typingSilenceDuration: 5000,
      errorSilenceDuration: 10000,
    },
    ai: {
      useAI: true,
      preferredModel: 'gemini',
      aiTimeout: 10000,
    },
  },
});
```

## Contribuindo

Para adicionar novas regras de decisão:

1. Crie a regra em `rules/`
2. Exporte em `rules/index.ts`
3. A regra será registrada automaticamente

Para adicionar novos templates:

1. Adicione em `templates/MessageTemplates.ts`
2. Use `renderTemplate()` para gerar mensagens

---

**Versão**: 2.0.0  
**Última Atualização**: Dezembro 2024
