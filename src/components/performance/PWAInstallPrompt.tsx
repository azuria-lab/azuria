import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Download, 
  Share, 
  Shield, 
  Smartphone, 
  Wifi,
  WifiOff,
  X,
  Zap 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { usePWA } from "@/hooks/usePWA";
import { useMobileFeatures } from "@/hooks/useMobileFeatures";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { logger } from "@/services/logger";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState<'install' | 'permissions' | 'completed'>('install');
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const { shareData, vibrate, isStandalone } = useMobileFeatures();
  const { requestPermission, permission: _permission, isSupported: notificationsSupported } = usePushNotifications();

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show prompt if app is installable and not already installed
    if (isInstallable && !isInstalled && !isStandalone) {
      // Delay showing prompt to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isStandalone]);

  const handleInstall = async () => {
    try {
      vibrate?.(50); // Haptic feedback
      const success = await installApp();
      
      if (success) {
        toast.success("App instalado com sucesso!");
        setCurrentStep('permissions');
      } else {
        toast.error("Não foi possível instalar o app. Tente novamente.");
      }
    } catch (error) {
  logger.error('Error installing app:', error);
      toast.error("Erro ao instalar o app.");
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      
      if (granted) {
        toast.success("Notificações ativadas! Você receberá alertas importantes.");
        setCurrentStep('completed');
        setTimeout(() => {
          setShowPrompt(false);
        }, 2000);
      } else {
        toast.info("Você pode ativar as notificações depois nas configurações.");
        setCurrentStep('completed');
        setTimeout(() => {
          setShowPrompt(false);
        }, 2000);
      }
    } catch (error) {
  logger.error('Error enabling notifications:', error);
      toast.error("Erro ao ativar notificações.");
    }
  };

  const handleShare = async () => {
    try {
      const success = await shareData({
        title: "Azuria - Gestão Inteligente de Preços",
        text: "Descubra a melhor ferramenta para calcular preços de produtos!",
        url: window.location.origin
      });
      
      if (success) {
        vibrate?.(30);
        toast.success("Compartilhado com sucesso!");
      }
    } catch (error) {
  logger.error('Error sharing:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasBeenDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Set reminder for 24 hours
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
      setHasBeenDismissed(false);
    }, 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed and running standalone
  if (isInstalled && isStandalone) {
    return (
      <Card className="mb-4 bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                App instalado e funcionando!
              </p>
              <p className="text-xs text-green-600">
                {isOnline ? "✅ Conectado e sincronizado" : "📱 Funcionando offline"}
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

  if (!showPrompt || hasBeenDismissed) {
    return null;
  }

  return (
    <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 animate-fade-in shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                📱 Instale o Azuria no seu celular
              </h3>
              <Badge variant="secondary" className="mt-1">
                Versão PWA Completa
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {currentStep === 'install' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <WifiOff className="h-4 w-4" />
                <span>Funciona offline</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Zap className="h-4 w-4" />
                <span>Acesso ultra rápido</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Bell className="h-4 w-4" />
                <span>Alertas de preços</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar Agora
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-600">
              <button onClick={handleRemindLater} className="hover:text-blue-600">
                Lembrar mais tarde
              </button>
              <button onClick={handleDismiss} className="hover:text-gray-800">
                Não mostrar novamente
              </button>
            </div>
          </div>
        )}

        {currentStep === 'permissions' && notificationsSupported && (
          <div className="space-y-4">
            <div className="text-center">
              <Bell className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-900">Ativar Notificações?</h4>
              <p className="text-sm text-gray-600 mt-2">
                Receba alertas importantes sobre mudanças de preços e atualizações do mercado
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleEnableNotifications}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ativar Notificações
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('completed');
                  setTimeout(() => setShowPrompt(false), 1500);
                }}
                className="border-gray-300"
              >
                Pular
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'completed' && (
          <div className="text-center space-y-3">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Tudo pronto!</h4>
              <p className="text-sm text-green-600">
                Azuria está instalado e configurado
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
