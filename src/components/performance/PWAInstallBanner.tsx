import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, Smartphone, Wifi, WifiOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { usePWA } from "@/hooks/usePWA";
import { useMobileFeatures } from "@/hooks/useMobileFeatures";
import { logger } from "@/services/logger";

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const { shareData, vibrate, isStandalone } = useMobileFeatures();

  const handleInstall = async () => {
    try {
      vibrate(50);
      const success = await installApp();
      if (success) {
        toast.success("App instalado com sucesso! Agora você pode usá-lo offline.");
      } else {
        toast.error("Não foi possível instalar o app. Tente novamente.");
      }
    } catch (error) {
  logger.error('Error installing app:', error);
      toast.error("Erro ao instalar o app.");
    }
  };

  const handleShare = async () => {
    try {
      const success = await shareData({
        title: "Azuria - Calculadora de Preços",
        text: "Descubra a melhor ferramenta para calcular preços de produtos!",
        url: window.location.origin
      });
      
      if (success) {
        vibrate(30);
        toast.success("Link compartilhado!");
      }
    } catch (error) {
  logger.error('Error sharing:', error);
    }
  };

  // Don't show if already installed and running standalone
  if (isInstalled && isStandalone) {
    return (
      <Card className="mb-4 bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                App instalado e funcionando!
              </p>
              <p className="text-xs text-green-600">
                {isOnline ? "Conectado e sincronizado" : "Funcionando offline"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="border-green-200 text-green-700 hover:bg-green-100"
              >
                <Share className="h-3 w-3 mr-1" />
                Compartilhar
              </Button>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              📱 Instale o Azuria no seu celular
            </p>
            <p className="text-xs text-blue-600 mt-1">
              • Use offline sem internet<br/>
              • Acesso rápido direto da tela inicial<br/>
              • Notificações de alertas de preços
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
            >
              Instalar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs px-3 py-1"
            >
              <Share className="h-3 w-3 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
