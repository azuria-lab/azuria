
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Crown, Star, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

type PlanType = "free" | "pro" | "enterprise";

/**
 * Retorna a classe de cor do texto baseado no tipo de plano
 */
function getPlanTextColor(plan: PlanType): string {
  if (plan === "pro") {return "text-brand-600";}
  if (plan === "enterprise") {return "text-purple-600";}
  return "text-gray-900 dark:text-white";
}

/**
 * Retorna a classe de cor do ícone de check baseado no tipo de plano  
 */
function getCheckIconColor(plan: PlanType): string {
  if (plan === "enterprise") {return "text-purple-600";}
  if (plan === "pro") {return "text-brand-600";}
  return "text-green-500";
}

/**
 * Retorna a classe do botão baseado no tipo de plano
 */
function getButtonClassName(plan: PlanType): string {
  if (plan === "pro") {
    return "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]";
  }
  if (plan === "enterprise") {
    return "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]";
  }
  return "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
}

interface PlanCardProps {
  plan: "free" | "pro" | "enterprise";
  billingCycle: "monthly" | "yearly";
  isLoading: boolean;
  onSubscribe: (plan: "monthly" | "yearly" | "enterprise") => void;
}

export default function PlanCard({ plan, billingCycle, isLoading, onSubscribe }: Readonly<PlanCardProps>) {
  const planData = {
    free: {
      title: "FREE",
      description: "Ideal para começar",
      price: "Grátis",
      period: "para sempre",
      icon: Zap,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-800",
      features: [
        "Calculadora rápida de preços",
        "Até 10 cálculos por dia", 
        "Impostos e taxas básicas",
        "Suporte por email"
      ],
      buttonText: "Plano Atual",
      buttonVariant: "outline" as const,
      buttonAction: () => {},
      cardClass: "border-gray-200 h-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800",
      badge: null
    },
    pro: {
      title: "PRO",
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
      buttonText: isLoading ? "Processando..." : "Assinar Agora",
      buttonVariant: "default" as const,
      buttonAction: () => onSubscribe(billingCycle),
      cardClass: "border-brand-400 bg-gradient-to-b from-white to-brand-50/30 relative overflow-visible h-full shadow-xl ring-2 ring-brand-500 transform hover:scale-[1.02] transition-all duration-300",
      badge: { 
        icon: Star, 
        text: "Mais Popular", 
        class: "bg-blue-600 shadow-xl border-2 border-white backdrop-blur-sm" 
      }
    },
    enterprise: {
      title: "PREMIUM",
      description: "Para equipes e empresas",
      price: "R$ 99,90",
      period: "/mês",
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
      buttonText: "Assinar Agora",
      buttonVariant: "default" as const,
      buttonAction: () => onSubscribe("enterprise"),
      cardClass: "border-purple-400 bg-gradient-to-b from-white to-purple-50/30 relative overflow-visible h-full shadow-xl hover:scale-[1.02] transition-all duration-300",
      badge: { 
        icon: Crown, 
        text: "Premium", 
        class: "bg-purple-600 shadow-xl border-2 border-white backdrop-blur-sm" 
      }
    }
  };

  const currentPlan = planData[plan];
  const IconComponent = currentPlan.icon;

  return (
    <motion.div variants={itemVariants}>
      <Card className={currentPlan.cardClass}>
        {currentPlan.badge && (
          <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 ${currentPlan.badge.class} text-white py-2 px-4 text-sm font-bold flex items-center gap-1.5 rounded-full`}>
            <currentPlan.badge.icon className="h-4 w-4" />
            <span className="font-semibold text-white">{currentPlan.badge.text}</span>
          </div>
        )}
        
        <CardHeader className="text-center pb-4 pt-6">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${currentPlan.color} flex items-center justify-center shadow-lg`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentPlan.title}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {currentPlan.description}
          </CardDescription>
          <div className="mt-4">
            {plan === "pro" && billingCycle === "yearly" ? (
              <motion.div
                key="yearly"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-4xl font-bold text-brand-600">
                  {currentPlan.price}
                </span>
                <span className="text-gray-500 ml-2">{currentPlan.period}</span>
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Economize 17% no anual!
                </div>
                <div className="mt-1 text-xs text-gray-500">
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
                <span className={`text-4xl font-bold ${getPlanTextColor(plan)}`}>
                  {currentPlan.price}
                </span>
                <span className="text-gray-500 ml-2">{currentPlan.period}</span>
                {plan === "enterprise" && (
                  <div className="mt-1 text-sm text-purple-600 font-medium">
                    Faturamento anual disponível
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <motion.ul 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentPlan.features.map((feature) => (
              <motion.li 
                key={feature} 
                className="flex items-start gap-3"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.3 + (currentPlan.features.indexOf(feature) * 0.1) }
                  }
                }}
              >
                <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getCheckIconColor(plan)}`} />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant={currentPlan.buttonVariant}
            className={`w-full group ${getButtonClassName(plan)}`}
            onClick={currentPlan.buttonAction}
            disabled={isLoading && plan === "pro"}
          >
            {currentPlan.buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
