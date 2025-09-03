
import React from "react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ProCalculatorHeader() {
  return (
    <motion.div 
      variants={itemVariants}
      className="flex justify-between items-center mb-8"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">Calculadora Azuria PRO</h1>
          <span className="bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow">PRO</span>
        </div>
        <p className="text-gray-600">
          Calcule o preço ideal de venda considerando marketplace, impostos e frete grátis.
        </p>
      </div>
    </motion.div>
  );
}
