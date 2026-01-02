// Aqui ativamos o modo PRO true para todos os recursos, conforme solicitado para testes internos no componente RapidCalculator.

import RapidCalculator from "@/domains/calculator/components/RapidCalculator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthContext } from "@/domains/auth";
import { Helmet } from "react-helmet-async";

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

export default function RapidCalculatorPage() {
  // Usa o contexto de autenticação para obter o usuário real (necessário para salvar no Supabase)
  const { user } = useAuthContext();
  const userId = user?.id;
  // Mantemos PRO habilitado por enquanto para testes
  const isPro = true;

  return (
    <>
      <Helmet>
        <title>Calculadora Rápida | Azuria</title>
        <meta name="description" content="Calcule rapidamente preços de venda com simplicidade e precisão utilizando a Calculadora Rápida do Azuria." />
      </Helmet>
      <motion.div 
        className="flex flex-col min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <main className="flex-grow bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <motion.div 
                variants={itemVariants} 
                className="mb-8 sm:mb-12 md:mb-16"
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-2 sm:mb-3">
                    Calculadora Rápida
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light">
                    Calcule o preço de venda ideal considerando custos, impostos e margem de lucro desejada. 
                    Ferramenta profissional para precificação estratégica.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <RapidCalculator isPro={isPro} userId={userId} />
              </motion.div>
            
              <motion.div 
                variants={itemVariants}
                className="mt-8 sm:mt-12"
              >
              <div className="bg-card rounded-lg border border-border p-4 sm:p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
                      Precisa de análises mais detalhadas?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A Calculadora Avançada oferece análise completa de regimes tributários, 
                      comparação de marketplaces e simulação de cenários para otimização de precificação.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/calculadora-avancada" className="w-full sm:w-auto">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto h-12 min-h-[44px]"
                        >
                          Ver Calculadora Avançada
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/planos" className="w-full sm:w-auto">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full sm:w-auto h-12 min-h-[44px] bg-primary hover:bg-primary/90 transition-all"
                        >
                          Assinar PRO <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </div>
              </motion.div>
            </div>
          </div>
        </main>
      </motion.div>
    </>
  );
}
