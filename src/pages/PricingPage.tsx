import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { ArrowRight, Check, Globe, HelpCircle, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PricingCard } from '@/components/subscription/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS_ARRAY } from '@/config/plans';
import { useAbacatePay } from '@/hooks/useAbacatePay';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const { createBilling, isLoading } = useAbacatePay();
  const reduceMotion = useReducedMotion();

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

    // Criar cobrança no Abacatepay
    await createBilling({
      planId: planId as 'essencial' | 'pro',
      billingInterval: billingInterval,
      methods: ['PIX', 'CARD']
    });
  };

  return (
    <>
      <SEOHead 
        title="Planos e Preços | Azuria - Calculadora Inteligente"
        description="Escolha o plano ideal para seu negócio. De gratuito a Enterprise, temos a solução perfeita para calcular seus custos e maximizar lucros."
        url={globalThis.window === undefined ? 'https://azuria.app/pricing' : `${globalThis.window.location.origin}/pricing`}
        type="website"
      />
      
      <motion.div 
        className="flex flex-col min-h-screen bg-background"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        exit={reduceMotion ? undefined : "exit"}
      >
        <Header />
      
        <main className="flex-grow py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <motion.div 
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6"
            >
              <motion.h1 
                initial={reduceMotion ? undefined : { opacity: 0, y: -20 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.8, ease: "easeOut" }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground px-2"
              >
                O plano ideal para o seu negócio, tem no Azuria!
              </motion.h1>
              <motion.p 
                initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light px-2"
              >
                Comece grátis e sem inserir dados de pagamento. Experimente todas as funcionalidades sem compromisso.
              </motion.p>

              {/* Banner de Recursos Ilimitados */}
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg"
              >
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Recursos ilimitados em todos os planos</span>
              </motion.div>

              {/* Toggle Mensal/Anual */}
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center gap-4"
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
            </motion.div>

            {/* Grid de Planos */}
            <motion.div 
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16"
            >
              {PLANS_ARRAY.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.5 + index * 0.1 }}
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
            </motion.div>

            {/* Tabela de Comparação */}
            <motion.div 
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 text-foreground tracking-tight px-2">
                Compare todos os planos
              </h2>
              
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left py-4 px-4 sm:px-6 text-sm sm:text-base text-foreground font-semibold">Funcionalidade</th>
                            {PLANS_ARRAY.map((plan) => (
                              <th 
                                key={plan.id} 
                                className={cn(
                                  "text-center py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold whitespace-nowrap",
                                  plan.recommended && "bg-primary/5 text-foreground",
                                  !plan.recommended && "text-foreground"
                                )}
                              >
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Seção Por que escolher o Azuria? */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="mb-16"
            >
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                    Por que escolher o Azuria?
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
                    Azuria é uma plataforma tecnológica robusta com recursos essenciais, acessível, confiável, completa e descomplicada.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Suporte melhor avaliado por 95% dos clientes</h3>
                        <p className="text-sm text-muted-foreground">Nossa equipe está sempre pronta para ajudar você a alcançar seus objetivos.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Sistema 100% online, acesse de qualquer lugar</h3>
                        <p className="text-sm text-muted-foreground">Gerencie sua precificação de qualquer dispositivo, a qualquer momento.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Sem custo de ativação e é só se inscrever e começar</h3>
                        <p className="text-sm text-muted-foreground">Comece a usar imediatamente, sem complicações ou taxas escondidas.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative rounded-lg overflow-hidden border border-border bg-card/50">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                      <div className="text-center space-y-4 p-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                          <Zap className="h-12 w-12 text-primary" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">Precificação Inteligente</p>
                        <p className="text-sm text-muted-foreground">Para vender com mais lucro e menos esforço</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            </motion.div>

            {/* FAQ */}
            <motion.div 
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 text-foreground tracking-tight px-2">
                Perguntas Frequentes
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Posso trocar de plano a qualquer momento?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                    No caso de upgrade, a cobrança é proporcional. No downgrade, o novo plano 
                    entra em vigor no próximo ciclo de cobrança.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Como funciona o período de teste?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Os planos pagos oferecem período de teste grátis de 7 dias 
                    do plano). Durante o teste, você tem acesso completo a todas as 
                    funcionalidades. Cancele a qualquer momento sem cobranças.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Quais formas de pagamento são aceitas?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Aceitamos pagamentos via PIX e Cartão de Crédito através do Abacatepay. 
                    Para o plano Enterprise, também oferecemos faturamento empresarial.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Posso cancelar minha assinatura?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sim, você pode cancelar sua assinatura a qualquer momento. Seu acesso 
                    continuará até o final do período já pago. Não há multas ou taxas de 
                    cancelamento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">O que acontece se eu atingir o limite do plano?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Se você atingir os limites do seu plano (cálculos diários, consultas IA, 
                    etc.), receberá uma notificação sugerindo upgrade. Você pode continuar 
                    usando funcionalidades básicas ou fazer upgrade imediatamente para 
                    desbloquear mais recursos.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border-border">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Como funciona o plano Enterprise?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    O plano Enterprise é totalmente customizável e inclui recursos exclusivos 
                    como colaboração em equipe ilimitada, white label, API ilimitada, 
                    account manager dedicado e SLA garantido. Entre em contato conosco para 
                    uma proposta personalizada.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* CTA Final */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="text-center space-y-6 py-12"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground px-2">
                Ainda tem dúvidas?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light px-2">
                Nossa equipe está pronta para ajudar você a escolher o plano ideal
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 min-h-[44px] px-6 sm:px-8 text-base font-medium border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30 transition-all duration-200"
                  asChild
                >
                  <a href="mailto:contato@azuria.com.br">
                    Falar com Especialista
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>
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

function ComparisonRow({ feature, values }: Readonly<ComparisonRowProps>) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium text-foreground">{feature}</td>
      {values.map((value, index) => {
        const plan = PLANS_ARRAY[index];
        const renderValue = () => {
          if (typeof value === 'boolean') {
            return value 
              ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-auto" />
              : <span className="text-muted-foreground">—</span>;
          }
          return <span className="text-xs sm:text-sm text-muted-foreground font-medium">{value}</span>;
        };
        
        return (
          <td 
            key={`${feature}-col-${index}`} 
            className={cn(
              "text-center py-3 sm:py-4 px-3 sm:px-6",
              plan?.recommended && "bg-primary/5"
            )}
          >
            {renderValue()}
          </td>
        );
      })}
    </tr>
  );
}
