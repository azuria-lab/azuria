# 🚀 Configurar Mercado Pago em Produção

## ⚠️ Importante

Antes de migrar para produção, certifique-se de:
- ✅ Ter uma conta verificada no Mercado Pago
- ✅ Ter CNPJ cadastrado (se necessário)
- ✅ Ter completado a homologação do Mercado Pago
- ✅ Ter testado completamente em modo teste

---

## 📋 Passo a Passo

### 1. Obter Credenciais de Produção

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação **"Azuria"**
3. Vá em: **PRODUÇÃO** → **Credenciais de produção**
4. Copie:
   - **Access Token**: `APP_USR-xxxxx...`
   - **Public Key**: `APP_USR-xxxxx...`

### 2. Atualizar Secrets no Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá na seção **"Secrets"**
3. **Atualizar** `MERCADOPAGO_ACCESS_TOKEN`:
   - Clique em **"Edit"** na secret existente
   - Substitua o valor de teste (`TEST-xxxxx...`) pelo token de produção (`APP_USR-xxxxx...`)
   - Clique em **"Save"**

### 3. Atualizar Variáveis de Ambiente no Frontend

#### 3.1 Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Azuria**
3. Vá em: **Settings** → **Environment Variables**
4. **Atualizar ou Adicionar**:
   - **Key**: `VITE_MERCADOPAGO_PUBLIC_KEY`
   - **Value**: `APP_USR-xxxxx...` (chave pública de produção)
   - **Environments**: Selecione **Production**, **Preview** e **Development**
5. Clique em **"Save"**
6. **Redeploy** o projeto:
   - Vá em **Deployments**
   - Clique nos **3 pontos** do último deployment
   - Selecione **"Redeploy"**

#### 3.2 Arquivo .env.local (Desenvolvimento Local)

Se estiver usando `.env.local` localmente:

```env
# Mercado Pago - PRODUÇÃO
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-your-production-public-key
```

**NÃO commite** este arquivo no Git!

### 4. Atualizar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app/3611371522197021/webhooks
2. Verifique se a URL está correta:
   - `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook`
3. Se necessário, atualize a **chave secreta** do webhook
4. **Salvar configurações**

### 5. Verificar Edge Functions

Certifique-se de que todas as funções estão deployadas:

```bash
supabase functions list
```

Deve mostrar:
- ✅ `mercadopago-webhook` (ACTIVE)
- ✅ `create-payment-preference` (ACTIVE)
- ✅ `create-subscription` (ACTIVE)

### 6. Testar em Produção

#### 6.1 Teste de Criação de Assinatura

1. Acesse: https://azuria.app.br/planos
2. Faça login
3. Selecione um plano
4. Clique em "Começar agora"
5. Deve redirecionar para checkout do Mercado Pago (produção)

#### 6.2 Teste de Pagamento Real

⚠️ **ATENÇÃO**: Em produção, os pagamentos são **REAIS**!

1. Use um cartão de crédito real
2. Complete o pagamento
3. Verifique se o webhook processa corretamente
4. Verifique se a assinatura é ativada no banco de dados

---

## 🔍 Verificar Logs

### Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions
2. Selecione a função (`create-subscription` ou `create-payment-preference`)
3. Vá na aba **"Logs"**
4. Verifique se há erros

### Via CLI

```bash
# Logs da função de criação de assinatura
supabase functions logs create-subscription --limit 20

# Logs do webhook
supabase functions logs mercadopago-webhook --limit 20
```

---

## ⚠️ Checklist de Migração

- [ ] Credenciais de produção obtidas do Mercado Pago
- [ ] `MERCADOPAGO_ACCESS_TOKEN` atualizado no Supabase (produção)
- [ ] `VITE_MERCADOPAGO_PUBLIC_KEY` atualizado no Azure (produção)
- [ ] Webhook configurado no Mercado Pago (produção)
- [ ] Edge Functions deployadas e ativas
- [ ] Teste de criação de assinatura realizado
- [ ] Teste de pagamento real realizado (se aplicável)
- [ ] Logs verificados (sem erros)
- [ ] Webhook processando notificações corretamente

---

## 🔄 Reverter para Teste (Se Necessário)

Se precisar voltar para modo teste:

1. **Supabase**: Atualizar `MERCADOPAGO_ACCESS_TOKEN` para token de teste
2. **Azure**: Atualizar `VITE_MERCADOPAGO_PUBLIC_KEY` para chave de teste
3. **Mercado Pago**: Usar credenciais de teste no painel

---

## 📚 Documentação Adicional

- **Mercado Pago Docs**: https://www.mercadopago.com.br/developers/pt/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Logs Dashboard**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions

---

**Última atualização**: 01/01/2025

