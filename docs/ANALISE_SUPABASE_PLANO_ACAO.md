# 📊 Análise do Supabase Cloud - Plano de Ação

**Data**: Janeiro 2025  
**Objetivo**: Limpar, otimizar e completar o schema do Supabase

---

## 🔍 Problemas Identificados

### 1. **Tabelas Duplicadas** ❌

#### `subscriptions` - Criada 3 vezes:
- `001_subscriptions_schema.sql` - plan: `free, pro, business`
- `20250108_01_complete_subscription_system.sql` - plan_id: `free, essencial, pro, enterprise`
- `20250108_subscriptions.sql` - plan_id: `free, essencial, pro, enterprise`

**Problema**: Estruturas diferentes causam conflitos

#### `usage_tracking` - Criada 2 vezes:
- `001_subscriptions_schema.sql` - estrutura simples (date, calculations_count, etc.)
- `20250108_01_complete_subscription_system.sql` - estrutura complexa (subscription_id, period_start, etc.)

**Problema**: Estruturas incompatíveis

---

### 2. **Tabelas Faltando** ❌

Tabelas usadas no código mas sem migração:
- `business_metrics` - usado em `useAdvancedBusinessMetrics.ts`
- `sales_data` - usado em `useAdvancedBusinessMetrics.ts` e `DataEntryFormWidget.tsx`
- `product_performance` - usado em `useAdvancedBusinessMetrics.ts`

---

### 3. **Tabelas Não Utilizadas** ⚠️

Tabelas em `schema.sql` que não aparecem no código:
- `business_settings` - não encontrado uso
- `business_kpis` - não encontrado uso
- `calculation_history` - não encontrado uso (tem `advanced_calculation_history`)
- `calculation_comments` - não encontrado uso
- `calculation_approvals` - não encontrado uso
- `calculation_shares` - não encontrado uso
- `calculation_templates` - não encontrado uso
- `organizations` - não encontrado uso
- `organization_members` - não encontrado uso
- `stores` - não encontrado uso
- `automation_rules` - não encontrado uso
- `automation_executions` - não encontrado uso
- `automation_alerts` - não encontrado uso
- `dashboard_configurations` - não encontrado uso
- `subscribers` - não encontrado uso
- `collaboration_notifications` - não encontrado uso
- `two_factor_auth` - não encontrado uso
- `security_sessions` - não encontrado uso
- `ai_cache` - não encontrado uso

---

## ✅ Tabelas em Uso (Confirmadas)

1. ✅ `user_profiles` - usado em vários lugares
2. ✅ `subscriptions` - usado em `useSubscription.tsx`
3. ✅ `usage_tracking` - usado em `usePlanLimits.tsx` e `usage-tracking.ts`
4. ✅ `user_marketplace_templates` - usado em `useUserMarketplaceTemplates.ts`
5. ✅ `advanced_calculation_history` - usado em `advancedCalculatorHistory.ts`
6. ✅ `teams` - usado em `useTeams.tsx`
7. ✅ `team_members` - usado em `useTeamMembers.tsx`
8. ✅ `plan_change_history` - usado em `PlanChangeHistory.tsx`
9. ✅ `payment_history` - mencionado em `001_subscriptions_schema.sql`
10. ✅ `audit_logs` - usado em `auditLogService.ts`

---

## 🎯 Plano de Ação

### Fase 1: Consolidar Migrações ✅
1. Remover migrações duplicadas
2. Criar uma migração consolidada para subscriptions
3. Criar uma migração consolidada para usage_tracking

### Fase 2: Criar Tabelas Faltantes ✅
1. Criar migração para `business_metrics`
2. Criar migração para `sales_data`
3. Criar migração para `product_performance`

### Fase 3: Limpar Tabelas Não Utilizadas ⚠️
1. Documentar tabelas não utilizadas
2. Marcar para remoção futura (não remover agora para não quebrar)

### Fase 4: Otimizar ✅
1. Adicionar índices faltantes
2. Melhorar RLS policies
3. Adicionar constraints necessárias

---

## 📋 Próximos Passos

1. ✅ Consolidar migrações de subscriptions
2. ✅ Consolidar migrações de usage_tracking
3. ✅ Criar tabelas faltantes
4. ✅ Otimizar índices e RLS

---

**Status**: 🔄 **Em análise e correção**

