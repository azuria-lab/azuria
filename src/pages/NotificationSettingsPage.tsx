/**
 * Notification Settings Page
 * 
 * Página para gerenciar configurações de notificações, regras e webhooks
 */

import { useState } from 'react';
import { Bell, Plus, Settings, Webhook as WebhookIcon, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/layout/Layout';
import { NotificationCenter } from '@/components/marketplace/NotificationCenter';

export default function NotificationSettingsPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [stockAlertsEnabled, setStockAlertsEnabled] = useState(true);
  const [salesAlertsEnabled, setSalesAlertsEnabled] = useState(true);
  const [syncAlertsEnabled, setSyncAlertsEnabled] = useState(true);

  return (
    <Layout title="Notificações - Azuria+">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground mt-1">
              Configure alertas, regras e integrações via webhook
            </p>
          </div>
          <NotificationCenter />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Zap className="h-4 w-4 mr-2" />
              Regras
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <WebhookIcon className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          {/* Alertas Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Configuração de Alertas</CardTitle>
                    <CardDescription>
                      Ative ou desative tipos específicos de alertas
                    </CardDescription>
                  </div>
                  <Switch
                    checked={alertsEnabled}
                    onCheckedChange={setAlertsEnabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">
                        Alertas de Preço
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações sobre mudanças de preço e concorrência
                      </p>
                    </div>
                    <Switch
                      checked={priceAlertsEnabled}
                      onCheckedChange={setPriceAlertsEnabled}
                      disabled={!alertsEnabled}
                    />
                  </div>

                  {priceAlertsEnabled && alertsEnabled && (
                    <div className="ml-6 space-y-3 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Mudança de preço concorrente</Label>
                          <p className="text-xs text-muted-foreground">
                            Alerta quando concorrente muda preço em mais de 5%
                          </p>
                        </div>
                        <Badge variant="secondary">+5%</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Preço acima do mercado</Label>
                          <p className="text-xs text-muted-foreground">
                            Alerta quando seu preço está 8% acima da média
                          </p>
                        </div>
                        <Badge variant="secondary">+8%</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Preço abaixo do custo</Label>
                          <p className="text-xs text-muted-foreground">
                            Alerta quando preço está abaixo do custo
                          </p>
                        </div>
                        <Badge variant="destructive">Crítico</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Stock Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">
                        Alertas de Estoque
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações sobre níveis de estoque
                      </p>
                    </div>
                    <Switch
                      checked={stockAlertsEnabled}
                      onCheckedChange={setStockAlertsEnabled}
                      disabled={!alertsEnabled}
                    />
                  </div>

                  {stockAlertsEnabled && alertsEnabled && (
                    <div className="ml-6 space-y-3 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Estoque baixo</Label>
                          <p className="text-xs text-muted-foreground">
                            Alerta quando atinge limite mínimo configurado
                          </p>
                        </div>
                        <Badge variant="secondary">Por produto</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Estoque zerado</Label>
                          <p className="text-xs text-muted-foreground">
                            Alerta crítico quando produto está sem estoque
                          </p>
                        </div>
                        <Badge variant="destructive">Crítico</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Sales Alerts */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Alertas de Vendas
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre pedidos e pagamentos
                    </p>
                  </div>
                  <Switch
                    checked={salesAlertsEnabled}
                    onCheckedChange={setSalesAlertsEnabled}
                    disabled={!alertsEnabled}
                  />
                </div>

                <Separator />

                {/* Sync Alerts */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Alertas de Sincronização
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre falhas na sincronização
                    </p>
                  </div>
                  <Switch
                    checked={syncAlertsEnabled}
                    onCheckedChange={setSyncAlertsEnabled}
                    disabled={!alertsEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regras Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Regras de Notificação</CardTitle>
                    <CardDescription>
                      Configure regras customizadas com condições e ações
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rule 1 */}
                  <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Alerta de Preço Concorrente</h4>
                        <p className="text-sm text-muted-foreground">
                          Notifica quando concorrente reduz preço em mais de 5%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>145 execuções</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Última: há 2h</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Cooldown: 60 min</span>
                    </div>
                  </div>

                  {/* Rule 2 */}
                  <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Estoque Baixo</h4>
                        <p className="text-sm text-muted-foreground">
                          Notifica quando estoque atinge limite mínimo
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>87 execuções</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Última: há 1h</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Cooldown: 120 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>
                      Integre com sistemas externos via HTTP callbacks
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Webhook 1 */}
                  <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">Atualização de Estoque</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Notifica sistema ERP sobre mudanças de estoque
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          https://api.example.com/webhooks/stock-update
                        </code>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>245 chamadas</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-green-600">238 sucessos</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-red-600">7 falhas</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Última: há 1h</span>
                    </div>
                  </div>

                  {/* Webhook 2 */}
                  <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">Slack - Vendas</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Envia notificação no Slack quando há nova venda
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          https://hooks.slack.com/services/T00000000/B00000000/XXX
                        </code>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>523 chamadas</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-green-600">520 sucessos</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-red-600">3 falhas</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Última: há 30 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
