---
title: Migração e Setup VS Code
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Configuração do Ambiente VS Code

Para trabalhar com o Modo Deus Eficientemente.

## Extensões Recomendadas

*   **ESLint:** Obrigatório para manter padrão de código.
*   **Prettier:** Formatação automática.
*   **SonarLint:** (Opcional) Para análise estática avançada.
*   **Tailwind CSS IntelliSense:** Para UI.

## Settings.json

Recomendamos adicionar ao `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Tarefas (Tasks)

Configure uma task para rodar o Modo Deus em dev:

`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "dev",
      "label": "Azuria: Dev Server",
      "isBackground": true,
      "problemMatcher": ["$tsc-watch"]
    }
  ]
}
```

## Integração com IA (Cursor/Sonnet/GPT)

Ao usar assistentes de IA no código:
1.  Sempre forneça contexto lendo `docs/mode-deus/architecture.md`.
2.  Peça para não alterar arquivos existentes sem necessidade.
3.  Siga o padrão de criar arquivos pequenos e modulares.
