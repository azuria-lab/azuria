# 🚀 Guia: Aplicar Migrações no Supabase Cloud

**Data**: Janeiro 2025  
**Objetivo**: Aplicar todas as migrações otimizadas no Supabase Cloud

---

## 📋 Pré-requisitos

1. ✅ Acesso ao Supabase Dashboard
2. ✅ Projeto criado no Supabase Cloud
3. ✅ Credenciais configuradas no `.env`

---

## 🎯 Passo a Passo

### **Opção 1: Via Supabase CLI (Recomendado)**

```bash
# 1. Fazer login no Supabase
supabase login

# 2. Linkar projeto local ao Cloud
supabase link --project-ref seu-project-ref

# 3. Aplicar migrações no Cloud
supabase db push
```

### **Opção 2: Via SQL Editor (Manual)**

1. Acesse: https://supabase.com/dashboard/project/seu-projeto/sql
2. Execute as migrações na ordem:

#### **Ordem de Execução**:

1. ✅ `000_create_user_profiles.sql`
2. ✅ `002_create_avatars_bucket.sql`
3. ✅ `003_add_phone_company_fields.sql`
4. ✅ `004_user_marketplace_templates.sql`
5. ✅ `20250106_advanced_calculator_history.sql`
6. ✅ `20250108_subscriptions.sql`
7. ✅ `20250110_add_stripe_support.sql`
8. ✅ `20250111_consolidate_subscriptions.sql` ⭐ **NOVO**
9. ✅ `20250111_create_business_metrics_tables.sql` ⭐ **NOVO**
10. ✅ `20250111_add_payment_history.sql` ⭐ **NOVO**

---

## ✅ Verificação

Após aplicar as migrações, verifique:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar estrutura de subscriptions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Verificar RLS
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 Tabelas Esperadas

Após aplicar todas as migrações, você deve ter:

1. ✅ `user_profiles`
2. ✅ `subscriptions`
3. ✅ `usage_tracking`
4. ✅ `payment_history`
5. ✅ `user_marketplace_templates`
6. ✅ `advanced_calculation_history`
7. ✅ `teams`
8. ✅ `team_members`
9. ✅ `plan_change_history`
10. ✅ `business_metrics` ⭐
11. ✅ `sales_data` ⭐
12. ✅ `product_performance` ⭐

---

## ⚠️ Notas Importantes

1. **Backup**: Faça backup do banco antes de aplicar migrações
2. **Ordem**: Execute as migrações na ordem correta
3. **Teste**: Teste queries após aplicar cada migração
4. **RLS**: Verifique se RLS policies estão funcionando

---

## 🔧 Troubleshooting

### Erro: "relation already exists"
- ✅ Normal se tabela já existe
- ✅ Migrações usam `IF NOT EXISTS`

### Erro: "constraint already exists"
- ✅ Normal se constraint já existe
- ✅ Migrações usam `DROP CONSTRAINT IF EXISTS`

### Erro: "column already exists"
- ✅ Normal se coluna já existe
- ✅ Migrações usam `ADD COLUMN IF NOT EXISTS`

---

**Status**: ✅ **Pronto para aplicar no Cloud**

