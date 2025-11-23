import { lazy, Suspense } from 'react';
import LoadingState from '@/components/calculators/LoadingState';
import { AzuriaChat } from '@/components/ai/AzuriaChat';
import AIPriceSuggestions from '@/components/calculators/AIPriceSuggestions';
import { AzuriaAvatarImage } from '@/components/ai/AzuriaAvatarImage';

// Lazy load heavy components
const IntelligentBatchCalculator = lazy(() => import('@/components/calculators/IntelligentBatchCalculator'));
const CompetitivePricingCalculator = lazy(() => import('@/components/analysis/CompetitivePricingCalculator'));

// AI Page components
const MarketTrendAnalyzer = lazy(() => import('@/components/ai/MarketTrendAnalyzer'));
const IntelligentPricingSuggestions = lazy(() => import('@/components/ai/IntelligentPricingSuggestions'));
const MLPricingInsights = lazy(() => import('@/components/analytics/MLPricingInsights'));

interface SectionProps {
  isPro: boolean;
}

export const AssistenteSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AzuriaAvatarImage 
            size="small"
            className="ring-2 ring-[#00C2FF]"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">Assistente IA</h2>
        </div>
        <p className="text-muted-foreground">
          Converse com a Azuria IA para obter ajuda com precificação, impostos e análise de mercado
        </p>
      </div>
      <AzuriaChat />
    </div>
  );
};

export const LoteIASection = ({ isPro }: SectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AzuriaAvatarImage 
            size="small"
            className="ring-2 ring-[#005BFF]"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">Calculadora em Lote Inteligente</h2>
        </div>
        <p className="text-muted-foreground">
          Revolucione sua estratégia de precificação com IA avançada e análise competitiva em tempo real
        </p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <IntelligentBatchCalculator isPro={isPro} userId={undefined} />
      </Suspense>
    </div>
  );
};

export const IAPrecosSection = () => {
  // Default values for demo purposes
  const defaultCategory = 'Eletrônicos';
  const defaultPrice = 100;
  const defaultCost = 60;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AzuriaAvatarImage 
            size="small"
            className="ring-2 ring-[#00C2FF]"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">IA Preços</h2>
        </div>
        <p className="text-muted-foreground">
          Análise avançada de preços com inteligência artificial e insights de mercado
        </p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <div className="space-y-8">
          <MarketTrendAnalyzer category={defaultCategory} />
          <IntelligentPricingSuggestions />
          <MLPricingInsights 
            currentPrice={defaultPrice}
            cost={defaultCost}
            category={defaultCategory}
          />
        </div>
      </Suspense>
    </div>
  );
};

export const SugestaoSection = () => {
  // Default input for demo
  const defaultInput = {
    cost: 60,
    targetMargin: 40,
    shipping: 10,
    packaging: 5,
    marketing: 8,
    otherCosts: 2,
    marketplace: 'Mercado Livre',
    paymentMethod: 'credit' as const,
    includePaymentFee: true,
    monthlyVolume: 100,
    productCategory: 'Eletrônicos',
    competitorPrices: [95, 105, 110]
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AzuriaAvatarImage 
            size="small"
            className="ring-2 ring-[#005BFF]"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">Sugestão de Preços</h2>
        </div>
        <p className="text-muted-foreground">
          Recomendações automáticas de precificação baseadas em IA
        </p>
      </div>
      <AIPriceSuggestions input={defaultInput} />
    </div>
  );
};

export const CompetitividadeSection = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AzuriaAvatarImage 
            size="small"
            className="ring-2 ring-[#00C2FF]"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">Análise de Competitividade</h2>
        </div>
        <p className="text-muted-foreground">
          Compare seu preço com a concorrência e descubra o melhor posicionamento no mercado
        </p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <CompetitivePricingCalculator />
      </Suspense>
    </div>
  );
};
