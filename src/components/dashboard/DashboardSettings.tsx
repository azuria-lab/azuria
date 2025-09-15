
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dashboard } from '@/types/dashboard';

interface DashboardSettingsProps {
  dashboard: Dashboard | undefined;
  onClose: () => void;
}

export default function DashboardSettings({ dashboard, onClose }: DashboardSettingsProps) {
  if (!dashboard) {return null;}

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-refresh">Atualização Automática</Label>
          <Switch
            id="auto-refresh"
            checked={dashboard.settings.autoRefresh}
            onCheckedChange={() => {
              // Handle auto refresh toggle
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Intervalo de Atualização</Label>
          <Select value={dashboard.settings.refreshInterval.toString()}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10000">10 segundos</SelectItem>
              <SelectItem value="30000">30 segundos</SelectItem>
              <SelectItem value="60000">1 minuto</SelectItem>
              <SelectItem value="300000">5 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tema</Label>
          <Select value={dashboard.settings.theme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tamanho do Grid</Label>
          <Select value={dashboard.settings.gridSize.toString()}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 colunas</SelectItem>
              <SelectItem value="12">12 colunas</SelectItem>
              <SelectItem value="16">16 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
