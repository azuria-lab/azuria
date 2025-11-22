# 🔍 Verificar Schema Completo no Supabase Cloud

**Objetivo**: Após conectar, verificar todas as tabelas, funções, triggers e políticas no Cloud

---

## 📋 Comandos para Verificar

### **1. Listar Todas as Tabelas**

```bash
supabase db execute "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
"
```

### **2. Ver Estrutura de uma Tabela Específica**

```bash
supabase db execute "
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'NOME_DA_TABELA'
ORDER BY ordinal_position;
"
```

### **3. Listar Todas as Funções**

```bash
supabase db execute "
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
"
```

### **4. Listar Todos os Triggers**

```bash
supabase db execute "
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
"
```

### **5. Listar Todas as Políticas RLS**

```bash
supabase db execute "
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"
```

### **6. Listar Todos os Índices**

```bash
supabase db execute "
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"
```

### **7. Ver Constraints**

```bash
supabase db execute "
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;
"
```

---

## 🔍 Verificações Específicas

### **Verificar Tabela subscriptions**

```bash
supabase db execute "
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
ORDER BY ordinal_position;
"
```

### **Verificar se tem colunas Stripe**

```bash
supabase db execute "
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND column_name LIKE '%stripe%';
"
```

### **Verificar Tabelas Faltantes**

```bash
supabase db execute "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
"
```

**Tabelas esperadas**:
- user_profiles
- subscriptions
- usage_tracking
- payment_history
- business_metrics
- sales_data
- product_performance
- user_marketplace_templates
- advanced_calculation_history
- teams
- team_members
- plan_change_history

---

## 📊 Script Completo de Verificação

Após conectar, execute este script completo:

```bash
# Salvar em verificar_schema.sh
supabase db execute "
-- 1. Tabelas
SELECT 'TABELAS:' as tipo;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;

-- 2. Funções
SELECT 'FUNÇÕES:' as tipo;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;

-- 3. Triggers
SELECT 'TRIGGERS:' as tipo;
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name;

-- 4. Políticas RLS
SELECT 'POLÍTICAS RLS:' as tipo;
SELECT policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY policyname;
"
```

---

**Após conectar, vamos executar essas verificações!**

