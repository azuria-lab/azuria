import { lazy, Suspense } from 'react';
import LoadingState from '@/components/calculators/LoadingState';
import { AzuriaChat } from '@/components/ai/AzuriaChat';
import AIPriceSuggestions from '@/components/calculators/AIPriceSuggestions';

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
    <div className="w-full">
      <AzuriaChat />
    </div>
  );
};

export const LoteIASection = ({ isPro }: SectionProps) => {
  return (
    <div className="w-full">
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
    <div className="w-full space-y-8">
      <Suspense fallback={<LoadingState />}>
        <MarketTrendAnalyzer category={defaultCategory} />
        <IntelligentPricingSuggestions />
        <MLPricingInsights 
          currentPrice={defaultPrice}
          cost={defaultCost}
          category={defaultCategory}
        />
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
    <div className="w-full">
      <AIPriceSuggestions input={defaultInput} />
    </div>
  );
};

export const CompetitividadeSection = () => {
  return (
    <div className="w-full">
      <Suspense fallback={<LoadingState />}>
        <CompetitivePricingCalculator />
      </Suspense>
    </div>
  );
};
