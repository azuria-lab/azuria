
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { AlertSettings, CompetitorAlert } from "@/types/competitorAlerts";
import { ToastAction } from "@/components/ui/toast";

export const useCompetitorAlerts = () => {
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    priceDropThreshold: 5,
    priceIncreaseThreshold: 10,
    enableNotifications: true,
    enableEmailAlerts: false,
    monitoringFrequency: 'hourly'
  });

  const generateMockAlert = useCallback((): CompetitorAlert => {
    return {
      id: Date.now().toString(),
      competitor: `Concorrente ${Math.floor(Math.random() * 5) + 1}`,
      type: Math.random() > 0.5 ? 'price_drop' : 'price_increase',
      currentPrice: 40 + Math.random() * 20,
      previousPrice: 40 + Math.random() * 20,
      timestamp: new Date(),
      severity: Math.random() > 0.6 ? 'high' : 'medium',
      description: 'Mudança de preço detectada automaticamente'
    };
  }, []);

  const simulateInitialAlerts = useCallback(() => {
    const mockAlerts: CompetitorAlert[] = [
      {
        id: '1',
        competitor: 'Concorrente A',
        type: 'price_drop',
        currentPrice: 45.90,
        previousPrice: 52.90,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        severity: 'high',
        description: 'Reduziu preço em 13.2% nas últimas 30 minutos'
      },
      {
        id: '2',
        competitor: 'Marketplace B',
        type: 'new_competitor',
        currentPrice: 48.50,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'medium',
        description: 'Novo vendedor detectado com preço competitivo'
      },
      {
        id: '3',
        competitor: 'Loja C',
        type: 'stock_out',
        currentPrice: 55.00,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        severity: 'low',
        description: 'Produto em falta no estoque - oportunidade de vendas'
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const addNewAlert = useCallback((alert: CompetitorAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    
    if (settings.enableNotifications) {
      const action = React.createElement(
        ToastAction as any,
        { altText: 'Ver detalhes', onClick: () => console.log('Ver alerta:', alert) },
        'Ver detalhes'
      ) as any;

      toast(`🔔 ${alert.competitor}`, {
        description: alert.description,
        action
      });
    }
  }, [settings.enableNotifications]);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AlertSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Simulate real-time alerts
  useEffect(() => {
    simulateInitialAlerts();
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && settings.enableNotifications) {
        const newAlert = generateMockAlert();
        addNewAlert(newAlert);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings.enableNotifications, simulateInitialAlerts, generateMockAlert, addNewAlert]);

  return {
    alerts,
    settings,
    removeAlert,
    clearAllAlerts,
    updateSettings
  };
};
