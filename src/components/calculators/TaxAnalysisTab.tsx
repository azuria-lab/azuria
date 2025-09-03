import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Calculator, 
  DollarSign, 
  FileText, 
  Percent,
  Scale,
  Target,
  TrendingUp
} from "lucide-react";
import type { AdvancedCalculationResult, TaxRegime } from "@/domains/calculator/types/advanced";
import { useAdvancedCalculator } from "@/domains/calculator/hooks/useAdvancedCalculator";
import { formatCurrency } from "@/utils/calculator/formatCurrency";

interface TaxAnalysisTabProps {
  result: AdvancedCalculationResult | null;
  currentBusinessActivity: string;
}

export default function TaxAnalysisTab({ result, currentBusinessActivity }: TaxAnalysisTabProps) {
  const [selectedRegimeForComparison, setSelectedRegimeForComparison] = useState<string>("");
  const [annualRevenue, setAnnualRevenue] = useState<string>("");
  
  const { taxRegimes } = useAdvancedCalculator();

  // Filtrar regimes por atividade
  const applicableRegimes = taxRegimes.filter(regime =>
    !regime.applicableActivities || 
    regime.applicableActivities.includes("todos") ||
    regime.applicableActivities.includes(currentBusinessActivity)
  );

  // Análise de adequação por faturamento
  const getRevenueAnalysis = (regime: TaxRegime, revenue: number) => {
    if (!regime.faturamentoLimite) {return { status: "applicable", message: "Sem limite específico" };}
    
    if (revenue <= regime.faturamentoLimite) {
      const utilization = (revenue / regime.faturamentoLimite) * 100;
      if (utilization > 90) {
        return { 
          status: "warning", 
          message: `Próximo ao limite (${utilization.toFixed(1)}% utilizado)` 
        };
      }
      return { 
        status: "safe", 
        message: `Dentro do limite (${utilization.toFixed(1)}% utilizado)` 
      };
    }
    
    return { 
      status: "exceeded", 
      message: "Faturamento excede o limite permitido" 
    };
  };

  const revenue = parseFloat(annualRevenue) || 0;

  return (
    <div className="space-y-6">
      {/* Configuração de Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuração da Análise Tributária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annual-revenue">Faturamento Anual Estimado (R$)</Label>
              <Input
                id="annual-revenue"
                type="number"
                placeholder="0,00"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Para análise de adequação aos limites dos regimes
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Atividade Empresarial Atual</Label>
              <div className="p-2 bg-gray-50 rounded border">
                <span className="text-sm font-medium capitalize">{currentBusinessActivity}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visão Geral dos Regimes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Comparativo de Regimes Tributários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {applicableRegimes.map((regime) => {
              const revenueAnalysis = revenue > 0 ? getRevenueAnalysis(regime, revenue) : null;
              const totalTaxRate = Object.values(regime.rates).reduce((sum, rate) => sum + rate, 0);
              
              return (
                <div key={regime.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{regime.name}</h4>
                      <p className="text-sm text-gray-600">{regime.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {regime.category.toUpperCase()}
                      </Badge>
                      {regime.annexo && (
                        <p className="text-xs text-gray-500">Anexo {regime.annexo}</p>
                      )}
                    </div>
                  </div>

                  {/* Taxa Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa Total Aproximada:</span>
                    <span className="font-bold text-lg">{totalTaxRate.toFixed(2)}%</span>
                  </div>

                  {/* Breakdown de Impostos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(regime.rates)
                      .filter(([, rate]) => rate > 0)
                      .map(([tax, rate]) => (
                      <div key={tax} className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{tax.toUpperCase()}</div>
                        <div className="text-gray-600">{rate}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Análise de Faturamento */}
                  {revenueAnalysis && (
                    <div className={`p-2 rounded text-xs ${
                      revenueAnalysis.status === 'safe' ? 'bg-green-50 text-green-700' :
                      revenueAnalysis.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      revenueAnalysis.status === 'exceeded' ? 'bg-red-50 text-red-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {revenueAnalysis.message}
                      {regime.faturamentoLimite && (
                        <div className="mt-1">
                          Limite: R$ {regime.faturamentoLimite.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aplicabilidade */}
                  <div className="text-xs">
                    <span className="font-medium">Aplicável para: </span>
                    <span className="text-gray-600">
                      {regime.applicableActivities?.join(", ") || "Todas as atividades"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Análise Atual */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Impacto Tributário no Cálculo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Total de Impostos</div>
                <div className="text-2xl font-bold text-blue-700">
                  R$ {formatCurrency(result.breakdown.taxes.total)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Percent className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Taxa Efetiva</div>
                <div className="text-2xl font-bold text-purple-700">
                  {result.breakdown.taxes.effectiveRate.toFixed(2)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Impacto no Preço</div>
                <div className="text-2xl font-bold text-green-700">
                  {((result.breakdown.taxes.total / result.sellingPrice) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Breakdown Detalhado */}
            <div className="space-y-2">
              <h5 className="font-medium">Composição dos Impostos:</h5>
              {Object.entries(result.breakdown.taxes.details).map(([tax, amount]) => {
                const percentage = (amount / result.breakdown.taxes.total) * 100;
                return (
                  <div key={tax} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{tax}</span>
                      <span>R$ {formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dicas de Planejamento Tributário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">📊 Simples Nacional</h5>
              <p className="text-sm text-blue-800">
                Ideal para empresas com faturamento até R$ 4,8 milhões. 
                Oferece simplificação e, em muitos casos, redução da carga tributária.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">💼 Lucro Presumido</h5>
              <p className="text-sm text-green-800">
                Adequado para empresas com boa margem de lucro e faturamento até R$ 78 milhões. 
                Presume-se um percentual de lucro para cálculo do IRPJ e CSLL.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-2">🏢 Lucro Real</h5>
              <p className="text-sm text-purple-800">
                Obrigatório para empresas com faturamento superior a R$ 78 milhões. 
                Tributação baseada no lucro real da empresa.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-yellow-900 mb-1">Importante</h5>
                <p className="text-sm text-yellow-800">
                  Esta análise é apenas orientativa. A escolha do regime tributário deve considerar 
                  diversos fatores além da carga tributária, como obrigações acessórias, 
                  fluxo de caixa e planejamento fiscal. Sempre consulte um contador qualificado.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}