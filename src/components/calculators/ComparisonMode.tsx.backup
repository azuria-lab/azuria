import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  GitCompare,
  Info,
  Minus,
  Plus,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useComparison } from '@/hooks/useComparison';
import { COMPARISON_PRESETS, type PricingScenario } from '@/types/comparison';

/**
 * Feature #9: Comparison Mode Component
 * Split-screen before/after pricing scenario comparison
 */
export default function ComparisonMode() {
  const navigate = useNavigate();
  const { compareScenarios, applyPreset } = useComparison();

  // Scenario states
  const [beforeScenario, setBeforeScenario] = useState<PricingScenario>({
    id: 'current',
    name: 'Cenário Atual',
    description: 'Seu cenário de precificação atual',
    sellingPrice: 150,
    productCost: 50,
    shippingCost: 15,
    marketplaceFee: 20,
    taxes: 10,
    packagingCost: 3,
    marketingCost: 5,
    operationalCost: 2,
    otherCosts: 0,
    marketplace: 'Mercado Livre',
    volume: 100,
  });

  const [afterScenario, setAfterScenario] = useState<PricingScenario>({
    id: 'proposed',
    name: 'Cenário Proposto',
    description: 'Novo cenário com ajustes',
    sellingPrice: 165,
    productCost: 50,
    shippingCost: 15,
    marketplaceFee: 20,
    taxes: 11,
    packagingCost: 3,
    marketingCost: 5,
    operationalCost: 2,
    otherCosts: 0,
    marketplace: 'Mercado Livre',
    volume: 100,
  });

  // Perform comparison
  const comparison = compareScenarios(beforeScenario, afterScenario);

  // Update handlers
  const updateBeforeField = (field: keyof PricingScenario, value: number | string) => {
    setBeforeScenario(prev => ({ ...prev, [field]: value }));
  };

  const updateAfterField = (field: keyof PricingScenario, value: number | string) => {
    setAfterScenario(prev => ({ ...prev, [field]: value }));
  };

  // Apply preset to after scenario
  const handleApplyPreset = (presetId: string) => {
    const newScenario = applyPreset(beforeScenario, presetId);
    setAfterScenario(newScenario);
  };

  // Icon mapping for insights
  const getInsightIcon = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      TrendingUp,
      TrendingDown,
      Target,
      AlertTriangle,
      DollarSign,
      AlertCircle,
      Zap,
      Shield,
    };
    return icons[iconName] || Info;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1800px]">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <GitCompare className="h-12 w-12 text-purple-600" />
          <h1 className="text-4xl font-bold">Modo Comparação</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Compare cenários de precificação lado a lado e veja o impacto de cada mudança
        </p>
      </motion.div>

      {/* Preset Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Templates Rápidos
            </CardTitle>
            <CardDescription>
              Aplique comparações pré-configuradas para cenários comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {COMPARISON_PRESETS.map(preset => (
                <Button
                  key={preset.id}
                  variant="outline"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-xs text-center font-medium">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Comparison Layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* BEFORE Scenario */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <ArrowLeft className="h-5 w-5" />
                {beforeScenario.name}
              </CardTitle>
              <CardDescription>{beforeScenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Selling Price */}
              <div>
                <Label htmlFor="before-price" className="font-semibold">
                  Preço de Venda
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="before-price"
                    type="number"
                    step="0.01"
                    value={beforeScenario.sellingPrice}
                    onChange={e => updateBeforeField('sellingPrice', Number.parseFloat(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Costs */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Custos</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="before-product" className="text-xs">Produto</Label>
                    <Input
                      id="before-product"
                      type="number"
                      step="0.01"
                      value={beforeScenario.productCost}
                      onChange={e => updateBeforeField('productCost', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="before-shipping" className="text-xs">Frete</Label>
                    <Input
                      id="before-shipping"
                      type="number"
                      step="0.01"
                      value={beforeScenario.shippingCost}
                      onChange={e => updateBeforeField('shippingCost', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="before-fee" className="text-xs">Taxa Marketplace</Label>
                    <Input
                      id="before-fee"
                      type="number"
                      step="0.01"
                      value={beforeScenario.marketplaceFee}
                      onChange={e => updateBeforeField('marketplaceFee', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="before-taxes" className="text-xs">Impostos</Label>
                    <Input
                      id="before-taxes"
                      type="number"
                      step="0.01"
                      value={beforeScenario.taxes}
                      onChange={e => updateBeforeField('taxes', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metrics Summary */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Custos Totais</span>
                  <span className="font-bold">
                    R$ {comparison.beforeMetrics.totalCosts.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lucro</span>
                  <span className={cn(
                    'font-bold',
                    comparison.beforeMetrics.profit > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    R$ {comparison.beforeMetrics.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Margem</span>
                  <Badge variant={comparison.beforeMetrics.profitMargin > 20 ? 'default' : 'secondary'}>
                    {comparison.beforeMetrics.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AFTER Scenario */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-green-300">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <ArrowRight className="h-5 w-5" />
                {afterScenario.name}
              </CardTitle>
              <CardDescription>{afterScenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Selling Price */}
              <div>
                <Label htmlFor="after-price" className="font-semibold">
                  Preço de Venda
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="after-price"
                    type="number"
                    step="0.01"
                    value={afterScenario.sellingPrice}
                    onChange={e => updateAfterField('sellingPrice', Number.parseFloat(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Costs */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Custos</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="after-product" className="text-xs">Produto</Label>
                    <Input
                      id="after-product"
                      type="number"
                      step="0.01"
                      value={afterScenario.productCost}
                      onChange={e => updateAfterField('productCost', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="after-shipping" className="text-xs">Frete</Label>
                    <Input
                      id="after-shipping"
                      type="number"
                      step="0.01"
                      value={afterScenario.shippingCost}
                      onChange={e => updateAfterField('shippingCost', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="after-fee" className="text-xs">Taxa Marketplace</Label>
                    <Input
                      id="after-fee"
                      type="number"
                      step="0.01"
                      value={afterScenario.marketplaceFee}
                      onChange={e => updateAfterField('marketplaceFee', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="after-taxes" className="text-xs">Impostos</Label>
                    <Input
                      id="after-taxes"
                      type="number"
                      step="0.01"
                      value={afterScenario.taxes}
                      onChange={e => updateAfterField('taxes', Number.parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metrics Summary */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Custos Totais</span>
                  <span className="font-bold">
                    R$ {comparison.afterMetrics.totalCosts.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lucro</span>
                  <span className={cn(
                    'font-bold',
                    comparison.afterMetrics.profit > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    R$ {comparison.afterMetrics.profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Margem</span>
                  <Badge variant={comparison.afterMetrics.profitMargin > 20 ? 'default' : 'secondary'}>
                    {comparison.afterMetrics.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Comparison Results */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {/* Verdict Card */}
            <Card className={cn(
              'border-2',
              comparison.summary.verdict === 'better' && 'border-green-500 bg-green-50',
              comparison.summary.verdict === 'worse' && 'border-red-500 bg-red-50',
              comparison.summary.verdict === 'neutral' && 'border-gray-400 bg-gray-50'
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{comparison.summary.title}</h3>
                    <p className="text-gray-700">{comparison.summary.verdictMessage}</p>
                  </div>
                  <Badge
                    variant={comparison.summary.verdict === 'better' ? 'default' : 'secondary'}
                    className="text-lg px-4 py-2"
                  >
                    {comparison.summary.confidence}% confiança
                  </Badge>
                </div>

                <Separator className="my-4" />

                {/* Improvements & Degradations */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Improvements */}
                  {comparison.summary.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Melhorias ({comparison.summary.improvements.length})
                      </h4>
                      <ul className="space-y-2">
                        {comparison.summary.improvements.map((improvement) => (
                          <li key={improvement} className="flex items-start gap-2 text-sm">
                            <Plus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Degradations */}
                  {comparison.summary.degradations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Pontos de Atenção ({comparison.summary.degradations.length})
                      </h4>
                      <ul className="space-y-2">
                        {comparison.summary.degradations.map((degradation) => (
                          <li key={degradation} className="flex items-start gap-2 text-sm">
                            <Minus className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{degradation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Recommendation */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Recomendação
                  </h4>
                  <p className="text-gray-700">{comparison.summary.recommendation}</p>
                  <Badge className="mt-2" variant="outline">
                    Tipo: {comparison.summary.recommendationType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparação Detalhada</CardTitle>
                <CardDescription>
                  Análise linha a linha das diferenças entre os cenários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bar Chart Visual */}
                  {comparison.chartData.barData.map(data => {
                    const isPositive = data.difference > 0;
                    const isNegative = data.difference < 0;
                    const maxValue = Math.max(data.before, data.after);
                    const beforeWidth = (data.before / maxValue) * 100;
                    const afterWidth = (data.after / maxValue) * 100;

                    return (
                      <div key={data.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{data.category}</span>
                          <div className="flex items-center gap-2">
                            {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
                            {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {!isPositive && !isNegative && <Minus className="h-4 w-4 text-gray-400" />}
                            <span className={cn(
                              'font-bold',
                              isPositive && 'text-green-600',
                              isNegative && 'text-red-600',
                              !isPositive && !isNegative && 'text-gray-600'
                            )}>
                              {isPositive && '+'}
                              {data.difference.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Antes</div>
                            <div className="h-8 bg-blue-100 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all flex items-center justify-end pr-2"
                                style={{ width: `${beforeWidth}%` }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {data.before.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Depois</div>
                            <div className="h-8 bg-green-100 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all flex items-center justify-end pr-2"
                                style={{ width: `${afterWidth}%` }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {data.after.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {comparison.insights.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum insight significativo detectado. As mudanças são pequenas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comparison.insights.map(insight => {
                  const IconComponent = getInsightIcon(insight.icon);
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={cn(
                        'border-2',
                        insight.severity === 'positive' && 'border-green-300 bg-green-50',
                        insight.severity === 'negative' && 'border-red-300 bg-red-50',
                        insight.severity === 'neutral' && 'border-gray-300 bg-gray-50'
                      )}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'p-3 rounded-full',
                              insight.severity === 'positive' && 'bg-green-100',
                              insight.severity === 'negative' && 'bg-red-100',
                              insight.severity === 'neutral' && 'bg-gray-100'
                            )}>
                              <IconComponent className={cn(
                                'h-6 w-6',
                                insight.color
                              )} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
                              <p className="text-gray-700 mb-3">{insight.message}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Antes:</span>
                                  <span className="font-semibold">
                                    {insight.metricBefore.toFixed(2)}
                                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Depois:</span>
                                  <span className="font-semibold">
                                    {insight.metricAfter.toFixed(2)}
                                  </span>
                                </div>
                                <Badge variant={insight.severity === 'positive' ? 'default' : 'secondary'}>
                                  {insight.changePercent > 0 && '+'}
                                  {insight.changePercent.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
