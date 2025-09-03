import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Activity, DollarSign, Plus, Settings, Target, Trash2, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function CustomEventsPanel() {
  const { data: analytics } = useAnalytics();
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: '',
    description: '',
    value: ''
  });

  // Mock custom events data
  const [customEvents] = useState([
    {
      id: '1',
      name: 'product_calculated',
      category: 'business',
      description: 'Usuário completou um cálculo de precificação',
      triggers: 1247,
      avgValue: 85.50,
      conversionRate: 12.3
    },
    {
      id: '2',
      name: 'upgrade_clicked',
      category: 'conversion',
      description: 'Usuário clicou no botão de upgrade PRO',
      triggers: 89,
      avgValue: 49.90,
      conversionRate: 45.2
    },
    {
      id: '3',
      name: 'export_pdf',
      category: 'feature',
      description: 'Usuário exportou cálculo em PDF',
      triggers: 234,
      avgValue: 0,
      conversionRate: 8.1
    },
    {
      id: '4',
      name: 'share_calculation',
      category: 'engagement',
      description: 'Usuário compartilhou um cálculo',
      triggers: 156,
      avgValue: 0,
      conversionRate: 15.6
    }
  ]);

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.category) {
      toast.error('Nome e categoria são obrigatórios');
      return;
    }

    toast.success('Evento customizado criado com sucesso!');
    
    // Reset form
    setNewEvent({
      name: '',
      category: '',
      description: '',
      value: ''
    });
  };

  const handleTestEvent = (eventName: string, category: string) => {
    toast.success(`Evento "${eventName}" disparado para teste!`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return DollarSign;
      case 'conversion': return Target;
      case 'feature': return Settings;
      case 'engagement': return Users;
      default: return Activity;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-green-100 text-green-800';
      case 'conversion': return 'bg-purple-100 text-purple-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'engagement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Event */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Criar Evento Customizado
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure eventos específicos para tracking de conversões e features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-name">Nome do Evento</Label>
              <Input
                id="event-name"
                placeholder="ex: subscription_upgraded"
                value={newEvent.name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="event-category">Categoria</Label>
              <Select 
                value={newEvent.category} 
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="event-description">Descrição</Label>
              <Textarea
                id="event-description"
                placeholder="Descreva quando este evento deve ser disparado..."
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="event-value">Valor (opcional)</Label>
              <Input
                id="event-value"
                type="number"
                placeholder="0.00"
                value={newEvent.value}
                onChange={(e) => setNewEvent(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateEvent} className="w-full">
                Criar Evento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Customizados Ativos</CardTitle>
          <p className="text-sm text-gray-600">
            Gerencie e monitore seus eventos personalizados
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customEvents.map((event) => {
              const Icon = getCategoryIcon(event.category);
              return (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.name}</h3>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Triggers: {event.triggers}</span>
                        {event.avgValue > 0 && (
                          <span>Valor Médio: R$ {event.avgValue.toFixed(2)}</span>
                        )}
                        <span>Taxa Conversão: {event.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestEvent(event.name, event.category)}
                    >
                      Testar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">
                  {customEvents.reduce((sum, event) => sum + event.triggers, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold">
                  {(customEvents.reduce((sum, event) => sum + event.conversionRate, 0) / customEvents.length).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Events</p>
                <p className="text-2xl font-bold">
                  R$ {customEvents
                    .filter(e => e.avgValue > 0)
                    .reduce((sum, e) => sum + (e.avgValue * e.triggers), 0)
                    .toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
