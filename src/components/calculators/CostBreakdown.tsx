/**
 * Feature #8: Cost Breakdown Analysis Component
 * Interactive pie chart showing cost distribution with optimization suggestions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  FileText,
  Lightbulb,
  Package,
  PieChart,
  Store,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from 'lucide-react';
import {
  COST_CATEGORY_METADATA,
  type CostBreakdownInput,
  type CostItem,
  generateSampleCostBreakdown,
  INDUSTRY_BENCHMARKS,
} from '@/types/costBreakdown';
import { cn } from '@/lib/utils';

interface CostBreakdownProps {
  input?: CostBreakdownInput;
  industryType?: string;
}

export default function CostBreakdown({ input: providedInput, industryType = 'default' }: CostBreakdownProps) {
  const [input] = useState<CostBreakdownInput>(
    providedInput || generateSampleCostBreakdown()
  );
  const [selectedView, setSelectedView] = useState<'chart' | 'details' | 'optimize'>('chart');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calculate analysis inline
  const {
    sellingPrice,
    productCost,
    shippingCost,
    marketplaceFee,
    taxes,
    packagingCost = 0,
    marketingCost = 0,
    operationalCost = 0,
    otherCosts = 0,
  } = input;

  const totalCosts =
    productCost + shippingCost + marketplaceFee + taxes + packagingCost + marketingCost + operationalCost + otherCosts;
  const profit = sellingPrice - totalCosts;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  // Build items
  const items: CostItem[] = [];
  let itemId = 0;

  const addItem = (category: keyof typeof COST_CATEGORY_METADATA, value: number) => {
    if (value > 0) {
      const meta = COST_CATEGORY_METADATA[category];
      items.push({
        id: `cost-${itemId++}`,
        category,
        label: meta.label,
        value,
        percentage: (value / sellingPrice) * 100,
        color: meta.color,
        icon: meta.icon,
        description: meta.description,
        isEditable: true,
        isRequired: true,
      });
    }
  };

  addItem('product', productCost);
  addItem('shipping', shippingCost);
  addItem('marketplace_fee', marketplaceFee);
  addItem('taxes', taxes);
  addItem('packaging', packagingCost);
  addItem('marketing', marketingCost);
  addItem('operational', operationalCost);
  addItem('other', otherCosts);

  if (profit > 0) {
    items.push({
      id: 'profit',
      category: 'other',
      label: 'Lucro Líquido',
      value: profit,
      percentage: profitMargin,
      color: '#22c55e',
      icon: '💰',
      description: 'Lucro após custos',
      isEditable: false,
      isRequired: true,
    });
  }

  items.sort((a, b) => b.value - a.value);

  // Benchmark
  const benchmark = INDUSTRY_BENCHMARKS[industryType] || INDUSTRY_BENCHMARKS.default;
  const isAboveBenchmark = profitMargin > benchmark.targetProfitMargin + 5;
  const isBelowBenchmark = profitMargin < benchmark.targetProfitMargin - 5;

  // Generate pie chart segments
  let cumulativePercentage = 0;
  const segments = items.map((item) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
    cumulativePercentage += item.percentage;

    return {
      ...item,
      startAngle,
      endAngle,
      sweepAngle: endAngle - startAngle,
    };
  });

  // Icon mapping
  const getIcon = (category: string) => {
    switch (category) {
      case 'product': return <Package className="h-5 w-5" />;
      case 'shipping': return <Truck className="h-5 w-5" />;
      case 'marketplace_fee': return <Store className="h-5 w-5" />;
      case 'taxes': return <FileText className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="h-6 w-6 text-purple-600" />
            Análise de Custos
          </h3>
          <p className="text-muted-foreground mt-1">
            Visualize onde está indo seu dinheiro
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Margem de Lucro</p>
          <p className={cn(
            "text-3xl font-bold",
            profitMargin > 25 ? "text-green-600" : 
            profitMargin > 15 ? "text-yellow-600" : 
            "text-red-600"
          )}>
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="optimize">Otimizar</TabsTrigger>
        </TabsList>

        {/* Chart Tab */}
        <TabsContent value="chart" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {segments.map((segment) => {
                      const radius = 40;
                      const centerX = 50;
                      const centerY = 50;
                      
                      const startRad = (segment.startAngle * Math.PI) / 180;
                      const endRad = (segment.endAngle * Math.PI) / 180;
                      
                      const x1 = centerX + radius * Math.cos(startRad);
                      const y1 = centerY + radius * Math.sin(startRad);
                      const x2 = centerX + radius * Math.cos(endRad);
                      const y2 = centerY + radius * Math.sin(endRad);
                      
                      const largeArc = segment.sweepAngle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                        'Z',
                      ].join(' ');

                      return (
                        <path
                          key={segment.id}
                          d={pathData}
                          fill={segment.color}
                          opacity={hoveredItem === segment.id ? 0.8 : 1}
                          className="transition-opacity cursor-pointer"
                          onMouseEnter={() => setHoveredItem(segment.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <title>{`${segment.label}: R$ ${segment.value.toFixed(2)} (${segment.percentage.toFixed(1)}%)`}</title>
                        </path>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-2">
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer",
                        hoveredItem === segment.id && "bg-muted"
                      )}
                      onMouseEnter={() => setHoveredItem(segment.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm font-medium">{segment.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">R$ {segment.value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{segment.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Preço de Venda</h4>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">R$ {sellingPrice.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Total de Custos</h4>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">R$ {totalCosts.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((totalCosts / sellingPrice) * 100).toFixed(1)}% do preço de venda
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Lucro Líquido</h4>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className={cn(
                    "text-3xl font-bold",
                    profit > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    R$ {profit.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Margem: {profitMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              {/* Benchmark Comparison */}
              <Card className={cn(
                "border-2",
                isAboveBenchmark && "border-green-500",
                isBelowBenchmark && "border-yellow-500"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isAboveBenchmark && <span className="text-2xl">🎉</span>}
                    {isBelowBenchmark && <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />}
                    {!isAboveBenchmark && !isBelowBenchmark && <span className="text-2xl">✅</span>}
                    <div>
                      <p className="font-semibold text-sm mb-1">
                        {isAboveBenchmark && 'Acima da Média!'}
                        {isBelowBenchmark && 'Abaixo da Média'}
                        {!isAboveBenchmark && !isBelowBenchmark && 'Na Média'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Meta da indústria: {benchmark.targetProfitMargin}% de margem
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(item => item.label !== 'Lucro Líquido').map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <h4 className="font-semibold">{item.label}</h4>
                      </div>
                      {getIcon(item.category)}
                    </div>
                    <p className="text-2xl font-bold mb-1">R$ {item.value.toFixed(2)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.percentage.toFixed(1)}% do total</span>
                      <Badge variant="outline">{item.description}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Cost breakdown insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Insights Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.find(i => i.label !== 'Lucro Líquido') && (
                <div className="flex items-start gap-2 text-sm">
                  <span>📊</span>
                  <p>
                    Seu maior custo é <strong>{items[0].label}</strong> (
                    {items[0].percentage.toFixed(1)}% do preço). 
                    {items[0].percentage > 40 && ' Considere alternativas para reduzir.'}
                  </p>
                </div>
              )}
              
              {profitMargin < 20 && (
                <div className="flex items-start gap-2 text-sm text-yellow-700">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p>
                    Margem de lucro abaixo de 20%. Revise seus custos ou considere aumentar o preço.
                  </p>
                </div>
              )}

              {profitMargin > 30 && (
                <div className="flex items-start gap-2 text-sm text-green-700">
                  <span>✨</span>
                  <p>
                    Excelente margem de lucro! Você está operando com eficiência acima da média.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Oportunidades de otimização baseadas em benchmarks da indústria
          </p>

          {/* Product cost optimization */}
          {productCost / sellingPrice > benchmark.productCost / 100 + 0.05 && (
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Negociar Custo do Produto</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Seu custo de produto está {((productCost / sellingPrice * 100) - benchmark.productCost).toFixed(1)}% acima da média.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-semibold mb-2">💡 Ações Sugeridas:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Pesquise fornecedores alternativos</li>
                        <li>Negocie descontos por volume</li>
                        <li>Considere compras em atacado</li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Dificuldade: Média</Badge>
                      <Badge variant="outline" className="text-xs">Impacto: Alto</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping optimization */}
          {shippingCost / sellingPrice > benchmark.shipping / 100 + 0.03 && (
            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Otimizar Frete</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Custos de frete {((shippingCost / sellingPrice * 100) - benchmark.shipping).toFixed(1)}% acima do ideal.
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-semibold mb-2">💡 Ações Sugeridas:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Compare diferentes transportadoras</li>
                        <li>Negocie contratos de volume</li>
                        <li>Otimize embalagens para reduzir peso</li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Dificuldade: Fácil</Badge>
                      <Badge variant="outline" className="text-xs">Impacto: Médio</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marketplace fee optimization */}
          {marketplaceFee / sellingPrice > 0.15 && (
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">Diversificar Canais</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Taxas de marketplace representam {(marketplaceFee / sellingPrice * 100).toFixed(1)}% do preço.
                    </p>
                    <div className="bg-purple-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-semibold mb-2">💡 Ações Sugeridas:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Desenvolva uma loja própria</li>
                        <li>Explore marketplaces com taxas menores</li>
                        <li>Negocie condições especiais</li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Dificuldade: Alta</Badge>
                      <Badge variant="outline" className="text-xs">Impacto: Alto</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No optimizations */}
          {productCost / sellingPrice <= benchmark.productCost / 100 + 0.05 &&
           shippingCost / sellingPrice <= benchmark.shipping / 100 + 0.03 &&
           marketplaceFee / sellingPrice <= 0.15 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-6xl mb-4 block">🎯</span>
                <h4 className="font-bold text-lg mb-2">Estrutura de Custos Otimizada!</h4>
                <p className="text-muted-foreground">
                  Seus custos estão dentro dos padrões recomendados. Continue monitorando.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
