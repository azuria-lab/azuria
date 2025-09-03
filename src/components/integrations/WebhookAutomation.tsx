
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AutomationRule, useWebhookAutomation, WebhookConfig } from "@/hooks/useWebhookAutomation";
import { Play, Settings, TestTube, Trash2, Webhook, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function WebhookAutomation() {
  const {
    webhooks,
    automationRules,
    isLoading,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    simulateCalculationEvent,
  } = useWebhookAutomation();

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    active: true,
    retries: 0,
  });

  const [newRule, setNewRule] = useState({
    name: "",
    trigger: 'calculation_completed' as AutomationRule['trigger'],
    conditions: {
      minMargin: undefined as number | undefined,
      maxMargin: undefined as number | undefined,
      categories: [] as string[],
    },
    webhooks: [] as string[],
    active: true,
  });

  const availableEvents = [
    { id: 'calculation_completed', name: 'Cálculo Finalizado' },
    { id: 'price_changed', name: 'Preço Alterado' },
    { id: 'margin_alert', name: 'Alerta de Margem' },
    { id: 'competitor_alert', name: 'Alerta de Concorrência' },
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {return;}
    
    addWebhook(newWebhook);
    setNewWebhook({
      name: "",
      url: "",
      events: [],
      active: true,
      retries: 0,
    });
  };

  const handleAddRule = () => {
    if (!newRule.name || newRule.webhooks.length === 0) {return;}
    
    addAutomationRule(newRule);
    setNewRule({
      name: "",
      trigger: 'calculation_completed',
      conditions: {
        minMargin: undefined,
        maxMargin: undefined,
        categories: [],
      },
      webhooks: [],
      active: true,
    });
  };

  const handleTestAutomation = () => {
    const testData = {
      productName: "Produto Teste",
      cost: 100,
      sellingPrice: 150,
      margin: 33.33,
      category: "Eletrônicos",
      marketplace: "Mercado Livre",
      timestamp: new Date().toISOString(),
    };
    
    simulateCalculationEvent(testData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Automação de Webhooks
        </h2>
        <p className="text-sm text-gray-600">
          Configure webhooks e regras de automação para integrar o Precifica+ com outras ferramentas
        </p>
      </div>

      {/* Adicionar Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Novo Webhook
          </CardTitle>
          <CardDescription>
            Configure um endpoint para receber notificações automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="webhookName">Nome do Webhook</Label>
              <Input
                id="webhookName"
                placeholder="Ex: Zapier Integration"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eventos</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.id}
                    checked={newWebhook.events.includes(event.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewWebhook(prev => ({
                          ...prev,
                          events: [...prev.events, event.id]
                        }));
                      } else {
                        setNewWebhook(prev => ({
                          ...prev,
                          events: prev.events.filter(e => e !== event.id)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={event.id} className="text-sm">
                    {event.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleAddWebhook} className="w-full">
            Adicionar Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Webhooks */}
      {webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {webhook.url}
                        </p>
                        {webhook.lastTriggered && (
                          <p className="text-xs text-gray-400">
                            Último disparo: {webhook.lastTriggered}
                          </p>
                        )}
                      </div>
                      <Badge variant={webhook.active ? "default" : "secondary"}>
                        {webhook.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testWebhook(webhook.id)}
                        disabled={isLoading}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={(checked) => 
                          updateWebhook(webhook.id, { active: checked })
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Adicionar Regra de Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Nova Regra de Automação
          </CardTitle>
          <CardDescription>
            Configure quando e como os webhooks devem ser disparados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Nome da Regra</Label>
              <Input
                id="ruleName"
                placeholder="Ex: Alerta Margem Baixa"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trigger">Evento Gatilho</Label>
              <Select 
                value={newRule.trigger} 
                onValueChange={(value: AutomationRule['trigger']) => 
                  setNewRule(prev => ({ ...prev, trigger: value }))
                }
              >
                <SelectTrigger id="trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id as AutomationRule['trigger']}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minMargin">Margem Mínima (%)</Label>
              <Input
                id="minMargin"
                type="number"
                placeholder="Ex: 20"
                value={newRule.conditions.minMargin || ""}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    minMargin: e.target.value ? Number(e.target.value) : undefined
                  }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxMargin">Margem Máxima (%)</Label>
              <Input
                id="maxMargin"
                type="number"
                placeholder="Ex: 50"
                value={newRule.conditions.maxMargin || ""}
                onChange={(e) => setNewRule(prev => ({
                  ...prev,
                  conditions: {
                    ...prev.conditions,
                    maxMargin: e.target.value ? Number(e.target.value) : undefined
                  }
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhooks para Disparar</Label>
            <div className="space-y-2">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rule-webhook-${webhook.id}`}
                    checked={newRule.webhooks.includes(webhook.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewRule(prev => ({
                          ...prev,
                          webhooks: [...prev.webhooks, webhook.id]
                        }));
                      } else {
                        setNewRule(prev => ({
                          ...prev,
                          webhooks: prev.webhooks.filter(id => id !== webhook.id)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`rule-webhook-${webhook.id}`} className="text-sm">
                    {webhook.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleAddRule} className="w-full">
            Criar Regra de Automação
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Regras */}
      {automationRules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Regras de Automação</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestAutomation}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Testar Automação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automationRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-xs text-gray-500">
                        Gatilho: {availableEvents.find(e => e.id === rule.trigger)?.name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {rule.conditions.minMargin && (
                          <Badge variant="outline" className="text-xs">
                            Min: {rule.conditions.minMargin}%
                          </Badge>
                        )}
                        {rule.conditions.maxMargin && (
                          <Badge variant="outline" className="text-xs">
                            Max: {rule.conditions.maxMargin}%
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {rule.webhooks.length} webhook(s)
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) => 
                          updateAutomationRule(rule.id, { active: checked })
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteAutomationRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
