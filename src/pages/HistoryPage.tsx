
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import { useRealTimeHistory } from "@/hooks/useRealTimeHistory";
import HistoryList from "@/components/history/HistoryList";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

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

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const { history, isLoading, error, deleteHistoryItem, clearAllHistory } = useRealTimeHistory();

  // Verificar se o usuário está logado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      toast.success("Item removido do histórico");
    } catch (err) {
      toast.error("Erro ao remover item do histórico");
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico?")) {
      try {
        await clearAllHistory();
        toast.success("Histórico limpo com sucesso");
      } catch (err) {
        toast.error("Erro ao limpar histórico");
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Ou componente de loading
  }

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
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              
              <h1 className="text-2xl md:text-3xl font-bold">Histórico de Cálculos</h1>
            </div>
            
            {history.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearHistory}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Limpar histórico
              </Button>
            )}
          </motion.div>
          
          {error && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <HistoryList 
              history={history} 
              formatCurrency={formatCurrency}
              onDeleteItem={handleDeleteItem}
              loading={isLoading}
            />
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
