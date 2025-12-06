---
title: Documentação Oficial - Modo Deus
date: 2025-12-05
author: Agente Azuria
---

# Azuria AI - Modo Deus (Documentation Hub)

Bem-vindo à central de documentação do subsistema de IA autônoma da Azuria.

## Onde começar?

1.  **Visão Geral**: Entenda o conceito e a arquitetura em [overview.md](overview.md) e [architecture.md](architecture.md).
2.  **Desenvolvedores**:
    *   Para entender os arquivos: [components.md](components.md).
    *   Para configurar seu ambiente: **[migration_to_vscode.md](migration_to_vscode.md)**.
3.  **Máquinas/Agentes**:
    *   Use o **[mode-deus-manifest.json](mode-deus-manifest.json)** para importar todo o contexto do projeto em uma única leitura.

## Estrutura da Documentação

*   `/overview.md`: O "Porquê" e o "O quê".
*   `/architecture.md`: Diagramas e camadas.
*   `/events.md`: Catálogo de eventos do barramento.
*   `/watchers.md`: Documentação dos sensores.
*   `/proactive.md`: Regras do motor autônomo.
*   `/api-reference.md`: Funções disponíveis para a IA.
*   `/CHANGELOG_MODE_DEUS.md`: Histórico de versões.

## Scripts de Teste

O sistema possui uma suíte de testes automatizados (Playwright + Scripts) em `/scripts/mode-deus-tests`.

Para rodar todos os testes:
```bash
./scripts/mode-deus-tests/run-all.sh
```

## Próximos Passos (Roadmap)

Conforme detalhado no manifesto:
1.  Implementar lógica real de Function Calling (conectar aos endpoints de backend).
2.  Adicionar persistência ao Context Store (para lembrar do usuário entre sessões).
3.  Refinar regras proativas com base em feedback real de uso.
