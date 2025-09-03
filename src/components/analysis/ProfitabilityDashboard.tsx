
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart2, CircleDollarSign, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Dados mockados para demonstração
const mockProductData = [
  { name: "Produto A", revenue: 12000, profit: 5200, cost: 6800, margin: 43 },
  { name: "Produto B", revenue: 8500, profit: 3200, cost: 5300, margin: 38 },
  { name: "Produto C", revenue: 17000, profit: 8500, cost: 8500, margin: 50 },
  { name: "Produto D", revenue: 5000, profit: 1500, cost: 3500, margin: 30 },
  { name: "Produto E", revenue: 9800, profit: 4200, cost: 5600, margin: 43 },
  { name: "Produto F", revenue: 14500, profit: 7000, cost: 7500, margin: 48 },
];

const mockCategoryData = [
  { name: "Eletrônicos", revenue: 35000, profit: 14000, cost: 21000, margin: 40 },
  { name: "Vestuário", revenue: 22000, profit: 9200, cost: 12800, margin: 42 },
  { name: "Casa", revenue: 18500, profit: 8325, cost: 10175, margin: 45 },
  { name: "Acessórios", revenue: 12000, profit: 4800, cost: 7200, margin: 40 }
];

const mockTrendData = [
  { month: "Jan", revenue: 23000, profit: 9000 },
  { month: "Fev", revenue: 26000, profit: 10500 },
  { month: "Mar", revenue: 25000, profit: 9800 },
  { month: "Abr", revenue: 29000, profit: 12000 },
  { month: "Mai", revenue: 32000, profit: 13800 },
  { month: "Jun", revenue: 35000, profit: 15500 }
];

// Cores para uso nos gráficos
const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#ED8936", "#805AD5", "#DD6B20"];

interface ProfitabilityDashboardProps {
  type: "overview" | "products" | "categories" | "trends";
}

export default function ProfitabilityDashboard({ type }: ProfitabilityDashboardProps) {
  const [timeRange, setTimeRange] = useState("month");
  
  // KPIs para a visão geral
  const kpis = [
    {
      title: "Receita Total",
      value: "R$ 87.500",
      change: "+12.5%",
      trend: "up",
      icon: <CircleDollarSign className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Lucro Total",
      value: "R$ 34.200",
      change: "+8.3%",
      trend: "up",
      icon: <BarChart2 className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Margem Média",
      value: "39%",
      change: "-2.1%",
      trend: "down",
      icon: <Percent className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Tendência de Crescimento",
      value: "Positiva",
      change: "+5.4%",
      trend: "up",
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Filtros de tempo para relatórios */}
      <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full justify-end">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="week">7 dias</TabsTrigger>
            <TabsTrigger value="month">30 dias</TabsTrigger>
            <TabsTrigger value="quarter">3 meses</TabsTrigger>
            <TabsTrigger value="year">12 meses</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* KPIs na visão geral */}
      {type === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="border-brand-100">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center">
                    {kpi.icon}
                  </div>
                </div>
                <div className={cn(
                  "flex items-center mt-3 text-sm",
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                )}>
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{kpi.change} vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras - Principais produtos/categorias */}
        <Card className="col-span-2 border-brand-100">
          <CardHeader>
            <CardTitle>
              {type === "products" && "Desempenho por Produto"}
              {type === "categories" && "Desempenho por Categoria"}
              {type === "overview" && "Produtos Mais Lucrativos"}
              {type === "trends" && "Tendência de Receita e Lucro"}
            </CardTitle>
            <CardDescription>
              {type === "trends" 
                ? "Evolução mensal de receita e lucro" 
                : "Comparativo de receita, custo e lucro"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {type === "trends" ? (
                  <BarChart
                    data={mockTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Receita" fill="#3182CE" />
                    <Bar dataKey="profit" name="Lucro" fill="#38A169" />
                  </BarChart>
                ) : (
                  <BarChart
                    data={type === "categories" ? mockCategoryData : mockProductData.slice(0, 6)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Receita" fill="#3182CE" />
                    <Bar dataKey="cost" name="Custo" fill="#E53E3E" />
                    <Bar dataKey="profit" name="Lucro" fill="#38A169" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Distribuição de margens */}
        <Card className="border-brand-100">
          <CardHeader>
            <CardTitle>Distribuição de Margens</CardTitle>
            <CardDescription>
              {type === "categories" 
                ? "Margens por categoria de produto" 
                : "Margens por produto individual"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={type === "categories" ? mockCategoryData : mockProductData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="margin"
                  >
                    {(type === "categories" ? mockCategoryData : mockProductData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabela de dados detalhados */}
      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>
            {type === "products" && "Lista de Produtos"}
            {type === "categories" && "Lista de Categorias"}
            {type === "overview" && "Principais Produtos"}
            {type === "trends" && "Dados Mensais"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-right py-3 px-4">Receita</th>
                  <th className="text-right py-3 px-4">Custo</th>
                  <th className="text-right py-3 px-4">Lucro</th>
                  <th className="text-right py-3 px-4">Margem</th>
                </tr>
              </thead>
              <tbody>
                {(type === "categories" ? mockCategoryData : mockProductData).map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="text-right py-3 px-4">R$ {item.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">R$ {item.cost.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">R$ {item.profit.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-medium">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        item.margin >= 45 ? "bg-green-100 text-green-800" :
                        item.margin >= 35 ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      )}>
                        {item.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
