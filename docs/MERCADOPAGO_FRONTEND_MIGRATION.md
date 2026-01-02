# 🔄 Migração Frontend: AbacatePay → Mercado Pago

## ✅ Alterações Realizadas

### 1. **PricingPage.tsx**
- ❌ Removido: `useAbacatePay`
- ✅ Adicionado: `useMercadoPago`
- ✅ Atualizado: `handleSelectPlan` para usar `startCheckout` com `billingInterval`

### 2. **mercadopago-client.ts**
- ✅ Atualizado: `createPaymentPreference` para usar `create-payment-preference`
- ✅ Ajustado: Parâmetros para `planId` e `billingInterval`
- ✅ Adaptado: Resposta da Edge Function para formato esperado

### 3. **useMercadoPago.tsx**
- ✅ Atualizado: `startCheckout` para aceitar `billingInterval`
- ✅ Implementado: Suporte para preferências de pagamento com intervalo

---

## 🧪 Testar Agora

1. **Acesse**: https://azuria.app.br/planos
2. **Selecione um plano** (Essencial, Pro, etc.)
3. **Clique em "Começar agora"**
4. **Deve redirecionar** para o checkout do Mercado Pago

---

## ⚠️ Possíveis Problemas

### Erro CORS
Se ainda aparecer erro CORS:
1. Verificar se a Edge Function `create-payment-preference` está deployada
2. Verificar se o `withSecurityMiddleware` está permitindo a origem `https://azuria.app.br`

### Erro 401
Se aparecer erro 401:
1. Verificar se o usuário está autenticado
2. Verificar se o token JWT está sendo enviado corretamente

### Erro 404
Se aparecer erro 404:
1. Verificar se a função `create-payment-preference` está deployada
2. Verificar o nome da função no Supabase Dashboard

---

## 📋 Checklist

- [x] PricingPage atualizada para usar Mercado Pago
- [x] mercadopago-client atualizado
- [x] useMercadoPago atualizado
- [ ] Testar criação de preferência
- [ ] Testar redirecionamento para checkout
- [ ] Testar pagamento completo

---

**Última atualização**: 01/01/2025

