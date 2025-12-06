---
title: Watchers (Sensores)
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Watchers (Sensores)

Os Watchers são a camada de percepção da IA. Eles são implementados como React Hooks customizados que "ouvem" alterações de estado nos componentes e transmitem essas mudanças para o núcleo da IA via Event Bus.

## Princípios de Design

1.  **Não Intrusivos:** Não alteram a lógica do componente, apenas observam.
2.  **Debounced:** Evitam spam de eventos agrupando mudanças rápidas (ex: digitação).
3.  **Tipados:** Emitem payloads com interfaces TypeScript estritas.

---

## 1. `useCalcWatcher`
Monitora a Calculadora Básica de precificação.

*   **Arquivo:** `src/azuria_ai/hooks/useCalcWatcher.ts`
*   **Eventos Emitidos:**
    *   `calc:started`: Ao iniciar interação.
    *   `calc:updated`: A cada mudança de input (debounce 500ms).
    *   `calc:completed`: Quando um resultado válido é gerado.
*   **Dados Capturados:** Custo, margem, impostos, preço de venda final.

## 2. `useAdvancedCalcWatcher`
Monitora a Calculadora Avançada (cenários complexos).

*   **Arquivo:** `src/azuria_ai/hooks/useAdvancedCalcWatcher.ts`
*   **Eventos Emitidos:**
    *   `scenario:updated`: Mudanças em variáveis de cenário.
    *   `fees:updated`: Mudanças em taxas administrativas/operacionais.
*   **Uso:** Permite à IA sugerir otimizações de custos fixos.

## 3. `useTaxCalcWatcher`
Monitora simulações fiscais e tributárias.

*   **Arquivo:** `src/azuria_ai/hooks/useTaxCalcWatcher.ts`
*   **Eventos Emitidos:**
    *   `tax:updated`: Mudança de regime ou configuração global.
    *   `icms:updated`: Detalhes de cálculo de ICMS.
    *   `st:updated`: Detalhes de Substituição Tributária.
*   **Uso:** Identificação de alta carga tributária e erros de NCM/MVA.

## 4. `useBidCalcWatcher`
Monitora a calculadora de licitações.

*   **Arquivo:** `src/azuria_ai/hooks/useBidCalcWatcher.ts`
*   **Eventos Emitidos:**
    *   `bid:updated`: Novo valor de lance.
    *   `risk:updated`: Alteração em parâmetros de risco.
*   **Uso:** Alerta sobre lances que resultam em prejuízo ou margem perigosamente baixa.

## 5. `screenContextWatcher`
Monitor global de navegação.

*   **Arquivo:** `src/azuria_ai/context/screenContextWatcher.ts`
*   **Eventos Emitidos:**
    *   `screen:changed`: Sempre que a rota muda.
    *   `screen:dataUpdated`: Quando o componente da tela atualiza seus dados principais.
*   **Funcionamento:** Mapeia URLs (ex: `/dashboard`) para nomes semânticos (ex: `dashboard`) e alimenta o `ContextStore`.
