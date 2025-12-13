/**
 * =====================================================
 * PRICE MONITORING WIDGET
 * =====================================================
 * Widget compacto para dashboard mostrando status do monitoramento
 * de preços e alertas em tempo real
 * =====================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Bell, CheckCircle2, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import priceMonitoringAgent, { 
  type MonitoringStats, 
  type PriceAlert, 
  type PriceSuggestion 
} from '@/azuria_ai/engines/priceMonitoringAgent';
import { useAuthContext } from '@/domains/auth';

export function PriceMonitoringWidget() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const monitoringStats = priceMonitoringAgent.getMonitoringStats();
      setStats(monitoringStats);
      
      // Buscar alertas não lidos
      if (user?.id) {
        const unreadAlerts = await priceMonitoringAgent.getUnreadAlerts(user.id);
        setAlerts(unreadAlerts.slice(0, 5)); // Top 5
        
        // Buscar sugestões pendentes
        const pendingSuggestions = await priceMonitoringAgent.getPendingSuggestions(user.id);
        setSuggestions(pendingSuggestions.slice(0, 3)); // Top 3
      }
    } catch (error) {
      // eslint-disable-next-line no-console -- Error logging
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const _getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {return AlertCircle;}
    return Bell;
  };

  const handleMarkAsRead = async (alertId: string) => {
    await priceMonitoringAgent.markAlertAsRead(alertId);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    await priceMonitoringAgent.applySuggestion(suggestionId);
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    loadData(); // Recarregar
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Monitor de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Monitor de Preços</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Monitoramento automático de preços e concorrência
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {stats?.isRunning ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {stats?.isRunning ? 'Monitoramento Ativo' : 'Monitoramento Pausado'}
            </span>
          </div>
          <Badge variant={stats?.isRunning ? 'default' : 'secondary'}>
            {stats?.productsMonitored || 0} produtos
          </Badge>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas Recentes
            </h4>
            {alerts.map((alert) => {
              const Icon = getSeverityIcon(alert.severity);
              return (
                <Alert key={alert.id} variant="default" className="py-2">
                  <Icon className="h-4 w-4" />
                  <AlertDescription className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      OK
                    </Button>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sugestões de Ajuste
            </h4>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    De R$ {suggestion.currentPrice.toFixed(2)} → R$ {suggestion.suggestedPrice.toFixed(2)}
                  </span>
                  <Badge variant={suggestion.priceChange < 0 ? 'destructive' : 'default'}>
                    {suggestion.priceChangePercent.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeof suggestion.analysis?.recommendation === 'string' 
                    ? suggestion.analysis.recommendation 
                    : 'Ajuste recomendado'}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApplySuggestion(suggestion.id)}
                  >
                    Aplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await priceMonitoringAgent.rejectSuggestion(suggestion.id);
                      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
                    }}
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.competitorsPricesCollected || 0}</p>
            <p className="text-xs text-muted-foreground">Preços Coletados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.alertsGenerated || 0}</p>
            <p className="text-xs text-muted-foreground">Alertas Gerados</p>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="/price-monitoring">Ver Detalhes</a>
        </Button>
      </CardContent>
    </Card>
  );
}
