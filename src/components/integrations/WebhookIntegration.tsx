
import { useState } from "react";
import { logger } from "@/services/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function WebhookIntegration() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, informe a URL do webhook",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Enviar dados para o webhook
  const _response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Necessário para webhooks externos
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: "Precifica+",
          event: "test_connection",
          data: {
            appName: "Precifica+",
            version: "1.0.0"
          }
        }),
      });

      toast({
        title: "Webhook Acionado",
        description: "O webhook foi acionado com sucesso.",
      });
    } catch (error) {
          logger.error("Erro ao acionar webhook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acionar o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Conecte o Precifica+ com suas outras ferramentas usando webhooks.
          Você pode enviar automaticamente cálculos para ferramentas como Zapier, Integromat ou seu próprio sistema.
        </p>
      </div>
      
      <form onSubmit={handleTrigger} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">URL do Webhook</Label>
          <Input
            id="webhookUrl"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Cole aqui a URL do seu webhook do Zapier, Integromat, ou outra ferramenta de automação
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !webhookUrl} 
          className="w-full"
        >
          {isLoading ? "Enviando..." : "Testar Conexão"}
        </Button>
      </form>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">O que você pode fazer com webhooks:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
          <li>Enviar automaticamente novos cálculos para planilhas</li>
          <li>Acionar automações quando preços são calculados</li>
          <li>Integrar com sistemas de estoque ou ERP</li>
          <li>Enviar alertas quando margens caírem abaixo do esperado</li>
        </ul>
      </div>
    </div>
  );
}
