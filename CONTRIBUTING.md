# Contribuindo para o Azuria

O Azuria é um software proprietário. Contribuições externas podem ser limitadas ou rejeitadas conforme critérios internos. Caso deseje propor melhorias estratégicas ou integrações empresariais, entre em contato previamente via [parcerias@azuria.com](mailto:parcerias@azuria.com).

Este guia aplica-se apenas a colaboradores previamente autorizados.

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

## Checklist Rápido Antes do PR

- [ ] `npm ci` sem erros
- [ ] Lint & type-check limpos
- [ ] Testes smoke passando
- [ ] Sem dados sensíveis ou chaves expostas
- [ ] Atualizou docs se necessário

## Pull Requests

- Descreva o problema e a solução.
- Inclua evidências (prints ou logs) quando possível.
- Aguarde pelo menos 1 aprovação para merge.

## Código de Conduta

Ao contribuir, você concorda com o nosso [Código de Conduta](./CODE_OF_CONDUCT.md).

## Proteção de Branch (main)

A branch `main` exige que os checks `Lint`, `Type check`, `Tests (smoke)` e `Build` estejam verdes. Se os nomes dos jobs mudarem, atualize o arquivo `branch-protection.config.json` e re‑aplique a política:

```powershell
pwsh ./scripts/apply-branch-protection.ps1
```

Ou faça um dry-run para inspecionar o JSON antes:

```powershell
pwsh ./scripts/apply-branch-protection.ps1 -DryRun
```

Isso evita o problema de “expected status checks” com contexts desatualizados.
