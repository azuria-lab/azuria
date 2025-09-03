
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { LazyComponentLoader } from "@/components/performance/LazyComponentLoader";
import { Thermometer } from "lucide-react";

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

export default function SensitivityAnalysisPage() {
  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Thermometer className="h-8 w-8 text-brand-600" />
              Análise de Sensibilidade
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Entenda como diferentes variáveis impactam sua precificação e 
              identifique os fatores mais críticos para suas margens de lucro.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <LazyComponentLoader importFunc={() => import("@/components/analysis/SensitivityAnalysis")} />
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
