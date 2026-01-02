
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Package2,
  Scale,
  ShoppingBag,
  TrendingUp,
  Workflow
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Inteligência Artificial Avançada",
    description: "Algoritmos de machine learning especializados no mercado brasileiro, processando múltiplas variáveis simultaneamente para otimização de preços."
  },
  {
    icon: ShoppingBag,
    title: "Integração com Marketplaces",
    description: "Conexão automatizada com Mercado Livre, Shopee, Amazon, Magalu e demais plataformas para sincronização de produtos e preços."
  },
  {
    icon: BarChart3,
    title: "Simulação de Cenários",
    description: "Teste estratégias de precificação alternativas e analise o impacto financeiro antes de implementar alterações."
  },
  {
    icon: Package2,
    title: "Precificação em Massa",
    description: "Atualize preços de centenas ou milhares de produtos simultaneamente, reduzindo significativamente o tempo operacional."
  },
  {
    icon: Scale,
    title: "Análise Tributária Completa",
    description: "Cálculo automático e preciso de todos os impostos brasileiros aplicáveis: ICMS, PIS, COFINS, IPI, ISS e demais tributos."
  },
  {
    icon: TrendingUp,
    title: "Monitoramento Competitivo",
    description: "Acompanhe preços da concorrência em tempo real e ajuste sua estratégia para manter posicionamento competitivo."
  },
  {
    icon: BarChart3,
    title: "Analytics e Relatórios",
    description: "Dashboards executivos com métricas de lucratividade, margem de contribuição, volume de vendas e tendências de mercado."
  },
  {
    icon: Workflow,
    title: "Automação Inteligente",
    description: "Configure regras de negócio para ajuste automático de preços baseado em estoque, sazonalidade e comportamento de mercado."
  }
];

const FeaturesSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="recursos" className="py-20 md:py-32 bg-background w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Recursos Completos para Gestão Financeira Estratégica
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Solução completa para precificação inteligente e maximização de resultados financeiros
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
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="p-2.5 bg-primary/10 rounded-lg w-fit mb-4 border border-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
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

