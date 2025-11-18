import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  Award,
  BarChart3,
  DollarSign,
  TrendingDown,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiMarketplaceComparison } from '@/hooks/useMultiMarketplaceComparison';
import type { ComparisonViewMode, MultiMarketplaceInput } from '@/types/multiMarketplace';
import { cn } from '@/lib/utils';

interface MultiMarketplaceComparisonProps {
  input: MultiMarketplaceInput;
}

export default function MultiMarketplaceComparison({ input }: MultiMarketplaceComparisonProps) {
  const { compareAll } = useMultiMarketplaceComparison();
  const [viewMode, setViewMode] = useState<ComparisonViewMode>('cards');

  const comparison = compareAll(input);
  const { results, bestMarketplace, summary, totalFeesComparison } = comparison;

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Melhor Marketplace: {bestMarketplace.marketplaceName}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {summary.message}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Lucro Líquido</p>
              <p className="text-4xl font-bold text-green-600">
                R$ {bestMarketplace.netProfit.toFixed(2)}
              </p>
              <Badge variant="default" className="mt-2">
                {bestMarketplace.profitMargin.toFixed(1)}% de margem
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white/60 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Recomendação:</strong> {summary.recommendation}
            </p>
            {summary.potentialSavings > 20 && (
              <p className="text-sm text-green-700 mt-2">
                💰 <strong>Economia Potencial:</strong> Você pode ganhar até R$ {summary.potentialSavings.toFixed(2)} a mais por venda!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs para alternar visualização */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ComparisonViewMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
        </TabsList>

        {/* Visualização em Cards */}
        <TabsContent value="cards" className="space-y-4 mt-6">
          {results.map((result, index) => (
            <motion.div
              key={result.marketplaceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'transition-all hover:shadow-lg',
                result.isRecommended && 'border-2 border-green-500'
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Info do Marketplace */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={cn(
                          'p-3 rounded-lg',
                          result.isRecommended ? 'bg-green-100' : 'bg-gray-100'
                        )}>
                          <span className="text-3xl">
                            {result.ranking === 1 && '🥇'}
                            {result.ranking === 2 && '🥈'}
                            {result.ranking === 3 && '🥉'}
                            {result.ranking > 3 && '🏪'}
                          </span>
                        </div>
                        {result.isRecommended && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500">
                            Melhor
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {result.marketplaceName}
                          <span className="text-sm font-normal text-gray-500">
                            #{result.ranking}
                          </span>
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {result.insights.slice(0, 2).map((insight, i) => (
                            <span key={i} className="text-xs text-gray-600">
                              {insight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Métricas Principais */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Lucro Líquido</p>
                      <p className="text-3xl font-bold text-blue-600">
                        R$ {result.netProfit.toFixed(2)}
                      </p>
                      {result.profitDifference > 0 && (
                        <p className="text-sm text-red-600 flex items-center justify-end gap-1 mt-1">
                          <ArrowDownRight className="h-3 w-3" />
                          R$ {result.profitDifference.toFixed(2)} menos
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Detalhes em Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Preço Sugerido</p>
                      <p className="text-lg font-bold">
                        R$ {result.suggestedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Margem de Lucro</p>
                      <p className={cn(
                        'text-lg font-bold',
                        result.profitMargin > 25 ? 'text-green-600' : 
                        result.profitMargin > 15 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {result.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total de Taxas</p>
                      <p className="text-lg font-bold text-orange-600">
                        R$ {result.totalFees.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.breakdown.marketplaceFeePercentage.toFixed(1)}% comissão
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Custo Total</p>
                      <p className="text-lg font-bold text-gray-700">
                        R$ {result.totalCosts.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown de Custos - Expandível */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                      Ver detalhamento de custos
                    </summary>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Taxa Marketplace:</span>
                        <span className="font-semibold">R$ {result.breakdown.marketplaceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Taxa Pagamento:</span>
                        <span className="font-semibold">R$ {result.breakdown.paymentFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Frete:</span>
                        <span className="font-semibold">R$ {result.breakdown.shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Embalagem:</span>
                        <span className="font-semibold">R$ {result.breakdown.packagingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Marketing:</span>
                        <span className="font-semibold">R$ {result.breakdown.marketingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Outros:</span>
                        <span className="font-semibold">R$ {result.breakdown.otherCosts.toFixed(2)}</span>
                      </div>
                    </div>
                  </details>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Visualização em Tabela */}
        <TabsContent value="table" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Marketplace
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Preço
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Lucro
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Margem
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Taxas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Diferença
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map((result, _index) => (
                      <tr 
                        key={result.marketplaceId}
                        className={cn(
                          'hover:bg-gray-50 transition-colors',
                          result.isRecommended && 'bg-green-50'
                        )}
                      >
                        <td className="px-4 py-4">
                          <span className="text-2xl">
                            {result.ranking === 1 && '🥇'}
                            {result.ranking === 2 && '🥈'}
                            {result.ranking === 3 && '🥉'}
                            {result.ranking > 3 && result.ranking}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold">{result.marketplaceName}</div>
                          {result.isRecommended && (
                            <Badge variant="default" className="mt-1 text-xs">
                              Recomendado
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold">
                          R$ {result.suggestedPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-blue-600">
                            R$ {result.netProfit.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={cn(
                            'font-semibold',
                            result.profitMargin > 25 ? 'text-green-600' :
                            result.profitMargin > 15 ? 'text-yellow-600' : 'text-red-600'
                          )}>
                            {result.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-orange-600">
                          R$ {result.totalFees.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {result.profitDifference > 0 ? (
                            <span className="text-red-600 flex items-center justify-end gap-1">
                              <TrendingDown className="h-3 w-3" />
                              -R$ {result.profitDifference.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center justify-end gap-1">
                              <Trophy className="h-3 w-3" />
                              Melhor
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualização em Gráfico */}
        <TabsContent value="chart" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparação de Lucro Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result) => {
                  const maxProfit = results[0].netProfit;
                  const widthPercentage = (result.netProfit / maxProfit) * 100;
                  
                  return (
                    <div key={result.marketplaceId} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{result.marketplaceName}</span>
                        <span className="text-blue-600 font-bold">
                          R$ {result.netProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={cn(
                            'h-full flex items-center justify-end px-3',
                            result.isRecommended 
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          )}
                        >
                          {widthPercentage > 30 && (
                            <span className="text-white font-bold text-sm">
                              {result.profitMargin.toFixed(1)}%
                            </span>
                          )}
                        </motion.div>
                        {result.isRecommended && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Trophy className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Taxas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Comparação de Taxas
              </CardTitle>
              <CardDescription>
                {totalFeesComparison.lowest.marketplaceId} tem as menores taxas (R$ {totalFeesComparison.lowest.value.toFixed(2)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...results].sort((a, b) => a.totalFees - b.totalFees).map((result) => {
                  const maxFees = totalFeesComparison.highest.value;
                  const widthPercentage = (result.totalFees / maxFees) * 100;
                  const isLowest = result.marketplaceId === totalFeesComparison.lowest.marketplaceId;
                  
                  return (
                    <div key={result.marketplaceId} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{result.marketplaceName}</span>
                        <span className="text-orange-600 font-bold">
                          R$ {result.totalFees.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={cn(
                            'h-full flex items-center justify-end px-3',
                            isLowest
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : 'bg-gradient-to-r from-orange-400 to-orange-600'
                          )}
                        >
                          {widthPercentage > 30 && (
                            <span className="text-white font-bold text-sm">
                              {result.breakdown.marketplaceFeePercentage.toFixed(1)}%
                            </span>
                          )}
                        </motion.div>
                        {isLowest && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
