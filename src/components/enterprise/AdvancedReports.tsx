
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, Clock, DollarSign, Download, FileText, Plus, TrendingUp, Users } from "lucide-react";
import { useAdvancedReports } from "@/hooks/useAdvancedReports";
import { AdvancedReport, ReportFilters } from "@/types/enterprise";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdvancedReports() {
  const { reports, isGenerating, generateReport, scheduleReport } = useAdvancedReports();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState<AdvancedReport['type']>("calculations");
  const [reportFormat, setReportFormat] = useState<AdvancedReport['format']>("pdf");
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const reportTypes = [
    { value: 'calculations', label: 'Cálculos de Preço', icon: TrendingUp },
    { value: 'analytics', label: 'Analytics e Métricas', icon: DollarSign },
    { value: 'usage', label: 'Uso da Plataforma', icon: Users },
    { value: 'financial', label: 'Relatório Financeiro', icon: DollarSign }
  ];

  const handleGenerateReport = async () => {
    if (!reportName.trim()) {
      return;
    }

    const filters: ReportFilters = {
      dateRange: { start: startDate, end: endDate }
    };

    await generateReport(reportName, reportType, reportFormat, filters);
    setReportName("");
    setIsCreateOpen(false);
  };

  const getReportIcon = (type: AdvancedReport['type']) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    const Icon = reportType?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getFormatBadge = (format: AdvancedReport['format']) => {
    const colors = {
      pdf: "bg-red-100 text-red-800",
      excel: "bg-green-100 text-green-800",
      csv: "bg-blue-100 text-blue-800"
    };
    return (
      <Badge className={colors[format]}>
        {format.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Relatórios Avançados
          </h2>
          <p className="text-muted-foreground">
            Gere relatórios detalhados em PDF, Excel ou CSV
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerar Novo Relatório</DialogTitle>
              <DialogDescription>
                Configure um relatório personalizado com filtros específicos
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
                <TabsTrigger value="filters">Filtros Avançados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="reportName">Nome do Relatório</Label>
                  <Input
                    id="reportName"
                    placeholder="Ex: Análise Mensal de Vendas"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Relatório</Label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as AdvancedReport['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Formato</Label>
                    <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as AdvancedReport['format'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="filters" className="space-y-4">
                <div>
                  <Label>Usuários Específicos</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['João Silva', 'Maria Santos', 'Carlos Oliveira'].map((user) => (
                      <div key={user} className="flex items-center space-x-2">
                        <Checkbox id={user} />
                        <label htmlFor={user} className="text-sm">{user}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Tipos de Calculadora</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Simples', 'PRO', 'Avançada'].map((calc) => (
                      <div key={calc} className="flex items-center space-x-2">
                        <Checkbox id={calc} />
                        <label htmlFor={calc} className="text-sm">{calc}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating || !reportName.trim()}>
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              Gerando Relatório...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={65} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Processando dados e formatando relatório...
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">downloads totais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.schedule).length}
            </div>
            <p className="text-xs text-muted-foreground">relatórios automáticos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Formato Popular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PDF</div>
            <p className="text-xs text-muted-foreground">67% dos downloads</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios</CardTitle>
          <CardDescription>
            Seus relatórios gerados recentemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getReportIcon(report.type)}
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Gerado em {report.lastGenerated?.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getFormatBadge(report.format)}
                  {report.schedule && (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {report.schedule}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum relatório gerado ainda</p>
                <p className="text-sm">Clique em "Novo Relatório" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
