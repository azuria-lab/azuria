
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedCalculatorPremium from "@/domains/calculator/components/AdvancedCalculatorPremium";
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
      
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingState />
              </div>
            ) : !isPro ? (
              <ProUpgradeBanner />
            ) : (
              <>
                <motion.div 
                  variants={itemVariants} 
                  className="mb-8 sm:mb-12 md:mb-16"
                >
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-2 sm:mb-3">
                      Calculadora Avançada
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light">
                      Precificação profissional para marketplaces com análise completa de custos, 
                      comissões e estratégias de margem otimizada. Ferramenta principal para seu negócio.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <AdvancedCalculatorPremium userId={user?.id} />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>
      
    </motion.div>
  );
}
