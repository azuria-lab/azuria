# Roadmap Estratégico

> Última atualização: 2025-09-16

## Visão

Construir uma plataforma segura, observável e sustentável, onde cada incremento de funcionalidade mantém (ou melhora) confiabilidade, performance e governança.

## Pilares

| Pilar | Objetivo | Métricas Indicativas |
|-------|----------|----------------------|
| Segurança | Reduzir superfície de ataque e detectar regressões cedo | Headers OK, CSP endurecendo, SBOM limpo |
| Qualidade | Feedback rápido e confiável em PRs | < 5 min test+type, cobertura >= alvo, 0 flaky |
| Observabilidade | Tornar anomalias detectáveis em 1 ciclo | Eventos fetch, métricas latência |
| Governança | Evitar dívida silenciosa (flags órfãs, deps críticas) | Flags com metadata, diffs SBOM revistos |
| Performance | Garantir baseline estável antes de otimizações | Smoke/perf determinísticos |
| Dev Experience | Fricção baixa para contribuições seguras | Scripts claros, docs objetivas |

## Estado Atual (Baseline)

- Segurança: Headers base + CSP Fase 1 (parcial). Falta remover `unsafe-eval` e inline.
- Qualidade: Suite estável reduzida (2 smoke avançados em `skip`). Cobertura: badge automatizado (limites ainda não aplicados).
- Observabilidade: Sem eventos de rede ainda.
- Governança: Flags sem metadata; SBOM gerado mas sem diff gate.
- Performance: Teste performance skip até estabilização providers/act.
- DevEx: Validação de env, fetch resiliente, docs segurança maduras.

## Horizonte 30 / 60 / 90 Dias

### 0–30 dias (Prioridade Alta)

1. Metadata de Feature Flags (owner, descrição, criadoEm, expiraEm, rationale) + lint.
2. Threshold & Delta de Cobertura (gate mínimo + impedir quedas > N pontos).
3. Eventos de Métricas do Fetch (latência, retries, status final) + testes.
4. Script Diff SBOM (comparar contra `main`, falhar em adições de risco).
5. Remover `act()` warnings (refatorar AuthProvider/test harness) e reativar smoke avançados.

### 31–60 dias (Endurecimento)

1. CSP Fase 2 (remover `unsafe-eval`, introduzir nonce/hash para inline crítico se existir).
2. Expandir verificação de Security Headers (incluir variação ambiente + checagem CSP dynamic/report endpoint futuro).
3. Observabilidade Fetch – canalizar eventos para agregador simples (ex: console.debug -> plugin futuro).
4. Enriquecer relatórios CI (resumo: cobertura delta, novos pacotes SBOM, flags prestes a expirar).

### 61–90 dias (Maturidade)

1. CSP Fase 3 (eliminar inline residual, converter para header servidor).
2. Gate de performance sintético (tempo de montagem principal, TTFB simulado em mock).
3. Automatizar aviso de flags vencendo (GitHub Issue ou log CI).
4. Política de dependências críticas (bloquear libs sem assinatura / reputação baixa via allowlist).

## Backlog Detalhado

| ID | Item | Descrição | Criticidade | Dependências | Critério de Conclusão |
|----|------|-----------|-------------|--------------|-----------------------|
| 9 | Metadata de feature flags | Estrutura + script lint | Alta | Nenhuma | PR falha se flag sem metadata ou expirada |
| 12 | Cobertura thresholds & delta | Enforce % global + delta vs main | Alta | Cobertura atual | Workflow falha fora dos limites |
| 10 | Eventos métricas fetch | Dispatch/observer com payload padronizado | Alta | Fetch resiliente | Teste captura evento + doc |
| 11 | Script diff SBOM | Detecta libs novas e classifica risco | Alta | SBOM atual | CI falha se novas libs sem aprovação |
| 14 | Remover act warnings | Ajustar montagem provider/test utils | Alta | Setup test atual | Smoke sem warnings repetidos |
| 15 | Reintroduzir smoke avançados | Reativar performance + calculator | Alta | 14 | 0 flakiness em 5 execuções seguidas |
| 13 | CSP Fase 2 | Remover unsafe-eval, nonce/hashes | Média | CSP Fase 1 | Header/meta sem unsafe-eval |
| 17 | Expandir verificação headers | Validar CSP dinâmica / variações | Média | 13 | Script cobre >90% políticas |
| 16 | Observabilidade fetch (canal) | Agrupar eventos (console/plugin) | Média | 10 | Canal configurável habilita/desabilita |
| — | CSP Fase 3 | Eliminar inline + header server | Média | 13 | Apenas hashes/nonce; sem inline cru |
| — | Gate performance sintético | Métrica básica build/PR | Média | Reintrodução smoke | Fails se regressão > threshold |
| — | Alerta flags expirando | Job CI abre issue | Baixa | 9 | Issue gerada <7 dias da expiração |
| — | Política deps críticas | Allowlist + verificação assinaturas | Baixa | SBOM diff | Falha se pacote fora política |

