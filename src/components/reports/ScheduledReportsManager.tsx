
import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, Mail, Plus, Trash2 } from "lucide-react";
import { useAdvancedExportReports } from "@/hooks/useAdvancedExportReports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleOptions } from "@/types/export";

/**
 * Retorna o label localizado da frequência
 */
function getFrequencyLabel(frequency: string): string {
  if (frequency === 'daily') {return 'Diário';}
  if (frequency === 'weekly') {return 'Semanal';}
  return 'Mensal';
}

interface ScheduleForm {
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  emails: string[];
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
}

export default function ScheduledReportsManager() {
  const { scheduleReport, getScheduledReports, removeScheduledReport } = useAdvancedExportReports();
  type Schedule = {
    id: string;
    reportName: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    emails: string[];
    format: 'pdf' | 'excel' | 'csv';
    enabled: boolean;
    nextExecution: string;
    createdAt: string;
  };
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  
  const [form, setForm] = useState<ScheduleForm>({
    reportName: "",
    frequency: 'weekly',
    time: "09:00",
    emails: [],
    format: 'pdf',
    enabled: true
  });

  const loadScheduledReports = useCallback(() => {
    const reports = getScheduledReports();
    const normalized: Schedule[] = reports.map((r) => ({
      id: r.id,
      reportName: r.reportName,
      frequency: r.frequency,
      time: r.time,
      emails: r.emails,
      format: r.format,
      enabled: r.enabled,
      nextExecution: typeof r.nextExecution === 'string' ? r.nextExecution : r.nextExecution.toISOString(),
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
    }));
    setSchedules(normalized);
  }, [getScheduledReports]);

  useEffect(() => {
    loadScheduledReports();
  }, [loadScheduledReports]);

  // loadScheduledReports is defined above

  const handleAddEmail = () => {
    if (emailInput.trim() && !form.emails.includes(emailInput.trim())) {
      setForm(prev => ({
        ...prev,
        emails: [...prev.emails, emailInput.trim()]
      }));
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setForm(prev => ({
      ...prev,
      emails: prev.emails.filter(e => e !== email)
    }));
  };

  const handleSubmit = async () => {
    if (!form.reportName.trim() || form.emails.length === 0) {
      return;
    }

    // Mock data for demo - in real app, would use actual calculation data
    const mockData = {
      calculations: [],
      summary: {
        totalCalculations: 0,
        avgMargin: 0,
        avgSellingPrice: 0,
        totalRevenue: 0,
        periodLabel: "Relatório Agendado"
      }
    };

    const scheduleOptions: ScheduleOptions = {
      frequency: form.frequency,
      time: form.time,
      emails: form.emails,
      format: form.format,
      enabled: form.enabled
    };

    await scheduleReport(mockData, scheduleOptions, form.reportName);
    
    // Reset form
    setForm({
      reportName: "",
      frequency: 'weekly',
      time: "09:00",
      emails: [],
      format: 'pdf',
      enabled: true
    });
    
    setIsDialogOpen(false);
    loadScheduledReports();
  };

  const handleRemoveSchedule = (id: string) => {
    removeScheduledReport(id);
    loadScheduledReports();
  };

  const getFrequencyBadgeColor = (frequency: string) => {
    const colors = {
      daily: "bg-green-100 text-green-800",
      weekly: "bg-blue-100 text-blue-800", 
      monthly: "bg-purple-100 text-purple-800"
    };
    return colors[frequency as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getFormatIcon = (_format: string) => {
    // Todos os formatos usam o mesmo ícone por enquanto
    return <FileText className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-600" />
              Relatórios Agendados
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configure relatórios automáticos por email
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar Relatório</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportName">Nome do Relatório</Label>
                  <Input
                    id="reportName"
                    placeholder="Ex: Relatório Semanal de Vendas"
                    value={form.reportName}
                    onChange={(e) => setForm(prev => ({ ...prev, reportName: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frequência</Label>
                    <Select 
                      value={form.frequency} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setForm(prev => ({ ...prev, frequency: value }))}
                    >
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
                      value={form.time}
                      onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Formato</Label>
                  <Select 
                    value={form.format} 
                    onValueChange={(value: 'pdf' | 'excel' | 'csv') => setForm(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Avançado</SelectItem>
                      <SelectItem value="excel">Excel (Múltiplas Abas)</SelectItem>
                      <SelectItem value="csv">CSV Simples</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Emails para Envio</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="email@exemplo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                    />
                    <Button type="button" onClick={handleAddEmail} size="sm">
                      Adicionar
                    </Button>
                  </div>
                  
                  {form.emails.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.emails.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={form.enabled}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label htmlFor="enabled">Ativado</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!form.reportName.trim() || form.emails.length === 0}
                  >
                    Agendar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum relatório agendado</p>
            <p className="text-sm">Clique em "Novo Agendamento" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{schedule.reportName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {schedule.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {schedule.emails.length} destinatário(s)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getFrequencyBadgeColor(schedule.frequency)}>
                      {getFrequencyLabel(schedule.frequency)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getFormatIcon(schedule.format)}
                      {schedule.format.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="text-xs text-gray-500">
                  <p>Próxima execução: {format(new Date(schedule.nextExecution), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  <p>Criado em: {format(new Date(schedule.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
