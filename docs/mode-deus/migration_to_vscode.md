---
title: Guia de Migração para VS Code
date: 2025-12-05
author: Agente Azuria
version: 1.1.0
---

# Guia de Migração para VS Code (Modo Deus)

Este guia detalha como configurar um ambiente de desenvolvimento robusto no VS Code para trabalhar com o sistema **Azuria AI - Modo Deus**.

## 1. Extensões Recomendadas

Instale o seguinte conjunto de extensões para garantir qualidade de código e produtividade:

*   **ESLint** (`dbaeumer.vscode-eslint`): Linting obrigatório.
*   **Prettier** (`esbenp.prettier-vscode`): Formatação automática.
*   **SonarLint** (`SonarSource.sonarlint-vscode`): Análise estática avançada e segurança.
*   **GitLens** (`eamodio.gitlens`): Visualização profunda do histórico do Git.
*   **Live Share** (`MS-vsliveshare.vsliveshare`): Para pair programming.
*   **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`): Autocomplete para classes CSS.
*   **Debugger for Chrome** (`msjsdiag.debugger-for-chrome`): Debug direto no editor (ou built-in js-debug).
*   **REST Client** (`humao.rest-client`): Para testar endpoints de API e Edge Functions.

## 2. Configurações do Espaço de Trabalho

Crie ou atualize o arquivo `.vscode/settings.json` na raiz do projeto:

```json
{
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.gemini": true // Diretório interno do agente anterior
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 3. Tarefas de Automação (Tasks)

Configure scripts comuns no `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "dev",
      "label": "Azuria: Dev Server",
      "detail": "Inicia o servidor de desenvolvimento Vite",
      "isBackground": true,
      "problemMatcher": ["$tsc-watch"],
      "group": { "kind": "build", "isDefault": true }
    },
    {
      "type": "npm",
      "script": "lint:fix",
      "label": "Azuria: Fix Lint",
      "problemMatcher": []
    },
    {
      "type": "shell",
      "command": "./scripts/mode-deus-tests/run-all.sh",
      "label": "Azuria: Run God Mode Tests",
      "group": "test"
    }
  ]
}
```

## 4. Configuração de Debug (Launch)

Permite debugar o Frontend e Scripts no `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Client (Chrome)",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "name": "Debug Proactive Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/scripts/mode-deus-tests/run-proactive-test.js",
      "console": "integratedTerminal"
    }
  ]
}
```

## 5. Integração com IA (Sonnet / GPT) no VS Code

Para continuar o desenvolvimento com assistentes de IA (como GitHub Copilot, Cursor ou extensões customizadas), siga estas diretrizes:

### Configuração de Modelos
Se estiver usando uma extensão que permite escolher modelos:
*   **Código Complexo (Core/Logic):** Priorize **Claude 3.5 Sonnet** (ou 4.5 se disponível) pela alta capacidade de raciocínio.
*   **Tarefas Repetitivas/Boilerplate:** **GPT-4o (ou 5.1)** pela velocidade.

### Importando o Manifesto do Modo Deus
Para que o novo agente entenda o sistema rapidamente, use o **Manifesto gerado**.

**Prompt sugerido para inicializar o Agente:**

> "Estou trabalhando no projeto Azuria, especificamente no sistema 'Modo Deus'.
> Por favor, leia o arquivo de manifesto em `docs/mode-deus/mode-deus-manifest.json` para entender a arquitetura atual, os módulos existentes (Orchestrator, EventBus, ProactiveEngine) e os testes disponíveis.
> Use este contexto para todas as próximas respostas."

### Policy de Uso
1.  **Não Alucinar Arquivos:** Consulte `manifest.modules` antes de sugerir edições.
2.  **Verificar Eventos:** Consulte `manifest.events` para garantir que nomes de eventos (ex: `calc:updated`) estejam corretos.
3.  **Respeitar Cooldowns:** Ao testar regras proativas, lembre-se dos tempos definidos em `manifest.proactiveRules`.

## 6. Validação do Ambiente

Após configurar o VS Code:

1.  **Instalar Dependências:**
    ```bash
    npm install
    ```
2.  **Rodar o Servidor:**
    Pressione `Ctrl+Shift+B` (ou Command) se configurou a task default, ou rode `npm run dev`.
3.  **Validar Scripts de Teste:**
    Abra o terminal integrado e execute:
    ```bash
    ./scripts/mode-deus-tests/run-all.sh
    ```
    *Sucesso:* O output deve indicar `reactive: PASS` e `proactive: PASS`.

## 7. Variáveis de Ambiente

Certifique-se de configurar estas variáveis no seu `.env.local` (solicite os valores seguros ao gestor do projeto):

*   `VITE_SUPABASE_URL`: URL do projeto Supabase.
*   `VITE_SUPABASE_ANON_KEY`: Chave pública.
*   `VITE_OPENAI_API_KEY`: (Opcional) Para funcionalidades futuras de LLM direto no client.
*   `VITE_AZURIA_ENV`: `local` ou `production`.
*   `VITE_ENABLE_GOD_MODE`: `true` (Para habilitar logs verbose do Orchestrator).
