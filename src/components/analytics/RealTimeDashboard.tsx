import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Calculator, Clock, Eye, RefreshCw, Users } from "lucide-react";
import RealTimeMetrics from "./realtime/RealTimeMetrics";
import ActivityFeed from "./realtime/ActivityFeed";
import RealTimeAlerts from "./realtime/RealTimeAlerts";

interface RealTimeMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
  color: string;
}

interface RealTimeActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  value?: number;
  type: "calculation" | "signup" | "upgrade" | "export";
}

export default function RealTimeDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    {
      id: "active_users",
      title: "Usuários Online",
      value: 47,
      change: 12,
      trend: "up",
      icon: Users,
      color: "blue"
    },
    {
      id: "calculations_hour",
      title: "Cálculos/Hora",
      value: 156,
      change: -3,
      trend: "down",
      icon: Calculator,
      color: "green"
    },
    {
      id: "page_views",
      title: "Page Views",
      value: 892,
      change: 45,
      trend: "up",
      icon: Eye,
      color: "purple"
    },
    {
      id: "avg_session",
      title: "Sessão Média",
      value: 8.4,
      change: 1.2,
      trend: "up",
      icon: Clock,
      color: "amber"
    }
  ]);

  const [activities, setActivities] = useState<RealTimeActivity[]>([
    {
      id: "1",
      user: "João Silva",
      action: "Calculou preço de produto",
      timestamp: new Date(Date.now() - 1000 * 30), // 30s ago
      value: 45.50,
      type: "calculation"
    },
    {
      id: "2", 
      user: "Maria Santos",
      action: "Fez upgrade para PRO",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2min ago
      value: 29.90,
      type: "upgrade"
    },
    {
      id: "3",
      user: "Pedro Costa",
      action: "Exportou relatório PDF",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5min ago
      type: "export"
    },
    {
      id: "4",
      user: "Ana Oliveira",
      action: "Criou nova conta",
      timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8min ago
      type: "signup"
    }
  ]);

  // Simular dados em tempo real
  useEffect(() => {
    if (!isLive) {return;}

    const interval = setInterval(() => {
      // Atualizar métricas com pequenas variações
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        change: (Math.random() - 0.5) * 20
      })));

      // Adicionar nova atividade ocasionalmente
      if (Math.random() > 0.7) {
        const newActivity: RealTimeActivity = {
          id: Date.now().toString(),
          user: `Usuário ${Math.floor(Math.random() * 1000)}`,
          action: Math.random() > 0.5 ? "Calculou preço de produto" : "Visitou página inicial",
          timestamp: new Date(),
          type: Math.random() > 0.5 ? "calculation" : "signup"
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Manter apenas 20 atividades
      }

      setLastUpdate(new Date());
    }, 3000); // Atualizar a cada 3 segundos

    return () => clearInterval(interval);
  }, [isLive]);


  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard em Tempo Real</h1>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={isLive ? "default" : "secondary"}
            className={isLive ? "bg-green-500" : ""}
          >
            <Activity className="h-3 w-3 mr-1" />
            {isLive ? "AO VIVO" : "PAUSADO"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "Pausar" : "Retomar"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastUpdate(new Date())}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <RealTimeMetrics metrics={metrics} isLive={isLive} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feed de Atividades */}
        <ActivityFeed activities={activities} />

        {/* Gráfico de Tendência */}
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Tendência de Uso (Última Hora)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { time: "14:00", users: 35, calculations: 120 },
                  { time: "14:15", users: 42, calculations: 145 },
                  { time: "14:30", users: 38, calculations: 132 },
                  { time: "14:45", users: 47, calculations: 156 }
                ]}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Usuários Online"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calculations" 
                    stackId="2" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.6}
                    name="Cálculos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas em Tempo Real */}
      <RealTimeAlerts />
    </div>
  );
}