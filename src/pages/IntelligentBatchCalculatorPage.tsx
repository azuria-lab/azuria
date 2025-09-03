
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import IntelligentBatchCalculator from "@/components/calculators/IntelligentBatchCalculator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/calculators/LoadingState";
import ProUpgradeBanner from "@/components/calculators/ProUpgradeBanner";
import { Brain, Package2, Zap } from "lucide-react";

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

export default function IntelligentBatchCalculatorPage() {
  const navigate = useNavigate();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);
        
        // Verificação de assinatura PRO
        const userIsPro = localStorage.getItem("isPro") === "true";
        setIsPro(userIsPro);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
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
        <div className="container mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingState />
            </div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <Package2 className="h-8 w-8 text-brand-600" />
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Calculadora em Lote Inteligente
                </h1>
                
                <p className="text-gray-600 max-w-4xl mx-auto text-lg">
                  Revolucione sua estratégia de precificação com IA avançada, análise competitiva 
                  em tempo real e simulação de cenários para otimização de margem e volume.
                </p>
                
                <div className="flex items-center justify-center gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-700">Análise de IA</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                    <Package2 className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">Precificação Inteligente</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">Insights Competitivos</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <IntelligentBatchCalculator isPro={isPro} userId={user?.id} />
              </motion.div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
