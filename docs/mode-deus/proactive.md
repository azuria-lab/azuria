---
title: Motor Proativo
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Motor Proativo (Proactive Engine)

O **Proactive Engine** é o subsistema responsável por dar autonomia à IA. Em vez de esperar uma pergunta do usuário, ele analisa dados em segundo plano e oferece insights espontâneos.

## Funcionamento

1.  **Ciclo de Vida:**
    *   Inicia automaticamente quando o `AzuriaAIProvider` é montado.
    *   Roda um loop de verificação a cada **30 segundos**.
    *   Para quando a aplicação é fechada.

2.  **Avaliação:**
    *   A cada ciclo, chama `evaluateProactiveRules()` (`src/azuria_ai/core/proactiveAnalysis.ts`).
    *   Consulta o `contextStore` para obter dados da tela atual e módulos recentes.

3.  **Cooldown:**
    *   Cada regra tem um tempo de resfriamento (ex: 10 a 30 minutos) para evitar repetição de alertas (spam).

## Regras Implementadas

### Dashboard
*   **Queda de Margem:** Alerta se a margem caiu > 10% na semana (Severity: High).
*   **Tempo Economizado:** Reforço positivo se economizou > 5h com IA (Severity: Low).

### Histórico
*   **Padrões Repetidos:** (Em breve) Detecta erros recorrentes de precificação.

### Lote Inteligente
*   **Produtos Críticos:** Alerta se > 30% do lote tem margem < 10% (Severity: High).
*   **Markup Baixo:** Sugere revisão se markup médio < 15% (Severity: Medium).

### IA de Precificação
*   **Sugestões Pendentes:** Alerta se houver > 5 sugestões não aplicadas há dias (Severity: Medium).

### Analytics
*   **Queda Abrupta:** Alerta CRÍTICO se margem diária cair > 15% em um dia.

### Marketplace
*   **Taxas Altas:** Alerta se taxas ultrapassarem 20% do valor de venda (Severity: High).

## Configuração

O comportamento pode ser ajustado em `src/azuria_ai/core/proactiveEngine.ts`:

```typescript
const CHECK_INTERVAL_MS = 30000; // Intervalo de verificação
// Cooldowns são definidos individualmente em cada regra
```
