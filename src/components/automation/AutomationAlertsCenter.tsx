
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import { 
  AlertCircle, 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock,
  Filter,
  Search,
  X
} from 'lucide-react';

export function AutomationAlertsCenter() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    alerts, 
    markAlertAsRead, 
    resolveAlert,
    isLoading 
  } = useAdvancedAutomation();

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !alert.is_read) ||
      (filter === 'critical' && alert.severity === 'critical') ||
      (filter === 'resolved' && alert.is_resolved);

    const matchesSearch = !searchTerm || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Bell className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'margin_alert': return 'Alerta de Margem';
      case 'cost_change': return 'Mudança de Custo';
      case 'competitor_price': return 'Preço Concorrente';
      case 'seasonal': return 'Sazonal';
      case 'performance': return 'Performance';
      case 'opportunity': return 'Oportunidade';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Central de Alertas</h2>
          <p className="text-gray-600">
            Monitore alertas automáticos e notificações importantes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unread">Não Lidos</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Ajuste os filtros para ver mais alertas'
                : 'Você não tem alertas no momento'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`transition-all hover:shadow-md ${
                !alert.is_read ? 'border-l-4 border-l-blue-500' : ''
              } ${
                alert.is_resolved ? 'opacity-75' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        {!alert.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Novo
                          </Badge>
                        )}
                        {alert.is_resolved && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Resolvido
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{alert.message}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity === 'critical' ? 'Crítico' :
                       alert.severity === 'high' ? 'Alto' :
                       alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">
                        {getAlertTypeLabel(alert.alert_type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </div>
                    
                    {alert.expires_at && (
                      <div className="text-gray-500">
                        Expira: {new Date(alert.expires_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Lido
                      </Button>
                    )}
                    
                    {!alert.is_resolved && (
                      <Button
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
                
                {alert.notification_channels && alert.notification_channels.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Canais de notificação:</p>
                    <div className="flex gap-1">
                      {alert.notification_channels.map((channel, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
