
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, Download, FileSpreadsheet, FileText, Table } from "lucide-react";
import { useAdvancedExportReports } from "@/hooks/useAdvancedExportReports";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import { useAuthContext } from "@/domains/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScheduledReportsManager from "./ScheduledReportsManager";

export default function ExportOptions() {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [period, setPeriod] = useState("all");
  const [fileName, setFileName] = useState("relatorio-precifica");
  const [isExporting, setIsExporting] = useState(false);
  
  const { exportToPDFWithCharts, exportToExcelMultiSheet } = useAdvancedExportReports();
  const { history, loading: historyLoading, error: historyError } = useCalculationHistory();
  const { isAuthenticated, isPro } = useAuthContext();

  const handleAdvancedExport = async () => {
    if (history.length === 0) {return;}

    setIsExporting(true);
    
    try {
      let filteredHistory = history;
      
      // Filter by period
      if (period !== "all") {
        const now = new Date();
        const periodDate = new Date();
        
        switch (period) {
          case "7days":
            periodDate.setDate(now.getDate() - 7);
            break;
          case "30days":
            periodDate.setDate(now.getDate() - 30);
            break;
          case "90days":
            periodDate.setDate(now.getDate() - 90);
            break;
        }
        
        filteredHistory = history.filter(calc => new Date(calc.date) >= periodDate);
      }

      // Generate mock chart data for demonstration
      const chartData = {
        trends: {
          labels: ["Jan", "Feb", "Mar", "Abr", "Mai", "Jun"],
          datasets: [{
            label: "Preço Médio",
            data: [100, 120, 115, 140, 135, 150],
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)"
          }]
        },
        categories: {
          labels: ["Eletrônicos", "Roupas", "Casa", "Esportes"],
          datasets: [{
            label: "Distribuição",
            data: [30, 25, 25, 20],
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
          }]
        },
        volume: {
          labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
          datasets: [{
            label: "Volume de Cálculos",
            data: [45, 52, 48, 61],
            backgroundColor: "rgba(16, 185, 129, 0.8)"
          }]
        }
      };

      // Calculate summary metrics
      const totalCalculations = filteredHistory.length;
      const avgMargin = totalCalculations > 0 
        ? filteredHistory.reduce((acc, calc) => acc + calc.margin, 0) / totalCalculations 
        : 0;
      const avgSellingPrice = totalCalculations > 0
        ? filteredHistory.reduce((acc, calc) => acc + (calc.result?.sellingPrice || 0), 0) / totalCalculations
        : 0;
      const totalRevenue = filteredHistory.reduce((acc, calc) => acc + (calc.result?.sellingPrice || 0), 0);

      const exportData = {
        calculations: filteredHistory,
        period,
        charts: chartData,
        filters: { format: exportFormat },
        summary: {
          totalCalculations,
          avgMargin,
          avgSellingPrice,
          totalRevenue,
          periodLabel: periodOptions.find(p => p.value === period)?.label || "Todos os registros"
        }
      };

      switch (exportFormat) {
        case "pdf":
          await exportToPDFWithCharts(exportData, fileName);
          break;
        case "excel":
          await exportToExcelMultiSheet(exportData, fileName);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { 
      value: "pdf", 
      label: "PDF Avançado", 
      icon: FileText, 
      description: "Relatório completo com gráficos e análises",
      badge: "NOVO"
    },
    { 
      value: "excel", 
      label: "Excel Multi-Abas", 
      icon: FileSpreadsheet, 
      description: "Planilha com múltiplas abas organizadas",
      badge: "NOVO"
    },
    { 
      value: "csv", 
      label: "CSV Simples", 
      icon: Table, 
      description: "Dados básicos em formato CSV" 
    }
  ];

  const periodOptions = [
    { value: "all", label: "Todos os registros" },
    { value: "7days", label: "Últimos 7 dias" },
    { value: "30days", label: "Últimos 30 dias" },
    { value: "90days", label: "Últimos 90 dias" }
  ];

  // Filter history by period for display
  const getFilteredCount = () => {
    if (period === "all") {return history.length;}
    
    const now = new Date();
    const periodDate = new Date();
    
    switch (period) {
      case "7days":
        periodDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        periodDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        periodDate.setDate(now.getDate() - 90);
        break;
    }
    
    return history.filter(calc => new Date(calc.date) >= periodDate).length;
  };

  // Show authentication warning if not logged in
  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-brand-600" />
            Exportar Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Faça login para acessar o histórico de cálculos e gerar relatórios personalizados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Agora
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-brand-600" />
                Exportar Relatórios Avançados
              </CardTitle>
              <p className="text-sm text-gray-600">
                Gere relatórios profissionais com gráficos e análises detalhadas
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {historyError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{historyError}</AlertDescription>
                </Alert>
              )}

              {/* Format Selection */}
              <div className="space-y-3">
                <Label>Formato de Exportação</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {formatOptions.map((format) => (
                    <div
                      key={format.value}
                      className={`relative p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === format.value 
                          ? "border-brand-500 bg-brand-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setExportFormat(format.value)}
                    >
                      {format.badge && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                          {format.badge}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <format.icon className="h-4 w-4" />
                        <span className="font-medium">{format.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{format.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Name */}
              <div className="space-y-2">
                <Label>Nome do Arquivo</Label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="relatorio-precifica"
                />
              </div>

              {/* Export Summary with Real Data */}
              <div className="bg-gradient-to-r from-brand-50 to-blue-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Prévia do Relatório
                </h3>
                {historyLoading ? (
                  <div className="text-sm text-gray-600">Carregando dados...</div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Formato: {formatOptions.find(f => f.value === exportFormat)?.label}</p>
                    <p>• Período: {periodOptions.find(p => p.value === period)?.label}</p>
                    <p>• Registros no período: {getFilteredCount()}</p>
                    <p>• Total geral: {history.length} cálculos</p>
                    {exportFormat === 'pdf' && <p>• Inclui gráficos e análises visuais</p>}
                    {exportFormat === 'excel' && <p>• Múltiplas abas: Resumo, Cálculos, Métricas, Gráficos</p>}
                  </div>
                )}
              </div>

              {/* Export Button */}
              <Button 
                onClick={handleAdvancedExport} 
                disabled={isExporting || historyLoading || getFilteredCount() === 0}
                className="w-full bg-brand-600 hover:bg-brand-700"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Gerando Relatório..." : "Exportar Relatório Avançado"}
              </Button>

              {getFilteredCount() === 0 && !historyLoading && (
                <p className="text-sm text-gray-500 text-center">
                  {history.length === 0 
                    ? "Nenhum cálculo encontrado. Faça alguns cálculos primeiro para gerar relatórios."
                    : "Nenhum cálculo encontrado no período selecionado."
                  }
                </p>
              )}

              {!isPro && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upgrade para PRO para acessar relatórios com gráficos e agendamento automático.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduledReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