## Sequenciamento Recomendado (Risco vs Valor)

1. Metadata Flags → pequena superfície, alto retorno governança.
2. Cobertura thresholds → evita regressões silenciosas cedo.
3. Eventos métricas fetch → base para any future SLO.
4. SBOM diff → segurança supply chain antes de escala.
5. Remoção act warnings → desbloqueia cobertura real de smoke/perf.
6. Reintrodução smoke avançados → raise confidence.
7. CSP Fase 2 → endurecimento incremental sem ruptura grande.
8. Expand header check → reduz risco regressão config.
9. Observabilidade canal → prepara dashboards futuros.

## Estrutura Técnica Proposta

### Feature Flags Metadata

- Extender `src/config/featureFlags.ts`: Map estruturado `{ key: { enabledByDefault, owner, createdAt, expiresAt, description, tags? } }`.
- Lint script (`scripts/lint-feature-flags.mjs`):
  - Falha se `expiresAt` passado.
  - Warn se `expiresAt` < 14 dias.
  - Falha se `owner` ausente.
- CI: rodar após type-check.

### Cobertura Threshold & Delta

- Workflow coverage: adicionar step que:
  - Lê `coverage/coverage-summary.json`.
  - Compara com artifact de `main` (usar `actions/download-artifact` ou `gh api` fallback).
  - Falha se global < alvo (ex: 70%) ou delta < -2.

### Eventos Métricas Fetch

- Em `resilientFetch` capturar: `method, url(origin+path), status, ok, retries, startTime, endTime, durationMs, errorType`.
- Emitir `window.dispatchEvent(new CustomEvent('fetch:metrics', { detail }))` (no SSR: no-op).
- Teste: escuta evento e valida payload básico.

### SBOM Diff

- Baixar artefato SBOM branch base (`main`).
- Normalizar (ordenar por nome+versão).
- Classificar novidades (ex: se contém `crypto`, `eval`, `native` → label risco).
- Falhar se novidade sem aprovação (lista de allow ou annotation commit message).

### Remoção act warnings

- Criar util `renderWithProviders` com montagem síncrona.
- Mock de auth adaptado: resolver imediatamente promises pendentes.
- Substituir usos diretos nos smoke tests.

## Métricas de Sucesso Iniciais

- 0 testes em `skip` (exceto explicitamente end-to-end experimentais) até D+45.
- Aumento de 0 → >=70% cobertura global sem quedas >2 pontos após habilitar gate.
- Tempo médio build+test < 6 min após gates.
- 100% das flags com metadata e nenhuma expirada em `main`.

## Riscos & Mitigações

| Risco | Mitigação |
|-------|-----------|
| Gate cobertura flakey por branch base desatualizada | Usar baseline de último `main` bem-sucedido, fallback tolerância +1 ponto |
| Eventos fetch causando overhead | Debounce/agrupar console; permitir desligar via env `VITE_OBSERVABILITY_FETCH=off` |
| SBOM diff ruído inicial | Primeiro run em modo "audit" (warning) antes de falhar |
| CSP endurecimento quebrar libs | Coletar violations (Report-Only) 1 semana antes de aplicar |

## Próximos Passos Imediatos

1. Implementar metadata de flags + script lint.
2. Escrever script cobertura delta (reutilizar parsing do badge).
3. Adicionar dispatch de métricas fetch.
4. Criar script SBOM diff em modo audit (warning).

---

_Manter este arquivo vivo: atualizar se prioridades mudarem ou após cada marco concluído._
