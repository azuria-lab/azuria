
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check, Crown, Star, Zap } from "lucide-react";
// Removed unused PlanCard and BillingToggle imports

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const PlansOverviewSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "FREE",
      description: "Ideal para começar",
      price: "Grátis",
      period: "para sempre",
      icon: Zap,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-800",
      features: [
        "Calculadora básica de preços",
        "Até 10 cálculos por dia",
        "Impostos e taxas básicas",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      ctaLink: "/calculadora-simples",
      popular: false,
      cardClass: "border-gray-200 h-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800"
    },
    {
      name: "PRO",
      description: "Para lojistas sérios",
      price: billingCycle === "monthly" ? "R$ 29,90" : "R$ 299,00",
      period: billingCycle === "monthly" ? "/mês" : "/ano",
      icon: Crown,
      color: "from-brand-500 to-brand-600",
      bgColor: "bg-brand-50 dark:bg-brand-900",
      features: [
        "Calculadora avançada com IA",
        "Cálculos ilimitados",
        "Análise de concorrentes",
        "Templates de marketplace",
        "Simulador de cenários",
        "Histórico completo",
        "Exportação PDF, Excel e CSV",
        "Suporte prioritário"
      ],
      cta: "Começar Trial",
      ctaLink: "/planos",
      popular: true,
      cardClass: "border-brand-400 bg-gradient-to-b from-white to-brand-50/30 relative overflow-visible h-full shadow-xl ring-2 ring-brand-500 transform hover:scale-[1.02] transition-all duration-300"
    },
    {
      name: "PREMIUM",
      description: "Para equipes e empresas",
      price: billingCycle === "monthly" ? "R$ 99,90" : "R$ 999,00",
      period: billingCycle === "monthly" ? "/mês" : "/ano",
      yearlyNote: "Faturamento anual disponível",
      icon: Crown,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900",
      features: [
        "Tudo do PRO +",
        "Automação de preços",
        "API para integrações",
        "Analytics avançadas",
        "Equipes colaborativas",
        "Relatórios customizados",
        "Suporte dedicado 24/7"
      ],
      cta: "Assinar Agora",
      ctaLink: "/planos",
      popular: false,
      isPremium: true,
      cardClass: "border-purple-400 bg-gradient-to-b from-white to-purple-50/30 relative overflow-visible h-full shadow-xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" data-testid="plans-section">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Badge className="bg-brand-100 text-brand-800 border-brand-200 mb-4">
            Planos e Preços
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Escolha o plano ideal para seu negócio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comece grátis e evolua conforme sua necessidade. Todos os planos incluem 7 dias de trial gratuito.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8 flex justify-center"
        >
          <Tabs 
            defaultValue="monthly" 
            value={billingCycle} 
            onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
            className="w-full max-w-md"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">
                Anual
                <span className="ml-2 py-0.5 px-2 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  -17%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, _index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 shadow-xl border-2 border-white backdrop-blur-sm text-white py-2 px-4 text-sm font-bold flex items-center gap-1.5 rounded-full">
                    <Star className="h-4 w-4" />
                    <span className="font-semibold text-white">Mais Popular</span>
                  </div>
                )}
                
                {plan.isPremium && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-purple-600 shadow-xl border-2 border-white backdrop-blur-sm text-white py-2 px-4 text-sm font-bold flex items-center gap-1.5 rounded-full">
                    <Crown className="h-4 w-4" />
                    <span className="font-semibold text-white">Premium</span>
                  </div>
                )}
                
                <Card className={plan.cardClass}>
                  <CardHeader className="text-center pb-4 pt-6">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      {plan.name === "PRO" && billingCycle === "yearly" ? (
                        <motion.div
                          key="yearly"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-4xl font-bold text-brand-600">
                            {plan.price}
                          </span>
                          <span className="text-muted-foreground ml-2">{plan.period}</span>
                          <div className="mt-1 text-sm text-green-600 font-medium">
                            Economize 17% no anual!
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Equivale a R$ 24,92/mês vs R$ 29,90 mensal
                          </div>
                          <div className="mt-1 text-xs text-green-600">
                            Economia de R$ 59,80 por ano
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="monthly"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className={`text-4xl font-bold ${
                            plan.name === "PRO" ? "text-brand-600" : 
                            plan.name === "PREMIUM" ? "text-purple-600" : 
                              "text-foreground"
                          }`}>
                            {plan.price}
                          </span>
                          <span className="text-muted-foreground ml-2">{plan.period}</span>
                          {plan.yearlyNote && billingCycle === "monthly" && plan.name === "PREMIUM" && (
                            <div className="mt-1 text-xs text-purple-600">
                              {plan.yearlyNote}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            plan.name === "PREMIUM" ? "text-purple-600" : 
                            plan.name === "PRO" ? "text-brand-600" : 
                            "text-green-500"
                          }`} />
                          <span className="text-foreground dark:text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    {plan.name === "FREE" ? (
                      <Link to={plan.ctaLink} className="w-full">
                        <Button 
                          variant="outline"
                          className="w-full group bg-white dark:bg-gray-800 text-foreground border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to={plan.ctaLink} className="w-full">
                        <Button 
                          className={`w-full group ${
                            plan.name === "PRO" 
                              ? "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]" 
                              : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                          }`}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-4">
            Não tem certeza? Comece com o FREE e faça upgrade quando precisar.
          </p>
          <Link to="/calculadora-simples">
            <Button variant="outline" className="group">
              Experimentar Calculadora Grátis
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansOverviewSection;
