import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MoreVertical,
  Search,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';

interface AlertsCenterProps {
  period: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'target' | 'system' | 'automation' | 'revenue';
  status: 'active' | 'acknowledged' | 'resolved' | 'archived';
  timestamp: string;
  source: string;
  value?: {
    current: number;
    expected: number;
    unit: string;
  };
  actions?: string[];
  isRead: boolean;
}

export function AlertsCenter({ period }: AlertsCenterProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState<boolean>(false);

  // Mock alerts data
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Meta de Receita em Risco',
      description: 'A receita mensal está 15% abaixo da meta estabelecida',
      severity: 'high',
      type: 'revenue',
      status: 'active',
      timestamp: '2024-01-15 14:30:00',
      source: 'Sistema de Métricas',
      value: {
        current: 2550000,
        expected: 3000000,
        unit: 'R$'
      },
      actions: ['Revisar estratégia de vendas', 'Analisar campanhas de marketing'],
      isRead: false
    },
    {
      id: '2',
      title: 'Automação de Preços Falhando',
      description: '23 produtos sem atualização de preço há mais de 6 horas',
      severity: 'critical',
      type: 'automation',
      status: 'active',
      timestamp: '2024-01-15 12:15:00',
      source: 'Centro de Automação',
      actions: ['Verificar conexões API', 'Reiniciar automações'],
      isRead: false
    },
    {
      id: '3',
      title: 'Queda na Taxa de Conversão',
      description: 'Conversão caiu 12% nas últimas 24 horas',
      severity: 'medium',
      type: 'performance',
      status: 'acknowledged',
      timestamp: '2024-01-15 10:45:00',
      source: 'Analytics Dashboard',
      value: {
        current: 12.8,
        expected: 14.5,
        unit: '%'
      },
      actions: ['Otimizar checkout', 'Revisar páginas de produto'],
      isRead: true
    },
    {
      id: '4',
      title: 'Estoque Crítico Detectado',
      description: '15 produtos com estoque abaixo de 5 unidades',
      severity: 'high',
      type: 'system',
      status: 'active',
      timestamp: '2024-01-15 09:20:00',
      source: 'Gestão de Estoque',
      actions: ['Realizar reposição urgente', 'Ajustar alertas de estoque'],
      isRead: false
    },
    {
      id: '5',
      title: 'CAC Acima do Limite',
      description: 'Custo de aquisição de cliente ultrapassou R$ 90',
      severity: 'medium',
      type: 'target',
      status: 'resolved',
      timestamp: '2024-01-14 16:30:00',
      source: 'Marketing Analytics',
      value: {
        current: 92.5,
        expected: 85.0,
        unit: 'R$'
      },
      actions: ['Otimizar campanhas', 'Revisar segmentação'],
      isRead: true
    },
    {
      id: '6',
      title: 'Tempo de Resposta Elevado',
      description: 'API de pagamentos com latência acima de 3 segundos',
      severity: 'medium',
      type: 'system',
      status: 'active',
      timestamp: '2024-01-14 14:15:00',
      source: 'Monitoramento de Sistema',
      value: {
        current: 3.8,
        expected: 2.0,
        unit: 'segundos'
      },
      actions: ['Verificar infraestrutura', 'Otimizar queries'],
      isRead: true
    },
    {
      id: '7',
      title: 'Satisfação do Cliente Baixa',
      description: 'NPS caiu para 62 pontos, abaixo da meta de 70',
      severity: 'low',
      type: 'target',
      status: 'archived',
      timestamp: '2024-01-13 11:00:00',
      source: 'Pesquisa de Satisfação',
      value: {
        current: 62,
        expected: 70,
        unit: 'pontos'
      },
      actions: ['Melhorar atendimento', 'Revisar processos'],
      isRead: true
    }
  ]);

  // Filtros e configurações
  const severityOptions = [
    { value: 'all', label: 'Todas', color: 'bg-gray-100 text-gray-800' },
    { value: 'low', label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'acknowledged', label: 'Reconhecidos' },
    { value: 'resolved', label: 'Resolvidos' },
    { value: 'archived', label: 'Arquivados' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos', icon: Bell },
    { value: 'performance', label: 'Performance', icon: TrendingDown },
    { value: 'target', label: 'Meta', icon: Target },
    { value: 'system', label: 'Sistema', icon: AlertCircle },
    { value: 'automation', label: 'Automação', icon: Zap },
    { value: 'revenue', label: 'Receita', icon: DollarSign }
  ];

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadFilter = !showOnlyUnread || !alert.isRead;
    
    return matchesSeverity && matchesStatus && matchesType && matchesSearch && matchesReadFilter;
  });

  // Estatísticas
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    unread: alerts.filter(a => !a.isRead).length
  };

  // Helper functions
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return Clock;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    const option = severityOptions.find(s => s.value === severity);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Bell;
      case 'acknowledged': return Eye;
      case 'resolved': return CheckCircle;
      case 'archived': return Archive;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(t => t.value === type);
    return option?.icon || Bell;
  };

  const formatValue = (value: Alert['value']) => {
    if (!value) {return '';}
    return `${value.current} ${value.unit} (esperado: ${value.expected} ${value.unit})`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m atrás`;
    }
  };

  // Actions
  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleMarkAsAcknowledged = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved', isRead: true } : alert
    ));
  };

  const handleArchive = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'archived', isRead: true } : alert
    ));
  };

  const handleBulkAction = (action: string) => {
    if (selectedAlerts.length === 0) {return;}

    switch (action) {
      case 'read':
        setAlerts(alerts.map(alert => 
          selectedAlerts.includes(alert.id) ? { ...alert, isRead: true } : alert
        ));
        break;
      case 'acknowledge':
        setAlerts(alerts.map(alert => 
          selectedAlerts.includes(alert.id) ? { ...alert, status: 'acknowledged' } : alert
        ));
        break;
      case 'resolve':
        setAlerts(alerts.map(alert => 
          selectedAlerts.includes(alert.id) ? { ...alert, status: 'resolved', isRead: true } : alert
        ));
        break;
      case 'archive':
        setAlerts(alerts.map(alert => 
          selectedAlerts.includes(alert.id) ? { ...alert, status: 'archived', isRead: true } : alert
        ));
        break;
    }
    setSelectedAlerts([]);
  };

  const toggleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredAlerts.map(alert => alert.id);
    setSelectedAlerts(visibleIds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Central de Alertas</h3>
          <p className="text-gray-600">Monitore e gerencie alertas em tempo real</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BellOff className="h-4 w-4 mr-2" />
            Pausar Alertas
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de Alertas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-gray-600">Críticos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">Não Lidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alertas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unread"
                  checked={showOnlyUnread}
                  onCheckedChange={(checked) => setShowOnlyUnread(!!checked)}
                />
                <label
                  htmlFor="unread"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apenas não lidos
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações em lote */}
      {selectedAlerts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedAlerts.length} alerta(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                  Marcar como Lido
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('acknowledge')}>
                  Reconhecer
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('resolve')}>
                  Resolver
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                  Arquivar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Button variant="ghost" size="sm" onClick={selectAllVisible}>
              Selecionar Todos Visíveis
            </Button>
            <span>•</span>
            <span>{filteredAlerts.length} alerta(s) encontrado(s)</span>
          </div>
        )}

        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const SeverityIcon = getSeverityIcon(alert.severity);
            const StatusIcon = getStatusIcon(alert.status);
            const TypeIcon = getTypeIcon(alert.type);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''} ${
                  selectedAlerts.includes(alert.id) ? 'ring-2 ring-blue-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={(checked) => checked && toggleSelectAlert(alert.id)}
                        className="mt-1"
                      />

                      {/* Ícone de Severidade */}
                      <div className="flex-shrink-0">
                        <SeverityIcon className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>

                      {/* Conteúdo Principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                              {alert.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.description}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {severityOptions.find(s => s.value === alert.severity)?.label}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusOptions.find(s => s.value === alert.status)?.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Valor atual vs esperado */}
                        {alert.value && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                            <strong>Valor:</strong> {formatValue(alert.value)}
                          </div>
                        )}

                        {/* Ações sugeridas */}
                        {alert.actions && alert.actions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Ações sugeridas:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alert.actions.map((action, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {alert.source}
                            </span>
                            <span>{formatTimestamp(alert.timestamp)}</span>
                          </div>

                          {/* Ações do Alerta */}
                          <div className="flex items-center gap-1">
                            {!alert.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(alert.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {alert.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsAcknowledged(alert.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}

                            {(alert.status === 'active' || alert.status === 'acknowledged') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResolve(alert.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleArchive(alert.id)}
                            >
                              <Archive className="h-3 w-3" />
                            </Button>

                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
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
      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSeverity !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || showOnlyUnread
                ? 'Tente ajustar os filtros para ver mais alertas.'
                : 'Não há alertas no momento. Tudo está funcionando perfeitamente!'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}