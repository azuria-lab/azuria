
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Settings, Store, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { useCalculator } from "@/hooks/useCalculator";
import { useCompetitors } from "@/hooks/useCompetitors";
import { marketplaces } from "@/data/marketplaces";
import { MARKETPLACE_TEMPLATES, type MarketplaceTemplate } from "@/types/marketplaceTemplates";

// Pro Components
import MarketplaceTemplateSelector from "./pro/MarketplaceTemplateSelector";
import ICMSCalculator from "./pro/ICMSCalculator";
import MarketplaceComparison from "./pro/MarketplaceComparison";

// Tab Components
import BasicTabContent from "./tabs/BasicTabContent";
import AdvancedTabContent from "./tabs/AdvancedTabContent";
import ScenariosTabContent from "./tabs/ScenariosTabContent";

interface ProCalculatorProps {
  userId?: string;
}

export default function ProCalculator({ userId }: ProCalculatorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  
  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState("mercado-livre");
  const [customTemplates, setCustomTemplates] = useState<MarketplaceTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<MarketplaceTemplate | null>(null);
  
  // Tax State
  const [totalTaxRate, setTotalTaxRate] = useState(0);
  const [taxBreakdown, setTaxBreakdown] = useState<Record<string, number>>({});
  
  // Calculation State
  const [productCost, setProductCost] = useState<number>(0);
  const [targetProfit, setTargetProfit] = useState<number>(30);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  
  // User plan check
  const [isPro] = useState(true); // TODO: Get from auth context
  const [isPremium] = useState(true); // TODO: Get from subscription
  
  const [productInfo, setProductInfo] = useState({ name: "", sku: "", category: "" });
  
  // Template handlers
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = [...MARKETPLACE_TEMPLATES, ...customTemplates].find(t => t.id === templateId);
    setCurrentTemplate(template || null);
  };

  const handleTemplateCustomize = (template: MarketplaceTemplate) => {
    // Create custom template
    const customTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdBy: userId,
      createdAt: new Date()
    };
    
    setCustomTemplates(prev => [...prev, customTemplate]);
    setSelectedTemplate(customTemplate.id);
    setCurrentTemplate(customTemplate);
    
    toast({
      title: "Template customizado",
      description: `Template "${template.name}" foi customizado e salvo.`
    });
  };

  const handleTaxCalculated = (totalTax: number, breakdown: Record<string, number>) => {
    setTotalTaxRate(totalTax);
    setTaxBreakdown(breakdown);
  };

  const handleMarketplaceSelect = (template: MarketplaceTemplate, sellingPrice: number) => {
    setSelectedTemplate(template.id);
    setCurrentTemplate(template);
    setCalculatedPrice(sellingPrice);
    setActiveTab("result");
    
    toast({
      title: "Marketplace selecionado",
      description: `Configuração do ${template.name} aplicada com sucesso.`
    });
  };

  // Calculate final price based on current template and taxes
  React.useEffect(() => {
    if (currentTemplate && productCost > 0) {
      const templateFees = 
        currentTemplate.defaultValues.commission +
        currentTemplate.defaultValues.paymentFee +
        (currentTemplate.defaultValues.advertisingFee || 0) +
        (currentTemplate.defaultValues.fulfillmentFee || 0) +
        (currentTemplate.defaultValues.storageFee || 0);

      const totalCost = productCost;
      const targetProfitAmount = (targetProfit / 100) * totalCost;
      const basePrice = totalCost + targetProfitAmount;
      
      const totalFeeRate = (templateFees + totalTaxRate) / 100;
      const finalPrice = basePrice / (1 - totalFeeRate);
      
      setCalculatedPrice(finalPrice);
    }
  }, [currentTemplate, productCost, targetProfit, totalTaxRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Header with Pro Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Calculadora Pro com Templates</CardTitle>
                <CardDescription>
                  Templates de marketplaces, impostos interestaduais e comparação avançada
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <Store className="h-3 w-3 mr-1" />
                PRO
              </Badge>
              {isPremium && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="calculate">Calcular</TabsTrigger>
          <TabsTrigger value="compare">Comparar</TabsTrigger>
          <TabsTrigger value="result">Resultado</TabsTrigger>
        </TabsList>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <MarketplaceTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            onTemplateCustomize={handleTemplateCustomize}
            isPro={isPro}
            customTemplates={customTemplates}
          />
          
          {currentTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximo Passo</CardTitle>
                <CardDescription>
                  Configure os impostos ou prossiga para o cálculo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button onClick={() => setActiveTab("taxes")} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Impostos
                </Button>
                <Button onClick={() => setActiveTab("calculate")}>
                  Prosseguir para Cálculo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tax Calculator Tab */}
        <TabsContent value="taxes" className="space-y-6">
          <ICMSCalculator
            onTaxCalculated={handleTaxCalculated}
            isPremium={isPremium}
            productValue={productCost}
          />
          
          {totalTaxRate > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo dos Impostos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Total de Impostos</div>
                    <div className="text-xl font-bold text-primary">{totalTaxRate.toFixed(2)}%</div>
                  </div>
                  {Object.entries(taxBreakdown).map(([tax, rate]) => (
                    rate > 0 && (
                      <div key={tax} className="text-center p-2 bg-muted rounded-lg">
                        <div className="text-xs font-medium uppercase">{tax}</div>
                        <div className="text-lg font-bold">{rate.toFixed(2)}%</div>
                      </div>
                    )
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setActiveTab("calculate")}>
                    Prosseguir para Cálculo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Calculate Tab */}
        <TabsContent value="calculate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Produto</CardTitle>
              <CardDescription>
                Insira as informações básicas para calcular o preço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custo do Produto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productCost}
                    onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Margem Desejada (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="30"
                  />
                </div>
              </div>
              
              {calculatedPrice > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-700">Preço Calculado</div>
                    <div className="text-3xl font-bold text-green-800">
                      {formatCurrency(calculatedPrice)}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Lucro líquido: {formatCurrency(calculatedPrice - productCost - (calculatedPrice * (totalTaxRate + (currentTemplate?.defaultValues.commission || 0) + (currentTemplate?.defaultValues.paymentFee || 0)) / 100))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("compare")}>
                  Comparar Marketplaces
                </Button>
                <Button onClick={() => setActiveTab("result")} disabled={calculatedPrice === 0}>
                  Ver Resultado Detalhado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <MarketplaceComparison
            productCost={productCost}
            targetProfit={targetProfit}
            taxRate={totalTaxRate}
            onResultSelect={handleMarketplaceSelect}
          />
        </TabsContent>

        {/* Result Tab */}
        <TabsContent value="result" className="space-y-6">
          {currentTemplate && calculatedPrice > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Resultado Final - {currentTemplate.name}
                </CardTitle>
                <CardDescription>
                  Breakdown completo do preço e custos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Preço Principal */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">Preço de Venda Sugerido</div>
                    <div className="text-4xl font-bold text-blue-800">
                      {formatCurrency(calculatedPrice)}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium">Custo</div>
                      <div className="text-lg font-bold">{formatCurrency(productCost)}</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium">Margem Desejada</div>
                      <div className="text-lg font-bold">{targetProfit}%</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium">Impostos</div>
                      <div className="text-lg font-bold">{totalTaxRate.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm font-medium">Taxas Marketplace</div>
                      <div className="text-lg font-bold">
                        {((currentTemplate.defaultValues.commission + currentTemplate.defaultValues.paymentFee)).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete o cálculo para ver o resultado detalhado
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
