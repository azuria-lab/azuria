# 💡 EXEMPLOS PRÁTICOS - SISTEMA DE ASSINATURAS

## 📚 Índice
1. [Verificação de Plano](#1-verificação-de-plano)
2. [Controle de Features](#2-controle-de-features)
3. [Limites de Uso](#3-limites-de-uso)
4. [Componentes UI](#4-componentes-ui)
5. [Integração com Páginas](#5-integração-com-páginas)

---

## 1. Verificação de Plano

### Exemplo 1.1: Header com Badge do Plano

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

export function UserMenu() {
  const { subscription } = useSubscription();

  return (
    <div className="flex items-center gap-2">
      <span>Minha Conta</span>
      <SubscriptionBadge 
        planId={subscription?.planId}
        status={subscription?.status}
      />
    </div>
  );
}
```

### Exemplo 1.2: Sidebar com Info do Plano

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/config/plans';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { subscription } = useSubscription();
  const currentPlan = PLANS[subscription?.planId || 'free'];

  return (
    <aside>
      <div className="border rounded-lg p-4">
        <h3>{currentPlan.name}</h3>
        <p>{currentPlan.description}</p>
        {currentPlan.id !== 'enterprise' && (
          <Button asChild>
            <a href="/pricing">Fazer Upgrade</a>
          </Button>
        )}
      </div>
    </aside>
  );
}
```

---

## 2. Controle de Features

### Exemplo 2.1: Bloqueio de Calculadora Avançada

```tsx
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { AdvancedCalculator } from './AdvancedCalculator';

export function CalculatorPage() {
  return (
    <div>
      {/* Calculadora básica - sempre disponível */}
      <BasicCalculator />

      {/* Calculadora avançada - só para planos pagos */}
      <FeatureGate feature="advancedCalculator">
        <AdvancedCalculator />
      </FeatureGate>
    </div>
  );
}
```

### Exemplo 2.2: Botão de Exportação Condicional

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButton() {
  const { canExportReports } = useFeatureAccess();
  const pdfAccess = canExportReports('pdf');
  const excelAccess = canExportReports('excel');

  return (
    <div className="flex gap-2">
      <Button 
        disabled={!pdfAccess.allowed}
        onClick={() => exportToPDF()}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>

      {excelAccess.allowed ? (
        <Button onClick={() => exportToExcel()}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      ) : (
        <Button disabled>
          Excel (PRO+) 🔒
        </Button>
      )}
    </div>
  );
}
```

### Exemplo 2.3: Seção de IA Condicional

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown } from 'lucide-react';

export function AISection() {
  const { canUseAI, currentPlan } = useFeatureAccess();
  const access = canUseAI();

  if (!access.allowed) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          {access.reason}
          <a href="/pricing" className="underline ml-2">
            Fazer upgrade para {access.suggestedPlan}
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h3>Assistente de IA</h3>
      <p>Modelo: {currentPlan.features.aiModel}</p>
      <AIChat />
    </div>
  );
}
```

---

## 3. Limites de Uso

### Exemplo 3.1: Contador de Cálculos

```tsx
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Progress } from '@/components/ui/progress';

export function CalculationCounter() {
  const { limits } = usePlanLimits();

  if (!limits) return null;

  const { dailyCalculations } = limits;
  const percentage = dailyCalculations.limit === 'unlimited'
    ? 100
    : (dailyCalculations.used / dailyCalculations.limit) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Cálculos Hoje</span>
        <span>
          {dailyCalculations.used}
          {dailyCalculations.limit !== 'unlimited' && ` / ${dailyCalculations.limit}`}
        </span>
      </div>
      <Progress value={percentage} />
      {dailyCalculations.limit !== 'unlimited' && (
        <p className="text-xs text-muted-foreground">
          Resetando em {formatTime(dailyCalculations.resetsAt)}
        </p>
      )}
    </div>
  );
}
```

### Exemplo 3.2: Botão de Cálculo com Limite

```tsx
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function CalculateButton({ onCalculate }: { onCalculate: () => void }) {
  const { canMakeCalculation, trackCalculation, limits } = usePlanLimits();
  const { toast } = useToast();

  const handleClick = async () => {
    if (!canMakeCalculation()) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de cálculos diários.',
        action: (
          <Button size="sm" asChild>
            <a href="/pricing">Fazer Upgrade</a>
          </Button>
        ),
      });
      return;
    }

    // Rastreia o uso
    const tracked = await trackCalculation();
    if (!tracked) return;

    // Executa o cálculo
    onCalculate();
  };

  const remaining = limits?.dailyCalculations.remaining;

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} className="w-full">
        Calcular
      </Button>
      {remaining !== 'unlimited' && remaining !== undefined && remaining < 3 && (
        <p className="text-xs text-orange-500">
          ⚠️ Restam apenas {remaining} cálculos hoje
        </p>
      )}
    </div>
  );
}
```

### Exemplo 3.3: Dashboard de Uso

```tsx
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Brain, Code } from 'lucide-react';

export function UsageDashboard() {
  const { limits } = usePlanLimits();

  if (!limits) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cálculos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Cálculos Hoje
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {limits.dailyCalculations.used}
          </div>
          {limits.dailyCalculations.limit !== 'unlimited' && (
            <p className="text-xs text-muted-foreground">
              de {limits.dailyCalculations.limit} disponíveis
            </p>
          )}
        </CardContent>
      </Card>

      {/* IA */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Consultas IA
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {limits.monthlyAiQueries.used}
          </div>
          {limits.monthlyAiQueries.limit !== 'unlimited' ? (
            <p className="text-xs text-muted-foreground">
              de {limits.monthlyAiQueries.limit} este mês
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Ilimitado</p>
          )}
        </CardContent>
      </Card>

      {/* API */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            API Requests
          </CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {limits.monthlyApiRequests.used}
          </div>
          {limits.monthlyApiRequests.limit !== 'unlimited' ? (
            <p className="text-xs text-muted-foreground">
              de {limits.monthlyApiRequests.limit} este mês
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Ilimitado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 4. Componentes UI

### Exemplo 4.1: Card de Upgrade

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export function UpgradeCard() {
  const { subscription } = useSubscription();

  if (subscription?.planId !== 'free') return null;

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Libere todo o potencial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>✅ Cálculos ilimitados</li>
          <li>✅ IA com GPT-4</li>
          <li>✅ Integração com marketplaces</li>
          <li>✅ Analytics avançado</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <a href="/pricing">
            Ver Planos
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Exemplo 4.2: Banner de Trial

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

export function TrialBanner() {
  const { subscription } = useSubscription();

  if (subscription?.status !== 'trialing' || !subscription.trialEnd) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Alert>
      <Clock className="h-4 w-4" />
      <AlertTitle>Período de Teste</AlertTitle>
      <AlertDescription>
        Restam {daysRemaining} dias do seu teste grátis. 
        Aproveite todas as funcionalidades!
      </AlertDescription>
    </Alert>
  );
}
```

---

## 5. Integração com Páginas

### Exemplo 5.1: Dashboard Principal

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { FeatureGate } from '@/components/subscription/FeatureGate';

export default function Dashboard() {
  const { subscription } = useSubscription();
  const { canUseMarketplaceIntegration } = useFeatureAccess();
  const { limits } = usePlanLimits();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1>Dashboard</h1>
        <SubscriptionBadge planId={subscription?.planId} />
      </div>

      {/* Uso */}
      {limits && <UsageDashboard />}

      {/* Calculadora */}
      <section className="mt-8">
        <Calculator />
      </section>

      {/* Analytics Avançado - Só PRO+ */}
      <FeatureGate feature="advancedAnalytics">
        <section className="mt-8">
          <AdvancedAnalytics />
        </section>
      </FeatureGate>

      {/* Integrações */}
      {canUseMarketplaceIntegration().allowed && (
        <section className="mt-8">
          <MarketplaceIntegrations />
        </section>
      )}

      {/* Upgrade Card - Só FREE */}
      {subscription?.planId === 'free' && (
        <aside className="mt-8">
          <UpgradeCard />
        </aside>
      )}
    </div>
  );
}
```

### Exemplo 5.2: Settings com Gestão de Assinatura

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, formatPrice } from '@/config/plans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { subscription, cancelSubscription, reactivateSubscription } = useSubscription();
  
  if (!subscription) return null;

  const currentPlan = PLANS[subscription.planId];

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Plano Atual</p>
            <p className="text-2xl font-bold">{currentPlan.name}</p>
            <p className="text-muted-foreground">
              {formatPrice(currentPlan.pricing.monthly)}/mês
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">
              {subscription.status === 'active' ? 'Ativo' : subscription.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Próxima cobrança</p>
            <p className="font-medium">
              {subscription.currentPeriodEnd.toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            {subscription.planId !== 'enterprise' && (
              <Button asChild>
                <a href="/pricing">Fazer Upgrade</a>
              </Button>
            )}

            {subscription.cancelAtPeriodEnd ? (
              <Button 
                variant="outline" 
                onClick={() => reactivateSubscription()}
              >
                Reativar Assinatura
              </Button>
            ) : subscription.planId !== 'free' && (
              <Button 
                variant="destructive" 
                onClick={() => cancelSubscription()}
              >
                Cancelar Assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎯 Dicas de Uso

### ✅ **Boas Práticas**
- Sempre verifique `loading` antes de usar dados dos hooks
- Use `FeatureGate` para bloqueio visual de features
- Rastreie uso com `trackCalculation/trackAIQuery/trackAPIRequest`
- Mostre limites de forma proativa (antes de atingir)

### ❌ **Evite**
- Não fazer verificação de limite antes de executar ações
- Não mostrar features bloqueadas sem explicação
- Hardcodar nomes de planos (use `PLANS` config)
- Não atualizar UI após mudança de plano

---

## 🔗 Links Relacionados

- **Documentação Completa:** `SUBSCRIPTION_SYSTEM.md`
- **Quick Start:** `SUBSCRIPTION_QUICKSTART.md`
- **Tipos:** `src/types/subscription.ts`
- **Config:** `src/config/plans.ts`

---

**💡 Mais exemplos? Veja os componentes em `src/components/subscription/`**
