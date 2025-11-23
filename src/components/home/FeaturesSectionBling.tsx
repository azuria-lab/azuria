
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Layers,
  PieChart,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "IA de Precificação Avançada",
    description: "Algoritmos de machine learning treinados especificamente para o mercado brasileiro, analisando múltiplos fatores simultaneamente."
  },
  {
    icon: ShoppingCart,
    title: "Marketplace integrado",
    description: "Conecte-se automaticamente com Mercado Livre, Shopee, Amazon, Magalu e outros marketplaces para sincronizar produtos e preços."
  },
  {
    icon: BarChart3,
    title: "Simulador de cenários",
    description: "Teste diferentes estratégias de precificação e veja o impacto nos seus lucros antes de aplicar mudanças."
  },
  {
    icon: Layers,
    title: "Precificação em lote",
    description: "Atualize preços de centenas ou milhares de produtos de uma só vez, economizando horas de trabalho manual."
  },
  {
    icon: FileText,
    title: "Análise tributária",
    description: "Cálculo automático e preciso de todos os impostos brasileiros: ICMS, PIS, COFINS, IPI, ISS e mais."
  },
  {
    icon: TrendingUp,
    title: "Comparativos de concorrência",
    description: "Monitore preços da concorrência em tempo real e ajuste sua estratégia para manter competitividade."
  },
  {
    icon: PieChart,
    title: "Relatórios e Analytics",
    description: "Dashboards completos com métricas de lucro, margem, volume de vendas e tendências de mercado."
  },
  {
    icon: Zap,
    title: "Automações inteligentes",
    description: "Configure regras automáticas para ajustar preços baseado em estoque, sazonalidade e comportamento de mercado."
  }
];

const FeaturesSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="recursos" className="py-20 md:py-32 bg-white w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Recursos para manter as finanças sob controle: tem no Azuria!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tudo que você precisa para precificar com inteligência e aumentar seus lucros
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#005BFF] hover:shadow-lg transition-all"
              >
                <div className="p-3 bg-[#EAF6FF] rounded-lg w-fit mb-4">
                  <Icon className="h-6 w-6 text-[#005BFF]" />
                </div>

                <h3 className="text-lg font-bold text-[#0A1930] mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSectionBling;

