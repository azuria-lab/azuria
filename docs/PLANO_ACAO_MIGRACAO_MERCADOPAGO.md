# 🚀 Plano de Ação - Migração para Mercado Pago

**Data**: Janeiro 2025  
**Situação**: AbacatePay requer CNPJ (não temos ainda)  
**Solução**: Migrar para Mercado Pago (aceita CPF)  
**Status**: ✅ Código já implementado, precisa ativar

---

## 📋 Situação Atual

### ❌ AbacatePay - Não viável
- Requer CNPJ ou MEI ativo há 3+ meses
- Não temos CNPJ ainda (vamos criar após lançamento)
- **Decisão**: Pausar integração AbacatePay

### ✅ Mercado Pago - Solução Ideal
- ✅ **Aceita CPF** (pessoa física)
- ✅ Código já implementado no projeto
- ✅ Melhor gateway para Brasil (PIX + Cartão)
- ✅ Assinaturas nativas
- ✅ Marca conhecida (alta conversão)

### ✅ Stripe - Alternativa
- ✅ Já implementado e funcionando
- ❌ Não tem PIX (desvantagem no Brasil)
- ✅ Pode ser usado como backup

---

## 🎯 Estratégia Recomendada

### Opção 1: Mercado Pago como Principal (RECOMENDADO) 🏆

**Por quê?**
- ✅ Aceita CPF (você pode começar hoje)
- ✅ PIX integrado (60%+ das transações no Brasil)
- ✅ Taxa competitiva (1.99% PIX, 4.99% cartão)
- ✅ Marca conhecida = maior conversão
- ✅ Código já implementado

**Plano:**
1. Ativar Mercado Pago (esta semana)
2. Usar Stripe como backup (já está funcionando)
3. Quando tiver CNPJ, avaliar se mantém ou migra

---

## 📝 Checklist de Migração

### Fase 1: Setup Mercado Pago (2-3 horas)

#### 1.1 Criar Conta Mercado Pago (10 min)

1. Acesse: https://www.mercadopago.com.br/hub/registration/landing
2. Escolha: **"Conta de Vendedor"**
3. Preencha:
   - Email: `azuria.labs@gmail.com`
   - **CPF**: Seu CPF (aceita pessoa física!)
   - Senha
   - Telefone
4. Verifique email e telefone

**✅ Vantagem**: Não precisa de CNPJ! Aceita CPF normalmente.

#### 1.2 Obter Credenciais (5 min)

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em: **"Suas integrações" → "Credenciais"**
3. Copie:
   - **Public Key (TEST)**: `TEST-xxxxx...`
   - **Access Token (TEST)**: `TEST-xxxxx...`

**⚠️ IMPORTANTE**: Use credenciais de TESTE primeiro!

#### 1.3 Configurar no Supabase (10 min)

```bash
# Adicionar secrets no Supabase
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-sua-chave-aqui
supabase secrets set VITE_MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-aqui
```

Ou via Dashboard:
1. Acesse: Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Adicione:
   - `MERCADOPAGO_ACCESS_TOKEN` = `TEST-xxxxx...`
   - `VITE_MERCADOPAGO_PUBLIC_KEY` = `TEST-xxxxx...`

#### 1.4 Verificar Código Existente (5 min)

O projeto já tem:
- ✅ `lib/mercadopago.ts` - Cliente Mercado Pago
- ✅ `src/hooks/useMercadoPago.tsx` - Hook de integração
- ✅ `src/components/payment/MercadoPagoCheckout.tsx` - Componente de checkout
- ✅ Edge Functions (se existirem)

**Verificar se precisa atualizar algo.**

#### 1.5 Criar Planos de Assinatura (15 min)

