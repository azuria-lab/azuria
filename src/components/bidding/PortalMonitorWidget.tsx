/**
 * @fileoverview Portal Monitor Widget - Widget de alertas de editais
 * 
 * Mostra alertas em tempo real de novos editais detectados
 * pelo Portal Monitor Agent (apenas para usuários PRO/Enterprise)
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  TrendingUp,
} from 'lucide-react';
import portalMonitorAgent, { type GeneratedAlert } from '@/azuria_ai/agents/portalMonitorAgent';
import { useAuthContext } from '@/domains/auth';

export function PortalMonitorWidget() {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([]);
  const [stats, setStats] = useState({
    isRunning: false,
    editaisDetectados: 0,
    alertasGerados: 0,
  });
  const [loading, setLoading] = useState(true);

  // Verifica se usuário tem acesso
  const hasAccess =
    user?.user_metadata?.subscription === 'PRO' ||
    user?.user_metadata?.subscription === 'Enterprise';

  useEffect(() => {
    if (hasAccess) {
      loadData();
      
      // Atualizar a cada 5 minutos
      const interval = setInterval(loadData, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  const loadData = async () => {
    try {
      const monitorStats = portalMonitorAgent.getPortalMonitorStats();
      setStats({
        isRunning: monitorStats.isRunning,
        editaisDetectados: monitorStats.editaisDetectados || 0,
        alertasGerados: monitorStats.alertasGerados || 0,
      });
      
      // NOTE: Em produção, buscar alertas do Supabase
      setAlerts([]);
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Erro ao carregar alertas:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    
    // Em produção, marcar no Supabase
    // await supabase
    //   .from('alerts')
    //   .update({ read: true, read_at: new Date().toISOString() })
    //   .eq('id', alertId);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  // Upgrade required
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            Monitor de Portais
          </CardTitle>
          <CardDescription>Monitoramento 24/7 de editais</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Recurso Premium</strong>
              <br />O monitoramento automático de portais está disponível apenas para
              assinantes PRO e Enterprise.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full mt-4">
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 animate-pulse" />
            Monitor de Portais
          </CardTitle>
          <CardDescription>Carregando alertas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className={`h-5 w-5 ${stats.isRunning ? 'text-green-600 animate-pulse' : 'text-muted-foreground'}`} />
            Monitor de Portais
          </div>
          <Badge variant={stats.isRunning ? 'default' : 'secondary'} className="gap-1">
            {stats.isRunning ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Ativo
              </>
            ) : (
              'Inativo'
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          {stats.editaisDetectados} editais detectados • {stats.alertasGerados} alertas gerados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`border rounded-lg p-4 ${getUrgencyColor(alert.urgency)}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(alert.urgency)}
                      <span className="font-semibold text-sm">{alert.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                      className="h-6 px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs mb-3">{alert.message}</p>
                  
                  {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Ações sugeridas:</p>
                      {alert.suggestedActions.map((action) => (
                        <div key={`${alert.id}-${action.type}-${action.label}`} className="flex items-center gap-2 text-xs">
                          <TrendingUp className="h-3 w-3" />
                          <span>{action.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-2 text-xs"
                  >
                    Ver Edital <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Nenhum alerta no momento. O monitor está ativo e verificando portais
              automaticamente a cada 5 minutos.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button variant="outline" className="w-full gap-2" onClick={loadData}>
          <Bell className="h-4 w-4" />
          Atualizar Alertas
        </Button>
      </CardContent>
    </Card>
  );
}
