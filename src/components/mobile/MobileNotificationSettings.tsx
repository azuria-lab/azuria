
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface NotificationSettings {
  enabled: boolean;
  priceAlerts: boolean;
  weeklyReports: boolean;
  competitorUpdates: boolean;
  systemUpdates: boolean;
}

export default function MobileNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    priceAlerts: true,
    weeklyReports: false,
    competitorUpdates: false,
    systemUpdates: true
  });

  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notificações não são suportadas neste navegador");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      setSettings(prev => ({ ...prev, enabled: true }));
      toast.success("Notificações ativadas com sucesso!");
      
      // Show test notification
      new Notification("Precifica+ Ativado!", {
        body: "Você receberá alertas importantes sobre seus preços",
        icon: "/favicon.ico",
        tag: "welcome"
      });
    } else {
      toast.error("Permissão de notificação negada");
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    if (key === "enabled" && value && permission !== "granted") {
      requestPermission();
      return;
    }
    
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Save to localStorage
    localStorage.setItem("notificationSettings", JSON.stringify({
      ...settings,
      [key]: value
    }));
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return { color: "text-green-600", text: "Permitidas" };
      case "denied":
        return { color: "text-red-600", text: "Bloqueadas" };
      default:
        return { color: "text-gray-600", text: "Não solicitadas" };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Notificações Mobile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {permission === "granted" ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">Status:</span>
            </div>
            <span className={`text-sm font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>

          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ativar Notificações</p>
              <p className="text-sm text-gray-500">
                Receba alertas importantes no seu dispositivo
              </p>
            </div>
            <Switch
              checked={settings.enabled && permission === "granted"}
              onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
            />
          </div>

          {/* Request Permission Button */}
          {permission === "default" && (
            <Button 
              onClick={requestPermission}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Permitir Notificações
            </Button>
          )}

          {/* Individual Settings */}
          {settings.enabled && permission === "granted" && (
            <>
              <hr className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Preço</p>
                    <p className="text-sm text-gray-500">
                      Mudanças significativas nos seus preços
                    </p>
                  </div>
                  <Switch
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => handleSettingChange("priceAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios Semanais</p>
                    <p className="text-sm text-gray-500">
                      Resumo semanal dos seus cálculos
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações da Concorrência</p>
                    <p className="text-sm text-gray-500">
                      Mudanças nos preços dos concorrentes
                    </p>
                  </div>
                  <Switch
                    checked={settings.competitorUpdates}
                    onCheckedChange={(checked) => handleSettingChange("competitorUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações do Sistema</p>
                    <p className="text-sm text-gray-500">
                      Novas funcionalidades e melhorias
                    </p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => handleSettingChange("systemUpdates", checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
