
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, Settings, TrendingUp, Users } from "lucide-react";
import { useAdvancedCalculator } from "@/domains/calculator/hooks/useAdvancedCalculator";
import AdvancedCalculatorResult from "./AdvancedCalculatorResult";
import CompetitorAnalysisDisplay from "./CompetitorAnalysisDisplay";
import TaxAnalysisTab from "./TaxAnalysisTab";

interface AdvancedProCalculatorProps {
  userId?: string;
}

export default function AdvancedProCalculator({ userId: _userId }: AdvancedProCalculatorProps) {
  const {
    result,
    isLoading,
    calculateAdvancedPrice,
    taxRegimes,
    marketplaces
  } = useAdvancedCalculator();

  const [formData, setFormData] = useState({
    cost: "",
    targetMargin: "30",
    marketplaceId: "mercadolivre",
    taxRegimeId: "simples_comercio",
    shipping: "",
    otherCosts: "",
    enableCompetitorAnalysis: true,
    productCategory: "",
    businessActivity: "comércio"
  });

  const businessActivities = [
    { id: "comércio", name: "Comércio/Revenda" },
    { id: "varejo", name: "Varejo" },
    { id: "indústria", name: "Indústria" },
    { id: "fabricação", name: "Fabricação" },
    { id: "produção", name: "Produção" },
    { id: "serviços", name: "Serviços" },
    { id: "consultoria", name: "Consultoria" },
    { id: "assistência", name: "Assistência Técnica" },
    { id: "profissionais", name: "Serviços Profissionais" },
    { id: "financeiro", name: "Financeiro" },
    { id: "bancário", name: "Bancário" },
    { id: "seguros", name: "Seguros" }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const params = {
      cost: parseFloat(formData.cost) || 0,
      targetMargin: parseFloat(formData.targetMargin) || 30,
      marketplaceId: formData.marketplaceId,
      taxRegimeId: formData.taxRegimeId,
      shipping: parseFloat(formData.shipping) || 0,
      otherCosts: parseFloat(formData.otherCosts) || 0,
      enableCompetitorAnalysis: formData.enableCompetitorAnalysis,
      productCategory: formData.productCategory,
      businessActivity: formData.businessActivity
    };

    calculateAdvancedPrice(params);
  };

  // Filtrar regimes por atividade selecionada
  const filteredTaxRegimes = taxRegimes.filter(regime => 
    !regime.applicableActivities || 
    regime.applicableActivities.includes("todos") ||
    regime.applicableActivities.includes(formData.businessActivity)
  );

  const selectedMarketplace = marketplaces.find(m => m.id === formData.marketplaceId);
  const selectedTaxRegime = taxRegimes.find(t => t.id === formData.taxRegimeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-100 rounded-lg">
          <Calculator className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Calculadora PRO Avançada</h2>
          <p className="text-gray-600">Cálculos precisos com impostos complexos e análise de mercado</p>
        </div>
        <Badge className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
          PRO
        </Badge>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Concorrência
          </TabsTrigger>
          <TabsTrigger value="tax-analysis">
            <FileText className="h-4 w-4 mr-2" />
            Impostos
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo do Produto (R$) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-margin">Margem Desejada (%)</Label>
                  <Input
                    id="target-margin"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={formData.targetMargin}
                    onChange={(e) => handleInputChange('targetMargin', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping">Frete (R$)</Label>
                    <Input
                      id="shipping"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.shipping}
                      onChange={(e) => handleInputChange('shipping', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="other-costs">Outros Custos (R$)</Label>
                    <Input
                      id="other-costs"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.otherCosts}
                      onChange={(e) => handleInputChange('otherCosts', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="marketplace">Marketplace</Label>
                  <Select 
                    value={formData.marketplaceId} 
                    onValueChange={(value) => handleInputChange('marketplaceId', value)}
                  >
                    <SelectTrigger id="marketplace">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {marketplaces.map(marketplace => (
                        <SelectItem key={marketplace.id} value={marketplace.id}>
                          {marketplace.name} ({marketplace.fee}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMarketplace && (
                    <p className="text-sm text-gray-500">
                      Taxa: {selectedMarketplace.fee}%
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-activity">Atividade Empresarial</Label>
                  <Select 
                    value={formData.businessActivity} 
                    onValueChange={(value) => handleInputChange('businessActivity', value)}
                  >
                    <SelectTrigger id="business-activity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessActivities.map(activity => (
                        <SelectItem key={activity.id} value={activity.id}>
                          {activity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-regime">Regime Tributário</Label>
                  <Select 
                    value={formData.taxRegimeId} 
                    onValueChange={(value) => handleInputChange('taxRegimeId', value)}
                  >
                    <SelectTrigger id="tax-regime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTaxRegimes.map(regime => (
                        <SelectItem key={regime.id} value={regime.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{regime.name}</span>
                            <span className="text-xs text-gray-500">{regime.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTaxRegime && (
                    <div className="text-sm text-gray-500 space-y-2">
                      <p className="font-medium">{selectedTaxRegime.description}</p>
                      {selectedTaxRegime.annexo && (
                        <p className="text-xs">
                          <Badge variant="outline">Anexo {selectedTaxRegime.annexo}</Badge>
                        </p>
                      )}
                      {selectedTaxRegime.faturamentoLimite && (
                        <p className="text-xs">
                          Limite de faturamento: R$ {selectedTaxRegime.faturamentoLimite.toLocaleString()}
                        </p>
                      )}
                      <div>
                        <p className="text-xs font-medium mb-1">Impostos inclusos:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {Object.entries(selectedTaxRegime.rates)
                            .filter(([, rate]) => rate > 0)
                            .map(([tax, rate]) => (
                            <div key={tax} className="flex justify-between">
                              <span>{tax.toUpperCase()}:</span>
                              <span>{rate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="competitor-analysis"
                    checked={formData.enableCompetitorAnalysis}
                    onCheckedChange={(checked) => handleInputChange('enableCompetitorAnalysis', checked)}
                  />
                  <Label htmlFor="competitor-analysis">
                    Análise de Concorrência Automática
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleCalculate}
              disabled={isLoading || !formData.cost}
              size="lg"
              className="bg-brand-600 hover:bg-brand-700 px-8"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isLoading ? "Calculando..." : "Calcular Preço PRO"}
            </Button>
          </div>

          {result && (
            <AdvancedCalculatorResult result={result} />
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {result?.competitorAnalysis ? (
            <CompetitorAnalysisDisplay 
              analysis={result.competitorAnalysis}
              sellingPrice={result.sellingPrice}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Análise de Concorrência</h3>
                <p className="text-gray-500 mb-4">
                  Execute um cálculo com análise de concorrência habilitada para ver os dados aqui.
                </p>
                <Button variant="outline" onClick={() => handleInputChange('enableCompetitorAnalysis', true)}>
                  Habilitar Análise Automática
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tax-analysis" className="space-y-6">
          <TaxAnalysisTab 
            result={result}
            currentBusinessActivity={formData.businessActivity}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações PRO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidades de configuração avançadas estarão disponíveis em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
