# ✅ Checklist de Lançamento — Mercado Pago + Azuria

> Última atualização: 4 de outubro de 2025

Este guia consolida os passos críticos para completar a monetização do Azuria com Mercado Pago, garantindo que infraestrutura, credenciais, banco de dados, frontend e backend estejam alinhados para produção.

| Etapa | Responsável | Duração estimada | Status |
|-------|-------------|------------------|--------|
| 1. Cadastrar cartão Nubank no Azure | Owner | 5 min | ⬜ |
| 2. Capturar credenciais TEST do Mercado Pago | Owner | 5 min | ⬜ |
| 3. Gerar `.env` local e no Azure | DevOps | 10 min | ⬜ |
| 4. Aplicar migration `001_subscriptions_schema.sql` | DevOps | 5 min | ⬜ |
| 5. Publicar/validar página `/pricing` | Frontend | 15 min | ⬜ |
| 6. Configurar webhook `/api/webhooks/mercadopago` | Backend | 20 min | ⬜ |
| 7. Ativar paywall (10 cálculos/dia) | Frontend | 20 min | ⬜ |
| 8. Rodar testes sandbox | QA | 15 min | ⬜ |
| 9. Deploy final (Static Web App) | DevOps | 10 min | ⬜ |

---

## 1. Cadastrar cartão Nubank no Azure

1. Acesse [portal.azure.com](https://portal.azure.com/)
2. Menu superior direito → **Cost Management + Billing**
3. **Payment methods** → **Add payment method**
4. Escolha **Credit/Debit card** e insira os dados do cartão virtual Nubank
5. Defina como **Primary** e remova outros cartões caso existam
6. Confirme cobrança teste de R$ 0,00 (Azure apenas valida o cartão)

> 💡 Dica: registre a validade do cartão no Notion ou Password Manager para renovação futura.

## 2. Capturar credenciais TEST do Mercado Pago

1. Entre em [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel)
2. Acesse **Suas integrações → Credenciais**
3. Copie as credenciais do modo **Teste**:
   - `TEST_PUBLIC_KEY`
   - `TEST_ACCESS_TOKEN`
4. Salve as credenciais de produção apenas após homologação (não usar agora)
5. Gere um usuário comprador sandbox em **Ferramentas → Usuários de Teste**

## 3. Gerar `.env` local e app settings na Azure Static Web App

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
Copy-Item .env.example .env
```

Edite os arquivos adicionando as credenciais sandbox:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_APP_URL=http://localhost:5173
```

No Azure Portal (Static Web App → **Configuration**), cadastre as mesmas chaves com valores `TEST` e adicione o domínio definitivo em `VITE_APP_URL=https://www.azuria.app.br`.

> 🔐 Nunca publique o `SUPABASE_SERVICE_ROLE_KEY` no frontend. Essa chave ficará somente nas funções serverless.

## 4. Aplicar migration `001_subscriptions_schema.sql`

1. Acesse o dashboard do Supabase → **SQL Editor**
2. Cole todo o conteúdo de `supabase/migrations/001_subscriptions_schema.sql`
3. Execute e aguarde o retorno `Success`
4. Valide as tabelas:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('subscriptions','payment_history','usage_tracking');
```

1. Garanta que as funções `can_user_perform_action` e `increment_usage` foram criadas (listadas no final do script)

## 5. Publicar/validar página `/pricing`

- Certifique-se de que o componente `PricingPage` esteja roteado tanto em `/planos` quanto em `/pricing`
- Atualize botões "Assinar" e CTA do app para apontar para `/pricing`
- Teste manual: `npm run dev` → `http://localhost:5173/pricing`

## 6. Configurar webhook `/api/webhooks/mercadopago`

### 6.1 Deploy da função

- Deploy das funções edge/serverless (vide seção específica no README após implementação)
- O endpoint público deve ser: `https://<static-app-name>.azurestaticapps.net/api/webhooks/mercadopago`

### 6.2 Registro no Mercado Pago

1. Painel de Devs → **Webhooks**
2. URL: `https://www.azuria.app.br/api/webhooks/mercadopago`
3. Eventos: `payment`, `subscription_preapproval`, `subscription_authorized_payment`
4. Salve e valide com o botão "Enviar teste"

> ⚠️ Verifique logs na Azure Function para confirmar recebimento e status `200`.

## 7. Ativar paywall (10 cálculos/dia)

- Garanta que o hook `useCalculationLimit` (ou equivalente) esteja chamando `rpc('can_user_perform_action')`
- Mostre modal de upgrade ao atingir o limite
- Atualize o contexto de autenticação para consumir o plano atual (`subscriptions.plan`)
- QA: logue com usuário free e processe 11 cálculos para validar bloqueio

## 8. Rodar testes sandbox

1. **Checkout**: inicie assinatura com usuário sandbox → confirme redirecionamento para Mercado Pago
2. **Webhook**: use "Enviar teste" no painel para simular sucesso e falha
3. **Status**: rodar função `check-subscription` e conferir atualização na tabela `subscriptions`
4. **Paywall**: após aprovação, limite deve resetar e liberar cálculos ilimitados

> ✅ Registre prints das telas principais e o ID do pagamento para auditoria

## 9. Deploy final (Static Web App)

```powershell
npm install
npm run build
# Deploy automático ao merge na main (GitHub Actions)
```

Valide pós-deploy:

- `/pricing` acessível e sem erros de console
- Webhook recebendo chamadas (verificar `invocationId` na Function)
- Logs no Supabase mostrando atualizações em `subscriptions` e `payment_history`

---

### Referências úteis

- [MERCADOPAGO_SETUP_GUIDE.md](../MERCADOPAGO_SETUP_GUIDE.md)
- [Supabase SQL Schema](../supabase/migrations/001_subscriptions_schema.sql)
- [Azure Static Web Apps docs](https://learn.microsoft.com/azure/static-web-apps/)

> ☕ Sempre que concluir uma etapa, marque a coluna **Status** na tabela inicial. Mantém todo o time alinhado! 🎯
