import type { CalculationResult } from "../types/calculator";

// Export internal cache accessor for tests (optional)
export const __TEST__persistedCache = {
  clear(set: Set<string>) { set.clear(); }
};

export function computeResultSignature(r: Pick<CalculationResult, 'sellingPrice' | 'profit' | 'isHealthyProfit'>) {
  return JSON.stringify({ sp: r.sellingPrice, p: r.profit, hp: r.isHealthyProfit });
}

export function shouldPersistResult(
  result: CalculationResult,
  lastRef: { current: string | null },
  globalCache: Set<string>
): boolean {
  const signature = computeResultSignature(result);
  if (lastRef.current === signature) { return false; }
  if (globalCache.has(signature)) { return false; }
  lastRef.current = signature;
  globalCache.add(signature);
  return true;
}
