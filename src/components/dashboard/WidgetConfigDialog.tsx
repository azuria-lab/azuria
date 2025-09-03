
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardWidget, WidgetConfig } from '@/types/dashboard';

interface WidgetConfigDialogProps {
  widget: DashboardWidget;
  onSave: (config: WidgetConfig) => void;
  onCancel: () => void;
}

export default function WidgetConfigDialog({ widget, onSave, onCancel }: WidgetConfigDialogProps) {
  const [config, setConfig] = useState<WidgetConfig>(widget.config);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Título do Widget</Label>
        <Input
          value={config.title || widget.title}
          onChange={(e) => setConfig({ ...config, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Período</Label>
        <Select 
          value={config.period || 'today'} 
          onValueChange={(value) => setConfig({ ...config, period: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {widget.type.includes('chart') && (
        <div className="space-y-2">
          <Label>Tipo de Gráfico</Label>
          <Select 
            value={config.chartType || 'line'} 
            onValueChange={(value) => setConfig({ ...config, chartType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Linha</SelectItem>
              <SelectItem value="bar">Barra</SelectItem>
              <SelectItem value="pie">Pizza</SelectItem>
              <SelectItem value="donut">Donut</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(config)}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
