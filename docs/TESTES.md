# 🧪 Testes - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Como Rodar Testes](#como-rodar-testes)
4. [Cobertura](#cobertura)
5. [Mocks e Fixtures](#mocks-e-fixtures)
6. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O projeto utiliza **Vitest** como framework de testes, com suporte a testes unitários, de integração, smoke tests e performance tests.

---

## 📁 Estrutura de Testes

```
src/__tests__/
├── smoke/              # Smoke tests
│   ├── app-smoke.test.tsx
│   ├── performance-smoke.test.ts
│   └── formatCurrency-smoke.test.ts
├── unit/               # Unit tests
│   ├── components/     # Testes de componentes
│   ├── hooks/          # Testes de hooks
│   └── utils/          # Testes de utils
├── integration/        # Integration tests
│   └── calculator-flow.test.tsx
└── performance/        # Performance tests
    └── basic-performance.test.ts
```

---

## 🚀 Como Rodar Testes

### Todos os Testes

```bash
npm run test
```

### Testes Específicos

```bash
# Smoke tests
npm run test:smoke

# Testes de um arquivo específico
npm run test src/__tests__/unit/utils/formatCurrency.test.ts

# Testes de uma pasta
npm run test src/__tests__/unit/
```

### Interface Visual

```bash
npm run test:ui
```

### Cobertura

```bash
npm run test:coverage
```

---

## 📊 Cobertura

### Thresholds Atuais

- **Statements:** 70%
- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 60%

### Gerar Relatório

```bash
npm run test:coverage
```

O relatório será gerado em `./coverage/` (inclui `lcov-report/index.html`).

---

## 🎭 Mocks e Fixtures

### Mocks

Mocks estão localizados junto aos testes ou em pastas `__mocks__/`.

### Fixtures

Fixtures de dados de teste estão em `src/__tests__/fixtures/` (se existir).

---

## ✅ Boas Práticas

1. **Testes isolados:** Cada teste deve ser independente
2. **Nomes descritivos:** Use nomes que descrevam o que está sendo testado
3. **AAA Pattern:** Arrange, Act, Assert
4. **Mocks apropriados:** Use mocks para dependências externas
5. **Cobertura:** Busque alta cobertura mas priorize qualidade

---

## 📚 Referências

- [Vitest Documentation](https://vitest.dev)
- [README Principal](../README.md)

---

**Fim da Documentação**

