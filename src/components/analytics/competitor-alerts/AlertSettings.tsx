
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertSettings as AlertSettingsType } from "@/types/competitorAlerts";

interface AlertSettingsProps {
  settings: AlertSettingsType;
  onUpdateSettings: (settings: Partial<AlertSettingsType>) => void;
}

export default function AlertSettings({ settings, onUpdateSettings }: AlertSettingsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4 border">
      <h4 className="font-medium text-gray-700">Configurações de Alertas</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Limite para queda de preço (%)</Label>
          <input
            type="number"
            value={settings.priceDropThreshold}
            onChange={(e) => onUpdateSettings({ priceDropThreshold: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
            min="1"
            max="50"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Limite para aumento de preço (%)</Label>
          <input
            type="number"
            value={settings.priceIncreaseThreshold}
            onChange={(e) => onUpdateSettings({ priceIncreaseThreshold: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
            min="1"
            max="50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => onUpdateSettings({ enableNotifications: checked })}
          />
          <Label htmlFor="notifications">Notificações em tempo real</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="email-alerts"
            checked={settings.enableEmailAlerts}
            onCheckedChange={(checked) => onUpdateSettings({ enableEmailAlerts: checked })}
          />
          <Label htmlFor="email-alerts">Alertas por email</Label>
        </div>
      </div>
    </div>
  );
}
