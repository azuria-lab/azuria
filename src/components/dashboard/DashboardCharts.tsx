import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { Loader2 } from "lucide-react";

interface DashboardChartsProps {
  period?: number; // 7, 15, 30
}

export function DashboardCharts({ period = 7 }: DashboardChartsProps) {
  const { chartData, isLoading } = useDashboardCharts(period);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho dos Últimos {period} Dias</CardTitle>
        <CardDescription>
          Acompanhe a evolução das suas métricas ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculations">Cálculos</TabsTrigger>
            <TabsTrigger value="savings">Economia</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="time">Tempo</TabsTrigger>
          </TabsList>

          {/* Gráfico de Cálculos */}
          <TabsContent value="calculations">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalculations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calculations"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalculations)"
                  name="Cálculos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Gráfico de Economia */}
          <TabsContent value="savings">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Economia']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Economia (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Gráfico de Produtos */}
          <TabsContent value="products">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="products"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  name="Produtos Analisados"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Gráfico de Tempo */}
          <TabsContent value="time">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: number) => {
                    const hours = Math.floor(value / 60);
                    const minutes = value % 60;
                    return [`${hours}h ${minutes}min`, 'Tempo Economizado'];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTime)"
                  name="Tempo (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
