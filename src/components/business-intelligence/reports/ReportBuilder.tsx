import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar,
  Clock,
  Download,
  FileText,
  Mail,
  Play,
  Plus,
  Settings,
  Users
} from 'lucide-react';

interface BIReport {
  id: string;
  name: string;
  description: string;
  template: string;
  parameters: Record<string, unknown>;
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv' | 'json';
  };
  lastGenerated?: string;
  status: 'active' | 'inactive' | 'error';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'finance' | 'operations' | 'marketing' | 'automation';
  fields: ReportField[];
  outputFormats: string[];
  estimatedTime: string;
}

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string | number | boolean;
}

interface ReportBuilderProps {
  reports: BIReport[];
}

export function ReportBuilder({ reports }: ReportBuilderProps) {
  const [showNewReport, setShowNewReport] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  // Templates de relatórios disponíveis
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales_monthly',
      name: 'Relatório Mensal de Vendas',
      description: 'Análise completa de vendas com comparativos e tendências',
      category: 'sales',
      fields: [
        { id: 'period', name: 'Período', type: 'select', required: true, options: ['Último mês', 'Últimos 3 meses', 'Último ano'] },
        { id: 'channels', name: 'Canais', type: 'select', required: false, options: ['Todos', 'Mercado Livre', 'Amazon', 'Website'] },
        { id: 'includeComparisons', name: 'Incluir Comparações', type: 'boolean', required: false, defaultValue: true }
      ],
      outputFormats: ['pdf', 'excel', 'csv'],
      estimatedTime: '2-3 minutos'
    },
    {
      id: 'kpi_daily',
      name: 'KPIs Diários',
      description: 'Indicadores chave de performance atualizados diariamente',
      category: 'operations',
      fields: [
        { id: 'metrics', name: 'Métricas', type: 'select', required: true, options: ['Receita', 'Pedidos', 'Conversão', 'Todas'] },
        { id: 'format', name: 'Formato', type: 'select', required: true, options: ['Resumo', 'Detalhado'], defaultValue: 'Resumo' }
      ],
      outputFormats: ['excel', 'csv', 'json'],
      estimatedTime: '30 segundos'
    },
    {
      id: 'automation_analysis',
      name: 'Análise de Automações',
      description: 'Performance e eficácia dos workflows automatizados',
      category: 'automation',
      fields: [
        { id: 'timeframe', name: 'Período', type: 'select', required: true, options: ['Última semana', 'Último mês', 'Último trimestre'] },
        { id: 'includeErrors', name: 'Incluir Erros', type: 'boolean', required: false, defaultValue: true },
        { id: 'workflowType', name: 'Tipo de Workflow', type: 'select', required: false, options: ['Todos', 'Vendas', 'Estoque', 'Financeiro'] }
      ],
      outputFormats: ['pdf', 'excel'],
      estimatedTime: '1-2 minutos'
    },
    {
      id: 'customer_insights',
      name: 'Insights de Clientes',
      description: 'Análise comportamental e segmentação de clientes',
      category: 'marketing',
      fields: [
        { id: 'segment', name: 'Segmento', type: 'select', required: false, options: ['Todos', 'Premium', 'Regular', 'Novos'] },
        { id: 'includeRetention', name: 'Incluir Retenção', type: 'boolean', required: false, defaultValue: true },
        { id: 'period', name: 'Período de Análise', type: 'select', required: true, options: ['30 dias', '90 dias', '1 ano'] }
      ],
      outputFormats: ['pdf', 'excel'],
      estimatedTime: '3-4 minutos'
    },
    {
      id: 'financial_summary',
      name: 'Resumo Financeiro',
      description: 'Demonstrativo financeiro com receitas, custos e margem',
      category: 'finance',
      fields: [
        { id: 'period', name: 'Período', type: 'select', required: true, options: ['Mensal', 'Trimestral', 'Anual'] },
        { id: 'includeProjections', name: 'Incluir Projeções', type: 'boolean', required: false, defaultValue: false },
        { id: 'detailLevel', name: 'Nível de Detalhe', type: 'select', required: true, options: ['Resumido', 'Detalhado', 'Completo'] }
      ],
      outputFormats: ['pdf', 'excel'],
      estimatedTime: '2-3 minutos'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'operations': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'automation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReport(reportId);
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratingReport(null);
  };

  const handleCreateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowNewReport(true);
  };

  const handleScheduleReport = (reportId: string) => {
    // Implementar lógica de agendamento
    console.log(`Scheduling report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Centro de Relatórios</h3>
          <p className="text-gray-600">Crie, agende e gerencie relatórios personalizados</p>
        </div>
        <Button onClick={() => setShowNewReport(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Relatórios</p>
                <p className="text-xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-xl font-bold">{reports.filter(r => r.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-xl font-bold">{reports.filter(r => r.schedule).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Gerados Hoje</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Relatórios</CardTitle>
          <CardDescription>Gerencie e execute seus relatórios configurados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{report.name}</h4>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    {report.schedule && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {report.schedule.frequency}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {report.lastGenerated && (
                      <span>Último: {new Date(report.lastGenerated).toLocaleString('pt-BR')}</span>
                    )}
                    {report.schedule && (
                      <span>
                        <Mail className="h-3 w-3 inline mr-1" />
                        {report.schedule.recipients.length} destinatários
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingReport === report.id}
                  >
                    {generatingReport === report.id ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleReport(report.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
          <CardDescription>Escolha um template para criar um novo relatório</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Campos</span>
                        <span className="font-medium">{template.fields.length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Formatos</span>
                        <div className="flex gap-1">
                          {template.outputFormats.map((format) => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tempo estimado</span>
                        <span className="font-medium">{template.estimatedTime}</span>
                      </div>
                      
                      <Button
                        onClick={() => handleCreateReport(template)}
                        className="w-full mt-4"
                      >
                        Usar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para novo relatório */}
      <Dialog open={showNewReport} onOpenChange={setShowNewReport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? `Configurar ${selectedTemplate.name}` : 'Novo Relatório'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? 'Configure os parâmetros para gerar seu relatório personalizado'
                : 'Selecione um template ou crie um relatório do zero'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Nome do Relatório</Label>
                <Input 
                  id="report-name" 
                  defaultValue={selectedTemplate.name}
                  placeholder="Digite um nome para o relatório"
                />
              </div>

              <div>
                <Label htmlFor="report-description">Descrição</Label>
                <Textarea 
                  id="report-description" 
                  defaultValue={selectedTemplate.description}
                  placeholder="Descreva o propósito deste relatório"
                  rows={2}
                />
              </div>

              {/* Campos dinâmicos baseados no template */}
              {selectedTemplate.fields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.type === 'select' && field.options ? (
                    <Select defaultValue={field.defaultValue as string}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'boolean' ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch 
                        id={field.id} 
                        defaultChecked={field.defaultValue as boolean}
                      />
                      <Label htmlFor={field.id} className="text-sm text-gray-600">
                        Ativar {field.name.toLowerCase()}
                      </Label>
                    </div>
                  ) : (
                    <Input 
                      id={field.id}
                      type={field.type}
                      defaultValue={field.defaultValue as string}
                      placeholder={`Digite ${field.name.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              {/* Configurações de agendamento */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch id="schedule-report" />
                  <Label htmlFor="schedule-report">Agendar relatório</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="format">Formato</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Formato de saída" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTemplate.outputFormats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="recipients">Destinatários (email)</Label>
                  <Input 
                    id="recipients" 
                    placeholder="email1@empresa.com, email2@empresa.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNewReport(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNewReport(false)}>
                  Criar Relatório
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Selecione um template na lista acima para começar</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}