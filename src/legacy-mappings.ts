// Legacy mappings for backwards compatibility during migration
// TODO: Remove this file after all imports are updated to use domain paths

// Calculator exports
export { formatCurrency } from '@/domains/calculator/utils/formatCurrency';
export { parseInputValue } from '@/domains/calculator/utils/parseInputValue';
export { validateNumericInput } from '@/domains/calculator/utils/validateInput';

export type { CalculationResult, CalculationHistory } from '@/domains/calculator/types/calculator';

export { useCalculatorExport } from '@/domains/calculator/hooks/useCalculatorExport';
export { useSimpleCalculator } from '@/domains/calculator/hooks/legacy/useSimpleCalculator';

// Components - Using SimpleCalculatorModern as the single version
export { default as SimpleCalculator } from '@/domains/calculator/components/SimpleCalculatorModern';
export { default as AdvancedExportOptions } from '@/domains/calculator/components/AdvancedExportOptions';
export { default as AdvancedCalculatorResult } from '@/domains/calculator/components/AdvancedCalculatorResult';
export { default as CompetitorAnalysisDisplay } from '@/domains/calculator/components/CompetitorAnalysisDisplay';