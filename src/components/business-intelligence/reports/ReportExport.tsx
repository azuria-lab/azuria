import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  Settings
} from 'lucide-react';

interface ReportExportProps {
  reportId: string;
  reportName: string;
}

interface ExportOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  formats: ExportFormat[];
  features: string[];
}

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  size: string;
  quality: 'low' | 'medium' | 'high';
}

interface ExportHistory {
  id: string;
  name: string;
  format: string;
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
}

export function ReportExport({ reportId, reportName }: ReportExportProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeData: true,
    includeFilters: false,
    highResolution: true,
    embedFonts: true,
    password: '',
    watermark: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly',
    time: '09:00',
    recipients: '',
    enabled: false
  });

  // Opções de exportação disponíveis
  const exportFormats: ExportOption[] = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: FileText,
      description: 'Documento PDF para visualização e impressão',
      formats: [
        { id: 'pdf_standard', name: 'PDF Padrão', extension: 'pdf', size: '~2MB', quality: 'medium' },
        { id: 'pdf_high', name: 'PDF Alta Qualidade', extension: 'pdf', size: '~5MB', quality: 'high' },
        { id: 'pdf_compact', name: 'PDF Compacto', extension: 'pdf', size: '~800KB', quality: 'low' }
      ],
      features: ['Preserva formatação', 'Suporta gráficos', 'Protegido por senha', 'Marca d\'água']
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: FileSpreadsheet,
      description: 'Planilha Excel para análise de dados',
      formats: [
        { id: 'xlsx', name: 'Excel (.xlsx)', extension: 'xlsx', size: '~1.5MB', quality: 'high' },
        { id: 'csv', name: 'CSV', extension: 'csv', size: '~500KB', quality: 'medium' },
        { id: 'xls', name: 'Excel Legado (.xls)', extension: 'xls', size: '~2MB', quality: 'medium' }
      ],
      features: ['Dados editáveis', 'Fórmulas incluídas', 'Múltiplas abas', 'Gráficos dinâmicos']
    },
    {
      id: 'image',
      name: 'Imagem',
      icon: FileImage,
      description: 'Imagem para apresentações e documentos',
      formats: [
        { id: 'png', name: 'PNG', extension: 'png', size: '~3MB', quality: 'high' },
        { id: 'jpg', name: 'JPEG', extension: 'jpg', size: '~1MB', quality: 'medium' },
        { id: 'svg', name: 'SVG', extension: 'svg', size: '~200KB', quality: 'high' }
      ],
      features: ['Alta resolução', 'Transparência (PNG)', 'Vetorial (SVG)', 'Compressão otimizada']
    }
  ];

  // Histórico de exportações
  const [exportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      name: 'Dashboard Executivo - Janeiro 2024',
      format: 'PDF',
      size: '2.3 MB',
      createdAt: '2024-01-15 14:30',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Relatório de Vendas - Dezembro 2023',
      format: 'Excel',
      size: '1.8 MB',
      createdAt: '2024-01-10 09:15',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'KPIs Mensais - Janeiro 2024',
      format: 'PNG',
      size: '2.1 MB',
      createdAt: '2024-01-08 16:45',
      status: 'failed'
    },
    {
      id: '4',
      name: 'Análise de Performance - Q4 2023',
      format: 'PDF',
      size: '4.2 MB',
      createdAt: '2024-01-05 11:20',
      status: 'processing'
    }
  ]);

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simular processo de exportação
    const steps = [
      'Coletando dados...',
      'Gerando gráficos...',
      'Processando tabelas...',
      'Aplicando formatação...',
      'Criando arquivo final...',
      'Finalizando...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExportProgress(((i + 1) / steps.length) * 100);
    }

    setIsExporting(false);
    
    // Simular download
    const fileName = `${reportName}_${new Date().toISOString().split('T')[0]}.${selectedFormatData?.formats[0].extension}`;
    console.log('Iniciando download:', fileName);
  };

  const handleScheduleExport = () => {
    setShowScheduleDialog(false);
    console.log('Agendamento configurado:', scheduleConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'processing': return Loader2;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Exportar Relatório</h3>
          <p className="text-gray-600">Configure e exporte "{reportName}" em diferentes formatos</p>
        </div>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Exportação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Exportação Automática</DialogTitle>
              <DialogDescription>
                Configure a exportação automática deste relatório
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={scheduleConfig.frequency} onValueChange={(value) => setScheduleConfig({...scheduleConfig, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig({...scheduleConfig, time: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="recipients">Destinatários (emails separados por vírgula)</Label>
                <Input
                  id="recipients"
                  value={scheduleConfig.recipients}
                  onChange={(e) => setScheduleConfig({...scheduleConfig, recipients: e.target.value})}
                  placeholder="email1@empresa.com, email2@empresa.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleScheduleExport}>
                Confirmar Agendamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Formato */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formato de Exportação</CardTitle>
              <CardDescription>Escolha o formato mais adequado para suas necessidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.id;
                  
                  return (
                    <motion.div
                      key={format.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 border-blue-500' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center space-y-3">
                            <Icon className={`h-12 w-12 mx-auto ${
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <h3 className="font-medium">{format.name}</h3>
                              <p className="text-sm text-gray-600">{format.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {format.features.slice(0, 2).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Opções de Formato Específico */}
          {selectedFormatData && (
            <Card>
              <CardHeader>
                <CardTitle>Opções de {selectedFormatData.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Qualidade</Label>
                  <Select defaultValue={selectedFormatData.formats[0].id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFormatData.formats.map(format => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.name} - {format.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeCharts" 
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) => setExportOptions({
                        ...exportOptions, 
                        includeCharts: checked === true
                      })}
                    />
                    <Label htmlFor="includeCharts">Incluir Gráficos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeData" 
                      checked={exportOptions.includeData}
                      onCheckedChange={(checked) => setExportOptions({
                        ...exportOptions, 
                        includeData: checked === true
                      })}
                    />
                    <Label htmlFor="includeData">Incluir Dados</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="highResolution" 
                      checked={exportOptions.highResolution}
                      onCheckedChange={(checked) => setExportOptions({
                        ...exportOptions, 
                        highResolution: checked === true
                      })}
                    />
                    <Label htmlFor="highResolution">Alta Resolução</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="embedFonts" 
                      checked={exportOptions.embedFonts}
                      onCheckedChange={(checked) => setExportOptions({
                        ...exportOptions, 
                        embedFonts: checked === true
                      })}
                    />
                    <Label htmlFor="embedFonts">Incorporar Fontes</Label>
                  </div>
                </div>

                {selectedFormat === 'pdf' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="password">Proteger com Senha (opcional)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={exportOptions.password}
                        onChange={(e) => setExportOptions({
                          ...exportOptions, 
                          password: e.target.value
                        })}
                        placeholder="Digite uma senha"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="watermark" 
                        checked={exportOptions.watermark}
                        onCheckedChange={(checked) => setExportOptions({
                          ...exportOptions, 
                          watermark: checked === true
                        })}
                      />
                      <Label htmlFor="watermark">Adicionar Marca d'água</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Processo de Exportação */}
          {isExporting && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Exportando Relatório</h3>
                    <p className="text-sm text-gray-600">
                      Processando dados e gerando arquivo...
                    </p>
                  </div>
                  <Progress value={exportProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-xs text-gray-500">{Math.round(exportProgress)}% concluído</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Ações e Histórico */}
        <div className="space-y-4">
          {/* Ações */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar Agora'}
              </Button>

              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>

              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
            </CardContent>
          </Card>

          {/* Preview das Funcionalidades */}
          {selectedFormatData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funcionalidades Incluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedFormatData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exportações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory.slice(0, 4).map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const statusColor = getStatusColor(item.status);
                  
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-2 rounded border">
                      <StatusIcon className={`h-4 w-4 mt-0.5 ${statusColor} ${
                        item.status === 'processing' ? 'animate-spin' : ''
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.format} • {item.size}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {item.downloadUrl && item.status === 'completed' && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={item.downloadUrl} download>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}