---
title: Troubleshooting
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Troubleshooting e Problemas Comuns

## 1. Lint Warnings (TODOs e Unused Variables)

**Sintoma:** O console ou IDE mostra vários warnings em `aiOrchestrator.ts`.
**Causa:** O sistema está em fase de implementação incremental. Variáveis estão declaradas para uso futuro, e TODOs marcam lugares para lógica avançada.
**Ação:**
*   Ignore se for `TODO`.
*   Não remova variáveis preparadas para a Parte 4 (Function Calling real), a menos que instruído.
*   Erros de tipagem (`any`) são temporários durante a prototipagem de payloads.

## 2. Insights não aparecem

**Verificações:**
1.  O `AzuriaAIProvider` está envolvendo a aplicação no `App.tsx`?
2.  A prop `enabled={true}` está passada para o Provider?
3.  Verifique se o usuário está em uma rota monitorada.
4.  Verifique o console para erros de "Context not found".

## 3. Loop de Eventos

**Sintoma:** Browser travando ou logs infinitos.
**Causa:** Watcher emitindo evento que causa re-render, que dispara watcher novamente.
**Correção:** Verifique o array de dependências do `useEffect` no watcher. Certifique-se de que objetos passados no `emitEvent` não estão sendo recriados a cada render sem `useMemo`.

## 4. "Function not found" no FunctionRegistry

**Causa:** A função que a IA tentou chamar não está listada em `functionDefinitions.ts`.
**Correção:** Registre a função e implemente seu handler.
