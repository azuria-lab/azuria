
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Brain, TrendingUp, Upload } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Conecte seus produtos ou informe os dados",
    description: "Importe seus produtos de marketplaces ou cadastre manualmente. Nossa plataforma se integra com Mercado Livre, Shopee, Amazon e mais."
  },
  {
    number: "2",
    icon: Brain,
    title: "Nossa IA analisa custos, concorrentes e tributos",
    description: "A inteligência artificial do Azuria processa automaticamente todos os fatores: custos, impostos brasileiros, preços da concorrência e tendências de mercado."
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Receba o preço ideal com margem otimizada",
    description: "Obtenha o preço de venda recomendado que maximiza seus lucros, com relatórios detalhados e justificativas para cada cálculo."
  }
];

const HowItWorksSection: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-[#F8FBFF] w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Como funciona o Azuria
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Três passos simples para começar a vender com mais lucro
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines - Desktop Only */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-[#00C2FF] opacity-30" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
                    {/* Step Number */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#005BFF] text-white text-2xl font-bold mb-6 mx-auto">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-[#EAF6FF] rounded-xl">
                        <Icon className="h-10 w-10 text-[#005BFF]" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-[#0A1930] mb-4 text-center">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 text-center leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow - Desktop Only */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-24 -right-4 z-10">
                        <ArrowRight className="h-8 w-8 text-[#00C2FF]" />
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

