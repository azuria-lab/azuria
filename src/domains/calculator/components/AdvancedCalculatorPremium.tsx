/**
 * Calculadora Avançada Premium
 * 
 * Versão premium e limpa estilo Apple da Calculadora Avançada.
 * Principal ferramenta do projeto para precificação em marketplaces.
 */

import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdvancedCalculator } from "../hooks/useAdvancedCalculator";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_TEMPLATES_CONFIG, type MarketplaceTemplateConfig } from "@/data/marketplaceTemplatesConfig";
import TemplateSelectorSection from "./sections/TemplateSelectorSection";
import TemplateSelectionSection from "./sections/TemplateSelectionSection";
import ProductInputSection from "./sections/ProductInputSection";
import CostInputSection from "./sections/CostInputSection";
import MarginSection from "./sections/MarginSection";
import ActionButtonsSection from "./sections/ActionButtonsSection";
import ResultDisplaySection from "./sections/ResultDisplaySection";
import BreakdownSection from "./sections/BreakdownSection";
import { ArrowLeft } from "lucide-react";

interface AdvancedCalculatorPremiumProps {
  userId?: string;
}

export interface CalculatorFormData {
  // Template
  templateId: string | null;
  marketplaceId: string;
  
  // Produto
  productName: string;
  cost: string;
  
  // Marketplace
  marketplaceFee: string;
  paymentFee: string;
  includePaymentFee: boolean;
  
  // Custos operacionais
  shipping: string;
  packaging: string;
  marketing: string;
  otherCosts: string;
  
  // Margem
  targetMargin: string;
}

const defaultFormData: CalculatorFormData = {
  templateId: null,
  marketplaceId: "mercadolivre",
  productName: "",
  cost: "",
  marketplaceFee: "13.5",
  paymentFee: "4.99",
  includePaymentFee: false,
  shipping: "0",
  packaging: "0",
  marketing: "0",
  otherCosts: "0",
  targetMargin: "30",
};

