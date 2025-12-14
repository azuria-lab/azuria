
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Clock, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const benefits = [
  {
    icon: TrendingUp,
    title: "Aumento real de lucro",
    description: "Nossa IA calcula o preço ideal considerando todos os fatores para maximizar sua margem de lucro.",
    badge: "+47%",
    badgeColor: "bg-[#0BA360] text-white",
    features: [
      "Análise de margem otimizada",
      "Cálculo automático de impostos",
      "Recomendações baseadas em dados"
    ]
  },
  {
    icon: Clock,
    title: "Economia de tempo",
    description: "Automatize cálculos complexos que levariam horas e receba resultados precisos em segundos.",
    badge: "15h/sem",
    badgeColor: "bg-[#005BFF] text-white",
    features: [
      "Precificação em lote",
      "Automações inteligentes",
      "Integração com marketplaces"
    ]
  },
  {
    icon: Brain,
    title: "IA especializada para produtos brasileiros",
    description: "Treinada especificamente para o mercado brasileiro, considerando tributos, concorrência e tendências locais.",
    badge: "100%",
    badgeColor: "bg-[#00C2FF] text-[#0A1930]",
    features: [
      "Análise de concorrência nacional",
      "Tributos brasileiros atualizados",
      "Insights de mercado local"
    ]
  },
  {
    icon: Shield,
    title: "Cálculos confiáveis com 100% dos impostos",
    description: "Todos os impostos brasileiros são calculados automaticamente: ICMS, PIS, COFINS, IPI e mais.",
    badge: "100%",
    badgeColor: "bg-[#0BA360] text-white",
    features: [
      "Todos os impostos incluídos",
      "Atualização automática de alíquotas",
      "Conformidade fiscal garantida"
    ]
  }
];

const BenefitsSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-white w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Recursos essenciais que melhoram a performance do seu negócio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automatize processos e ganhe tempo para focar no crescimento do negócio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-[#EAF6FF] rounded-xl">
                    <Icon className="h-8 w-8 text-[#005BFF]" />
                  </div>
                  <Badge className={`${benefit.badgeColor} text-lg font-bold px-4 py-2`}>
                    {benefit.badge}
                  </Badge>
                </div>

                <h3 className="text-2xl font-bold text-[#0A1930] mb-3">
                  {benefit.title}
                </h3>

                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {benefit.description}
                </p>

                <ul className="space-y-3">
                  {benefit.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#005BFF] mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSectionBling;

