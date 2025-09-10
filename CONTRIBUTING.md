# Contribuindo para o Azuria

Obrigado por querer contribuir! Este guia ajuda você a começar.

## Pré-requisitos

- Node.js 18+
- npm

## Setup

```powershell
npm ci
npm run -s type-check
npm run -s lint
npm run -s test:smoke
npm run -s dev
```

## Fluxo de trabalho

- Crie uma branch a partir da `main`:

```powershell
git checkout -b feat/minha-feature
```

- Commits seguindo Conventional Commits:

```text
feat: adiciona X
fix: corrige Y
chore: ajustes de tooling
```

## Testes

- Foco em testes rápidos (smoke) para PRs.
- Rode localmente antes de abrir o PR:

```powershell
npm run -s lint; npm run -s type-check; npm run -s test:smoke; npm run -s build
```

## Pull Requests

- Descreva o problema e a solução.
- Inclua evidências (prints ou logs) quando possível.
- Aguarde pelo menos 1 aprovação para merge.

## Código de Conduta

Ao contribuir, você concorda com o nosso [Código de Conduta](./CODE_OF_CONDUCT.md).
