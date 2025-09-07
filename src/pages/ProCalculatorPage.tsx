
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProCalculator from "@/components/calculators/ProCalculator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import LoadingState from "@/components/calculators/LoadingState";
import ProUpgradeBanner from "@/components/calculators/ProUpgradeBanner";
import ProCalculatorHeader from "@/components/calculators/ProCalculatorHeader";
import { logger } from "@/services/logger";

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

export default function ProCalculatorPage() {
  const navigate = useNavigate();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Verificar se o usuário está logado e é PRO
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirecionar para login se não estiver autenticado
          navigate("/login");
          return;
        }

        setUser(session.user);
        
        // Simulação de verificação de assinatura PRO
        // Em um app real, isso verificaria em uma tabela de assinaturas
        const userIsPro = localStorage.getItem("isPro") === "true";
        setIsPro(userIsPro);
        
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
      <Header />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingState />
            </div>
          ) : !isPro ? (
            <ProUpgradeBanner />
          ) : (
            <>
              <ProCalculatorHeader />
              
              <motion.div variants={itemVariants}>
                <ProCalculator userId={user?.id} />
              </motion.div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
