"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Share2,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

// Importar componentes dos sistemas
import BusinessIntelligenceDashboard from './BusinessIntelligenceDashboard';

import { AdvancedReportBuilder } from './reports/AdvancedReportBuilder';
import { ReportTemplateGallery } from './reports/ReportTemplateGallery';
import { ReportExport } from './reports/ReportExport';
import { ReportScheduler } from './reports/ReportScheduler';
import { ReportCollaboration } from './reports/ReportCollaboration';

interface SaasFeatureHubProps {
  className?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'automation' | 'bi' | 'reports';
  action: () => void;
  isPremium?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'automation' | 'report' | 'dashboard' | 'collaboration';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export function SaasFeatureHub({ className }: SaasFeatureHubProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Estatísticas gerais do sistema
  const systemStats = {
    totalAutomations: 24,
    activeAutomations: 18,
    totalReports: 47,
    scheduledReports: 12,
    biDashboards: 8,
    collaborators: 15,
    dataConnections: 6,
    monthlyProcessed: 2847
  };

  // Ações rápidas
  const quickActions: QuickAction[] = [
    {
      id: 'create_automation',
      title: 'Nova Automação',
      description: 'Criar workflow automatizado',
      icon: Bot,
      category: 'automation',
      action: () => setActiveSection('automation')
    },
    {
      id: 'create_report',
      title: 'Novo Relatório',
      description: 'Construir relatório customizado',
      icon: FileText,
      category: 'reports',
      action: () => setActiveSection('reports')
    },
    {
      id: 'view_analytics',
      title: 'Analytics em Tempo Real',
      description: 'Dashboard de performance',
      icon: TrendingUp,
      category: 'bi',
      action: () => setActiveSection('business-intelligence')
    },
    {
      id: 'schedule_report',
      title: 'Agendar Relatório',
      description: 'Configurar envio automático',
      icon: Calendar,
      category: 'reports',
      action: () => setActiveSection('reports')
    },
    {
      id: 'data_connector',
      title: 'Conectar Dados',
      description: 'Integrar nova fonte de dados',
      icon: Database,
      category: 'bi',
      action: () => setActiveSection('business-intelligence'),
      isPremium: true
    },
    {
      id: 'team_collaboration',
      title: 'Colaboração em Equipe',
      description: 'Compartilhar e colaborar',
      icon: Users,
      category: 'reports',
      action: () => setActiveSection('reports')
    }
  ];

  // Atividades recentes
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'automation',
      title: 'Workflow "Processo de Vendas" executado',
      description: 'Processados 47 leads automaticamente',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: 'Sistema',
      status: 'success'
    },
    {
      id: '2',
      type: 'report',
      title: 'Relatório "Vendas Mensais" gerado',
      description: 'Enviado para 8 destinatários',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: 'João Silva',
      status: 'success'
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'Novo comentário no relatório executivo',
      description: 'Maria Santos adicionou comentário',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: 'Maria Santos',
      status: 'info'
    },
    {
      id: '4',
      type: 'automation',
      title: 'Falha na automação "Backup Dados"',
      description: 'Erro de conectividade com servidor',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: 'Sistema',
      status: 'error'
    },
    {
      id: '5',
      type: 'dashboard',
      title: 'Dashboard atualizado com novos KPIs',
      description: 'Adicionadas métricas de satisfação',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      user: 'Pedro Costa',
      status: 'info'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'automation': return Bot;
      case 'report': return FileText;
      case 'dashboard': return BarChart3;
      case 'collaboration': return Users;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'info': return Activity;
      default: return Activity;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 1) {return 'Agora há pouco';}
    if (diffMinutes < 60) {return `${diffMinutes}m atrás`;}
    if (diffHours < 24) {return `${diffHours}h atrás`;}
    return `${Math.floor(diffHours / 24)}d atrás`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Azuria SaaS Platform</h1>
              <p className="text-gray-600 mt-2">
                Automação empresarial, Business Intelligence e Relatórios avançados
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{systemStats.activeAutomations}</div>
                    <div className="text-sm text-gray-600">Automações Ativas</div>
                    <div className="text-xs text-green-600">
                      +{systemStats.totalAutomations - systemStats.activeAutomations} pausadas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{systemStats.totalReports}</div>
                    <div className="text-sm text-gray-600">Relatórios Criados</div>
                    <div className="text-xs text-blue-600">
                      {systemStats.scheduledReports} agendados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{systemStats.biDashboards}</div>
                    <div className="text-sm text-gray-600">Dashboards BI</div>
                    <div className="text-xs text-purple-600">
                      {systemStats.dataConnections} fontes de dados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{systemStats.collaborators}</div>
                    <div className="text-sm text-gray-600">Colaboradores</div>
                    <div className="text-xs text-orange-600">
                      {systemStats.monthlyProcessed.toLocaleString()} processados/mês
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {action.title}
                          {action.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">{action.description}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Atividades Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {recentActivities.map((activity, index) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    const StatusIcon = getStatusIcon(activity.status);
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{activity.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                {activity.user} • {formatTimeAgo(activity.timestamp)}
                              </div>
                            </div>
                            <StatusIcon className={`h-4 w-4 flex-shrink-0 ${getStatusColor(activity.status)}`} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Centro de Automação */}
        <TabsContent value="automation">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold">Centro de Automação</h3>
            <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
          </div>
        </TabsContent>

        {/* Business Intelligence */}
        <TabsContent value="business-intelligence">
          <BusinessIntelligenceDashboard userId="default-user" />
        </TabsContent>

        {/* Sistema de Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sistema de Relatórios Avançados</h2>
              <p className="text-gray-600">Crie, customize e compartilhe relatórios profissionais</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Todos
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
          </div>

          {/* Sub-navegação de Relatórios */}
          <Tabs defaultValue="builder" className="w-full">
            <TabsList>
              <TabsTrigger value="builder">Construtor</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="export">Exportação</TabsTrigger>
              <TabsTrigger value="scheduler">Agendamento</TabsTrigger>
              <TabsTrigger value="collaboration">Colaboração</TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <AdvancedReportBuilder period="30d" />
            </TabsContent>

            <TabsContent value="templates">
              <ReportTemplateGallery 
                onSelectTemplate={(template) => {
                  console.log('Template selecionado:', template);
                  setSelectedReport(template.id);
                }}
              />
            </TabsContent>

                        <TabsContent value="export">
              <ReportExport reportId="sample-report" reportName="Relatório de Exemplo" />
            </TabsContent>

            <TabsContent value="scheduler">
              <ReportScheduler />
            </TabsContent>

            <TabsContent value="collaboration">
              <ReportCollaboration 
                reportId="example_report"
                reportName="Relatório de Exemplo"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}