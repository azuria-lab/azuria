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
        'relative flex flex-col transition-all duration-200',
        'bg-white border rounded-lg',
        'hover:shadow-lg hover:border-primary/30',
        plan.recommended && 'border-primary shadow-lg ring-1 ring-primary/20',
        !plan.recommended && 'border-gray-200',
        isCurrentPlan && 'border-green-500 ring-1 ring-green-500/20'
      )}
    >
      {/* Subtle accent for recommended plan */}
      {plan.recommended && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
      )}
      
      {plan.tagline && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge 
            className={cn(
              "text-xs font-semibold px-4 py-1.5 shadow-sm",
              plan.recommended && "bg-primary text-primary-foreground",
              !plan.recommended && "bg-muted text-muted-foreground"
            )}
          >
            {plan.tagline}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getIcon()}
          <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-600">
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
                <span className="text-4xl font-bold text-slate-900">
                  {formatPrice(price)}
                </span>
                <span className="text-slate-500">
                  /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
              
              {billingInterval === 'annual' && plan.pricing.annualDiscount > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">
                    {formatPrice(monthlyEquivalent)}/mês
                  </p>
                  <Badge className="text-xs bg-green-50 text-success border border-green-200">
                    Economize {plan.pricing.annualDiscount}%
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {plan.pricing.trialDays && !isCurrentPlan && (
            <p className="text-xs text-slate-500 mt-2">
              {plan.pricing.trialDays} dias de teste grátis
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2.5">
          {highlights.map((feature, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <Check className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                plan.recommended && "text-primary",
                !plan.recommended && "text-slate-700"
              )} />
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className={cn(
            "w-full font-semibold transition-all duration-200",
            plan.recommended && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg",
            !plan.recommended && plan.id !== 'free' && "bg-slate-900 text-white hover:bg-slate-800",
            plan.id === 'free' && "border-2 border-slate-900 text-slate-900 hover:bg-slate-50"
          )}
          variant={plan.id === 'free' ? 'outline' : 'default'}
          size="lg"
        >
          {isCurrentPlan ? 'Plano Atual' : isLoading ? 'Carregando...' : plan.id === 'free' ? 'Começar grátis' : 'Começar agora'}
        </Button>
      </CardFooter>
    </Card>
  );
};
