---
title: Componentes do Sistema
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Componentes do Sistema

Lista detalhada dos arquivos e diretórios que compõem o Modo Deus.

## Estrutura de Diretórios (`src/azuria_ai`)

```
src/azuria_ai/
├── core/               # Núcleo lógico do sistema
├── context/            # Gestão de contexto e extractors
├── hooks/              # Watchers (sensores)
├── ui/                 # Componentes visuais
└── services/           # Serviços de integração (API)
```

## Componentes `core/`

| Arquivo | Responsabilidade | Dependências |
| :--- | :--- | :--- |
| `aiOrchestrator.ts` | Controlador central. Inicializa listeners e roteia eventos. | eventBus, handlers |
| `eventBus.ts` | Sistema de Pub/Sub. Gerencia emissão e assinatura de eventos. | - |
| `proactiveEngine.ts` | Loop de verificação autônoma. Gera insights baseados em regras. | contextStore, eventBus |
| `proactiveAnalysis.ts` | Regras de negócio usadas pelo motor proativo. | contextStore |
| `contextStore.ts` | Store (Singleton) que guarda o estado atual da sessão/tela. | - |
| `calculatorHandlers.ts` | Funções que processam eventos específicos de calculadoras. | - |
| `functionRegistry.ts` | Gerenciador de definições de funções (Tools) para a IA. | - |
| `functionDefinitions.ts`| Catálogo das funções disponíveis (Calculo, Fiscal, etc). | functionRegistry |
| `screenContextHandlers.ts`| Handlers para eventos de mudança de tela. | eventBus, contextStore |

## Componentes `context/`

| Arquivo | Responsabilidade |
| :--- | :--- |
| `screenContextWatcher.ts` | Hook que monitora `useLocation` e emite `screen:changed`. |
| `contextExtractors.ts` | Funções para extrair dados limpos de cada módulo (Dashboard, Lote, etc). |

## Componentes `hooks/` (Watchers)

Todos os watchers seguem o padrão de capturar estado local e emitir via EventBus.

| Arquivo | Monitora | Eventos Emitidos |
| :--- | :--- | :--- |
| `useCalcWatcher.ts` | Calculadora Básica | `calc:updated`, `calc:completed` |
| `useAdvancedCalcWatcher.ts` | Calculadora Avançada | `scenario:updated`, `fees:updated` |
| `useTaxCalcWatcher.ts` | Calculadora Fiscal | `tax:updated`, `icms:updated` |
| `useBidCalcWatcher.ts` | Licitações | `bid:updated`, `risk:updated` |

## Componentes `ui/`

| Arquivo | Descrição |
| :--- | :--- |
| `AzuriaAIProvider.tsx` | Wrapper global. Inicia o Orchestrator e o Proactive Engine. |
| `AzuriaBubble.tsx` | Ícone flutuante que indica status da IA e abre o dashboard. |
| `MiniDashboard.tsx` | Interface principal do Chat/Modo Deus. |
| `InsightToast.tsx` | Sistema de notificação (Toast) customizado para insights. |

## Fluxo de Dados

1.  **Entrada:** Usuário interage na UI -> Watcher detecta -> `emitEvent()`.
2.  **Processamento:** `eventBus` entrega ao `aiOrchestrator` -> Atualiza `contextStore`.
3.  **Análise:** `proactiveEngine` lê `contextStore` -> Detecta padrão.
4.  **Saída:** `emitEvent('insight:generated')` -> `InsightToast` exibe mensagem.
