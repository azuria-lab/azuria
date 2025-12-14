
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PricingCard } from "@/components/subscription/PricingCard";
import { PLANS_ARRAY } from "@/config/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { useStripe } from "@/hooks/useStripe";
import { toast } from "@/components/ui/use-toast";

const PlansOverviewSection: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const { subscription } = useSubscription();
  const { createCheckoutSession, isLoading } = useStripe();

  const handleSelectPlan = async (planId: string) => {
    // Se for plano FREE, redireciona para cadastro
    if (planId === 'free') {
      window.location.href = '/cadastro';
      return;
    }

    // Se for Enterprise, redireciona para contato
    if (planId === 'enterprise') {
      toast({
        title: 'Plano Enterprise',
        description: 'Para o plano Enterprise, entre em contato conosco!',
      });
      window.open('mailto:contato@azuria.com.br?subject=Interesse no Plano Enterprise', '_blank');
      return;
    }

    // Mapear planId para formato do Stripe
    const stripePlanId = planId === 'essencial' ? 'essencial' : 'pro';
    const stripeBillingInterval = billingInterval === 'monthly' ? 'month' : 'year';

    // Criar sessão de checkout no Stripe
    await createCheckoutSession({
      planId: stripePlanId as 'essencial' | 'pro',
      billingInterval: stripeBillingInterval as 'month' | 'year'
    });
  };

  return (
    <section className="py-20 md:py-32 bg-background w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Planos e Preços
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Selecione o plano que melhor se adequa às necessidades do seu negócio e inicie sua jornada de precificação inteligente
          </p>
        </motion.div>

        {/* Toggle Mensal/Anual */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <Label htmlFor="billing-toggle" className={billingInterval === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            Mensal
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingInterval === 'annual'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
          />
          <Label htmlFor="billing-toggle" className={billingInterval === 'annual' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
            Anual
            <span className="ml-2 text-xs text-green-600 font-medium">(Economize 17%)</span>
          </Label>
        </motion.div>

        {/* Grid de Planos */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PLANS_ARRAY.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.1 }}
              >
                <PricingCard
                  plan={plan}
                  billingInterval={billingInterval}
                  currentPlanId={subscription?.planId}
                  onSelect={() => handleSelectPlan(plan.id)}
                  isLoading={isLoading}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Texto de apoio */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-lg mb-4">
            Não tem certeza? Inicie com o plano gratuito e faça upgrade conforme suas necessidades evoluem.
          </p>
          <Link to="/cadastro">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 text-base font-medium border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30 rounded-lg transition-all duration-200"
              >
                Iniciar teste gratuito
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansOverviewSection;
