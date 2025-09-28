import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Building2, 
  Calendar, 
  DollarSign, 
  Download, 
  Eye, 
  Filter, 
  Heart, 
  Search, 
  ShoppingCart, 
  Star, 
  Tag, 
  TrendingUp, 
  Users,
  Zap
} from 'lucide-react';

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'pricing' | 'marketplace' | 'alerts' | 'reports' | 'integrations' | 'approvals';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  usageCount: number;
  rating: number;
  tags: string[];
  preview: {
    nodes: number;
    triggers: string[];
    actions: string[];
  };
  template: any; // JSON do template
  isPremium: boolean;
  createdBy: string;
  createdAt: string;
  industry?: string[];
}

export function EnterpriseTemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Templates mock data
  const templates: AutomationTemplate[] = [
    {
      id: 'template_1',
      name: 'Repricing Automático Mercado Livre',
      description: 'Ajusta preços automaticamente baseado na concorrência do Mercado Livre, mantendo margem mínima configurável.',
      category: 'pricing',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
      usageCount: 1240,
      rating: 4.8,
      tags: ['mercado-livre', 'pricing', 'competitor-monitoring'],
      preview: {
        nodes: 6,
        triggers: ['Competitor Price Change', 'Schedule Daily'],
        actions: ['Update Price', 'Send Alert', 'Log Activity']
      },
      template: {},
      isPremium: false,
      createdBy: 'Azuria Team',
      createdAt: '2024-01-15',
      industry: ['ecommerce', 'varejo']
    },
    {
      id: 'template_2',
      name: 'Alerta de Margem Baixa com Aprovação',
      description: 'Monitora margens de lucro e solicita aprovação do gerente quando margem fica abaixo do configurado.',
      category: 'alerts',
      difficulty: 'beginner',
      estimatedTime: '10 min',
      usageCount: 856,
      rating: 4.6,
      tags: ['margin-alert', 'approval', 'notifications'],
      preview: {
        nodes: 4,
        triggers: ['Margin Check'],
        actions: ['Request Approval', 'Send Email', 'Update Status']
      },
      template: {},
      isPremium: false,
      createdBy: 'Azuria Team',
      createdAt: '2024-02-01',
      industry: ['all']
    },
    {
      id: 'template_3',
      name: 'Sincronização Multi-Marketplace',
      description: 'Sincroniza preços e estoques entre múltiplos marketplaces com regras específicas para cada canal.',
      category: 'marketplace',
      difficulty: 'advanced',
      estimatedTime: '30 min',
      usageCount: 423,
      rating: 4.9,
      tags: ['multi-marketplace', 'sync', 'inventory'],
      preview: {
        nodes: 12,
        triggers: ['Product Update', 'Stock Change'],
        actions: ['Sync ML', 'Sync Amazon', 'Sync Shopee', 'Validate Rules']
      },
      template: {},
      isPremium: true,
      createdBy: 'Premium Templates',
      createdAt: '2024-01-20',
      industry: ['ecommerce', 'marketplace']
    },
    {
      id: 'template_4',
      name: 'Relatório Semanal de Performance',
      description: 'Gera e envia relatórios automáticos de performance de vendas e margens para equipe comercial.',
      category: 'reports',
      difficulty: 'intermediate',
      estimatedTime: '20 min',
      usageCount: 678,
      rating: 4.5,
      tags: ['reports', 'performance', 'weekly'],
      preview: {
        nodes: 8,
        triggers: ['Weekly Schedule'],
        actions: ['Generate Report', 'Send Email', 'Save to Drive']
      },
      template: {},
      isPremium: false,
      createdBy: 'Community',
      createdAt: '2024-02-10',
      industry: ['all']
    },
    {
      id: 'template_5',
      name: 'Integração ERP com Aprovação Hierárquica',
      description: 'Sincroniza dados com ERP e implementa fluxo de aprovação hierárquica para alterações críticas.',
      category: 'integrations',
      difficulty: 'advanced',
      estimatedTime: '45 min',
      usageCount: 234,
      rating: 4.7,
      tags: ['erp', 'hierarchy', 'approval-chain'],
      preview: {
        nodes: 15,
        triggers: ['ERP Update', 'Manual Request'],
        actions: ['Validate Data', 'Request L1 Approval', 'Request L2 Approval', 'Sync ERP']
      },
      template: {},
      isPremium: true,
      createdBy: 'Enterprise Solutions',
      createdAt: '2024-01-30',
      industry: ['manufacturing', 'distribution']
    },
    {
      id: 'template_6',
      name: 'Monitoramento de Black Friday',
      description: 'Automação especial para Black Friday com ajustes de preço dinâmicos e alertas de oportunidade.',
      category: 'pricing',
      difficulty: 'advanced',
      estimatedTime: '35 min',
      usageCount: 189,
      rating: 4.9,
      tags: ['black-friday', 'dynamic-pricing', 'seasonal'],
      preview: {
        nodes: 10,
        triggers: ['High Traffic', 'Competitor Change', 'Time Based'],
        actions: ['Dynamic Pricing', 'Stock Alert', 'Performance Tracking']
      },
      template: {},
      isPremium: true,
      createdBy: 'Seasonal Templates',
      createdAt: '2024-02-15',
      industry: ['ecommerce', 'varejo']
    }
  ];

  // Filtros
  const categories = [
    { value: 'all', label: 'Todas as Categorias', icon: Bot },
    { value: 'pricing', label: 'Precificação', icon: DollarSign },
    { value: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { value: 'alerts', label: 'Alertas', icon: Zap },
    { value: 'reports', label: 'Relatórios', icon: TrendingUp },
    { value: 'integrations', label: 'Integrações', icon: Building2 },
    { value: 'approvals', label: 'Aprovações', icon: Users }
  ];

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'beginner', label: 'Iniciante', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avançado', color: 'bg-red-100 text-red-800' }
  ];

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Estatísticas
  const stats = {
    totalTemplates: templates.length,
    premiumTemplates: templates.filter(t => t.isPremium).length,
    totalUsage: templates.reduce((acc, t) => acc + t.usageCount, 0),
    avgRating: templates.reduce((acc, t) => acc + t.rating, 0) / templates.length
  };

  const handleUseTemplate = (template: AutomationTemplate) => {
    // Implementar lógica para usar o template
    console.log('Using template:', template.name);
  };

  const handlePreviewTemplate = (template: AutomationTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    const diffConfig = difficulties.find(d => d.value === difficulty);
    return diffConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = categories.find(c => c.value === category);
    return categoryConfig?.icon || Bot;
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Templates</CardTitle>
            <Bot className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Disponíveis na biblioteca</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Premium</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumTemplates}</div>
            <p className="text-xs text-muted-foreground">Recursos avançados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usos</CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pela comunidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(stats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const CategoryIcon = getCategoryIcon(template.category);
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-100 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {difficulties.find(d => d.value === template.difficulty)?.label}
                          </Badge>
                          {template.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 mb-4 flex-1">{template.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {template.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {template.usageCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(template.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{template.preview.nodes} nós</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1"
                      >
                        Usar Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Dialog de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Preview: {selectedTemplate?.name}
              {selectedTemplate?.isPremium && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Informações do Template</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Categoria:</span>
                      <Badge>{categories.find(c => c.value === selectedTemplate.category)?.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Dificuldade:</span>
                      <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                        {difficulties.find(d => d.value === selectedTemplate.difficulty)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo estimado:</span>
                      <span>{selectedTemplate.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avaliação:</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(selectedTemplate.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span>{selectedTemplate.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Estrutura do Workflow</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de nós:</span>
                      <span>{selectedTemplate.preview.nodes}</span>
                    </div>
                    <div>
                      <span className="font-medium">Gatilhos:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedTemplate.preview.triggers.map((trigger, i) => (
                          <li key={i} className="text-gray-600 text-xs">• {trigger}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Ações:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedTemplate.preview.actions.map((action, i) => (
                          <li key={i} className="text-gray-600 text-xs">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setShowPreview(false);
                }}>
                  Usar Este Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}