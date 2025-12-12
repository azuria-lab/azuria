---
title: "O Livro Mestre - Modo Deus v1.0"
date: 2025-12-11
version: 1.0.0
author: Azuria Team
status: Produção
---

# 📖 O LIVRO MESTRE - Modo Deus v1.0

> Documentação Técnica Completa do Cérebro Central Inteligente do Azuria

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Arquitetura Geral](#2-arquitetura-geral)
3. [Catálogo de Engines](#3-catálogo-de-engines)
4. [Sistema de Eventos](#4-sistema-de-eventos)
5. [Persistência](#5-persistência)
6. [APIs Disponíveis](#6-apis-disponíveis)
7. [Componentes UI](#7-componentes-ui)
8. [React Hooks](#8-react-hooks)
9. [Testes](#9-testes)
10. [Configuração](#10-configuração)
11. [Troubleshooting](#11-troubleshooting)
12. [Roadmap](#12-roadmap)
13. [Referências](#13-referências)

---

## 1. Sumário Executivo

### O que é o Modo Deus?

O **Modo Deus** é a camada de inteligência artificial autônoma do Azuria, operando como um "cérebro central" que:

- **Observa** ações do usuário em tempo real
- **Entende** contexto e intenções
- **Analisa** padrões e identifica oportunidades/riscos
- **Age** proativamente com sugestões e alertas

### Níveis de Operação

```
┌─────────────────────────────────────────────────────────────┐
│                    MODO DEUS v1.0                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🏢 NÍVEL ESTRATÉGICO (ADMIN)                              │
│   └── Dashboard do Criador                                  │
│       ├── Insights de negócio                               │
│       ├── Governança e segurança                            │
│       ├── Análise de riscos                                 │
│       └── Evolução do sistema                               │
│                                                             │
│   👤 NÍVEL OPERACIONAL (USUÁRIO)                            │
│   └── Co-Piloto Inteligente                                 │
│       ├── Sugestões contextuais                             │
│       ├── Explicações em português                          │
│       ├── Tutoriais interativos                             │
│       └── Assistente de licitações                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estatísticas v1.0

| Métrica | Valor |
|---------|-------|
| Engines Implementados | 65 |
| Testes Automatizados | 219 ✅ |
| Tabelas Supabase | 8 |
| Níveis no Manifest | 50 |
| Tipos de Eventos | 24+ |
| Hooks React | 8 |
| Componentes UI | 12 |

---

## 2. Arquitetura Geral

### Diagrama Conceitual

```
┌─────────────────────────────────────────────────────────────┐
│                    MODO DEUS v1.0                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PERCEPTION LAYER                        │   │
│  │  UIWatcher │ CalcWatcher │ NavWatcher │ FormWatcher  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              EVENT BUS (Sistema Nervoso)             │   │
│  │         admin:* │ user:* │ system:*                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         ▼                ▼                ▼                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  STRATEGIC  │  │   SHARED    │  │ OPERATIONAL │        │
│  │   (ADMIN)   │  │    CORE     │  │   (USER)    │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ Creator     │  │ Truth       │  │ Operational │        │
│  │ Governance  │  │ Evolution   │  │ UserContext │        │
│  │ RiskAnalyz  │  │ Coherence   │  │ Explanation │        │
│  │ TechDebt    │  │ Perception  │  │ Bidding     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AUTO-EVOLUTION LAYER                    │   │
│  │  FeedbackLoop │ PatternLearning │ Personalization   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
src/azuria_ai/
├── core/                        # Núcleo do sistema
│   ├── ModeDeusOrchestrator.ts  # Orquestrador central
│   ├── eventBus.ts              # Barramento de eventos
│   ├── adminGuard.ts            # Proteção de APIs admin
│   ├── contextStore.ts          # Store de contexto
│   └── sseManager.ts            # Server-Sent Events
│
├── engines/                     # 65 engines de IA
│   ├── nlpProcessorEngine.ts    # Processamento de linguagem
│   ├── predictiveEngine.ts      # Predição de ações
│   ├── proactiveAssistant.ts    # Sugestões proativas
│   ├── feedbackLoopEngine.ts    # Loop de feedback
│   ├── explanationEngine.ts     # Explicações contextuais
│   ├── biddingAssistantEngine.ts# Assistente de licitações
│   └── ... (mais 59 engines)
│
├── hooks/                       # React Hooks
│   ├── useCoPilot.ts            # Hook principal do Co-Piloto
│   ├── useAIContext.ts          # Contexto de IA
│   └── useCalcWatcher.ts        # Observador de cálculos
│
├── providers/                   # Context Providers
│   ├── ModeDeusProvider.tsx     # Provider global
│   └── AzuriaAIProvider.tsx     # Provider legado
│
├── types/                       # Definições TypeScript
│   ├── events.ts                # Tipos de eventos
│   ├── suggestions.ts           # Tipos de sugestões
│   └── engines.ts               # Tipos de engines
│
├── ui/                          # Componentes visuais
│   ├── CoPilot.tsx              # Widget do Co-Piloto
│   ├── AzuriaBubble.tsx         # Indicador de status
│   └── InsightToast.tsx         # Notificações
│
├── manifest/                    # Manifest de 50 níveis
│   └── index.ts                 # Definições de níveis
│
└── events/                      # Re-exports de eventos
    └── eventBus.ts              # Compatibilidade
```

---

## 3. Catálogo de Engines

### 3.1 Engines Estratégicos (ADMIN)

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **CreatorEngine** | `creatorEngine.ts` | Alertas e insights para o criador do sistema |
| **GovernanceEngine** | `governanceEngine.ts` | Segurança, compliance e governança |
| **StrategicEngine** | `strategicEngine.ts` | Análise estratégica de negócios |
| **TruthEngine** | `truthEngine.ts` | Validação de dados e coerência |
| **CoherenceEngine** | `coherenceEngine.ts` | Coerência entre módulos |
| **PerceptionEngine** | `perceptionEngine.ts` | Percepção de eventos do sistema |
| **DecisionAuditEngine** | `decisionAuditEngine.ts` | Auditoria de decisões da IA |
| **EthicalGuardEngine** | `ethicalGuardEngine.ts` | Guardrails éticos |

### 3.2 Engines Operacionais (USUÁRIO)

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **OperationalAIEngine** | `operationalAIEngine.ts` | Core do Co-Piloto |
| **UserContextEngine** | `userContextEngine.ts` | Detecção de skill level e contexto |
| **UIWatcherEngine** | `uiWatcherEngine.ts` | Monitoramento de interações da UI |
| **SuggestionThrottler** | `suggestionThrottler.ts` | Controle inteligente de frequência |
| **ExplanationEngine** | `explanationEngine.ts` | Explicações contextuais em português |
| **BiddingAssistantEngine** | `biddingAssistantEngine.ts` | Assistente de licitações e BDI |
| **TutorialEngine** | `tutorialEngine.ts` | Tutoriais interativos com conquistas |

### 3.3 Engines de Auto-Evolução

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **FeedbackLoopEngine** | `feedbackLoopEngine.ts` | Coleta e análise de feedback |
| **PatternLearningEngine** | `patternLearningEngine.ts` | Aprendizado de padrões de uso |
| **PersonalizationEngine** | `personalizationEngine.ts` | Personalização por comportamento |
| **AdaptiveEngine** | `adaptiveEngine.ts` | Adaptação dinâmica |
| **ContinuousImprovementEngine** | `continuousImprovementEngine.ts` | Melhoria contínua |

### 3.4 Engines de Inteligência Avançada

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **NLPProcessorEngine** | `nlpProcessorEngine.ts` | Processamento de linguagem natural |
| **PredictiveEngine** | `predictiveEngine.ts` | Predição de ações do usuário |
| **ProactiveAssistant** | `proactiveAssistant.ts` | Sugestões proativas inteligentes |
| **CognitiveEngine** | `cognitiveEngine.ts` | Processamento cognitivo |
| **UserIntentEngine** | `userIntentEngine.ts` | Detecção de intenção |

### 3.5 Engines de Personalidade e Comunicação

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **PersonalityEngine** | `personalityEngine.ts` | Personalidade da IA |
| **BrandVoiceEngine** | `brandVoiceEngine.ts` | Tom de voz da marca |
| **StorytellingEngine** | `storytellingEngine.ts` | Narrativa contextual |
| **AffectiveEngine** | `affectiveEngine.ts` | Computação afetiva |
| **SocialPresenceEngine** | `socialPresenceEngine.ts` | Presença social |
| **EngagementEngine** | `engagementEngine.ts` | Engajamento do usuário |

### 3.6 Engines de Segurança e Confiabilidade

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **SafetyLimitsEngine** | `safetyLimitsEngine.ts` | Limites de segurança |
| **SafeActionEngine** | `safeActionEngine.ts` | Ações seguras |
| **SafetyAndReliabilityEngine** | `safetyAndReliabilityEngine.ts` | Confiabilidade |
| **StabilityEngine** | `stabilityEngine.ts` | Estabilidade do sistema |
| **ConsistencyEngine** | `consistencyEngine.ts` | Consistência de respostas |

### 3.7 Engines de Análise e Monitoramento

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **PerformanceMonitorEngine** | `performanceMonitorEngine.ts` | Monitoramento de performance |
| **MarketIntelligenceEngine** | `marketIntelligenceEngine.ts` | Inteligência de mercado |
| **RevenueIntelligenceEngine** | `revenueIntelligenceEngine.ts` | Inteligência de receita |
| **PredictiveInsightEngine** | `predictiveInsightEngine.ts` | Insights preditivos |

### 3.8 Engines Especializados

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **SmartPaywallEngine** | `smartPaywallEngine.ts` | Paywall inteligente |
| **AutoOptimizerEngine** | `autoOptimizerEngine.ts` | Otimização automática |
| **AutonomousActionsEngine** | `autonomousActionsEngine.ts` | Ações autônomas |
| **MetaPlannerEngine** | `metaPlannerEngine.ts` | Planejamento meta |
| **TemporalEngine** | `temporalEngine.ts` | Análise temporal |
| **RealityEngine** | `realityEngine.ts` | Validação de realidade |

### 3.9 Engines de Estado e Contexto

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **HolisticStateEngine** | `holisticStateEngine.ts` | Estado holístico |
| **OperationalStateEngine** | `operationalStateEngine.ts` | Estado operacional |
| **ContextRebuilder** | `contextRebuilder.ts` | Reconstrução de contexto |
| **IntegratedCoreEngine** | `integratedCoreEngine.ts` | Core integrado |
| **SystemMindEngine** | `systemMindEngine.ts` | Mente do sistema |

### 3.10 Engines de UX Adaptativo

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **AdaptiveUXEngine** | `adaptiveUXEngine.ts` | UX adaptativo |
| **BehaviorEngine** | `behaviorEngine.ts` | Análise de comportamento |
| **CognitiveExpansionEngine** | `cognitiveExpansionEngine.ts` | Expansão cognitiva |
| **CognitiveGovernanceEngine** | `cognitiveGovernanceEngine.ts` | Governança cognitiva |

### 3.11 Adapters Externos

| Engine | Arquivo | Descrição |
|--------|---------|-----------|
| **GeminiAdapter** | `geminiAdapter.ts` | Integração com Google Gemini |
| **NimAdapter** | `nimAdapter.ts` | Integração com NVIDIA NIM |

### 3.12 Profiles e Configurações

| Arquivo | Descrição |
|---------|-----------|
| `brandToneProfiles.ts` | Perfis de tom de marca |
| `emotionProfiles.ts` | Perfis de emoção |
| `personaProfiles.ts` | Perfis de persona |
| `storyProfiles.ts` | Perfis de storytelling |

---

## 4. Sistema de Eventos

### 4.1 EventBus

O EventBus é o "sistema nervoso" do Modo Deus, permitindo comunicação desacoplada entre componentes.

```typescript
import { eventBus, on, off, emit } from '@/azuria_ai/core/eventBus';

// Emitir evento
emit('user:suggestion', {
  id: 'sug_001',
  type: 'tip',
  message: 'Dica útil aqui',
});

// Subscrever
const subId = on('user:suggestion', (event) => {
  console.log('Nova sugestão:', event.data);
});

// Cancelar subscrição
off(subId);
```

### 4.2 Canais de Eventos

| Canal | Namespace | Descrição |
|-------|-----------|-----------|
| **Admin** | `admin:*` | Eventos do Dashboard do Criador |
| **User** | `user:*` | Eventos do Co-Piloto |
| **System** | `system:*` | Eventos internos do sistema |

### 4.3 Eventos Principais

#### Canal Admin (`admin:*`)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `admin:insight` | `{ type, title, message, severity }` | Novo insight gerado |
| `admin:alert` | `{ type, message, priority }` | Alerta do sistema |
| `admin:governance-alert` | `{ rule, violation, action }` | Alerta de governança |
| `admin:evolution-report` | `{ metrics, recommendations }` | Relatório de evolução |

#### Canal User (`user:*`)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `user:suggestion` | `{ id, type, message, priority }` | Nova sugestão |
| `user:suggestion-accepted` | `{ id, feedback }` | Sugestão aceita |
| `user:suggestion-dismissed` | `{ id, reason }` | Sugestão dispensada |
| `user:context-updated` | `{ screen, action, data }` | Contexto atualizado |
| `user:skill-detected` | `{ level, confidence }` | Nível de skill detectado |
| `user:tutorial-completed` | `{ tutorialId, score }` | Tutorial concluído |

#### Canal System (`system:*`)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `system:evolution-cycle` | `{ cycle, metrics }` | Ciclo de evolução |
| `system:pattern-detected` | `{ pattern, confidence }` | Padrão detectado |
| `system:error` | `{ code, message, stack }` | Erro do sistema |
| `system:health-check` | `{ status, engines }` | Health check |

---

## 5. Persistência

### 5.1 Tabelas Supabase

O Modo Deus utiliza 8 tabelas no Supabase para persistência:

#### Tabela: `user_suggestions`
Armazena sugestões do Co-Piloto.

```sql
CREATE TABLE user_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `suggestion_feedback`
Feedback das sugestões.

```sql
CREATE TABLE suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES user_suggestions(id),
  user_id UUID REFERENCES auth.users(id),
  feedback_type VARCHAR(20) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `user_copilot_preferences`
Preferências do usuário para o Co-Piloto.

```sql
CREATE TABLE user_copilot_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'balanced',
  enabled_types TEXT[] DEFAULT ARRAY['tip', 'suggestion', 'warning'],
  quiet_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `user_behavior_patterns`
Padrões de comportamento detectados.

```sql
CREATE TABLE user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  confidence DECIMAL(3,2),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `user_skill_metrics`
Métricas de habilidade do usuário.

```sql
CREATE TABLE user_skill_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  skill_area VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL,
  score DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `user_tutorial_progress`
Progresso em tutoriais.

```sql
CREATE TABLE user_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tutorial_id VARCHAR(50) NOT NULL,
  step_completed INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `user_achievements`
Conquistas desbloqueadas.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### Tabela: `user_personalization`
Perfil de personalização.

```sql
CREATE TABLE user_personalization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  preferred_tone VARCHAR(20) DEFAULT 'friendly',
  preferred_detail_level VARCHAR(20) DEFAULT 'balanced',
  interests TEXT[],
  goals TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Migrações

| Arquivo | Descrição |
|---------|-----------|
| `20250614_create_user_suggestions.sql` | Tabelas base (Fase 0) |
| `20250615_create_learning_tables.sql` | Tabelas de aprendizado (Fase 4) |

---

## 6. APIs Disponíveis

### 6.1 Endpoints REST

#### Co-Piloto API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/copilot/suggestions` | Lista sugestões ativas |
| POST | `/api/copilot/feedback` | Envia feedback |
| PUT | `/api/copilot/preferences` | Atualiza preferências |
| GET | `/api/copilot/stats` | Estatísticas do Co-Piloto |

#### Admin API (Protegida)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/insights` | Lista insights |
| GET | `/api/admin/evolution` | Status de evolução |
| POST | `/api/admin/config` | Atualiza configuração |

### 6.2 AdminGuard

Todas as APIs administrativas são protegidas:

```typescript
import { requireAdmin } from '@/azuria_ai/core/adminGuard';

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response; // 401 ou 429
  }
  // ... lógica protegida
}
```

**Proteções:**
- Validação de UID do criador
- Rate limiting (100 req/15min por IP)
- Cleanup automático de registros expirados

---

## 7. Componentes UI

### 7.1 CoPilot Widget

```tsx
import { CoPilot } from '@/azuria_ai/ui/CoPilot';

// Já integrado no DashboardLayout
<CoPilot />
```

**Props:**
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Posição do widget |
| `autoOpen` | `boolean` | `false` | Abrir automaticamente |

### 7.2 AzuriaBubble

Indicador de status da IA.

```tsx
import { AzuriaBubble } from '@/azuria_ai/ui/AzuriaBubble';

<AzuriaBubble 
  status="active" 
  onClick={toggleCoPilot} 
/>
```

### 7.3 InsightToast

Notificações flutuantes.

```tsx
import { InsightToast } from '@/azuria_ai/ui/InsightToast';

<InsightToast
  insight={{
    type: 'tip',
    title: 'Dica útil',
    message: 'Conteúdo da dica',
  }}
  onDismiss={handleDismiss}
/>
```

---

## 8. React Hooks

### 8.1 useCoPilot

Hook principal para interagir com o Co-Piloto.

```typescript
import { useCoPilot } from '@/azuria_ai/hooks/useCoPilot';

function MyComponent() {
  const {
    // Estado
    suggestions,        // Sugestões ativas
    activeSuggestion,   // Sugestão em destaque
    isOpen,             // Widget aberto?
    isLoading,          // Carregando?
    
    // Ações
    acceptSuggestion,   // Aceitar sugestão
    dismissSuggestion,  // Dispensar sugestão
    toggle,             // Abrir/fechar widget
    refresh,            // Atualizar sugestões
  } = useCoPilot();

  return (
    <div>
      {suggestions.map(s => (
        <SuggestionCard
          key={s.id}
          suggestion={s}
          onAccept={() => acceptSuggestion(s.id)}
          onDismiss={() => dismissSuggestion(s.id)}
        />
      ))}
    </div>
  );
}
```

### 8.2 useAIContext

Acesso ao contexto de IA.

```typescript
import { useAIContext } from '@/azuria_ai/hooks/useAIContext';

const { context, updateContext, resetContext } = useAIContext();
```

### 8.3 useCalcWatcher

Observador de cálculos em tempo real.

```typescript
import { useCalcWatcher } from '@/azuria_ai/hooks/useCalcWatcher';

useCalcWatcher({
  cost: productCost,
  margin: desiredMargin,
  onInsight: (insight) => {
    console.log('Novo insight:', insight);
  },
});
```

---

## 9. Testes

### 9.1 Executar Testes

```bash
# Todos os testes
npm run test

# Testes do Modo Deus
npm run test -- src/__tests__/unit/azuria_ai/

# Com coverage
npm run test -- --coverage
```

### 9.2 Cobertura de Testes

| Engine/Módulo | Testes | Status |
|---------------|--------|--------|
| NLPProcessorEngine | 30 | ✅ |
| FeedbackLoopEngine | 12 | ✅ |
| PredictiveEngine | 15 | ✅ |
| ProactiveAssistant | 19 | ✅ |
| AdminGuard | 11 | ✅ |
| SSEManager | 14 | ✅ |
| EventBus | 8 | ✅ |
| Outros | 110+ | ✅ |
| **TOTAL** | **219** | ✅ |

### 9.3 Estrutura de Testes

```
src/__tests__/
├── unit/
│   └── azuria_ai/
│       ├── nlpProcessorEngine.test.ts
│       ├── feedbackLoopEngine.test.ts
│       ├── predictiveEngine.test.ts
│       └── proactiveAssistant.test.ts
├── integration/
│   └── copilot.test.ts
└── setup.ts                    # Mocks globais
```

### 9.4 Mocks Configurados

```typescript
// src/__tests__/setup.ts

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock do EventBus
vi.mock('@/azuria_ai/core/eventBus', () => ({
  eventBus: mockEventBus,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
}));
```

---

## 10. Configuração

### 10.1 Inicialização

O Modo Deus é inicializado automaticamente pelo `ModeDeusProvider`:

```tsx
// src/layouts/DashboardLayout.tsx
import { ModeDeusProvider } from '@/azuria_ai/providers/ModeDeusProvider';

function DashboardLayout({ children }) {
  return (
    <ModeDeusProvider>
      {children}
      <CoPilot />
    </ModeDeusProvider>
  );
}
```

### 10.2 Configuração do Orquestrador

```typescript
import { initializeModeDeus } from '@/azuria_ai/core/ModeDeusOrchestrator';

await initializeModeDeus({
  enableCoPilot: true,
  enablePrediction: true,
  enableProactive: true,
  enableFeedback: true,
  debugMode: process.env.NODE_ENV === 'development',
});
```

### 10.3 Configuração do Throttler

```typescript
import { initThrottler } from '@/azuria_ai/engines/suggestionThrottler';

initThrottler({
  maxPerMinute: 3,
  cooldownAfterDismiss: 60000,  // 1 minuto
  silenceWhileTyping: true,
  adaptiveLearning: true,
});
```

### 10.4 Configuração Proativa

```typescript
import { initProactiveAssistant } from '@/azuria_ai/engines/proactiveAssistant';

initProactiveAssistant({
  enabled: true,
  maxActiveAssistances: 3,
  minTimeBetweenAssistances: 30000,  // 30s
  aggressiveness: 'balanced',        // 'passive' | 'balanced' | 'proactive'
});
```

---

## 11. Troubleshooting

### 11.1 Problemas Comuns

#### Sugestões não aparecem

```typescript
// Verificar se o Co-Piloto está habilitado
const prefs = await getUserPreferences();
console.log('CoPilot enabled:', prefs.enabled);

// Verificar throttling
const throttlerState = getThrottlerState();
console.log('Cooldown active:', throttlerState.inCooldown);
```

#### Eventos não são disparados

```typescript
// Verificar subscrições
import { getSubscriptionCount } from '@/azuria_ai/core/eventBus';
console.log('Subscriptions:', getSubscriptionCount());

// Verificar se o orquestrador está ativo
const stats = getModeDeusStats();
console.log('Orchestrator active:', stats.active);
```

#### Erro de tipo no TypeScript

```typescript
// Importar tipos corretamente
import type { 
  UserSuggestion,
  TriggerContext,
  ProactiveAssistance 
} from '@/azuria_ai/types';
```

### 11.2 Debug Mode

```typescript
// Ativar logs detalhados
initializeModeDeus({
  debugMode: true,
});

// Ou via variável de ambiente
// .env.local
VITE_MODE_DEUS_DEBUG=true
```

### 11.3 Reset do Estado

```typescript
import { resetModeDeusState } from '@/azuria_ai/core/ModeDeusOrchestrator';

// Reset completo (útil para testes)
resetModeDeusState();
```

---

## 12. Roadmap

### v1.1 (Q1 2025)

| Feature | Prioridade | Status |
|---------|------------|--------|
| Integração com LLM externo (Gemini/GPT) | P1 | Planejado |
| Voice Interface | P2 | Planejado |
| Melhorias de NLP | P1 | Planejado |

### v2.0 (Q2 2025)

| Feature | Prioridade | Status |
|---------|------------|--------|
| Collaborative Intelligence | P2 | Futuro |
| Plugin System | P3 | Futuro |
| API Pública | P3 | Futuro |
| Multi-tenant | P2 | Futuro |

### Ideias Futuras

- [ ] Integração com WhatsApp Business
- [ ] Assistente de voz
- [ ] Dashboard mobile
- [ ] Exportação de insights
- [ ] Webhooks para eventos

---

## 13. Referências

### Documentação Interna

| Documento | Caminho |
|-----------|---------|
| API Creator Panel | `docs/API_CREATOR_PANEL.md` |
| Azuria AI Implementation | `docs/AZURIA_AI_IMPLEMENTATION.md` |
| Azuria AI Integration | `docs/AZURIA_AI_INTEGRATION.md` |
| Architecture | `docs/mode-deus/architecture.md` |
| Overview | `docs/mode-deus/overview.md` |

### Código Fonte

| Módulo | Caminho |
|--------|---------|
| Orquestrador | `src/azuria_ai/core/ModeDeusOrchestrator.ts` |
| EventBus | `src/azuria_ai/core/eventBus.ts` |
| Engines | `src/azuria_ai/engines/` |
| Hooks | `src/azuria_ai/hooks/` |
| Types | `src/azuria_ai/types/` |
| UI | `src/azuria_ai/ui/` |

### Migrações SQL

| Arquivo | Caminho |
|---------|---------|
| Fase 0 | `supabase/migrations/20250614_create_user_suggestions.sql` |
| Fase 4 | `supabase/migrations/20250615_create_learning_tables.sql` |

---

## Créditos

**Modo Deus v1.0**

- **Arquitetura:** Azuria Team
- **Desenvolvimento:** Assistido por IA (Claude, Gemini)
- **Testes:** 219 testes automatizados
- **Release:** Dezembro 2025

---

**Versão:** 1.0.0  
**Última Atualização:** 11 de Dezembro de 2025  
**Status:** ✅ Produção  
**Licença:** Proprietária - Azuria Lab