export default function AdvancedCalculatorPremium({ userId: _userId }: AdvancedCalculatorPremiumProps) {
  const location = useLocation();
  const { toast } = useToast();
  const { isLoading: isCalculating } = useAdvancedCalculator();
  
  const [formData, setFormData] = useState<CalculatorFormData>(defaultFormData);
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplateConfig | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(true);

  // Apply template configuration
  const applyTemplate = useCallback((template: MarketplaceTemplateConfig) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      marketplaceId: template.marketplaceId,
      marketplaceFee: template.marketplaceFee.toString(),
      paymentFee: template.paymentFee.toString(),
      includePaymentFee: template.includePaymentFee,
      shipping: template.shipping.toString(),
      packaging: template.packaging.toString(),
      marketing: template.marketing.toString(),
      otherCosts: template.otherCosts.toString(),
      targetMargin: template.targetMargin.toString(),
    }));
    setShowTemplateSelection(false);
  }, []);

  // Apply template from location.state (when coming from templates page)
  useEffect(() => {
    const state = location.state as { 
      template?: { default_values: Record<string, unknown>; name: string; description?: string }; 
      templateId?: string | null;
      templateName?: string;
    } | null;
    
    if (state?.template) {
      // Se temos um templateId válido, buscar do MARKETPLACE_TEMPLATES_CONFIG
      if (state.templateId && MARKETPLACE_TEMPLATES_CONFIG[state.templateId]) {
        const templateConfig = MARKETPLACE_TEMPLATES_CONFIG[state.templateId];
        applyTemplate(templateConfig);
        toast({
          title: "Template aplicado!",
          description: `Template "${templateConfig.name}" foi aplicado com sucesso.`,
        });
      } else if (state.template.default_values) {
        // Caso contrário, aplicar dados do template diretamente (templates rápidos)
        const defaults = state.template.default_values;
        const getString = (key: string, fallback = '0'): string => {
          const value = defaults[key];
          return typeof value === 'string' ? value : (typeof value === 'number' ? value.toString() : fallback);
        };
        const getBoolean = (key: string, fallback = false): boolean => {
          const value = defaults[key];
          return typeof value === 'boolean' ? value : fallback;
        };

        setFormData(prev => ({
          ...prev,
          cost: getString('cost'),
          targetMargin: getString('margin', getString('targetMargin', '30')),
          marketplaceFee: getString('cardFee', getString('marketplaceFee', '0')),
          paymentFee: getString('paymentFee', '0'),
          includePaymentFee: getBoolean('includePaymentFee', false),
          shipping: getString('shipping'),
          packaging: getString('packaging', '0'),
          marketing: getString('marketing', '0'),
          otherCosts: getString('otherCosts', '0'),
        }));

        setShowTemplateSelection(false);
        toast({
          title: "Template aplicado!",
          description: `Template "${state.templateName || state.template.name}" foi aplicado com sucesso.`,
        });
      }
      
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast, applyTemplate]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof CalculatorFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate price
  const handleCalculate = useCallback(async () => {
    const cost = parseFloat(formData.cost) || 0;
    const targetMargin = parseFloat(formData.targetMargin) || 30;
    const marketplaceFee = parseFloat(formData.marketplaceFee) || 0;
    const paymentFee = parseFloat(formData.paymentFee) || 0;
    const shipping = parseFloat(formData.shipping) || 0;
    const packaging = parseFloat(formData.packaging) || 0;
    const marketing = parseFloat(formData.marketing) || 0;
    const otherCosts = parseFloat(formData.otherCosts) || 0;

    if (cost <= 0) {
      toast({
        title: "Custo inválido",
        description: "Por favor, informe o custo do produto.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total operational costs
    const totalOperationalCosts = cost + shipping + packaging + marketing + otherCosts;
    
    // Calculate base price with target margin (before fees)
    // Preço base = custos / (1 - margem/100)
    const basePrice = totalOperationalCosts / (1 - targetMargin / 100);
    
    // Calculate fees as percentage of selling price
    const effectivePaymentFeePercent = formData.includePaymentFee ? 0 : paymentFee;
    const totalFeePercent = marketplaceFee + effectivePaymentFeePercent;
    
    // Calculate selling price considering fees
    // Preço final = preço base / (1 - taxa total/100)
    const sellingPrice = basePrice / (1 - totalFeePercent / 100);
    
    // Calculate actual fees amount
    const effectiveMarketplaceFee = (sellingPrice * marketplaceFee) / 100;
    const effectivePaymentFee = formData.includePaymentFee ? 0 : (sellingPrice * paymentFee) / 100;
    const totalFees = effectiveMarketplaceFee + effectivePaymentFee;
    
    // Calculate profit
    const profit = sellingPrice - totalOperationalCosts - totalFees;
    const realMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    // Set result
    setResult({
      sellingPrice,
      profit,
      totalCosts: totalOperationalCosts,
      totalFees,
      realMargin,
      breakdown: {
        cost,
        shipping,
        packaging,
        marketing,
        otherCosts,
        marketplaceFee: effectiveMarketplaceFee,
        paymentFee: effectivePaymentFee,
      },
    });

    toast({
      title: "Cálculo realizado!",
      description: `Preço sugerido: R$ ${sellingPrice.toFixed(2)}`,
    });
  }, [formData, toast]);

  // Reset calculator
  const handleReset = useCallback(() => {
    setFormData(defaultFormData);
    setSelectedTemplate(null);
    setResult(null);
  }, []);

  // Handle template selection from initial screen
  const handleTemplateSelection = useCallback((template: MarketplaceTemplateConfig) => {
    applyTemplate(template);
  }, [applyTemplate]);

  // Handle back to template selection
  const handleBackToSelection = useCallback(() => {
    setShowTemplateSelection(true);
    setResult(null);
  }, []);

  // Show template selection screen first
  if (showTemplateSelection && !selectedTemplate) {
    return (
      <div className="space-y-6">
        <TemplateSelectionSection onTemplateSelect={handleTemplateSelection} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBackToSelection}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Seleção de Templates
      </Button>

      {/* Template Selector */}
      <TemplateSelectorSection
        selectedTemplate={selectedTemplate}
        onTemplateSelect={applyTemplate}
      />

      {/* Product Input */}
      <ProductInputSection
        productName={formData.productName}
        cost={formData.cost}
        onProductNameChange={(value) => handleInputChange("productName", value)}
        onCostChange={(value) => handleInputChange("cost", value)}
      />

      {/* Cost Inputs */}
      <CostInputSection
        marketplaceFee={formData.marketplaceFee}
        paymentFee={formData.paymentFee}
        includePaymentFee={formData.includePaymentFee}
        shipping={formData.shipping}
        packaging={formData.packaging}
        marketing={formData.marketing}
        otherCosts={formData.otherCosts}
        onInputChange={handleInputChange}
      />

      {/* Margin Section */}
      <MarginSection
        margin={parseFloat(formData.targetMargin) || 30}
        onMarginChange={(value) => handleInputChange("targetMargin", value.toString())}
      />

      {/* Action Buttons */}
      <ActionButtonsSection
        onCalculate={handleCalculate}
        onReset={handleReset}
        isLoading={isCalculating}
        hasResult={!!result}
      />

      {/* Result Display */}
      {result && (
        <ResultDisplaySection result={result} />
      )}

      {/* Breakdown Section */}
      {result && (
        <BreakdownSection breakdown={result.breakdown} />
      )}
    </div>
  );
}
