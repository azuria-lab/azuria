import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Cog, Eye, FileEdit, ShoppingCart, Target } from 'lucide-react';
import { DashboardTemplate, DashboardWidget } from '@/types/dashboard';

interface DashboardTemplateSelectorProps {
  onSelectTemplate: (template: DashboardTemplate) => void;
  userPlan: string;
}

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'ecommerce-complete',
    name: 'E-commerce Completo',
    description: 'Dashboard completo para vendedores online com métricas financeiras, análise de canais e insights de IA',
    category: 'sales',
    widgets: [
      {
        type: 'financial-summary',
        title: 'Resumo Financeiro',
        position: { x: 0, y: 0 },
        size: { w: 6, h: 4 },
        config: { period: 'month', showLabel: true }
      },
      {
        type: 'performance-kpis',
        title: 'KPIs de Performance',
        position: { x: 6, y: 0 },
        size: { w: 6, h: 3 },
        config: { period: 'month', showLabel: true }
      },
      {
        type: 'channel-comparison',
        title: 'Análise de Canais',
        position: { x: 0, y: 4 },
        size: { w: 8, h: 4 },
        config: { period: 'month', chartType: 'bar' }
      },
      {
        type: 'ai-insights',
        title: 'Insights da IA',
        position: { x: 8, y: 4 },
        size: { w: 4, h: 4 },
        config: { period: 'month', showLabel: true }
      },
      {
        type: 'data-entry-form',
        title: 'Entrada de Dados',
        position: { x: 6, y: 3 },
        size: { w: 6, h: 5 },
        config: { showLabel: true }
      }
    ]
  },
  {
    id: 'analytics-focused',
    name: 'Foco em Analytics',
    description: 'Para usuários que querem acompanhar métricas e tendências detalhadas',
    category: 'analytics',
    widgets: [
      {
        type: 'metrics-summary',
        title: 'Resumo de Métricas',
        position: { x: 0, y: 0 },
        size: { w: 6, h: 3 },
        config: { period: 'today', showLabel: true }
      },
      {
        type: 'calculations-chart',
        title: 'Tendência de Cálculos',
        position: { x: 6, y: 0 },
        size: { w: 6, h: 4 },
        config: { period: 'week', chartType: 'line' }
      },
      {
        type: 'revenue-chart',
        title: 'Análise de Receita',
        position: { x: 0, y: 3 },
        size: { w: 8, h: 4 },
        config: { period: 'month', chartType: 'line' }
      },
      {
        type: 'competitor-comparison',
        title: 'Comparação Competitiva',
        position: { x: 8, y: 3 },
        size: { w: 4, h: 4 },
        config: { period: 'month', showLabel: true }
      }
    ]
  },
  {
    id: 'operations-simple',
    name: 'Operações Simplificado',
    description: 'Dashboard básico para acompanhar operações diárias',
    category: 'operations',
    widgets: [
      {
        type: 'recent-calculations',
        title: 'Cálculos Recentes',
        position: { x: 0, y: 0 },
        size: { w: 6, h: 4 },
        config: { showLabel: true }
      },
      {
        type: 'user-activity',
        title: 'Atividade',
        position: { x: 6, y: 0 },
        size: { w: 3, h: 3 },
        config: { period: 'today', showLabel: true }
      },
      {
        type: 'alerts',
        title: 'Alertas',
        position: { x: 9, y: 0 },
        size: { w: 3, h: 3 },
        config: { showLabel: true }
      },
      {
        type: 'recommendations',
        title: 'Recomendações',
        position: { x: 6, y: 3 },
        size: { w: 6, h: 4 },
        config: { showLabel: true }
      }
    ]
  },
  {
    id: 'premium-complete',
    name: 'Premium Completo',
    description: 'Dashboard avançado com todos os recursos e integração automática',
    category: 'overview',
    widgets: [
      {
        type: 'financial-summary',
        title: 'Resumo Financeiro',
        position: { x: 0, y: 0 },
        size: { w: 4, h: 4 },
        config: { period: 'month', showLabel: true }
      },
      {
        type: 'performance-kpis',
        title: 'KPIs',
        position: { x: 4, y: 0 },
        size: { w: 4, h: 3 },
        config: { period: 'month', showLabel: true }
      },
      {
        type: 'ai-insights',
        title: 'IA Insights',
        position: { x: 8, y: 0 },
        size: { w: 4, h: 3 },
        config: { showLabel: true }
      },
      {
        type: 'channel-comparison',
        title: 'Análise de Canais',
        position: { x: 0, y: 4 },
        size: { w: 6, h: 4 },
        config: { period: 'month', chartType: 'bar' }
      },
      {
        type: 'revenue-chart',
        title: 'Receita',
        position: { x: 6, y: 4 },
        size: { w: 6, h: 4 },
        config: { period: 'month', chartType: 'line' }
      },
      {
        type: 'data-entry-form',
        title: 'Entrada de Dados',
        position: { x: 4, y: 3 },
        size: { w: 8, h: 5 },
        config: { showLabel: true }
      }
    ]
  }
];

export default function DashboardTemplateSelector({ onSelectTemplate, userPlan }: DashboardTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return ShoppingCart;
      case 'analytics': return BarChart3;
      case 'operations': return Cog;
      case 'overview': return Eye;
      default: return BarChart3;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'bg-green-500';
      case 'analytics': return 'bg-blue-500';
      case 'operations': return 'bg-purple-500';
      case 'overview': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? DASHBOARD_TEMPLATES 
    : DASHBOARD_TEMPLATES.filter(t => t.category === selectedCategory);

  const isTemplateAvailable = (templateId: string) => {
    if (templateId === 'premium-complete') {
      return userPlan === 'premium';
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </Button>
        <Button
          variant={selectedCategory === 'sales' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('sales')}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Vendas
        </Button>
        <Button
          variant={selectedCategory === 'analytics' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Analytics
        </Button>
        <Button
          variant={selectedCategory === 'operations' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('operations')}
        >
          <Cog className="h-4 w-4 mr-1" />
          Operações
        </Button>
        <Button
          variant={selectedCategory === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('overview')}
        >
          <Eye className="h-4 w-4 mr-1" />
          Visão Geral
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = getCategoryIcon(template.category);
          const available = isTemplateAvailable(template.id);
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !available ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  {template.id === 'premium-complete' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {template.widgets.slice(0, 3).map((widget, index) => {
                      const widgetIcons = {
                        'financial-summary': BarChart3,
                        'performance-kpis': Target,
                        'ai-insights': Brain,
                        'data-entry-form': FileEdit,
                        'channel-comparison': ShoppingCart
                      };
                      const WidgetIcon = widgetIcons[widget.type as keyof typeof widgetIcons] || BarChart3;
                      
                      return (
                        <div key={index} className="p-1 bg-gray-100 rounded">
                          <WidgetIcon className="h-3 w-3 text-gray-600" />
                        </div>
                      );
                    })}
                    {template.widgets.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{template.widgets.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => available && onSelectTemplate(template)}
                    disabled={!available}
                  >
                    {available ? 'Usar Template' : 'Premium Necessário'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}