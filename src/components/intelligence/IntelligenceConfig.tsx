
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSettings {
  category: string;
  currentPrice: number;
  cost: number;
  margin: number;
  salesVolume: number;
}

interface IntelligenceConfigProps {
  selectedProduct: ProductSettings;
  setSelectedProduct: React.Dispatch<React.SetStateAction<ProductSettings>>;
  timeframe: '7d' | '30d' | '90d';
  setTimeframe: React.Dispatch<React.SetStateAction<'7d' | '30d' | '90d'>>;
}

export default function IntelligenceConfig({
  selectedProduct,
  setSelectedProduct,
  timeframe,
  setTimeframe
}: IntelligenceConfigProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Configurações de Análise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categoria do Produto</label>
            <Select 
              value={selectedProduct.category}
              onValueChange={(value) => setSelectedProduct(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                <SelectItem value="Roupas">Roupas & Acessórios</SelectItem>
                <SelectItem value="Casa">Casa & Decoração</SelectItem>
                <SelectItem value="Esportes">Esportes & Lazer</SelectItem>
                <SelectItem value="Beleza">Beleza & Cuidados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período de Análise</label>
            <Select 
              value={timeframe}
              onValueChange={(value: '7d' | '30d' | '90d') => setTimeframe(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preço Atual</label>
            <input
              type="number"
              value={selectedProduct.currentPrice}
              onChange={(e) => setSelectedProduct(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
