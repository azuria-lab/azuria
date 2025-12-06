---
title: Visão Geral - Modo Deus
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Visão Geral

## O que é o Modo Deus?

O **Modo Deus** é a camada de inteligência orquestrada da plataforma Azuria. Diferente de chatbots tradicionais que apenas respondem perguntas, o Modo Deus é um sistema onipresente que:

1.  **Observa** as ações do usuário em tempo real (Watchers).
2.  **Entende** o contexto da tela e dos dados manipulados (Context Store).
3.  **Analisa** padrões e identifica oportunidades ou riscos (AI Orchestrator & Proactive Engine).
4.  **Age** proativamente sugerindo melhorias ou alertando sobre problemas (Insights & Function Calling).

## Objetivos Principais

*   **Onipresença Contextual:** A IA sabe exatamente onde o usuário está e o que está fazendo, eliminando a necessidade de explicações repetitivas.
*   **Proatividade:** Antecipar problemas (ex: queda de margem, risco em licitação) antes que o usuário perceba.
*   **Integração Profunda:** Capacidade de ler e alterar dados da interface diretamente, não apenas conversar.
*   **Assistência Especializada:** Agentes dedicados para Fiscal, Marketplace, Precificação e Licitações.

## Pilares Técnicos

O sistema é construído sobre três pilares fundamentais:

1.  **Reatividade (Reactive AI):** O sistema reage a eventos emitidos pela UI (cliques, digitação, navegação).
    *   *Exemplo:* Usuário digita um custo, a IA recalcula a margem instantaneamente em background.
2.  **Contexto (Contextual AI):** O sistema mantém um estado vivo do que está acontecendo em cada tela.
    *   *Exemplo:* Ao navegar para "Histórico", a IA carrega o contexto das últimas ações para análise.
3.  **Proatividade (Proactive AI):** Um motor autônomo verifica regras de negócio periodicamente.
    *   *Exemplo:* A IA detecta que o lucro caiu 10% nos últimos 3 dias e emite um alerta crítico sem intervenção do usuário.

## Camadas de Abstração

O Modo Deus opera "acima" da aplicação React tradicional, interceptando eventos e injetando inteligência sem acoplar-se fortemente à lógica de negócio legada.

*   **Aplicação React:** Interface do usuário (burra).
*   **Watchers:** Sensores que traduzem ações de UI em Eventos Semânticos.
*   **Event Bus:** Barramento de mensagens central.
*   **AI Orchestrator:** O "cérebro" que processa eventos e toma decisões.
*   **Agentes & Functions:** Executores especializados.
*   **Feedback UI:** Componentes de retorno (Toasts, Bubble, Mini Dashboard).
