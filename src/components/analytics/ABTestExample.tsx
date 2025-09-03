
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useABTesting } from '@/hooks/useABTesting';
import { useAnalyticsContext } from './AnalyticsProvider';
import { Calculator, Crown, Zap } from 'lucide-react';

export const ABTestExample: React.FC = () => {
  const { getVariant, trackConversion } = useABTesting();
  const { analytics } = useAnalyticsContext();
  
  // Get A/B test variants
  const layoutVariant = getVariant('calculator_layout');
  const ctaVariant = getVariant('pricing_cta');
  const onboardingVariant = getVariant('onboarding_flow');

  const handleCalculate = () => {
    // Track the calculation event
    analytics.trackFeatureUsage('calculator', 'calculate', {
      layout_variant: layoutVariant,
      cta_variant: ctaVariant
    });
    
    // Simulate calculation logic here
    console.log('Calculation performed with variant:', layoutVariant);
  };

  const handleUpgrade = () => {
    // Track conversion for pricing CTA test
    trackConversion('pricing_cta', 'upgrade_click');
    
    analytics.trackConversion('pro_upgrade', 99);
    console.log('Upgrade clicked with CTA variant:', ctaVariant);
  };

  const getCTAText = () => {
    switch (ctaVariant) {
      case 'upgrade_now': return 'Upgrade Agora';
      case 'try_pro': return 'Experimentar PRO';
      case 'unlock_features': return 'Desbloquear Recursos';
      default: return 'Upgrade Agora';
    }
  };

  const getCTAIcon = () => {
    switch (ctaVariant) {
      case 'upgrade_now': return Crown;
      case 'try_pro': return Zap;
      case 'unlock_features': return Calculator;
      default: return Crown;
    }
  };

  const CTAIcon = getCTAIcon();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de A/B Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Variantes Ativas:</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>Layout:</strong> {layoutVariant || 'default'}</li>
                <li><strong>CTA:</strong> {ctaVariant || 'upgrade_now'}</li>
                <li><strong>Onboarding:</strong> {onboardingVariant || 'tutorial'}</li>
              </ul>
            </div>

            {/* Calculator Layout Test */}
            <div className={`
              ${layoutVariant === 'compact' 
                ? 'grid grid-cols-2 gap-4' 
                : 'space-y-4'
              }
            `}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Custo do Produto</label>
                <input 
                  type="number" 
                  className={`
                    w-full border rounded 
                    ${layoutVariant === 'compact' ? 'p-2 text-sm' : 'p-3'}
                  `}
                  placeholder="R$ 0,00" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Margem de Lucro</label>
                <input 
                  type="number" 
                  className={`
                    w-full border rounded 
                    ${layoutVariant === 'compact' ? 'p-2 text-sm' : 'p-3'}
                  `}
                  placeholder="%" 
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleCalculate}
                className="flex-1"
                size={layoutVariant === 'compact' ? 'sm' : 'default'}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
              
              <Button 
                onClick={handleUpgrade}
                variant="outline"
                className="flex items-center gap-2"
                size={layoutVariant === 'compact' ? 'sm' : 'default'}
              >
                <CTAIcon className="h-4 w-4" />
                {getCTAText()}
              </Button>
            </div>

            {/* Onboarding Test */}
            {onboardingVariant === 'tutorial' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  💡 Dica de Tutorial
                </h4>
                <p className="text-sm text-yellow-700">
                  Insira o custo do seu produto e a margem desejada para calcular o preço de venda ideal.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug - Variantes A/B</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify({
              calculator_layout: layoutVariant,
              pricing_cta: ctaVariant,
              onboarding_flow: onboardingVariant
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
