
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useToast } from "@/hooks/use-toast";
import { UserProfileWithDisplayData } from "@/hooks/auth";
import { SEOHead } from "@/components/seo/SEOHead";
import { logger } from "@/services/logger";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuthContext();
  
  // Usar dados reais do usuário logado
  const userProfile = auth?.userProfile || null;

  // Função real para atualizar perfil
  const handleUpdateProfile = async (data: Partial<UserProfileWithDisplayData>) => {
    try {
      logger.info("Updating profile with:", data);
      
      // Usar a função de atualização do contexto de autenticação
      const success = await auth?.updateProfile(data);
      
      if (success) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso."
        });
        return true;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      logger.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleCancelSubscription = () => {
    logger.info("Cancelando assinatura");
    toast({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada com sucesso."
    });
  };

  const handleUpgradeSubscription = () => {
    logger.info("Atualizando para plano PRO");
    toast({
      title: "Assinatura atualizada",
      description: "Sua conta foi atualizada para o plano PRO."
    });
  };

  return (
    <>
      <SEOHead 
        title="Configurações - Azuria+"
        description="Gerencie sua conta, preferências e configurações do Azuria+. Controle total sobre seus dados e privacidade."
        url={globalThis.window ? `${globalThis.window.location.origin}/settings` : 'https://azuria.app/settings'}
        type="website"
        noIndex={true}
      />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Minimalist Header */}
          <motion.div 
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </motion.div>
            
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-3">
                Configurações
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light">
                Gerencie sua conta e preferências do Azuria
              </p>
            </div>
          </motion.div>
          
          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SettingsTabs 
              userProfile={userProfile}
              isPro={auth?.isPro ?? true}
              onUpdateProfile={handleUpdateProfile}
              onCancelSubscription={handleCancelSubscription}
              onUpgradeSubscription={handleUpgradeSubscription}
            />
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
