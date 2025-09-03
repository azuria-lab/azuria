
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Dashboard, DashboardTemplate, DashboardWidget } from '@/types/dashboard';
import { useAuthContext } from '@/domains/auth';

// Mock data for now - later will integrate with Supabase
const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Dashboard Principal',
    description: 'Visão geral das métricas principais',
    isDefault: true,
    widgets: [
      {
        id: 'w1',
        type: 'metrics-summary',
        title: 'Métricas Resumo',
        position: { x: 0, y: 0 },
        size: { w: 6, h: 3 },
        config: { period: 'today' }
      },
      {
        id: 'w2',
        type: 'calculations-chart',
        title: 'Cálculos por Período',
        position: { x: 6, y: 0 },
        size: { w: 6, h: 3 },
        config: { period: 'week', chartType: 'line' }
      },
      {
        id: 'w3',
        type: 'recent-calculations',
        title: 'Cálculos Recentes',
        position: { x: 0, y: 3 },
        size: { w: 4, h: 4 },
        config: {}
      }
    ],
    settings: {
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 30000,
      gridSize: 12
    },
    userId: 'user-1',
    isShared: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockTemplates: DashboardTemplate[] = [
  {
    id: 't1',
    name: 'Dashboard de Vendas',
    description: 'Foco em métricas de vendas e receita',
    category: 'sales',
    widgets: [
      {
        type: 'revenue-chart',
        title: 'Receita Mensal',
        position: { x: 0, y: 0 },
        size: { w: 8, h: 4 },
        config: { period: 'month', chartType: 'bar' }
      },
      {
        type: 'metrics-summary',
        title: 'KPIs de Vendas',
        position: { x: 8, y: 0 },
        size: { w: 4, h: 4 },
        config: { metrics: ['revenue', 'conversions', 'margin'] }
      }
    ]
  },
  {
    id: 't2',
    name: 'Dashboard Analítico',
    description: 'Análise detalhada de dados e tendências',
    category: 'analytics',
    widgets: [
      {
        type: 'user-activity',
        title: 'Atividade dos Usuários',
        position: { x: 0, y: 0 },
        size: { w: 6, h: 3 },
        config: { period: 'week' }
      },
      {
        type: 'calculations-chart',
        title: 'Tendência de Cálculos',
        position: { x: 6, y: 0 },
        size: { w: 6, h: 3 },
        config: { chartType: 'line', period: 'month' }
      }
    ]
  }
];

export const useDashboard = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeDashboardId, setActiveDashboardId] = useState<string>('1');

  // Query dashboards
  const { data: dashboards, isLoading } = useQuery({
    queryKey: ['dashboards', user?.id],
    queryFn: async () => {
      // Mock implementation - later replace with Supabase query
      return mockDashboards.filter(d => d.userId === user?.id || d.userId === 'user-1');
    },
    enabled: !!user
  });

  // Query templates
  const { data: templates } = useQuery({
    queryKey: ['dashboard-templates'],
    queryFn: async () => mockTemplates
  });

  // Current active dashboard
  const activeDashboard = dashboards?.find(d => d.id === activeDashboardId);

  // Mutation to update dashboard
  const updateDashboardMutation = useMutation({
    mutationFn: async (dashboard: Dashboard) => {
      // Mock implementation
      console.log('Updating dashboard:', dashboard);
      return dashboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast({ title: "Dashboard atualizado com sucesso!" });
    }
  });

  // Mutation to create dashboard
  const createDashboardMutation = useMutation({
    mutationFn: async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newDashboard: Dashboard = {
        ...dashboard,
        id: `dash-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Creating dashboard:', newDashboard);
      return newDashboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast({ title: "Dashboard criado com sucesso!" });
    }
  });

  // Functions
  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    if (!activeDashboard) {return;}

    const updatedWidgets = activeDashboard.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );

    updateDashboardMutation.mutate({
      ...activeDashboard,
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString()
    });
  }, [activeDashboard, updateDashboardMutation]);

  const addWidget = useCallback((widget: Omit<DashboardWidget, 'id'>) => {
    if (!activeDashboard) {return;}

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}`
    };

    updateDashboardMutation.mutate({
      ...activeDashboard,
      widgets: [...activeDashboard.widgets, newWidget],
      updatedAt: new Date().toISOString()
    });
  }, [activeDashboard, updateDashboardMutation]);

  const removeWidget = useCallback((widgetId: string) => {
    if (!activeDashboard) {return;}

    const updatedWidgets = activeDashboard.widgets.filter(w => w.id !== widgetId);

    updateDashboardMutation.mutate({
      ...activeDashboard,
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString()
    });
  }, [activeDashboard, updateDashboardMutation]);

  const createFromTemplate = useCallback((template: DashboardTemplate, name: string) => {
    if (!user) {return;}

    const widgets: DashboardWidget[] = template.widgets.map((w, index) => ({
      ...w,
      id: `widget-${Date.now()}-${index}`
    }));

    createDashboardMutation.mutate({
      name,
      description: template.description,
      isDefault: false,
      widgets,
      settings: {
        theme: 'light',
        autoRefresh: true,
        refreshInterval: 30000,
        gridSize: 12
      },
      userId: user.id,
      isShared: false
    });
  }, [user, createDashboardMutation]);

  return {
    dashboards: dashboards || [],
    templates: templates || [],
    activeDashboard,
    activeDashboardId,
    isLoading,
    setActiveDashboardId,
    updateWidget,
    addWidget,
    removeWidget,
    createFromTemplate,
    updateDashboard: updateDashboardMutation.mutate,
    createDashboard: createDashboardMutation.mutate,
    isUpdating: updateDashboardMutation.isPending,
    isCreating: createDashboardMutation.isPending
  };
};