No Mercado Pago Dashboard:
1. Vá em: **"Assinaturas" → "Planos"**
2. Crie os planos:

   **Plano Essencial - Mensal**
   - Nome: "Azuria Essencial - Mensal"
   - Valor: R$ 59,00
   - Frequência: Mensal
   - Copie o `plan_id` gerado

   **Plano Essencial - Anual**
   - Nome: "Azuria Essencial - Anual"
   - Valor: R$ 590,00
   - Frequência: Anual
   - Copie o `plan_id` gerado

   **Plano Pro - Mensal**
   - Nome: "Azuria Pro - Mensal"
   - Valor: R$ 119,00
   - Frequência: Mensal
   - Copie o `plan_id` gerado

   **Plano Pro - Anual**
   - Nome: "Azuria Pro - Anual"
   - Valor: R$ 1.190,00
   - Frequência: Anual
   - Copie o `plan_id` gerado

3. Salve os IDs no Supabase Secrets:
   ```bash
   supabase secrets set MERCADOPAGO_ESSENCIAL_MONTHLY_PLAN_ID=xxxxx
   supabase secrets set MERCADOPAGO_ESSENCIAL_ANNUAL_PLAN_ID=xxxxx
   supabase secrets set MERCADOPAGO_PRO_MONTHLY_PLAN_ID=xxxxx
   supabase secrets set MERCADOPAGO_PRO_ANNUAL_PLAN_ID=xxxxx
   ```

#### 1.6 Configurar Webhook (10 min)

1. No Mercado Pago Dashboard, vá em: **"Webhooks"**
2. Adicione URL:
   ```
   https://[seu-projeto-id].supabase.co/functions/v1/mercadopago-webhook
   ```
3. Selecione eventos:
   - ✅ `payment`
   - ✅ `subscription`
   - ✅ `preapproval`

**Nota**: Se não tiver Edge Function de webhook, precisaremos criar.

#### 1.7 Testar em Sandbox (30 min)

1. Use credenciais de TESTE
2. Acesse a página de planos na aplicação
3. Tente assinar um plano
4. Use cartão de teste:
   - Número: `5031 4332 1540 6351`
   - CVV: `123`
   - Validade: `11/25`
   - Nome: `APRO`
5. Verifique se:
   - ✅ Redirecionamento funciona
   - ✅ Pagamento é processado
   - ✅ Webhook é recebido
   - ✅ Subscription é criada no banco

---

### Fase 2: Ativar em Produção (1-2 dias)

#### 2.1 Solicitar Aprovação para Produção

1. No Mercado Pago Dashboard, vá em: **"Configurações" → "Dados da Conta"**
2. Complete todos os dados:
   - [ ] Dados pessoais (CPF já está)
   - [ ] Endereço completo
   - [ ] Dados bancários (para saques)
3. Envie documentos (se solicitado):
   - [ ] RG ou CNH (frente e verso)
   - [ ] Comprovante de residência
4. Aguarde aprovação (1-3 dias úteis)

#### 2.2 Obter Credenciais de Produção

Após aprovação:
1. Vá em: **"Credenciais"**
2. Copie credenciais de **PRODUÇÃO**:
   - `APP_USR-xxxxx...` (não TEST!)
3. Atualize no Supabase:
   ```bash
   supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-sua-chave-producao
   supabase secrets set VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-chave-producao
   ```

#### 2.3 Atualizar Planos (se necessário)

Verifique se os planos criados em sandbox precisam ser recriados em produção.

#### 2.4 Testar em Produção

1. Faça um teste real com valor mínimo
2. Verifique todo o fluxo
3. Confirme webhooks funcionando

---

### Fase 3: Atualizar Aplicação (1-2 horas)

#### 3.1 Atualizar Página de Planos

Verificar se `src/pages/PricingPage.tsx` está usando Mercado Pago ou ainda AbacatePay.

Se estiver usando AbacatePay, atualizar para Mercado Pago:

```typescript
// Trocar de:
import { useAbacatePay } from '@/hooks/useAbacatePay';

// Para:
import { useMercadoPago } from '@/hooks/useMercadoPago';
```

#### 3.2 Atualizar Componentes

