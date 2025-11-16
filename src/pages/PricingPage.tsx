import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { Check, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PricingCard } from '@/components/subscription/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS_ARRAY } from '@/config/plans';
import { useStripe } from '@/hooks/useStripe';
import { toast } from '@/components/ui/use-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const { subscription } = useSubscription();
  const { createCheckoutSession, isLoading } = useStripe();

  const handleSelectPlan = async (planId: string) => {
    // Se for plano FREE, não precisa de pagamento
    if (planId === 'free') {
      toast({
        title: 'Plano Gratuito',
        description: 'Você já está no plano gratuito!',
      });
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
    <>
      <SEOHead 
        title="Planos e Preços | Azuria - Calculadora Inteligente"
        description="Escolha o plano ideal para seu negócio. De gratuito a Enterprise, temos a solução perfeita para calcular seus custos e maximizar lucros."
        url={typeof window !== 'undefined' ? `${window.location.origin}/pricing` : 'https://azuria.app/pricing'}
        type="website"
      />
      
      <motion.div 
        className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Header />
      
        <main className="flex-grow py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Planos e Preços
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Escolha o plano ideal para seu negócio e comece a calcular com inteligência
              </p>

              {/* Toggle Mensal/Anual */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Label htmlFor="billing-toggle" className={billingInterval === 'monthly' ? 'font-semibold' : ''}>
                  Mensal
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={billingInterval === 'annual'}
                  onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
                />
                <Label htmlFor="billing-toggle" className={billingInterval === 'annual' ? 'font-semibold' : ''}>
                  Anual
                  <span className="ml-2 text-xs text-primary">(Economize 17%)</span>
                </Label>
              </div>
            </div>

            {/* Grid de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {PLANS_ARRAY.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  billingInterval={billingInterval}
                  currentPlanId={subscription?.planId}
                  onSelect={() => handleSelectPlan(plan.id)}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Tabela de Comparação */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">
                Compare todos os planos
              </h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 px-4">Funcionalidade</th>
                          {PLANS_ARRAY.map((plan) => (
                            <th key={plan.id} className="text-center py-4 px-4 font-semibold">
                              {plan.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <ComparisonRow feature="Cálculos por dia" values={['10', 'Ilimitado', 'Ilimitado', 'Ilimitado']} />
                        <ComparisonRow feature="Calculadora avançada" values={[false, true, true, true]} />
                        <ComparisonRow feature="Salvar histórico" values={[false, true, true, true]} />
                        <ComparisonRow feature="Consultas IA/mês" values={['-', '50', 'Ilimitado', 'Ilimitado']} />
                        <ComparisonRow feature="Modelo de IA" values={['-', 'GPT-3.5', 'GPT-4', 'GPT-4']} />
                        <ComparisonRow feature="Analytics avançado" values={[false, false, true, true]} />
                        <ComparisonRow feature="Integração marketplaces" values={[false, false, true, true]} />
                        <ComparisonRow feature="Lojas conectadas" values={['-', '1', '3', 'Ilimitado']} />
                        <ComparisonRow feature="API" values={[false, false, '1000/mês', 'Ilimitado']} />
                        <ComparisonRow feature="Colaboração em equipe" values={[false, false, false, true]} />
                        <ComparisonRow feature="White label" values={[false, false, false, true]} />
                        <ComparisonRow feature="Suporte" values={['-', 'Email (48h)', 'Prioritário (24h)', '24/7 + Account Manager']} />
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Perguntas Frequentes
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Posso trocar de plano a qualquer momento?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                    No caso de upgrade, a cobrança é proporcional. No downgrade, o novo plano 
                    entra em vigor no próximo ciclo de cobrança.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Como funciona o período de teste?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    Os planos pagos oferecem período de teste grátis (7 a 30 dias dependendo 
                    do plano). Durante o teste, você tem acesso completo a todas as 
                    funcionalidades. Cancele a qualquer momento sem cobranças.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Quais formas de pagamento são aceitas?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    Aceitamos pagamentos via Mercado Pago, incluindo cartão de crédito, 
                    débito, PIX e boleto bancário. Para o plano Enterprise, também 
                    oferecemos faturamento empresarial.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Posso cancelar minha assinatura?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso 
                    continuará até o final do período já pago. Não há multas ou taxas de 
                    cancelamento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      O que acontece se eu atingir o limite do plano?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    Se você atingir os limites do seu plano (cálculos diários, consultas IA, 
                    etc.), receberá uma notificação sugerindo upgrade. Você pode continuar 
                    usando funcionalidades básicas ou fazer upgrade imediatamente para 
                    desbloquear mais recursos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Como funciona o plano Enterprise?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    O plano Enterprise é totalmente customizável e inclui recursos exclusivos 
                    como colaboração em equipe ilimitada, white label, API ilimitada, 
                    account manager dedicado e SLA garantido. Entre em contato conosco para 
                    uma proposta personalizada.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* CTA Final */}
            <div className="mt-16 text-center space-y-4">
              <h2 className="text-2xl font-bold">
                Ainda tem dúvidas?
              </h2>
              <p className="text-muted-foreground">
                Nossa equipe está pronta para ajudar você a escolher o plano ideal
              </p>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:contato@azuria.com.br">
                  Falar com Especialista
                </a>
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </motion.div>
    </>
  );
}

// Componente auxiliar para linhas da tabela de comparação
interface ComparisonRowProps {
  feature: string;
  values: (boolean | string | number)[];
}

function ComparisonRow({ feature, values }: ComparisonRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-4 px-4 font-medium">{feature}</td>
      {values.map((value, index) => (
        <td key={index} className="text-center py-4 px-4">
          {typeof value === 'boolean' ? (
            value ? (
              <Check className="h-5 w-5 text-primary mx-auto" />
            ) : (
              <span className="text-muted-foreground">-</span>
            )
          ) : (
            <span className="text-sm">{value}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
