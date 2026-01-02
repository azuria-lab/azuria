# 🔒 Mercado Pago - Arquitetura Segura (Backend Only)

## ✅ Decisão de Arquitetura

**Toda a integração com Mercado Pago é feita via Edge Functions no backend.**

### Por que isso é melhor?

1. **Segurança**: Access Token nunca exposto no frontend
2. **Centralização**: Toda lógica de pagamento em um só lugar
3. **Manutenção**: Mais fácil atualizar e corrigir
4. **Auditoria**: Logs centralizados no Supabase
5. **Validação**: Validações de negócio no backend

---

## 🏗️ Arquitetura Atual

```
Frontend (React)
    ↓
    Chama Edge Function via Supabase Client
    ↓
Edge Function (Supabase)
    ↓
    Usa MERCADOPAGO_ACCESS_TOKEN (secret)
    ↓
API Mercado Pago
    ↓
    Retorna URL de checkout
    ↓
Frontend
    ↓
    Redireciona para checkout do Mercado Pago
```

---

## 🔑 Credenciais

### ✅ Backend (Edge Functions)

**Onde configurar:**
- Supabase Dashboard → Settings → Functions → Secrets
- Secret: `MERCADOPAGO_ACCESS_TOKEN`
- Valor: `APP_USR-xxxxx...` (produção) ou `TEST-xxxxx...` (teste)

**Usado para:**
- Criar preferências de pagamento
- Criar assinaturas recorrentes
- Buscar dados de pagamentos
- Cancelar assinaturas
- Processar webhooks

### ❌ Frontend (Removido)

**NÃO é mais necessário:**
- ~~`VITE_MERCADOPAGO_PUBLIC_KEY`~~ (removido)
- ~~SDK do Mercado Pago no frontend~~ (não usado)

**Por quê?**
- A chave pública era usada apenas para inicializar o SDK
- Não usamos o SDK no frontend
- Tudo é feito via Edge Functions

---

## 📋 Edge Functions Utilizadas

### 1. `create-payment-preference`
- **Função**: Cria preferência de pagamento único
- **Chamada**: `supabase.functions.invoke('create-payment-preference')`
- **Retorna**: `{ checkoutUrl, preferenceId }`

### 2. `create-subscription`
- **Função**: Cria assinatura recorrente
- **Chamada**: `supabase.functions.invoke('create-subscription')`
- **Retorna**: `{ checkoutUrl, subscriptionId }`

### 3. `mercadopago-webhook`
- **Função**: Recebe notificações do Mercado Pago
- **Chamada**: Automática pelo Mercado Pago
- **Processa**: Atualiza status das assinaturas

### 4. `cancel-subscription`
- **Função**: Cancela assinatura
- **Chamada**: `supabase.functions.invoke('cancel-subscription')`
- **Retorna**: Status da cancelamento

---

## 🔐 Segurança

### ✅ O que está seguro

1. **Access Token**: Apenas no backend (Supabase Secrets)
2. **Validação de autenticação**: Todas as Edge Functions validam JWT
3. **Validação de negócio**: Lógica no backend
4. **Logs**: Centralizados no Supabase

### ⚠️ O que não expor

1. **Access Token**: Nunca no frontend
2. **Service Role Key**: Apenas nas Edge Functions
3. **Webhook Secret**: Apenas nas Edge Functions

---

## 🧪 Testando

### Frontend

```typescript
// Exemplo de uso
const { startCheckout } = useMercadoPago();

// Criar assinatura
startCheckout('essencial', true, 'monthly');
// ↑ Chama Edge Function → Recebe URL → Redireciona
```

### Backend (Edge Function)

```typescript
// Edge Function já tem acesso ao token
const preference = await mercadoPagoRequest('/checkout/preferences', {
  method: 'POST',
  body: JSON.stringify({...})
});
```

---

## 📊 Comparação

### ❌ Arquitetura Antiga (Frontend + Backend)

```
Frontend
  ↓ Usa SDK do Mercado Pago
  ↓ Precisa de Public Key
  ↓ Cria preferência diretamente
API Mercado Pago
```

**Problemas:**
- Public Key exposta no frontend
- Lógica de negócio no frontend
- Difícil de auditar
- Difícil de atualizar

### ✅ Arquitetura Atual (Backend Only)

```
Frontend
  ↓ Chama Edge Function
Edge Function
  ↓ Usa Access Token (secret)
  ↓ Valida autenticação
  ↓ Valida regras de negócio
  ↓ Cria preferência
API Mercado Pago
  ↓ Retorna URL
Frontend
  ↓ Redireciona para checkout
```

**Vantagens:**
- ✅ Access Token seguro
- ✅ Lógica centralizada
- ✅ Fácil de auditar
- ✅ Fácil de atualizar
- ✅ Validações no backend

---

## 🔄 Migração para Produção

### 1. Atualizar Access Token no Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **"Secrets"**
3. Edite `MERCADOPAGO_ACCESS_TOKEN`
4. Substitua por token de produção: `APP_USR-xxxxx...`
5. Salve

### 2. Remover Variável do Frontend (Vercel)

**NÃO é mais necessário configurar:**
- ~~`VITE_MERCADOPAGO_PUBLIC_KEY`~~ (removido)

**Se ainda estiver configurado no Vercel:**
- Pode remover (não é usado)
- Ou deixar (não causa problemas, mas não é necessário)

---

## ✅ Checklist de Segurança

- [x] Access Token apenas no backend (Supabase Secrets)
- [x] Nenhuma credencial no frontend
- [x] Todas as Edge Functions validam autenticação JWT
- [x] Webhook valida assinatura secreta
- [x] Logs centralizados no Supabase
- [x] Validações de negócio no backend
- [x] CORS configurado corretamente

---

## 📚 Referências

- **Mercado Pago Docs**: https://www.mercadopago.com.br/developers/pt/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Segurança**: https://www.mercadopago.com.br/developers/pt/docs/security

---

**Última atualização**: 01/01/2025  
**Status**: ✅ Arquitetura Segura Implementada

