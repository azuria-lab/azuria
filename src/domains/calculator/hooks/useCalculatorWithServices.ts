// Hook that integrates calculator context with services
import { useCallback } from 'react';
import { logger } from '@/services/logger';
import type { CalculationTemplate } from '@/shared/types/templates';
import { useToast } from '@/hooks/use-toast';
import { useCalculatorContext } from '../context/CalculatorContext';
import { CalculationService, HistoryService, ValidationService } from '../services';
import { formatCurrency } from '../utils/formatCurrency';

export const useCalculatorWithServices = (_isPro: boolean = false, userId?: string) => {
  const { state, dispatch, setResult, setLoading, setErrors, setWarnings } = useCalculatorContext();
  const { toast } = useToast();

  const calculateWithServices = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      setWarnings({});

      // Validate inputs first
      const validation = ValidationService.validateCalculatorInputs({
        cost: state.cost,
        margin: state.margin,
        tax: state.tax,
        cardFee: state.cardFee,
        otherCosts: state.otherCosts,
        shipping: state.shipping
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        toast({
          variant: "destructive",
          title: "Erro na validação",
          description: ValidationService.formatValidationMessage(validation)
        });
        return;
      }

      // Show warnings if any
      if (Object.keys(validation.warnings).length > 0) {
        setWarnings(validation.warnings);
        toast({
          variant: "default",
          title: "Atenção",
          description: ValidationService.formatValidationMessage(validation)
        });
      }

      // Calculate using service
      const calculationParams = {
        cost: state.cost,
        margin: state.margin,
        tax: state.tax,
        cardFee: state.cardFee,
        otherCosts: state.otherCosts,
        shipping: state.shipping,
        includeShipping: state.includeShipping
      };

      const result = CalculationService.calculate(calculationParams);
      setResult(result);

      // Save to history
      try {
        await HistoryService.saveCalculation(result, calculationParams, userId);
      } catch (error) {
        logger.warn('Failed to save to history:', error);
        // Don't block the calculation if history fails
      }

      // Business rules validation
      const businessValidation = ValidationService.validateBusinessRules({
        ...calculationParams,
        sellingPrice: result.sellingPrice
      });

      if (Object.keys(businessValidation.warnings).length > 0) {
        toast({
          title: "Análise de negócio",
          description: ValidationService.formatValidationMessage(businessValidation)
        });
      }

      // Success message
      toast({
        title: "Cálculo realizado",
        description: `Preço de venda: ${formatCurrency(result.sellingPrice)}`
      });

    } catch (error) {
      logger.error('Calculation error:', error);
      toast({
        variant: "destructive",
        title: "Erro no cálculo",
        description: error instanceof Error ? error.message : "Erro inesperado"
      });
    } finally {
      setLoading(false);
    }
  }, [state, setResult, setLoading, setErrors, setWarnings, toast, userId]);

  const resetCalculator = useCallback(() => {
    dispatch({ type: 'RESET_CALCULATOR' });
    toast({
      title: "Calculadora resetada",
      description: "Todos os campos foram limpos"
    });
  }, [dispatch, toast]);

  const applyTemplate = useCallback((template: CalculationTemplate) => {
    dispatch({ 
      type: 'APPLY_TEMPLATE', 
      payload: {
        cost: String(template.default_values?.cost ?? ''),
        margin: Number(template.default_values?.margin ?? 30),
        tax: String(template.default_values?.tax ?? ''),
        cardFee: String(template.default_values?.cardFee ?? ''),
        otherCosts: String(template.default_values?.otherCosts ?? ''),
        shipping: String(template.default_values?.shipping ?? ''),
        includeShipping: Boolean(template.default_values?.includeShipping ?? false)
      }
    });
    
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" foi aplicado com sucesso`
    });
  }, [dispatch, toast]);

  const validateInputs = useCallback(() => {
    const validation = ValidationService.validateCalculatorInputs({
      cost: state.cost,
      margin: state.margin,
      tax: state.tax,
      cardFee: state.cardFee,
      otherCosts: state.otherCosts,
      shipping: state.shipping
    });

    setErrors(validation.errors);
    setWarnings(validation.warnings);
    
    return validation.isValid;
  }, [state, setErrors, setWarnings]);

  return {
    // State from context
    state,
    dispatch,
    
    // Actions with services integration
    calculateWithServices,
    resetCalculator,
    applyTemplate,
    validateInputs,
    
    // Utilities
    formatCurrency,
    
    // Status
    hasErrors: Object.keys(state.errors).length > 0,
    hasWarnings: Object.keys(state.warnings).length > 0,
    canCalculate: state.cost && !Object.keys(state.errors).length
  };
};