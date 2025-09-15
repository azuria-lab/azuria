// Complete calculation service with business logic
import { parseInputValue } from '../utils/parseInputValue';
import type { CalculationResult } from '../types/calculator';
import type { AdvancedCalculationResult, TaxRegime } from '../types/advanced';

export interface CalculationParams {
  cost: string;
  margin: number;
  tax: string;
  cardFee: string;
  otherCosts: string;
  shipping: string;
  includeShipping: boolean;
}

export class CalculationService {
  static calculate(params: CalculationParams): CalculationResult {
    const costValue = parseInputValue(params.cost);
    const taxValue = parseInputValue(params.tax);
    const cardFeeValue = parseInputValue(params.cardFee);
    const otherCostsValue = parseInputValue(params.otherCosts);
    const shippingValue = parseInputValue(params.shipping);

    if (costValue <= 0) {
      throw new Error('Custo deve ser maior que zero');
    }

    // Calculate base cost including shipping if needed
    const baseCost = params.includeShipping ? costValue + shippingValue : costValue;
    
    // Add other costs
    const totalCost = baseCost + otherCostsValue;
    
    // Calculate margin-based selling price
    const marginMultiplier = (100 + params.margin) / 100;
    const priceWithMargin = totalCost * marginMultiplier;
    
    // Add taxes
    const finalPrice = priceWithMargin + (priceWithMargin * taxValue / 100);
    
    // Add card fees
    const sellingPrice = finalPrice + (finalPrice * cardFeeValue / 100);
    
    // Calculate profit
    const profit = sellingPrice - totalCost - (sellingPrice * taxValue / 100) - (sellingPrice * cardFeeValue / 100);
    
    // Calculate actual margin
    const actualMargin = (profit / sellingPrice) * 100;
    
    // Health check
    const isHealthyProfit = actualMargin >= 20;
    
    // Breakdown
    const breakdown = {
      costValue,
      otherCostsValue,
      shippingValue: params.includeShipping ? shippingValue : 0,
      totalCost,
      marginAmount: profit,
      realMarginPercent: actualMargin,
      taxAmount: sellingPrice * taxValue / 100,
      cardFeeAmount: sellingPrice * cardFeeValue / 100
    };

    return {
      sellingPrice,
      profit,
      isHealthyProfit,
      breakdown
    };
  }

  static validateInputs(params: CalculationParams): string[] {
    const errors: string[] = [];
    
    const costValue = parseInputValue(params.cost);
    if (costValue <= 0) {
      errors.push('Custo deve ser maior que zero');
    }
    
    if (params.margin < 0) {
      errors.push('Margem não pode ser negativa');
    }
    
    const taxValue = parseInputValue(params.tax);
    if (taxValue < 0 || taxValue > 100) {
      errors.push('Taxa deve estar entre 0% e 100%');
    }
    
    const cardFeeValue = parseInputValue(params.cardFee);
    if (cardFeeValue < 0 || cardFeeValue > 100) {
      errors.push('Taxa do cartão deve estar entre 0% e 100%');
    }
    
    return errors;
  }

  static async calculateAdvanced(params: {
    cost: number;
    taxRegime: TaxRegime;
    shipping: number;
    includeShipping: boolean;
    targetMargin: number;
    marketplaceFee: number;
    paymentFee: number;
    logisticsFee: number;
    advertisingFee: number;
    otherFees: number;
  }): Promise<AdvancedCalculationResult> {
    const { cost, taxRegime, shipping, includeShipping, targetMargin } = params;
    
    // Base cost calculation
    const baseCost = includeShipping ? cost + shipping : cost;
    
    // Tax calculations
  let taxes: AdvancedCalculationResult['breakdown']['taxes'];
    if (taxRegime.simplexPercent > 0) {
      const simplexAmount = baseCost * (taxRegime.simplexPercent / 100);
      taxes = {
        total: simplexAmount,
        details: { simplex: simplexAmount },
        effectiveRate: (simplexAmount / baseCost) * 100,
        simplex: simplexAmount
      };
    } else {
      const pisAmount = baseCost * (taxRegime.pis / 100);
      const cofinsAmount = baseCost * (taxRegime.cofins / 100);
      const irpjAmount = baseCost * (taxRegime.irpj / 100);
      const csllAmount = baseCost * (taxRegime.csll / 100);
      const icmsAmount = baseCost * (taxRegime.icms / 100);
      const issAmount = taxRegime.iss ? baseCost * (taxRegime.iss / 100) : 0;
      
      const total = pisAmount + cofinsAmount + irpjAmount + csllAmount + icmsAmount + issAmount;
      taxes = {
        total,
        details: {
          pis: pisAmount,
          cofins: cofinsAmount,
          irpj: irpjAmount,
          csll: csllAmount,
          icms: icmsAmount,
          iss: issAmount,
        },
        effectiveRate: (total / baseCost) * 100,
        pis: pisAmount,
        cofins: cofinsAmount,
        irpj: irpjAmount,
        csll: csllAmount,
        icms: icmsAmount,
        iss: issAmount
      };
    }
    
    // Fee calculations
  const fees: AdvancedCalculationResult['breakdown']['fees'] = {
      marketplace: baseCost * (params.marketplaceFee / 100),
      payment: baseCost * (params.paymentFee / 100),
      logistics: baseCost * (params.logisticsFee / 100),
      advertising: baseCost * (params.advertisingFee / 100),
      others: baseCost * (params.otherFees / 100)
    };
    
    const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
    
    // Total cost
    const totalCost = baseCost + taxes.total + totalFees;
    
    // Selling price calculation
    const sellingPrice = totalCost * (1 + targetMargin / 100);
    
    // Profit calculations
    const profit = sellingPrice - totalCost;
    const profitPercent = (profit / sellingPrice) * 100;
    const netProfit = profit - taxes.total;
    const roi = (netProfit / cost) * 100;
    
    // Health check
    const isHealthyProfit = profitPercent >= 20;
    
    // Recommendations
    const recommendations: string[] = [];
    if (profitPercent < 10) {
      recommendations.push("Margem muito baixa. Considere aumentar o preço ou reduzir custos.");
    }
    
    // Alerts
    const alerts: { type: 'warning' | 'error' | 'info'; message: string; }[] = [];
    if (profitPercent < 5) {
      alerts.push({ type: 'error', message: 'Margem crítica! Produto pode não ser viável.' });
    }
    
    return {
      sellingPrice,
      profit,
      profitPercent,
      profitMargin: profitPercent,
      isHealthyProfit,
      totalCost,
      totalTaxes: taxes.total,
      totalFees,
      netProfit,
      roi,
      breakdown: {
        cost: baseCost,
        otherCosts: fees.others,
        marketplaceFee: fees.marketplace,
        taxes,
        fees,
        shipping: includeShipping ? shipping : 0,
        margins: {
          gross: profitPercent,
          net: (netProfit / sellingPrice) * 100,
          contribution: ((sellingPrice - cost) / sellingPrice) * 100
        },
        netProfit
      },
      taxRegimeAnalysis: {
        selectedRegime: taxRegime,
        alternativeRegimes: [],
      },
      recommendations,
      alerts
    };
  }
}