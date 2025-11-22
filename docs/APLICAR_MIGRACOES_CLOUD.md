# 🚀 Aplicar Migrações no Supabase Cloud

**Data**: Janeiro 2025  
**Status**: ✅ **Pronto para aplicar**

---

## 📋 Opções para Aplicar

### **Opção 1: Via Supabase CLI** (Recomendado)

#### Passo 1: Linkar Projeto
```bash
# Linkar ao projeto Cloud
supabase link --project-ref ghcgnrmuvdypahrwspmn
```

#### Passo 2: Aplicar Migrações
```bash
# Aplicar todas as migrações
supabase db push
```

---

### **Opção 2: Via SQL Editor** (Manual)

1. Acesse: https://supabase.com/dashboard/project/ghcgnrmuvdypahrwspmn/sql
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

Após aplicar, execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar 13 tabelas:
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
-- audit_logs
```

---

## 🔧 Sobre MCP/Extensões Supabase

### **Status Atual**:

❌ **Não existe MCP Server oficial do Supabase** ainda

### **Alternativas Disponíveis**:

1. ✅ **Supabase CLI** - Via terminal
2. ✅ **Supabase Dashboard** - Via SQL Editor
3. ✅ **Extensões VS Code** - Existem extensões não-oficiais

### **Como Configurar MCP no Cursor** (se criar servidor customizado):

1. Abra: `Configurações` > `Recursos` > `MCP`
2. Clique: `+ Adicionar Novo Servidor MCP`
3. Configure:
   - **Nome**: Supabase
   - **Tipo**: stdio
   - **Comando**: `supabase` (ou script customizado)

### **Extensões VS Code** (podem funcionar no Cursor):

- `supabase.supabase-vscode` - Extensão não-oficial
- Funcionalidades: autocomplete, queries, etc.

---

**Status**: ✅ **Pronto para aplicar**

