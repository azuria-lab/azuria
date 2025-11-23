# 🔧 Variáveis de Ambiente - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Variáveis Obrigatórias](#variáveis-obrigatórias)
3. [Variáveis Opcionais](#variáveis-opcionais)
4. [Por Ambiente](#por-ambiente)

---

## 🎯 Visão Geral

Lista completa de todas as variáveis de ambiente utilizadas no projeto.

---

## ✅ Variáveis Obrigatórias

### Supabase

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Variáveis Opcionais

### Supabase (Modo Hybrid)

```env
VITE_SUPABASE_MODE=cloud|local|hybrid
VITE_SUPABASE_CLOUD_URL=https://your-project.supabase.co
VITE_SUPABASE_CLOUD_ANON_KEY=your-cloud-key
VITE_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
VITE_SUPABASE_LOCAL_ANON_KEY=your-local-key
```

### Stripe

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
VITE_STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
```

### Mercado Pago

```env
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-... ou APP_USR-...
```

### OpenAI

```env
VITE_OPENAI_API_KEY=sk-...
```

### Google Analytics

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🌍 Por Ambiente

### Desenvolvimento

Todas as variáveis podem ser definidas em `.env.local`.

### Produção

Configure no Vercel Dashboard ou plataforma de deploy.

---

## 📚 Referências

- [README Principal](../README.md#variáveis-de-ambiente)

---

**Fim da Documentação**

