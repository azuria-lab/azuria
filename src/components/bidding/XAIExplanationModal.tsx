/**
 * @fileoverview XAI Explanation Modal - Explicação de decisões de IA
 * 
 * Mostra explicações detalhadas de como o BDI foi calculado,
 * fatores mais importantes e base legal.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  Scale,
  TrendingUp,
} from 'lucide-react';
import xaiEngine, { type DecisionExplanation } from '@/azuria_ai/engines/xaiEngine';

interface XAIExplanationModalProps {
  readonly bdiFactors: {
    administracaoCentral: number;
    despesasFinanceiras: number;
    lucro: number;
    garantias: number;
    impostos: number;
    risco: number;
  };
  readonly bdiTotal: number;
  readonly trigger?: React.ReactNode;
}

export function XAIExplanationModal({
  bdiFactors,
  bdiTotal,
  trigger,
}: XAIExplanationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<DecisionExplanation | null>(null);

  // Helper functions for nested ternary extraction
  const getOverallComplianceBadgeClass = (legalBasis: DecisionExplanation['legalBasis']) => {
    if (legalBasis.every(item => item.compliance === 'met')) {
      return 'bg-green-100 text-green-800';
    }
    if (legalBasis.some(item => item.compliance === 'not_met')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getOverallComplianceText = (legalBasis: DecisionExplanation['legalBasis']) => {
    if (legalBasis.every(item => item.compliance === 'met')) {
      return (
        <>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Conforme
        </>
      );
    }
    if (legalBasis.some(item => item.compliance === 'not_met')) {
      return 'Não Conforme';
    }
    return 'Parcialmente Conforme';
  };

  const getImpactBadgeClass = (impact: string) => {
    if (impact === 'positive') {
      return 'bg-green-100 text-green-800';
    }
    if (impact === 'neutral') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getComplianceBadgeClass = (compliance: string) => {
    if (compliance === 'met') {
      return 'bg-green-100 text-green-800';
    }
    if (compliance === 'partial') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getComplianceText = (compliance: string) => {
    if (compliance === 'met') {
      return 'Atende';
    }
    if (compliance === 'partial') {
      return 'Parcial';
    }
    return 'Não Atende';
  };

  const loadExplanation = async () => {
    setLoading(true);
    try {
      const result = await xaiEngine.explainBDICalculation(bdiFactors, bdiTotal);
      setExplanation(result);
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Erro ao gerar explicação:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !explanation) {
      loadExplanation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Brain className="h-4 w-4" />
            Explicar BDI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand-600" />
            Explicação do Cálculo de BDI
          </DialogTitle>
          <DialogDescription>
            Entenda como o BDI foi calculado, quais fatores têm mais impacto e
            a base legal para cada componente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          )}

          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Rationale */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Análise Geral</h3>
                    <p className="text-sm leading-relaxed">{explanation.rationale}</p>
                  </div>
                </div>
              </div>

              {/* Overall Compliance - derived from legalBasis */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Conformidade com TCU</span>
                <Badge
                  className={getOverallComplianceBadgeClass(explanation.legalBasis)}
                >
                  {getOverallComplianceText(explanation.legalBasis)}
                </Badge>
              </div>

              <Separator />

              {/* Top Factors */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                  Fatores Mais Importantes
                </h3>

                <div className="space-y-3">
                  {explanation.topFactors.map((factor, index) => (
                    <div key={factor.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{factor.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {(factor.importance * 100).toFixed(1)}% de impacto
                          </span>
                          <Badge
                            variant="secondary"
                            className={getImpactBadgeClass(factor.impact)}
                          >
                            {typeof factor.value === 'number' ? `${factor.value}%` : factor.value}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={factor.importance * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground pl-8">{factor.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Legal Basis */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-brand-600" />
                  Base Legal
                </h3>

                <div className="space-y-2">
                  {explanation.legalBasis.map((law) => (
                    <div
                      key={`${law.source}-${law.requirement}`}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{law.source}</span>
                        <p className="text-xs text-muted-foreground">{law.requirement}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getComplianceBadgeClass(law.compliance)}
                      >
                        {getComplianceText(law.compliance)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives if available */}
              {explanation.alternatives && explanation.alternatives.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-brand-600" />
                      Alternativas Consideradas
                    </h3>

                    <div className="space-y-2">
                      {explanation.alternatives.map((alt) => (
                        <Alert key={alt.label}>
                          <AlertDescription className="text-sm">
                            <strong>{alt.label}:</strong> {alt.reasoning}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Sobre XAI (Explainable AI):</strong> Esta explicação foi gerada
                  automaticamente para promover transparência nas decisões de IA. Todos os
                  cálculos seguem as orientações do TCU e jurisprudência consolidada.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
