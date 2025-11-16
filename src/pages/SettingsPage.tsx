
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
      
      <main className="flex flex-col items-center min-h-[calc(100vh-80px)] pb-8 bg-gradient-to-br from-gray-50 via-white to-brand-50">
        <div className="w-full max-w-6xl pt-8 px-4">
          {/* Header com botão de voltar */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 hover:bg-brand-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-gray-900 bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-gray-600 text-lg">
                Gerencie sua conta Azuria+ e preferências do app
              </p>
            </div>
          </div>
          
          {/* Tabs de Configurações */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <SettingsTabs 
              userProfile={userProfile}
              isPro={auth?.isPro ?? true}
              onUpdateProfile={handleUpdateProfile}
              onCancelSubscription={handleCancelSubscription}
              onUpgradeSubscription={handleUpgradeSubscription}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
