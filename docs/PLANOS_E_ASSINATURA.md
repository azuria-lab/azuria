# 💳 Planos e Assinatura - Documentação Completa

**Última atualização:** 2025-01-27  
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Planos Disponíveis](#planos-disponíveis)
3. [Comparação de Features](#comparação-de-features)
4. [Limites por Plano](#limites-por-plano)
5. [Preços e Billing](#preços-e-billing)
6. [Trial Periods](#trial-periods)
7. [Upgrade e Downgrade](#upgrade-e-downgrade)
8. [Integração Stripe](#integração-stripe)
9. [Integração Mercado Pago](#integração-mercado-pago)
10. [Cancelamento](#cancelamento)
11. [Reembolsos](#reembolsos)

---

## 🎯 Visão Geral

O Azuria oferece **4 planos** de assinatura para atender desde empreendedores individuais até grandes empresas. Todos os planos incluem acesso à calculadora básica e suporte contínuo.

---

## 📦 Planos Disponíveis

### 🆓 Free

**Ideal para:** Usuários que querem experimentar a plataforma

**Preço:** Grátis

**Inclui:**
- Calculadora básica
- 10 cálculos por dia
- Marca d'água nos relatórios

**Limitações:**
- Sem histórico de cálculos
- Sem exportação
- Sem IA
- Sem analytics
- Sem integrações

---

### ⭐ Essencial (POPULAR)

**Ideal para:** Pequenos negócios e profissionais

**Preço:** 
- Mensal: R$ 59,00/mês
- Anual: R$ 590,00/ano (economia de 17%)

**Inclui:**
- Calculadora básica e avançada
- Cálculos ilimitados
- Histórico ilimitado
- 50 consultas IA/mês (GPT-3.5)
- Analytics básico
- Exportar PDF
- Sem marca d'água
- Suporte por email (48h)

**Trial:** 7 dias grátis

---

### 🚀 PRO (RECOMENDADO)

**Ideal para:** Negócios em crescimento

**Preço:**
- Mensal: R$ 119,00/mês
- Anual: R$ 1.190,00/ano (economia de 17%)

**Inclui:**
- Tudo do Essencial
- IA ilimitada (GPT-4)
- Integração com marketplaces
- Análise de concorrência
- Alertas de preço
- Dashboard avançado
- Analytics avançado
- Exportar PDF, Excel, CSV
- Até 3 lojas
- API básica (1.000 req/mês)
- Suporte prioritário (24h)

**Trial:** 14 dias grátis

---

### 💼 Enterprise (EMPRESARIAL)

**Ideal para:** Empresas com equipes

**Preço:**
- Mensal: R$ 299,00/mês (ou personalizado)
- Anual: Negociável

**Inclui:**
- Tudo do PRO
- API ilimitada
- Lojas ilimitadas
- Sistema de equipes
- Usuários ilimitados
- Permissões por função
- Workflow de aprovação
- Comentários
- Dashboard consolidado
- Auditoria completa
- White label
- Suporte 24/7
- Account manager
- Onboarding personalizado
- SLA garantido

**Trial:** 30 dias grátis

---

## 📊 Comparação de Features

Ver tabela completa no [README](../README.md#comparação-de-features).

---

## 🔢 Limites por Plano

| Limite | Free | Essencial | PRO | Enterprise |
|--------|------|-----------|-----|------------|
| Cálculos/dia | 10 | Ilimitado | Ilimitado | Ilimitado |
| Consultas IA/mês | 0 | 50 | Ilimitado | Ilimitado |
| Requisições API/mês | 0 | 0 | 1.000 | Ilimitado |
| Lojas | 0 | 1 | 3 | Ilimitado |
| Membros da equipe | 1 | 1 | 1 | Ilimitado |

---

## 💰 Preços e Billing

### Preços Mensais

- **Free:** R$ 0,00
- **Essencial:** R$ 59,00
- **PRO:** R$ 119,00
- **Enterprise:** R$ 299,00 (ou personalizado)

### Preços Anuais

- **Free:** R$ 0,00
- **Essencial:** R$ 590,00 (economia de R$ 118,00)
- **PRO:** R$ 1.190,00 (economia de R$ 238,00)
- **Enterprise:** Negociável

### Billing

- **Ciclo:** Mensal ou anual
- **Renovação:** Automática
- **Cobrança:** Via Stripe ou Mercado Pago
- **Nota fiscal:** Emitida automaticamente

---

## 🎁 Trial Periods

- **Free:** Sem trial (já é grátis)
- **Essencial:** 7 dias grátis
- **PRO:** 14 dias grátis
- **Enterprise:** 30 dias grátis

Durante o trial, você tem acesso completo a todas as features do plano escolhido.

---

## ⬆️ Upgrade e Downgrade

### Upgrade

- **Efetivo:** Imediatamente
- **Cálculo:** Valor proporcional calculado automaticamente
- **Acesso:** Features do novo plano disponíveis imediatamente

### Downgrade

- **Efetivo:** No próximo ciclo de cobrança
- **Acesso:** Mantém acesso às features do plano atual até o fim do período pago
- **Dados:** Preservados

---

## 💳 Integração Stripe

O Azuria utiliza **Stripe** como principal gateway de pagamento.

### Configuração

1. Criar conta no [Stripe](https://stripe.com)
2. Obter chaves de API
3. Configurar webhooks
4. Configurar produtos e preços

### Variáveis de Ambiente

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ESSENCIAL_MONTHLY=price_...
VITE_STRIPE_PRICE_ESSENCIAL_YEARLY=price_...
VITE_STRIPE_PRICE_PRO_MONTHLY=price_...
VITE_STRIPE_PRICE_PRO_YEARLY=price_...
```

**Documentação:** [docs/STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)

---

## 💳 Integração Mercado Pago

O Azuria também suporta **Mercado Pago** (em desenvolvimento).

### Configuração

1. Criar conta no [Mercado Pago](https://www.mercadopago.com.br)
2. Obter credenciais
3. Configurar webhooks

### Variáveis de Ambiente

```env
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-... ou APP_USR-...
```

**Documentação:** [docs/MERCADOPAGO_INTEGRATION_GUIDE.md](./MERCADOPAGO_INTEGRATION_GUIDE.md)

---

## ❌ Cancelamento

### Como Cancelar

1. Acesse `/assinatura`
2. Clique em "Cancelar Assinatura"
3. Confirme o cancelamento

### Efeitos do Cancelamento

- **Acesso:** Mantido até o fim do período pago
- **Dados:** Preservados por 30 dias
- **Downgrade:** Automático para Free após período pago

---

## 💵 Reembolsos

### Política de Reembolso

- **Trial:** Sem cobrança, sem reembolso necessário
- **Primeiro mês:** Reembolso integral se solicitado em até 7 dias
- **Após primeiro mês:** Reembolso proporcional caso a caso

### Como Solicitar

Entre em contato com suporte: suporte@azuria.app

---

## 📚 Referências

- [README Principal](../README.md)
- [Stripe Integration](./STRIPE_INTEGRATION.md)
- [Mercado Pago Integration](./MERCADOPAGO_INTEGRATION_GUIDE.md)

---

**Fim da Documentação**

