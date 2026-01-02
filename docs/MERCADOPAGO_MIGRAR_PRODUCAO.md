# 🚀 Migrar Mercado Pago para Produção - Guia Rápido

## ⚡ Passos Rápidos

### 1. Obter Credenciais de Produção (5 minutos)

1. Acesse: https://www.mercadopago.com.br/developers/panel/app/3611371522197021
2. Vá em: **PRODUÇÃO** → **Credenciais de produção**
3. Copie:
   - **Access Token**: `APP_USR-xxxxx...`
   - **Public Key**: `APP_USR-xxxxx...`

### 2. Atualizar no Supabase (2 minutos)

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/functions
2. Vá em **"Secrets"**
3. Clique em **"Edit"** na secret `MERCADOPAGO_ACCESS_TOKEN`
4. Substitua `TEST-xxxxx...` por `APP_USR-xxxxx...` (token de produção)
5. Clique em **"Save"**

### 3. Atualizar no Vercel (2 minutos)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Azuria**
3. Vá em: **Settings** → **Environment Variables**
4. Encontre `VITE_MERCADOPAGO_PUBLIC_KEY`
5. Se não existir, clique em **"Add New"**
6. Configure:
   - **Key**: `VITE_MERCADOPAGO_PUBLIC_KEY`
   - **Value**: `APP_USR-xxxxx...` (chave pública de produção)
   - **Environments**: Selecione **Production**, **Preview** e **Development**
7. Clique em **"Save"**
8. **Redeploy** o projeto para aplicar as mudanças

### 4. Verificar Webhook (1 minuto)

1. Acesse: https://www.mercadopago.com.br/developers/panel/app/3611371522197021/webhooks
2. Verifique se a URL está correta:
   - `https://crpzkppsriranmeumfqs.supabase.co/functions/v1/mercadopago-webhook`
3. Se necessário, gere uma nova chave secreta e atualize no Supabase

### 5. Testar (5 minutos)

1. Acesse: https://azuria.app.br/planos
2. Faça login
3. Selecione um plano
4. Clique em "Começar agora"
5. Deve redirecionar para checkout do Mercado Pago

---

## 🔍 Verificar Logs (Se Houver Erro)

### Via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/functions/create-subscription/logs
2. Verifique os logs mais recentes
3. Procure por erros relacionados a:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `Invalid credentials`
   - `Unauthorized`

### Possíveis Erros e Soluções

#### Erro: "Invalid credentials"
- ✅ Verificar se o token de produção está correto
- ✅ Verificar se não está usando token de teste

#### Erro: "Unauthorized"
- ✅ Verificar se a conta do Mercado Pago está verificada
- ✅ Verificar se o CNPJ está cadastrado (se necessário)

#### Erro: "Function not found"
- ✅ Verificar se as Edge Functions estão deployadas:
  ```bash
  supabase functions list
  ```

---

## ⚠️ Importante

### Antes de Migrar

- [ ] Conta do Mercado Pago verificada
- [ ] CNPJ cadastrado (se aplicável)
- [ ] Homologação completa (se aplicável)
- [ ] Testado em modo teste

### Após Migrar

- [ ] Testar criação de assinatura
- [ ] Verificar logs (sem erros)
- [ ] Testar webhook (se possível)
- [ ] Monitorar primeiros pagamentos

---

## 🔄 Reverter para Teste

Se precisar voltar:

1. **Supabase**: Atualizar `MERCADOPAGO_ACCESS_TOKEN` para `TEST-xxxxx...`
2. **Vercel**: Atualizar `VITE_MERCADOPAGO_PUBLIC_KEY` para `TEST-xxxxx...`
3. **Redeploy** no Vercel

---

## 📞 Suporte

Se tiver problemas:
- **Mercado Pago**: https://www.mercadopago.com.br/developers/support
- **Supabase**: https://supabase.com/support

---

**Tempo total estimado**: ~15 minutos  
**Última atualização**: 01/01/2025

