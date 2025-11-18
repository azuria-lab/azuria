# 🎯 Plano de Otimização do Supabase Cloud

**Data**: Janeiro 2025  
**Status**: ✅ **Análise Completa - Pronto para Otimização**

---

## 📊 Resumo da Análise

- ✅ **49 tabelas** no total
- ✅ **24 tabelas em uso** (49%)
- ⚠️ **25 tabelas não utilizadas** (51%)
- ⚠️ **1 tabela potencialmente duplicada** (`users`)

---

## 🔍 Verificações Necessárias

### **1. Verificar Tabela `users`** ⚠️ CRÍTICO

Execute no SQL Editor:
```sql
-- Ver estrutura de users
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' 
ORDER BY ordinal_position;

-- Comparar com user_profiles
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_profiles' 
ORDER BY ordinal_position;
```

**Decisão necessária**:
- Se `users` for duplicada → Remover ou migrar dados
- Se `users` tiver função diferente → Manter e documentar

---

## 🗑️ Tabelas para Remoção Futura (25 tabelas)

### **Fase 1: Verificar Dados** (Antes de Remover)

Execute para cada tabela:
```sql
SELECT COUNT(*) FROM nome_da_tabela;
```

Se retornar 0 registros, pode remover com segurança.

### **Fase 2: Remover Tabelas Vazias**

Tabelas candidatas para remoção (após verificar que estão vazias):

#### **Marketplace** (4 tabelas):
- `marketplace_orders`
- `marketplace_platforms`
- `marketplace_products`
- `marketplace_sync_jobs`

#### **Dashboard** (2 tabelas):
- `dashboard_configurations`
- `dashboard_widgets`

#### **Templates** (3 tabelas):
- `template_favorites`
- `template_purchases`
- `template_reviews`

#### **Automação** (2 tabelas):
- `automation_templates`
- `workflow_approvals`

#### **Outras** (14 tabelas):
- `ai_cache`
- `analytics_events`
- `analytics_metrics`
- `business_kpis`
- `price_audit`
- `pricing_rules`
- `products`
- `security_sessions`
- `subscribers` (verificar relação com subscriptions)
- `tenants`
- `two_factor_auth`
- `users` (se duplicada)
- `organizations` (se não usado)
- `organization_members` (se não usado)
- `stores` (se não usado)

---

## 🔧 Otimizações Recomendadas

### **1. Índices**

Verificar se todas as foreign keys têm índices:
```sql
-- Verificar índices faltantes
SELECT 
    t.table_name,
    kcu.column_name,
    CASE WHEN i.indexname IS NULL THEN '❌ FALTANDO' ELSE '✅ EXISTE' END as indice
FROM information_schema.table_constraints t
JOIN information_schema.key_column_usage kcu ON t.constraint_name = kcu.constraint_name
LEFT JOIN pg_indexes i ON i.tablename = t.table_name AND i.indexname LIKE '%' || kcu.column_name || '%'
WHERE t.constraint_type = 'FOREIGN KEY'
    AND t.table_schema = 'public'
ORDER BY t.table_name, kcu.column_name;
```

### **2. RLS Policies**

Verificar se todas as tabelas têm RLS habilitado:
```sql
-- Verificar RLS
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ HABILITADO' ELSE '❌ DESABILITADO' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### **3. Constraints**

Verificar constraints faltantes:
```sql
-- Verificar constraints
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;
```

---

## 📋 Ações Imediatas

### **1. Verificar Tabela `users`** 🔴

Execute `VERIFICAR_TABELA_USERS.sql` no SQL Editor

### **2. Aplicar Otimizações** 🟡

Após verificar `users`, aplicar:
- Índices faltantes
- RLS policies
- Constraints

### **3. Documentar Tabelas Não Utilizadas** 🟢

Criar documentação para remoção futura

---

## ✅ Status Atual

- ✅ `payment_history` - **CRIADA**
- ✅ `subscriptions` - **ESTRUTURA COMPLETA COM STRIPE**
- ✅ Todas as tabelas principais existem
- ⚠️ 25 tabelas não utilizadas (documentar)
- ⚠️ 1 tabela duplicada (`users` - verificar)

---

**Próximo Passo**: Verificar tabela `users` e aplicar otimizações

