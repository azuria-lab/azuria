---
title: Catálogo de Eventos
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Catálogo de Eventos (Event Bus)

Lista completa de eventos que trafegam no `EventBus`.

## Estrutura Padrão

Todo evento segue esta interface:

```typescript
interface AzuriaEvent {
  tipo: EventType;
  payload: any;
  timestamp: number;
  source: string;
  priority: number; // 0 (baixa) a 10 (crítica)
  metadata?: Record<string, any>;
}
```

## Eventos de Cálculo (`core`)

| Evento | Trigger | Payload Exemplo |
| :--- | :--- | :--- |
| `calc:started` | Usuário foca ou inicia interação na calculadora. | `{}` |
| `calc:updated` | Input alterado (debouneado). | `{ custoProduto: 100, margem: 20 }` |
| `calc:completed` | Cálculo finalizado com sucesso. | `{ resultado: 120, lucro: 20 }` |

## Eventos de Calculadora Avançada

| Evento | Trigger | Payload Exemplo |
| :--- | :--- | :--- |
| `scenario:updated` | Mudança em parâmetros de cenário. | `{ cenario: "otimista", inflacao: 5 }` |
| `fees:updated` | Mudança em taxas extras. | `{ custoFixo: 50, marketing: 10 }` |

## Eventos Fiscais

| Evento | Trigger | Payload Exemplo |
| :--- | :--- | :--- |
| `tax:updated` | Mudança geral em impostos. | `{ regime: "lucro_real" }` |
| `icms:updated` | Cálculo de ICMS alterado. | `{ base: 100, valor: 18 }` |
| `st:updated` | Cálculo de ST alterado. | `{ mva: 40, valorST: 12 }` |

## Eventos de Licitação

| Evento | Trigger | Payload Exemplo |
| :--- | :--- | :--- |
| `bid:updated` | Novo lance calculado. | `{ lance: 9800, margem: 8 }` |
| `risk:updated` | Análise de risco atualizada. | `{ risco: "medio", fatores: [...] }` |
| `discount:updated` | Desconto sobre tabela aplicado. | `{ desconto: 5 }` |

## Eventos de Contexto e UI

| Evento | Trigger | Payload Exemplo |
| :--- | :--- | :--- |
| `screen:changed` | Navegação de rota. | `{ screen: "dashboard", path: "/dash" }` |
| `screen:dataUpdated`| Dados da tela atualizados. | `{ data: { ... } }` |
| `insight:generated` | IA ou Proactive Engine gerou insight. | `{ id: "123", severity: "high", message: "..." }` |
| `ui:displayInsight` | Ordem para exibir Toast. | `{ insightId: "123" }` |
| `ui:changed` | Mudança genérica de interface. | `{ component: "sidebar", state: "collapsed" }` |

## Eventos de Sistema

| Evento | Trigger | Descrição |
| :--- | :--- | :--- |
| `user:action` | Ação explícita do usuário (clique). | Rastreamento de comportamento. |
| `data:updated` | Atualização genérica de dados. | Sincronismo. |
| `error:occurred` | Erro em qualquer módulo. | Log de erros centralizado. |
| `agent:called` | Function calling disparado. | Auditoria de agentes. |
