
import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const proFeatures = [
  "Simulação de faixas de preços (mínimo, ideal e competitivo)",
  "Análise de margens por marketplace (Shopee, Mercado Livre, Amazon, etc)",
  "Inclusão de impostos e taxas personalizadas no cálculo",
  "Cálculo com frete grátis e exportação para PDF",
  "Simulador de descontos com análise de impacto",
  "Histórico completo com favoritos e filtros"
];

export default function ProFeaturesList() {
  return (
    <ul className="space-y-4 text-left mb-8">
      {proFeatures.map((feature, index) => (
        <motion.li 
          key={index} 
          className="flex items-start gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          <span className="rounded-full bg-green-100 p-1 mt-0.5">
            <Star className="h-4 w-4 text-green-600" />
          </span>
          <span>{feature}</span>
        </motion.li>
      ))}
    </ul>
  );
}
