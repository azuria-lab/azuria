# Sistema de Limites de Uso - Guia de Implementação

## ✅ O que foi implementado

### 1. **Hook atualizado: `usePlanLimits`**
```typescript
import { usePlanLimits } from '@/hooks/usePlanLimits';

const { 
  usage,              // Dados de uso atual
  loading,            // Estado de carregamento
  limits,             // Limites calculados
  canMakeCalculation, // Verifica se pode calcular
  canMakeAIQuery,     // Verifica se pode usar IA
  canMakeAPIRequest,  // Verifica se pode usar API
  trackCalculation,   // Incrementa contador de cálculos
  trackAIQuery,       // Incrementa contador de IA
  trackAPIRequest,    // Incrementa contador de API
  refresh,            // Recarrega dados de uso
} = usePlanLimits();
```

**Conectado ao Supabase:** ✅ Busca dados reais da tabela `usage_tracking`

### 2. **Componente: `UsageDisplay`**
Mostra visualmente o uso atual vs limites do plano:

```tsx
import { UsageDisplay } from '@/components/subscription/UsageDisplay';

<UsageDisplay />
```

**Features:**
- Progress bars com cores (verde → amarelo → vermelho)
- Badges mostrando uso atual vs limite
- Timer de renovação ("renova em X horas")
- Alertas quando próximo ao limite

### 3. **Componente: `LimitReachedBlock`**
Modal de bloqueio quando usuário atinge um limite:

```tsx
import { LimitReachedBlock } from '@/components/subscription/LimitReachedBlock';

<LimitReachedBlock
  isOpen={showLimitModal}
  onClose={() => setShowLimitModal(false)}
  limitType="daily_calculations" // ou 'ai_queries' | 'api_requests'
  currentPlan={subscription.planId}
/>
```

**Features:**
- Mensagem explicando qual limite foi atingido
- Sugestões de planos para upgrade
- Comparação de recursos
- Botão direto para página de pricing

### 4. **Utilitários: `usage-tracking.ts`**
Funções standalone para tracking em qualquer lugar da aplicação:

```typescript
import {
  canMakeCalculation,
  canMakeAIQuery,
  canMakeAPIRequest,
  incrementCalculationCount,
  incrementAIQueryCount,
  incrementAPIRequestCount,
} from '@/lib/usage-tracking';

// Antes de fazer operação
if (await canMakeCalculation()) {
  // Fazer cálculo
  await performCalculation();
  
  // Incrementar contador
  await incrementCalculationCount();
} else {
  // Mostrar modal de limite atingido
}
```

---

## 🚀 Como integrar em operações existentes

### Exemplo 1: Calculadora de Custos

```typescript
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { LimitReachedBlock } from '@/components/subscription/LimitReachedBlock';
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export const CostCalculator = () => {
  const { canMakeCalculation, trackCalculation } = usePlanLimits();
  const { subscription } = useSubscription();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleCalculate = async () => {
    // Verificar se pode fazer cálculo
    if (!canMakeCalculation()) {
      setShowLimitModal(true);
      return;
    }

    // Fazer o cálculo
    const result = await performCalculation();

    // Incrementar contador (após sucesso)
    const tracked = await trackCalculation();
    
    if (!tracked) {
      console.warn('Falha ao registrar uso');
    }

    return result;
  };

  return (
    <>
      <button onClick={handleCalculate}>
        Calcular Custos
      </button>

      <LimitReachedBlock
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="daily_calculations"
        currentPlan={subscription?.planId || 'free'}
      />
    </>
  );
};
```

### Exemplo 2: Assistente IA

```typescript
import { usePlanLimits } from '@/hooks/usePlanLimits';

export const AIAssistant = () => {
  const { canMakeAIQuery, trackAIQuery } = usePlanLimits();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleAIQuery = async (question: string) => {
    if (!canMakeAIQuery()) {
      setShowLimitModal(true);
      return;
    }

    const response = await callAIAPI(question);
    await trackAIQuery();
    
    return response;
  };

  return (
    <>
      <input 
        onSubmit={handleAIQuery}
        placeholder="Pergunte ao assistente..."
      />

      <LimitReachedBlock
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="ai_queries"
        currentPlan={subscription?.planId || 'free'}
      />
    </>
  );
};
```

