
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Calendar, Download, FileText, Mail, Table, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { DateRange } from "react-day-picker";

interface ExportPanelProps {
  onClose: () => void;
}

export default function ExportPanel({ onClose }: ExportPanelProps) {
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'custom'>('summary');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'calculations', 'revenue']);
  const [scheduleEmail, setScheduleEmail] = useState(false);

  const availableMetrics = [
    { id: 'users', label: 'Usuários Ativos', category: 'Engagement' },
    { id: 'calculations', label: 'Cálculos Realizados', category: 'Activity' },
    { id: 'revenue', label: 'Impacto na Receita', category: 'Business' },
    { id: 'conversions', label: 'Conversões', category: 'Business' },
    { id: 'churn', label: 'Taxa de Churn', category: 'Business' },
    { id: 'performance', label: 'Performance Score', category: 'Technical' },
    { id: 'retention', label: 'Retenção de Usuários', category: 'Engagement' },
    { id: 'margins', label: 'Margens Médias', category: 'Business' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleExport = async () => {
    // Simulate export process
    toast.loading('Gerando relatório...', { id: 'export' });
    
    setTimeout(() => {
      toast.success(`Relatório ${exportType.toUpperCase()} gerado com sucesso!`, { id: 'export' });
      
      if (scheduleEmail) {
        toast.success('Relatório agendado para envio por email!');
      }
      
      onClose();
    }, 2000);
  };

  // Helper intentionally removed (unused)

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Exportar Relatório
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure e exporte seus dados de analytics
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Format */}
          <div>
            <Label>Formato de Exportação</Label>
            <Select value={exportType} onValueChange={(value: 'csv' | 'pdf' | 'excel') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Type */}
          <div>
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={(value: 'summary' | 'detailed' | 'custom') => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumo Executivo</SelectItem>
                <SelectItem value="detailed">Relatório Detalhado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label>Período</Label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full"
            />
          </div>
        </div>

        {/* Custom Metrics Selection */}
        {reportType === 'custom' && (
          <div>
            <Label className="text-base font-medium">Métricas Personalizadas</Label>
            <p className="text-sm text-gray-600 mb-3">Selecione as métricas que deseja incluir no relatório</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={metric.id} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {metric.label}
                    </label>
                    <p className="text-xs text-gray-600">{metric.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Schedule */}
        <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
          <Checkbox
            id="schedule-email"
            checked={scheduleEmail}
            onCheckedChange={(checked) => setScheduleEmail(!!checked)}
          />
          <div className="flex-1">
            <label htmlFor="schedule-email" className="text-sm font-medium cursor-pointer flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar por email
            </label>
            <p className="text-xs text-gray-600">Receber relatório automaticamente por email</p>
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Resumo da Exportação</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• Formato: {exportType.toUpperCase()}</p>
            <p>• Tipo: {reportType === 'summary' ? 'Resumo Executivo' : reportType === 'detailed' ? 'Detalhado' : 'Personalizado'}</p>
            <p>• Período: {dateRange ? `${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}` : 'Último mês'}</p>
            {reportType === 'custom' && (
              <p>• Métricas: {selectedMetrics.length} selecionadas</p>
            )}
            {scheduleEmail && (
              <p>• Email: Agendado para envio</p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          {scheduleEmail && (
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
