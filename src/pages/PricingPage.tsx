
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { logger } from "@/services/logger";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/domains/auth";
import { supabase } from "@/integrations/supabase/client";
import PricingHeader from "@/components/pricing/PricingHeader";
import BillingToggle from "@/components/pricing/BillingToggle";
import PricingCards from "@/components/pricing/PricingCards";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import { SEOHead } from "@/components/seo/SEOHead";

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

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: "monthly" | "yearly" | "enterprise") => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para assinar um plano");
      navigate("/login");
      return;
    }

    if (plan === "enterprise") {
      toast.info("Para o plano Premium, entre em contato conosco!");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

          if (error) {
            logger.error("Erro ao criar checkout:", error);
        toast.error("Erro ao processar pagamento. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirecionando para o pagamento...");
      } else {
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch (error) {
          logger.error("Erro no checkout:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Planos e Preços - Azuria+"
        description="Escolha o plano ideal para sua empresa. Teste grátis por 7 dias, sem compromisso. Precificação inteligente com IA."
        url={typeof window !== 'undefined' ? `${window.location.origin}/pricing` : 'https://azuria.app/pricing'}
        type="website"
      />
      
      <motion.div 
        className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Header />
      
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="sr-only">Planos e Preços - Azuria+</h1>
          <PricingHeader />
          
          <BillingToggle 
            billingCycle={billingCycle} 
            setBillingCycle={setBillingCycle} 
          />
          
          <PricingCards 
            billingCycle={billingCycle}
            isLoading={isLoading}
            onSubscribe={handleSubscribe}
          />
          
          <PricingFAQ />
        </div>
      </main>
        
        <Footer />
      </motion.div>
    </>
  );
}
