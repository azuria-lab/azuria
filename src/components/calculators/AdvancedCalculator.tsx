import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Brain,
  Calculator, 
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  History,
  Info,
  Loader2,
  Lock,
  Package, 
  Percent,
  Save,
  Sparkles,
  Store,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp, 
  Truck
} from "lucide-react";
import { useAdvancedCalculator } from "@/domains/calculator/hooks/useAdvancedCalculator";
import { useUserMarketplaceTemplates } from "@/hooks/useUserMarketplaceTemplates";
import { useAdvancedCalculatorHistory } from "@/hooks/useAdvancedCalculatorHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Feature Imports - 10 Premium Features
import MultiMarketplaceComparison from "@/components/calculators/MultiMarketplaceComparison";
import ScenarioSimulator from "@/components/calculators/ScenarioSimulator";
import AIPriceSuggestions from "@/components/calculators/AIPriceSuggestions";
import BreakEvenROI from "@/components/calculators/BreakEvenROI";
import DiscountAnalyzer from "@/components/calculators/DiscountAnalyzer";
import PriceHistory from "@/components/calculators/PriceHistory";
import CostBreakdown from "@/components/calculators/CostBreakdown";

interface AdvancedCalculatorProps {
  userId?: string;
}

// Tipos
interface CalculationHistory {
  id: string;
  timestamp: Date;
  cost: number;
  margin: number;
  finalPrice: number;
  marketplace: string;
}

// Marketplace Icons Mapping - Usando emojis temporariamente
// TODO: Substituir por logos oficiais em SVG quando disponível
const MARKETPLACE_ICONS: Record<string, string> = {
  mercadolivre: "�", // Mercado Livre - amarelo
  shopee: "�", // Shopee - laranja
  amazon: "�", // Amazon - marrom/dourado
  magalu: "🔵", // Magazine Luiza - azul
  custom: "🏪" // Loja Própria
};

// Marketplace Logos - URLs oficiais (placeholder para futuro)
const _MARKETPLACE_LOGOS: Record<string, string> = {
  mercadolivre: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png",
  shopee: "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/d91264e165ed6facc6178994d5afae79.png",
  amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  magalu: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Magazine_Luiza_logo.svg",
  custom: ""
};

// Marketplace Templates
interface MarketplaceTemplate {
  id: string;
  name: string;
  icon: string;
  defaultFee: number;
  includePaymentFee: boolean;
  shippingPolicy: string;
  extraCommissions: string[];
  colors: {
    primary: string;
    secondary: string;
  };
}

const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "mercadolivre",
    name: "Mercado Livre",
    icon: "🛒",
    defaultFee: 16,
    includePaymentFee: false,
    shippingPolicy: "Taxa já inclusa na comissão",
    extraCommissions: ["Mercado Livre Full (+2%)", "Anúncio Premium (+1%)"],
    colors: { primary: "#FFE600", secondary: "#2D3277" }
  },
  {
    id: "shopee",
    name: "Shopee",
    icon: "🛍️",
    defaultFee: 14,
    includePaymentFee: false,
    shippingPolicy: "Frete por conta do vendedor",
    extraCommissions: ["Shopee Premium (+1.5%)"],
    colors: { primary: "#EE4D2D", secondary: "#F05F3C" }
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: "📦",
    defaultFee: 15,
    includePaymentFee: false,
    shippingPolicy: "FBA disponível",
    extraCommissions: ["Amazon Prime (+3%)", "FBA (+5%)"],
    colors: { primary: "#FF9900", secondary: "#146EB4" }
  },
  {
    id: "magalu",
    name: "Magazine Luiza",
    icon: "�",
    defaultFee: 18,
    includePaymentFee: false,
    shippingPolicy: "Split com marketplace",
    extraCommissions: ["Magalu Entrega (+2%)"],
    colors: { primary: "#0086FF", secondary: "#003D7A" }
  },
  {
    id: "custom",
    name: "Loja Própria / ERP",
    icon: "�🏪",
    defaultFee: 0,
    includePaymentFee: true,
    shippingPolicy: "Configurável",
    extraCommissions: [],
    colors: { primary: "#8B5CF6", secondary: "#6D28D9" }
  }
];

// Component para número animado
const AnimatedNumber: React.FC<{ value: number; decimals?: number; prefix?: string }> = memo(({ 
  value, 
  decimals = 2, 
  prefix = "" 
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 400;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out para suavizar o final da animação
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, displayValue]);

  return (
    <span className="inline-block transition-opacity duration-200">
      {prefix}{displayValue.toFixed(decimals)}
    </span>
  );
});

AnimatedNumber.displayName = "AnimatedNumber";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

