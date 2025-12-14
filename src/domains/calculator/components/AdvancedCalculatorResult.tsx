
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calculator, CheckCircle, DollarSign, PieChart, RefreshCw, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import type { AdvancedCalculationResult } from "@/domains/calculator/types/advanced";

interface AdvancedCalculatorResultProps {
  result: AdvancedCalculationResult;
}

/**
 * Retorna a classe de cor do card baseado na economia
 */
function getSavingsCardColor(savings: number): string {
  if (savings > 0) {return 'bg-green-50 border-green-200';}
  if (savings < 0) {return 'bg-red-50 border-red-200';}
  return 'bg-gray-50 border-gray-200';
}

/**
 * Retorna a classe de cor do badge baseado na economia
 */
function getSavingsBadgeColor(savings: number): string {
  if (savings > 0) {return 'border-green-500 text-green-700';}
  if (savings < 0) {return 'border-red-500 text-red-700';}
  return 'border-gray-500 text-gray-700';
}

/**
 * Retorna a classe de cor do texto da recomendação baseado na economia
 */
function getRecommendationTextColor(savings: number): string {
  if (savings > 0) {return 'text-green-700';}
  if (savings < 0) {return 'text-red-700';}
  return 'text-gray-700';
}

export default function AdvancedCalculatorResult({ result }: AdvancedCalculatorResultProps) {
  const { sellingPrice, profit, profitMargin, breakdown, taxRegimeAnalysis } = result;

  const getProfitColor = (margin: number) => {
    if (margin >= 30) {return "text-green-600";}
    if (margin >= 15) {return "text-yellow-600";}
    return "text-red-600";
  };

  const getProfitBadgeColor = (margin: number) => {
    if (margin >= 30) {return "bg-green-100 text-green-800";}
    if (margin >= 15) {return "bg-yellow-100 text-yellow-800";}
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Resultado Principal */}
      <Card className="border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-brand-600" />
              <span className="text-sm text-gray-600">Preço de Venda Sugerido</span>
            </div>
            <div className="text-4xl font-bold text-brand-700 mb-2">
              R$ {formatCurrency(sellingPrice)}
            </div>
            <div className="flex items-center justify-center gap-4">
              <Badge className={getProfitBadgeColor(profitMargin)}>
                Margem: {profitMargin.toFixed(1)}%
              </Badge>
              <span className={`text-lg font-medium ${getProfitColor(profitMargin)}`}>
                Lucro: R$ {formatCurrency(profit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Detalhado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Base</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {formatCurrency(breakdown.cost)}</div>
            <p className="text-xs text-muted-foreground">
              + Frete: R$ {formatCurrency(breakdown.shipping)}
            </p>
            <p className="text-xs text-muted-foreground">
              + Outros: R$ {formatCurrency(breakdown.otherCosts)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impostos</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {formatCurrency(breakdown.taxes.total)}</div>
            <p className="text-xs text-muted-foreground mb-2">
              Taxa efetiva: {breakdown.taxes.effectiveRate.toFixed(2)}%
            </p>
            <div className="space-y-1">
              {Object.entries(breakdown.taxes.details).map(([tax, amount]) => (
                <p key={tax} className="text-xs text-muted-foreground">
                  {tax}: R$ {formatCurrency(amount)}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Marketplace</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {formatCurrency(breakdown.marketplaceFee)}</div>
            <p className="text-xs text-muted-foreground">
              {((breakdown.marketplaceFee / sellingPrice) * 100).toFixed(1)}% do preço
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {formatCurrency(breakdown.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% de margem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Composição do Preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Composição do Preço de Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Custo do Produto", value: breakdown.cost, color: "bg-blue-500" },
              { label: "Frete", value: breakdown.shipping, color: "bg-green-500" },
              { label: "Outros Custos", value: breakdown.otherCosts, color: "bg-purple-500" },
              { label: "Impostos", value: breakdown.taxes.total, color: "bg-red-500" },
              { label: "Taxa Marketplace", value: breakdown.marketplaceFee, color: "bg-orange-500" },
              { label: "Lucro Líquido", value: breakdown.netProfit, color: "bg-emerald-500" },
            ].map((item) => {
              const percentage = (item.value / sellingPrice) * 100;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      {item.label}
                    </span>
                    <span className="font-medium">
                      R$ {formatCurrency(item.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Regimes Tributários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Análise de Regimes Tributários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Regime Atual */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Regime Atual</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {taxRegimeAnalysis.selectedRegime.category.toUpperCase()}
                </Badge>
              </div>
              <h4 className="font-medium">{taxRegimeAnalysis.selectedRegime.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {taxRegimeAnalysis.selectedRegime.description}
              </p>
              {taxRegimeAnalysis.selectedRegime.faturamentoLimite && (
                <p className="text-xs text-gray-500 mt-2">
                  Limite de faturamento: R$ {taxRegimeAnalysis.selectedRegime.faturamentoLimite.toLocaleString()}
                </p>
              )}
            </div>

            {/* Regimes Alternativos */}
            {taxRegimeAnalysis.alternativeRegimes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Regimes Alternativos - Potencial de Economia
                </h4>
                <div className="space-y-3">
                  {taxRegimeAnalysis.alternativeRegimes.map((alt, index) => (
                    <div
                      key={alt.regime.id}
                      className={`p-4 rounded-lg border ${getSavingsCardColor(alt.savings)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSavingsBadgeColor(alt.savings)}`}
                          >
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{alt.regime.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            R$ {formatCurrency(alt.sellingPrice)}
                          </div>
                          {alt.savings !== 0 && (
                            <div className={`text-xs ${
                              alt.savings > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {alt.savings > 0 ? '↓' : '↑'} R$ {Math.abs(alt.savings).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alt.regime.description}
                      </p>
                      <p className={`text-xs font-medium ${getRecommendationTextColor(alt.savings)}`}>
                        {alt.recommendation}
                      </p>
                      {alt.regime.faturamentoLimite && (
                        <p className="text-xs text-gray-500 mt-1">
                          Limite: R$ {alt.regime.faturamentoLimite.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Importante:</strong> A mudança de regime tributário deve ser avaliada considerando 
                    o faturamento anual, tipo de atividade e outras obrigações fiscais. 
                    Consulte sempre um contador para orientação específica.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
