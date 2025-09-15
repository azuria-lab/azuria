
import ErrorDisplay from "./ErrorDisplay";
import HistorySection from "./HistorySection";
import { CalculationHistory } from "@/types/simpleCalculator";

interface HistoryDisplayProps {
  isPro: boolean;
  isSupabaseConfigured: boolean;
  history: CalculationHistory[];
  historyLoading: boolean;
  historyError: string | null;
  formatCurrency: (value: number) => string;
}

export default function HistoryDisplay({
  isPro,
  isSupabaseConfigured,
  history,
  historyLoading,
  historyError,
  formatCurrency
}: HistoryDisplayProps) {
  return (
    <div className="max-w-md mx-auto">
      {isPro && !isSupabaseConfigured && (
        <ErrorDisplay message="As credenciais do Supabase não foram configuradas. O histórico está disponível apenas localmente." />
      )}
      
      <HistorySection
        history={history}
        formatCurrency={formatCurrency}
        isPro={isPro}
        loading={historyLoading}
        error={historyError}
      />
    </div>
  );
}
