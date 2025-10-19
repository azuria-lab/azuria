
import React from "react";
import { useNavigate } from "react-router-dom";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { SyncUserNameButton } from "@/components/settings/SyncUserNameButton";
import { useToast } from "@/hooks/use-toast";
import { UserProfileWithDisplayData } from "@/hooks/auth";
import { SEOHead } from "@/components/seo/SEOHead";
import { logger } from "@/services/logger";
import { useAuthContext } from "@/domains/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const authContext = useAuthContext();
  const { userProfile, isAuthenticated } = authContext;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !userProfile) {
      navigate('/entrar');
    }
  }, [isAuthenticated, userProfile, navigate]);

  // Handle profile update
  const handleUpdateProfile = async (data: Partial<UserProfileWithDisplayData>) => {
    try {
      logger.info("Updating profile with:", data);
      
      if (!userProfile?.id) {
        throw new Error("User profile ID is required");
      }
      
      // Build update data with proper typing
      interface UpdateData {
        name?: string;
        updated_at: string;
        phone?: string;
        company?: string;
      }
      
      const updateData: UpdateData = {
        name: data.name ?? undefined,
        updated_at: new Date().toISOString(),
      };
      
      // Add optional fields if they exist in data
      if ('phone' in data && data.phone) {
        updateData.phone = data.phone as string;
      }
      if ('company' in data && data.company) {
        updateData.company = data.company as string;
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userProfile.id);

      if (error) {
        logger.error("Error updating profile:", error);
        toast({
          title: "Erro ao atualizar perfil",
          description: "Não foi possível atualizar suas informações. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
      return true;
    } catch (error) {
      logger.error("Exception updating profile:", error);
      toast({
        title: "Erro inesperado",
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
    navigate('/planos');
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }


  return (
    <>
      <SEOHead 
        title="Configurações - Azuria+"
        description="Gerencie sua conta, preferências e configurações do Azuria+. Controle total sobre seus dados e privacidade."
        url={globalThis.window ? `${globalThis.window.location.origin}/configuracoes` : 'https://azuria.app/configuracoes'}
        type="website"
        noIndex={true}
      />
      
      <main className="flex flex-col items-center min-h-[calc(100vh-80px)] pb-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full pt-8 px-4">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            Gerencie sua conta Azuria+ e preferências do app.
          </p>
          
          {/* Botão para sincronizar nome (temporário) */}
          <div className="flex justify-center mb-6">
            <SyncUserNameButton />
          </div>
          
          <SettingsTabs 
            userProfile={userProfile}
            isPro={userProfile?.isPro || false}
            onUpdateProfile={handleUpdateProfile}
            onCancelSubscription={handleCancelSubscription}
            onUpgradeSubscription={handleUpgradeSubscription}
          />
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
