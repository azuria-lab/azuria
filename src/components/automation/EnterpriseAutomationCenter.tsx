import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Bot, 
  Building2, 
  Cog, 
  GitBranch, 
  Layout, 
  Plus, 
  Search, 
  Settings, 
  TrendingUp, 
  Users, 
  Workflow, 
  Zap 
} from 'lucide-react';

// Importar componentes existentes
// import { AutomationRulesManager } from './AutomationRulesManager';
import { AutomationWorkflowBuilder } from './AutomationWorkflowBuilder';
import { AutomationAnalytics } from './AutomationAnalytics';

// Novos componentes que vamos criar
import { VisualWorkflowDesigner } from './visual/VisualWorkflowDesigner';
import { EnterpriseTemplateLibrary } from './templates/EnterpriseTemplateLibrary';
import { ApprovalSystemManager } from './approvals/ApprovalSystemManager';
import { IntegrationHubManager } from './integrations/IntegrationHubManager';
import { AutomationGovernance } from './governance/AutomationGovernance';

interface EnterpriseAutomationCenterProps {
  userId?: string;
}

export default function EnterpriseAutomationCenter({ userId: _userId }: EnterpriseAutomationCenterProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Dados simulados para estatísticas
  const stats = {
    totalAutomations: 47,
    activeWorkflows: 32,
    executionsToday: 156,
    successRate: 98.4,
    timeSaved: "24h",
    roisGenerated: "R$ 45.200",
    pendingApprovals: 3,
    integrations: 12
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Centro de Automação Empresarial</h1>
              <p className="text-gray-600">Workflows inteligentes, aprovações e integrações para sua empresa</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-4 w-4" />
            Nova Automação
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Automações Ativas</CardTitle>
            <Bot className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalAutomations}</div>
            <p className="text-xs text-blue-600">+12% vs. mês passado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.successRate}%</div>
            <p className="text-xs text-green-600">Última semana</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Tempo Economizado</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.timeSaved}</div>
            <p className="text-xs text-purple-600">Este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">ROI Gerado</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.roisGenerated}</div>
            <p className="text-xs text-orange-600">Total acumulado</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar automações, workflows, regras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="workflows">Workflows</SelectItem>
            <SelectItem value="rules">Regras</SelectItem>
            <SelectItem value="templates">Templates</SelectItem>
            <SelectItem value="integrations">Integrações</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="visual-designer" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Designer Visual</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Aprovações</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <span className="hidden sm:inline">Governança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AutomationAnalytics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Execuções Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Atualização de Preços ML", status: "success", time: "2 min atrás" },
                      { name: "Alerta Margem Baixa", status: "success", time: "5 min atrás" },
                      { name: "Sync Shopee", status: "running", time: "Em execução" },
                      { name: "Relatório Semanal", status: "success", time: "1h atrás" }
                    ].map((execution, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{execution.name}</p>
                          <p className="text-sm text-gray-600">{execution.time}</p>
                        </div>
                        <Badge 
                          variant={execution.status === 'success' ? 'default' : 
                                  execution.status === 'running' ? 'secondary' : 'destructive'}
                        >
                          {execution.status === 'success' ? 'Sucesso' : 
                           execution.status === 'running' ? 'Executando' : 'Erro'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Aprovações Pendentes
                    {stats.pendingApprovals > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {stats.pendingApprovals}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.pendingApprovals > 0 ? [
                      { workflow: "Ajuste Automático de Preços", requester: "João Silva", time: "2h atrás" },
                      { workflow: "Nova Regra de Desconto", requester: "Maria Santos", time: "4h atrás" },
                      { workflow: "Integração ERP", requester: "Pedro Costa", time: "1 dia atrás" }
                    ].slice(0, stats.pendingApprovals).map((approval, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-medium">{approval.workflow}</p>
                          <p className="text-sm text-gray-600">Por {approval.requester} • {approval.time}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Revisar
                        </Button>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhuma aprovação pendente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visual-designer">
            <VisualWorkflowDesigner />
          </TabsContent>

          <TabsContent value="workflows">
            <AutomationWorkflowBuilder />
          </TabsContent>

          <TabsContent value="templates">
            <EnterpriseTemplateLibrary />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalSystemManager />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationHubManager />
          </TabsContent>

          <TabsContent value="governance">
            <AutomationGovernance />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}