Verificar e atualizar:
- `src/components/home/PlansOverviewSection.tsx`
- Qualquer outro componente que use AbacatePay

#### 3.3 Remover/Comentar Código AbacatePay (Opcional)

Não precisa deletar, mas pode comentar ou mover para uma pasta `_deprecated`:
- `src/hooks/useAbacatePay.ts`
- `supabase/functions/abacatepay-*`
- `docs/ABACATEPAY_*`

**Nota**: Manter código pode ser útil para futuro se conseguir CNPJ.

---

## 🔄 Estratégia de Transição

### Opção A: Migração Completa (Recomendado)

1. **Esta semana**: Ativar Mercado Pago
2. **Próxima semana**: Remover AbacatePay da UI
3. **Manter Stripe**: Como backup/alternativa

### Opção B: Múltiplos Gateways

Oferecer ambos Mercado Pago e Stripe:
- Mercado Pago = Principal (PIX + Cartão)
- Stripe = Alternativa (só cartão, sem PIX)

**Vantagem**: Mais opções para o usuário  
**Desvantagem**: Mais complexidade

---

## 📊 Comparação Rápida

| Gateway | CPF? | PIX? | Taxa PIX | Taxa Cartão | Status |
|---------|------|------|----------|-------------|--------|
| **Mercado Pago** | ✅ Sim | ✅ Sim | 1.99% | 4.99% | 🟢 **Recomendado** |
| Stripe | ✅ Sim | ❌ Não | - | 3.99% + R$0.39 | 🟡 Backup |
| AbacatePay | ❌ Não | ✅ Sim | 2.99% | 6.99% | 🔴 Pausado |

---

## ✅ Checklist Final

### Setup Inicial
- [ ] Criar conta Mercado Pago (CPF)
- [ ] Obter credenciais de teste
- [ ] Configurar secrets no Supabase
- [ ] Criar planos de assinatura
- [ ] Configurar webhook
- [ ] Testar em sandbox

### Produção
- [ ] Completar dados da conta
- [ ] Enviar documentos (se necessário)
- [ ] Aguardar aprovação
- [ ] Obter credenciais de produção
- [ ] Atualizar secrets
- [ ] Testar em produção

### Código
- [ ] Verificar código existente
- [ ] Atualizar página de planos
- [ ] Atualizar componentes
- [ ] Testar fluxo completo
- [ ] Documentar mudanças

---

## 🚀 Próximos Passos Imediatos

1. **Hoje**: Criar conta Mercado Pago (10 min)
2. **Hoje**: Obter credenciais de teste (5 min)
3. **Hoje**: Configurar no Supabase (10 min)
4. **Amanhã**: Criar planos e testar (1 hora)
5. **Esta semana**: Solicitar aprovação produção
6. **Próxima semana**: Lançar com Mercado Pago!

---

## 💡 Dicas Importantes

### Sobre CPF vs CNPJ

- ✅ **Mercado Pago aceita CPF** para pessoa física
- ✅ Você pode começar HOJE sem CNPJ
- ✅ Quando tiver CNPJ, pode atualizar a conta depois
- ✅ Não precisa esperar 3 meses (como AbacatePay)

### Sobre Taxas

- Mercado Pago: 1.99% PIX, 4.99% cartão
- AbacatePay: 2.99% PIX, 6.99% cartão
- **Economia**: ~1% em PIX, ~2% em cartão!

### Sobre Conversão

- Mercado Pago tem marca conhecida (Mercado Livre)
- Usuários confiam mais = maior conversão
- Estima-se 20-30% mais conversão vs gateways menores

---

## 📞 Suporte

- **Mercado Pago Docs**: https://www.mercadopago.com.br/developers/pt/docs
- **Suporte**: https://www.mercadopago.com.br/developers/pt/support
- **Status**: https://status.mercadopago.com.br

---

**Última atualização**: Janeiro 2025  
**Status**: 🟢 Pronto para implementar