export default function AdvancedCalculator({ userId: _userId }: AdvancedCalculatorProps) {
  const {
    calculateAdvancedPrice,
    marketplaces
  } = useAdvancedCalculator();

  const {
    templates: userTemplates,
    getDefaultTemplate,
    getTemplatesForMarketplace,
    saveTemplate,
    deleteTemplate,
    setAsDefault,
  } = useUserMarketplaceTemplates();

  const {
    history: advancedHistory,
    saveCalculation: saveToHistory,
    isLoading: isHistoryLoading,
  } = useAdvancedCalculatorHistory();

  // Estados
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCostsCollapse, setShowCostsCollapse] = useState(true);

  const [formData, setFormData] = useState({
    cost: "",
    productName: "",
    productCategory: "",
    targetMargin: "30",
    marketplaceId: "mercadolivre",
    shipping: "",
    packaging: "",
    marketing: "",
    otherCosts: "",
    paymentMethod: "credit_card",
    paymentFee: "2.5",
    calculationMode: "direct",
    manualPrice: "",
    includePaymentFee: true
  });

  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplatesList, setShowTemplatesList] = useState(false);

  const [realtimeResults, setRealtimeResults] = useState({
    suggestedPrice: 0,
    netProfit: 0,
    totalMargin: 0,
    totalCosts: 0,
    totalFees: 0
  });

  // Sensitivity Analysis states
  const [costVariation, setCostVariation] = useState(0);
  const [marginVariation, setMarginVariation] = useState(0);
  const [shippingVariation, setShippingVariation] = useState(0);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Apply marketplace template
  const applyMarketplaceTemplate = (marketplaceId: string) => {
    // First, check if user has a default template for this marketplace
    const defaultUserTemplate = getDefaultTemplate(marketplaceId);
    
    if (defaultUserTemplate) {
      // Apply user's custom template
      setFormData(prev => ({
        ...prev,
        marketplaceId: marketplaceId,
        shipping: defaultUserTemplate.shipping.toString(),
        packaging: defaultUserTemplate.packaging.toString(),
        marketing: defaultUserTemplate.marketing.toString(),
        otherCosts: defaultUserTemplate.other_costs.toString(),
        paymentMethod: defaultUserTemplate.payment_method,
        paymentFee: defaultUserTemplate.payment_fee.toString(),
        includePaymentFee: defaultUserTemplate.include_payment_fee,
        targetMargin: defaultUserTemplate.target_margin.toString(),
      }));

      toast({
        title: `💾 Template "${defaultUserTemplate.template_name}"`,
        description: `Template personalizado carregado com sucesso!`,
      });
    } else {
      // Apply system template
      const template = MARKETPLACE_TEMPLATES.find(t => t.id === marketplaceId);
      if (template) {
        setAppliedTemplate(template);
        setFormData(prev => ({
          ...prev,
          marketplaceId: template.id,
          includePaymentFee: template.includePaymentFee
        }));

        toast({
          title: `${template.icon} Template Aplicado`,
          description: `Configurações do ${template.name} carregadas com sucesso.`,
        });
      }
    }
  };

  // Save current configuration as template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: '⚠️ Nome Obrigatório',
        description: 'Digite um nome para o template.',
        variant: 'destructive',
      });
      return;
    }

    const result = await saveTemplate({
      marketplace_id: formData.marketplaceId,
      template_name: templateName,
      shipping: Number.parseFloat(formData.shipping) || 0,
      packaging: Number.parseFloat(formData.packaging) || 0,
      marketing: Number.parseFloat(formData.marketing) || 0,
      other_costs: Number.parseFloat(formData.otherCosts) || 0,
      payment_method: formData.paymentMethod,
      payment_fee: Number.parseFloat(formData.paymentFee) || 0,
      include_payment_fee: formData.includePaymentFee,
      target_margin: Number.parseFloat(formData.targetMargin) || 30,
      is_default: false,
    });

    if (result) {
      setShowSaveTemplateDialog(false);
      setTemplateName("");
    }
  };

  // Load user template
  const handleLoadUserTemplate = (templateId: string) => {
    const template = userTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        marketplaceId: template.marketplace_id,
        shipping: template.shipping.toString(),
        packaging: template.packaging.toString(),
        marketing: template.marketing.toString(),
        otherCosts: template.other_costs.toString(),
        paymentMethod: template.payment_method,
        paymentFee: template.payment_fee.toString(),
        includePaymentFee: template.include_payment_fee,
        targetMargin: template.target_margin.toString(),
      }));

      toast({
        title: `💾 Template "${template.template_name}"`,
        description: 'Template carregado com sucesso!',
      });
    }
  };

  // Calculate real-time results with validation
  useEffect(() => {
    setIsCalculating(true);

    const timer = setTimeout(() => {
      const cost = Number.parseFloat(formData.cost) || 0;
      const margin = Number.parseFloat(formData.targetMargin) || 0;
      const shipping = Number.parseFloat(formData.shipping) || 0;
      const packaging = Number.parseFloat(formData.packaging) || 0;
      const marketing = Number.parseFloat(formData.marketing) || 0;
      const otherCosts = Number.parseFloat(formData.otherCosts) || 0;
      const paymentFee = Number.parseFloat(formData.paymentFee) || 0;

      const marketplace = marketplaces.find(m => m.id === formData.marketplaceId);
      const marketplaceFee = marketplace ? marketplace.fee : 0;

      const totalAdditionalCosts = shipping + packaging + marketing + otherCosts;
      const totalCosts = cost + totalAdditionalCosts;

      // Decidir se usa taxa de pagamento
      const effectivePaymentFee = formData.includePaymentFee ? paymentFee : 0;
      const totalFeesPercent = marketplaceFee + effectivePaymentFee;

      if (formData.calculationMode === "direct") {
        // Modo Direto: Calcula preço a partir da margem
        const profitAmount = cost * (margin / 100);
        const priceBeforeFees = totalCosts + profitAmount;
        const suggestedPrice = priceBeforeFees / (1 - totalFeesPercent / 100);
        const totalFees = suggestedPrice * (totalFeesPercent / 100);
        const netProfit = suggestedPrice - totalCosts - totalFees;
        const totalMargin = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

        setRealtimeResults({
          suggestedPrice: suggestedPrice,
          netProfit: netProfit,
          totalMargin: totalMargin,
          totalCosts: totalCosts,
          totalFees: totalFees
        });
      } else if (formData.calculationMode === "reverse") {
        // Modo Reverso: Calcula margem a partir do preço manual
        const manualPrice = Number.parseFloat(formData.manualPrice) || 0;
        const totalFees = manualPrice * (totalFeesPercent / 100);
        const netProfit = manualPrice - totalCosts - totalFees;
        const totalMargin = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

        setRealtimeResults({
          suggestedPrice: manualPrice,
          netProfit: netProfit,
          totalMargin: totalMargin,
          totalCosts: totalCosts,
          totalFees: totalFees
        });

        // Validações inteligentes
        if (cost > 0 && netProfit < 0) {
          toast({
            title: "⚠️ Atenção: Prejuízo Detectado",
            description: `Seu lucro líquido é negativo (R$ ${netProfit.toFixed(2)}). Revise custos ou aumente a margem.`,
            variant: "destructive"
          });
        } else if (cost > 0 && totalMargin > 0 && totalMargin < 5) {
          toast({
            title: "📊 Alerta: Margem Crítica",
            description: `Margem total de apenas ${totalMargin.toFixed(2)}%. Considere aumentar o preço.`,
            variant: "default"
          });
        }
      }

      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, marketplaces]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('azuria-calculation-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Converter timestamps string para Date
        const historyWithDates = parsed.map((entry: CalculationHistory) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setHistory(historyWithDates);
      } catch {
        // Erro ao carregar histórico - ignorar silenciosamente
      }
    }
  }, []);

  // Salvar histórico no localStorage quando mudar
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('azuria-calculation-history', JSON.stringify(history));
    }
  }, [history]);

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  // Trigger calculation on step 3
  useEffect(() => {
    if (currentStep === 3 && formData.cost) {
      const params = {
        cost: Number.parseFloat(formData.cost) || 0,
        targetMargin: Number.parseFloat(formData.targetMargin) || 30,
        marketplaceId: formData.marketplaceId,
        taxRegimeId: "simples_comercio",
        shipping: Number.parseFloat(formData.shipping) || 0,
        otherCosts: (Number.parseFloat(formData.packaging) || 0) + 
                     (Number.parseFloat(formData.marketing) || 0) + 
                     (Number.parseFloat(formData.otherCosts) || 0),
        enableCompetitorAnalysis: false,
        productCategory: formData.productCategory,
        businessActivity: "comércio"
      };

      calculateAdvancedPrice(params);

      const newHistoryItem: CalculationHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        cost: params.cost,
        margin: params.targetMargin,
        finalPrice: realtimeResults.suggestedPrice,
        marketplace: formData.marketplaceId
      };

      setHistory(prev => {
        if (prev[0]?.id !== newHistoryItem.id) {
          return [newHistoryItem, ...prev].slice(0, 10);
        }
        return prev;
      });
    }
  }, [currentStep, formData, realtimeResults.suggestedPrice, calculateAdvancedPrice]);

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text("Azuria - Cálculo de Precificação", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Dados do Produto", 20, 45);
    doc.setFontSize(10);
    doc.text(`Produto: ${formData.productName || 'N/A'}`, 20, 55);
    doc.text(`Custo: R$ ${formData.cost}`, 20, 62);
    doc.text(`Margem Desejada: ${formData.targetMargin}%`, 20, 69);
    
    doc.setFontSize(14);
    doc.text("Resultados", 20, 85);
    doc.setFontSize(10);
    doc.text(`Preço Sugerido: R$ ${realtimeResults.suggestedPrice.toFixed(2)}`, 20, 95);
    doc.text(`Lucro Líquido: R$ ${realtimeResults.netProfit.toFixed(2)}`, 20, 102);
    doc.text(`Margem Total: ${realtimeResults.totalMargin.toFixed(2)}%`, 20, 109);
    doc.text(`Custos Totais: R$ ${realtimeResults.totalCosts.toFixed(2)}`, 20, 116);
    doc.text(`Taxas: R$ ${realtimeResults.totalFees.toFixed(2)}`, 20, 123);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Gerado por Azuria - Plataforma de Precificação Inteligente", 20, 280);
    doc.text("azuria.app.br", 20, 285);
    
    doc.save(`azuria-calculo-${Date.now()}.pdf`);

    toast({
      title: "✅ PDF Exportado",
      description: "Seu relatório foi baixado com sucesso!",
    });
  };

  // Apply scenario adjustment
  const applyScenario = (adjustment: number) => {
    const currentMargin = Number.parseFloat(formData.targetMargin) || 0;
    const newMargin = Math.max(0, Math.min(100, currentMargin + adjustment));
    handleInputChange('targetMargin', newMargin.toString());

    toast({
      title: adjustment > 0 ? "📈 Margem Aumentada" : "📉 Margem Reduzida",
      description: `Ajuste de ${adjustment > 0 ? '+' : ''}${adjustment}% aplicado`,
    });
  };

  const totalAdditionalCosts = 
    (Number.parseFloat(formData.shipping) || 0) +
    (Number.parseFloat(formData.packaging) || 0) +
    (Number.parseFloat(formData.marketing) || 0) +
    (Number.parseFloat(formData.otherCosts) || 0);

  const canProceedStep1 = formData.cost !== "";
  const canProceedStep2 = true;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Premium Header */}
        <motion.div 
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-6 md:p-8 shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Calculadora Avançada
                </h2>
                <p className="text-white/90 text-sm md:text-base">
                  Precificação profissional com análise completa
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge className="bg-white/20 backdrop-blur-xl border border-white/40 text-white px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Premium
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wizard Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-200 shadow-xl">
              <CardHeader className="space-y-4 pb-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-lg transition-all duration-300",
                            currentStep >= step
                              ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white ring-4 ring-brand-200"
                              : "bg-gray-200 text-gray-400",
                            step === 4 && "ring-green-200 bg-gradient-to-br from-green-500 to-emerald-600"
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {step === 4 ? '🏆' : step}
                        </motion.div>
                        <span className={cn(
                          "text-xs font-medium hidden md:block",
                          currentStep >= step ? "text-brand-600" : "text-gray-400",
                          step === 4 && currentStep >= step && "text-green-600"
                        )}>
                          {step === 1 && "Produto"}
                          {step === 2 && "Custos"}
                          {step === 3 && "Resultado"}
                          {step === 4 && "Comparar"}
                        </span>
                      </div>
                      {step < 4 && (
                        <div className={cn(
                          "flex-1 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500",
                          currentStep > step ? "bg-brand-500" : "bg-gray-200"
                        )} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6">
                <AnimatePresence mode="wait" custom={direction}>
                  {/* STEP 1: Dados do Produto */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-8"
                    >
                      {/* Header Premium */}
                      <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-brand-50 via-purple-50 to-blue-50 rounded-2xl border-2 border-brand-200 shadow-sm">
                        <motion.div 
                          className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Package className="h-7 w-7 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-1">
                            Dados do Produto
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Comece informando os dados básicos do produto que você deseja precificar
                          </p>
                        </div>
                      </div>

                      {/* Nome do Produto - Premium */}
                      <div className="space-y-3">
                        <Label htmlFor="product-name" className="flex items-center gap-2 text-xl font-bold">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                          >
                            <FileText className="h-6 w-6 text-brand-600" />
                          </motion.div>
                          <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">
                            Nome do Produto
                          </span>
                          <span className="text-sm text-gray-400 font-normal ml-auto">(Opcional)</span>
                        </Label>
                        <Input
                          id="product-name"
                          type="text"
                          placeholder="Ex: Tênis Esportivo Nike Air Max"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          className="h-16 text-xl font-semibold border-2 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200 hover:border-brand-300"
                        />
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Info className="h-4 w-4" />
                          Use um nome descritivo para facilitar a organização
                        </p>
                      </div>

                      {/* Categoria - Premium */}
                      <div className="space-y-3">
                        <Label htmlFor="category" className="flex items-center gap-2 text-xl font-bold">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                          >
                            <Tag className="h-6 w-6 text-purple-600" />
                          </motion.div>
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Categoria do Produto
                          </span>
                          <span className="text-sm text-gray-400 font-normal ml-auto">(Opcional)</span>
                        </Label>
                        <Select 
                          value={formData.productCategory} 
                          onValueChange={(value) => handleInputChange('productCategory', value)}
                        >
                          <SelectTrigger id="category" className="h-16 text-xl font-semibold border-2 focus:ring-4 focus:ring-purple-100 hover:border-purple-300 transition-all duration-200">
                            <SelectValue placeholder="Selecione a categoria do seu produto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eletronicos">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">📱</span>
                                <div>
                                  <p className="font-semibold">Eletrônicos</p>
                                  <p className="text-xs text-gray-500">Smartphones, notebooks, acessórios</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="moda">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">👕</span>
                                <div>
                                  <p className="font-semibold">Moda e Vestuário</p>
                                  <p className="text-xs text-gray-500">Roupas, calçados, acessórios</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="casa">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">🏠</span>
                                <div>
                                  <p className="font-semibold">Casa e Decoração</p>
                                  <p className="text-xs text-gray-500">Móveis, decoração, utilidades</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="esportes">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">⚽</span>
                                <div>
                                  <p className="font-semibold">Esportes e Fitness</p>
                                  <p className="text-xs text-gray-500">Equipamentos, roupas, suplementos</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="beleza">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">💄</span>
                                <div>
                                  <p className="font-semibold">Beleza e Cuidados</p>
                                  <p className="text-xs text-gray-500">Cosméticos, perfumes, skincare</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="outros">
                              <div className="flex items-center gap-3 py-1">
                                <span className="text-2xl">📦</span>
                                <div>
                                  <p className="font-semibold">Outros</p>
                                  <p className="text-xs text-gray-500">Outras categorias</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.productCategory && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <p className="text-sm text-purple-900">
                              ✓ Categoria selecionada ajuda na análise de mercado
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Templates Rápidos - Acesso rápido */}
                      <motion.div 
                        className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl border-2 border-pink-200 shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex-shrink-0">
                            <FolderOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                              Templates Rápidos
                            </h4>
                            <p className="text-xs text-gray-600 truncate">Carregue configurações</p>
                          </div>
                          <Link to="/templates" className="flex-shrink-0">
                            <Button variant="outline" size="sm" className="text-xs gap-1 hover:bg-purple-50">
                              Gerenciar
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>

                        {userTemplates.length > 0 ? (
                          <Select 
                            onValueChange={(templateId) => {
                              const template = userTemplates.find(t => t.id === templateId);
                              if (template) {
                                setFormData(prev => ({
                                  ...prev,
                                  marketplaceId: template.marketplace_id,
                                  shipping: template.shipping.toString(),
                                  packaging: template.packaging.toString(),
                                  marketing: template.marketing.toString(),
                                  otherCosts: template.other_costs.toString(),
                                  paymentMethod: template.payment_method,
                                  paymentFee: template.payment_fee.toString(),
                                  includePaymentFee: template.include_payment_fee,
                                  targetMargin: template.target_margin.toString(),
                                }));
                                
                                toast({
                                  title: `💾 Template "${template.template_name}" carregado`,
                                  description: "Configurações aplicadas com sucesso!",
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="h-12 border-2 border-pink-300 hover:border-pink-400 bg-white">
                              <SelectValue placeholder="Selecione um template para carregar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {userTemplates.slice(0, 5).map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{MARKETPLACE_ICONS[template.marketplace_id] || '🏪'}</span>
                                    <div>
                                      <p className="font-semibold">{template.template_name}</p>
                                      <p className="text-xs text-gray-500">
                                        Margem: {template.target_margin}% • {template.marketplace_id}
                                      </p>
                                    </div>
                                    {template.is_default && (
                                      <Badge variant="secondary" className="ml-auto text-xs">Padrão</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-center p-4 bg-white rounded-lg border-2 border-dashed border-pink-200">
                            <p className="text-sm text-gray-600 mb-2">Nenhum template salvo ainda</p>
                            <Link to="/templates">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                Criar meu primeiro template
                              </Button>
                            </Link>
                          </div>
                        )}
                      </motion.div>

                      {/* Custo do Produto - PREMIUM com formatação automática */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cost" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                            >
                              <DollarSign className="h-8 w-8 text-orange-600" />
                            </motion.div>
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              Custo do Produto
                            </span>
                            <Badge variant="destructive" className="ml-2 text-sm">Obrigatório</Badge>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.2, rotate: 15 }}>
                                <Info className="h-5 w-5 text-gray-400 hover:text-brand-600 cursor-help" />
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                              <p className="text-sm font-semibold mb-2">💰 O que incluir no custo?</p>
                              <ul className="text-xs space-y-1">
                                <li>• Valor pago na compra do fornecedor</li>
                                <li>• Custo de produção (se fabricar)</li>
                                <li>• Frete da compra (opcional)</li>
                                <li>• Impostos na entrada (opcional)</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        {/* Input Premium com formatação automática */}
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-3xl z-10">
                            R$
                          </div>
                          <Input
                            id="cost"
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={formData.cost ? Number.parseFloat(formData.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                            onChange={(e) => {
                              // Remove tudo que não é número
                              const rawValue = e.target.value.replace(/[^\d]/g, '');
                              // Converte centavos para reais
                              const numericValue = rawValue ? (Number.parseInt(rawValue, 10) / 100).toString() : '';
                              handleInputChange('cost', numericValue);
                            }}
                            className="pl-24 pr-6 h-24 text-5xl font-bold tracking-tight border-3 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 hover:border-orange-400 hover:shadow-xl bg-gradient-to-br from-white to-orange-50"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '0.02em' }}
                          />
                          {!formData.cost && (
                            <motion.div
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <span className="text-sm">Digite o valor...</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Feedback Visual */}
                        <AnimatePresence>
                          {formData.cost && Number.parseFloat(formData.cost) > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="grid grid-cols-2 gap-4"
                            >
                              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-sm">
                                <p className="text-xs text-orange-600 font-semibold mb-1">💰 Custo Unitário</p>
                                <p className="text-2xl font-bold text-orange-900">
                                  R$ {Number.parseFloat(formData.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-sm">
                                <p className="text-xs text-green-600 font-semibold mb-1">✓ Status</p>
                                <p className="text-lg font-bold text-green-900 flex items-center gap-2">
                                  <CheckCircle2 className="h-5 w-5" />
                                  Pronto
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Dicas inteligentes */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Dica Profissional</p>
                              <p className="text-xs text-blue-800 leading-relaxed">
                                Para precificação precisa, considere apenas o custo direto do produto. 
                                Custos adicionais (frete, embalagem, marketing) serão incluídos na próxima etapa.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation com validação visual */}
                      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          >
                            ⚡
                          </motion.div>
                          {canProceedStep1 ? (
                            <span className="text-green-600 font-semibold">Pronto para continuar!</span>
                          ) : (
                            <span>Preencha o custo para continuar</span>
                          )}
                        </div>
                        <Button
                          onClick={nextStep}
                          disabled={!canProceedStep1}
                          size="lg"
                          className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-10 h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próximo Passo
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <ChevronRight className="ml-2 h-6 w-6" />
                          </motion.div>
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Custos e Marketplace */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Custos e Marketplace</h3>
                          <p className="text-sm text-gray-500">
                            Configure suas taxas e despesas por marketplace para calcular automaticamente o preço de venda ideal.
                          </p>
                        </div>
                      </div>

                      {/* Modo de Cálculo */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
                        <Label className="flex items-center gap-2 text-base font-semibold mb-3">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Modo de Cálculo
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={formData.calculationMode === "direct" ? "default" : "outline"}
                            onClick={() => handleInputChange('calculationMode', 'direct')}
                            className="h-auto py-3 flex flex-col items-start gap-1"
                          >
                            <span className="font-bold">📊 Direto</span>
                            <span className="text-xs opacity-80">Definir margem → calcular preço</span>
                          </Button>
                          <Button
                            type="button"
                            variant={formData.calculationMode === "reverse" ? "default" : "outline"}
                            onClick={() => handleInputChange('calculationMode', 'reverse')}
                            className="h-auto py-3 flex flex-col items-start gap-1"
                          >
                            <span className="font-bold">🔄 Reverso</span>
                            <span className="text-xs opacity-80">Definir preço → calcular margem</span>
                          </Button>
                        </div>
                      </div>

                      {/* Margem de Lucro ou Preço Manual */}
                      {formData.calculationMode === "direct" ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-base font-semibold">
                              <Percent className="h-5 w-5 text-green-600" />
                              Margem de Lucro Desejada
                            </Label>
                            <Badge variant="outline" className="text-lg font-bold px-4 py-2">
                              {formData.targetMargin}%
                            </Badge>
                          </div>
                          
                          <Slider
                            value={[Number.parseFloat(formData.targetMargin) || 0]}
                            onValueChange={(value) => handleInputChange('targetMargin', value[0].toString())}
                            min={0}
                            max={100}
                            step={1}
                            className="py-4"
                          />

                          {/* Quick Margin Buttons */}
                          <div className="grid grid-cols-5 gap-2">
                            {[10, 20, 30, 40, 50].map(margin => (
                              <Button
                                key={margin}
                                variant="outline"
                                size="sm"
                                onClick={() => handleInputChange('targetMargin', margin.toString())}
                                className={cn(
                                  "h-10 font-semibold transition-all",
                                  formData.targetMargin === margin.toString()
                                    ? "bg-green-500 text-white border-green-600"
                                    : "hover:bg-green-50"
                                )}
                              >
                                {margin}%
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Label className="flex items-center gap-2 text-base font-semibold">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            Preço de Venda Final
                          </Label>
                          <Input
                            type="number"
                            value={formData.manualPrice}
                            onChange={(e) => handleInputChange('manualPrice', e.target.value)}
                            placeholder="Ex: 199.90"
                            className="text-xl font-bold h-14 focus:ring-4 focus:ring-blue-500/20"
                          />
                          <p className="text-sm text-gray-600">
                            💡 Digite o preço final e calcularemos sua margem real após todas as taxas.
                          </p>
                        </div>
                      )}

                      <Separator />

                      {/* Marketplace Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2 text-base font-semibold">
                            <Store className="h-5 w-5 text-brand-600" />
                            Marketplace
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyMarketplaceTemplate(formData.marketplaceId)}
                            className="h-8 text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Aplicar Template
                          </Button>
                        </div>
                        <Select 
                          value={formData.marketplaceId} 
                          onValueChange={(value) => {
                            handleInputChange('marketplaceId', value);
                            applyMarketplaceTemplate(value);
                          }}
                        >
                          <SelectTrigger className="h-12 border-2 focus:ring-4 focus:ring-brand-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {marketplaces.map(marketplace => (
                              <SelectItem key={marketplace.id} value={marketplace.id}>
                                <div className="flex items-center gap-3 w-full">
                                  <span className="text-xl">{MARKETPLACE_ICONS[marketplace.id]}</span>
                                  <span className="font-semibold">{marketplace.name}</span>
                                  <Badge variant="secondary" className="ml-auto">{marketplace.fee}%</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Template Preview */}
                        {appliedTemplate && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200"
                          >
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              {appliedTemplate.icon} Template {appliedTemplate.name}
                            </p>
                            <p className="text-xs text-blue-700">
                              📋 {appliedTemplate.shippingPolicy}
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              💰 Taxa: {appliedTemplate.defaultFee}% | Pagamento: {appliedTemplate.includePaymentFee ? 'Separado' : 'Incluso'}
                            </p>
                          </motion.div>
                        )}

                        {/* Save Template Button */}
                        <div className="flex gap-2">
                          <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-10"
                                size="sm"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar como Padrão
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>💾 Salvar Template Personalizado</DialogTitle>
                                <DialogDescription>
                                  Salve estas configurações para reutilizar no marketplace {formData.marketplaceId}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="template-name">Nome do Template</Label>
                                  <Input
                                    id="template-name"
                                    placeholder="Ex: Mercado Livre Full"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                  />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                                  <p className="font-medium">Configurações que serão salvas:</p>
                                  <p>• Frete: R$ {formData.shipping || "0.00"}</p>
                                  <p>• Embalagem: R$ {formData.packaging || "0.00"}</p>
                                  <p>• Marketing: R$ {formData.marketing || "0.00"}</p>
                                  <p>• Outros custos: R$ {formData.otherCosts || "0.00"}</p>
                                  <p>• Margem: {formData.targetMargin}%</p>
                                  <p>• Pagamento: {formData.includePaymentFee ? 'Incluído' : 'Separado'}</p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleSaveTemplate}>
                                  Salvar Template
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Templates List Button */}
                          {getTemplatesForMarketplace(formData.marketplaceId).length > 0 && (
                            <Dialog open={showTemplatesList} onOpenChange={setShowTemplatesList}>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10"
                                >
                                  <FolderOpen className="h-4 w-4 mr-2" />
                                  Meus Templates ({getTemplatesForMarketplace(formData.marketplaceId).length})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>📁 Templates Salvos</DialogTitle>
                                  <DialogDescription>
                                    Seus templates personalizados para {formData.marketplaceId}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 max-h-96 overflow-y-auto py-4">
                                  {getTemplatesForMarketplace(formData.marketplaceId).map(template => (
                                    <div
                                      key={template.id}
                                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                      <div className="flex-1">
                                        <p className="font-semibold">{template.template_name}</p>
                                        <p className="text-xs text-gray-600">
                                          Margem: {template.target_margin}% | Frete: R$ {template.shipping.toFixed(2)}
                                        </p>
                                        {template.is_default && (
                                          <Badge variant="secondary" className="mt-1">Padrão</Badge>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            handleLoadUserTemplate(template.id);
                                            setShowTemplatesList(false);
                                          }}
                                        >
                                          Carregar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setAsDefault(template.id)}
                                          disabled={template.is_default}
                                        >
                                          {template.is_default ? '✓ Padrão' : 'Definir Padrão'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => deleteTemplate(template.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      {/* Payment Method Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label className="text-base font-semibold cursor-pointer">
                                Incluir Taxa de Meio de Pagamento
                              </Label>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {formData.includePaymentFee 
                                  ? "Taxa será calculada separadamente" 
                                  : "Taxa já inclusa no marketplace"}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.includePaymentFee}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includePaymentFee: checked }))}
                          />
                        </div>

                        {formData.includePaymentFee && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            <Label className="flex items-center gap-2 text-sm font-medium">
                              Método de Pagamento
                            </Label>
                            <Select 
                              value={formData.paymentMethod} 
                              onValueChange={(value) => handleInputChange('paymentMethod', value)}
                            >
                              <SelectTrigger className="h-12 border-2 focus:ring-4 focus:ring-purple-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credit_card">💳 Cartão de Crédito (2.5%)</SelectItem>
                                <SelectItem value="debit_card">💳 Cartão de Débito (1.5%)</SelectItem>
                                <SelectItem value="pix">📱 PIX (0.5%)</SelectItem>
                                <SelectItem value="boleto">📄 Boleto (3.0%)</SelectItem>
                              </SelectContent>
                            </Select>

                            <div className="space-y-2">
                              <Label className="text-sm">Taxa (%)</Label>
                              <Input
                                type="number"
                                value={formData.paymentFee}
                                onChange={(e) => handleInputChange('paymentFee', e.target.value)}
                                placeholder="Ex: 2.5"
                                className="h-11 focus:ring-4 focus:ring-purple-100"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <Separator />

                      {/* Additional Costs Collapsible */}
                      <Collapsible open={showCostsCollapse} onOpenChange={setShowCostsCollapse}>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border-2 border-dashed"
                          >
                            <div className="flex items-center gap-2">
                              <Calculator className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold">Custos Adicionais (Opcional)</span>
                            </div>
                            {showCostsCollapse ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="shipping" className="flex items-center gap-2 text-sm">
                                <Truck className="h-4 w-4 text-blue-600" />
                                Frete
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <Input
                                  id="shipping"
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.shipping}
                                  onChange={(e) => handleInputChange('shipping', e.target.value)}
                                  className="pl-10 h-11 border-2 focus:ring-4 focus:ring-blue-100"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="packaging" className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-purple-600" />
                                Embalagem
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <Input
                                  id="packaging"
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.packaging}
                                  onChange={(e) => handleInputChange('packaging', e.target.value)}
                                  className="pl-10 h-11 border-2 focus:ring-4 focus:ring-purple-100"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="marketing" className="flex items-center gap-2 text-sm">
                                <Tag className="h-4 w-4 text-pink-600" />
                                Marketing
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <Input
                                  id="marketing"
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.marketing}
                                  onChange={(e) => handleInputChange('marketing', e.target.value)}
                                  className="pl-10 h-11 border-2 focus:ring-4 focus:ring-pink-100"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="other-costs" className="flex items-center gap-2 text-sm">
                                <Calculator className="h-4 w-4 text-orange-600" />
                                Outros
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <Input
                                  id="other-costs"
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.otherCosts}
                                  onChange={(e) => handleInputChange('otherCosts', e.target.value)}
                                  className="pl-10 h-11 border-2 focus:ring-4 focus:ring-orange-100"
                                />
                              </div>
                            </div>
                          </div>

                          {totalAdditionalCosts > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-orange-900">Total de Custos Adicionais</span>
                                <span className="text-lg font-bold text-orange-700">
                                  R$ {totalAdditionalCosts.toFixed(2)}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevStep}
                          variant="outline"
                          size="lg"
                          className="px-8"
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Voltar
                        </Button>
                        <Button
                          onClick={nextStep}
                          disabled={!canProceedStep2}
                          size="lg"
                          className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-8"
                        >
                          Calcular
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Resultado */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Resultado Final</h3>
                          <p className="text-sm text-gray-500">Análise completa da sua precificação</p>
                        </div>
                      </div>

                      {/* Results Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-900">Preço Sugerido</span>
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-700">
                              R$ <AnimatedNumber value={realtimeResults.suggestedPrice} />
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-900">Lucro Líquido</span>
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-700">
                              R$ <AnimatedNumber value={realtimeResults.netProfit} />
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-900">Margem Total</span>
                              <Percent className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-purple-700">
                              <AnimatedNumber value={realtimeResults.totalMargin} />%
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-orange-900">Total de Taxas</span>
                              <BarChart3 className="h-5 w-5 text-orange-600" />
                            </div>
                            <p className="text-3xl font-bold text-orange-700">
                              R$ <AnimatedNumber value={realtimeResults.totalFees} />
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Scenario Simulation */}
                      <Card className="border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-blue-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ArrowLeftRight className="h-5 w-5 text-brand-600" />
                            Simulação de Cenários
                          </CardTitle>
                          <CardDescription>Ajuste rápido de margem para ver o impacto</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyScenario(-10)}
                              className="hover:bg-red-50 hover:border-red-300"
                            >
                              <TrendingDown className="mr-1 h-4 w-4" />
                              -10%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyScenario(-5)}
                              className="hover:bg-orange-50 hover:border-orange-300"
                            >
                              <TrendingDown className="mr-1 h-4 w-4" />
                              -5%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyScenario(5)}
                              className="hover:bg-green-50 hover:border-green-300"
                            >
                              <TrendingUp className="mr-1 h-4 w-4" />
                              +5%
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyScenario(10)}
                              className="hover:bg-green-50 hover:border-green-300"
                            >
                              <TrendingUp className="mr-1 h-4 w-4" />
                              +10%
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          onClick={exportToPDF}
                          variant="outline"
                          className="h-12"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Exportar PDF
                        </Button>

                        <Button
                          onClick={() => setShowHistory(!showHistory)}
                          variant="outline"
                          className="h-12"
                        >
                          <History className="mr-2 h-4 w-4" />
                          Histórico ({history.length})
                        </Button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              disabled
                              variant="outline"
                              className="h-12 relative"
                            >
                              <Brain className="mr-2 h-4 w-4" />
                              Otimizar com IA
                              <Lock className="ml-2 h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>🔮 Em breve: IA para sugestões automáticas de preço</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* History */}
                      {showHistory && history.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Histórico de Cálculos</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {history.map((item) => (
                                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                                    <div>
                                      <p className="text-sm font-medium">R$ {item.cost.toFixed(2)} → R$ {item.finalPrice.toFixed(2)}</p>
                                      <p className="text-xs text-gray-500">{item.timestamp.toLocaleString('pt-BR')}</p>
                                    </div>
                                    <Badge variant="secondary">{item.margin}%</Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevStep}
                          variant="outline"
                          size="lg"
                          className="px-8"
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Voltar
                        </Button>
                        <div className="flex gap-3">
                          <Button
                            onClick={nextStep}
                            size="lg"
                            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-6"
                          >
                            🏆 Comparar Todos os Marketplaces
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentStep(1);
                              toast({
                                title: "✨ Novo Cálculo",
                                description: "Preencha os dados para um novo cálculo",
                              });
                            }}
                            size="lg"
                            variant="outline"
                            className="px-8"
                          >
                            Novo Cálculo
                            <Sparkles className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Multi-Marketplace Comparison */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            🏆 Comparação de Todos os Marketplaces
                          </h3>
                          <p className="text-muted-foreground">
                            Veja qual marketplace é mais lucrativo para seu produto
                          </p>
                        </div>
                      </div>

                      <MultiMarketplaceComparison
                        input={{
                          cost: Number(formData.cost) || 0,
                          targetMargin: Number(formData.targetMargin) || 0,
                          shipping: Number(formData.shipping) || 0,
                          packaging: Number(formData.packaging) || 0,
                          marketing: Number(formData.marketing) || 0,
                          otherCosts: Number(formData.otherCosts) || 0,
                          paymentMethod: formData.paymentMethod || 'credit',
                          includePaymentFee: formData.includePaymentFee !== false,
                        }}
                      />

                      {/* Navigation */}
                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevStep}
                          variant="outline"
                          size="lg"
                          className="px-8"
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Voltar aos Resultados
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentStep(1);
                            toast({
                              title: "✨ Novo Cálculo",
                              description: "Preencha os dados para um novo cálculo",
                            });
                          }}
                          size="lg"
                          className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-8"
                        >
                          Recalcular
                          <Sparkles className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PREMIUM FEATURES SECTION - After calculation */}
                {currentStep >= 3 && formData.cost && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 pt-8 border-t-2 border-brand-200"
                  >
                    {/* Premium Features Header */}
                    <div className="mb-6 text-center">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full text-white font-bold mb-4 shadow-lg">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        Recursos Premium
                      </div>
                      <h3 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
                        Recursos Premium de Precificação
                      </h3>
                      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Otimize suas estratégias com 9 ferramentas de análise profissional.
                      </p>
                    </div>

                    {/* Premium Features Tabs */}
                    <Tabs defaultValue="scenarios" className="w-full">
                      <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-2 h-auto bg-transparent p-0 mb-6">
                        <TabsTrigger 
                          value="scenarios" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                          <span className="hidden sm:inline">Cenários</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="ai" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                        >
                          <Brain className="h-4 w-4" />
                          <span>IA</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="breakeven" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                        >
                          <Target className="h-4 w-4" />
                          <span>ROI</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="discount" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                        >
                          <Tag className="h-4 w-4" />
                          <span className="hidden sm:inline">Descontos</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="history" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1 relative"
                        >
                          <History className="h-4 w-4" />
                          <span className="hidden sm:inline">Histórico</span>
                          {advancedHistory.length > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-1 h-5 min-w-5 px-1 text-xs bg-cyan-600 text-white"
                            >
                              {advancedHistory.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6 space-y-6">
                        {/* Tab: Scenario Simulator - Feature #2 */}
                        <TabsContent value="scenarios" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ScenarioSimulator
                              baseScenario={{
                                cost: Number(formData.cost) || 0,
                                targetMargin: Number(formData.targetMargin) || 30,
                                shipping: Number(formData.shipping) || 0,
                                packaging: Number(formData.packaging) || 0,
                                marketing: Number(formData.marketing) || 0,
                                otherCosts: Number(formData.otherCosts) || 0,
                                marketplace: formData.marketplaceId,
                                paymentMethod: formData.paymentMethod as 'credit' | 'debit' | 'pix' | 'boleto',
                                includePaymentFee: formData.includePaymentFee,
                                monthlyVolume: 100,
                              }}
                            />
                          </motion.div>
                        </TabsContent>

                        {/* Tab: AI Suggestions - Feature #3 */}
                        <TabsContent value="ai" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AIPriceSuggestions
                              input={{
                                cost: Number(formData.cost) || 0,
                                targetMargin: Number(formData.targetMargin) || 30,
                                shipping: Number(formData.shipping) || 0,
                                packaging: Number(formData.packaging) || 0,
                                marketing: Number(formData.marketing) || 0,
                                otherCosts: Number(formData.otherCosts) || 0,
                                marketplace: formData.marketplaceId,
                                paymentMethod: formData.paymentMethod as 'credit' | 'debit' | 'pix' | 'boleto',
                                includePaymentFee: formData.includePaymentFee,
                                monthlyVolume: 100,
                                productCategory: formData.productCategory || 'outros',
                                seasonality: 'normal',
                                brandStrength: 'established',
                              }}
                              onSelectPrice={(price) => {
                                handleInputChange('manualPrice', price.toString());
                                handleInputChange('calculationMode', 'reverse');
                                toast({
                                  title: "✅ Preço Aplicado",
                                  description: `Preço de R$ ${price.toFixed(2)} aplicado com sucesso`,
                                });
                              }}
                            />
                          </motion.div>
                        </TabsContent>

                        {/* Tab: Break-Even & ROI - Feature #5 */}
                        <TabsContent value="breakeven" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <BreakEvenROI
                              input={{
                                sellingPrice: realtimeResults.suggestedPrice,
                                costPrice: Number(formData.cost) || 0,
                                marketplace: formData.marketplaceId,
                                marketplaceFeePercent: 15,
                                shippingCost: Number(formData.shipping) || 0,
                                monthlyFixedCosts: (Number(formData.marketing) || 0) + (Number(formData.otherCosts) || 0),
                                initialInvestment: 5000,
                                averageDailySales: 10,
                                targetMonthlyProfit: 5000,
                              }}
                            />
                          </motion.div>
                        </TabsContent>

                        {/* Tab: Discount Analyzer - Feature #6 */}
                        <TabsContent value="discount" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <DiscountAnalyzer
                              input={{
                                sellingPrice: realtimeResults.suggestedPrice,
                                costPrice: Number(formData.cost) || 0,
                                marketplace: formData.marketplaceId,
                                marketplaceFeePercent: 15,
                                shippingCost: Number(formData.shipping) || 0,
                                additionalCosts: (Number(formData.packaging) || 0) + (Number(formData.marketing) || 0),
                                currentVolume: 100,
                                expectedVolumeIncrease: 20,
                              }}
                            />
                          </motion.div>
                        </TabsContent>

                        {/* Tab: Price History - Feature #7 - Integrado com dados reais do Supabase */}
                        <TabsContent value="history" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <PriceHistory 
                              entries={[
                                // Dados do Supabase (advancedHistory)
                                ...advancedHistory.map(h => ({
                                  id: h.id,
                                  date: h.date,
                                  price: h.suggestedPrice,
                                  cost: h.cost,
                                  marketplace: h.marketplaceId,
                                  marketplaceFee: 15,
                                  profit: h.netProfit,
                                  margin: h.totalMargin,
                                  notes: h.notes || `Cálculo salvo em ${h.date.toLocaleDateString('pt-BR')}`
                                })),
                                // Dados locais (fallback)
                                ...history.map(h => ({
                                  id: h.id,
                                  date: h.timestamp,
                                  price: h.finalPrice,
                                  cost: h.cost,
                                  marketplace: h.marketplace,
                                  marketplaceFee: 15,
                                  profit: h.finalPrice - h.cost - (h.finalPrice * 0.15),
                                  margin: h.margin,
                                  notes: `Cálculo local de ${h.timestamp.toLocaleDateString('pt-BR')}`
                                }))
                              ]}
                            />
                          </motion.div>
                        </TabsContent>
                      </div>

                      {/* Secondary Tabs Row */}
                      <div className="mt-6 pt-6 border-t-2 border-gray-100">
                        <TabsList className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-auto bg-transparent p-0 mb-6">
                          <TabsTrigger 
                            value="costs" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white py-3 px-3 text-xs flex items-center justify-center gap-1"
                          >
                            <Package className="h-4 w-4" />
                            <span>Custos</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="comparison" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                            <span className="hidden sm:inline">Antes/Depois</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="sensitivity" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white py-3 px-2 text-xs flex items-center justify-center gap-1"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Sensibilidade</span>
                          </TabsTrigger>
                        </TabsList>

                        {/* Tab: Cost Breakdown - Feature #8 */}
                        <TabsContent value="costs" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CostBreakdown
                              input={{
                                sellingPrice: realtimeResults.suggestedPrice,
                                productCost: Number(formData.cost) || 0,
                                shippingCost: Number(formData.shipping) || 0,
                                marketplaceFee: realtimeResults.totalFees,
                                taxes: 0,
                                packagingCost: Number(formData.packaging) || 0,
                                marketingCost: Number(formData.marketing) || 0,
                                operationalCost: Number(formData.otherCosts) || 0,
                              }}
                              industryType={formData.productCategory || 'default'}
                            />
                          </motion.div>
                        </TabsContent>

                        {/* Tab: Comparison Mode - Feature #9 - INLINE */}
                        <TabsContent value="comparison" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Header */}
                            <div className="mb-6">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                  <ArrowLeftRight className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-indigo-900">Antes x Depois</h3>
                                  <p className="text-gray-600">Compare seu cenário atual com melhorias propostas</p>
                                </div>
                              </div>
                            </div>

                            {/* Split Screen Comparison */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* ANTES - Current Scenario */}
                              <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                  <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5" />
                                    ANTES - Cenário Atual
                                  </CardTitle>
                                  <CardDescription className="text-red-100">
                                    Sua configuração atual de precificação
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                  {/* Metrics */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                      <span className="text-gray-700">Preço de Venda</span>
                                      <span className="text-2xl font-bold">
                                        R$ {realtimeResults.suggestedPrice.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                      <span className="text-gray-700">Lucro Líquido</span>
                                      <span className="text-xl font-bold text-green-600">
                                        R$ {realtimeResults.netProfit.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                      <span className="text-gray-700">Margem</span>
                                      <span className="text-xl font-bold text-blue-600">
                                        {realtimeResults.totalMargin.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Cost Breakdown */}
                                  <div className="space-y-2 pt-4 border-t">
                                    <p className="font-semibold text-sm text-gray-600">Custos:</p>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Produto:</span>
                                        <span>R$ {formData.cost || "0.00"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Frete:</span>
                                        <span>R$ {formData.shipping || "0.00"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Taxas:</span>
                                        <span>R$ {realtimeResults.totalFees.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* DEPOIS - Improved Scenario */}
                              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                  <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    DEPOIS - Cenário Melhorado
                                  </CardTitle>
                                  <CardDescription className="text-green-100">
                                    Com otimizações sugeridas (+10% margem)
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                  {/* Improved Metrics */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-green-300">
                                      <span className="text-gray-700">Preço de Venda</span>
                                      <span className="text-2xl font-bold text-green-700">
                                        R$ {(realtimeResults.suggestedPrice * 1.1).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-green-300">
                                      <span className="text-gray-700">Lucro Líquido</span>
                                      <span className="text-xl font-bold text-green-600">
                                        R$ {(realtimeResults.netProfit + (realtimeResults.suggestedPrice * 0.1)).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-green-300">
                                      <span className="text-gray-700">Margem</span>
                                      <span className="text-xl font-bold text-blue-600">
                                        {(realtimeResults.totalMargin + 10).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Improvements Badge */}
                                  <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
                                    <p className="text-sm font-semibold text-green-900 mb-2">💡 Melhorias:</p>
                                    <ul className="text-xs space-y-1 text-green-800">
                                      <li>✓ Margem aumentada em 10%</li>
                                      <li>✓ Lucro R$ {(realtimeResults.suggestedPrice * 0.1).toFixed(2)} maior</li>
                                      <li>✓ Preço ainda competitivo</li>
                                    </ul>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Comparison Summary */}
                            <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                              <CardContent className="p-6">
                                <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                  <Target className="h-5 w-5" />
                                  Análise Comparativa
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Aumento de Preço</p>
                                    <p className="text-2xl font-bold text-indigo-600">+10%</p>
                                  </div>
                                  <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Aumento de Lucro</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      +R$ {(realtimeResults.suggestedPrice * 0.1).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">ROI Estimado</p>
                                    <p className="text-2xl font-bold text-purple-600">+25%</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </TabsContent>

                        {/* Tab: Sensitivity Analysis - Feature #4 - IMPLEMENTADO */}
                        <TabsContent value="sensitivity" className="mt-0">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {(() => {
                              const baseCost = Number.parseFloat(formData.cost) || 0;
                              const baseMargin = Number.parseFloat(formData.targetMargin) || 30;
                              const baseShipping = Number.parseFloat(formData.shipping) || 0;

                              // Calcular impacto
                              const newCost = baseCost * (1 + costVariation / 100);
                              const newMargin = baseMargin + marginVariation;
                              const newShipping = baseShipping * (1 + shippingVariation / 100);

                              // Recalcular preço com novas variáveis
                              const newPrice = newCost / (1 - newMargin / 100 - 0.15);
                              const newProfit = newPrice - newCost - newShipping - (newPrice * 0.15);
                              const impactOnProfit = realtimeResults.netProfit === 0
                                ? 0
                                : ((newProfit - realtimeResults.netProfit) / realtimeResults.netProfit) * 100;

                              return (
                                <div className="space-y-6">
                                  {/* Header */}
                                  <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2 text-yellow-900">
                                      <BarChart3 className="h-6 w-6 text-yellow-600" />
                                      Análise de Sensibilidade
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                      Veja em tempo real como mudanças nas variáveis afetam seu lucro
                                    </p>
                                  </div>

                                  {/* Interactive Sliders */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Cost Variation */}
                                    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <DollarSign className="h-5 w-5 text-red-600" />
                                          Custo do Produto
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Variação</span>
                                            <Badge variant={costVariation > 0 ? "destructive" : "secondary"}>
                                              {costVariation > 0 ? '+' : ''}{costVariation}%
                                            </Badge>
                                          </div>
                                          <Slider
                                            value={[costVariation]}
                                            onValueChange={(value) => setCostVariation(value[0])}
                                            min={-50}
                                            max={50}
                                            step={5}
                                            className="mb-2"
                                          />
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>-50%</span>
                                            <span>0%</span>
                                            <span>+50%</span>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg">
                                          <p className="text-xs text-gray-600 mb-1">Novo custo:</p>
                                          <p className="text-2xl font-bold">R$ {newCost.toFixed(2)}</p>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Margin Variation */}
                                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Percent className="h-5 w-5 text-blue-600" />
                                          Margem de Lucro
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Ajuste</span>
                                            <Badge variant={marginVariation > 0 ? "default" : "secondary"}>
                                              {marginVariation > 0 ? '+' : ''}{marginVariation}%
                                            </Badge>
                                          </div>
                                          <Slider
                                            value={[marginVariation]}
                                            onValueChange={(value) => setMarginVariation(value[0])}
                                            min={-20}
                                            max={20}
                                            step={2}
                                            className="mb-2"
                                          />
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>-20%</span>
                                            <span>0%</span>
                                            <span>+20%</span>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg">
                                          <p className="text-xs text-gray-600 mb-1">Nova margem:</p>
                                          <p className="text-2xl font-bold text-blue-600">{newMargin.toFixed(1)}%</p>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Shipping Variation */}
                                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Truck className="h-5 w-5 text-green-600" />
                                          Custo de Frete
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Variação</span>
                                            <Badge variant={shippingVariation > 0 ? "destructive" : "secondary"}>
                                              {shippingVariation > 0 ? '+' : ''}{shippingVariation}%
                                            </Badge>
                                          </div>
                                          <Slider
                                            value={[shippingVariation]}
                                            onValueChange={(value) => setShippingVariation(value[0])}
                                            min={-50}
                                            max={50}
                                            step={10}
                                            className="mb-2"
                                          />
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>-50%</span>
                                            <span>0%</span>
                                            <span>+50%</span>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg">
                                          <p className="text-xs text-gray-600 mb-1">Novo frete:</p>
                                          <p className="text-2xl font-bold">R$ {newShipping.toFixed(2)}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Impact Summary */}
                                  <Card className={cn(
                                    "border-2",
                                    impactOnProfit > 0 ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50" : "border-red-400 bg-gradient-to-r from-red-50 to-orange-50"
                                  )}>
                                    <CardContent className="p-6">
                                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Impacto Total no Lucro
                                      </h4>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-white rounded-lg">
                                          <p className="text-sm text-gray-600 mb-1">Novo Preço</p>
                                          <p className="text-2xl font-bold">R$ {newPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                          <p className="text-sm text-gray-600 mb-1">Novo Lucro</p>
                                          <p className={cn(
                                            "text-2xl font-bold",
                                            newProfit > realtimeResults.netProfit ? "text-green-600" : "text-red-600"
                                          )}>
                                            R$ {newProfit.toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                          <p className="text-sm text-gray-600 mb-1">Variação</p>
                                          <p className={cn(
                                            "text-2xl font-bold flex items-center justify-center gap-1",
                                            impactOnProfit > 0 ? "text-green-600" : "text-red-600"
                                          )}>
                                            {impactOnProfit > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                            {Math.abs(impactOnProfit).toFixed(1)}%
                                          </p>
                                        </div>
                                        <div className="text-center p-4 bg-white rounded-lg">
                                          <p className="text-sm text-gray-600 mb-1">Diferença</p>
                                          <p className={cn(
                                            "text-2xl font-bold",
                                            impactOnProfit > 0 ? "text-green-600" : "text-red-600"
                                          )}>
                                            {impactOnProfit > 0 ? '+' : ''}R$ {(newProfit - realtimeResults.netProfit).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Insights */}
                                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-yellow-200">
                                        <p className="font-semibold text-sm text-gray-900 mb-2">💡 Insights:</p>
                                        <ul className="text-sm space-y-1 text-gray-700">
                                          {costVariation !== 0 && (
                                            <li>• Variação de {Math.abs(costVariation)}% no custo {costVariation > 0 ? 'aumenta' : 'reduz'} o preço em R$ {Math.abs(newPrice - realtimeResults.suggestedPrice).toFixed(2)}</li>
                                          )}
                                          {marginVariation !== 0 && (
                                            <li>• Ajuste de {Math.abs(marginVariation)}% na margem {marginVariation > 0 ? 'aumenta' : 'reduz'} o lucro em R$ {Math.abs(newProfit - realtimeResults.netProfit).toFixed(2)}</li>
                                          )}
                                          {shippingVariation !== 0 && (
                                            <li>• Variação de {Math.abs(shippingVariation)}% no frete impacta diretamente o lucro final</li>
                                          )}
                                          {costVariation === 0 && marginVariation === 0 && shippingVariation === 0 && (
                                            <li>• Ajuste os sliders acima para ver o impacto em tempo real</li>
                                          )}
                                        </ul>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            })()}
                          </motion.div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Fixed Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile Toggle */}
            <Button
              onClick={() => setShowSidebarMobile(!showSidebarMobile)}
              className="lg:hidden w-full mb-4 bg-brand-500 hover:bg-brand-600"
            >
              {showSidebarMobile ? "Ocultar" : "Mostrar"} Resumo
              {showSidebarMobile ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>

            <motion.div
              variants={cardVariants}
              className={cn(
                "sticky top-6",
                !showSidebarMobile && "hidden lg:block"
              )}
            >
              <Card className="border-2 border-brand-200 bg-gradient-to-br from-white to-brand-50/30 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-brand-600" />
                      Resumo em Tempo Real
                    </CardTitle>
                    {isCalculating && (
                      <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                    )}
                  </div>
                  <CardDescription>Valores atualizados automaticamente</CardDescription>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6 space-y-4">
                  {/* Preço Sugerido - Destaque */}
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <p className="text-sm font-medium opacity-90 mb-1">Preço Sugerido</p>
                    <p className="text-3xl font-bold">
                      R$ <AnimatedNumber value={realtimeResults.suggestedPrice} />
                    </p>
                  </motion.div>

                  {/* Lucro Líquido */}
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium text-green-900">Lucro Líquido</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      R$ <AnimatedNumber value={realtimeResults.netProfit} />
                    </span>
                  </motion.div>

                  {/* Margem Total */}
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Margem Total</span>
                    </div>
                    <span className="text-lg font-bold text-blue-700">
                      <AnimatedNumber value={realtimeResults.totalMargin} />%
                    </span>
                  </motion.div>

                  <Separator />

                  {/* Custos Totais */}
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Custos Totais</span>
                    </div>
                    <span className="text-lg font-bold text-orange-700">
                      R$ <AnimatedNumber value={realtimeResults.totalCosts} />
                    </span>
                  </motion.div>

                  {/* Taxas */}
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Taxas</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-700">
                      R$ <AnimatedNumber value={realtimeResults.totalFees} />
                    </span>
                  </motion.div>

                  {/* Estatísticas do Histórico */}
                  {advancedHistory.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <History className="h-4 w-4 text-cyan-600" />
                          <h4 className="text-sm font-semibold text-gray-700">Histórico</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-cyan-50 rounded border border-cyan-200">
                            <p className="text-xs text-cyan-800">Total Salvos</p>
                            <p className="text-lg font-bold text-cyan-900">{advancedHistory.length}</p>
                          </div>
                          <div className="p-2 bg-cyan-50 rounded border border-cyan-200">
                            <p className="text-xs text-cyan-800">Margem Média</p>
                            <p className="text-lg font-bold text-cyan-900">
                              {(advancedHistory.reduce((sum, h) => sum + h.totalMargin, 0) / advancedHistory.length).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={() => {
                            // Switch to history tab
                            const historyTab = document.querySelector('[value="history"]') as HTMLElement;
                            historyTab?.click();
                          }}
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          Ver Histórico Completo
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Alertas Inteligentes */}
                  {formData.cost !== "" && realtimeResults.netProfit < 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 rounded-lg border-2 border-red-200"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">Prejuízo Detectado</p>
                          <p className="text-xs text-red-800 mt-1">
                            Revise seus custos ou aumente a margem
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formData.cost !== "" && realtimeResults.totalMargin > 0 && realtimeResults.totalMargin < 5 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">Margem Crítica</p>
                          <p className="text-xs text-yellow-800 mt-1">
                            Margem de apenas {realtimeResults.totalMargin.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Info Card */}
                  {formData.cost === "" && (
                    <div className="mt-6 p-4 bg-brand-50 rounded-lg border border-brand-200">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-900">
                          Preencha os dados para ver os cálculos em tempo real
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botão Salvar no Histórico */}
                  {formData.cost !== "" && realtimeResults.suggestedPrice > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Button
                        onClick={async () => {
                          try {
                            // Salvar no Supabase com todas as features
                            await saveToHistory({
                              cost: Number(formData.cost) || 0,
                              targetMargin: Number(formData.targetMargin) || 30,
                              shipping: Number(formData.shipping) || 0,
                              packaging: Number(formData.packaging) || 0,
                              marketing: Number(formData.marketing) || 0,
                              otherCosts: Number(formData.otherCosts) || 0,
                              marketplaceId: formData.marketplaceId,
                              paymentMethod: formData.paymentMethod as 'credit' | 'debit' | 'pix' | 'boleto',
                              includePaymentFee: formData.includePaymentFee,
                              suggestedPrice: realtimeResults.suggestedPrice,
                              totalMargin: realtimeResults.totalMargin,
                              netProfit: realtimeResults.netProfit,
                              totalCost: realtimeResults.totalCosts,
                              notes: formData.productName || undefined,
                              tags: formData.productCategory ? [formData.productCategory] : undefined,
                            });

                            // Atualizar histórico local para compatibilidade
                            const newEntry: CalculationHistory = {
                              id: `calc-${Date.now()}`,
                              timestamp: new Date(),
                              cost: Number.parseFloat(formData.cost),
                              margin: Number.parseFloat(formData.targetMargin),
                              finalPrice: realtimeResults.suggestedPrice,
                              marketplace: formData.marketplaceId
                            };
                            setHistory(prev => [newEntry, ...prev].slice(0, 50));
                            
                            toast({
                              title: "💾 Salvo com Sucesso!",
                              description: `Cálculo de R$ ${realtimeResults.suggestedPrice.toFixed(2)} salvo no histórico`,
                            });
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "❌ Erro ao Salvar",
                              description: error instanceof Error ? error.message : "Erro desconhecido",
                            });
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="lg"
                        disabled={isHistoryLoading}
                      >
                        {isHistoryLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <History className="h-4 w-4 mr-2" />
                        )}
                        Salvar no Histórico
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tax Info Card */}
              <Card className="mt-4 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        Cálculos Tributários
                      </p>
                      <p className="text-xs text-yellow-800 mb-2">
                        Para análise tributária completa com Simples Nacional, Lucro Presumido e Lucro Real, 
                        use a Calculadora Tributária.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1 border-yellow-600 text-yellow-800 hover:bg-yellow-50"
                        onClick={() => window.location.href = '/calculadora-tributaria'}
                      >
                        Ir para Calculadora Tributária
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
