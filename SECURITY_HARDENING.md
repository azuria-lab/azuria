# 🔒 Security Hardening - Azuria

Este documento descreve as configurações de segurança implementadas no projeto Azuria, incluindo CORS, Security Headers e middleware de segurança.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [CORS Whitelist](#cors-whitelist)
3. [Security Headers](#security-headers)
4. [Middleware de Segurança](#middleware-de-segurança)
5. [Como Adicionar Novos Domínios](#como-adicionar-novos-domínios)
6. [Boas Práticas](#boas-práticas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Security Hardening Pack implementa uma camada robusta de segurança em todo o projeto, incluindo:

- ✅ **CORS com whitelist dinâmica** por ambiente
- ✅ **Security Headers** (HSTS, CSP, COOP, CORP)
- ✅ **Middleware global** para Edge Functions
- ✅ **Validação de origem** em todas as requisições
- ✅ **Bloqueio automático** de origens não autorizadas

---

## 🌐 CORS Whitelist

### Domínios Permitidos por Ambiente

#### Produção
```typescript
'https://azuria.app.br'
'https://www.azuria.app.br'
'https://app.azuria.app.br'
```

#### Staging
```typescript
'https://staging.azuria.app.br'
'https://azuria-lab-azuria.vercel.app'
```

#### Desenvolvimento
```typescript
'http://localhost:8080'
'http://localhost:5173'
'http://localhost:3000'
'http://127.0.0.1:8080'
'http://127.0.0.1:5173'
```

### Detecção Automática de Ambiente

O ambiente é detectado automaticamente baseado nas variáveis:
- `VERCEL_URL`
- `FRONTEND_URL`

**Lógica:**
1. Se contém `azuria.app.br` (sem `staging`) → **Produção**
2. Se contém `staging` ou `vercel.app` → **Staging**
3. Caso contrário → **Desenvolvimento**

### Regras CORS

**Métodos Permitidos:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Headers Permitidos:**
```
Authorization, Content-Type, X-Requested-With
```

**Credenciais:**
- Permitidas apenas quando `allowCredentials: true`
- Usado em Edge Functions que requerem autenticação

**Max-Age:**
- 86400 segundos (24 horas)

---

## 🛡️ Security Headers

### Headers Obrigatórios

#### 1. Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Propósito:** Força HTTPS por 2 anos, incluindo subdomínios

**Benefícios:**
- Previne downgrade attacks
- Protege contra man-in-the-middle
- Elegível para HSTS preload list

#### 2. X-Frame-Options
```
X-Frame-Options: DENY
```

**Propósito:** Previne clickjacking

**Benefícios:**
- Bloqueia embedding em iframes
- Protege contra UI redressing attacks

#### 3. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Propósito:** Previne MIME sniffing

**Benefícios:**
- Força respeito ao Content-Type declarado
- Previne execução de scripts disfarçados

#### 4. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Propósito:** Controla informações de referrer

**Benefícios:**
- Envia origem completa para same-origin
- Envia apenas origem para cross-origin
- Protege privacidade do usuário

#### 5. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

**Propósito:** Desabilita APIs sensíveis

**Benefícios:**
- Bloqueia acesso a câmera/microfone
- Desabilita geolocalização
- Opt-out de FLoC (interest-cohort)

#### 6. Cross-Origin-Opener-Policy (COOP)
```
Cross-Origin-Opener-Policy: same-origin
```

**Propósito:** Isola contexto de navegação

**Benefícios:**
- Previne ataques Spectre
- Protege contra cross-origin attacks

#### 7. Cross-Origin-Resource-Policy (CORP)
```
Cross-Origin-Resource-Policy: same-origin
```

**Propósito:** Controla quem pode carregar recursos

**Benefícios:**
- Previne Spectre attacks
- Protege contra cross-origin reads

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com https://api.mercadopago.com https://api.ipify.org;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

**Diretivas Explicadas:**

- `default-src 'self'` - Apenas recursos do mesmo domínio
- `script-src 'self' 'unsafe-inline'` - Scripts inline permitidos (React)
- `style-src` - Estilos inline + Google Fonts
- `font-src` - Fontes do Google Fonts
- `img-src` - Imagens de qualquer HTTPS + data URLs
- `connect-src` - APIs externas autorizadas
- `frame-ancestors 'none'` - Não pode ser embedado
- `upgrade-insecure-requests` - Força HTTPS

---

## ⚙️ Middleware de Segurança

### Localização

```
supabase/functions/_shared/security-config.ts
```

### Funções Principais

#### `isOriginAllowed(origin: string): boolean`

Valida se uma origem está na whitelist.

**Uso:**
```typescript
if (isOriginAllowed(req.headers.get('origin'))) {
  // Origem permitida
}
```

#### `getCorsHeaders(request: Request, options?: CorsOptions): Record<string, string>`

Retorna headers CORS apropriados para a requisição.

**Opções:**
```typescript
interface CorsOptions {
  allowCredentials?: boolean;  // Default: false
  allowedMethods?: string[];   // Default: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  allowedHeaders?: string[];   // Default: ['Authorization', 'Content-Type', 'X-Requested-With']
  maxAge?: number;             // Default: 86400
}
```

#### `getSecurityHeaders(nonce?: string): Record<string, string>`

Retorna todos os security headers.

**Uso:**
```typescript
const headers = getSecurityHeaders();
// Inclui HSTS, X-Frame-Options, CSP, etc.
```

#### `withSecurityMiddleware(handler, options?): Function`

Wrapper que aplica segurança automaticamente.

**Uso:**
```typescript
import { withSecurityMiddleware } from '../_shared/security-config.ts';

async function myHandler(req: Request): Promise<Response> {
  // Sua lógica aqui
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Aplicar middleware
Deno.serve(withSecurityMiddleware(myHandler, { allowCredentials: true }));
```

**O que o middleware faz:**

1. ✅ Valida origem contra whitelist
2. ✅ Trata requisições OPTIONS (CORS preflight)
3. ✅ Bloqueia origens não autorizadas (403)
4. ✅ Adiciona security headers a todas as respostas
5. ✅ Trata erros com headers de segurança

---

## ➕ Como Adicionar Novos Domínios

### 1. Editar security-config.ts

Abra o arquivo:
```
supabase/functions/_shared/security-config.ts
```

### 2. Adicionar ao Ambiente Apropriado

```typescript
const ALLOWED_ORIGINS = {
  production: new Set([
    'https://azuria.app.br',
    'https://www.azuria.app.br',
    'https://app.azuria.app.br',
    'https://novo-dominio.com',  // ← Adicionar aqui
  ]),
  staging: new Set([
    'https://staging.azuria.app.br',
    'https://azuria-lab-azuria.vercel.app',
  ]),
  development: new Set([
    'http://localhost:8080',
    'http://localhost:5173',
  ]),
};
```

### 3. Testar Localmente

```bash
# Iniciar Edge Function localmente
supabase functions serve azuria-chat

# Testar com curl
curl -H "Origin: https://novo-dominio.com" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:54321/functions/v1/azuria-chat
```

### 4. Deploy

```bash
# Deploy da Edge Function
supabase functions deploy azuria-chat
```

### 5. Verificar em Produção

```bash
# Testar CORS
curl -H "Origin: https://novo-dominio.com" \
     -X OPTIONS https://[project].supabase.co/functions/v1/azuria-chat
```

**Esperado:** Headers CORS presentes

---

## ✅ Boas Práticas

### 1. Sempre Use o Middleware

❌ **Não faça:**
```typescript
Deno.serve(async (req) => {
  // Lógica sem middleware
});
```

✅ **Faça:**
```typescript
import { withSecurityMiddleware } from '../_shared/security-config.ts';

async function handler(req: Request): Promise<Response> {
  // Sua lógica
}

Deno.serve(withSecurityMiddleware(handler));
```

### 2. Minimize Credenciais

Use `allowCredentials: true` apenas quando necessário:

```typescript
// Apenas para endpoints autenticados
Deno.serve(withSecurityMiddleware(handler, { allowCredentials: true }));

// Para webhooks públicos
Deno.serve(withSecurityMiddleware(handler));
```

### 3. Valide Input

Sempre valide input mesmo com CORS:

```typescript
import { z } from 'zod';

const schema = z.object({
  message: z.string().min(1).max(1000),
});

const data = schema.parse(await req.json());
```

### 4. Não Confie Apenas em CORS

CORS é proteção do **browser**, não do servidor.

**Sempre implemente:**
- ✅ Autenticação (Authorization header)
- ✅ Validação de input
- ✅ Rate limiting
- ✅ Webhook signatures (para webhooks)

### 5. Monitore Bloqueios

Configure alertas para requisições 403:

```typescript
// Em produção, log bloqueios
if (!isOriginAllowed(origin)) {
  console.warn(`Blocked origin: ${origin}`);
}
```

### 6. Teste em Todos os Ambientes

Antes de deploy:

```bash
# Local
npm run dev

# Staging
# Testar em https://staging.azuria.app.br

# Produção
# Testar em https://azuria.app.br
```

### 7. Mantenha CSP Atualizado

Ao adicionar novas APIs externas, atualize CSP em `vercel.json`:

```json
{
  "key": "Content-Security-Policy",
  "value": "... connect-src 'self' https://nova-api.com ..."
}
```

---

## 🔧 Troubleshooting

### Problema: CORS Error no Browser

**Sintoma:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solução:**
1. Verificar se origem está na whitelist
2. Verificar ambiente (dev/staging/prod)
3. Verificar logs da Edge Function

**Debug:**
```typescript
console.log('Origin:', req.headers.get('origin'));
console.log('Allowed:', getAllowedOriginsForTesting());
```

### Problema: 403 Forbidden

**Sintoma:**
```json
{
  "error": "Forbidden",
  "message": "Origin not allowed",
  "code": "ORIGIN_NOT_ALLOWED"
}
```

**Solução:**
1. Adicionar origem à whitelist
2. Verificar se está usando HTTPS em produção
3. Verificar se domínio está correto (sem trailing slash)

### Problema: Headers Não Aparecem

**Sintoma:**
Security headers não aparecem nas respostas

**Solução:**
1. Verificar se middleware está aplicado
2. Verificar se `vercel.json` está atualizado
3. Fazer redeploy

**Verificar:**
```bash
curl -I https://azuria.app.br | grep -i "strict-transport"
```

### Problema: CSP Bloqueia Recursos

**Sintoma:**
```
Refused to load ... because it violates the following Content Security Policy directive
```

**Solução:**
1. Identificar recurso bloqueado
2. Adicionar domínio ao CSP apropriado
3. Atualizar `vercel.json`
4. Redeploy

**Exemplo:**
```json
"connect-src 'self' https://novo-dominio.com"
```

---

## 📊 Checklist de Segurança

### Antes de Deploy

- [ ] Middleware aplicado em todas as Edge Functions
- [ ] Domínios de produção na whitelist
- [ ] CSP atualizado com APIs externas
- [ ] Testado em staging
- [ ] Logs de bloqueio configurados

### Após Deploy

- [ ] CORS funcionando (testar com curl)
- [ ] Security headers presentes (verificar com curl -I)
- [ ] Nenhuma funcionalidade quebrada
- [ ] Monitoramento de erros 403 configurado
- [ ] Documentação atualizada

---

## 📚 Referências

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN - CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [web.dev - Security Headers](https://web.dev/security-headers/)
- [Vercel Security](https://vercel.com/docs/security)

---

**Última atualização:** 05/12/2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe Azuria
