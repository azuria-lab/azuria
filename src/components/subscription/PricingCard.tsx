/**
 * Card de plano de assinatura
 */

import { Briefcase, Check, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Plan } from '@/types/subscription';
import { formatPrice, PLAN_HIGHLIGHTS } from '@/config/plans';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: Plan;
  billingInterval: 'monthly' | 'annual';
  currentPlanId?: string;
  onSelect: () => void;
  isLoading?: boolean;
}

export const PricingCard = ({
  plan,
  billingInterval,
  currentPlanId,
  onSelect,
  isLoading = false,
}: PricingCardProps) => {
  const isCurrentPlan = currentPlanId === plan.id;
  const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
  const monthlyEquivalent = billingInterval === 'annual' ? price / 12 : price;
  
  const highlights = PLAN_HIGHLIGHTS[plan.id];

  const getIcon = () => {
    switch (plan.id) {
      case 'essencial':
        return <Star className="h-5 w-5" />;
      case 'pro':
        return <Sparkles className="h-5 w-5" />;
      case 'enterprise':
        return <Briefcase className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all hover:shadow-lg',
        plan.recommended && 'border-primary shadow-md scale-105',
        isCurrentPlan && 'border-green-500'
      )}
    >
      {plan.tagline && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge variant={plan.recommended ? 'default' : 'secondary'} className="text-sm px-4 py-1">
            {plan.tagline}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getIcon()}
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-sm">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Preço */}
        <div className="text-center space-y-1">
          {plan.customPricing ? (
            <div>
              <p className="text-3xl font-bold">Sob consulta</p>
              <p className="text-sm text-muted-foreground">A partir de {formatPrice(price)}/mês</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{formatPrice(price)}</span>
                <span className="text-muted-foreground">
                  /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
              
              {billingInterval === 'annual' && plan.pricing.annualDiscount > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(monthlyEquivalent)}/mês
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Economize {plan.pricing.annualDiscount}%
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {plan.pricing.trialDays && !isCurrentPlan && (
            <p className="text-xs text-muted-foreground mt-2">
              {plan.pricing.trialDays} dias de teste grátis
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {highlights.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className="w-full"
          variant={plan.recommended ? 'default' : 'outline'}
          size="lg"
        >
          {isCurrentPlan ? 'Plano Atual' : isLoading ? 'Carregando...' : 'Selecionar Plano'}
        </Button>
      </CardFooter>
    </Card>
  );
};
