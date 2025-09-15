
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, CheckCircle, Download, Filter, Target } from "lucide-react";

export default function MarginAnalysis() {

  // Distribuição de margem
  const marginDistribution = [
    { range: '0-10%', count: 23, color: '#EF4444' },
    { range: '10-20%', count: 45, color: '#F59E0B' },
    { range: '20-30%', count: 78, color: '#10B981' },
    { range: '30-40%', count: 34, color: '#3B82F6' },
    { range: '40%+', count: 12, color: '#8B5CF6' }
  ];

  // Análise por produto
  const productAnalysis = [
    {
      produto: 'Smartphone Galaxy',
      categoria: 'Eletrônicos',
      margem: 18.5,
      volume: 145,
      receita: 24500,
      potencial: 22.8,
      status: 'warning'
    },
    {
      produto: 'Tênis Nike Air',
      categoria: 'Esporte',
      margem: 34.2,
      volume: 89,
      receita: 18900,
      potencial: 38.1,
      status: 'good'
    },
    {
      produto: 'Notebook Dell',
      categoria: 'Eletrônicos',
      margem: 15.7,
      volume: 67,
      receita: 45600,
      potencial: 19.2,
      status: 'critical'
    },
    {
      produto: 'Vestido Casual',
      categoria: 'Moda',
      margem: 42.3,
      volume: 234,
      receita: 12800,
      potencial: 45.7,
      status: 'excellent'
    },
    {
      produto: 'Cafeteira Expresso',
      categoria: 'Casa',
      margem: 28.9,
      volume: 56,
      receita: 8900,
      potencial: 33.4,
      status: 'good'
    }
  ];

  // Correlação margem vs volume
  const correlationData = productAnalysis.map(item => ({
    margem: item.margem,
    volume: item.volume,
    produto: item.produto,
    receita: item.receita
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'warning': return 'Atenção';
      case 'critical': return 'Crítico';
      default: return 'Normal';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Análise de Margem</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Margem Média Geral</p>
              <p className="text-2xl font-bold text-blue-600">27.8%</p>
              <Badge variant="outline" className="text-xs mt-1">
                +2.3% vs mês anterior
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Produtos Otimizados</p>
              <p className="text-2xl font-bold text-green-600">156</p>
              <Badge variant="outline" className="text-xs mt-1">
                81% do total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Potencial de Melhoria</p>
              <p className="text-2xl font-bold text-orange-600">+4.2%</p>
              <Badge variant="outline" className="text-xs mt-1">
                R$ 8.9k adicional
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Alertas Ativos</p>
              <p className="text-2xl font-bold text-red-600">12</p>
              <Badge variant="outline" className="text-xs mt-1">
                3 críticos
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Margem */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marginDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {marginDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Correlação Margem vs Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Margem vs Volume de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="margem" 
                    name="margem" 
                    unit="%" 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="volume" 
                    name="volume" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      name === 'volume' ? `${value} vendas` : `${value}%`,
                      name === 'volume' ? 'Volume' : 'Margem'
                    ]}
                  />
                  <Scatter dataKey="volume" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Detalhada por Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise Detalhada por Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productAnalysis.map((product, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{product.produto}</h3>
                    <Badge variant="outline" className="text-xs">
                      {product.categoria}
                    </Badge>
                  </div>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(product.status)}`}>
                    {getStatusIcon(product.status)}
                    {getStatusLabel(product.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Margem Atual</p>
                    <p className="text-lg font-bold">{product.margem}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potencial</p>
                    <p className="text-lg font-bold text-green-600">{product.potencial}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Volume</p>
                    <p className="text-lg font-bold">{product.volume} vendas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receita</p>
                    <p className="text-lg font-bold">R$ {product.receita.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Otimização</span>
                    <span>{((product.potencial / product.margem - 1) * 100).toFixed(1)}% potencial</span>
                  </div>
                  <Progress 
                    value={(product.margem / product.potencial) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
