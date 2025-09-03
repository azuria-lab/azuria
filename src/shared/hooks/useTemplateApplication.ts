
import { useCallback } from 'react';
import { CalculationTemplate } from '@/types/templates';
import { useToast } from '@/hooks/use-toast';
import { getBooleanField, getNumberField } from '@/utils/templateFields';

interface CalculatorState {
  cost: string | number;
  margin: number;
  tax: string | number;
  cardFee: string | number;
  otherCosts: string | number;
  shipping: string | number;
  includeShipping: boolean;
}

export const useTemplateApplication = () => {
  const { toast } = useToast();

  const applyTemplate = useCallback((
    template: CalculationTemplate,
    setState: (state: Partial<CalculatorState>) => void
  ) => {
    try {
  const defaultValues = template.default_values as Record<string, unknown>;
  const sectorConfig = template.sector_specific_config as Record<string, unknown>;

      // Aplicar valores padrão do template
      const newState: Partial<CalculatorState> = {};

  newState.margin = getNumberField(defaultValues, 'margin', 0);
  newState.tax = String(getNumberField(defaultValues, 'tax', 0));
  newState.cardFee = String(getNumberField(defaultValues, 'cardFee', 0));
  newState.shipping = String(getNumberField(defaultValues, 'shipping', 0));
  newState.includeShipping = getBooleanField(defaultValues, 'includeShipping', false);

      // Aplicar configurações específicas do setor
      if (sectorConfig) {
        // Para restaurantes, ajustar margem considerando desperdício
        const wastageRate = getNumberField(sectorConfig, 'wastageRate', 0);
        if (template.category === 'restaurante' && wastageRate) {
          const wastageAdjustment = 1 + (wastageRate / 100);
          if (newState.margin) {
            newState.margin = newState.margin * wastageAdjustment;
          }
        }

        // Para e-commerce, considerar taxa de retorno
        const returnRate = getNumberField(sectorConfig, 'returnRate', 0);
        if (template.category === 'ecommerce' && returnRate) {
          const returnAdjustment = 1 + (returnRate / 100);
          if (newState.margin) {
            newState.margin = newState.margin * returnAdjustment;
          }
        }

        // Para SaaS, ajustar considerando churn
        const churnRate = getNumberField(sectorConfig, 'churnRate', 0);
        if (template.category === 'saas' && churnRate) {
          const churnAdjustment = 1 + (churnRate / 100);
          if (newState.margin) {
            newState.margin = newState.margin * churnAdjustment;
          }
        }
      }

      setState(newState);

      toast({
        title: "Template aplicado!",
        description: `Configurações do template "${template.name}" foram aplicadas com sucesso.`,
      });

      return true;
  } catch (_error) {
      toast({
        title: "Erro ao aplicar template",
        description: "Houve um problema ao aplicar as configurações do template.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const getTemplatePreview = useCallback((template: CalculationTemplate, baseCost: number = 100) => {
    const defaultValues = template.default_values as Record<string, unknown>;
    const margin = getNumberField(defaultValues, 'margin', 0);
    const tax = getNumberField(defaultValues, 'tax', 0);
    const cardFee = getNumberField(defaultValues, 'cardFee', 0);

    // Cálculo básico de exemplo
    const costWithMargin = baseCost * (1 + margin / 100);
    const taxes = costWithMargin * (tax / 100);
    const fees = costWithMargin * (cardFee / 100);
    const finalPrice = costWithMargin + taxes + fees;

    return {
      baseCost,
      margin: margin,
      taxes,
      fees,
      finalPrice,
      profit: finalPrice - baseCost - taxes - fees
    };
  }, []);

  return {
    applyTemplate,
    getTemplatePreview
  };
};
