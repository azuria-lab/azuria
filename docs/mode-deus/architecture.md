---
title: Arquitetura do Sistema
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Arquitetura do Sistema

A arquitetura do Modo Deus segue um padrão **Event-Driven** (Orientado a Eventos) com um orquestrador central.

## Diagrama Conceitual

```mermaid
graph TD
    User((Usuário))

    subgraph "Camada de UI (Frontend)"
        Page[Páginas React]
        Components[Componentes UI]
        Bubble[Azuria Bubble]
        Toasts[Insight Toasts]
    end

    subgraph "Sensores (Watchers)"
        CalcWatcher[useCalcWatcher]
        NavWatcher[screenContextWatcher]
        AdvWatcher[useAdvancedCalcWatcher]
    end

    subgraph "Core AI System"
        EventBus{Event Bus}
        Orchestrator[AI Orchestrator]
        Context[Context Store]
        Proactive[Proactive Engine]
        Registry[Function Registry]
    end

    subgraph "Agentes Especializados"
        CalcAgent[Agente de Cálculo]
        FiscalAgent[Agente Fiscal]
        MktAgent[Agente Marketplace]
    end

    User --> Page
    Page --> CalcWatcher
    Page --> NavWatcher

    CalcWatcher -->|Event: calc:updated| EventBus
    NavWatcher -->|Event: screen:changed| EventBus

    EventBus --> Orchestrator
    
    Orchestrator -->|Leitura/Escrita| Context
    Proactive -->|Busca Dados| Context
    Proactive -->|Event: insight:generated| EventBus
    
    Orchestrator -->|Solicita Análise| Registry
    Registry -->|Executa| CalcAgent
    Registry -->|Executa| FiscalAgent

    Orchestrator -->|Event: ui:displayInsight| EventBus
    EventBus --> Toasts
    EventBus --> Bubble
```

## Descrição das Camadas

### 1. Camada de Sensores (Watchers)
Responsável por observar a aplicação React sem interferir nela. Os watchers são Hooks (`useEffect`) que monitoram estados locais e rotas.
*   **Responsabilidade:** Capturar inputs, navegação e mudanças de dados.
*   **Saída:** Eventos padronizados enviados ao Event Bus.

### 2. Event Bus
O sistema nervoso central. Desacopla os produtores de eventos (UI/Watchers) dos consumidores (AI).
*   **Padrão:** Pub/Sub tipado.
*   **Localização:** `src/azuria_ai/core/eventBus.ts`

### 3. AI Orchestrator ("O Cérebro")
Onde a mágica acontece. O orquestrador assina eventos relevantes e decide o que fazer.
*   **Funções:**
    *   Roteamento de eventos.
    *   Invocação de agentes.
    *   Geração de Insights Reativos.
    *   Coordenação de chamadas de função.

### 4. Context Store
Memória de curto prazo da IA. Mantém o estado atual da sessão do usuário.
*   **Dados:** Qual tela está ativa, últimos cálculos realizados, histórico recente.
*   **Uso:** Permite que a IA responda "analise isso" sabendo o que é "isso".

### 5. Proactive Engine
Motor autônomo que roda em loop (polling inteligente) verificando regras de negócio.
*   **Funcionamento:** A cada X segundos, avalia o Context Store contra um conjunto de regras.
*   **Saída:** Insights proativos (ex: "Sua margem caiu nos últimos 10 minutos").

### 6. Agentes e Function Registry
Definições de capacidades ("Skills") que a IA pode executar.
*   **Registro:** Lista de funções (JSON Schema) disponíveis para a LLM.
*   **Execução:** Handlers que conectam a IA a APIs reais (Fiscal, Correios, etc).

### 7. Interface de Feedback
Como a IA se comunica de volta com o usuário.
*   **InsightToast:** Notificações flutuantes não intrusivas.
*   **MiniDashboard:** Painel expandido ("Modo Deus") com chat e métricas.
