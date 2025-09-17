# Segurança de Cabeçalhos HTTP (Security Headers)

Este documento descreve a política recomendada de cabeçalhos de segurança para o frontend do **Azuria** e fornece orientação sobre verificações automatizadas.

## 🎯 Objetivos

1. Reduzir superfície de ataque contra XSS, clickjacking, MIME sniffing e injeções.
2. Permitir evolução gradual (modo Report-Only onde aplicável).
3. Automatizar regressões via script/CI.

## 🧱 Cabeçalhos Recomendados

| Cabeçalho | Valor Recomendado (Inicial) | Propósito | Status Planejado |
|-----------|-----------------------------|-----------|------------------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | Força HTTPS | Planejado (aplicar após garantir HTTPS em todos subdomínios) |
| Content-Security-Policy | ver seção abaixo | Mitiga XSS / injeções | Iniciar em `Report-Only` |
| X-Content-Type-Options | `nosniff` | Evita MIME sniffing | Imediato |
| X-Frame-Options | `DENY` ou `SAMEORIGIN` | Mitiga clickjacking | Imediato (`DENY` se não houver embed legítimo) |
| Referrer-Policy | `strict-origin-when-cross-origin` | Minimiza vazamento de URL | Imediato |
| Permissions-Policy | ver seção abaixo | Restrição de APIs sensíveis | Gradual |
| Cross-Origin-Opener-Policy | `same-origin` | Isolamento contra ataques cross-window | Gradual |
| Cross-Origin-Embedder-Policy | `require-corp` (avaliar) | Proteção shared array buffers / isolamento | Avaliar impacto |
| Cross-Origin-Resource-Policy | `same-origin` ou `cross-origin` seletivo | Restringe recursos | Avaliar |
| X-Permitted-Cross-Domain-Policies | `none` | Evita Flash/Adobe legacy | Opcional |
| X-XSS-Protection | `0` | Desativar filtro legado inconsist. | Opcional/Desnecessário |

### Content-Security-Policy (CSP)

Recomendação baseline (Report-Only inicialmente):

```http
Content-Security-Policy-Report-Only: \
  default-src 'self'; \
  script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net cdn.skypack.dev; \
  style-src 'self' 'unsafe-inline' fonts.googleapis.com; \
  font-src 'self' fonts.gstatic.com; \
  img-src 'self' data: blob: https:; \
  connect-src 'self' https://api.azuria.app wss://*.supabase.co https://*.supabase.co; \
  frame-ancestors 'none'; \
  base-uri 'self'; \
  form-action 'self'; \
  object-src 'none'; \
  upgrade-insecure-requests; \
  report-to csp-endpoint;


Depois de remover dependências que exigem `unsafe-inline/unsafe-eval`, endurecer com nonce ou hash.

#### Fase 1 (Implementada)

Meta tag (fallback local) adicionada em `index.html` com baseline restritiva e exceções mínimas:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://SUPABASE_PROJECT.supabase.co;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://SUPABASE_PROJECT.supabase.co wss://SUPABASE_PROJECT.supabase.co;
frame-src 'none';
```

Motivações / Observações:

* `unsafe-inline` e `unsafe-eval` mantidos temporariamente para compatibilidade com bundles e libs que injetam código dinâmico.
* `connect-src` inclui Supabase (REST + WebSocket realtime/auth).
* `img-src` permite `data:` para ícones embutidos.
* `frame-ancestors 'none'` evita embed do app (clickjacking mitigation).

Próximos passos (Fase 2 / 3):

1. Instrumentar coleta de violações em modo `Report-Only` via cabeçalho HTTP.
2. Remover `unsafe-eval` (verificar dependências que usam `new Function` / `eval`).
3. Inserir nonce (build inject) para scripts inline críticos e então remover `unsafe-inline`.
4. Adicionar `upgrade-insecure-requests` e possivelmente `strict-dynamic` após eliminar inline não autorizado.
5. Adicionar `report-to` / `report-uri` apontando para endpoint interno (pipeline de triagem).

Critério para avançar para enforcement: 0 violações críticas em janela de 7 dias.


### Permissions-Policy

Exemplo sugerido (ajustar conforme funcionalidades reais):

```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self), accelerometer=(), usb=()
```

## 🔄 Estratégia de Adoção

1. Fase 1: Cabeçalhos simples (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS se seguro).
2. Fase 2: CSP em modo Report-Only + coleta de relatórios.
3. Fase 3: Endurecimento (remover `unsafe-*`, adicionar nonce/hash).
4. Fase 4: Policies avançadas (COOP/COEP) se necessário para SharedArrayBuffer/performance.

## 🧪 Automação

Script de verificação (`scripts/check-security-headers.mjs`) fará:

* Requisição HTTP GET para URL alvo (env var `SECURITY_CHECK_URL` ou fallback `http://localhost:4173`).
* Validação de presença/valor de cabeçalhos mínimos.
* Saída em formato TAP-like ou JSON.
* Exit code != 0 em caso de falha (usado em CI).

## ✅ Conjunto Mínimo Inicial

Obrigatórios na primeira checagem (flexível se ambiente local):

* `x-content-type-options = nosniff`
* `x-frame-options = DENY|SAMEORIGIN`
* `referrer-policy = strict-origin-when-cross-origin`

Opcional / Warning:

* `strict-transport-security`
* `content-security-policy(-report-only)`

## 📦 Deployment Considerations

* Em plataformas como Vercel / Netlify: configurar via cabeçalho estático (`_headers`) ou edge middleware.
* Em CDN própria / Nginx: adicionar bloco `add_header` consistente em todas rotas.
* Garantir não duplicar CSP (evita merges inseguras).

## 🧪 Futuro: Relatórios

Se habilitado `report-to` / `report-uri`, configurar endpoint interno ou serviço externo (ex.: Report URI) e monitorar violações antes de endurecer.

## 🧾 Referências

* OWASP Secure Headers Project
* MDN Web Docs – HTTP Security Headers
* Google Web Fundamentals – CSP

---

*Este documento evoluirá conforme endurecermos a postura de segurança.*
