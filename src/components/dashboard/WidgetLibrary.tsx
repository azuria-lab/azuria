
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardWidget, WidgetType } from '@/types/dashboard';
import { 
  AlertTriangle, 
  BarChart3, 
  Brain, 
  Calculator, 
  DollarSign, 
  FileEdit, 
  GitCompare,
  Lightbulb,
  PieChart,
  ShoppingCart,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

interface WidgetLibraryProps {
  onAddWidget: (widget: Omit<DashboardWidget, 'id'>) => void;
  onClose: () => void;
}

const AVAILABLE_WIDGETS = [
  {
    type: 'metrics-summary' as WidgetType,
    name: 'Resumo de Métricas',
    description: 'Visão geral das principais métricas em cards',
    icon: BarChart3,
    defaultSize: { w: 6, h: 3 },
    color: 'bg-blue-500'
  },
  {
    type: 'calculations-chart' as WidgetType,
    name: 'Gráfico de Cálculos',
    description: 'Tendência de cálculos ao longo do tempo',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 4 },
    color: 'bg-green-500'
  },
  {
    type: 'recent-calculations' as WidgetType,
    name: 'Cálculos Recentes',
    description: 'Lista dos últimos cálculos realizados',
    icon: Calculator,
    defaultSize: { w: 4, h: 4 },
    color: 'bg-purple-500'
  },
  {
    type: 'revenue-chart' as WidgetType,
    name: 'Gráfico de Receita',
    description: 'Análise da receita potencial por período',
    icon: DollarSign,
    defaultSize: { w: 8, h: 4 },
    color: 'bg-orange-500'
  },
  {
    type: 'user-activity' as WidgetType,
    name: 'Atividade de Usuários',
    description: 'Monitoramento de usuários ativos',
    icon: Users,
    defaultSize: { w: 4, h: 3 },
    color: 'bg-indigo-500'
  },
  {
    type: 'alerts' as WidgetType,
    name: 'Alertas',
    description: 'Notificações e alertas importantes',
    icon: AlertTriangle,
    defaultSize: { w: 6, h: 3 },
    color: 'bg-yellow-500'
  },
  {
    type: 'recommendations' as WidgetType,
    name: 'Recomendações',
    description: 'Sugestões personalizadas baseadas em IA',
    icon: Lightbulb,
    defaultSize: { w: 6, h: 4 },
    color: 'bg-pink-500'
  },
  {
    type: 'competitor-comparison' as WidgetType,
    name: 'Comparação Competitiva',
    description: 'Compare suas métricas com o mercado',
    icon: GitCompare,
    defaultSize: { w: 4, h: 4 },
    color: 'bg-cyan-500'
  },
  {
    type: 'financial-summary' as WidgetType,
    name: 'Resumo Financeiro',
    description: 'Visão geral das finanças do negócio',
    icon: PieChart,
    defaultSize: { w: 6, h: 4 },
    color: 'bg-emerald-500'
  },
  {
    type: 'performance-kpis' as WidgetType,
    name: 'KPIs de Performance',
    description: 'Indicadores chave de performance',
    icon: Target,
    defaultSize: { w: 6, h: 3 },
    color: 'bg-red-500'
  },
  {
    type: 'channel-comparison' as WidgetType,
    name: 'Análise de Canais',
    description: 'Comparativo de performance por canal',
    icon: ShoppingCart,
    defaultSize: { w: 8, h: 4 },
    color: 'bg-violet-500'
  },
  {
    type: 'ai-insights' as WidgetType,
    name: 'Insights da IA',
    description: 'Recomendações inteligentes personalizadas',
    icon: Brain,
    defaultSize: { w: 6, h: 4 },
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    type: 'data-entry-form' as WidgetType,
    name: 'Entrada de Dados',
    description: 'Formulário para inserção manual de dados',
    icon: FileEdit,
    defaultSize: { w: 6, h: 5 },
    color: 'bg-slate-500'
  }
];

export default function WidgetLibrary({ onAddWidget, onClose }: WidgetLibraryProps) {
  const handleAddWidget = (widgetConfig: typeof AVAILABLE_WIDGETS[0]) => {
    const newWidget: Omit<DashboardWidget, 'id'> = {
      type: widgetConfig.type,
      title: widgetConfig.name,
      position: { x: 0, y: 0 }, // Will be positioned automatically
      size: widgetConfig.defaultSize,
      config: {
        period: 'today',
        showLabel: true,
        color: 'brand'
      }
    };

    onAddWidget(newWidget);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_WIDGETS.map((widget) => {
          const Icon = widget.icon;
          return (
            <Card key={widget.type} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${widget.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{widget.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {widget.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Tamanho: {widget.defaultSize.w}x{widget.defaultSize.h}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddWidget(widget)}
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
