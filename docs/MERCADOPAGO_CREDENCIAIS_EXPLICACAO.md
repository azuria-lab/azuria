# 🔑 Credenciais do Mercado Pago - Explicação

## 📋 O que cada credencial faz

### ✅ Access Token (NECESSÁRIO)

**O que é:**
- Token de autenticação para fazer requisições à API do Mercado Pago
- Usado diretamente nas Edge Functions

**Onde usar:**
- ✅ Supabase → Settings → Functions → Secrets
- ✅ Secret: `MERCADOPAGO_ACCESS_TOKEN`
- ✅ Valor: `APP_USR-xxxxx...` (produção) ou `TEST-xxxxx...` (teste)

**Como é usado:**
```typescript
// Edge Function usa assim:
const response = await fetch('https://api.mercadopago.com/...', {
  headers: {
    Authorization: `Bearer ${accessToken}`, // ← Access Token aqui
    'Content-Type': 'application/json',
  },
});
```

---

### ❌ Public Key (NÃO NECESSÁRIO)

**O que é:**
- Chave pública para usar o SDK do Mercado Pago no frontend
- Usada para criar tokens de cartão no cliente

**Por que não precisamos:**
- ✅ Toda integração é feita via Edge Functions (backend)
- ✅ Não usamos SDK do Mercado Pago no frontend
- ✅ Frontend apenas chama Edge Functions e recebe URL de checkout

**Status:** Removido do código

---

### ❌ Client ID (NÃO NECESSÁRIO)

**O que é:**
- Identificador da aplicação no Mercado Pago
- Usado em fluxos OAuth

**Por que não precisamos:**
- ✅ Não usamos OAuth
- ✅ Usamos Access Token diretamente
- ✅ Não é necessário para nossa integração

**Status:** Não usado

---

### ❌ Client Secret (NÃO NECESSÁRIO)

**O que é:**
- Segredo da aplicação para fluxos OAuth
- Usado junto com Client ID para autenticação OAuth

**Por que não precisamos:**
- ✅ Não usamos OAuth
- ✅ Usamos Access Token diretamente
- ✅ Não é necessário para nossa integração

**Status:** Não usado

---

## 🎯 Resumo

### ✅ O que você PRECISA cadastrar

| Credencial | Onde | Para quê |
|------------|------|----------|
| **Access Token** | Supabase Secrets | Fazer requisições à API |

### ❌ O que você NÃO precisa cadastrar

| Credencial | Por quê |
|------------|---------|
| **Public Key** | Não usamos SDK no frontend |
| **Client ID** | Não usamos OAuth |
| **Client Secret** | Não usamos OAuth |

---

## 🔍 Como verificamos isso?

Analisando o código das Edge Functions:

```typescript
// supabase/functions/_shared/utils.ts
export async function mercadoPagoRequest<T>(...) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  // ↑ Apenas Access Token é usado
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`, // ← Só precisa do Access Token
      'Content-Type': 'application/json',
    },
  });
}
```

**Resultado:** Apenas `MERCADOPAGO_ACCESS_TOKEN` é necessário!

---

## ✅ Checklist Final

- [x] Access Token cadastrado no Supabase
- [x] Public Key removida do frontend (não necessária)
- [x] Client ID não cadastrado (não necessário)
- [x] Client Secret não cadastrado (não necessário)

---

**Última atualização**: 01/01/2025

