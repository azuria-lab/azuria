// Aqui ativamos o modo PRO true para todos os recursos, conforme solicitado para testes internos no componente SimpleCalculator.

import SimpleCalculator from "@/domains/calculator/components/SimpleCalculator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { AppIcon } from "@/components/ui/app-icon";
import { useAuthContext } from "@/domains/auth";

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

export default function SimpleCalculatorPage() {
  // Usa o contexto de autenticação para obter o usuário real (necessário para salvar no Supabase)
  const { user } = useAuthContext();
  const userId = user?.id;
  // Mantemos PRO habilitado por enquanto para testes
  const isPro = true;

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      
      <main className="flex-grow py-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <AppIcon size={80} withShadow />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              Calculadora de Preço Básica
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Calcule rapidamente o preço ideal de venda com base no custo do produto 
              e na margem de lucro desejada. Interface profissional e cálculos precisos.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <SimpleCalculator isPro={isPro} userId={userId} />
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mt-12 bg-brand-50 border border-brand-100 rounded-lg p-6 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-brand-800">Precisa de cálculos mais detalhados?</h3>
                <p className="text-gray-600">
                  Experimente a Calculadora Avançada com regimes tributários completos (Simples Nacional, Lucro Presumido, Lucro Real),
                  taxas de marketplace e análise de custos de e-commerce.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link to="/calculadora-avancada">
                  <Button 
                    variant="outline" 
                    className="border-brand-600 text-brand-600 hover:bg-brand-50 transition-all hover:shadow"
                  >
                    Ver Calculadora Avançada
                  </Button>
                </Link>
                <Link to="/planos">
                  <Button 
                    className="bg-brand-600 hover:bg-brand-700 shadow hover:shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    Assinar PRO <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
    </motion.div>
  );
}
