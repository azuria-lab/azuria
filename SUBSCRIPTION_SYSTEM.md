# 🎯 SISTEMA DE PLANOS E ASSINATURAS - AZURIA

## 📋 Visão Geral

Sistema completo de gerenciamento de planos de assinatura implementado no Azuria, permitindo controle granular de features, limites de uso e colaboração em equipe.

---

## 🏗️ ARQUITETURA

### **Camada de Dados (Supabase)**
```
📁 supabase/migrations/
  └── 20250108_subscriptions.sql
      ├── subscriptions (assinaturas dos usuários)
      ├── usage_tracking (rastreamento de uso)
      ├── teams (equipes para Enterprise)
      ├── team_members (membros das equipes)
      └── plan_change_history (histórico de mudanças)
```

### **Camada de Tipos**
```
📁 src/types/
  └── subscription.ts
      ├── Plan, PlanId, BillingInterval
      ├── Subscription, SubscriptionStatus
      ├── UsageTracking, UserLimits
      ├── Team, TeamMember, TeamRole
      └── FeatureAccessResult
```

### **Camada de Configuração**
```
📁 src/config/
  └── plans.ts
      ├── PLANS (definição de todos os planos)
      ├── PLANS_ARRAY (array ordenado)
      ├── PLAN_HIGHLIGHTS (features destacadas)
      └── Funções auxiliares (getPlanById, formatPrice, etc.)
```

### **Camada de Lógica (Hooks)**
```
📁 src/hooks/
  ├── useSubscription.tsx (gerenciamento de assinatura)
  ├── useFeatureAccess.tsx (controle de acesso a features)
  └── usePlanLimits.tsx (controle de limites de uso)
```

### **Camada de UI**
```
📁 src/components/subscription/
  ├── PricingCard.tsx (card de plano)
  ├── SubscriptionBadge.tsx (badge de status)
  └── FeatureGate.tsx (bloqueio de features)

📁 src/pages/
  └── PricingPage.tsx (página de planos e preços)
```

---

## 💎 PLANOS DISPONÍVEIS

### **1. FREE**
```typescript
{
  preço: R$ 0,
  limites: {
    cálculos_diários: 10,
    ai_queries: 0,
    lojas: 0,
  },
  features: [
    'Calculadora básica apenas',
    'Sem salvar histórico',
    'Marca d\'água "Powered by Azuria"',
  ],
}
```

### **2. ESSENCIAL** ⭐ POPULAR
```typescript
{
  preço: {
    mensal: R$ 59.00,
    anual: R$ 590.00, // 17% desconto
  },
  limites: {
    cálculos_diários: 'ilimitado',
    ai_queries: 50/mês,
    lojas: 1,
  },
  features: [
    'Calculadora básica + avançada',
    'Histórico ilimitado',
    '50 consultas IA (GPT-3.5)',
    'Analytics básico',
    'Exportar PDF',
    'Sem marca d\'água',
    'Suporte email (48h)',
  ],
  trial: 7 dias,
}
```

### **3. PRO** 🚀 RECOMENDADO
```typescript
{
  preço: {
    mensal: R$ 119.00,
    anual: R$ 1.190.00, // 17% desconto
  },
  limites: {
    cálculos_diários: 'ilimitado',
    ai_queries: 'ilimitado',
    api_requests: 1000/mês,
    lojas: 3,
  },
  features: [
    'Tudo do Essencial',
    'IA ilimitada (GPT-4)',
    'Integração marketplaces (ML, Shopee, Amazon)',
    'Análise de concorrência',
    'Alertas de preço',
    'Dashboard avançado',
    'API básica',
    'Suporte prioritário (24h)',
  ],
  trial: 14 dias,
}
```

### **4. ENTERPRISE** 💼
```typescript
{
  preço: {
    mensal: R$ 299.00+,
    anual: 'Negociável',
  },
  limites: {
    tudo: 'ilimitado',
  },
  features: [
    'Tudo do PRO',
    'API ilimitada',
    'Lojas ilimitadas',
    'Sistema de equipes completo:',
      '└── Usuários ilimitados',
      '└── Permissões por função',
      '└── Log de auditoria',
      '└── Comentários em cálculos',
      '└── Workflow de aprovação',
    'White label',
    'Onboarding personalizado',
    'Suporte 24/7',
    'Account manager dedicado',
    'SLA garantido',
  ],
  trial: 30 dias,
}
```

