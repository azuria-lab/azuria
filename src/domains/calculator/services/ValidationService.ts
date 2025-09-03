// Validation service for calculator inputs
import { parseInputValue } from '../utils/parseInputValue';
import type { TaxRegime } from '../types/advanced';

export interface ValidationRule {
  field: string;
  value: unknown;
  rules: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export class ValidationService {
  static validateCalculatorInputs(inputs: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    otherCosts: string;
    shipping: string;
  }): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Cost validation
    const costValue = parseInputValue(inputs.cost);
    if (!inputs.cost || costValue <= 0) {
      errors.cost = ['Custo é obrigatório e deve ser maior que zero'];
    } else if (costValue > 1000000) {
      warnings.cost = ['Custo muito alto, verifique se está correto'];
    }

    // Margin validation
    if (inputs.margin < 0) {
      errors.margin = ['Margem não pode ser negativa'];
    } else if (inputs.margin < 10) {
      warnings.margin = ['Margem baixa pode comprometer a lucratividade'];
    } else if (inputs.margin > 500) {
      warnings.margin = ['Margem muito alta pode prejudicar competitividade'];
    }

    // Tax validation
    const taxValue = parseInputValue(inputs.tax);
    if (taxValue < 0) {
      errors.tax = ['Taxa não pode ser negativa'];
    } else if (taxValue > 100) {
      errors.tax = ['Taxa não pode ser maior que 100%'];
    } else if (taxValue > 50) {
      warnings.tax = ['Taxa muito alta, verifique se está correta'];
    }

    // Card fee validation
    const cardFeeValue = parseInputValue(inputs.cardFee);
    if (cardFeeValue < 0) {
      errors.cardFee = ['Taxa do cartão não pode ser negativa'];
    } else if (cardFeeValue > 20) {
      errors.cardFee = ['Taxa do cartão não pode ser maior que 20%'];
    } else if (cardFeeValue > 10) {
      warnings.cardFee = ['Taxa do cartão muito alta, verifique se está correta'];
    }

    // Other costs validation
    const otherCostsValue = parseInputValue(inputs.otherCosts);
    if (otherCostsValue < 0) {
      errors.otherCosts = ['Outros custos não podem ser negativos'];
    } else if (otherCostsValue > costValue) {
      warnings.otherCosts = ['Outros custos são maiores que o custo principal'];
    }

    // Shipping validation
    const shippingValue = parseInputValue(inputs.shipping);
    if (shippingValue < 0) {
      errors.shipping = ['Frete não pode ser negativo'];
    } else if (shippingValue > costValue * 2) {
      warnings.shipping = ['Frete muito alto em relação ao custo do produto'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  static validateBusinessRules(inputs: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    sellingPrice?: number;
  }): ValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    const costValue = parseInputValue(inputs.cost);
    const taxValue = parseInputValue(inputs.tax);
    const cardFeeValue = parseInputValue(inputs.cardFee);

    // Business logic validations
    if (inputs.sellingPrice) {
      const profit = inputs.sellingPrice - costValue - (inputs.sellingPrice * taxValue / 100) - (inputs.sellingPrice * cardFeeValue / 100);
      const profitMargin = (profit / inputs.sellingPrice) * 100;

      if (profitMargin < 5) {
        warnings.profitability = ['Margem de lucro muito baixa (menos de 5%)'];
      } else if (profitMargin < 15) {
        warnings.profitability = ['Margem de lucro baixa (menos de 15%)'];
      }

      if (inputs.sellingPrice < costValue) {
        errors.pricing = ['Preço de venda não pode ser menor que o custo'];
      }
    }

    // Market competitiveness checks
    const totalTaxes = taxValue + cardFeeValue;
    if (totalTaxes > 30) {
      warnings.competitiveness = ['Taxa total muito alta pode prejudicar competitividade'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  static validateAdvancedInputs(params: {
    cost: number;
    taxRegime: TaxRegime | null | undefined;
    targetMargin: number;
    marketplaceFee: number;
    paymentFee: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Cost validation
    if (!params.cost || params.cost <= 0) {
      errors.push('Custo deve ser maior que zero');
    }

    // Tax regime validation
    if (!params.taxRegime) {
      errors.push('Regime tributário é obrigatório');
    }

    // Margin validation
    if (params.targetMargin < 0) {
      errors.push('Margem não pode ser negativa');
    }

    // Fee validations
    if (params.marketplaceFee < 0 || params.marketplaceFee > 100) {
      errors.push('Taxa do marketplace deve estar entre 0% e 100%');
    }

    if (params.paymentFee < 0 || params.paymentFee > 100) {
      errors.push('Taxa de pagamento deve estar entre 0% e 100%');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatValidationMessage(result: ValidationResult): string {
    const messages: string[] = [];

  Object.entries(result.errors).forEach(([_field, fieldErrors]) => {
      fieldErrors.forEach(error => messages.push(`❌ ${error}`));
    });

  Object.entries(result.warnings).forEach(([_field, fieldWarnings]) => {
      fieldWarnings.forEach(warning => messages.push(`⚠️ ${warning}`));
    });

    return messages.join('\n');
  }
}
