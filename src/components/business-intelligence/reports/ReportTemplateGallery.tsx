import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3,
  Calendar,
  Copy,
  DollarSign,
  Eye,
  Filter,
  Heart,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface ReportTemplateGalleryProps {
  onSelectTemplate: (template: ReportTemplate) => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'sales' | 'financial' | 'operations' | 'marketing' | 'custom';
  subcategory?: string;
  preview: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  estimatedTime: string;
  features: string[];
  tags: string[];
  rating: number;
  downloads: number;
  author: string;
  lastUpdated: string;
  isPremium: boolean;
  isFavorite?: boolean;
  components: {
    charts: number;
    tables: number;
    metrics: number;
  };
}

export function ReportTemplateGallery({ onSelectTemplate }: ReportTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Templates disponíveis
  const templates: ReportTemplate[] = [
    {
      id: 'executive_dashboard_v2',
      name: 'Dashboard Executivo Avançado',
      description: 'Dashboard completo com KPIs executivos, tendências de receita e análise de performance por canal',
      category: 'executive',
      subcategory: 'Dashboard',
      preview: '/api/placeholder/400/300',
      difficulty: 'medium',
      estimatedTime: '15 min',
      features: [
        'KPIs em tempo real',
        'Gráficos interativos',
        'Análise de tendências',
        'Comparativo período anterior'
      ],
      tags: ['kpi', 'receita', 'performance', 'executivo'],
      rating: 4.8,
      downloads: 1245,
      author: 'Azuria Team',
      lastUpdated: '2024-01-15',
      isPremium: false,
      isFavorite: true,
      components: { charts: 5, tables: 2, metrics: 8 }
    },
    {
      id: 'sales_performance',
      name: 'Relatório de Performance de Vendas',
      description: 'Análise detalhada de vendas por produto, vendedor e região com projeções mensais',
      category: 'sales',
      subcategory: 'Performance',
      preview: '/api/placeholder/400/300',
      difficulty: 'easy',
      estimatedTime: '10 min',
      features: [
        'Ranking de vendedores',
        'Análise por produto',
        'Projeções mensais',
        'Metas vs realizado'
      ],
      tags: ['vendas', 'ranking', 'metas', 'produtos'],
      rating: 4.6,
      downloads: 892,
      author: 'Sales Team',
      lastUpdated: '2024-01-12',
      isPremium: false,
      isFavorite: false,
      components: { charts: 4, tables: 3, metrics: 6 }
    },
    {
      id: 'financial_analysis',
      name: 'Análise Financeira Completa',
      description: 'Relatório financeiro com DRE, fluxo de caixa, análise de margem e indicadores financeiros',
      category: 'financial',
      subcategory: 'Análise',
      preview: '/api/placeholder/400/300',
      difficulty: 'advanced',
      estimatedTime: '25 min',
      features: [
        'DRE detalhado',
        'Fluxo de caixa',
        'Indicadores financeiros',
        'Análise de margem'
      ],
      tags: ['financeiro', 'dre', 'fluxo', 'margem'],
      rating: 4.9,
      downloads: 567,
      author: 'Finance Team',
      lastUpdated: '2024-01-10',
      isPremium: true,
      isFavorite: false,
      components: { charts: 6, tables: 4, metrics: 12 }
    },
    {
      id: 'operational_metrics',
      name: 'Métricas Operacionais',
      description: 'Dashboard operacional com eficiência de processos, tempo de resposta e qualidade',
      category: 'operations',
      subcategory: 'Métricas',
      preview: '/api/placeholder/400/300',
      difficulty: 'medium',
      estimatedTime: '12 min',
      features: [
        'Eficiência de processos',
        'SLA e tempo de resposta',
        'Qualidade e erros',
        'Capacidade e recursos'
      ],
      tags: ['operações', 'eficiência', 'sla', 'qualidade'],
      rating: 4.7,
      downloads: 723,
      author: 'Ops Team',
      lastUpdated: '2024-01-08',
      isPremium: false,
      isFavorite: true,
      components: { charts: 7, tables: 2, metrics: 10 }
    },
    {
      id: 'marketing_roi',
      name: 'ROI de Marketing e Campanhas',
      description: 'Análise de retorno sobre investimento em marketing, performance de campanhas e conversões',
      category: 'marketing',
      subcategory: 'ROI',
      preview: '/api/placeholder/400/300',
      difficulty: 'medium',
      estimatedTime: '18 min',
      features: [
        'ROI por campanha',
        'Funil de conversão',
        'CAC e LTV',
        'Performance por canal'
      ],
      tags: ['marketing', 'roi', 'conversão', 'campanhas'],
      rating: 4.5,
      downloads: 934,
      author: 'Marketing Team',
      lastUpdated: '2024-01-14',
      isPremium: false,
      isFavorite: false,
      components: { charts: 5, tables: 3, metrics: 7 }
    },
    {
      id: 'automation_analysis',
      name: 'Análise de Automações',
      description: 'Relatório detalhado sobre performance de automações, erros e otimizações',
      category: 'operations',
      subcategory: 'Automação',
      preview: '/api/placeholder/400/300',
      difficulty: 'advanced',
      estimatedTime: '20 min',
      features: [
        'Performance de workflows',
        'Taxa de erro por automação',
        'Tempo de execução',
        'ROI das automações'
      ],
      tags: ['automação', 'workflow', 'erros', 'performance'],
      rating: 4.8,
      downloads: 456,
      author: 'Automation Team',
      lastUpdated: '2024-01-13',
      isPremium: true,
      isFavorite: false,
      components: { charts: 6, tables: 2, metrics: 9 }
    },
    {
      id: 'customer_insights',
      name: 'Insights de Clientes',
      description: 'Segmentação de clientes, análise comportamental e satisfação',
      category: 'marketing',
      subcategory: 'Clientes',
      preview: '/api/placeholder/400/300',
      difficulty: 'easy',
      estimatedTime: '8 min',
      features: [
        'Segmentação RFM',
        'NPS e satisfação',
        'Jornada do cliente',
        'Churn e retenção'
      ],
      tags: ['clientes', 'segmentação', 'nps', 'retenção'],
      rating: 4.4,
      downloads: 678,
      author: 'CX Team',
      lastUpdated: '2024-01-11',
      isPremium: false,
      isFavorite: true,
      components: { charts: 4, tables: 2, metrics: 5 }
    },
    {
      id: 'inventory_control',
      name: 'Controle de Estoque',
      description: 'Análise de níveis de estoque, giro, ruptura e necessidades de reposição',
      category: 'operations',
      subcategory: 'Estoque',
      preview: '/api/placeholder/400/300',
      difficulty: 'easy',
      estimatedTime: '6 min',
      features: [
        'Níveis de estoque',
        'Giro de produtos',
        'Análise ABC',
        'Alertas de ruptura'
      ],
      tags: ['estoque', 'giro', 'abc', 'ruptura'],
      rating: 4.3,
      downloads: 534,
      author: 'Supply Team',
      lastUpdated: '2024-01-09',
      isPremium: false,
      isFavorite: false,
      components: { charts: 3, tables: 4, metrics: 6 }
    }
  ];

  // Categorias
  const categories = [
    { value: 'all', label: 'Todos', icon: LayoutGrid },
    { value: 'executive', label: 'Executivo', icon: TrendingUp },
    { value: 'sales', label: 'Vendas', icon: DollarSign },
    { value: 'financial', label: 'Financeiro', icon: BarChart3 },
    { value: 'operations', label: 'Operações', icon: Zap },
    { value: 'marketing', label: 'Marketing', icon: Users }
  ];

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Ordenar templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || LayoutGrid;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Galeria de Templates</h2>
          <p className="text-gray-600">Escolha um template profissional para criar seu relatório</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar templates..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Populares</SelectItem>
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-gray-600">Templates Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{templates.filter(t => !t.isPremium).length}</div>
            <div className="text-sm text-gray-600">Gratuitos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{templates.filter(t => t.isFavorite).length}</div>
            <div className="text-sm text-gray-600">Favoritos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{filteredTemplates.length}</div>
            <div className="text-sm text-gray-600">Encontrados</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Templates */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {sortedTemplates.map((template, index) => {
            const CategoryIcon = getCategoryIcon(template.category);
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                  viewMode === 'list' ? 'flex' : ''
                }`}>
                  {/* Preview Image */}
                  <div className={`relative ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'
                  } bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    
                    {/* Badges sobrepostos */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {template.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          Premium
                        </Badge>
                      )}
                      {template.isFavorite && (
                        <Badge variant="outline" className="bg-white">
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        </Badge>
                      )}
                    </div>

                    {/* Ações sobrepostas */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPreview(template.id);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(template.difficulty)}`}
                      >
                        {template.difficulty === 'easy' ? 'Fácil' : 
                         template.difficulty === 'medium' ? 'Médio' : 'Avançado'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.estimatedTime}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.subcategory}
                      </Badge>
                    </div>

                    {/* Componentes */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                      <div className="text-center">
                        <BarChart3 className="h-3 w-3 mx-auto mb-1" />
                        <div>{template.components.charts} Gráficos</div>
                      </div>
                      <div className="text-center">
                        <LayoutGrid className="h-3 w-3 mx-auto mb-1" />
                        <div>{template.components.tables} Tabelas</div>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                        <div>{template.components.metrics} KPIs</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        {template.rating}
                      </div>
                      <div>{template.downloads} downloads</div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => onSelectTemplate(template)}
                      >
                        Usar Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(template.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estado vazio */}
      {sortedTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termos de busca para encontrar templates relevantes.
            </p>
            <Button variant="outline" onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSearchTerm('');
            }}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Preview */}
      <Dialog open={!!showPreview} onOpenChange={(open) => !open && setShowPreview(null)}>
        <DialogContent className="max-w-4xl">
          {showPreview && (() => {
            const template = templates.find(t => t.id === showPreview);
            if (!template) {return null;}

            const CategoryIcon = getCategoryIcon(template.category);

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <CategoryIcon className="h-6 w-6" />
                    {template.name}
                    {template.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Premium
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {template.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Preview maior */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="h-24 w-24 text-gray-400" />
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Funcionalidades</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {template.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Informações</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Dificuldade: <span className="font-medium">{template.difficulty}</span></div>
                        <div>Tempo estimado: <span className="font-medium">{template.estimatedTime}</span></div>
                        <div>Avaliação: <span className="font-medium">{template.rating}/5</span></div>
                        <div>Downloads: <span className="font-medium">{template.downloads}</span></div>
                        <div>Autor: <span className="font-medium">{template.author}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPreview(null)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    onSelectTemplate(template);
                    setShowPreview(null);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Usar Este Template
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}