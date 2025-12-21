import React, { useState } from 'react';
import { CalculationTemplate } from '@/types/templates';
import { Calculator, Gauge } from 'lucide-react';
import TemplateCarousel from './TemplateCarousel';
import TemplateCard from './TemplateCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';

// Dados mock para Calculadora Rápida
const rapidCalculatorTemplates: CalculationTemplate[] = [
  {
    id: 'rapid-1',
    name: 'E-commerce Básico',
    description: 'Template otimizado para lojas online com marketplace. Configurações ideais para vendas no Mercado Livre, Amazon e Shopee.',
    category: 'ecommerce',
    sector_specific_config: { marketplaceFee: 12, returnRate: 5, packagingCost: 2 },
    default_values: { margin: 40, tax: '7', cardFee: '3.5', shipping: '15' },
    custom_formulas: null,
    image_url: null,
    price: 0,
    is_premium: false,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 1250,
    rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rapid-2',
    name: 'Restaurante',
    description: 'Cálculo de preços para pratos e bebidas. Inclui custos de ingredientes, mão de obra e desperdício.',
    category: 'restaurante',
    sector_specific_config: { foodCost: true, laborCost: 30, wastageRate: 8 },
    default_values: { margin: 300, tax: '7', cardFee: '2.5', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 29.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 892,
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rapid-3',
    name: 'Serviços Profissionais',
    description: 'Template para consultoria e serviços. Ideal para freelancers e empresas de serviços.',
    category: 'servicos',
    sector_specific_config: { hourlyRate: 100, overhead: 25, expertise: 'premium' },
    default_values: { margin: 60, tax: '4.5', cardFee: '2', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 19.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 567,
    rating: 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rapid-4',
    name: 'Varejo Físico',
    description: 'Template para lojas físicas. Considera custos de aluguel, funcionários e estoque.',
    category: 'varejo',
    sector_specific_config: { rentCost: 15, employeeCost: 20, inventoryCost: 10 },
    default_values: { margin: 50, tax: '7', cardFee: '2.5', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 0,
    is_premium: false,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 432,
    rating: 4.3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rapid-5',
    name: 'Produtos Artesanais',
    description: 'Template para produtos feitos à mão. Inclui custos de matéria-prima e tempo de produção.',
    category: 'artesanal',
    sector_specific_config: { materialCost: 40, timeCost: 30, packagingCost: 5 },
    default_values: { margin: 200, tax: '7', cardFee: '3', shipping: '10' },
    custom_formulas: null,
    image_url: null,
    price: 14.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 321,
    rating: 4.6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rapid-6',
    name: 'SaaS e Software',
    description: 'Template para produtos digitais e assinaturas. Margens otimizadas para o mercado de software.',
    category: 'saas',
    sector_specific_config: { subscriptionModel: true, churnRate: 5, ltv: 1200 },
    default_values: { margin: 80, tax: '4.5', cardFee: '2.9', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 39.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 234,
    rating: 4.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Dados mock para Calculadora Avançada
const advancedCalculatorTemplates: CalculationTemplate[] = [
  {
    id: 'advanced-1',
    name: 'E-commerce Premium',
    description: 'Template avançado para e-commerce com múltiplos marketplaces, análise de concorrência e otimização de margens.',
    category: 'ecommerce',
    sector_specific_config: { 
      multipleMarketplaces: true, 
      competitorAnalysis: true, 
      dynamicPricing: true,
      taxRegimes: ['simples', 'presumido']
    },
    default_values: { 
      margin: 40, 
      tax: '7', 
      cardFee: '3.5', 
      shipping: '15',
      marketplaceFee: '12',
      packaging: '5',
      marketing: '8'
    },
    custom_formulas: null,
    image_url: null,
    price: 49.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 890,
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-2',
    name: 'Indústria e Manufatura',
    description: 'Template completo para indústria com custos de produção, logística, impostos e análise de rentabilidade.',
    category: 'industria',
    sector_specific_config: { 
      productionCosts: true, 
      logistics: true, 
      qualityControl: true,
      batchPricing: true
    },
    default_values: { 
      margin: 35, 
      tax: '7', 
      cardFee: '2.5', 
      shipping: '8',
      production: '45',
      logistics: '12',
      quality: '3'
    },
    custom_formulas: null,
    image_url: null,
    price: 59.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 456,
    rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-3',
    name: 'B2B Corporativo',
    description: 'Template para vendas B2B com descontos progressivos, análise de volume e negociação de preços.',
    category: 'b2b',
    sector_specific_config: { 
      volumeDiscounts: true, 
      contractPricing: true, 
      paymentTerms: true,
      creditAnalysis: true
    },
    default_values: { 
      margin: 25, 
      tax: '4.5', 
      cardFee: '1.5', 
      shipping: '5',
      volumeDiscount: '10',
      creditTerms: '30'
    },
    custom_formulas: null,
    image_url: null,
    price: 69.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 678,
    rating: 4.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-4',
    name: 'Multi-Marketplace',
    description: 'Template para vender em múltiplos marketplaces simultaneamente com precificação inteligente por canal.',
    category: 'ecommerce',
    sector_specific_config: { 
      multiChannel: true, 
      channelOptimization: true, 
      inventorySync: true,
      priceSync: true
    },
    default_values: { 
      margin: 38, 
      tax: '7', 
      cardFee: '3', 
      shipping: '12',
      marketplace1: '12',
      marketplace2: '15',
      marketplace3: '10'
    },
    custom_formulas: null,
    image_url: null,
    price: 79.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 1234,
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-5',
    name: 'Consultoria Avançada',
    description: 'Template para serviços de consultoria com análise de projetos, horas e valor agregado.',
    category: 'consultoria',
    sector_specific_config: { 
      projectBased: true, 
      hourlyRates: true, 
      valueBased: true,
      retainerModel: true
    },
    default_values: { 
      margin: 70, 
      tax: '4.5', 
      cardFee: '2', 
      shipping: '0',
      hourlyRate: '150',
      overhead: '30',
      profit: '40'
    },
    custom_formulas: null,
    image_url: null,
    price: 44.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 345,
    rating: 4.6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced-6',
    name: 'Importação e Exportação',
    description: 'Template para produtos importados com cálculo de impostos de importação, frete internacional e câmbio.',
    category: 'importacao',
    sector_specific_config: { 
      importTaxes: true, 
      internationalShipping: true, 
      currencyConversion: true,
      customsFees: true
    },
    default_values: { 
      margin: 50, 
      tax: '20', 
      cardFee: '3.5', 
      shipping: '25',
      importTax: '60',
      customs: '15',
      exchangeRate: '5.2'
    },
    custom_formulas: null,
    image_url: null,
    price: 89.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 567,
    rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function TemplateMarketplace() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);

  const handleTemplateSelect = (template: CalculationTemplate, calculatorType: 'rapid' | 'advanced') => {
    logger.info('Template selecionado', { templateId: template.id, calculatorType });
    
    // Navegar para a calculadora apropriada com o template
    if (calculatorType === 'rapid') {
      navigate('/calculadora-rapida', { 
        state: { templateId: template.id, templateData: template } 
      });
    } else {
      navigate('/calculadora-avancada', { 
        state: { templateId: template.id, templateData: template } 
      });
    }

    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" será aplicado na calculadora.`,
    });
  };

  const isPurchased = (templateId: string) => {
    return purchasedTemplates.includes(templateId);
  };

  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-brand-800/20 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Templates de Precificação
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Acelere seus cálculos com templates otimizados para diferentes setores e necessidades
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 md:px-8 lg:px-16 py-12 space-y-16">
        {/* Calculadora Rápida Section */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-brand-600/20">
                <Gauge className="h-8 w-8 text-brand-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">Calculadora Rápida</h2>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Templates otimizados para cálculos rápidos e diretos. Perfeitos para precificação do dia a dia 
                  com configurações pré-definidas que aceleram seu trabalho.
                </p>
              </div>
            </div>
          </div>

          <TemplateCarousel>
            {rapidCalculatorTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                calculatorType="rapid"
                isPurchased={isPurchased(template.id)}
                onSelect={(t) => handleTemplateSelect(t, 'rapid')}
              />
            ))}
          </TemplateCarousel>
        </section>

        {/* Calculadora Avançada Section */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-brand-600/20">
                <Calculator className="h-8 w-8 text-brand-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2">Calculadora Avançada</h2>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Templates completos para análises avançadas. Incluem múltiplos fatores, cenários complexos 
                  e otimizações profissionais para decisões estratégicas de precificação.
                </p>
              </div>
            </div>
          </div>

          <TemplateCarousel>
            {advancedCalculatorTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                calculatorType="advanced"
                isPurchased={isPurchased(template.id)}
                onSelect={(t) => handleTemplateSelect(t, 'advanced')}
              />
            ))}
          </TemplateCarousel>
        </section>
      </div>
    </div>
  );
}
