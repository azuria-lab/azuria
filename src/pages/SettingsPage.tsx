
import React, { useState } from "react";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useToast } from "@/hooks/use-toast";
import { UserProfileWithDisplayData } from "@/hooks/auth";
import { SEOHead } from "@/components/seo/SEOHead";
import { logger } from "@/services/logger";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [userProfile, _setUserProfile] = useState<UserProfileWithDisplayData | null>({
    id: "demo-user",
    name: "Usuário Exemplo",
    email: "usuario@exemplo.com",
    isPro: true,
    createdAt: new Date().toISOString(),
    avatar_url: null
  });

  // Mock functions for demo purposes
  const handleUpdateProfile = async (data: Partial<UserProfileWithDisplayData>) => {
    logger.info("Updating profile with:", data);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso."
    });
    return true;
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
        url={typeof window !== 'undefined' ? `${window.location.origin}/settings` : 'https://azuria.app/settings'}
        type="website"
        noIndex={true}
      />
      
      <main className="flex flex-col items-center min-h-[calc(100vh-80px)] pb-8 bg-gray-50">
        <div className="w-full pt-8 px-4">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">Configurações</h1>
        <p className="text-center text-gray-500 mb-6">
          Gerencie sua conta Precifica+ e preferências do app.
        </p>
        <SettingsTabs 
          userProfile={userProfile}
          isPro={true}
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
