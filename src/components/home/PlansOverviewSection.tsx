
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
    <section className="py-20 md:py-32 bg-white w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Planos e Preços
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para seu negócio e comece a calcular com inteligência
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
          <Label htmlFor="billing-toggle" className={billingInterval === 'monthly' ? 'font-semibold text-[#0A1930]' : 'text-gray-600'}>
            Mensal
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingInterval === 'annual'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
          />
          <Label htmlFor="billing-toggle" className={billingInterval === 'annual' ? 'font-semibold text-[#0A1930]' : 'text-gray-600'}>
            Anual
            <span className="ml-2 text-xs text-[#0BA360] font-medium">(Economize 17%)</span>
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
          <p className="text-gray-600 text-lg mb-4">
            Não tem certeza? Comece com o Free e faça upgrade quando precisar.
          </p>
          <Link to="/cadastro">
            <Button variant="outline" size="lg" className="border-[#005BFF] text-[#005BFF] hover:bg-[#EAF6FF]">
              Começar grátis agora
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansOverviewSection;
