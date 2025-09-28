import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cloud,
  Database,
  DollarSign,
  Edit,
  Globe,
  Key,
  Link,
  Plus,
  RefreshCw,
  Server,
  Settings,
  ShoppingCart,
  Trash2,
  XCircle,
  Zap
} from 'lucide-react';

interface DataConnectorsProps {
  period: string;
}

interface DataConnector {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'cloud' | 'webhook';
  provider: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  syncFrequency: string;
  recordsCount: number;
  dataType: string[];
  configuration: {
    endpoint?: string;
    database?: string;
    table?: string;
    apiKey?: string;
    username?: string;
    isActive: boolean;
  };
  metrics: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    lastError?: string;
  };
}

interface ConnectorFormData {
  name: string;
  type: string;
  provider: string;
  description: string;
  endpoint: string;
  database: string;
  table: string;
  apiKey: string;
  username: string;
  password: string;
  syncFrequency: string;
}

export function DataConnectors({ period }: DataConnectorsProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<DataConnector | null>(null);

  // Mock data connectors
  const [connectors, setConnectors] = useState<DataConnector[]>([
    {
      id: '1',
      name: 'Mercado Livre API',
      type: 'api',
      provider: 'Mercado Livre',
      description: 'Sincronização de pedidos, produtos e métricas de vendas',
      status: 'connected',
      lastSync: '2024-01-15 14:30:00',
      syncFrequency: 'Cada 15 minutos',
      recordsCount: 15420,
      dataType: ['Pedidos', 'Produtos', 'Clientes'],
      configuration: {
        endpoint: 'https://api.mercadolibre.com/v1',
        apiKey: 'ml_***_key',
        isActive: true
      },
      metrics: {
        uptime: 99.8,
        avgResponseTime: 245,
        errorRate: 0.2,
      }
    },
    {
      id: '2',
      name: 'Base PostgreSQL',
      type: 'database',
      provider: 'PostgreSQL',
      description: 'Base de dados principal com histórico de transações',
      status: 'connected',
      lastSync: '2024-01-15 14:28:00',
      syncFrequency: 'Tempo real',
      recordsCount: 2847593,
      dataType: ['Transações', 'Usuários', 'Produtos'],
      configuration: {
        database: 'azuria_main',
        table: 'transactions',
        username: 'azuria_user',
        isActive: true
      },
      metrics: {
        uptime: 99.95,
        avgResponseTime: 12,
        errorRate: 0.05,
      }
    },
    {
      id: '3',
      name: 'Amazon Seller Central',
      type: 'api',
      provider: 'Amazon',
      description: 'Dados de vendas e inventory da Amazon',
      status: 'syncing',
      lastSync: '2024-01-15 14:15:00',
      syncFrequency: 'A cada hora',
      recordsCount: 8432,
      dataType: ['Vendas', 'Estoque', 'Reviews'],
      configuration: {
        endpoint: 'https://sellingpartnerapi-na.amazon.com',
        apiKey: 'amz_***_key',
        isActive: true
      },
      metrics: {
        uptime: 98.2,
        avgResponseTime: 892,
        errorRate: 1.8,
      }
    },
    {
      id: '4',
      name: 'Google Analytics',
      type: 'api',
      provider: 'Google',
      description: 'Métricas de tráfego e comportamento do usuário',
      status: 'connected',
      lastSync: '2024-01-15 13:45:00',
      syncFrequency: 'Diariamente',
      recordsCount: 124578,
      dataType: ['Tráfego', 'Conversões', 'Sessões'],
      configuration: {
        endpoint: 'https://analyticsreporting.googleapis.com/v4',
        apiKey: 'ga_***_key',
        isActive: true
      },
      metrics: {
        uptime: 99.9,
        avgResponseTime: 156,
        errorRate: 0.1,
      }
    },
    {
      id: '5',
      name: 'Webhook Shopee',
      type: 'webhook',
      provider: 'Shopee',
      description: 'Notificações em tempo real de novos pedidos',
      status: 'error',
      lastSync: '2024-01-15 10:20:00',
      syncFrequency: 'Tempo real',
      recordsCount: 3241,
      dataType: ['Pedidos', 'Status'],
      configuration: {
        endpoint: 'https://partner.shopeemobile.com/api/v2',
        apiKey: 'sp_***_key',
        isActive: false
      },
      metrics: {
        uptime: 87.3,
        avgResponseTime: 445,
        errorRate: 12.7,
        lastError: 'Authentication failed - Invalid API key'
      }
    },
    {
      id: '6',
      name: 'Arquivo CSV Estoque',
      type: 'file',
      provider: 'Arquivo Local',
      description: 'Arquivo CSV com dados de estoque atualizado manualmente',
      status: 'disconnected',
      lastSync: '2024-01-14 18:00:00',
      syncFrequency: 'Manual',
      recordsCount: 1247,
      dataType: ['Estoque'],
      configuration: {
        isActive: false
      },
      metrics: {
        uptime: 95.0,
        avgResponseTime: 0,
        errorRate: 5.0,
      }
    }
  ]);

  const [formData, setFormData] = useState<ConnectorFormData>({
    name: '',
    type: '',
    provider: '',
    description: '',
    endpoint: '',
    database: '',
    table: '',
    apiKey: '',
    username: '',
    password: '',
    syncFrequency: 'hourly'
  });

  // Tipos de conectores
  const connectorTypes = [
    { value: 'all', label: 'Todos', icon: Database },
    { value: 'api', label: 'API', icon: Globe },
    { value: 'database', label: 'Banco de Dados', icon: Database },
    { value: 'file', label: 'Arquivo', icon: Server },
    { value: 'cloud', label: 'Cloud', icon: Cloud },
    { value: 'webhook', label: 'Webhook', icon: Zap }
  ];

  const providers = [
    'Mercado Livre', 'Amazon', 'Shopee', 'Google', 'Facebook',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'Arquivo Local', 'Google Drive', 'AWS S3', 'Azure Blob',
    'Custom API', 'Webhook'
  ];

  const syncFrequencies = [
    { value: 'realtime', label: 'Tempo Real' },
    { value: '15min', label: 'A cada 15 minutos' },
    { value: 'hourly', label: 'A cada hora' },
    { value: 'daily', label: 'Diariamente' },
    { value: 'manual', label: 'Manual' }
  ];

  // Filtrar conectores
  const filteredConnectors = connectors.filter(connector => {
    const matchesType = selectedType === 'all' || connector.type === selectedType;
    const matchesSearch = connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connector.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Estatísticas
  const stats = {
    total: connectors.length,
    connected: connectors.filter(c => c.status === 'connected').length,
    errors: connectors.filter(c => c.status === 'error').length,
    totalRecords: connectors.reduce((sum, c) => sum + c.recordsCount, 0)
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'error': return XCircle;
      case 'disconnected': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = connectorTypes.find(t => t.value === type);
    return typeConfig?.icon || Database;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {return `${(num / 1000000).toFixed(1)}M`;}
    if (num >= 1000) {return `${(num / 1000).toFixed(1)}K`;}
    return num.toString();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  // Actions
  const handleToggleConnector = (id: string) => {
    setConnectors(connectors.map(connector => 
      connector.id === id 
        ? { 
            ...connector, 
            configuration: { 
              ...connector.configuration, 
              isActive: !connector.configuration.isActive 
            },
            status: connector.configuration.isActive ? 'disconnected' : 'connected'
          }
        : connector
    ));
  };

  const handleSyncConnector = (id: string) => {
    setConnectors(connectors.map(connector => 
      connector.id === id 
        ? { 
            ...connector, 
            status: 'syncing',
            lastSync: new Date().toISOString()
          }
        : connector
    ));

    // Simulate sync completion
    setTimeout(() => {
      setConnectors(prev => prev.map(connector => 
        connector.id === id 
          ? { 
              ...connector, 
              status: 'connected',
              lastSync: new Date().toISOString()
            }
          : connector
      ));
    }, 3000);
  };

  const handleDeleteConnector = (id: string) => {
    setConnectors(connectors.filter(connector => connector.id !== id));
  };

  const handleCreateConnector = () => {
    const newConnector: DataConnector = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type as DataConnector['type'],
      provider: formData.provider,
      description: formData.description,
      status: 'disconnected',
      lastSync: '',
      syncFrequency: syncFrequencies.find(f => f.value === formData.syncFrequency)?.label || 'Manual',
      recordsCount: 0,
      dataType: [],
      configuration: {
        endpoint: formData.endpoint,
        database: formData.database,
        table: formData.table,
        apiKey: formData.apiKey,
        username: formData.username,
        isActive: false
      },
      metrics: {
        uptime: 0,
        avgResponseTime: 0,
        errorRate: 0
      }
    };

    setConnectors([...connectors, newConnector]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      provider: '',
      description: '',
      endpoint: '',
      database: '',
      table: '',
      apiKey: '',
      username: '',
      password: '',
      syncFrequency: 'hourly'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Conectores de Dados</h3>
          <p className="text-gray-600">Gerencie suas fontes de dados e integrações</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conector
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Conector</DialogTitle>
              <DialogDescription>
                Configure uma nova fonte de dados para integração
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Conector</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: API Mercado Livre"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectorTypes.slice(1).map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provedor</Label>
                  <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="syncFreq">Frequência de Sincronização</Label>
                  <Select value={formData.syncFrequency} onValueChange={(value) => setFormData({...formData, syncFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {syncFrequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
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
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o que este conector faz..."
                />
              </div>

              {/* Campos condicionais baseados no tipo */}
              {(formData.type === 'api' || formData.type === 'webhook') && (
                <div>
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                    placeholder="https://api.exemplo.com/v1"
                  />
                </div>
              )}

              {formData.type === 'database' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="database">Database</Label>
                    <Input
                      id="database"
                      value={formData.database}
                      onChange={(e) => setFormData({...formData, database: e.target.value})}
                      placeholder="nome_database"
                    />
                  </div>

                  <div>
                    <Label htmlFor="table">Tabela</Label>
                    <Input
                      id="table"
                      value={formData.table}
                      onChange={(e) => setFormData({...formData, table: e.target.value})}
                      placeholder="nome_tabela"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="usuário"
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key / Token</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="***************"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateConnector} disabled={!formData.name || !formData.type}>
                Criar Conector
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de Conectores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
            <div className="text-sm text-gray-600">Conectados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-sm text-gray-600">Com Erro</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalRecords)}</div>
            <div className="text-sm text-gray-600">Registros Totais</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar conectores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {connectorTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lista de Conectores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredConnectors.map((connector, index) => {
            const StatusIcon = getStatusIcon(connector.status);
            const TypeIcon = getTypeIcon(connector.type);
            
            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${!connector.configuration.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="h-8 w-8 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{connector.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {connector.provider} • {connector.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(connector.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {connector.status === 'connected' ? 'Conectado' :
                         connector.status === 'syncing' ? 'Sincronizando' :
                         connector.status === 'error' ? 'Erro' : 'Desconectado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Métricas */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{formatNumber(connector.recordsCount)}</div>
                        <div className="text-xs text-gray-600">Registros</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{connector.metrics.uptime}%</div>
                        <div className="text-xs text-gray-600">Uptime</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{connector.metrics.avgResponseTime}ms</div>
                        <div className="text-xs text-gray-600">Resposta</div>
                      </div>
                    </div>

                    {/* Tipos de dados */}
                    {connector.dataType.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Tipos de Dados:</div>
                        <div className="flex flex-wrap gap-2">
                          {connector.dataType.map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Erro */}
                    {connector.status === 'error' && connector.metrics.lastError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Erro:</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">{connector.metrics.lastError}</p>
                      </div>
                    )}

                    {/* Informações de sincronização */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Frequência: {connector.syncFrequency}</div>
                      {connector.lastSync && (
                        <div>Última sinc: {formatTimestamp(connector.lastSync)}</div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={connector.configuration.isActive}
                          onCheckedChange={() => handleToggleConnector(connector.id)}
                        />
                        <span className="text-sm">
                          {connector.configuration.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncConnector(connector.id)}
                          disabled={connector.status === 'syncing'}
                        >
                          <RefreshCw className={`h-4 w-4 ${connector.status === 'syncing' ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingConnector(connector)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConnector(connector.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estado vazio */}
      {filteredConnectors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conector encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all'
                ? 'Tente ajustar os filtros ou criar um novo conector.'
                : 'Comece criando suas primeiras integrações de dados.'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Conector
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}