### Exemplo 3: Integração com Marketplace

```typescript
import { canMakeAPIRequest, incrementAPIRequestCount } from '@/lib/usage-tracking';

export const syncWithMarketplace = async () => {
  // Verificar antes de chamar API externa
  if (!await canMakeAPIRequest()) {
    throw new Error('Limite de requisições API atingido');
  }

  // Fazer chamada à API
  const response = await fetch('https://api.mercadolivre.com/...');
  
  // Incrementar contador
  await incrementAPIRequestCount();
  
  return response.json();
};
```

---

## 📊 Limites por Plano

| Recurso | FREE | ESSENCIAL | PRO | ENTERPRISE |
|---------|------|-----------|-----|------------|
| **Cálculos/dia** | 10 | 100 | Ilimitado | Ilimitado |
| **Consultas IA/mês** | 0 | 0 | 500 | Ilimitado |
| **Requisições API/mês** | 0 | 0 | 5.000 | Ilimitado |

---

## 🔄 Reset de Contadores

Os contadores são resetados automaticamente:

### Reset Diário (Cálculos)
```sql
-- Função no Supabase
CREATE OR REPLACE FUNCTION reset_daily_calculations()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET calculations_today = 0
    WHERE DATE(updated_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

**Configurar no Supabase:**
1. Dashboard → Database → Functions → `reset_daily_calculations`
2. Cron Job → Executar diariamente às 00:00

### Reset Mensal (IA + API)
```sql
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_tracking
    SET 
        calculations_this_month = 0,
        ai_queries_this_month = 0,
        api_requests_this_month = 0,
        period_start = NOW(),
        period_end = NOW() + INTERVAL '1 month'
    WHERE period_end < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 Como usar o UsageDisplay

### Em um Dashboard

```typescript
import { UsageDisplay } from '@/components/subscription/UsageDisplay';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Outros cards */}
      <UsageDisplay />
    </div>
  );
};
```

### Em uma página de conta

```typescript
import { UsageDisplay } from '@/components/subscription/UsageDisplay';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

export const AccountPage = () => {
  return (
    <div className="space-y-6">
      <h1>Minha Conta</h1>
      
      <SubscriptionBadge />
      
      <UsageDisplay />
      
      {/* Outros componentes */}
    </div>
  );
};
```

---

## 🛡️ Proteção de Rotas

Use o `FeatureGate` em conjunto com limites:

```typescript
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { usePlanLimits } from '@/hooks/usePlanLimits';

export const ProtectedFeature = () => {
  const { canMakeAIQuery } = usePlanLimits();

  return (
    <FeatureGate feature="aiAssistant">
      {canMakeAIQuery() ? (
        <AIAssistantComponent />
      ) : (
        <div>Você atingiu o limite de consultas à IA este mês.</div>
      )}
    </FeatureGate>
  );
};
```

---

## ✅ Checklist de Integração

- [x] Migração do banco de dados aplicada
- [x] Hook `usePlanLimits` conectado ao Supabase
- [x] Componente `UsageDisplay` criado
- [x] Componente `LimitReachedBlock` criado
- [x] Utilitários de tracking criados
- [ ] Integrar tracking na calculadora de custos
- [ ] Integrar tracking no assistente IA
- [ ] Integrar tracking nas integrações de marketplace
- [ ] Configurar cron jobs no Supabase para reset de contadores
- [ ] Adicionar `UsageDisplay` no dashboard principal
- [ ] Testar limites com diferentes planos

---

## 🚨 Importante

1. **Sempre chame tracking APÓS sucesso da operação** - não antes
2. **Não bloqueie operações críticas** - use graceful degradation
3. **Monitore falhas de tracking** - não são fatais
4. **Configure cron jobs** - essenciais para reset de contadores

---

## 📝 Próximos Passos

Após testar o sistema de limites:
1. Página de Gerenciamento de Assinatura
2. Sistema de Equipes (Enterprise)
3. Integração com Mercado Pago
