
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Clock, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const benefits = [
  {
    icon: TrendingUp,
    title: "Maximização de Lucratividade",
    description: "Algoritmos de inteligência artificial calculam o preço ideal considerando múltiplos fatores para otimizar sua margem de lucro de forma estratégica.",
    badge: "+47%",
    badgeColor: "bg-[#0BA360] text-white",
    features: [
      "Otimização automática de margens",
      "Cálculo preciso de impostos e taxas",
      "Recomendações fundamentadas em dados de mercado"
    ]
  },
  {
    icon: Clock,
    title: "Eficiência Operacional",
    description: "Automatize processos de precificação que demandariam horas de trabalho manual e receba resultados precisos em segundos.",
    badge: "15h/sem",
    badgeColor: "bg-[#005BFF] text-white",
    features: [
      "Precificação em massa de produtos",
      "Automações configuráveis",
      "Integração nativa com principais marketplaces"
    ]
  },
  {
    icon: Brain,
    title: "Inteligência Artificial Especializada",
    description: "Sistema de IA desenvolvido especificamente para o mercado brasileiro, considerando legislação tributária, concorrência e dinâmicas locais.",
    badge: "100%",
    badgeColor: "bg-[#00C2FF] text-[#0A1930]",
    features: [
      "Análise competitiva do mercado nacional",
      "Base tributária brasileira atualizada",
      "Insights estratégicos baseados em dados locais"
    ]
  },
  {
    icon: Shield,
    title: "Conformidade Fiscal Completa",
    description: "Cálculo automático e preciso de todos os impostos brasileiros aplicáveis: ICMS, PIS, COFINS, IPI, ISS e demais tributos.",
    badge: "100%",
    badgeColor: "bg-[#0BA360] text-white",
    features: [
      "Cobertura completa de impostos federais e estaduais",
      "Atualização automática de alíquotas e legislação",
      "Garantia de conformidade com a legislação vigente"
    ]
  }
];

const BenefitsSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-background w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Recursos Estratégicos para Otimização de Performance
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Automatize processos operacionais e concentre seus esforços no crescimento estratégico do negócio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.1 }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className={`${benefit.badgeColor} text-base font-semibold px-3 py-1.5`}>
                    {benefit.badge}
                  </Badge>
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>

                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {benefit.description}
                </p>

                <ul className="space-y-3">
                  {benefit.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
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

