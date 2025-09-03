
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import ProFeaturesList from "./ProFeaturesList";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ProUpgradeBanner() {
  return (
    <motion.div 
      variants={itemVariants} 
      className="text-center mb-12"
    >
      <div className="inline-block p-3 bg-orange-50 rounded-full mb-4 shadow-md">
        <Lock className="h-8 w-8 text-brand-500" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Calculadora PRO</h1>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8">
        Acesse cálculos avançados para marketplaces, impostos, taxas e frete grátis 
        com o plano PRO.
      </p>
      
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6">Recursos disponíveis no plano PRO</h2>
        
        <ProFeaturesList />
        
        <Link to="/planos">
          <Button 
            size="lg" 
            className="w-full bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Assinar Plano PRO <ArrowUpRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        
        <p className="mt-4 text-sm text-gray-500">
          Por apenas R$ 9,90/mês ou R$ 79,00/ano. Cancele quando quiser.
        </p>
      </motion.div>
    </motion.div>
  );
}
