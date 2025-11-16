/**
 * Página de Gerenciamento de Assinatura
 * Permite upgrade/downgrade, cancelamento, histórico e visualização de uso
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/config/plans';
import { UsageDisplay } from '@/components/subscription/UsageDisplay';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { PlanChangeHistory } from '@/components/subscription/PlanChangeHistory';
import { PlanComparison } from '@/components/subscription/PlanComparison';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SubscriptionManagementPage = () => {
  const navigate = useNavigate();
  const { subscription, loading, cancelSubscription, reactivateSubscription } = useSubscription();
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Assinatura não encontrada</AlertTitle>
            <AlertDescription>
              Não foi possível carregar suas informações de assinatura.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const plan = PLANS[subscription.planId];
  const isFreePlan = subscription.planId === 'free';
  const isCanceled = subscription.status === 'canceled';
  const willCancelAtPeriodEnd = subscription.cancelAtPeriodEnd;

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o fim do período atual.')) {
      return;
    }

    setCancellingSubscription(true);
    try {
      const success = await cancelSubscription();
      if (success) {
        alert('Assinatura cancelada com sucesso. Você continuará com acesso até ' + 
              subscription.currentPeriodEnd.toLocaleDateString('pt-BR'));
      }
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setReactivating(true);
    try {
      const success = await reactivateSubscription();
      if (success) {
        alert('Assinatura reativada com sucesso!');
      }
    } finally {
      setReactivating(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano, uso e faturamento
          </p>
        </div>

        {/* Status da Assinatura */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {subscription.billingInterval === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}
                  </CardDescription>
                </div>
              </div>
              <SubscriptionBadge planId={subscription.planId} status={subscription.status} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Alerta de Cancelamento */}
            {willCancelAtPeriodEnd && !isCanceled && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Assinatura será cancelada</AlertTitle>
                <AlertDescription>
                  Sua assinatura será cancelada em{' '}
                  {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}. 
                  Você pode reativar a qualquer momento antes dessa data.
                </AlertDescription>
              </Alert>
            )}

            {/* Info do Plano */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Período Atual</span>
                </div>
                <p className="font-medium">
                  {subscription.currentPeriodStart.toLocaleDateString('pt-BR')} até{' '}
                  {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Renova {formatDistanceToNow(subscription.currentPeriodEnd, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Valor</span>
                </div>
                <p className="font-medium text-2xl">
                  {isFreePlan ? (
                    'Grátis'
                  ) : (
                    <>
                      R$ {subscription.billingInterval === 'monthly' 
                        ? plan.pricing.monthly 
                        : plan.pricing.annual}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{subscription.billingInterval === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.status === 'active' && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Ativo</span>
                    </>
                  )}
                  {subscription.status === 'canceled' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Cancelado</span>
                    </>
                  )}
                  {subscription.status !== 'active' && subscription.status !== 'canceled' && (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium capitalize">{subscription.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="flex justify-between pt-6">
            <div className="flex gap-3">
              {!isFreePlan && !isCanceled && !willCancelAtPeriodEnd && (
                <Button 
                  variant="outline" 
                  onClick={handleUpgrade}
                  className="gap-2"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Fazer Upgrade
                </Button>
              )}
              
              {willCancelAtPeriodEnd && !isCanceled && (
                <Button 
                  onClick={handleReactivateSubscription}
                  disabled={reactivating}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {reactivating ? 'Reativando...' : 'Reativar Assinatura'}
                </Button>
              )}
            </div>

            {!isFreePlan && !isCanceled && !willCancelAtPeriodEnd && (
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={cancellingSubscription}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {cancellingSubscription ? 'Cancelando...' : 'Cancelar Assinatura'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Tabs com Conteúdo */}
        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage">Uso Atual</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="plans">Comparar Planos</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="mt-6">
            <UsageDisplay />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <PlanChangeHistory />
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <PlanComparison />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default SubscriptionManagementPage;