---

## 🔧 COMO USAR

### **1. Verificar Plano do Usuário**

```typescript
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { subscription, loading } = useSubscription();
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <p>Plano atual: {subscription?.planId}</p>
      <p>Status: {subscription?.status}</p>
    </div>
  );
}
```

### **2. Verificar Acesso a Feature**

```typescript
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function AIButton() {
  const { canUseAI } = useFeatureAccess();
  const access = canUseAI();
  
  if (!access.allowed) {
    return (
      <Tooltip content={access.reason}>
        <Button disabled>IA Bloqueada 🔒</Button>
      </Tooltip>
    );
  }
  
  return <Button>Usar IA ✨</Button>;
}
```

### **3. Bloquear Conteúdo por Plano**

```typescript
import { FeatureGate } from '@/components/subscription/FeatureGate';

function AdvancedCalculator() {
  return (
    <FeatureGate feature="advancedCalculator">
      <div>
        {/* Conteúdo da calculadora avançada */}
      </div>
    </FeatureGate>
  );
}
```

### **4. Controlar Limites de Uso**

```typescript
import { usePlanLimits } from '@/hooks/usePlanLimits';

function CalculateButton() {
  const { canMakeCalculation, trackCalculation, limits } = usePlanLimits();
  
  const handleCalculate = async () => {
    if (!canMakeCalculation()) {
      toast.error('Limite diário atingido!');
      return;
    }
    
    // Rastreia o uso
    await trackCalculation();
    
    // Faz o cálculo...
  };
  
  return (
    <div>
      <Button onClick={handleCalculate}>Calcular</Button>
      {limits && (
        <p>
          Restam {limits.dailyCalculations.remaining} cálculos hoje
        </p>
      )}
    </div>
  );
}
```

### **5. Exibir Badge de Plano**

```typescript
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

function UserProfile() {
  const { subscription } = useSubscription();
  
  return (
    <div>
      <h2>Meu Perfil</h2>
      <SubscriptionBadge 
        planId={subscription?.planId} 
        status={subscription?.status}
      />
    </div>
  );
}
```

---

## 📊 BANCO DE DADOS

### **Tabelas Criadas**

#### `subscriptions`
```sql
- id (UUID)
- user_id (FK → auth.users)
- plan_id (free, essencial, pro, enterprise)
- status (active, canceled, past_due, trialing, etc.)
- billing_interval (monthly, annual)
- current_period_start, current_period_end
- cancel_at_period_end (boolean)
- mercadopago_subscription_id
- created_at, updated_at
```

#### `usage_tracking`
```sql
- id (UUID)
- user_id (FK → auth.users)
- subscription_id (FK → subscriptions)
- calculations_today, calculations_this_month
- ai_queries_this_month
- api_requests_this_month
- last_calculation_at, last_ai_query_at, last_api_request_at
- period_start, period_end
- created_at, updated_at
```

#### `teams` (Enterprise)
```sql
- id (UUID)
- name
- owner_id (FK → auth.users)
- subscription_id (FK → subscriptions)
- require_approval, allow_comments, audit_log_enabled
- created_at, updated_at
```

#### `team_members` (Enterprise)
```sql
- id (UUID)
- team_id (FK → teams)
- user_id (FK → auth.users)
- role (admin, manager, analyst, operator)
- can_view_calculations, can_create_calculations, etc.
- invited_by, invited_at, accepted_at
- created_at, updated_at
```

#### `plan_change_history`
```sql
- id (UUID)
- user_id (FK → auth.users)
- subscription_id (FK → subscriptions)
- from_plan_id, to_plan_id
- change_type (upgrade, downgrade, reactivation, cancellation)
- reason, effective_date
- created_at
```

### **Triggers e Functions**

1. **`create_free_subscription_for_new_user()`**
   - Cria automaticamente assinatura FREE para novos usuários
   - Inicializa o tracking de uso

2. **`reset_daily_calculations()`**
   - Reseta contadores diários (executar via cron)

3. **`reset_monthly_counters()`**
   - Reseta contadores mensais (executar via cron)

4. **`update_updated_at_column()`**
   - Atualiza automaticamente timestamp de updated_at

### **Row Level Security (RLS)**

