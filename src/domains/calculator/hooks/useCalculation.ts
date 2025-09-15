
import { parseInputValue } from "../utils/parseInputValue";
import { calculateSellingPrice } from "../utils/calculateSellingPrice";
import type { CalculationHistory } from "../types/calculator";

interface UseCalculationProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toast: (opts: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

type VitestAwareImportMeta = ImportMeta & { vitest?: unknown };
const IS_TEST = ('vitest' in (import.meta as VitestAwareImportMeta));
const DELAY_MS = (IS_TEST ? 0 : 400);

export const useCalculation = ({ setIsLoading, toast }: UseCalculationProps) => {
  const calculatePrice = (
    cost: string,
    margin: number,
    tax: string,
    cardFee: string,
    otherCosts: string,
    shipping: string,
    includeShipping: boolean,
    onCalcComplete: (historyItem: CalculationHistory) => void
  ) => {
  setIsLoading(true);

  const run = () => {
      const costValue = parseInputValue(cost);
      if (costValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "O custo do produto deve ser maior que zero.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const calculationResult = calculateSellingPrice({
        cost,
        margin,
        tax,
        cardFee,
        otherCosts,
        shipping,
        includeShipping,
      });

      const newHistoryItem: CalculationHistory = {
        id: Date.now().toString(),
        date: new Date(),
        cost,
        otherCosts,
        shipping,
        margin,
        tax,
        cardFee,
        includeShipping,
        result: calculationResult
      };

      onCalcComplete(newHistoryItem);
      setIsLoading(false);
      
      return calculationResult;
    };

    if (IS_TEST) {
      run();
    } else {
      setTimeout(run, DELAY_MS);
    }
  };

  return { calculatePrice };
};
