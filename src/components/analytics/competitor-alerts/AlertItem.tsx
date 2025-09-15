
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompetitorAlert } from "@/types/competitorAlerts";
import { AlertTriangle, Bell, Target, TrendingDown, TrendingUp } from "lucide-react";

interface AlertItemProps {
  alert: CompetitorAlert;
  onRemove: (id: string) => void;
}

export default function AlertItem({ alert, onRemove }: AlertItemProps) {
  const getAlertIcon = (type: CompetitorAlert['type']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'price_increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'new_competitor':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'stock_out':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: CompetitorAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: CompetitorAlert['type']) => {
    switch (type) {
      case 'price_drop':
        return 'Queda de Preço';
      case 'price_increase':
        return 'Aumento de Preço';
      case 'new_competitor':
        return 'Novo Concorrente';
      case 'stock_out':
        return 'Sem Estoque';
      default:
        return 'Alerta';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{alert.competitor}</span>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(alert.type)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {alert.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Preço atual: R$ {alert.currentPrice.toFixed(2)}</span>
              {alert.previousPrice && (
                <span>
                  Anterior: R$ {alert.previousPrice.toFixed(2)}
                </span>
              )}
              <span>{formatTimeAgo(alert.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            Analisar
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs"
            onClick={() => onRemove(alert.id)}
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
