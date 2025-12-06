---
title: Guia de Testes
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Guia de Testes - Modo Deus

Como validar se o sistema de IA está funcionando corretamente.

## 1. Testar Watchers (Reatividade)

1.  Abra o console do navegador (F12).
2.  Vá para a **Calculadora Básica**.
3.  Digite um valor no campo "Custo".
4.  **Esperado:**
    *   Log no console (se debug ativo) ou verificação via React DevTools.
    *   Evento `calc:updated` disparado após ~500ms (debounce).
    *   Se preencher tudo, evento `calc:completed`.

## 2. Testar Contexto de Tela

1.  Navegue entre o **Dashboard** e o **Histórico**.
2.  **Esperado:**
    *   O `ContextStore` deve atualizar `currentScreen`.
    *   Log no orquestrador: `Screen changed: history`.

## 3. Testar Motor Proativo (Simulação)

Como o motor roda a cada 30s, você pode forçar um teste:

1.  No código `src/azuria_ai/core/proactiveAnalysis.ts`, altere temporariamente a regra de "Queda de Lucro" para disparar sempre (remova o `if`).
2.  Salve e espere o reload.
3.  Aguarde até 30 segundos.
4.  **Esperado:**
    *   Um Toast de notificação deve aparecer no topo da tela.
    *   Evento `insight:generated` no console.

## 4. Testar Cooldown

1.  Após receber o insight do passo 3, aguarde mais 30 segundos.
2.  **Esperado:** NENHUM novo toast deve aparecer (pois o cooldown de 10 minutos foi ativado).

## 5. Scripts de Teste Automatizado

Para rodar a suíte de testes unitários/integração (se configurada):

```bash
npm test
# ou
yarn test
```

Certifique-se de que não há erros de lint antes de commitar:

```bash
npm run lint
```
