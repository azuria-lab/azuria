/**
 * ══════════════════════════════════════════════════════════════════════════════
 * AI INDEX
 * ══════════════════════════════════════════════════════════════════════════════
 */

export {
  GeminiIntegration,
  initGemini,
  isGeminiAvailable,
  analyzeContext,
  classifyIntent,
  generateResponse,
  analyzeCalculation,
  getGeminiStats,
  clearErrors,
  type AnalysisContext,
  type AnalysisResult,
  type IntentClassification,
} from './GeminiIntegration';

// Supabase Adapter (via Edge Function)
export {
  SupabaseGeminiAdapter,
  initSupabaseGemini,
  isSupabaseGeminiAvailable,
  analyzeContext as analyzeContextSupabase,
  classifyIntent as classifyIntentSupabase,
  generateResponse as generateResponseSupabase,
  analyzeCalculation as analyzeCalculationSupabase,
  getSupabaseGeminiStats,
} from './SupabaseGeminiAdapter';


