import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Workflow, Zap } from "lucide-react";
import MarketplaceLogos from "@/components/marketplace/MarketplaceLogos";

export default function MarketplaceIntegrations() {
  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Sincronização Automática",
      description: "Preços atualizados em tempo real em todos os canais"
    },
    {
      icon: <Workflow className="h-5 w-5" />,
      title: "Gestão Centralizada", 
      description: "Controle todos os marketplaces de um só lugar"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Conformidade Garantida",
      description: "Margem de lucro adequada para cada plataforma"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Integre com os Principais 
            <span className="text-brand-600"> Marketplaces</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie preços de forma inteligente across múltiplas plataformas
            com sincronização automática e controle centralizado.
          </p>
        </motion.div>

        {/* Logos dos Marketplaces */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <MarketplaceLogos 
            variant="horizontal" 
            showDescription={true}
            className="justify-center"
          />
        </motion.div>

        {/* Benefícios */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 rounded-lg mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-4">
            🚀 Mais integrações chegando em breve
          </div>
          <p className="text-muted-foreground">
            Trabalhamos constantemente para adicionar novos marketplaces e facilitar sua gestão
          </p>
        </motion.div>
      </div>
    </section>
  );
}