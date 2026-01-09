# 🧠 MODO DEUS - Documentação Completa

> **Sistema Cognitivo Autônomo do Azuria**  
> **Versão**: 2.0.0  
> **Data**: Janeiro 2026  
> **Status**: ✅ Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes Core](#componentes-core)
4. [Sistema de Observabilidade](#sistema-de-observabilidade)
5. [Dashboard Administrativo](#dashboard-administrativo)
6. [API de Métricas](#api-de-métricas)
7. [Configuração](#configuração)
8. [Guia de Uso](#guia-de-uso)
9. [Troubleshooting](#troubleshooting)
10. [Changelog](#changelog)

---

## Visão Geral

O **Modo Deus** é o sistema cognitivo central do Azuria, responsável por:

- 🧠 **Processamento Inteligente**: Análise contextual de eventos e tomada de decisão
- 🔒 **Governança**: Controle de permissões e privilégios de engines
- 📊 **Observabilidade**: Métricas, alertas e replay de eventos em tempo real
- 🔄 **Memória Unificada**: Sistema de memória com persistência Supabase
- 🤖 **Integração IA**: Roteamento para modelos de IA (Gemini)

### Principais Características

| Feature | Descrição |
|---------|-----------|
| **CentralNucleus** | Núcleo central que processa todas as requisições |
| **EngineGovernance** | Sistema de permissões para 65+ engines |
| **CognitiveMetrics** | Coleta de métricas em tempo real |
| **EventReplay** | Gravação e reprodução de eventos para debugging |
| **CognitiveAlerts** | Sistema de alertas inteligentes com regras |
| **Admin Dashboard** | Interface web para monitoramento |

---

## Arquitetura

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MODO DEUS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   EventBus      │───▶│ PerceptionGate  │───▶│ DecisionEngine  │     │
│  │   (entrada)     │    │ (filtragem)     │    │ (processamento) │     │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘     │
│                                                          │               │
│  ┌──────────────────────────────────────────────────────▼────────────┐ │
│  │                      CentralNucleus                                │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │ GlobalState │  │ AIRouter    │  │ OutputGate  │               │ │
│  │  │ (estado)    │  │ (IA)        │  │ (saída)     │               │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Observability Layer                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │   │
│  │  │ Metrics    │  │ Alerts     │  │ Replay     │  │ Persist   │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Memory Layer                                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │   │
│  │  │ STM        │  │ WM         │  │ LTM        │                │   │
│  │  │ (curto)    │  │ (trabalho) │  │ (longo)    │ ──▶ Supabase  │   │
│  │  └────────────┘  └────────────┘  └────────────┘                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
src/azuria_ai/
├── consciousness/          # Núcleo cognitivo
│   ├── CentralNucleus.ts   # Núcleo central
│   ├── ConsciousnessCore.ts
│   ├── GlobalState.ts      # Estado global
│   ├── PerceptionGate.ts   # Filtro de entrada
│   ├── DecisionEngine.ts   # Motor de decisão
│   ├── OutputGate.ts       # Controle de saída
│   ├── AIRouter.ts         # Roteamento IA
│   └── learning/           # Sistema de aprendizado
│       └── FeedbackLearning.ts
│
├── observability/          # Ferramentas de observabilidade
│   ├── CognitiveMetrics.ts # Métricas
│   ├── CognitiveAlerts.ts  # Alertas
│   ├── EventReplay.ts      # Replay de eventos
│   ├── AlertNotifications.ts # Notificações push
│   └── RecordingPersistence.ts # Persistência Supabase
│
├── governance/             # Sistema de governança
│   └── EngineGovernance.ts
│
├── memory/                 # Sistema de memória
│   └── UnifiedMemory.ts
│
├── events/                 # Sistema de eventos
│   └── EventBus.ts
│
└── engines/                # 65+ Engines de IA
    ├── strategic/
    ├── operational/
    ├── learning/
    └── ...
```

---

## Componentes Core

### CentralNucleus

O `CentralNucleus` é o componente central que coordena todo o sistema.

```typescript
import { CentralNucleus } from '@/azuria_ai/consciousness';

// Inicialização
const nucleus = CentralNucleus.getInstance();
await nucleus.initialize();

// Processar requisição
const response = await nucleus.processRequest({
  type: 'insight',
  data: { query: 'Analise minha margem de lucro' },
  source: 'insight-engine',
});

// Status do sistema
const health = nucleus.getHealthStatus();
console.log(health.score); // 0-100
```

### GlobalState

Gerencia o estado global do sistema cognitivo.

```typescript
import { GlobalState } from '@/azuria_ai/consciousness';

// Obter estado atual
const state = GlobalState.getState();

// Atualizar identidade do usuário
GlobalState.updateIdentity({
  userId: 'user-123',
  role: 'pro',
  tier: 'premium',
});

// Atualizar momento atual
GlobalState.updateCurrentMoment({
  screen: 'calculator',
  lastAction: 'price_calculated',
});
```

### DecisionEngine

Motor de decisão que processa eventos e determina ações.

```typescript
import { DecisionEngine } from '@/azuria_ai/consciousness';

// Processar decisão
const decision = await DecisionEngine.process({
  type: 'user_action',
  data: { action: 'calculate_price', value: 100 },
});

// Decisões possíveis: emit, silence, delegate, escalate
if (decision.action === 'emit') {
  // Emitir resposta ao usuário
}
```

### EngineGovernance

Controla permissões de engines.

```typescript
import { EngineGovernance } from '@/azuria_ai/governance';

// Registrar engine
EngineGovernance.registerEngine({
  id: 'custom-engine',
  name: 'Custom Engine',
  category: 'operational',
  privileges: ['emit_suggestions', 'read_context'],
});

// Verificar permissão
const canEmit = EngineGovernance.checkPermission('custom-engine', 'emit_suggestions');
```

---

## Sistema de Observabilidade

### CognitiveMetrics

Coleta métricas em tempo real do sistema cognitivo.

```typescript
import { CognitiveMetrics } from '@/azuria_ai/observability';

// Inicializar
CognitiveMetrics.init({ enabled: true, debug: false });

// Métricas pré-definidas
CognitiveMetrics.Nucleus.requestReceived();
CognitiveMetrics.Nucleus.actionProcessed('approved', 'insight-engine');
CognitiveMetrics.Nucleus.processingTime(150);
CognitiveMetrics.Nucleus.errorOccurred('timeout');

// Métricas customizadas
CognitiveMetrics.incrementCounter('custom.events.processed');
CognitiveMetrics.setGauge('custom.queue.size', 42);
CognitiveMetrics.recordHistogram('custom.latency.ms', 123);

// Exportar
const json = CognitiveMetrics.exportJSON();
const prometheus = CognitiveMetrics.exportPrometheus();
```

### EventReplay

Grava e reproduz eventos para debugging.

```typescript
import { EventReplay } from '@/azuria_ai/observability';

// Iniciar gravação
EventReplay.startRecording('debug-session', {
  eventTypes: ['nucleus:*', 'engine:*'],
});

// ... eventos acontecem ...

// Parar gravação
const recording = EventReplay.stopRecording();

// Reproduzir
await EventReplay.replay(recording.id, {
  speed: 2,           // 2x velocidade
  dryRun: true,       // Não emite eventos reais
  onBeforeEvent: (event) => console.log('Replaying:', event),
});

// Exportar/Importar
const json = EventReplay.exportRecording(recording.id);
EventReplay.importRecording(json);
```

### CognitiveAlerts

Sistema de alertas baseado em regras.

```typescript
import { CognitiveAlerts } from '@/azuria_ai/observability';

// Inicializar com regras padrão
CognitiveAlerts.init({ enabled: true, checkIntervalMs: 30000 });
CognitiveAlerts.loadDefaultRules();

// Adicionar regra customizada
CognitiveAlerts.addAlertRule({
  id: 'custom-latency',
  name: 'Alta Latência',
  metricName: 'nucleus.processing.time',
  operator: 'gte',
  threshold: 1000,
  severity: 'warning',
  cooldownMs: 60000,
});

// Verificar manualmente
CognitiveAlerts.checkAlertsNow();

// Obter alertas ativos
const alerts = CognitiveAlerts.getActiveAlerts();

// Acknowledge
CognitiveAlerts.acknowledgeAlert(alerts[0].id);
```

### AlertNotifications

Notificações push via browser e toast.

```typescript
import { AlertNotifications } from '@/azuria_ai/observability';

// Inicializar
await AlertNotifications.init({
  browserNotifications: true,
  toastNotifications: true,
  severityFilter: ['warning', 'critical'],
  playSound: true,
});

// Conectar ao sistema de alertas
AlertNotifications.connect();

// As notificações serão enviadas automaticamente quando alertas forem disparados
```

### RecordingPersistence

Persistência de gravações no Supabase.

```typescript
import { RecordingPersistence } from '@/azuria_ai/observability';

// Salvar gravação no Supabase
const result = await RecordingPersistence.saveRecording(
  recording,
  'Debug Session 01',
  'Investigando bug de latência'
);

// Listar gravações
const recordings = await RecordingPersistence.listRecordings({
  status: 'completed',
  limit: 10,
});

// Carregar gravação
const loaded = await RecordingPersistence.loadRecording(recordingId);

// Arquivar
await RecordingPersistence.archiveRecording(recordingId);
```

---

## Dashboard Administrativo

O Dashboard Cognitivo está integrado ao **AdminPanel** e acessível apenas para administradores.

### Acesso

- **URL**: `/admin?tab=cognitive`
- **Permissão**: Requer role `admin` ou `owner`
- **Redirecionamento**: `/sistema-cognitivo` redireciona para `/admin?tab=cognitive`

### Abas Disponíveis

| Aba | Descrição |
|-----|-----------|
| **Dashboard** | Visão geral do CentralNucleus, engines ativos, saúde do sistema |
| **Métricas** | Visualização de counters, gauges, histograms com exportação |
| **Alertas** | Gerenciamento de regras, alertas ativos, histórico |
| **Replay** | Gravação e reprodução de eventos |

### Componentes UI

```typescript
// Importar componentes
import {
  CognitiveDashboard,
  MetricsDashboard,
  AlertsPanel,
  EventReplayPanel,
} from '@/components/ai/consciousness';

// Usar no seu componente
function AdminCognitive() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsContent value="dashboard">
        <CognitiveDashboard />
      </TabsContent>
      <TabsContent value="metrics">
        <MetricsDashboard />
      </TabsContent>
      <TabsContent value="alerts">
        <AlertsPanel />
      </TabsContent>
      <TabsContent value="replay">
        <EventReplayPanel />
      </TabsContent>
    </Tabs>
  );
}
```

---

## API de Métricas

### Endpoint

```
GET  /api/metrics
GET  /api/metrics?format=prometheus
GET  /api/metrics?format=json
POST /api/metrics
```

### Rate Limiting

| Método | Limite | Janela |
|--------|--------|--------|
| GET | 60 req | 1 minuto |
| POST | 30 req | 1 minuto |

Headers de resposta:
- `X-RateLimit-Limit`: Limite máximo
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Segundos até reset

### Formato Prometheus

```
# HELP azuria_cognitive_info Azuria Cognitive System Information
# TYPE azuria_cognitive_info gauge
azuria_cognitive_info{version="1.0.0"} 1

# TYPE azuria_cognitive_nucleus_requests_total counter
azuria_cognitive_nucleus_requests_total 1234

# TYPE azuria_cognitive_nucleus_health_score gauge
azuria_cognitive_nucleus_health_score 95

# TYPE azuria_cognitive_nucleus_processing_time histogram
azuria_cognitive_nucleus_processing_time_count 500
azuria_cognitive_nucleus_processing_time_sum 75000
azuria_cognitive_nucleus_processing_time_bucket{le="0.01"} 100
azuria_cognitive_nucleus_processing_time_bucket{le="0.1"} 400
azuria_cognitive_nucleus_processing_time_bucket{le="+Inf"} 500
```

### Integração Grafana

1. Adicionar datasource Prometheus apontando para `/api/metrics`
2. Configurar scrape interval: 30s
3. Importar dashboard template (disponível em `/docs/grafana/`)

---

## Configuração

### Variáveis de Ambiente

```bash
# Gemini AI
VITE_GOOGLE_GEMINI_API_KEY=your-api-key

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_COGNITIVE_METRICS=true
VITE_ENABLE_EVENT_REPLAY=true
VITE_ENABLE_COGNITIVE_ALERTS=true
```

### Inicialização no App

```typescript
// Em App.tsx ou similar
import { CognitiveMetrics, CognitiveAlerts, EventReplay } from '@/azuria_ai/observability';

// Inicializar observabilidade
if (import.meta.env.VITE_ENABLE_COGNITIVE_METRICS === 'true') {
  CognitiveMetrics.init({ enabled: true });
}

if (import.meta.env.VITE_ENABLE_COGNITIVE_ALERTS === 'true') {
  CognitiveAlerts.init({ enabled: true, checkIntervalMs: 30000 });
  CognitiveAlerts.loadDefaultRules();
}
```

---

## Guia de Uso

### Para Desenvolvedores

1. **Adicionar novo engine**:
```typescript
// 1. Criar engine
const myEngine = new MyEngine();

// 2. Registrar na governança
EngineGovernance.registerEngine({
  id: 'my-engine',
  name: 'My Engine',
  category: 'operational',
  privileges: ['emit_suggestions'],
});

// 3. Emitir eventos governados
import { governedEmit } from '@/azuria_ai/core';
await governedEmit('my-engine', 'insight_generated', { data: '...' });
```

2. **Adicionar métrica customizada**:
```typescript
// Counter
CognitiveMetrics.incrementCounter('myengine.events.processed', { engine: 'my-engine' });

// Gauge
CognitiveMetrics.setGauge('myengine.queue.size', queueLength);

// Histogram (timing)
const endTimer = CognitiveMetrics.startTimer('myengine.processing.time');
// ... processamento ...
endTimer(); // Registra automaticamente
```

3. **Debugging com Replay**:
```typescript
// Antes de testar
EventReplay.startRecording('debug-feature-x');

// ... executar a feature ...

// Depois
const recording = EventReplay.stopRecording();
console.log(`Gravados ${recording.events.length} eventos`);

// Analisar
recording.events.forEach(e => console.log(e.type, e.timestamp));
```

### Para Administradores

1. **Acessar Dashboard**: Navegue para `/admin` e clique na aba "IA Cognitiva"
2. **Monitorar Saúde**: Verifique o score de saúde no Dashboard principal
3. **Configurar Alertas**: Na aba Alertas, crie regras para métricas críticas
4. **Investigar Problemas**: Use a aba Replay para gravar e reproduzir eventos

---

## Troubleshooting

### Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Dashboard não carrega | Sem permissão admin | Verificar role no user_profiles |
| Métricas zeradas | Metrics não inicializado | Chamar `CognitiveMetrics.init()` |
| Alertas não disparam | CheckInterval muito alto | Reduzir `checkIntervalMs` |
| Replay vazio | EventTypes não configurados | Passar `eventTypes` no startRecording |
| API 429 | Rate limit | Aguardar `Retry-After` segundos |

### Logs de Debug

```typescript
// Habilitar debug nos módulos
CognitiveMetrics.init({ debug: true });
CognitiveAlerts.init({ enabled: true, debug: true });

// Verificar no console do browser
// [CognitiveMetrics] ...
// [CognitiveAlerts] ...
// [EventReplay] ...
```

### Verificação de Saúde

```typescript
// Via código
const nucleus = CentralNucleus.getInstance();
const health = nucleus.getHealthStatus();
console.log({
  score: health.score,
  activeEngines: health.activeEngines,
  errors: health.recentErrors,
});

// Via API
fetch('/api/metrics?format=json')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## Changelog

### v2.0.0 (Janeiro 2026)

#### Adicionado
- ✅ Sistema de Observabilidade completo (Metrics, Alerts, Replay)
- ✅ Dashboard integrado ao AdminPanel
- ✅ API /api/metrics com formato Prometheus
- ✅ Rate Limiting na API
- ✅ Notificações Push para alertas
- ✅ Persistência de recordings no Supabase
- ✅ Testes E2E com Playwright
- ✅ Documentação consolidada

#### Melhorado
- 🔧 Governança de engines refinada
- 🔧 Performance do CentralNucleus
- 🔧 Tipagem TypeScript completa

#### Removido
- ❌ Integração NVIDIA NIM (substituída por Gemini)
- ❌ Documentos redundantes consolidados

### v1.0.0 (Dezembro 2025)

- Release inicial do Modo Deus
- 65 engines de IA
- CentralNucleus e ConsciousnessCore
- Sistema de governança básico

---

## Referências

- [Arquitetura Cognitiva](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Supabase Schema](../supabase/migrations/)
- [Testes](../src/__tests__/unit/azuria_ai/)

---

> **Nota**: Este documento consolida toda a documentação do Modo Deus.
> Documentos anteriores foram arquivados ou removidos.

**Mantido por**: Azuria Team  
**Última atualização**: Janeiro 2026
