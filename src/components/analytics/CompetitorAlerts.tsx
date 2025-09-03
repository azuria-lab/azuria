
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useCompetitorAlerts } from "@/hooks/useCompetitorAlerts";
import AlertSettings from "./competitor-alerts/AlertSettings";
import AlertsList from "./competitor-alerts/AlertsList";

export default function CompetitorAlerts() {
  const [showSettings, setShowSettings] = useState(false);
  const { alerts, settings, removeAlert, clearAllAlerts, updateSettings } = useCompetitorAlerts();

  const handleSendReport = () => {
    toast.success("Relatório de alertas enviado por email!");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Alertas Inteligentes
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length} novo{alerts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configurações */}
        {showSettings && (
          <AlertSettings 
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {/* Lista de Alertas */}
        <AlertsList 
          alerts={alerts}
          onRemoveAlert={removeAlert}
        />

        {/* Ações Rápidas */}
        {alerts.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={clearAllAlerts}
            >
              Marcar todas como lidas
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleSendReport}
            >
              Enviar relatório
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
