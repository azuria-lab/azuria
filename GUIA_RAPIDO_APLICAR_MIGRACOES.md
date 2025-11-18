# ⚡ Guia Rápido: Aplicar Migrações

**Project ID**: `crpzkppsriranmeumfqs`  
**Status**: ✅ **Projeto ativo**

---

## 🚀 Método Mais Rápido: SQL Editor

### **Passo 1**: Acesse o SQL Editor
👉 https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql

### **Passo 2**: Execute as Migrações na Ordem

Copie e cole cada arquivo na ordem abaixo:

#### **1️⃣ Base** (Execute primeiro!)
```
📁 supabase/migrations/000_create_user_profiles.sql
```

#### **2️⃣ Storage**
```
📁 supabase/migrations/002_create_avatars_bucket.sql
```

#### **3️⃣ Campos**
```
📁 supabase/migrations/003_add_phone_company_fields.sql
```

#### **4️⃣ Templates**
```
📁 supabase/migrations/004_user_marketplace_templates.sql
```

#### **5️⃣ Histórico**
```
📁 supabase/migrations/20250106_advanced_calculator_history.sql
```

#### **6️⃣ Assinaturas Base**
```
📁 supabase/migrations/20250108_subscriptions.sql
```

#### **7️⃣ Stripe**
```
📁 supabase/migrations/20250110_add_stripe_support.sql
```

#### **8️⃣ Consolidar** ⭐ NOVO
```
📁 supabase/migrations/20250111_consolidate_subscriptions.sql
```

#### **9️⃣ Métricas** ⭐ NOVO
```
📁 supabase/migrations/20250111_create_business_metrics_tables.sql
```

#### **🔟 Pagamentos** ⭐ NOVO
```
📁 supabase/migrations/20250111_add_payment_history.sql
```

---

## ✅ Verificar Após Aplicar

Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Deve retornar pelo menos**:
- ✅ user_profiles
- ✅ subscriptions
- ✅ usage_tracking
- ✅ payment_history ⭐
- ✅ business_metrics ⭐
- ✅ sales_data ⭐
- ✅ product_performance ⭐
- ✅ user_marketplace_templates
- ✅ advanced_calculation_history
- ✅ teams
- ✅ team_members
- ✅ plan_change_history

---

## ⚠️ Dicas

1. **Erros "already exists"**: Normal! Continue com a próxima migração
2. **Ordem importa**: Execute na ordem correta
3. **Uma por vez**: Execute cada migração separadamente

---

**Tempo estimado**: 5-10 minutos

