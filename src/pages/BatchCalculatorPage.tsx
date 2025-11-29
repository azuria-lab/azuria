
import { motion } from "framer-motion";
import BatchCalculator from "@/components/calculators/BatchCalculator";
import { Package2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function BatchCalculatorPage() {
  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Package2 className="h-8 w-8 text-brand-600" />
              Calculadora de Lotes
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Calcule preços e margens para diferentes quantidades de produtos, 
              simule descontos por volume e otimize sua precificação.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <BatchCalculator isPro={true} />
          </motion.div>
        </div>
      </main>
      
    </motion.div>
  );
}
