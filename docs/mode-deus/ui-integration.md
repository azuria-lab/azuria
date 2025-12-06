---
title: Integração com UI
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Integração com UI

O Modo Deus se manifesta na interface através de componentes dedicados que consomem eventos do sistema.

## 1. Azuria Bubble (Bolha Flutuante)
O ponto de entrada principal.
*   **Comportamento:** Fica fixa no canto inferior direito.
*   **Estados:**
    *   `Online`: IA ativa e monitorando.
    *   `Processing`: IA pensando/calculando.
    *   `Notification`: Bolha pulsa quando há um novo insight não lido.

## 2. Insight Toasts (Notificações)
Mensagens flutuantes temporárias no topo da tela. Usadas para insights proativos e reativos.

*   **Trigger:** Evento `ui:displayInsight`.
*   **Design:**
    *   Cores baseadas na severidade (Vermelho=Critical, Laranja=High, Azul=Info).
    *   Sem emojis (estilo corporativo/técnico).
    *   Botão de ação (se houver sugestão).

### Exemplo de Payload para Dispatch

```typescript
emitEvent('ui:displayInsight', { 
  insightId: "uuid-1234-5678" 
});
```

O componente `InsightToast` escuta este evento, busca o conteúdo do insight e exibe.

## 3. Mini Dashboard (Painel Lateral)
A interface completa da IA.
*   **Acesso:** Clicando na Bubble.
*   **Funcionalidades:**
    *   Chat com o Agente.
    *   Histórico de Insights.
    *   Visualização de métricas de IA.
    *   Controles de configuração.

## Fluxo de Exibição de Insight

1.  `ProactiveEngine` gera um insight -> `emitEvent('insight:generated', payload)`.
2.  `ProactiveEngine` dispara ordem de exibição -> `emitEvent('ui:displayInsight', { insightId })`.
3.  `InsightToastContainer` (no `AzuriaAIProvider`) recebe o evento.
4.  Toast aparece na tela por 5-10 segundos.
5.  Insight fica salvo no histórico do Mini Dashboard.
