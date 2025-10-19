
import { logger } from '@/services/logger';
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    logger.error(...args);
  }
};

interface Props {
  isPro: boolean;
  subscriptionEnd: Date | null;
  onCancel?: () => void;
  onUpgrade?: () => void;
}

const SettingsSubscriptionTab: React.FC<Props> = ({
  isPro,
  subscriptionEnd,
  onCancel,
  onUpgrade,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        devLog("Erro ao abrir portal:", error);
        toast.error("Erro ao abrir portal de gerenciamento");
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Abrindo portal de gerenciamento...");
      }
    } catch (error) {
      devLog("Erro no portal:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    navigate("/planos");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>
              Gerencie sua assinatura e confira os benefícios exclusivos do plano PRO
            </CardDescription>
          </div>
          {isPro ? (
            <Badge className="bg-brand-500">PRO</Badge>
          ) : (
            <Badge variant="outline">Grátis</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPro ? (
          <>
            <div>
              <h3 className="font-medium text-lg">Plano PRO</h3>
              <p className="text-gray-600 text-sm">
                Você aproveita todos os recursos avançados do Precifica+ sem limites.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Próxima cobrança:</span>
                  <span className="font-medium">
                    {subscriptionEnd?.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">R$ 39,90/mês</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Ativa</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Benefícios do PRO:</h4>
              <ul className="space-y-2">
                {[
                  "Calculadora avançada para marketplaces",
                  "Marketplace Intelligence em tempo real",
                  "Análise de concorrência automatizada",
                  "Cálculo detalhado com impostos, taxas e frete grátis",
                  "Exportação PDF, Excel e CSV",
                  "Notificações push inteligentes",
                  "Suporte por e-mail prioritário",
                  "API básica (10.000 req/dia)"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-medium text-lg">Plano Grátis</h3>
              <p className="text-gray-600 text-sm">
                Você está usando a versão gratuita do Precifica+ <br />
                Aproveite recursos essenciais para precificação.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Recursos disponíveis:</h4>
              <ul className="space-y-2">
                {[
                  "Calculadora de preço básica",
                  "Cálculo com base em custo e margem",
                  "Simulação ilimitada de preços"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 mt-4">
              <h4 className="font-medium mb-2">Atualize para o plano PRO</h4>
              <p className="text-gray-600 text-sm mb-4">
                Desbloqueie todos os recursos premium por apenas <span className="font-bold text-brand-600">R$ 39,90/mês</span> ou <span className="font-bold text-brand-600">R$ 399/ano</span> (economize 17%!). Ferramenta única no mercado brasileiro.
              </p>
              <Button onClick={handleUpgradeClick}>Fazer Upgrade para PRO</Button>
            </div>
          </>
        )}
      </CardContent>
      {isPro && (
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {isLoading ? "Carregando..." : "Gerenciar Assinatura"}
          </Button>
          {onCancel && (
            <Button variant="destructive" onClick={onCancel}>Cancelar Assinatura</Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SettingsSubscriptionTab;
