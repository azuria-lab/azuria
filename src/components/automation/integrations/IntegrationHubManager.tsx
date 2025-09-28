import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Database,
  Globe,
  Key,
  Link,
  Plus,
  RefreshCw,
  Settings,
  ShoppingCart,
  XCircle,
  Zap
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'marketplace' | 'api' | 'database' | 'cloud';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  config: {
    endpoint?: string;
    apiKey?: string;
    credentials?: Record<string, unknown>;
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    enabledFeatures: string[];
  };
  metrics: {
    requestsToday: number;
    successRate: number;
    avgResponseTime: number;
    dataTransferred: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  type: 'erp' | 'marketplace' | 'api' | 'database' | 'cloud';
  description: string;
  icon: string;
  features: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requiresApproval: boolean;
  documentation: string;
}

export function IntegrationHubManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);

  // Mock data para integrações ativas
  const integrations: Integration[] = [
    {
      id: 'int_1',
      name: 'SAP ERP Integration',
      type: 'erp',
      provider: 'SAP',
      status: 'connected',
      lastSync: '2024-03-15T14:30:00Z',
      config: {
        endpoint: 'https://sap.empresa.com/api',
        syncFrequency: 'hourly',
        enabledFeatures: ['products', 'pricing', 'inventory', 'orders']
      },
      metrics: {
        requestsToday: 234,
        successRate: 98.5,
        avgResponseTime: 450,
        dataTransferred: 2.3
      },
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-15T14:30:00Z'
    },
    {
      id: 'int_2',
      name: 'Mercado Livre API',
      type: 'marketplace',
      provider: 'Mercado Livre',
      status: 'connected',
      lastSync: '2024-03-15T15:45:00Z',
      config: {
        endpoint: 'https://api.mercadolibre.com',
        syncFrequency: 'realtime',
        enabledFeatures: ['products', 'pricing', 'orders', 'questions']
      },
      metrics: {
        requestsToday: 1567,
        successRate: 99.2,
        avgResponseTime: 280,
        dataTransferred: 12.7
      },
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-15T15:45:00Z'
    },
    {
      id: 'int_3',
      name: 'Amazon Seller Central',
      type: 'marketplace',
      provider: 'Amazon',
      status: 'error',
      lastSync: '2024-03-15T10:15:00Z',
      config: {
        endpoint: 'https://sellingpartnerapi-na.amazon.com',
        syncFrequency: 'daily',
        enabledFeatures: ['products', 'pricing', 'inventory']
      },
      metrics: {
        requestsToday: 45,
        successRate: 67.8,
        avgResponseTime: 1200,
        dataTransferred: 0.8
      },
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-03-15T10:15:00Z'
    },
    {
      id: 'int_4',
      name: 'Shopee Seller API',
      type: 'marketplace',
      provider: 'Shopee',
      status: 'syncing',
      lastSync: '2024-03-15T16:00:00Z',
      config: {
        endpoint: 'https://partner.shopeemobile.com',
        syncFrequency: 'hourly',
        enabledFeatures: ['products', 'pricing']
      },
      metrics: {
        requestsToday: 789,
        successRate: 94.3,
        avgResponseTime: 650,
        dataTransferred: 5.2
      },
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-15T16:00:00Z'
    }
  ];

  // Templates de integrações disponíveis
  const integrationTemplates: IntegrationTemplate[] = [
    {
      id: 'template_sap',
      name: 'SAP ERP',
      provider: 'SAP',
      type: 'erp',
      description: 'Integração completa com SAP ERP para sincronização de produtos, preços e estoque',
      icon: '🏢',
      features: ['Produtos', 'Preços', 'Estoque', 'Pedidos', 'Clientes'],
      difficulty: 'hard',
      estimatedTime: '2-4 horas',
      requiresApproval: true,
      documentation: 'https://docs.azuria.com/integrations/sap'
    },
    {
      id: 'template_totvs',
      name: 'TOTVS Protheus',
      provider: 'TOTVS',
      type: 'erp',
      description: 'Conecte com TOTVS Protheus para gestão completa de dados corporativos',
      icon: '🔷',
      features: ['Produtos', 'Preços', 'Estoque', 'Fiscal', 'Financeiro'],
      difficulty: 'hard',
      estimatedTime: '3-5 horas',
      requiresApproval: true,
      documentation: 'https://docs.azuria.com/integrations/totvs'
    },
    {
      id: 'template_mercadolivre',
      name: 'Mercado Livre',
      provider: 'Mercado Livre',
      type: 'marketplace',
      description: 'Sincronização automática com Mercado Livre para gestão de produtos e pedidos',
      icon: '🛒',
      features: ['Produtos', 'Preços', 'Estoque', 'Pedidos', 'Perguntas'],
      difficulty: 'medium',
      estimatedTime: '30-60 minutos',
      requiresApproval: false,
      documentation: 'https://docs.azuria.com/integrations/mercadolivre'
    },
    {
      id: 'template_amazon',
      name: 'Amazon Seller Central',
      provider: 'Amazon',
      type: 'marketplace',
      description: 'Integração com Amazon para gerenciar seus produtos na maior plataforma mundial',
      icon: '📦',
      features: ['Produtos', 'Preços', 'Estoque', 'Pedidos', 'FBA'],
      difficulty: 'medium',
      estimatedTime: '1-2 horas',
      requiresApproval: false,
      documentation: 'https://docs.azuria.com/integrations/amazon'
    },
    {
      id: 'template_shopee',
      name: 'Shopee Seller',
      provider: 'Shopee',
      type: 'marketplace',
      description: 'Conecte com Shopee para vender na plataforma que mais cresce no Brasil',
      icon: '🛍️',
      features: ['Produtos', 'Preços', 'Promoções', 'Chat'],
      difficulty: 'easy',
      estimatedTime: '20-40 minutos',
      requiresApproval: false,
      documentation: 'https://docs.azuria.com/integrations/shopee'
    },
    {
      id: 'template_webhook',
      name: 'Webhook Personalizado',
      provider: 'Custom',
      type: 'api',
      description: 'Crie integrações personalizadas usando webhooks para qualquer sistema',
      icon: '🔗',
      features: ['Eventos', 'Callbacks', 'Autenticação', 'Logs'],
      difficulty: 'hard',
      estimatedTime: '1-3 horas',
      requiresApproval: false,
      documentation: 'https://docs.azuria.com/integrations/webhook'
    }
  ];

  // Estatísticas
  const stats = {
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter(i => i.status === 'connected').length,
    totalRequests: integrations.reduce((acc, i) => acc + i.metrics.requestsToday, 0),
    avgSuccessRate: integrations.reduce((acc, i) => acc + i.metrics.successRate, 0) / integrations.length,
    dataTransferred: integrations.reduce((acc, i) => acc + i.metrics.dataTransferred, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'error': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'erp': return Database;
      case 'marketplace': return ShoppingCart;
      case 'api': return Zap;
      case 'cloud': return Cloud;
      default: return Globe;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateIntegration = (template: IntegrationTemplate) => {
    // Implementar lógica de criação de integração
    setSelectedTemplate(template);
    setShowNewIntegration(true);
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    // Implementar lógica de ativar/desativar integração
    // TODO: Implementar API call para toggle de integração
    if (enabled) {
      // Lógica para ativar integração
    } else {
      // Lógica para desativar integração
    }
    // Simulação de toggle para integração específica
    const _targetIntegration = integrations.find(i => i.id === integrationId);
    // Atualizar estado da integração
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Link className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">Integrações configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIntegrations}</div>
            <p className="text-xs text-muted-foreground">Funcionando normalmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Hoje</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">APIs chamadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dataTransferred.toFixed(1)} GB</div>
            <p className="text-xs text-muted-foreground">Transferidos hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Integrações Ativas
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status das Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => {
              const StatusIcon = getStatusIcon(integration.status);
              const TypeIcon = getTypeIcon(integration.type);
              
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-100 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-brand-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <p className="text-sm text-gray-600">{integration.provider}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {integration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Requests hoje</p>
                            <p className="font-semibold">{integration.metrics.requestsToday}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Taxa de sucesso</p>
                            <p className="font-semibold">{integration.metrics.successRate}%</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <Switch
                            checked={integration.status === 'connected'}
                            onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                            disabled={integration.status === 'syncing'}
                          />
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {integrations.filter(i => i.status === 'connected').map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider} • {integration.type.toUpperCase()}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Sync: {integration.config.syncFrequency}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">{integration.metrics.requestsToday}</div>
                      <div className="text-xs text-blue-600">Requests hoje</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">{integration.metrics.successRate}%</div>
                      <div className="text-xs text-green-600">Taxa de sucesso</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-900">{integration.metrics.avgResponseTime}ms</div>
                      <div className="text-xs text-yellow-600">Tempo médio</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">{integration.metrics.dataTransferred} GB</div>
                      <div className="text-xs text-purple-600">Dados hoje</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recursos Habilitados</h4>
                    <div className="flex flex-wrap gap-2">
                      {integration.config.enabledFeatures.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Marketplace de Integrações</h3>
              <p className="text-gray-600">Conecte com ERPs, marketplaces e APIs de terceiros</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.provider}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {template.type}
                      </Badge>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                      {template.requiresApproval && (
                        <Badge variant="secondary">
                          <Key className="h-3 w-3 mr-1" />
                          Aprovação
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-600 mb-4 flex-1">{template.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Recursos</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 4).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.features.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Tempo estimado: {template.estimatedTime}
                      </div>

                      <Button 
                        onClick={() => handleCreateIntegration(template)}
                        className="w-full"
                      >
                        Conectar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Globais</CardTitle>
              <CardDescription>Configure preferências gerais para todas as integrações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-retry">Retry Automático</Label>
                  <p className="text-sm text-gray-600">Tentar novamente automaticamente em caso de falha</p>
                </div>
                <Switch id="auto-retry" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detailed-logs">Logs Detalhados</Label>
                  <p className="text-sm text-gray-600">Registrar informações detalhadas de debugging</p>
                </div>
                <Switch id="detailed-logs" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout Padrão (segundos)</Label>
                <Input id="timeout" type="number" defaultValue="30" className="w-32" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-retries">Máximo de Tentativas</Label>
                <Select defaultValue="3">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para nova integração */}
      <Dialog open={showNewIntegration} onOpenChange={setShowNewIntegration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Configure os parâmetros para conectar com {selectedTemplate?.provider}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Sobre esta integração</h4>
                <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-600">• {selectedTemplate.estimatedTime}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="integration-name">Nome da Integração</Label>
                  <Input 
                    id="integration-name" 
                    defaultValue={selectedTemplate.name}
                    placeholder="Digite um nome para identificar esta integração"
                  />
                </div>

                <div>
                  <Label htmlFor="endpoint">Endpoint da API</Label>
                  <Input 
                    id="endpoint" 
                    placeholder="https://api.exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">Chave da API</Label>
                  <Input 
                    id="api-key" 
                    type="password"
                    placeholder="Sua chave de API"
                  />
                </div>

                <div>
                  <Label htmlFor="sync-frequency">Frequência de Sincronização</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Tempo Real</SelectItem>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowNewIntegration(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNewIntegration(false)}>
                  {selectedTemplate.requiresApproval ? 'Solicitar Aprovação' : 'Criar Integração'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}