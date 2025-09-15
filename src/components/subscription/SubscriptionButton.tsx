import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/domains/auth";
import { Settings } from "lucide-react";
import { logger } from "@/services/logger";

interface SubscriptionButtonProps {
  variant?: "manage" | "refresh";
  className?: string;
}

export default function SubscriptionButton({ variant = "manage", className }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthContext();

  const handleManageSubscription = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para gerenciar sua assinatura");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
  logger.error("Erro ao abrir portal:", error);
        toast.error("Erro ao abrir portal de assinatura. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Redirecionando para o portal de assinatura...");
      } else {
        toast.error("Erro ao gerar link do portal");
      }
    } catch (error) {
  logger.error("Erro no portal:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSubscription = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para verificar sua assinatura");
      return;
    }

    setIsLoading(true);
    try {
  const { error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
  logger.error("Erro ao verificar assinatura:", error);
        toast.error("Erro ao verificar assinatura. Tente novamente.");
        return;
      }

      toast.success("Status da assinatura atualizado!");
      window.location.reload(); // Atualiza a página para refletir mudanças
    } catch (error) {
  logger.error("Erro na verificação:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "refresh") {
    return (
      <Button
        variant="outline"
        onClick={handleRefreshSubscription}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? "Verificando..." : "Atualizar Status"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleManageSubscription}
      disabled={isLoading}
      className={className}
    >
      <Settings className="h-4 w-4 mr-2" />
      {isLoading ? "Carregando..." : "Gerenciar Assinatura"}
    </Button>
  );
}