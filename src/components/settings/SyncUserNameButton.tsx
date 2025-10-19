import { logger } from '@/services/logger';
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Componente temporário para sincronizar o nome do user_metadata com a tabela user_profiles
 * Use este botão uma vez para corrigir o nome que está faltando
 */
export const SyncUserNameButton = () => {
  const { user, userProfile } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (!user || !userProfile) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Pegar o nome do user_metadata
      const nameFromMetadata = user.user_metadata?.name;
      
      if (!nameFromMetadata) {
        toast({
          title: "Aviso",
          description: "Nenhum nome encontrado no user_metadata. Por favor, atualize manualmente.",
          variant: "destructive"
        });
        return;
      }

      // eslint-disable-next-line no-console
      logger.info("🔄 SINCRONIZANDO NOME:", {
        userId: user.id,
        currentName: userProfile.name,
        newName: nameFromMetadata
      });

      // Atualizar na tabela user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          name: nameFromMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Nome sincronizado!",
        description: `Seu nome foi atualizado para: ${nameFromMetadata}. Recarregando...`
      });

      // Recarregar a página para atualizar o contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      // eslint-disable-next-line no-console
      logger.error("❌ Erro ao sincronizar nome:", error);
      toast({
        title: "Erro ao sincronizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Só mostrar se o nome estiver vazio ou for "Usuário"
  if (userProfile?.name && userProfile.name !== "Usuário" && userProfile.name !== user?.email?.split("@")[0]) {
    return null;
  }

  return (
    <Button 
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Sincronizando...' : 'Sincronizar Nome do Perfil'}
    </Button>
  );
};
