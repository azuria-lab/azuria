import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  FileText,
  Mail,
  Pause,
  Play,
  Plus,
  Settings,
  Trash2,
  Users
} from 'lucide-react';

interface ReportSchedulerProps {
  reportId?: string;
  reportName?: string;
}

interface ScheduleRule {
  id: string;
  name: string;
  description: string;
  reportId: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  customCron?: string;
  time: string;
  timezone: string;
  recipients: Recipient[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
  creator: string;
  settings: {
    includeCharts: boolean;
    includeRawData: boolean;
    includeComments: boolean;
    autoArchive: boolean;
    sendEmpty: boolean;
  };
}

interface Recipient {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'group' | 'external';
}

export function ReportScheduler({ reportId, reportName }: ReportSchedulerProps) {
  const [schedules, setSchedules] = useState<ScheduleRule[]>([
    {
      id: '1',
      name: 'Relatório Executivo Semanal',
      description: 'Dashboard executivo enviado toda segunda-feira às 8h',
      reportId: 'exec_001',
      reportName: 'Dashboard Executivo',
      frequency: 'weekly',
      time: '08:00',
      timezone: 'America/Sao_Paulo',
      recipients: [
        { id: '1', email: 'ceo@company.com', name: 'João Silva', type: 'user' },
        { id: '2', email: 'executivos@company.com', name: 'Grupo Executivo', type: 'group' }
      ],
      format: 'pdf',
      isActive: true,
      lastRun: new Date('2024-01-15T08:00:00'),
      nextRun: new Date('2024-01-22T08:00:00'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
      creator: 'Admin',
      settings: {
        includeCharts: true,
        includeRawData: false,
        includeComments: true,
        autoArchive: true,
        sendEmpty: false
      }
    },
    {
      id: '2',
      name: 'Vendas Diário',
      description: 'Relatório de vendas do dia anterior',
      reportId: 'sales_001',
      reportName: 'Performance de Vendas',
      frequency: 'daily',
      time: '09:30',
      timezone: 'America/Sao_Paulo',
      recipients: [
        { id: '3', email: 'vendas@company.com', name: 'Equipe de Vendas', type: 'group' }
      ],
      format: 'excel',
      isActive: true,
      lastRun: new Date('2024-01-15T09:30:00'),
      nextRun: new Date('2024-01-16T09:30:00'),
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12'),
      creator: 'Sales Manager',
      settings: {
        includeCharts: true,
        includeRawData: true,
        includeComments: false,
        autoArchive: true,
        sendEmpty: true
      }
    },
    {
      id: '3',
      name: 'Financeiro Mensal',
      description: 'Análise financeira completa no último dia do mês',
      reportId: 'fin_001',
      reportName: 'Análise Financeira',
      frequency: 'monthly',
      time: '18:00',
      timezone: 'America/Sao_Paulo',
      recipients: [
        { id: '4', email: 'financeiro@company.com', name: 'Diretor Financeiro', type: 'user' },
        { id: '5', email: 'contabilidade@company.com', name: 'Contabilidade', type: 'group' }
      ],
      format: 'pdf',
      isActive: false,
      lastRun: new Date('2023-12-31T18:00:00'),
      nextRun: new Date('2024-01-31T18:00:00'),
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-08'),
      creator: 'Finance Team',
      settings: {
        includeCharts: true,
        includeRawData: true,
        includeComments: true,
        autoArchive: true,
        sendEmpty: false
      }
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleRule>>({
    name: '',
    description: '',
    frequency: 'weekly',
    time: '08:00',
    timezone: 'America/Sao_Paulo',
    recipients: [],
    format: 'pdf',
    isActive: true,
    settings: {
      includeCharts: true,
      includeRawData: false,
      includeComments: true,
      autoArchive: true,
      sendEmpty: false
    }
  });

  const frequencies = [
    { value: 'daily', label: 'Diário', description: 'Todos os dias' },
    { value: 'weekly', label: 'Semanal', description: 'Uma vez por semana' },
    { value: 'monthly', label: 'Mensal', description: 'Uma vez por mês' },
    { value: 'quarterly', label: 'Trimestral', description: 'A cada 3 meses' },
    { value: 'custom', label: 'Personalizado', description: 'Expressão CRON customizada' }
  ];

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF', description: 'Documento formatado' },
    { value: 'excel', label: 'Excel', description: 'Planilha com dados' },
    { value: 'csv', label: 'CSV', description: 'Apenas dados brutos' }
  ];

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive, updatedAt: new Date() }
        : schedule
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  const duplicateSchedule = (id: string) => {
    const original = schedules.find(s => s.id === id);
    if (original) {
      const duplicate = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Cópia)`,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSchedules(prev => [...prev, duplicate]);
    }
  };

  const getStatusColor = (schedule: ScheduleRule) => {
    if (!schedule.isActive) {return 'bg-gray-100 text-gray-600';}
    
    const now = new Date();
    const nextRun = new Date(schedule.nextRun);
    const hoursUntilNext = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilNext < 1) {return 'bg-green-100 text-green-700';}
    if (hoursUntilNext < 24) {return 'bg-yellow-100 text-yellow-700';}
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusText = (schedule: ScheduleRule) => {
    if (!schedule.isActive) {return 'Inativo';}
    
    const now = new Date();
    const nextRun = new Date(schedule.nextRun);
    const hoursUntilNext = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilNext < 1) {return 'Executando em breve';}
    if (hoursUntilNext < 24) {return 'Próxima execução hoje';}
    return 'Agendado';
  };

  const formatNextRun = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agendamento de Relatórios</h2>
          <p className="text-gray-600">Configure relatórios automáticos por email</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Agendamento</DialogTitle>
              <DialogDescription>
                Configure quando e como seu relatório será enviado automaticamente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Agendamento</Label>
                  <Input
                    id="name"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Relatório executivo semanal"
                  />
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select 
                    value={newSchedule.format} 
                    onValueChange={(value: 'pdf' | 'excel' | 'csv') => 
                      setNewSchedule(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label} - {format.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva quando e para quem será enviado"
                  rows={2}
                />
              </div>

              {/* Frequência e horário */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select 
                    value={newSchedule.frequency} 
                    onValueChange={(value: any) => setNewSchedule(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select 
                    value={newSchedule.timezone} 
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configurações avançadas */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Configurações do Relatório</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeCharts">Incluir Gráficos</Label>
                    <Switch
                      id="includeCharts"
                      checked={newSchedule.settings?.includeCharts}
                      onCheckedChange={(checked) => 
                        setNewSchedule(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, includeCharts: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeRawData">Incluir Dados Brutos</Label>
                    <Switch
                      id="includeRawData"
                      checked={newSchedule.settings?.includeRawData}
                      onCheckedChange={(checked) => 
                        setNewSchedule(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, includeRawData: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoArchive">Arquivar Automaticamente</Label>
                    <Switch
                      id="autoArchive"
                      checked={newSchedule.settings?.autoArchive}
                      onCheckedChange={(checked) => 
                        setNewSchedule(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, autoArchive: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sendEmpty">Enviar se Vazio</Label>
                    <Switch
                      id="sendEmpty"
                      checked={newSchedule.settings?.sendEmpty}
                      onCheckedChange={(checked) => 
                        setNewSchedule(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, sendEmpty: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Aqui adicionaria a lógica para criar o agendamento
                setShowCreateDialog(false);
              }}>
                Criar Agendamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{schedules.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{schedules.filter(s => s.isActive).length}</div>
                <div className="text-sm text-gray-600">Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {schedules.filter(s => {
                    const hoursUntilNext = (new Date(s.nextRun).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                    return s.isActive && hoursUntilNext < 24;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {schedules.reduce((total, s) => total + s.recipients.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Destinatários</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{schedule.name}</h3>
                      <Badge className={getStatusColor(schedule)}>
                        {getStatusText(schedule)}
                      </Badge>
                      <Badge variant="outline">{schedule.format.toUpperCase()}</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{schedule.description}</p>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Frequência</div>
                        <div className="font-medium capitalize">{schedule.frequency}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Próxima execução</div>
                        <div className="font-medium">{formatNextRun(schedule.nextRun)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Destinatários</div>
                        <div className="font-medium">{schedule.recipients.length} pessoas</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Última execução</div>
                        <div className="font-medium">
                          {schedule.lastRun 
                            ? formatNextRun(schedule.lastRun)
                            : 'Nunca'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Recipients */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">Destinatários:</div>
                      <div className="flex flex-wrap gap-2">
                        {schedule.recipients.slice(0, 3).map(recipient => (
                          <Badge key={recipient.id} variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {recipient.name}
                          </Badge>
                        ))}
                        {schedule.recipients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{schedule.recipients.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateSchedule(schedule.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditDialog(schedule.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={schedule.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSchedule(schedule.id)}
                    >
                      {schedule.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Estado vazio */}
      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento configurado</h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro agendamento para receber relatórios automaticamente por email.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agendamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}