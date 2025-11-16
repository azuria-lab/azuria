/**
 * Badge de status da assinatura
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PlanId, SubscriptionStatus } from '@/types/subscription';
import { PLANS } from '@/config/plans';

interface SubscriptionBadgeProps {
  planId?: PlanId;
  status?: SubscriptionStatus;
  className?: string;
  showName?: boolean;
}

export const SubscriptionBadge = ({
  planId = 'free',
  status = 'active',
  className,
  showName = true,
}: SubscriptionBadgeProps) => {
  const plan = PLANS[planId];

  const getVariant = () => {
    if (status !== 'active') {
      return 'destructive';
    }

    switch (planId) {
      case 'enterprise':
        return 'default';
      case 'pro':
        return 'default';
      case 'essencial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return showName ? plan.name : 'Ativo';
      case 'canceled':
        return 'Cancelado';
      case 'past_due':
        return 'Pagamento Pendente';
      case 'trialing':
        return 'Em Teste';
      case 'incomplete':
        return 'Incompleto';
      case 'incomplete_expired':
        return 'Expirado';
      default:
        return plan.name;
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn('text-xs', className)}
    >
      {getStatusText()}
    </Badge>
  );
};
