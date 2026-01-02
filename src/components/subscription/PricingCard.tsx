/**
 * Card de plano de assinatura
 */

import { Award, Building2, Check, CheckCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Plan } from '@/types/subscription';
import { formatPrice, PLAN_HIGHLIGHTS } from '@/config/plans';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PricingCardProps {
  plan: Plan;
  billingInterval: 'monthly' | 'annual';
  currentPlanId?: string;
  onSelect: () => void;
  isLoading?: boolean;
}

/**
 * Retorna o texto do botão baseado no estado atual
 */
function getButtonText(isCurrentPlan: boolean, isLoading: boolean, planId: string): string {
  if (isCurrentPlan) {return 'Plano Atual';}
  if (isLoading) {return 'Carregando...';}
  if (planId === 'free') {return 'Começar grátis';}
  return 'Começar agora';
}

/**
 * Retorna o ícone do plano baseado no ID
 */
function getPlanIcon(planId: string) {
  switch (planId) {
    case 'iniciante':
      return <Rocket className="h-5 w-5" />;
    case 'essencial':
      return <Award className="h-5 w-5" />;
    case 'pro':
      return <CheckCircle className="h-5 w-5" />;
    case 'enterprise':
      return <Building2 className="h-5 w-5" />;
    default:
      return null;
  }
}

export const PricingCard = ({
  plan,
  billingInterval,
  currentPlanId,
  onSelect,
  isLoading = false,
}: Readonly<PricingCardProps>) => {
  const isCurrentPlan = currentPlanId === plan.id;
  const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
  const monthlyEquivalent = billingInterval === 'annual' ? price / 12 : price;
  
  const highlights = PLAN_HIGHLIGHTS[plan.id];

  const icon = getPlanIcon(plan.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
    <Card
      className={cn(
          'relative flex flex-col transition-all duration-200 h-full',
          'border rounded-lg',
          'hover:shadow-lg',
          plan.recommended 
            ? 'bg-primary/10 border-primary shadow-lg ring-1 ring-primary/20' 
            : 'bg-card border-border',
        isCurrentPlan && 'border-green-500 ring-1 ring-green-500/20'
      )}
    >
      {plan.tagline && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
          <Badge 
            className={cn(
              "text-xs font-semibold px-3 py-1 shadow-sm",
              plan.recommended && "bg-primary text-primary-foreground",
              !plan.recommended && "bg-muted text-muted-foreground"
            )}
          >
            {plan.tagline}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {icon && <div className={cn(
            "p-1.5 rounded-lg",
            plan.recommended ? "bg-primary/10" : "bg-muted"
          )}>
          {icon}
          </div>}
          <CardTitle className={cn(
            "text-2xl font-semibold",
            plan.recommended ? "text-foreground" : "text-foreground"
          )}>
            {plan.name}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Preço */}
        <div className="text-center space-y-2">
          {plan.customPricing ? (
            <div>
              <p className="text-3xl font-semibold text-foreground">Sob consulta</p>
              <p className="text-sm text-muted-foreground">A partir de {formatPrice(price)}/mês</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-semibold text-foreground">
                  {formatPrice(price)}
                </span>
                <span className="text-muted-foreground">
                  /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
              
              {billingInterval === 'annual' && plan.pricing.annualDiscount > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(monthlyEquivalent)}/mês
                  </p>
                  <Badge className="text-xs bg-green-50 text-green-600 border border-green-200">
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
        <div className="space-y-3">
          {highlights.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <Check className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                plan.recommended ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
          className={cn(
            "w-full h-12 text-base font-medium transition-all duration-200",
            plan.recommended && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg",
            !plan.recommended && plan.id !== 'free' && "bg-foreground hover:bg-foreground/90 text-background",
            plan.id === 'free' && "border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30"
          )}
          variant={plan.id === 'free' ? 'outline' : 'default'}
          size="lg"
        >
          {getButtonText(isCurrentPlan, isLoading, plan.id)}
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
};
