
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dados mockados para demonstração
const revenueData = [
  { category: "Eletrônicos", revenue: 35000, profit: 14000, margin: 40 },
  { category: "Vestuário", revenue: 22000, profit: 9200, margin: 42 },
  { category: "Casa", revenue: 18500, profit: 8325, margin: 45 },
  { category: "Acessórios", revenue: 12000, profit: 4800, margin: 40 },
  { category: "Beleza", revenue: 16500, profit: 8250, margin: 50 },
];

const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6"];

export default function RevenueMetrics() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-brand-100">
        <CardHeader>
          <CardTitle>Receita e Lucro por Categoria</CardTitle>
          <CardDescription>
            Comparativo de receita e lucro entre categorias de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#3b82f6" />
                <Bar dataKey="profit" name="Lucro" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-100">
        <CardHeader>
          <CardTitle>Distribuição de Margens</CardTitle>
          <CardDescription>
            Distribuição percentual de margem por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="margin"
                  nameKey="category"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-brand-100">
        <CardHeader>
          <CardTitle>Tabela de Dados</CardTitle>
          <CardDescription>
            Informações detalhadas sobre receita e lucratividade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-right py-3 px-4">Receita</th>
                  <th className="text-right py-3 px-4">Lucro</th>
                  <th className="text-right py-3 px-4">Margem</th>
                  <th className="text-right py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.revenue)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(item.profit)}</td>
                    <td className="text-right py-3 px-4">{item.margin}%</td>
                    <td className="text-right py-3 px-4">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          item.margin >= 45
                            ? "bg-green-100 text-green-800"
                            : item.margin >= 40
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.margin >= 45
                          ? "Excelente"
                          : item.margin >= 40
                          ? "Bom"
                          : "Médio"}
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
