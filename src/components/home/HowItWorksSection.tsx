
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Brain, TrendingUp, Upload } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Integre seus produtos ou cadastre manualmente",
    description: "Importe produtos diretamente de marketplaces ou realize cadastro manual. Integração nativa com Mercado Livre, Shopee, Amazon, Magalu e demais plataformas."
  },
  {
    number: "2",
    icon: Brain,
    title: "Análise inteligente de múltiplos fatores",
    description: "Nossa inteligência artificial processa automaticamente custos, impostos brasileiros, preços competitivos e tendências de mercado para cálculo otimizado."
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Receba recomendações estratégicas de preço",
    description: "Obtenha preços de venda otimizados que maximizam sua lucratividade, acompanhados de relatórios detalhados e justificativas técnicas para cada cálculo."
  }
];

const HowItWorksSection: React.FC = () => {
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
            Como Funciona a Plataforma
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Processo simplificado em três etapas para otimização de precificação e maximização de resultados
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connection Lines - Desktop Only */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-primary/20" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.2 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="relative"
                >
                  <div className="bg-card rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-all h-full">
                    {/* Step Number */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-semibold mb-6 mx-auto">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 text-center">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground text-center leading-relaxed text-sm">
                      {step.description}
                    </p>

                    {/* Arrow - Desktop Only */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-24 -right-4 z-10">
                        <ArrowRight className="h-6 w-6 text-primary/40" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

