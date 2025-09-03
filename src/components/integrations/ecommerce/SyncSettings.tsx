
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncSettings as SyncSettingsType } from "@/types/ecommerce";
import { Bell, Calculator, Settings } from "lucide-react";

interface SyncSettingsProps {
  settings: SyncSettingsType;
  onUpdateSettings: (newSettings: Partial<SyncSettingsType>) => void;
}

export default function SyncSettings({ settings, onUpdateSettings }: SyncSettingsProps) {
  const updatePriceRules = (key: string, value: any) => {
    onUpdateSettings({
      priceRules: {
        ...settings.priceRules,
        [key]: value
      }
    });
  };

  const updateNotifications = (key: string, value: any) => {
    onUpdateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure como a sincronização deve funcionar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sincronização Automática</Label>
              <p className="text-sm text-gray-600">
                Sincronizar preços automaticamente em intervalos regulares
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => onUpdateSettings({ autoSync: checked })}
            />
          </div>

          {settings.autoSync && (
            <div className="space-y-2">
              <Label htmlFor="syncInterval">Intervalo de Sincronização (minutos)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="15"
                max="1440"
                value={settings.syncInterval}
                onChange={(e) => onUpdateSettings({ syncInterval: parseInt(e.target.value) || 60 })}
                className="w-32"
              />
              <p className="text-xs text-gray-500">
                Mínimo: 15 minutos, Máximo: 24 horas (1440 minutos)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regras de preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Regras de Preço
          </CardTitle>
          <CardDescription>
            Configure como os preços devem ser calculados durante a sincronização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aplicar Margem de Lucro</Label>
              <p className="text-sm text-gray-600">
                Calcular preço de venda baseado no custo + margem
              </p>
            </div>
            <Switch
              checked={settings.priceRules.applyMargin}
              onCheckedChange={(checked) => updatePriceRules('applyMargin', checked)}
            />
          </div>

          {settings.priceRules.applyMargin && (
            <div className="space-y-2">
              <Label htmlFor="marginPercentage">Margem de Lucro (%)</Label>
              <Input
                id="marginPercentage"
                type="number"
                min="0"
                max="1000"
                value={settings.priceRules.marginPercentage || ''}
                onChange={(e) => updatePriceRules('marginPercentage', parseFloat(e.target.value) || 0)}
                className="w-32"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arredondar Preços</Label>
              <p className="text-sm text-gray-600">
                Arredondar preços para duas casas decimais
              </p>
            </div>
            <Switch
              checked={settings.priceRules.roundPrices}
              onCheckedChange={(checked) => updatePriceRules('roundPrices', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumPrice">Preço Mínimo (R$)</Label>
              <Input
                id="minimumPrice"
                type="number"
                min="0"
                step="0.01"
                value={settings.priceRules.minimumPrice || ''}
                onChange={(e) => updatePriceRules('minimumPrice', parseFloat(e.target.value) || undefined)}
                placeholder="Ex: 10.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumPrice">Preço Máximo (R$)</Label>
              <Input
                id="maximumPrice"
                type="number"
                min="0"
                step="0.01"
                value={settings.priceRules.maximumPrice || ''}
                onChange={(e) => updatePriceRules('maximumPrice', parseFloat(e.target.value) || undefined)}
                placeholder="Ex: 1000.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure quando você quer ser notificado sobre sincronizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificar Sincronizações Bem-sucedidas</Label>
              <p className="text-sm text-gray-600">
                Receber notificação quando preços forem sincronizados com sucesso
              </p>
            </div>
            <Switch
              checked={settings.notifications.onSuccess}
              onCheckedChange={(checked) => updateNotifications('onSuccess', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificar Erros de Sincronização</Label>
              <p className="text-sm text-gray-600">
                Receber notificação quando houver erro na sincronização
              </p>
            </div>
            <Switch
              checked={settings.notifications.onError}
              onCheckedChange={(checked) => updateNotifications('onError', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationEmail">E-mail para Notificações</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={settings.notifications.email || ''}
              onChange={(e) => updateNotifications('email', e.target.value)}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-gray-500">
              Deixe em branco para usar notificações no navegador
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de preço calculado */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 Exemplo de Cálculo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="space-y-2 text-blue-700">
            <p><strong>Produto:</strong> Exemplo - Custo R$ 50,00</p>
            {settings.priceRules.applyMargin && settings.priceRules.marginPercentage && (
              <p><strong>Com margem de {settings.priceRules.marginPercentage}%:</strong> R$ {(50 * (1 + settings.priceRules.marginPercentage / 100)).toFixed(2)}</p>
            )}
            {settings.priceRules.minimumPrice && (
              <p><strong>Preço mínimo aplicado:</strong> R$ {Math.max(settings.priceRules.minimumPrice, settings.priceRules.applyMargin && settings.priceRules.marginPercentage ? 50 * (1 + settings.priceRules.marginPercentage / 100) : 50).toFixed(2)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
