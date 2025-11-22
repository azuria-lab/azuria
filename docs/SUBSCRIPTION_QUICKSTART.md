# 🚀 QUICK START - SISTEMA DE PLANOS

## ⚡ DEPLOY RÁPIDO

### 1️⃣ **Aplicar Migration no Supabase**

```bash
# Via CLI
supabase db push

# OU copie o SQL manualmente:
# Arquivo: supabase/migrations/20250108_subscriptions.sql
```

### 2️⃣ **Configurar Cron Jobs (Supabase Dashboard)**

```sql
-- Reset diário (00:00 UTC)
select cron.schedule(
  'reset-daily-calculations',
  '0 0 * * *',
  $$select reset_daily_calculations()$$
);

-- Reset mensal (dia 1, 00:00 UTC)
select cron.schedule(
  'reset-monthly-counters',
  '0 0 1 * *',
  $$select reset_monthly_counters()$$
);
```

### 3️⃣ **Testar**

```bash
# Criar novo usuário → Plano FREE é criado automaticamente
# Acessar /pricing → Ver página de planos
```

---

## 🎯 USO BÁSICO

### **Verificar Plano Atual**

```tsx
import { useSubscription } from '@/hooks/useSubscription';

const { subscription } = useSubscription();
// subscription.planId → 'free' | 'essencial' | 'pro' | 'enterprise'
```

### **Bloquear Feature**

```tsx
import { FeatureGate } from '@/components/subscription/FeatureGate';

<FeatureGate feature="advancedCalculator">
  <AdvancedCalculator />
</FeatureGate>
```

### **Verificar Limite**

```tsx
import { usePlanLimits } from '@/hooks/usePlanLimits';

const { canMakeCalculation, trackCalculation } = usePlanLimits();

if (canMakeCalculation()) {
  await trackCalculation();
  // Fazer cálculo...
}
```

### **Mostrar Badge**

```tsx
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

<SubscriptionBadge planId={subscription?.planId} />
```

---

## 📊 PLANOS

| Plano | Preço | Cálculos | IA | Lojas |
|-------|-------|----------|-----|-------|
| FREE | R$ 0 | 10/dia | ❌ | 0 |
| ESSENCIAL | R$ 59/mês | ∞ | 50/mês | 1 |
| PRO | R$ 119/mês | ∞ | ∞ | 3 |
| ENTERPRISE | R$ 299/mês | ∞ | ∞ | ∞ |

---

## 🔗 LINKS ÚTEIS

- **Documentação Completa:** `SUBSCRIPTION_SYSTEM.md`
- **Resumo da Implementação:** `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md`
- **Página de Preços:** `/pricing`
- **Tipos TypeScript:** `src/types/subscription.ts`
- **Config Planos:** `src/config/plans.ts`

---

## ✅ STATUS

- ✅ **6/10 Tarefas Concluídas**
- ✅ Sistema base 100% funcional
- 🔜 Pendente: Integração Mercado Pago, Limites, Gerenciamento

---

## 🆘 HELP

**Erro de tipo no Supabase?**
→ Execute a migration primeiro: `supabase db push`

**Hook não funciona?**
→ Verifique se usuário está autenticado

**Limite não atualiza?**
→ Configure os cron jobs no Supabase

---

**🎉 Sistema pronto para uso!**
