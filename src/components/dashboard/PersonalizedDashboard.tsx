
import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardGrid from './DashboardGrid';
import WidgetLibrary from './WidgetLibrary';
import DashboardTemplates from './DashboardTemplates';
import DashboardSettings from './DashboardSettings';
import { Layout, Plus, RefreshCw, Settings } from 'lucide-react';

export default function PersonalizedDashboard() {
  const {
    dashboards,
    activeDashboard,
    activeDashboardId,
    setActiveDashboardId,
    updateWidget,
    addWidget,
    removeWidget,
    isLoading
  } = useDashboard();

  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeDashboard) {return;}

    const activeWidget = activeDashboard.widgets.find(w => w.id === active.id);
    if (!activeWidget) {return;}

    // Simplified position update - in a real implementation, you'd calculate grid positions
    const newPosition = {
      x: Math.floor(Math.random() * 8), // Simplified for now
      y: Math.floor(Math.random() * 8)
    };

    updateWidget(activeWidget.id, { position: newPosition });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Layout className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold">Dashboard Personalizado</h1>
          
          <Select value={activeDashboardId} onValueChange={setActiveDashboardId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar dashboard" />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map(dashboard => (
                <SelectItem key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                  {dashboard.isDefault && ' (Padrão)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Biblioteca de Widgets</DialogTitle>
              </DialogHeader>
              <WidgetLibrary onAddWidget={addWidget} onClose={() => setShowWidgetLibrary(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layout className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Templates de Dashboard</DialogTitle>
              </DialogHeader>
              <DashboardTemplates onClose={() => setShowTemplates(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações do Dashboard</DialogTitle>
              </DialogHeader>
              <DashboardSettings dashboard={activeDashboard} onClose={() => setShowSettings(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Description */}
      {activeDashboard?.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">{activeDashboard.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      {activeDashboard ? (
        <DndContext onDragEnd={handleDragEnd}>
          <DashboardGrid
            dashboard={activeDashboard}
            onUpdateWidget={updateWidget}
            onRemoveWidget={removeWidget}
          />
        </DndContext>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Nenhum dashboard selecionado</h3>
          <p className="text-gray-600 mb-4">
            Selecione um dashboard existente ou crie um novo usando os templates.
          </p>
          <Button onClick={() => setShowTemplates(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
}