Todas as tabelas têm RLS habilitado com políticas que garantem:
- Usuários só veem seus próprios dados
- Team owners gerenciam suas equipes
- Auditoria completa de acesso

---

## 🔄 PRÓXIMOS PASSOS

### **7. Integração com Mercado Pago** 🔜
- [ ] Criar Edge Function para criar checkout
- [ ] Implementar webhooks para confirmação de pagamento
- [ ] Criar fluxo de upgrade/downgrade
- [ ] Implementar renovação automática

### **8. Sistema de Limites** 🔜
- [ ] Implementar middleware de verificação
- [ ] Criar notificações de limite atingido
- [ ] Dashboard de uso em tempo real

### **9. Gerenciamento de Assinatura** 🔜
- [ ] Página de gestão de assinatura
- [ ] Histórico de pagamentos
- [ ] Cancelamento e reativação
- [ ] Upgrade/downgrade com preview de mudanças

### **10. Features Enterprise** 🔜
- [ ] Sistema de convites para equipe
- [ ] Gestão de permissões granulares
- [ ] Log de auditoria
- [ ] Comentários em cálculos
- [ ] Workflow de aprovação

---

## 🚀 DEPLOY

### **1. Executar Migration**
```bash
# Via Supabase CLI
supabase db push

# Ou via Dashboard
# Copiar conteúdo de supabase/migrations/20250108_subscriptions.sql
# Cole no SQL Editor do Supabase
```

### **2. Configurar Cron Jobs** (Supabase)
```sql
-- Reset diário (00:00 UTC)
select cron.schedule(
  'reset-daily-calculations',
  '0 0 * * *',
  $$select reset_daily_calculations()$$
);

-- Reset mensal (1º dia do mês, 00:00 UTC)
select cron.schedule(
  'reset-monthly-counters',
  '0 0 1 * *',
  $$select reset_monthly_counters()$$
);
```

### **3. Variáveis de Ambiente**
```env
# .env.local
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
```

---

## 📖 DOCUMENTAÇÃO ADICIONAL

### **Tipos TypeScript**
Todos os tipos estão documentados em `src/types/subscription.ts`

### **Configuração de Planos**
Detalhes completos em `src/config/plans.ts`

### **Hooks**
- `useSubscription`: Gerenciamento de assinatura
- `useFeatureAccess`: Controle de acesso
- `usePlanLimits`: Limites de uso

### **Componentes**
- `PricingCard`: Card de plano
- `SubscriptionBadge`: Badge de status
- `FeatureGate`: Bloqueio de features

---

## ✅ STATUS ATUAL

### **✅ IMPLEMENTADO**
1. ✅ Tipos TypeScript completos
2. ✅ Configuração de planos
3. ✅ Schema do banco de dados
4. ✅ Hooks de gerenciamento
5. ✅ Componentes de UI
6. ✅ Página de preços

### **🔜 PENDENTE**
7. ⏳ Integração Mercado Pago
8. ⏳ Sistema de limites
9. ⏳ Gerenciamento de assinatura
10. ⏳ Features Enterprise (teams)

---

## 🎨 EXEMPLO DE USO COMPLETO

```typescript
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

export default function Dashboard() {
  const { subscription } = useSubscription();
  const { currentPlan, canUseAI, canExportReports } = useFeatureAccess();
  const { limits, trackCalculation } = usePlanLimits();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Badge do plano */}
      <SubscriptionBadge planId={subscription?.planId} />
      
      {/* Limites */}
      {limits && (
        <div>
          <p>Cálculos hoje: {limits.dailyCalculations.used} / {limits.dailyCalculations.limit}</p>
          <p>Consultas IA: {limits.monthlyAiQueries.used} / {limits.monthlyAiQueries.limit}</p>
        </div>
      )}
      
      {/* Feature bloqueada */}
      <FeatureGate feature="advancedAnalytics">
        <AdvancedAnalyticsDashboard />
      </FeatureGate>
      
      {/* Verificação manual */}
      {canUseAI().allowed && (
        <AIAssistantPanel />
      )}
    </div>
  );
}
```

---

## 🆘 SUPORTE

Para dúvidas ou problemas:
- Documentação: `docs/SUBSCRIPTION_SYSTEM.md`
- Issues: GitHub Issues
- Email: dev@azuria.com.br

---

**Desenvolvido com ❤️ pela equipe Azuria**
