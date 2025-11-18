# ⚠️ Projeto Supabase Pausado

**Status**: ⚠️ **Projeto está pausado**

---

## 🔓 Como Despausar

1. **Acesse o Dashboard**:
   https://supabase.com/dashboard/project/ghcgnrmuvdypahrwspmn

2. **Despausar Projeto**:
   - Vá em **Settings** > **General**
   - Clique em **Unpause Project** ou **Resume Project**
   - Aguarde alguns minutos para o projeto voltar

---

## 🚀 Após Despausar

### **Opção 1: Via CLI** (Recomendado)

```bash
# 1. Linkar projeto
supabase link --project-ref ghcgnrmuvdypahrwspmn

# 2. Aplicar migrações
supabase db push
```

### **Opção 2: Via SQL Editor**

1. Acesse: https://supabase.com/dashboard/project/ghcgnrmuvdypahrwspmn/sql
2. Execute as migrações na ordem (veja `APLICAR_MIGRACOES_CLOUD.md`)

---

## 📋 Migrações para Aplicar

Execute na ordem:

1. ✅ `000_create_user_profiles.sql`
2. ✅ `002_create_avatars_bucket.sql`
3. ✅ `003_add_phone_company_fields.sql`
4. ✅ `004_user_marketplace_templates.sql`
5. ✅ `20250106_advanced_calculator_history.sql`
6. ✅ `20250108_subscriptions.sql`
7. ✅ `20250110_add_stripe_support.sql`
8. ✅ `20250111_consolidate_subscriptions.sql` ⭐
9. ✅ `20250111_create_business_metrics_tables.sql` ⭐
10. ✅ `20250111_add_payment_history.sql` ⭐

---

**Ação Necessária**: Despausar projeto no Dashboard primeiro

