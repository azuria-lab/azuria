
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock, Smartphone, TrendingUp } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationCenter() {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendPriceAlert, 
    sendMarketUpdate, 
    sendCalculationReminder 
  } = usePushNotifications();

  const handleTestNotification = () => {
    sendCalculationReminder();
  };

  const handlePriceAlertTest = () => {
    sendPriceAlert("iPhone 15 Pro", 8999.99, 9299.99);
  };

  const handleMarketUpdateTest = () => {
    sendMarketUpdate("Novos dados de concorrência disponíveis para categoria Eletrônicos");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-600" />
          Centro de Notificações
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure alertas inteligentes para não perder oportunidades
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {permission.granted ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">
                Status das Notificações
              </p>
              <p className="text-sm text-gray-600">
                {permission.granted ? "Ativadas" : "Desativadas"}
              </p>
            </div>
          </div>
          <div>
            {permission.granted ? (
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            ) : permission.denied ? (
              <Badge variant="destructive">Bloqueado</Badge>
            ) : (
              <Badge variant="outline">Pendente</Badge>
            )}
          </div>
        </div>

        {/* Enable Notifications */}
        {!permission.granted && isSupported && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">
                Ative as Notificações Push
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Receba alertas em tempo real sobre mudanças de preços, 
                atualizações de mercado e lembretes importantes.
              </p>
              <Button 
                onClick={requestPermission}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ativar Notificações
              </Button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {permission.granted && (
          <div className="space-y-4">
            <h3 className="font-semibold">Tipos de Alertas</h3>
            
            <div className="space-y-4">
              {/* Price Alerts */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <div>
                    <Label className="font-medium">Alertas de Preço</Label>
                    <p className="text-xs text-gray-600">
                      Notificações quando preços mudam significativamente
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Market Updates */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <Label className="font-medium">Atualizações de Mercado</Label>
                    <p className="text-xs text-gray-600">
                      Novos dados de concorrência e tendências
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Reminders */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <Label className="font-medium">Lembretes</Label>
                    <p className="text-xs text-gray-600">
                      Sugestões para revisar preços periodicamente
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}

        {/* Test Notifications */}
        {permission.granted && (
          <div className="space-y-3">
            <h3 className="font-semibold">Testar Notificações</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestNotification}
                className="text-xs"
              >
                Lembrete
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePriceAlertTest}
                className="text-xs"
              >
                Alerta de Preço
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarketUpdateTest}
                className="text-xs"
              >
                Update de Mercado
              </Button>
            </div>
          </div>
        )}

        {/* Unsupported Browser */}
        {!isSupported && (
          <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <BellOff className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-yellow-900 mb-2">
              Navegador não suportado
            </h3>
            <p className="text-sm text-yellow-700">
              Seu navegador não suporta notificações push. 
              Considere atualizar para uma versão mais recente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
