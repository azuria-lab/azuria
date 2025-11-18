# 📊 Análise Completa das 49 Tabelas

**Data**: Janeiro 2025  
**Status**: ✅ **Análise em andamento**

---

## ✅ Status Atual

### **Migrações Aplicadas**:
- ✅ `payment_history` - **APLICADA COM SUCESSO** 🎉

### **Tabelas Principais Verificadas**:
- ✅ `subscriptions` - **EXISTE** (17 colunas, com Stripe ✅)
- ✅ `usage_tracking` - **EXISTE** (14 colunas)
- ✅ `teams` - **EXISTE** (9 colunas)
- ✅ `team_members` - **EXISTE** (18 colunas)
- ✅ `plan_change_history` - **EXISTE** (9 colunas)
- ✅ `business_metrics` - **EXISTE** (9 colunas)
- ✅ `sales_data` - **EXISTE** (15 colunas)
- ✅ `product_performance` - **EXISTE** (12 colunas)
- ✅ `user_profiles` - **EXISTE** (9 colunas)
- ✅ `advanced_calculation_history` - **EXISTE** (21 colunas)
- ✅ `user_marketplace_templates` - **EXISTE** (15 colunas)
- ✅ `audit_logs` - **EXISTE** (10 colunas)

---

## 📋 Lista Completa das 49 Tabelas

### **Tabelas em Uso** (Confirmadas no código):

1. ✅ `user_profiles` - Usado em vários lugares
2. ✅ `subscriptions` - Usado em `useSubscription.tsx`
3. ✅ `usage_tracking` - Usado em `usePlanLimits.tsx`
4. ✅ `payment_history` - **NOVO** - Criada agora
5. ✅ `user_marketplace_templates` - Usado em `useUserMarketplaceTemplates.ts`
6. ✅ `advanced_calculation_history` - Usado em `advancedCalculatorHistory.ts`
7. ✅ `teams` - Usado em `useTeams.tsx`
8. ✅ `team_members` - Usado em `useTeamMembers.tsx`
9. ✅ `plan_change_history` - Usado em `PlanChangeHistory.tsx`
10. ✅ `business_metrics` - Usado em `useAdvancedBusinessMetrics.ts`
11. ✅ `sales_data` - Usado em `useAdvancedBusinessMetrics.ts`
12. ✅ `product_performance` - Usado em `useAdvancedBusinessMetrics.ts`
13. ✅ `audit_logs` - Usado em `auditLogService.ts`

---

### **Tabelas NÃO Utilizadas** (Precisam verificação):

#### **Automação** (7 tabelas):
14. ⚠️ `automation_alerts` - Não encontrado uso
15. ⚠️ `automation_executions` - Não encontrado uso
16. ⚠️ `automation_rules` - Não encontrado uso
17. ⚠️ `automation_templates` - Não encontrado uso
18. ⚠️ `automation_workflows` - Não encontrado uso
19. ⚠️ `workflow_approvals` - Não encontrado uso

#### **Cálculos Antigos** (4 tabelas):
20. ⚠️ `calculation_history` - Substituído por `advanced_calculation_history`?
21. ⚠️ `calculation_comments` - Não encontrado uso
22. ⚠️ `calculation_approvals` - Não encontrado uso
23. ⚠️ `calculation_shares` - Não encontrado uso
24. ⚠️ `calculation_templates` - Não encontrado uso

#### **Organizações** (3 tabelas):
25. ⚠️ `organizations` - Não encontrado uso
26. ⚠️ `organization_members` - Não encontrado uso
27. ⚠️ `stores` - Não encontrado uso

#### **Marketplace** (4 tabelas):
28. ⚠️ `marketplace_orders` - Não encontrado uso
29. ⚠️ `marketplace_platforms` - Não encontrado uso
30. ⚠️ `marketplace_products` - Não encontrado uso
31. ⚠️ `marketplace_sync_jobs` - Não encontrado uso

#### **Dashboard** (2 tabelas):
32. ⚠️ `dashboard_configurations` - Não encontrado uso
33. ⚠️ `dashboard_widgets` - Não encontrado uso

#### **Templates** (3 tabelas):
34. ⚠️ `template_favorites` - Não encontrado uso
35. ⚠️ `template_purchases` - Não encontrado uso
36. ⚠️ `template_reviews` - Não encontrado uso

#### **Outras** (15 tabelas):
37. ⚠️ `ai_cache` - Não encontrado uso
38. ⚠️ `analytics_events` - Não encontrado uso
39. ⚠️ `analytics_metrics` - Não encontrado uso
40. ⚠️ `business_kpis` - Não encontrado uso
41. ⚠️ `business_settings` - Não encontrado uso
42. ⚠️ `collaboration_notifications` - Não encontrado uso
43. ⚠️ `price_audit` - Não encontrado uso
44. ⚠️ `pricing_rules` - Não encontrado uso
45. ⚠️ `products` - Não encontrado uso
46. ⚠️ `security_sessions` - Não encontrado uso
47. ⚠️ `subscribers` - Não encontrado uso
48. ⚠️ `tenants` - Não encontrado uso
49. ⚠️ `two_factor_auth` - Não encontrado uso
50. ⚠️ `users` - Não encontrado uso (pode ser duplicado de user_profiles?)

---

## 🔍 Análise Detalhada

### **Tabelas com Estrutura Correta** ✅:
- `subscriptions` - Tem Stripe ✅ (17 colunas)
- `user_profiles` - Estrutura correta
- `usage_tracking` - Estrutura completa (14 colunas)
- `teams` - Estrutura correta
- `team_members` - Estrutura completa (18 colunas)

### **Tabelas Potencialmente Duplicadas** ⚠️:
- `users` vs `user_profiles` - Verificar se são duplicadas
- `calculation_history` vs `advanced_calculation_history` - Verificar se são duplicadas
- `subscribers` vs `subscriptions` - Verificar relação

---

## 📊 Próximos Passos

1. ✅ **Verificar uso real** de cada tabela no código
2. ✅ **Identificar tabelas duplicadas**
3. ✅ **Identificar tabelas não utilizadas**
4. ✅ **Criar plano de limpeza**
5. ✅ **Otimizar estrutura**

---

**Status**: ⏳ **Análise em andamento - Verificando uso real no código**

