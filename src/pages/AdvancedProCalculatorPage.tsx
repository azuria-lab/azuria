
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedCalculator from "@/components/calculators/AdvancedCalculator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";
import type { User } from "@supabase/supabase-js";
import LoadingState from "@/components/calculators/LoadingState";
import ProUpgradeBanner from "@/components/calculators/ProUpgradeBanner";

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

export default function AdvancedProCalculatorPage() {
  const navigate = useNavigate();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);
        
        // ⚠️ MODO TESTE: Liberado acesso total para desenvolvimento
        // TODO: Restaurar verificação real antes do deploy
        setIsPro(true);
        
        setIsLoading(false);
      } catch (error) {
        logger.error("Erro ao verificar sessão:", error);
        setIsLoading(false);
        navigate("/login");
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingState />
            </div>
          ) : !isPro ? (
            <ProUpgradeBanner />
          ) : (
            <>
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Calculadora Avançada
                </h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Ferramenta profissional para precificação em marketplaces com análise completa de custos operacionais, 
                  comissões e estratégias de margem otimizada.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <AdvancedCalculator userId={user?.id} />
              </motion.div>
            </>
          )}
        </div>
      </main>
      
    </motion.div>
  );
}
