/**
 * Componente para exibir uso atual vs limites do plano
 */

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calculator, Clock, Link2, Zap } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/config/plans';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number | 'unlimited';
  resetsAt?: Date;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

const UsageItem = ({ icon, label, used, limit, resetsAt, color = 'blue' }: UsageItemProps) => {
  const isUnlimited = limit === 'unlimited';
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
  };

  const progressColor = isAtLimit 
    ? 'bg-red-500' 
    : isNearLimit 
    ? 'bg-yellow-500' 
    : 'bg-blue-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={colorClasses[color]}>{icon}</div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAtLimit && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'outline' : 'secondary'}>
            {used} / {isUnlimited ? '∞' : limit}
          </Badge>
        </div>
      </div>
      
      {!isUnlimited && (
        <div className="relative">
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {resetsAt && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Renova {formatDistanceToNow(resetsAt, { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      )}
    </div>
  );
};

export const UsageDisplay = () => {
  const { subscription, loading: subLoading } = useSubscription();
  const { limits, loading: limitsLoading } = usePlanLimits();

  if (subLoading || limitsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>Carregando informações de uso...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscription || !limits) {
    return null;
  }

  const plan = PLANS[subscription.planId];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso do Plano</CardTitle>
            <CardDescription>
              Plano {plan.name} - {subscription.billingInterval === 'monthly' ? 'Mensal' : 'Anual'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {plan.name}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Cálculos Diários */}
        <UsageItem
          icon={<Calculator className="h-4 w-4" />}
          label="Cálculos Diários"
          used={limits.dailyCalculations.used}
          limit={limits.dailyCalculations.limit}
          resetsAt={limits.dailyCalculations.resetsAt}
          color="blue"
        />

        {/* Consultas IA */}
        {limits.monthlyAiQueries.limit !== 0 && (
          <UsageItem
            icon={<Zap className="h-4 w-4" />}
            label="Consultas IA/mês"
            used={limits.monthlyAiQueries.used}
            limit={limits.monthlyAiQueries.limit}
            resetsAt={limits.monthlyAiQueries.resetsAt}
            color="purple"
          />
        )}

        {/* Requisições API */}
        {limits.monthlyApiRequests.limit !== 0 && (
          <UsageItem
            icon={<Link2 className="h-4 w-4" />}
            label="Requisições API/mês"
            used={limits.monthlyApiRequests.used}
            limit={limits.monthlyApiRequests.limit}
            resetsAt={limits.monthlyApiRequests.resetsAt}
            color="green"
          />
        )}

        {/* Aviso se próximo ao limite */}
        {(
          (limits.dailyCalculations.limit !== 'unlimited' && 
           limits.dailyCalculations.remaining !== 'unlimited' &&
           limits.dailyCalculations.remaining <= 5) ||
          (limits.monthlyAiQueries.limit !== 'unlimited' && 
           limits.monthlyAiQueries.remaining !== 'unlimited' &&
           limits.monthlyAiQueries.remaining <= 10) ||
          (limits.monthlyApiRequests.limit !== 'unlimited' && 
           limits.monthlyApiRequests.remaining !== 'unlimited' &&
           limits.monthlyApiRequests.remaining <= 100)
        ) && (
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Você está próximo do limite do seu plano
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Considere fazer upgrade para continuar usando todos os recursos sem interrupções.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
