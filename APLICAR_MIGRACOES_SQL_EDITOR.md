# 🚀 Aplicar Migrações via SQL Editor

**Project ID**: `crpzkppsriranmeumfqs`  
**Status**: ✅ **Projeto ativo**

---

## 📋 Passo a Passo

### **Passo 1: Acessar SQL Editor**

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
2. Faça login se necessário

---

### **Passo 2: Aplicar Migrações na Ordem**

Execute cada migração uma por vez, copiando e colando o conteúdo de cada arquivo:

#### **1. Base - User Profiles**
```sql
-- Copie o conteúdo de: supabase/migrations/000_create_user_profiles.sql
```

#### **2. Storage - Avatars**
```sql
-- Copie o conteúdo de: supabase/migrations/002_create_avatars_bucket.sql
```

#### **3. Campos Adicionais**
```sql
-- Copie o conteúdo de: supabase/migrations/003_add_phone_company_fields.sql
```

#### **4. Templates Marketplace**
```sql
-- Copie o conteúdo de: supabase/migrations/004_user_marketplace_templates.sql
```

#### **5. Histórico Avançado**
```sql
-- Copie o conteúdo de: supabase/migrations/20250106_advanced_calculator_history.sql
```

#### **6. Sistema de Assinaturas (Base)**
```sql
-- Copie o conteúdo de: supabase/migrations/20250108_subscriptions.sql
```

#### **7. Suporte Stripe**
```sql
-- Copie o conteúdo de: supabase/migrations/20250110_add_stripe_support.sql
```

#### **8. Consolidar Subscriptions** ⭐ NOVO
```sql
-- Copie o conteúdo de: supabase/migrations/20250111_consolidate_subscriptions.sql
```

#### **9. Métricas de Negócio** ⭐ NOVO
```sql
-- Copie o conteúdo de: supabase/migrations/20250111_create_business_metrics_tables.sql
```

#### **10. Histórico de Pagamentos** ⭐ NOVO
```sql
-- Copie o conteúdo de: supabase/migrations/20250111_add_payment_history.sql
```

---

### **Passo 3: Verificar**

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar pelo menos estas tabelas:
-- user_profiles
-- subscriptions
-- usage_tracking
-- payment_history
-- user_marketplace_templates
-- advanced_calculation_history
-- teams
-- team_members
-- plan_change_history
-- business_metrics
-- sales_data
-- product_performance
```

---

## ⚠️ Notas Importantes

1. **Ordem**: Execute na ordem correta (algumas migrações dependem de outras)
2. **Erros**: Se aparecer "already exists", é normal - as migrações usam `IF NOT EXISTS`
3. **Verificação**: Após cada migração, verifique se não houve erros

---

## 🔧 Troubleshooting

### Erro: "relation already exists"
- ✅ Normal - migrações usam `IF NOT EXISTS`
- ✅ Continue com a próxima migração

### Erro: "constraint already exists"
- ✅ Normal - migrações usam `DROP CONSTRAINT IF EXISTS`
- ✅ Continue com a próxima migração

### Erro: "column already exists"
- ✅ Normal - migrações usam `ADD COLUMN IF NOT EXISTS`
- ✅ Continue com a próxima migração

---

**Status**: ✅ **Pronto para aplicar**

