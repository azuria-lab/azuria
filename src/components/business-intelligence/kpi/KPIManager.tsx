import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Plus,
  ShoppingCart,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';

interface KPIManagerProps {
  period: string;
}

interface KPI {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'sales' | 'operations' | 'marketing' | 'customer';
  currentValue: number;
  targetValue: number;
  unit: string;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'on-track' | 'at-risk' | 'critical';
  lastUpdated: string;
  isActive: boolean;
  alerts: {
    enabled: boolean;
    threshold: number;
    type: 'above' | 'below';
  };
}

interface KPIFormData {
  name: string;
  description: string;
  category: string;
  targetValue: string;
  unit: string;
  format: string;
  alertsEnabled: boolean;
  alertThreshold: string;
  alertType: string;
}

export function KPIManager({ period }: KPIManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // KPIs mock data
  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'Receita Mensal',
      description: 'Receita total do mês corrente',
      category: 'revenue',
      currentValue: 3250000,
      targetValue: 3000000,
      unit: 'R$',
      format: 'currency',
      trend: 'up',
      trendValue: 8.3,
      status: 'on-track',
      lastUpdated: '2024-01-15 14:30',
      isActive: true,
      alerts: { enabled: true, threshold: 90, type: 'below' }
    },
    {
      id: '2',
      name: 'Taxa de Conversão',
      description: 'Percentual de visitantes que realizam compra',
      category: 'sales',
      currentValue: 14.4,
      targetValue: 15.0,
      unit: '%',
      format: 'percentage',
      trend: 'down',
      trendValue: -2.1,
      status: 'at-risk',
      lastUpdated: '2024-01-15 13:45',
      isActive: true,
      alerts: { enabled: true, threshold: 13, type: 'below' }
    },
    {
      id: '3',
      name: 'Automações Ativas',
      description: 'Número de automações funcionando corretamente',
      category: 'operations',
      currentValue: 342,
      targetValue: 350,
      unit: 'unidades',
      format: 'number',
      trend: 'up',
      trendValue: 5.2,
      status: 'on-track',
      lastUpdated: '2024-01-15 15:00',
      isActive: true,
      alerts: { enabled: false, threshold: 300, type: 'below' }
    },
    {
      id: '4',
      name: 'CAC (Custo de Aquisição)',
      description: 'Custo médio para adquirir um novo cliente',
      category: 'marketing',
      currentValue: 89.50,
      targetValue: 85.00,
      unit: 'R$',
      format: 'currency',
      trend: 'up',
      trendValue: 5.3,
      status: 'critical',
      lastUpdated: '2024-01-15 12:20',
      isActive: true,
      alerts: { enabled: true, threshold: 90, type: 'above' }
    },
    {
      id: '5',
      name: 'NPS (Net Promoter Score)',
      description: 'Índice de satisfação e lealdade dos clientes',
      category: 'customer',
      currentValue: 68,
      targetValue: 70,
      unit: 'pontos',
      format: 'number',
      trend: 'stable',
      trendValue: 0.8,
      status: 'at-risk',
      lastUpdated: '2024-01-15 10:15',
      isActive: true,
      alerts: { enabled: true, threshold: 65, type: 'below' }
    },
    {
      id: '6',
      name: 'Tempo Médio de Resposta',
      description: 'Tempo médio para processar pedidos',
      category: 'operations',
      currentValue: 4.2,
      targetValue: 3.5,
      unit: 'horas',
      format: 'number',
      trend: 'down',
      trendValue: -12.5,
      status: 'critical',
      lastUpdated: '2024-01-15 16:00',
      isActive: false,
      alerts: { enabled: true, threshold: 5, type: 'above' }
    }
  ]);

  const [formData, setFormData] = useState<KPIFormData>({
    name: '',
    description: '',
    category: '',
    targetValue: '',
    unit: '',
    format: 'number',
    alertsEnabled: false,
    alertThreshold: '',
    alertType: 'below'
  });

  // Categorias
  const categories = [
    { value: 'all', label: 'Todas', icon: BarChart3 },
    { value: 'revenue', label: 'Receita', icon: DollarSign },
    { value: 'sales', label: 'Vendas', icon: ShoppingCart },
    { value: 'operations', label: 'Operações', icon: Zap },
    { value: 'marketing', label: 'Marketing', icon: TrendingUp },
    { value: 'customer', label: 'Cliente', icon: Users }
  ];

  // Filtrar KPIs
  const filteredKPIs = kpis.filter(kpi => {
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Estatísticas
  const stats = {
    total: kpis.length,
    active: kpis.filter(k => k.isActive).length,
    onTrack: kpis.filter(k => k.status === 'on-track').length,
    atRisk: kpis.filter(k => k.status === 'at-risk').length,
    critical: kpis.filter(k => k.status === 'critical').length
  };

  // Formatar valor
  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `${unit} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value}${unit}`;
      case 'number':
      default:
        return `${value} ${unit}`;
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return CheckCircle;
      case 'at-risk': return AlertTriangle;
      case 'critical': return XCircle;
      default: return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Target;
    }
  };

  // Handlers
  const handleCreateKPI = () => {
    const newKPI: KPI = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category as KPI['category'],
      currentValue: 0,
      targetValue: parseFloat(formData.targetValue),
      unit: formData.unit,
      format: formData.format as KPI['format'],
      trend: 'stable',
      trendValue: 0,
      status: 'on-track',
      lastUpdated: new Date().toLocaleString('pt-BR'),
      isActive: true,
      alerts: {
        enabled: formData.alertsEnabled,
        threshold: parseFloat(formData.alertThreshold || '0'),
        type: formData.alertType as 'above' | 'below'
      }
    };

    setKpis([...kpis, newKPI]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleToggleKPI = (id: string) => {
    setKpis(kpis.map(kpi => 
      kpi.id === id ? { ...kpi, isActive: !kpi.isActive } : kpi
    ));
  };

  const handleDeleteKPI = (id: string) => {
    setKpis(kpis.filter(kpi => kpi.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      targetValue: '',
      unit: '',
      format: 'number',
      alertsEnabled: false,
      alertThreshold: '',
      alertType: 'below'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Gerenciador de KPIs</h3>
          <p className="text-gray-600">Configure e monitore indicadores chave de performance</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo KPI</DialogTitle>
              <DialogDescription>
                Configure um novo indicador de performance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do KPI</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Receita Mensal"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição do que este KPI mede"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="currency">Moeda</SelectItem>
                      <SelectItem value="percentage">Percentual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Meta</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="Ex: R$, %, un"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alerts">Alertas</Label>
                  <Switch
                    id="alerts"
                    checked={formData.alertsEnabled}
                    onCheckedChange={(checked) => setFormData({...formData, alertsEnabled: checked})}
                  />
                </div>

                {formData.alertsEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="threshold">Limite</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={formData.alertThreshold}
                        onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="alertType">Tipo</Label>
                      <Select value={formData.alertType} onValueChange={(value) => setFormData({...formData, alertType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="below">Abaixo de</SelectItem>
                          <SelectItem value="above">Acima de</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateKPI} disabled={!formData.name || !formData.category}>
                Criar KPI
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
            <div className="text-sm text-gray-600">No Alvo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
            <div className="text-sm text-gray-600">Em Risco</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-gray-600">Críticos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lista de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredKPIs.map((kpi, index) => {
            const StatusIcon = getStatusIcon(kpi.status);
            const TrendIcon = getTrendIcon(kpi.trend);
            const progress = (kpi.currentValue / kpi.targetValue) * 100;
            
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${!kpi.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{kpi.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {kpi.description}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(kpi.status)} text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {kpi.status === 'on-track' ? 'No Alvo' : 
                           kpi.status === 'at-risk' ? 'Em Risco' : 'Crítico'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Valor atual vs Meta */}
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-bold">
                          {formatValue(kpi.currentValue, kpi.format, kpi.unit)}
                        </span>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendIcon className={`h-4 w-4 ${
                            kpi.trend === 'up' ? 'text-green-600' : 
                            kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                          <span className={
                            kpi.trend === 'up' ? 'text-green-600' : 
                            kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }>
                            {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Meta: {formatValue(kpi.targetValue, kpi.format, kpi.unit)}
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {progress.toFixed(1)}% da meta
                      </div>
                    </div>

                    {/* Alertas */}
                    {kpi.alerts.enabled && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        Alerta: {kpi.alerts.type === 'below' ? 'Abaixo de' : 'Acima de'} {kpi.alerts.threshold}
                      </div>
                    )}

                    {/* Última atualização */}
                    <div className="text-xs text-gray-500">
                      Atualizado: {kpi.lastUpdated}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={kpi.isActive}
                          onCheckedChange={() => handleToggleKPI(kpi.id)}
                        />
                        <span className="text-sm text-gray-600">
                          {kpi.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingKPI(kpi)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKPI(kpi.id)}
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
      {filteredKPIs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum KPI encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros ou criar um novo KPI.'
                : 'Comece criando seus primeiros indicadores de performance.'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro KPI
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}