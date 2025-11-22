# 🔍 Verificar Schema via SQL Editor

**Status**: ✅ Login realizado com sucesso  
**Problema**: Senha do banco incorreta para linkar

**Solução**: Vamos verificar o schema diretamente via SQL Editor

---

## 📋 Passo a Passo

### **Passo 1: Acessar SQL Editor**

Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql

---

### **Passo 2: Executar Queries de Verificação**

Execute estas queries uma por uma para verificar tudo:

#### **1. Listar Todas as Tabelas**

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

#### **2. Ver Estrutura de Tabelas Importantes**

```sql
-- subscriptions
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- user_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- usage_tracking
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'usage_tracking'
ORDER BY ordinal_position;
```

#### **3. Verificar Funções**

```sql
SELECT routine_name, routine_type, data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

#### **4. Verificar Triggers**

```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

#### **5. Verificar Políticas RLS**

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

#### **6. Verificar Índices**

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

#### **7. Verificar Constraints**

```sql
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;
```

---

## 🔍 Verificações Específicas

### **Verificar se tem colunas Stripe**

```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND (column_name LIKE '%stripe%' OR column_name LIKE '%stripe%');
```

### **Verificar Tabelas Faltantes**

Execute a query 1 acima e compare com esta lista esperada:

**Tabelas esperadas**:
- ✅ user_profiles
- ✅ subscriptions
- ✅ usage_tracking
- ⚠️ payment_history (verificar se existe)
- ⚠️ business_metrics (verificar se existe)
- ⚠️ sales_data (verificar se existe)
- ⚠️ product_performance (verificar se existe)
- ✅ user_marketplace_templates
- ✅ advanced_calculation_history
- ✅ teams
- ✅ team_members
- ✅ plan_change_history

---

## 📊 Após Executar

Envie os resultados e vou:
1. ✅ Analisar todas as tabelas
2. ✅ Identificar erros e inconsistências
3. ✅ Comparar com migrações locais
4. ✅ Criar correções necessárias

---

**Execute essas queries no SQL Editor e me envie os resultados!**

