# 🚀 Instruções: Aplicar Migrações no Supabase Cloud

**Status**: ✅ **Projeto ativo - pronto para aplicar migrações**

**Project ID**: `crpzkppsriranmeumfqs`

---

## 📋 Passo a Passo

### **Passo 1: Linkar Projeto** (Via CLI - Opcional)

Se quiser usar CLI, execute:

```bash
supabase link --project-ref crpzkppsriranmeumfqs
```

**Nota**: Você precisará da senha do banco de dados (encontre em Settings > Database)

---

### **Passo 3: Aplicar Migrações**

#### **Opção A: Via CLI** (Recomendado)

```bash
supabase db push
```

Isso aplicará todas as migrações automaticamente.

#### **Opção B: Via SQL Editor** (Recomendado - Mais Simples)

1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
2. Execute cada migração na ordem:
   - `000_create_user_profiles.sql`
   - `002_create_avatars_bucket.sql`
   - `003_add_phone_company_fields.sql`
   - `004_user_marketplace_templates.sql`
   - `20250106_advanced_calculator_history.sql`
   - `20250108_subscriptions.sql`
   - `20250110_add_stripe_support.sql`
   - `20250111_consolidate_subscriptions.sql` ⭐
   - `20250111_create_business_metrics_tables.sql` ⭐
   - `20250111_add_payment_history.sql` ⭐

---

### **Passo 4: Verificar**

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar 13 tabelas
```

---

## 🔌 Sobre MCP/Extensões Supabase

### **Resposta Direta**:

❌ **Não existe MCP Server oficial do Supabase** ainda

### **Alternativas**:

1. ✅ **Supabase CLI** - Já está instalado e funcionando
2. ✅ **Supabase Dashboard** - Interface web oficial
3. ⚠️ **Extensões VS Code** - Podem funcionar no Cursor (não-oficiais)

### **Recomendação**:

Use **Supabase CLI** por enquanto. É a melhor opção disponível e já está configurada.

Veja `SOBRE_MCP_SUPABASE.md` para mais detalhes.

---

**Próximo Passo**: Despausar projeto no Dashboard primeiro

